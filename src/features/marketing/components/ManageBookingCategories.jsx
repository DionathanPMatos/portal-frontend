import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import apiClient from '../../../services/api';

const ManageBookingCategories = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState(null);
    const [formData, setFormData] = useState({ nome: '', cor: '#6c757d' });

    const fetchCategorias = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/marketing/reservas/categorias');
            setCategorias(response.data);
        } catch (err) {
            setError('Falha ao carregar as categorias.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    const handleShowModal = (categoria = null) => {
        setEditingCategoria(categoria);
        setFormData(categoria ? { nome: categoria.nome, cor: categoria.cor || '#6c757d' } : { nome: '', cor: '#6c757d' });
        setShowModal(true);
        setError(null);
        setSuccess(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategoria(null);
    };

    const handleSave = async () => {
        try {
            if (editingCategoria) {
                await apiClient.put(`/api/marketing/reservas/categorias/${editingCategoria.id}`, formData);
                setSuccess('Categoria atualizada com sucesso!');
            } else {
                await apiClient.post('/api/marketing/reservas/categorias', formData);
                setSuccess('Categoria criada com sucesso!');
            }
            fetchCategorias();
            handleCloseModal();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Erro ao salvar a categoria.';
            setError(errorMsg);
        }
    };

    const handleInactivate = async (categoriaId) => {
        if (window.confirm('Tem certeza que deseja inativar esta categoria?')) {
            try {
                await apiClient.delete(`/api/marketing/reservas/categorias/${categoriaId}`);
                setSuccess('Categoria inativada com sucesso!');
                fetchCategorias();
            } catch (err) {
                console.error(err);
                setError('Erro ao inativar a categoria.');
            }
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Gerenciar Categorias de Reserva</h5>
                <Button variant="primary" size="sm" onClick={() => handleShowModal()} className="d-flex align-items-center gap-2">
                    <FaPlus /> Nova Categoria
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            <Card className="shadow-sm border-0">
                <Card.Body>
                    {loading ? (
                        <div className="text-center"><Spinner animation="border" /></div>
                    ) : (
                        <Table hover responsive className="align-middle">
                            <thead className="table-light text-muted small text-uppercase">
                                <tr>
                                    <th>Nome da Categoria</th>
                                    <th>Status</th>
                                    <th className="text-end">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorias.map(cat => (
                                    <tr key={cat.id}>
                                        <td className="fw-bold text-dark d-flex align-items-center gap-2">
                                            <div style={{ width: '20px', height: '20px', backgroundColor: cat.cor, borderRadius: '4px', border: '1px solid #ccc' }}></div>
                                            {cat.nome}
                                        </td>
                                        <td>
                                            <Badge bg={cat.ativo ? 'success' : 'secondary'}>
                                                {cat.ativo ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </td>
                                        <td className="text-end">
                                            <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleShowModal(cat)}><FaEdit /></Button>
                                            {cat.ativo && (
                                                <Button variant="light" size="sm" className="text-danger" onClick={() => handleInactivate(cat.id)}><FaTrash /></Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: Visita de Cliente" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cor da Categoria</Form.Label>
                            <Form.Control type="color" value={formData.cor} onChange={e => setFormData({ ...formData, cor: e.target.value })} title="Escolha uma cor para a categoria" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSave}>Salvar</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ManageBookingCategories;