import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, InputGroup, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaShoppingCart } from 'react-icons/fa';
import apiClient from '../../../services/api';

const MarketingMaterialsPage = ({ onNewRequest }) => {
    const [produtos, setProdutos] = useState([]);
    const [quantidades, setQuantidades] = useState({});
    const [justificativa, setJustificativa] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                setLoading(true);
                const produtosRes = await apiClient.get('/api/marketing/produtos');
                setProdutos(produtosRes.data);
            } catch (err) {
                setError('Falha ao carregar produtos. Tente atualizar a página.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProdutos();
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
            if (onNewRequest) onNewRequest(); // Notifica o componente pai para atualizar a lista de solicitações
        } catch (err) {
            setError(err.response?.data?.error || 'Ocorreu um erro ao enviar sua solicitação.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /></div>;
    }

    return (
        <div className="p-3">
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
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
                                            <Form.Control type="number" placeholder="Qtd." min="0" max={produto.estoque || 0} value={quantidades[produto.id] || ''} disabled={!produto.estoque || produto.estoque <= 0} onChange={e => handleQuantityChange(produto.id, e.target.value)} />
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
        </div>
    );
};

export default MarketingMaterialsPage;