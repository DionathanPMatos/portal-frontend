import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Card, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaTrash, FaReceipt, FaPlaneDeparture } from 'react-icons/fa';
import apiClient from '../../../services/api';

export default function NovaSolicitacaoModal({ show, onHide, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Dados da Solicitação Pai
    const [tipo, setTipo] = useState('Despesa Local'); // Adiantamento, Despesa Local, Despesa Viagem
    const [centroCusto, setCentroCusto] = useState('');
    const [filialCobranca, setFilialCobranca] = useState('');
    const [motivoObs, setMotivoObs] = useState('');
    const [dataIda, setDataIda] = useState('');
    const [dataVolta, setDataVolta] = useState('');

    // Array dinâmico de Itens de Despesa
    const [itens, setItens] = useState([]);

    const handleAddItem = () => {
        setItens([
            ...itens,
            { id: Date.now(), categoria: '', valor: '', data_gasto: '', descricao: '', arquivo: null }
        ]);
    };

    const handleRemoveItem = (idToRemove) => {
        setItens(itens.filter(item => item.id !== idToRemove));
    };

    const handleChangeItem = (id, field, value) => {
        setItens(itens.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleFileChange = (id, file) => {
        setItens(itens.map(item => item.id === id ? { ...item, arquivo: file } : item));
    };

    const resetForm = () => {
        setTipo('Despesa Local'); setCentroCusto(''); setFilialCobranca('');
        setMotivoObs(''); setDataIda(''); setDataVolta(''); setItens([]); setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Cria a Solicitação Principal
            const solicitacaoPayload = {
                tipo,
                centro_custo: centroCusto,
                filial_cobranca: filialCobranca,
                motivo_obs: motivoObs,
                data_ida: dataIda || null,
                data_volta: dataVolta || null
            };

            const { data: resSolicitacao } = await apiClient.post('/api/financeiro/solicitacoes', solicitacaoPayload);
            const solicitacaoId = resSolicitacao.id;

            // 2. Loop para criar cada Item e Anexar a Nota Fiscal (Se houver)
            if (itens.length > 0) {
                for (const item of itens) {
                    if (!item.categoria || !item.valor || !item.data_gasto) continue;

                    // Salva o item da despesa
                    const { data: resItem } = await apiClient.post(`/api/financeiro/solicitacoes/${solicitacaoId}/itens`, {
                        categoria: item.categoria,
                        valor: parseFloat(String(item.valor).replace(',', '.')) || 0,
                        data_gasto: item.data_gasto,
                        descricao: item.descricao || ""
                    });

                    // Se o usuário selecionou uma Nota Fiscal, faz o upload
                    if (item.arquivo) {
                        const formData = new FormData();
                        formData.append('file', item.arquivo);
                        await apiClient.post(`/api/financeiro/itens/${resItem.id}/anexo`, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                    }
                }
            }

            resetForm();
            onSuccess(); // Recarrega a tabela na tela principal
            onHide();
        } catch (err) {
            console.error("Erro ao salvar solicitação:", err);
            const serverError = err.response?.data?.details || err.response?.data?.error;
            setError(serverError ? `Erro do servidor: ${serverError}` : "Ocorreu um erro ao enviar a solicitação.");
        } finally {
            setLoading(false);
        }
    };

    const totalCalculado = itens.reduce((acc, curr) => acc + (parseFloat(String(curr.valor || "0").replace(',', '.')) || 0), 0);

    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold text-dark d-flex align-items-center gap-2">
                        <FaReceipt className="text-primary" /> Nova Solicitação Financeira
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-light">
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3 text-uppercase text-muted">Dados Gerais</h6>
                            <Row className="g-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Tipo de Solicitação</Form.Label>
                                        <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                                            <option value="Despesa Local">Despesa Local (Reembolso)</option>
                                            <option value="Despesa Viagem">Despesa de Viagem (Reembolso)</option>
                                            <option value="Adiantamento">Adiantamento de Viagem</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group><Form.Label>Centro de Custo</Form.Label><Form.Control type="text" placeholder="Ex: Comercial, TI..." value={centroCusto} onChange={(e) => setCentroCusto(e.target.value)} required /></Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group><Form.Label>Filial de Cobrança</Form.Label><Form.Control type="text" placeholder="Ex: Matriz Curitiba" value={filialCobranca} onChange={(e) => setFilialCobranca(e.target.value)} required /></Form.Group>
                                </Col>
                            </Row>

                            {(tipo === 'Despesa Viagem' || tipo === 'Adiantamento') && (
                                <Row className="g-3 mt-1 bg-white p-3 rounded border">
                                    <Col md={12} className="d-flex align-items-center gap-2 text-primary fw-bold mb-2"><FaPlaneDeparture /> Detalhes da Viagem</Col>
                                    <Col md={6}><Form.Group><Form.Label>Data de Ida</Form.Label><Form.Control type="date" value={dataIda} onChange={(e) => setDataIda(e.target.value)} required /></Form.Group></Col>
                                    <Col md={6}><Form.Group><Form.Label>Data de Volta</Form.Label><Form.Control type="date" value={dataVolta} onChange={(e) => setDataVolta(e.target.value)} required /></Form.Group></Col>
                                </Row>
                            )}
                            
                            <Form.Group className="mt-3"><Form.Label>Motivo / Observações Gerais</Form.Label><Form.Control as="textarea" rows={2} value={motivoObs} onChange={(e) => setMotivoObs(e.target.value)} placeholder="Justificativa da solicitação..." required /></Form.Group>
                        </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                        <h6 className="fw-bold mb-0 text-uppercase text-muted">Itens da Despesa / Comprovantes</h6>
                        <Button variant="outline-primary" size="sm" onClick={handleAddItem}><FaPlus /> Adicionar Item</Button>
                    </div>

                    {itens.length === 0 ? (
                        <div className="text-center p-4 border rounded bg-white text-muted">Nenhum item adicionado. Clique em "Adicionar Item" para incluir despesas.</div>
                    ) : (
                        itens.map((item, index) => (
                            <Card key={item.id} className="shadow-sm border-0 mb-3 border-start border-4 border-primary">
                                <Card.Body className="p-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <strong className="text-primary">Item #{index + 1}</strong>
                                        <Button variant="link" className="text-danger p-0" onClick={() => handleRemoveItem(item.id)}><FaTrash /></Button>
                                    </div>
                                    <Row className="g-2">
                                        <Col md={3}>
                                            <Form.Select size="sm" value={item.categoria} onChange={(e) => handleChangeItem(item.id, 'categoria', e.target.value)} required>
                                                <option value="">Categoria...</option>
                                                <option value="Alimentação">Alimentação</option>
                                                <option value="Combustível">Combustível</option>
                                                <option value="Estacionamento/Pedágio">Estacionamento/Pedágio</option>
                                                <option value="Hospedagem">Hospedagem</option>
                                                <option value="Passagem">Passagem Aérea/Terrestre</option>
                                                <option value="Outros">Outros</option>
                                            </Form.Select>
                                        </Col>
                                        <Col md={3}><Form.Control size="sm" type="date" value={item.data_gasto} onChange={(e) => handleChangeItem(item.id, 'data_gasto', e.target.value)} required /></Col>
                                        <Col md={3}>
                                            <InputGroup size="sm"><InputGroup.Text>R$</InputGroup.Text><Form.Control type="number" step="0.01" placeholder="Valor" value={item.valor} onChange={(e) => handleChangeItem(item.id, 'valor', e.target.value)} required /></InputGroup>
                                        </Col>
                                        <Col md={3}><Form.Control size="sm" type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(item.id, e.target.files[0])} /></Col>
                                        <Col md={12}><Form.Control size="sm" type="text" placeholder="Descrição do gasto (Ex: Almoço cliente X)..." value={item.descricao} onChange={(e) => handleChangeItem(item.id, 'descricao', e.target.value)} /></Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between bg-white">
                    <div className="fw-bold text-dark fs-5">Total: R$ {totalCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div>
                        <Button variant="secondary" className="me-2" onClick={onHide}>Cancelar</Button>
                        <Button variant="success" type="submit" disabled={loading}>{loading ? <Spinner size="sm" /> : 'Enviar Solicitação'}</Button>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
