import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Alert, Spinner, Table, Badge, Tabs, Tab, Modal, Form, Row, Col, ListGroup } from 'react-bootstrap';
import { FaBoxOpen, FaCalendarCheck, FaCheck, FaTimes, FaUserTie } from 'react-icons/fa';
import apiClient from '../../../services/api';

const ManageMarketingRequestsPage = () => {
    const [activeTab, setActiveTab] = useState('reservas');
    const [solicitacoesMateriais, setSolicitacoesMateriais] = useState([]);
    const [solicitacoesReservas, setSolicitacoesReservas] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [apresentadorId, setApresentadorId] = useState('');
    const [showPresenterSelect, setShowPresenterSelect] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [materiaisRes, reservasRes, funcRes] = await Promise.all([
                apiClient.get('/api/marketing/solicitacoes'),
                apiClient.get('/api/marketing/reservas'),
                apiClient.get('/api/funcionarios')
            ]);
            setSolicitacoesMateriais(materiaisRes.data);
            setSolicitacoesReservas(reservasRes.data);
            setFuncionarios(funcRes.data);
        } catch (err) {
            setError('Falha ao carregar solicitações.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMaterialStatusChange = async (solicitacaoId, newStatus) => {
        try {
            await apiClient.put(`/api/marketing/solicitacoes/${solicitacaoId}/status`, { status: newStatus });
            setSuccess(`Status da solicitação #${solicitacaoId} atualizado para ${newStatus}.`);
            fetchData();
            window.dispatchEvent(new Event('notificacao-atualizada'));
        } catch (err) { console.error(err);
            setError('Falha ao atualizar status.');
        }
    };

    const handleShowModal = (reserva) => {
        setSelectedReserva(reserva);
        setShowPresenterSelect(false);
        setApresentadorId('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedReserva(null);
    };

    const handleDecision = async (status) => {
        if (status === 'Aprovado' && !apresentadorId) {
            setError('Por favor, selecione um apresentador para aprovar a reserva.');
            return;
        }
        setActionLoading(true);
        setError(null);
        try {
            await apiClient.put(`/api/marketing/reservas/${selectedReserva.id}/aprovar`, {
                status,
                apresentador_id: status === 'Aprovado' ? parseInt(apresentadorId) : null
            });
            setSuccess(`Reserva #${selectedReserva.id} foi ${status.toLowerCase()} com sucesso!`);
            handleCloseModal();
            fetchData();
            window.dispatchEvent(new Event('notificacao-atualizada'));
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao processar a decisão.');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'Pendente': 'warning', 'Aprovado': 'primary', 'Entregue': 'success',
            'Recusado': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const pendingReservas = solicitacoesReservas.filter(r => r.status === 'Pendente');

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <Container fluid className="px-0">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h2 className="fw-bold mb-1 text-dark">Gestão de Solicitações de Marketing</h2>
                            <p className="text-muted mb-0">Gerencie pedidos de materiais e reservas de salas.</p>
                        </div>
                    </div>

                    {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                    {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

                    {loading ? <div className="text-center p-5"><Spinner animation="border" /></div> : (
                        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3 custom-tabs">
                            <Tab eventKey="reservas" title={<><FaCalendarCheck className="me-2" />Reservas de Salas <Badge pill bg="danger">{pendingReservas.length}</Badge></>}>
                                <Card className="shadow-sm border-0">
                                    <Card.Header className="fw-bold">Solicitações Pendentes</Card.Header>
                                    <Table responsive hover className="align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>Solicitante</th>
                                                <th>Cliente</th>
                                                <th>Local</th>
                                                <th>Período</th>
                                                <th>Status</th>
                                                <th>Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingReservas.length > 0 ? pendingReservas.map(res => (
                                                <tr key={res.id}>
                                                    <td>{res.solicitante.nome_completo}</td>
                                                    <td>{res.nome_cliente}</td>
                                                    <td>{res.local.nome}</td>
                                                    <td>{new Date(res.data_inicio_visita).toLocaleString('pt-BR')} até {new Date(res.data_fim_visita).toLocaleString('pt-BR')}</td>
                                                    <td>{getStatusBadge(res.status)}</td>
                                                    <td><Button variant="primary" size="sm" onClick={() => handleShowModal(res)}>Gerenciar</Button></td>
                                                </tr>
                                            )) : <tr><td colSpan="6" className="text-center py-4 text-muted">Nenhuma reserva pendente.</td></tr>}
                                        </tbody>
                                    </Table>
                                </Card>
                            </Tab>
                            <Tab eventKey="materiais" title={<><FaBoxOpen className="me-2" />Solicitações de Materiais</>}>
                                <Card className="shadow-sm border-0">
                                    <Table responsive hover className="align-middle mb-0">
                                        <thead><tr><th>ID</th><th>Solicitante</th><th>Data</th><th>Itens</th><th>Status</th></tr></thead>
                                        <tbody>
                                            {solicitacoesMateriais.map(sol => (
                                                <tr key={sol.id}>
                                                    <td>#{sol.id}</td>
                                                    <td>{sol.solicitante.nome_completo}</td>
                                                    <td>{new Date(sol.data_solicitacao).toLocaleDateString()}</td>
                                                    <td>
                                                        {sol.itens.map(item => <div key={item.produto_id}>{item.quantidade}x {item.produto.nome}</div>)}
                                                    </td>
                                                    <td>
                                                        <Form.Select size="sm" value={sol.status} onChange={(e) => handleMaterialStatusChange(sol.id, e.target.value)}>
                                                            <option>Pendente</option>
                                                            <option>Aprovado</option>
                                                            <option>Entregue</option>
                                                            <option>Recusado</option>
                                                        </Form.Select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card>
                            </Tab>
                        </Tabs>
                    )}
                </Container>
            </div>

            {/* Modal de Aprovação de Reserva */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Analisar Solicitação de Reserva #{selectedReserva?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReserva && (
                        <ListGroup variant="flush">
                            <ListGroup.Item><strong>Título:</strong> {selectedReserva.titulo}</ListGroup.Item>
                            <ListGroup.Item><strong>Solicitante:</strong> {selectedReserva.solicitante.nome_completo}</ListGroup.Item>
                            <ListGroup.Item><strong>Cliente:</strong> {selectedReserva.nome_cliente}</ListGroup.Item>
                            <ListGroup.Item><strong>Interesse:</strong> {selectedReserva.interesse_cliente || 'N/A'}</ListGroup.Item>
                            <ListGroup.Item><strong>Local:</strong> {selectedReserva.local.nome}</ListGroup.Item>
                            <ListGroup.Item><strong>Início:</strong> {new Date(selectedReserva.data_inicio_visita).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</ListGroup.Item>
                            <ListGroup.Item><strong>Fim:</strong> {new Date(selectedReserva.data_fim_visita).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</ListGroup.Item>
                            <ListGroup.Item><strong>Visitantes:</strong> {selectedReserva.visitantes || 'N/A'}</ListGroup.Item>
                            <ListGroup.Item><strong>Observações:</strong> {selectedReserva.observacoes || 'N/A'}</ListGroup.Item>
                        </ListGroup>
                    )}

                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                    {showPresenterSelect && (
                        <Card className="mt-3 bg-light border">
                            <Card.Body>
                                <Form.Group>
                                    <Form.Label className="fw-bold"><FaUserTie className="me-2" />Selecione o Apresentador</Form.Label>
                                    <Form.Select value={apresentadorId} onChange={e => setApresentadorId(e.target.value)} required>
                                        <option value="">-- Escolha um colaborador --</option>
                                        {funcionarios.map(f => (
                                            <option key={f.id} value={f.id}>{f.nome_completo}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={handleCloseModal} disabled={actionLoading}>
                        Cancelar
                    </Button>
                    <div className="d-flex gap-2">
                        <Button variant="danger" onClick={() => handleDecision('Recusado')} disabled={actionLoading}>
                            {actionLoading ? <Spinner size="sm" /> : <><FaTimes className="me-2" />Recusar</>}
                        </Button>
                        
                        {!showPresenterSelect ? (
                            <Button variant="success" onClick={() => setShowPresenterSelect(true)} disabled={actionLoading}>
                                <FaCheck className="me-2" />Aprovar...
                            </Button>
                        ) : (
                            <Button variant="success" onClick={() => handleDecision('Aprovado')} disabled={actionLoading || !apresentadorId}>
                                {actionLoading ? <Spinner size="sm" /> : 'Confirmar Aprovação'}
                            </Button>
                        )}
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManageMarketingRequestsPage;