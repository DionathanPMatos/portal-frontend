import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Row, Col, Card, Badge, Modal, Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaExclamationTriangle, FaInfoCircle, FaExclamationCircle, FaThumbtack, FaRegNewspaper, FaHeart, FaRegHeart, FaComment, FaPaperPlane, FaDownload } from 'react-icons/fa';
import '../styles/News.css'; // Estilos específicos para a página de notícias
import apiClient from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function NewsPage() {
    const { user } = useAuth();
    const [newsList, setNewsList] = useState([]);
    const [selectedNews, setSelectedNews] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const contentRef = useRef(null);

    // State para a galeria de imagens
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxSlides, setLightboxSlides] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

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
        // Busca os comentários ao abrir a notícia
        setLoadingComments(true);
        setSelectedNews({ ...news, comments: [] }); // Abre o modal imediatamente
        try {
            const { data: commentsData } = await apiClient.get(`/api/noticias/${news.id}/comments`);
            setComments(commentsData);
        } catch (err) {
            console.error("Erro ao buscar comentários:", err);
        } finally {
            setLoadingComments(false);
        }
        
        // Só fazemos o POST se a notícia ainda não estiver marcada como lida
        if (news.lida === false || news.lida === 0) {
            try {
                await apiClient.post(`/api/noticias/${news.id}/lida`);
                
                // 🚀 FORÇA A ATUALIZAÇÃO: Em vez de confiar apenas no setNewsList,
                // vamos atualizar o estado de forma imutável e correta.
                setNewsList(prevNews => 
                    prevNews.map(item => 
                        item.id === news.id ? { ...item, lida: true } : item
                    )
                );
                
                // Opcional: Se o seu componente for o "Sino" de notificações,
                // dispare um evento para ele saber que precisa atualizar também
                window.dispatchEvent(new Event('notificacao-atualizada'));
                
            } catch (err) {
                console.error("Erro ao marcar como lida:", err);
            }
        }
    };

    const handleLike = async (e, newsId) => {
        e.stopPropagation(); // Impede que o modal da notícia abra ao clicar no like
        try {
            const { data } = await apiClient.post(`/api/noticias/${newsId}/like`);
            setNewsList(prevList => prevList.map(n => 
                n.id === newsId ? { ...n, likes_count: data.count, user_has_liked: data.liked } : n
            ));
            if (selectedNews && selectedNews.id === newsId) {
                setSelectedNews(prev => ({ ...prev, likes_count: data.count, user_has_liked: data.liked }));
            }
        } catch (err) {
            console.error("Erro ao curtir:", err);
        }
    };

    const handleConfirmRead = async (newsId) => {
        try {
            await apiClient.post(`/api/noticias/${newsId}/confirm`);
            setSelectedNews(prev => ({ ...prev, confirmado: true }));
            setNewsList(prevList => prevList.map(n => n.id === newsId ? { ...n, confirmado: true } : n));
        } catch (err) {
            console.error("Erro ao confirmar leitura:", err);
            alert("Não foi possível confirmar a leitura.");
        }
    };

    // Efeito para configurar a galeria de imagens quando o modal abrir
    useEffect(() => {
        if (selectedNews && contentRef.current) {
            const images = Array.from(contentRef.current.querySelectorAll('img'));
            const slides = images.map(img => ({ src: img.src }));
            setLightboxSlides(slides);
            images.forEach((img, index) => {
                img.style.cursor = 'pointer';
                img.onclick = () => { setLightboxIndex(index); setLightboxOpen(true); };
            });
        }
    }, [selectedNews]);

    const processedContent = useMemo(() => {
        if (!selectedNews?.conteudo) return '<i>Nenhum conteúdo adicional foi cadastrado para esta notícia.</i>';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = selectedNews.conteudo;
        const oembeds = Array.from(tempDiv.querySelectorAll('oembed[url]'));
        oembeds.forEach(oembed => {
            const url = oembed.getAttribute('url');
            const wrapper = document.createElement('div');
            wrapper.className = 'video-responsive-wrapper';
            let iframeSrc = '';
            const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
            if (youtubeMatch) iframeSrc = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
            const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
            if (vimeoMatch) iframeSrc = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
            if (iframeSrc) {
                const iframe = document.createElement('iframe');
                iframe.setAttribute('src', iframeSrc);
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                iframe.setAttribute('allowfullscreen', 'true');
                wrapper.appendChild(iframe);
                oembed.parentNode.replaceChild(wrapper, oembed);
            }
        });
        return tempDiv.innerHTML;
    }, [selectedNews]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const { data: savedComment } = await apiClient.post(`/api/noticias/${selectedNews.id}/comments`, { conteudo: newComment });
            // Adiciona o autor localmente para exibição imediata
            const commentWithAuthor = { ...savedComment, autor_nome: user.nome_completo, autor_avatar: user.userpic_url };
            setComments(prev => [...prev, commentWithAuthor]);
            setNewComment('');
        } catch (err) {
            console.error("Erro ao adicionar comentário:", err);
            alert("Não foi possível adicionar o comentário.");
        }
    };

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <div className="page-header-colored mb-4">
                    <div className="page-header-title-wrapper">
                        <h2 className="page-header-title d-flex align-items-center gap-3">
                            <FaRegNewspaper /> Mural de Notícias
                        </h2>
                        <p className="page-header-subtitle">Fique por dentro das últimas novidades, eventos e comunicados da empresa.</p>
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
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {new Date(news.created_at).toLocaleDateString('pt-BR')} • Por {news.autor || 'Sistema'}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-muted" onClick={(e) => handleLike(e, news.id)}>
                                            {news.user_has_liked ? <FaHeart className="text-danger" /> : <FaRegHeart />}
                                            <span style={{ fontSize: '0.8rem' }}>{news.likes_count}</span>
                                        </div>
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
                        <div ref={contentRef} className="news-content-container" style={{ overflowWrap: 'break-word', color: 'var(--text-primary-color)' }}
                            dangerouslySetInnerHTML={{ __html: processedContent }}
                        />

                        {/* Anexos */}
                        {selectedNews?.attachments && selectedNews.attachments.length > 0 && (
                            <div className="mt-4">
                                <h6 className="fw-bold">Anexos</h6>
                                <ListGroup>
                                    {selectedNews.attachments.map(att => (
                                        <ListGroup.Item key={att.id} action href={att.file_url} target="_blank" className="d-flex align-items-center gap-2">
                                            <FaDownload /> {att.file_name}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                        )}

                        {/* Seção de Confirmação, Curtidas e Comentários */}
                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                            {selectedNews?.requires_confirmation && (
                                <Button variant={selectedNews.confirmado ? "success" : "primary"} disabled={selectedNews.confirmado} onClick={() => handleConfirmRead(selectedNews.id)}>
                                    {selectedNews.confirmado ? "Leitura Confirmada" : "Li e estou ciente"}
                                </Button>
                            )}
                            <div className="d-flex align-items-center gap-2 text-muted ms-auto" style={{ cursor: 'pointer' }} onClick={(e) => handleLike(e, selectedNews.id)}>
                                {selectedNews?.user_has_liked ? <FaHeart size="1.2em" className="text-danger" /> : <FaRegHeart size="1.2em" />}
                                <span>{selectedNews?.likes_count} curtidas</span>
                            </div>
                        </div>

                        {/* Seção de Comentários */}
                        <div className="mt-4">
                            <h5 className="d-flex align-items-center gap-2"><FaComment /> Comentários</h5>
                            {loadingComments ? <Spinner animation="border" size="sm" /> : (
                                <ListGroup variant="flush" className="mt-3">
                                    {comments.map(comment => (
                                        <ListGroup.Item key={comment.id} className="d-flex gap-3 border-0 px-0">
                                            <img src={comment.autor_avatar || `https://ui-avatars.com/api/?name=${comment.autor_nome}&background=random`} alt={comment.autor_nome} className="rounded-circle" style={{ width: '40px', height: '40px' }} />
                                            <div>
                                                <strong className="mb-0">{comment.autor_nome}</strong>
                                                <p className="mb-1">{comment.conteudo}</p>
                                                <small className="text-muted">{comment.created_at}</small>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                    {comments.length === 0 && <p className="text-muted small">Seja o primeiro a comentar!</p>}
                                </ListGroup>
                            )}
                            <Form onSubmit={handleAddComment} className="mt-3 d-flex gap-2">
                                <Form.Control as="textarea" rows={1} placeholder="Adicionar um comentário..." value={newComment} onChange={e => setNewComment(e.target.value)} required />
                                <Button type="submit" variant="primary"><FaPaperPlane /></Button>
                            </Form>
                        </div>

                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="secondary" onClick={() => setSelectedNews(null)}>Fechar</Button>
                    </Modal.Footer>
                </Modal>

                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    slides={lightboxSlides}
                    index={lightboxIndex}
                />
            </div>
        </div>
    );
}