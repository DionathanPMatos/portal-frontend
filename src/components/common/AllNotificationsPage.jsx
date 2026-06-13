import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Button, Alert, Spinner, Badge, ListGroup, Row, Col, Form } from 'react-bootstrap';
import { FaBell, FaBullhorn, FaUserClock, FaCheckCircle, FaTimesCircle, FaCommentDots, FaCalendarCheck, FaQuestionCircle, FaLightbulb, FaCalendarAlt, FaFileInvoiceDollar, FaCheckDouble } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import apiClient from '../../services/api';

const AllNotificationsPage = () => {
    const [notificacoes, setNotificacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState('todas'); // 'todas' ou 'pendentes'

    const fetchNotificacoes = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/api/notificacoes/historico');
            setNotificacoes(data);
        } catch (err) {
            setError('Falha ao carregar o histórico de notificações.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotificacoes();
    }, []);

    const handleMarkAllAsRead = async () => {
        if (window.confirm('Tem certeza que deseja marcar todas as notificações como lidas?')) {
            try {
                await apiClient.post('/api/notificacoes/marcar-todas-lidas');
                // Atualiza a UI para refletir que todas foram lidas
                setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })));
                // Dispara um evento para o Header atualizar o contador do sino
                window.dispatchEvent(new Event('notificacoes-atualizadas'));
            } catch (err) { 
                console.error(err);
                setError('Erro ao marcar notificações como lidas.');
            }
        }
    };

    const getNotificationIcon = (notificacao) => {
        const iconMap = {
            'nova_noticia': <FaBullhorn className="text-info" />,
            'status': notificacao.status_autorizacao === 'Recusada' ? <FaTimesCircle className="text-danger" /> : <FaCheckCircle className="text-success" />,
            'feedback': <FaCommentDots className="text-primary" />,
            'retorno': <FaCalendarCheck className="text-warning" />,
            'aprovacao_gestor': <FaUserClock className="text-warning" />,
            'nova_pergunta_faq': <FaQuestionCircle className="text-primary" />,
            'resposta_faq': <FaLightbulb className="text-success" />,
            'reserva_sala_status': <FaCalendarAlt className="text-info" />,
            'reserva_sala_atribuicao': <FaCalendarAlt className="text-primary" />,
            'aprovacao_financeiro': <FaFileInvoiceDollar className="text-warning" />,
            'status_financeiro': <FaFileInvoiceDollar className="text-info" />,
        };
        return iconMap[notificacao.tipo] || <FaBell />;
    };

    const getNotificationText = (n) => {
        switch (n.tipo) {
            case 'status': return <>Sua solicitação de visita em <strong>{n.nome_cliente}</strong> foi <Badge bg={n.status_autorizacao === 'Autorizada' ? 'success' : 'danger'}>{n.status_autorizacao}</Badge>.</>;
            case 'feedback': return <>Ação necessária: Registre o feedback da visita em <strong>{n.nome_cliente}</strong>.</>;
            case 'retorno': return <>Lembrete de retorno para <strong>{n.nome_cliente}</strong> agendado.</>;
            case 'aprovacao_gestor': return <>Aprovação de visita pendente para <strong>{n.vendedor_nome}</strong> no cliente <strong>{n.nome_cliente}</strong>.</>;
            case 'nova_noticia': return <>Nova Publicação: <strong>{n.titulo}</strong>.</>;
            case 'nova_pergunta_faq': return <>Nova dúvida técnica: <strong>"{n.titulo}"</strong> foi atribuída a você.</>;
            case 'resposta_faq': return <>Sua pergunta <strong>"{n.titulo}"</strong> foi respondida.</>;
            case 'reserva_sala_status': return <>Sua reserva <strong>"{n.titulo}"</strong> foi <Badge bg={n.status === 'Aprovado' ? 'success' : (n.status === 'Recusado' ? 'danger' : 'warning')}>{n.status}</Badge>.</>;
            case 'reserva_sala_atribuicao': return <>Você foi definido como apresentador para a reserva <strong>"{n.titulo}"</strong>.</>;
            case 'aprovacao_financeiro': return <>Aprovação financeira pendente para <strong>{n.nome_cliente}</strong>.</>;
            case 'status_financeiro': return <>Sua solicitação de <strong>{n.nome_cliente}</strong> foi atualizada.</>;
            default: return <span>Notificação desconhecida.</span>;
        }
    };

    const filteredNotifications = useMemo(() => {
        if (filtro === 'pendentes') {
            return notificacoes.filter(n => !n.lida);
        }
        return notificacoes;
    }, [notificacoes, filtro]);

    const pendentesCount = useMemo(() => notificacoes.filter(n => !n.lida).length, [notificacoes]);

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <Container fluid className="px-0">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h2 className="fw-bold mb-1 text-dark">Central de Notificações</h2>
                            <p className="text-muted mb-0">Veja aqui todo o seu histórico de atividades e pendências.</p>
                        </div>
                        <Button variant="outline-primary" onClick={handleMarkAllAsRead} disabled={pendentesCount === 0}>
                            <FaCheckDouble className="me-2" /> Marcar todas como lidas
                        </Button>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light p-0">
                            <Row className="g-0">
                                <Col>
                                    <Button variant={filtro === 'todas' ? 'primary' : 'light'} className="w-100 rounded-0 border-0" onClick={() => setFiltro('todas')}>
                                        Todas ({notificacoes.length})
                                    </Button>
                                </Col>
                                <Col>
                                    <Button variant={filtro === 'pendentes' ? 'primary' : 'light'} className="w-100 rounded-0 border-0" onClick={() => setFiltro('pendentes')}>
                                        Pendentes <Badge pill bg="danger">{pendentesCount}</Badge>
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {loading ? (
                                <div className="text-center p-5"><Spinner animation="border" /></div>
                            ) : filteredNotifications.length > 0 ? (
                                filteredNotifications.map((n, index) => (
                                    <ListGroup.Item key={`${n.id}-${n.tipo}-${index}`} className={`d-flex align-items-start p-3 ${!n.lida ? 'bg-light-blue' : ''}`}>
                                        <div className="notification-icon me-3 fs-4">{getNotificationIcon(n)}</div>
                                        <div className="flex-grow-1">
                                            <p className="mb-1">{getNotificationText(n)}</p>
                                            <small className="text-muted">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                                            </small>
                                        </div>
                                        {!n.lida && <Badge pill bg="primary" className="align-self-center">Nova</Badge>}
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item className="text-center text-muted p-5">
                                    {filtro === 'pendentes' ? 'Nenhuma notificação pendente. Você está em dia!' : 'Nenhuma notificação no seu histórico.'}
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Container>
            </div>
            <style jsx>{`
                .bg-light-blue {
                    background-color: #f0f8ff !important;
                }
                .notification-icon {
                    width: 30px;
                    text-align: center;
                }
            `}</style>
        </div>
    );
};

export default AllNotificationsPage;
