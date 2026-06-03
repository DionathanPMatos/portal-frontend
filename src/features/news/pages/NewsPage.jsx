import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Modal, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaExclamationTriangle, FaInfoCircle, FaExclamationCircle, FaThumbtack, FaRegNewspaper } from 'react-icons/fa';
import '../styles/News.css'; // Estilos específicos para a página de notícias
import apiClient from '../../../services/api';

export default function NewsPage() {
    const [newsList, setNewsList] = useState([]);
    const [selectedNews, setSelectedNews] = useState(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const { data } = await apiClient.get('/api/noticias');
            setNewsList(data);
        } catch (error) {
            console.error('Erro ao buscar notícias:', error);
        }
    };

    const getIcon = (tipo) => {
        switch (tipo) {
            case 'Evento': return <FaCalendarAlt className="news-icon text-success" />;
            case 'Aviso': return <FaExclamationTriangle className="news-icon text-warning" />;
            case 'Urgente': return <FaExclamationCircle className="news-icon text-danger" />;
            default: return <FaInfoCircle className="news-icon text-primary" />;
        }
    };

    const handleOpenNews = async (news) => {
        setSelectedNews(news);
        if (!news.lida) {
            try {
                await apiClient.post(`/api/noticias/${news.id}/lida`);
                setNewsList(prev => prev.map(n => n.id === news.id ? { ...n, lida: true } : n));
            } catch (err) {
                console.error("Erro ao marcar como lida:", err);
            }
        }
    };

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <div>
                        <h2 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                            <FaRegNewspaper className="text-primary" /> Mural de Notícias
                        </h2>
                        <p className="text-muted mb-0">Fique por dentro das últimas novidades, eventos e comunicados da empresa.</p>
                    </div>
                </div>

                <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                    {newsList.map(news => (
                        <Col key={news.id}>
                            <Card className={`h-100 news-card shadow-sm border-0 ${news.lida ? 'read' : 'unread'}`} style={{ maxWidth: '100%' }} onClick={() => handleOpenNews(news)}>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            {getIcon(news.tipo)}
                                            <Badge bg={news.tipo === 'Urgente' ? 'danger' : news.tipo === 'Evento' ? 'success' : news.tipo === 'Aviso' ? 'warning' : 'info'} text={news.tipo === 'Aviso' ? 'dark' : 'white'} className="fw-normal">
                                                {news.tipo}
                                            </Badge>
                                        </div>
                                        <div className="text-end">
                                            {news.fixado && <FaThumbtack className="text-primary me-2" title="Fixado" />}
                                            {!news.lida && <Badge bg="primary" pill>Nova</Badge>}
                                        </div>
                                    </div>
                                    <div className="news-title">{news.titulo}</div>
                                    <div className="news-summary">{news.resumo}</div>
                                    <div className="mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
                                        {new Date(news.created_at).toLocaleDateString('pt-BR')} • Por {news.autor || 'Sistema'}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                    {newsList.length === 0 && (
                        <Col xs={12}>
                            <p className="text-muted text-center py-4">Nenhuma notícia encontrada.</p>
                        </Col>
                    )}
                </Row>

                <Modal show={!!selectedNews} onHide={() => setSelectedNews(null)} size="lg" centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold">{selectedNews?.titulo}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pt-2">
                        <div className="text-muted small mb-4 pb-2 border-bottom">
                            Publicado em: {selectedNews && new Date(selectedNews.created_at).toLocaleDateString('pt-BR')} | Tipo: <Badge bg="secondary">{selectedNews?.tipo}</Badge>
                        </div>
                        <div style={{ overflowWrap: 'break-word', color: 'var(--text-primary-color)' }}>
                            <div dangerouslySetInnerHTML={{ __html: selectedNews?.conteudo || '<i>Nenhum conteúdo adicional foi cadastrado para esta notícia.</i>' }} />
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="secondary" onClick={() => setSelectedNews(null)}>Fechar</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}