import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Modal, Spinner, Alert, Image, Row, Col } from 'react-bootstrap';
import apiClient from '../../../services/api';
import { FaPlus, FaTrash, FaEdit, FaImages } from 'react-icons/fa';

function ManageHomePage() {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Modal and form state
    const [showModal, setShowModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/homepage-slides');
            setSlides(response.data);
            setError('');
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError('Endpoint não encontrado. Verifique se a API para os slides foi criada no backend.');
                console.error('Erro 404: A rota /api/homepage-slides não foi encontrada no servidor.');
            } else {
                setError('Erro ao carregar os slides do carrossel.');
                console.error('Erro detalhado ao buscar slides:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleShowCreateModal = () => {
        setEditingSlide(null);
        setTitle('');
        setDescription('');
        setImageFile(null);
        setImagePreview('');
        setShowModal(true);
        setMessage('');
    };

    const handleShowEditModal = (slide) => {
        setEditingSlide(slide);
        setTitle(slide.title);
        setDescription(slide.description);
        setImageFile(null);
        setImagePreview(slide.imageUrl || '');
        setShowModal(true);
        setMessage('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (editingSlide) {
                await apiClient.put(`/api/homepage-slides/${editingSlide.id}`, formData);
                setMessage('Slide atualizado com sucesso!');
            } else {
                await apiClient.post('/api/homepage-slides', formData);
                setMessage('Novo slide adicionado com sucesso!');
            }
            fetchSlides();
            setTimeout(() => {
                setShowModal(false);
            }, 1500);
        } catch (err) {
            // Log detalhado do erro no console do navegador
            console.error('Ocorreu um erro ao salvar o slide:', err);
            if (err.response) {
                // O servidor respondeu com um status fora da faixa 2xx
                console.error('Dados do erro:', err.response.data);
                console.error('Status do erro:', err.response.status);
                setMessage(`Erro do servidor: ${err.response.status} - ${err.response.data.message || 'Verifique o console.'}`);
            } else if (err.request) {
                // A requisição foi feita mas nenhuma resposta foi recebida
                console.error('Requisição enviada, mas sem resposta:', err.request);
                setMessage('Não foi possível conectar ao servidor. Verifique sua rede.');
            } else {
                // Algo aconteceu na configuração da requisição que acionou um erro
                console.error('Erro na configuração da requisição:', err.message);
                setMessage('Erro ao preparar a requisição. Verifique o console.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este slide?')) {
            try {
                await apiClient.delete(`/api/homepage-slides/${id}`);
                fetchSlides();
                alert('Slide excluído com sucesso.');
            } catch (err) {
                console.error('Erro ao excluir slide:', err);
                alert('Erro ao excluir o slide.');
            }
        }
    };

    return (
        <div className="container-main p-4">
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaImages /> Gerenciar Tela Inicial
                    </h2>
                    <p className="page-header-subtitle">Adicione, edite ou remova as imagens do carrossel da página principal.</p>
                </div>
                <div className="page-header-actions-wrapper">
                    <Button variant="primary" onClick={handleShowCreateModal}>
                        <FaPlus className="me-2" /> Adicionar Slide
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Header>
                    <h5 className="mb-0">Slides Atuais</h5>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" /></div>
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                    ) : (
                        <Table responsive hover className="align-middle">
                            <thead className="table-light text-uppercase small text-muted">
                                <tr>
                                    <th style={{ width: '150px' }}>Imagem</th>
                                    <th>Título</th>
                                    <th>Descrição</th>
                                    <th className="text-end">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slides.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-4">Nenhum slide cadastrado.</td></tr>
                                ) : (
                                    slides.map((slide) => (
                                        <tr key={slide.id}>
                                            <td><Image src={slide.imageUrl} thumbnail style={{ width: '120px', height: '60px', objectFit: 'cover' }} /></td>
                                            <td className="fw-bold">{slide.title}</td>
                                            <td>{slide.description}</td>
                                            <td className="text-end">
                                                <Button variant="light" size="sm" className="text-primary shadow-sm me-2" onClick={() => handleShowEditModal(slide)}><FaEdit /></Button>
                                                <Button variant="light" size="sm" className="text-danger shadow-sm" onClick={() => handleDelete(slide.id)}><FaTrash /></Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Modal para Criar/Editar Slide */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editingSlide ? 'Editar Slide' : 'Adicionar Novo Slide'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {message && <Alert variant={message.includes('Erro') ? 'danger' : 'success'}>{message}</Alert>}
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Título</Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ex: Campanha de Fim de Ano"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Descrição (curta)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Ex: Participe da nossa confraternização."
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Imagem do Slide</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <Form.Text>Formato ideal: 800x400 pixels.</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-bold">Pré-visualização</Form.Label>
                                {imagePreview ? (
                                    <Image src={imagePreview} fluid rounded />
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: '200px', borderRadius: '8px' }}>
                                        <span>A pré-visualização aparecerá aqui.</span>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit" disabled={isSaving}>
                            {isSaving ? <><Spinner as="span" animation="border" size="sm" /> Salvando...</> : 'Salvar'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}

export default ManageHomePage;