import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import apiClient from '../../../services/api';

const ManageMarketingLocationsPage = () => {
    const [locais, setLocais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingLocal, setEditingLocal] = useState(null);
    const [formData, setFormData] = useState({ nome: '', descricao: '' });

    const fetchLocais = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/marketing/locais');
            setLocais(response.data);
        } catch (err) {
            setError('Falha ao carregar os locais de reserva.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocais();
    }, []);

    const handleShowModal = (local = null) => {
        setEditingLocal(local);
        setFormData(local ? { nome: local.nome, descricao: local.descricao || '' } : { nome: '', descricao: '' });
        setShowModal(true);
        setError(null);
        setSuccess(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingLocal(null);
    };

    const handleSave = async () => {
        try {
            if (editingLocal) {
                await apiClient.put(`/api/marketing/locais/${editingLocal.id}`, formData);
                setSuccess('Local atualizado com sucesso!');
            } else {
                await apiClient.post('/api/marketing/locais', formData);
                setSuccess('Local criado com sucesso!');
            }
            fetchLocais();
            handleCloseModal();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Erro ao salvar o local.';
            setError(errorMsg);
            console.error(err);
        }
    };

    const handleInactivate = async (localId) => {
        if (window.confirm('Tem certeza que deseja inativar este local? Ele não aparecerá mais para reserva.')) {
            try {
                await apiClient.delete(`/api/marketing/locais/${localId}`);
                setSuccess('Local inativado com sucesso!');
                fetchLocais();
            } catch (err) {
                setError('Erro ao inativar o local.');
                console.error(err);
            }
        }
    };

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <Container fluid className="px-0">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h2 className="fw-bold mb-1 text-dark">Locais de Reserva</h2>
                            <p className="text-muted mb-0">Gerencie os locais disponíveis para reserva (Ex: Showroom, Sala de Reunião).</p>
                        </div>
                        <Button variant="primary" onClick={() => handleShowModal()} className="d-flex align-items-center gap-2">
                            <FaPlus /> Novo Local
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
                                            <th className="py-3 fw-bold border-0">Nome do Local</th>
                                            <th className="py-3 fw-bold border-0">Descrição</th>
                                            <th className="py-3 fw-bold border-0">Status</th>
                                            <th className="text-end py-3 fw-bold border-0">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {locais.map(local => (
                                            <tr key={local.id}>
                                                <td className="fw-bold text-dark"><FaMapMarkerAlt className="me-2 text-muted"/>{local.nome}</td>
                                                <td className="text-muted">{local.descricao || '-'}</td>
                                                <td>
                                                    <Badge bg={local.ativo ? 'success' : 'secondary'}>
                                                        {local.ativo ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </td>
                                                <td className="text-end">
                                                    <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleShowModal(local)}><FaEdit /></Button>
                                                    {local.ativo && (
                                                        <Button variant="light" size="sm" className="text-danger" onClick={() => handleInactivate(local.id)}><FaTrash /></Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            </div>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingLocal ? 'Editar Local' : 'Novo Local de Reserva'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control type="text" placeholder="Ex: Showroom Principal" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Descrição (Opcional)</Form.Label>
                            <Form.Control as="textarea" rows={2} value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSave}>Salvar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManageMarketingLocationsPage;