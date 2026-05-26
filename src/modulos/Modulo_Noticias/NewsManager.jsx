import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Badge, Modal, Alert, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function NewsManager() {
    const [news, setNews] = useState([]);
    const [setores, setSetores] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, titulo: '', resumo: '', conteudo: '', tipo: 'Informativo', fixado: false, setores_alvo: [] });

    useEffect(() => {
        fetchNews();
        fetchSetores();
    }, []);

    const fetchNews = async () => {
        try {
            const { data } = await axios.get('/api/noticias');
            setNews(data);
        } catch (err) { console.error(err); }
    };

    const fetchSetores = async () => {
        try {
            const { data } = await axios.get('/api/setores');
            setSetores(data);
        } catch (err) { console.error(err); }
    };

    const handleShowModal = (n = null) => {
        if (n) setFormData(n);
        else setFormData({ id: null, titulo: '', resumo: '', conteudo: '', tipo: 'Informativo', fixado: false, setores_alvo: [] });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                setores_alvo: formData.setores_alvo.map(Number)
            };
            if (formData.id) await axios.put(`/api/noticias/${formData.id}`, payload);
            else await axios.post('/api/noticias', payload);
            
            setShowModal(false);
            fetchNews();
        } catch (err) {
            alert('Erro ao salvar notícia.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Excluir esta notícia permanentemente?')) {
            try {
                await axios.delete(`/api/noticias/${id}`);
                fetchNews();
            } catch (err) { alert('Erro ao excluir.'); }
        }
    };

    const handleSectorToggle = (setorId) => {
        const sId = Number(setorId);
        setFormData(prev => {
            const current = prev.setores_alvo || [];
            return {
                ...prev,
                setores_alvo: current.includes(sId) ? current.filter(id => id !== sId) : [...current, sId]
            };
        });
    };

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>Gerenciamento de Notícias e Avisos</h3>
                    <Button variant="primary" onClick={() => handleShowModal()}><FaPlus className="me-2"/> Nova Notícia</Button>
                </div>

                <Card className="shadow-sm border-0">
                    <Table responsive hover className="mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Título</th>
                                <th>Tipo</th>
                                <th>Fixado</th>
                                <th>Data Publicação</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {news.map(n => (
                                <tr key={n.id}>
                                    <td className="fw-bold">{n.titulo}</td>
                                    <td><Badge bg={n.tipo === 'Urgente' ? 'danger' : 'info'}>{n.tipo}</Badge></td>
                                    <td>{n.fixado ? 'Sim' : 'Não'}</td>
                                    <td>{new Date(n.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        <Button variant="light" size="sm" className="text-primary me-2" onClick={() => handleShowModal(n)}><FaEdit /></Button>
                                        <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(n.id)}><FaTrash /></Button>
                                    </td>
                                </tr>
                            ))}
                            {news.length === 0 && <tr><td colSpan="5" className="text-center p-4 text-muted">Nenhuma notícia cadastrada.</td></tr>}
                        </tbody>
                    </Table>
                </Card>

                <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" backdrop="static">
                    <Form onSubmit={handleSubmit}>
                        <Modal.Header closeButton><Modal.Title>{formData.id ? 'Editar Notícia' : 'Nova Notícia'}</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <Row className="g-3">
                                <Col md={8}><Form.Group><Form.Label>Título</Form.Label><Form.Control required type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} /></Form.Group></Col>
                                <Col md={4}>
                                    <Form.Group><Form.Label>Tipo</Form.Label>
                                        <Form.Select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                                            <option value="Informativo">Informativo</option><option value="Aviso">Aviso</option>
                                            <option value="Evento">Evento</option><option value="Urgente">Urgente</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={12}><Form.Group><Form.Label>Resumo (Texto do Card)</Form.Label><Form.Control as="textarea" rows={2} required maxLength={200} value={formData.resumo} onChange={e => setFormData({...formData, resumo: e.target.value})} /></Form.Group></Col>
                                <Col md={12}>
                                    <Form.Group><Form.Label>Conteúdo Completo</Form.Label>
                                        <CKEditor editor={ClassicEditor} data={formData.conteudo} onChange={(e, editor) => setFormData({...formData, conteudo: editor.getData()})} />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="d-block mb-2">Visibilidade (Selecione setores. Vazio = Todos)</Form.Label>
                                        <div className="d-flex flex-wrap gap-2 p-3 bg-light rounded border">
                                            {setores.map(s => (
                                                <Form.Check key={s.id} type="checkbox" id={`setor-${s.id}`} label={s.nome_setor} 
                                                    checked={(formData.setores_alvo || []).includes(s.id)}
                                                    onChange={() => handleSectorToggle(s.id)}
                                                />
                                            ))}
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={12}><Form.Check type="switch" label="Fixar no topo do mural?" checked={formData.fixado} onChange={e => setFormData({...formData, fixado: e.target.checked})} /></Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button><Button variant="primary" type="submit">Salvar Publicação</Button></Modal.Footer>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}