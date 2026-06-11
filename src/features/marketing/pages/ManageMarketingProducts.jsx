import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import apiClient from '../../../services/api';

const ManageMarketingProductsPage = () => {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingProduto, setEditingProduto] = useState(null);
    const [formData, setFormData] = useState({ nome: '', descricao: '' });

    const fetchProdutos = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/marketing/produtos');
            setProdutos(response.data);
        } catch (err) {
            setError('Falha ao carregar os produtos de marketing.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProdutos();
    }, []);

    const handleShowModal = (produto = null) => {
        setEditingProduto(produto);
        setFormData(produto ? { nome: produto.nome, descricao: produto.descricao } : { nome: '', descricao: '' });
        setShowModal(true);
        setError(null);
        setSuccess(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduto(null);
    };

    const handleSave = async () => {
        try {
            if (editingProduto) {
                await apiClient.put(`/api/marketing/produtos/${editingProduto.id}`, formData);
                setSuccess('Produto atualizado com sucesso!');
            } else {
                await apiClient.post('/api/marketing/produtos', formData);
                setSuccess('Produto criado com sucesso!');
            }
            fetchProdutos();
            handleCloseModal();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Erro ao salvar o produto. Verifique os dados e tente novamente.';
            setError(errorMsg);
            console.error(err);
            console.error('Detalhes do erro:', err.response?.data || err.message);
        }
    };

    const handleInactivate = async (produtoId) => {
        if (window.confirm('Tem certeza que deseja inativar este produto? Ele não aparecerá mais para solicitação.')) {
            try {
                await apiClient.delete(`/api/marketing/produtos/${produtoId}`);
                setSuccess('Produto inativado com sucesso!');
                fetchProdutos();
            } catch (err) {
                setError('Erro ao inativar o produto.');
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
                            <h2 className="fw-bold mb-1 text-dark">Produtos de Marketing</h2>
                            <p className="text-muted mb-0">Gerencie os itens disponíveis para solicitação (brindes, cartões, etc.).</p>
                        </div>
                        <Button variant="primary" onClick={() => handleShowModal()} className="d-flex align-items-center gap-2">
                            <FaPlus /> Novo Produto
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
                                            <th className="py-3 fw-bold border-0">Nome do Produto</th>
                                            <th className="py-3 fw-bold border-0">Descrição</th>
                                            <th className="py-3 fw-bold border-0">Status</th>
                                            <th className="text-end py-3 fw-bold border-0">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {produtos.map(produto => (
                                            <tr key={produto.id}>
                                                <td className="fw-bold text-dark">{produto.nome}</td>
                                                <td className="text-muted">{produto.descricao || '-'}</td>
                                                <td>
                                                    <Badge bg={produto.ativo ? 'success' : 'secondary'}>
                                                        {produto.ativo ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </td>
                                                <td className="text-end">
                                                    <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleShowModal(produto)}><FaEdit /></Button>
                                                    {produto.ativo && (
                                                        <Button variant="light" size="sm" className="text-danger" onClick={() => handleInactivate(produto.id)}><FaTrash /></Button>
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
                    <Modal.Title>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nome do Produto</Form.Label>
                            <Form.Control type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Descrição</Form.Label>
                            <Form.Control as="textarea" rows={3} value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} />
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

export default ManageMarketingProductsPage;
