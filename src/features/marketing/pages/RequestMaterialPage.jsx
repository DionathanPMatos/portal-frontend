import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Form, InputGroup, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaHistory } from 'react-icons/fa';
import apiClient from '../../../services/api';

const RequestMaterialPage = () => {
    const [produtos, setProdutos] = useState([]);
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [quantidades, setQuantidades] = useState({});
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

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            await apiClient.post('/api/marketing/solicitacoes', { itens });
            setSuccess('Sua solicitação foi enviada com sucesso!');
            setQuantidades({});
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

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <Container fluid className="px-0">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h2 className="fw-bold mb-1 text-dark">Solicitar Material de Marketing</h2>
                            <p className="text-muted mb-0">Peça aqui seus cartões de visita, brindes e outros materiais.</p>
                        </div>
                    </div>

                    {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                    {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

                    <Card className="shadow-sm border-0 mb-4">
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
                                            </Card.Body>
                                            <Card.Footer className="bg-white border-0 pt-0">
                                                <InputGroup>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Qtd."
                                                        min="0"
                                                        value={quantidades[produto.id] || ''}
                                                        onChange={e => handleQuantityChange(produto.id, e.target.value)}
                                                    />
                                                </InputGroup>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                            <div className="text-center mt-4 pt-3 border-top">
                                <Button variant="success" size="lg" onClick={handleSubmit} disabled={submitting || Object.keys(quantidades).length === 0}>
                                    {submitting ? <Spinner as="span" animation="border" size="sm" /> : 'Finalizar Solicitação'}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0">
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
                                {solicitacoes.map(sol => (
                                    <tr key={sol.id}>
                                        <td>{new Date(sol.data_solicitacao).toLocaleDateString()}</td>
                                        <td>
                                            {sol.itens.map(item => (
                                                <div key={item.produto_id}>{item.quantidade}x {item.produto.nome}</div>
                                            ))}
                                        </td>
                                        <td>{getStatusBadge(sol.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Container>
            </div>
        </div>
    );
};

export default RequestMaterialPage;
