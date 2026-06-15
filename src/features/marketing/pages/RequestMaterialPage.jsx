import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, InputGroup, Alert, Spinner, Table, Badge, Tabs, Tab } from 'react-bootstrap';
import { FaShoppingCart, FaHistory, FaBoxOpen, FaTasks } from 'react-icons/fa';
import apiClient from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const RequestMaterialPage = () => {
    const { user } = useAuth();
    const canManage = user && (user.privilegios?.includes('admin') || user.privilegios?.includes('gestor') || user.privilegios?.includes('marketing'));
    const [produtos, setProdutos] = useState([]);
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [quantidades, setQuantidades] = useState({});
    const [justificativa, setJustificativa] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [produtosRes, solicitacoesRes] = await Promise.all([
                apiClient.get('/api/marketing/produtos'),
                apiClient.get('/api/marketing/solicitacoes')
            ]);
            setProdutos(produtosRes.data);
            setSolicitacoes(solicitacoesRes.data);
        } catch (err) {
            setError('Falha ao carregar dados. Tente atualizar a página.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleQuantityChange = (produtoId, value) => {
        const newQuantidades = { ...quantidades };
        const numValue = parseInt(value, 10);
        if (numValue > 0) {
            newQuantidades[produtoId] = numValue;
        } else {
            delete newQuantidades[produtoId];
        }
        setQuantidades(newQuantidades);
    };

    const handleSubmit = async () => {
        const itens = Object.entries(quantidades).map(([produto_id, quantidade]) => ({
            produto_id: parseInt(produto_id),
            quantidade
        }));

        if (itens.length === 0) {
            setError('Adicione a quantidade de pelo menos um item para solicitar.');
            return;
        }

        if (!justificativa.trim()) {
            setError('A justificativa é obrigatória para realizar a solicitação.');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            await apiClient.post('/api/marketing/solicitacoes', { itens, justificativa });
            setSuccess('Sua solicitação foi enviada com sucesso!');
            setQuantidades({});
            setJustificativa('');
            // Refetch solicitations
            const solicitacoesRes = await apiClient.get('/api/marketing/solicitacoes');
            setSolicitacoes(solicitacoesRes.data);
        } catch (err) {
            setError('Ocorreu um erro ao enviar sua solicitação.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleMaterialStatusChange = async (solicitacaoId, newStatus) => {
        try {
            await apiClient.put(`/api/marketing/solicitacoes/${solicitacaoId}/status`, { status: newStatus });
            setSuccess(`Status da solicitação #${solicitacaoId} atualizado para ${newStatus}.`);
            fetchData();
            window.dispatchEvent(new Event('notificacao-atualizada'));
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Falha ao atualizar status.');
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'Pendente': 'warning',
            'Aprovado': 'primary',
            'Entregue': 'success',
            'Recusado': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /></div>;
    }

    const minhasSolicitacoes = user ? solicitacoes.filter(s => s.solicitante_id === user.id) : [];
    const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'Pendente');

    return (
        <div className='container-main p-4'>
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaBoxOpen /> Solicitar Material de Marketing
                    </h2>
                    <p className="page-header-subtitle">Peça aqui seus cartões de visita, brindes e outros materiais.</p>
                </div>
            </div>

            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            <Tabs defaultActiveKey="catalogo" className="mb-4 custom-tabs bg-white p-3 rounded shadow-sm">
                <Tab eventKey="catalogo" title={<><FaShoppingCart className="me-2" />Catálogo de Produtos</>}>
                    <Card className="shadow-sm border-0 mt-3">
                        <Card.Header className="bg-light fw-bold text-dark d-flex align-items-center gap-2">
                            <FaShoppingCart /> Catálogo de Produtos
                        </Card.Header>
                        <Card.Body>
                            <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                                {produtos.map(produto => (
                                    <Col key={produto.id}>
                                        <Card className="h-100">
                                            <Card.Body>
                                                <Card.Title className="fw-bold">{produto.nome}</Card.Title>
                                                <Card.Text className="text-muted small">{produto.descricao}</Card.Text>
                                                <div className="mt-2">
                                                    <Badge bg={produto.estoque > 0 ? "success" : "danger"}>
                                                        {produto.estoque > 0 ? `${produto.estoque} em estoque` : 'Esgotado'}
                                                    </Badge>
                                                </div>
                                            </Card.Body>
                                            <Card.Footer className="bg-white border-0 pt-0">
                                                <InputGroup>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Qtd."
                                                        min="0"
                                                        max={produto.estoque || 0}
                                                        value={quantidades[produto.id] || ''}
                                                        disabled={!produto.estoque || produto.estoque <= 0}
                                                        onChange={e => handleQuantityChange(produto.id, e.target.value)}
                                                    />
                                                </InputGroup>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                            <Form.Group className="mt-4">
                                <Form.Label className="fw-bold">Justificativa para a Solicitação <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={3} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} placeholder="Explique qual a finalidade ou evento que utilizará estes materiais..." required />
                            </Form.Group>
                            <div className="text-center mt-4 pt-3 border-top">
                                <Button variant="success" size="lg" onClick={handleSubmit} disabled={submitting || Object.keys(quantidades).length === 0 || !justificativa.trim()}>
                                    {submitting ? <Spinner as="span" animation="border" size="sm" /> : 'Finalizar Solicitação'}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="minhas" title={<><FaHistory className="me-2" />Minhas Solicitações</>}>
                    <Card className="shadow-sm border-0 mt-3">
                        <Card.Header className="bg-light fw-bold text-dark d-flex align-items-center gap-2">
                            <FaHistory /> Minhas Solicitações
                        </Card.Header>
                        <Table responsive hover className="align-middle mb-0">
                            <thead className="text-muted small text-uppercase">
                                <tr>
                                    <th>Data</th>
                                    <th>Itens</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {minhasSolicitacoes.length > 0 ? minhasSolicitacoes.map(sol => (
                                    <tr key={sol.id}>
                                        <td>{new Date(sol.data_solicitacao).toLocaleDateString()}</td>
                                        <td>
                                            {sol.itens.map(item => (
                                                <div key={item.produto_id}>{item.quantidade}x {item.produto.nome}</div>
                                            ))}
                                        </td>
                                        <td>{getStatusBadge(sol.status)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="text-center py-4 text-muted">Nenhuma solicitação encontrada.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Tab>

                {canManage && (
                    <Tab eventKey="gerenciar" title={<><FaTasks className="me-2" />Gerenciar Solicitações <Badge bg="danger" pill>{solicitacoesPendentes.length}</Badge></>}>
                        <Card className="shadow-sm border-0 mt-3">
                            <Card.Header className="fw-bold d-flex align-items-center gap-2 bg-light">
                                <FaTasks /> Todas as Solicitações
                            </Card.Header>
                            <Table responsive hover className="align-middle mb-0">
                                <thead><tr><th>ID</th><th>Solicitante</th><th>Data</th><th>Itens</th><th>Status</th></tr></thead>
                                <tbody>
                                    {solicitacoes.length > 0 ? solicitacoes.map(sol => (
                                        <tr key={sol.id}>
                                            <td>#{sol.id}</td>
                                            <td>{sol.solicitante?.nome_completo}</td>
                                            <td>{new Date(sol.data_solicitacao).toLocaleDateString()}</td>
                                            <td>
                                                {sol.itens.map(item => <div key={item.produto_id}>{item.quantidade}x {item.produto?.nome}</div>)}
                                            </td>
                                            <td>
                                                <Form.Select size="sm" value={sol.status} onChange={(e) => handleMaterialStatusChange(sol.id, e.target.value)} style={{minWidth: '120px'}}>
                                                    <option>Pendente</option>
                                                    <option>Aprovado</option>
                                                    <option>Enviado</option>
                                                    <option>Entregue</option>
                                                    <option>Recusado</option>
                                                </Form.Select>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="text-center py-4 text-muted">Nenhuma solicitação encontrada.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card>
                    </Tab>
                )}
            </Tabs>
        </div>
    );
    };
    export default RequestMaterialPage;
