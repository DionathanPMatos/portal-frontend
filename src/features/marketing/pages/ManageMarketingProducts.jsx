import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Alert, Spinner, Badge, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash, FaBoxOpen, FaExchangeAlt, FaChartPie } from 'react-icons/fa';
import apiClient from '../../../services/api';

const ManageMarketingProductsPage = () => {
    const [produtos, setProdutos] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [filiais, setFiliais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingProduto, setEditingProduto] = useState(null);
    const [formData, setFormData] = useState({ nome: '', descricao: '', estoque: 0, fornecedor: '', valor: '', filial_id: '' });
    
    // Transfer Modal State
    const [showTransfer, setShowTransfer] = useState(false);
    const [transferData, setTransferData] = useState({ filial_id: '', quantidade: 0 });

    const fetchProdutos = async () => {
        try {
            setLoading(true);
            const [produtosRes, dashRes, filiaisRes] = await Promise.all([
                apiClient.get('/api/marketing/produtos'),
                apiClient.get('/api/marketing/produtos-dashboard'),
                apiClient.get('/api/marketing/unidades')
            ]);
            setProdutos(Array.isArray(produtosRes.data) ? produtosRes.data : []);
            setDashboard(dashRes.data);
            setFiliais(filiaisRes.data);
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
        setFormData(produto ? { 
            nome: produto.nome, 
            descricao: produto.descricao || '',
            estoque: produto.estoque || 0,
            fornecedor: produto.fornecedor || '',
            valor: produto.valor || '',
            filial_id: '' // Na edição não movemos o estoque inicial, usa-se a transferência
        } : { nome: '', descricao: '', estoque: 0, fornecedor: '', valor: '', filial_id: '' });
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

    const handleTransferSubmit = async () => {
        try {
            if (!transferData.filial_id || transferData.quantidade <= 0) return alert("Preencha corretamente a filial e quantidade.");
            if (transferData.quantidade > editingProduto.estoque) return alert("Quantidade maior que o estoque principal disponível!");

            await apiClient.post(`/api/marketing/produtos/${editingProduto.id}/transferir`, transferData);
            setSuccess('Estoque transferido para filial com sucesso!');
            fetchProdutos();
            setShowTransfer(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao transferir estoque.');
            console.error(err);
        }
    };

    return (
        <div className='container-main p-4'>
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaBoxOpen /> Produtos de Marketing
                    </h2>
                    <p className="page-header-subtitle">Gerencie os itens disponíveis para solicitação (brindes, cartões, etc.).</p>
                </div>
                <div className="page-header-actions-wrapper">
                    <Button variant="primary" className="btn-header-action" onClick={() => handleShowModal()}>
                        <FaPlus className="me-2" /> Novo Produto
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            <Tabs defaultActiveKey="catalogo" className="mb-4 custom-tabs bg-white p-3 rounded shadow-sm">
                <Tab eventKey="catalogo" title={<><FaBoxOpen className="me-2" />Catálogo e Estoque</>}>
                    <Card className="shadow-sm border-0 mt-3">
                        <Card.Body>
                            {loading ? (
                                <div className="text-center"><Spinner animation="border" /></div>
                            ) : (
                                <Table hover responsive className="align-middle">
                                    <thead className="table-light text-muted small text-uppercase">
                                        <tr>
                                            <th className="py-3 fw-bold border-0">Nome do Produto</th>
                                            <th className="py-3 fw-bold border-0">Estoque</th>
                                            <th className="py-3 fw-bold border-0">Fornecedor</th>
                                            <th className="py-3 fw-bold border-0">Valor (R$)</th>
                                            <th className="py-3 fw-bold border-0">Status</th>
                                            <th className="text-end py-3 fw-bold border-0">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {produtos.length > 0 ? (
                                            produtos.map(produto => (
                                            <tr key={produto.id}>
                                                <td className="fw-bold text-dark">{produto.nome}</td>
                                                <td>
                                                    <Badge bg={produto.estoque > 0 ? "primary" : "danger"}>Sede: {produto.estoque} un.</Badge>
                                                    {produto.estoques_filiais?.length > 0 && (
                                                        <div className="mt-1 d-flex flex-column gap-1">
                                                            {produto.estoques_filiais.map(ef => (
                                                                <Badge key={ef.id} bg="secondary">{ef.filial.nome_unidade}: {ef.quantidade} un.</Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-muted">{produto.fornecedor || '-'}</td>
                                                <td className="text-muted">{produto.valor ? `R$ ${parseFloat(produto.valor).toLocaleString('pt-BR', {minimumFractionDigits:2})}` : '-'}</td>
                                                <td>
                                                    <Badge bg={produto.ativo ? 'success' : 'secondary'}>
                                                        {produto.ativo ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </td>
                                                <td className="text-end">
                                                    <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleShowModal(produto)}><FaEdit /></Button>
                                                    <Button variant="light" size="sm" className="me-2 text-info" title="Transferir para Filial" onClick={() => { setEditingProduto(produto); setTransferData({ filial_id: '', quantidade: 0 }); setShowTransfer(true); }}>
                                                        <FaExchangeAlt />
                                                    </Button>
                                                    {produto.ativo && (
                                                        <Button variant="light" size="sm" className="text-danger" onClick={() => handleInactivate(produto.id)}><FaTrash /></Button>
                                                    )}
                                                </td>
                                            </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="6" className="text-center py-4 text-muted">Nenhum produto cadastrado no momento.</td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="dashboard" title={<><FaChartPie className="me-2" />Dashboard Financeiro</>}>
                    {dashboard && (
                        <div className="mt-3">
                            <Row className="mb-4 g-3">
                                <Col md={6}>
                                    <Card className="bg-primary text-white text-center shadow-sm h-100 p-4 border-0">
                                        <h5 className="mb-2">Total de Itens (Global)</h5>
                                        <h2 className="fw-bold mb-0">{dashboard.quantidadeTotal} un.</h2>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="bg-success text-white text-center shadow-sm h-100 p-4 border-0">
                                        <h5 className="mb-2">Custo Total de Materiais</h5>
                                        <h2 className="fw-bold mb-0">R$ {dashboard.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
                                    </Card>
                                </Col>
                            </Row>
                            <Row className="g-4">
                                <Col lg={6}>
                                    <Card className="shadow-sm border-0 h-100">
                                        <Card.Header className="bg-light fw-bold">Custo de Materiais por Filial</Card.Header>
                                        <Table responsive hover size="sm" className="mb-0">
                                            <thead><tr><th>Local/Filial</th><th className="text-end">Custo Retido</th></tr></thead>
                                            <tbody>
                                                {dashboard.custoPorFilial.map((c, i) => (
                                                    <tr key={i}>
                                                        <td>{c.filial}</td>
                                                        <td className="text-end fw-bold text-danger">R$ {c.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Card>
                                </Col>
                                <Col lg={6}>
                                    <Card className="shadow-sm border-0 h-100">
                                        <Card.Header className="bg-light fw-bold">Valor Unitário por Item</Card.Header>
                                        <Table responsive hover size="sm" className="mb-0">
                                            <thead><tr><th>Item</th><th className="text-end">Valor (Un)</th></tr></thead>
                                            <tbody>
                                                {dashboard.produtos.map((p, i) => (
                                                    <tr key={i}>
                                                        <td>{p.nome}</td>
                                                        <td className="text-end text-muted">R$ {p.valorUnitario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Tab>
            </Tabs>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nome do Produto/Brinde</Form.Label>
                            <Form.Control type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                        </Form.Group>
                        <Row className="mb-3">
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Estoque Inicial</Form.Label>
                                    <Form.Control type="number" min="0" value={formData.estoque} onChange={e => setFormData({ ...formData, estoque: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Armazenar em</Form.Label>
                                    <Form.Select value={formData.filial_id} onChange={e => setFormData({ ...formData, filial_id: e.target.value })} disabled={!!editingProduto}>
                                        <option value="">Sede Principal</option>
                                        {filiais.map(f => <option key={f.id} value={f.id}>{f.nome_unidade}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Fornecedor</Form.Label>
                                    <Form.Control type="text" value={formData.fornecedor} onChange={e => setFormData({ ...formData, fornecedor: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Valor Unitário</Form.Label>
                                    <Form.Control type="number" step="0.01" min="0" value={formData.valor} onChange={e => setFormData({ ...formData, valor: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group>
                            <Form.Label>Descrição Adicional</Form.Label>
                            <Form.Control as="textarea" rows={3} value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSave}>Salvar</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Transferência para Filial */}
            <Modal show={showTransfer} onHide={() => setShowTransfer(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Transferir: {editingProduto?.nome}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted">Mova itens do estoque matriz ({editingProduto?.estoque} disponíveis) para uma filial.</p>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Filial de Destino</Form.Label>
                            <Form.Select value={transferData.filial_id} onChange={(e) => setTransferData({...transferData, filial_id: e.target.value})} required>
                                <option value="">Selecione...</option>
                                {filiais.map(f => <option key={f.id} value={f.id}>{f.nome_unidade}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Quantidade</Form.Label>
                            <Form.Control type="number" min="1" max={editingProduto?.estoque || 0} value={transferData.quantidade} onChange={(e) => setTransferData({...transferData, quantidade: parseInt(e.target.value) || 0})} required />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTransfer(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleTransferSubmit}>Transferir</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManageMarketingProductsPage;
