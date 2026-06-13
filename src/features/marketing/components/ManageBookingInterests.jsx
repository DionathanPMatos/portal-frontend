import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import apiClient from '../../../services/api';

const ManageBookingInterests = () => {
    const [interesses, setInteresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingInteresse, setEditingInteresse] = useState(null);
    const [formData, setFormData] = useState({ nome: '' });

    const fetchInteresses = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/marketing/interesses');
            setInteresses(response.data);
        } catch (err) {
            setError('Falha ao carregar as áreas de interesse.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInteresses();
    }, []);

    const handleShowModal = (interesse = null) => {
        setEditingInteresse(interesse);
        setFormData(interesse ? { nome: interesse.nome } : { nome: '' });
        setShowModal(true);
        setError(null);
        setSuccess(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingInteresse(null);
    };

    const handleSave = async () => {
        try {
            if (editingInteresse) {
                await apiClient.put(`/api/marketing/interesses/${editingInteresse.id}`, formData);
                setSuccess('Área de interesse atualizada com sucesso!');
            } else {
                await apiClient.post('/api/marketing/interesses', formData);
                setSuccess('Área de interesse criada com sucesso!');
            }
            fetchInteresses();
            handleCloseModal();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Erro ao salvar a área de interesse.';
            setError(errorMsg);
        }
    };

    const handleInactivate = async (interesseId) => {
        if (window.confirm('Tem certeza que deseja inativar esta área de interesse?')) {
            try {
                await apiClient.delete(`/api/marketing/interesses/${interesseId}`);
                setSuccess('Área de interesse inativada com sucesso!');
                fetchInteresses();
            } catch (err) {
                console.error(err);
                setError('Erro ao inativar a área de interesse.');
            }
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Gerenciar Áreas de Interesse</h5>
                <Button variant="primary" size="sm" onClick={() => handleShowModal()} className="d-flex align-items-center gap-2">
                    <FaPlus /> Nova Área
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
                                    <th>Nome da Área de Interesse</th>
                                    <th>Status</th>
                                    <th className="text-end">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {interesses.map(interesse => (
                                    <tr key={interesse.id}>
                                        <td className="fw-bold text-dark">{interesse.nome}</td>
                                        <td>
                                            <Badge bg={interesse.ativo ? 'success' : 'secondary'}>
                                                {interesse.ativo ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </td>
                                        <td className="text-end">
                                            <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleShowModal(interesse)}><FaEdit /></Button>
                                            {interesse.ativo && (
                                                <Button variant="light" size="sm" className="text-danger" onClick={() => handleInactivate(interesse.id)}><FaTrash /></Button>
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
                    <Modal.Title>{editingInteresse ? 'Editar Área de Interesse' : 'Nova Área de Interesse'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
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

export default ManageBookingInterests;