import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Card, ListGroup, Spinner, Alert, Badge, Row, Col, Form, Button, InputGroup, Pagination } from 'react-bootstrap';
import { FaBell, FaBullhorn, FaUserClock, FaCheckCircle, FaTimesCircle, FaCommentDots, FaCalendarCheck, FaQuestionCircle, FaLightbulb, FaCalendarAlt, FaFileInvoiceDollar, FaCheckDouble } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import apiClient from '../../services/api';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import '../../styles/Notifications.css'

const AllNotificationsPage = () => {
    const [notificacoes, setNotificacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('todas'); // 'todas' ou 'pendentes'
    const [filters, setFilters] = useState({ startDate: '', endDate: '', type: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();

    const fetchNotificacoes = useCallback(async () => {
        setLoading(true);
        try {
            const params = { ...filters, page: currentPage, limit: 15 };
            const { data } = await apiClient.get('/api/notificacoes/historico', { params });
            setNotificacoes(data.data);
            setTotalPages(Math.ceil(data.total / data.limit));
        } catch (err) {
            console.error('Erro ao carregar o histórico de notificações:', err);
            setError('Falha ao carregar o histórico de notificações.');
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage]);

    useEffect(() => {
        fetchNotificacoes();
    }, [fetchNotificacoes]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setCurrentPage(1); // Reseta para a primeira página ao mudar o filtro
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleMarkAllAsRead = async () => {
        if (window.confirm('Tem certeza que deseja marcar todas as notificações informativas como lidas? As notificações que exigem ação permanecerão.')) {
            try {
                await apiClient.post('/api/notificacoes/marcar-todas-lidas');
                fetchNotificacoes(); // Re-fetch para atualizar a lista
                window.dispatchEvent(new CustomEvent('notificacoes-atualizadas')); // Para o Header
            } catch (err) {
                console.error('Erro ao marcar todas as notificações como lidas:', err);
                setError('Erro ao marcar notificações como lidas.');
            }
        }
    };

    const handleNotificationClick = async (notificacao) => {
        if (!notificacao.lida) {
            try {
                await apiClient.patch(`/api/notificacoes/${notificacao.id}/lida`, { tipo: notificacao.tipo });
                // Atualiza o estado local para marcar a notificação como lida
                setNotifications(prevNotifications =>
                    prevNotifications.map(n =>
                        (n.id === notificacao.id && n.tipo === notificacao.tipo)
                            ? { ...n, lida: true }
                            : n
                    )
                );
                window.dispatchEvent(new CustomEvent('notificacoes-atualizadas'));
            } catch (err) {
                console.error("Erro ao marcar notificação como lida:", err);
            }
        }

        const routes = {
            'nova_noticia': '/', 'status': '/crm/visitas', 'feedback': '/crm/visitas',
            'retorno': '/crm/visitas', 'aprovacao_gestor': '/crm/visitas', 'nova_pergunta_faq': '/dtc/perguntas',
            'resposta_faq': '/dtc/perguntas', 'reserva_sala_status': '/marketing/reservas',
            'reserva_sala_atribuicao': '/marketing/reservas', 'aprovacao_financeiro': '/financeiro',
            'status_financeiro': '/financeiro',
        };
        navigate(routes[notificacao.tipo] || '/');
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

    const notificationTypes = {
        'status': 'Status de Visita',
        'aprovacao_gestor': 'Aprovação de Visita',
        'nova_noticia': 'Nova Notícia',
        'nova_pergunta_faq': 'Nova Pergunta (FAQ)',
        'resposta_faq': 'Resposta de Pergunta (FAQ)',
        'reserva_sala_status': 'Status de Reserva',
        'aprovacao_financeiro': 'Aprovação Financeira',
        'status_financeiro': 'Status Financeiro',
        'feedback': 'Feedback de Visita',
        'retorno': 'Lembrete de Retorno'
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
        if (activeTab === 'pendentes') {
            return notificacoes.filter(n => !n.lida);
        }
        return notificacoes;
    }, [notificacoes, activeTab]);

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

                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Body>
                            <Row className="g-3 align-items-end">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Data de Início</Form.Label>
                                        <Form.Control type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Data Final</Form.Label>
                                        <Form.Control type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Tipo de Notificação</Form.Label>
                                        <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
                                            <option value="">Todos os tipos</option>
                                            {Object.entries(notificationTypes).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light p-0">
                            <Row className="g-0">
                                <Col>
                                    <Button variant={activeTab === 'todas' ? 'primary' : 'light'} className="w-100 rounded-0 border-0" onClick={() => setActiveTab('todas')}>
                                        Todas ({notificacoes.length})
                                    </Button>
                                </Col>
                                <Col>
                                    <Button variant={activeTab === 'pendentes' ? 'primary' : 'light'} className="w-100 rounded-0 border-0" onClick={() => setActiveTab('pendentes')}>
                                        Pendentes <Badge pill bg="danger">{pendentesCount}</Badge>
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {loading ? (<div className="text-center p-5"><Spinner animation="border" /></div>) : filteredNotifications.length > 0 ? (
                                filteredNotifications.map((n, index) => (
                                    <ListGroup.Item key={`${n.id}-${n.tipo}-${index}`} className={`d-flex align-items-start p-3 ${!n.lida ? 'bg-light-blue' : ''}`}>
                                        <div className="notification-icon me-3 fs-4" onClick={() => handleNotificationClick(n)} style={{ cursor: 'pointer' }}>{getNotificationIcon(n)}</div>
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
                                    {activeTab === 'pendentes' ? 'Nenhuma notificação pendente. Você está em dia!' : 'Nenhuma notificação no seu histórico para os filtros selecionados.'}
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                                               <Card.Footer className="d-flex justify-content-center">
                            {totalPages > 1 && (
                                <Pagination>
                                    <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                                    <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                                    <Pagination.Item active>{`Página ${currentPage} de ${totalPages}`}</Pagination.Item>
                                    <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                                    <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                                </Pagination>
                            )}
                        </Card.Footer>
                    </Card>
                </Container>
            </div>
        </div>
    );
};

export default AllNotificationsPage;
