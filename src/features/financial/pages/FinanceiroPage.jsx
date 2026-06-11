import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { FaMoneyCheckAlt, FaPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import NovaSolicitacaoModal from '../components/NovaSolicitacaoModal';
import apiClient from '../../../services/api';

export default function FinanceiroPage({ user }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showModal, setShowModal] = useState(false);
    
    // Dados
    const [minhasSolicitacoes, setMinhasSolicitacoes] = useState([]);
    const [aprovacoes, setAprovacoes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Verifica se o usuário logado tem privilégios de liderança/aprovação
    const isManager = user?.privilegios?.toLowerCase().includes('admin') || user?.privilegios?.toLowerCase().includes('gestor');

    const fetchData = async () => {
        setLoading(true);
        try {
            const resMinhas = await apiClient.get('/api/financeiro/solicitacoes/minhas');
            setMinhasSolicitacoes(resMinhas.data);
            
            if (isManager) {
                const resAprovacoes = await apiClient.get('/api/financeiro/solicitacoes/aprovacoes');
                setAprovacoes(resAprovacoes.data);
            }
        } catch (error) {
            console.error("Erro ao buscar dados financeiros:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isManager]);

    const handleSuccessUpload = () => {
        fetchData();
    };

    const handleStatusChange = async (id, novoStatus) => {
        if (!window.confirm(`Confirma a mudança de status para: ${novoStatus}?`)) return;
        try {
            await apiClient.patch(`/api/financeiro/solicitacoes/${id}/status`, { status: novoStatus });
            fetchData();
        } catch (error) { console.error("Erro ao alterar status:", error);
            alert("Erro ao alterar o status da solicitação.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Deseja realmente excluir esta solicitação? Esta ação não pode ser desfeita.")) return;
        try {
            await apiClient.delete(`/api/financeiro/solicitacoes/${id}`);
            fetchData();
        } catch (error) { console.error("Erro ao excluir solicitação:", error);
            alert("Erro ao excluir solicitação.");
        }
    };

    const formatMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
    const formatData = (data) => data ? new Date(data).toLocaleDateString('pt-BR') : '-';

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pendente Gestor': return 'warning';
            case 'Aprovado': return 'success';
            case 'Recusado': return 'danger';
            case 'Pago': return 'info';
            default: return 'secondary';
        }
    };

    const renderMinhasTabelas = (isAdiantamento) => {
        const filtradas = minhasSolicitacoes.filter(s => isAdiantamento ? s.tipo === 'Adiantamento' : s.tipo !== 'Adiantamento');
        
        return (
            <div className="table-responsive">
                <Table hover className="align-middle bg-white shadow-sm border mt-3">
                    <thead className="table-light text-uppercase small text-muted">
                        <tr>
                            <th>Nº</th>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>C. de Custo</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th className="text-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtradas.length === 0 ? <tr><td colSpan="7" className="text-center py-4">Nenhuma solicitação encontrada.</td></tr> : filtradas.map(s => (
                            <tr key={s.id}>
                                <td className="fw-bold text-muted">#{s.id}</td>
                                <td>{formatData(s.created_at)}</td>
                                <td>{s.tipo}</td>
                                <td>{s.centro_custo}</td>
                                <td className="fw-bold">{formatMoeda(s.total_solicitado)}</td>
                                <td><Badge bg={getStatusBadge(s.status)}>{s.status}</Badge></td>
                                <td className="text-end">
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(s.id)} disabled={s.status !== 'Pendente Gestor'} title={s.status !== 'Pendente Gestor' ? "Apenas solicitações pendentes podem ser apagadas." : "Excluir"}><FaTrash /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        );
    };

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="m-0 text-dark fw-bold d-flex align-items-center gap-2">
                        <FaMoneyCheckAlt className="text-primary" /> Central Financeira
                    </h2>
                    <p className="text-muted mb-0">Gerencie seus reembolsos, adiantamentos e relatórios de despesa.</p>
                </div>
                <Button variant="primary" className="shadow-sm d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
                    <FaPlus /> Nova Solicitação
                </Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Tabs 
                        activeKey={activeTab} 
                        onSelect={(k) => setActiveTab(k)} 
                        className="custom-tabs px-3 pt-3 border-bottom-0"
                    >
                        <Tab eventKey="dashboard" title="Dashboard Financeiro">
                            <div className="p-4 bg-light">
                                {loading ? <Spinner animation="border" className="d-block mx-auto" /> : (
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Card className="shadow-sm border-0 border-start border-4 border-primary"><Card.Body>
                                                <p className="text-muted text-uppercase small mb-1">Adiantamentos Solicitados</p>
                                                <h3 className="mb-0">{formatMoeda(minhasSolicitacoes.filter(s => s.tipo === 'Adiantamento').reduce((acc, curr) => acc + parseFloat(curr.total_solicitado), 0))}</h3>
                                            </Card.Body></Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card className="shadow-sm border-0 border-start border-4 border-success"><Card.Body>
                                                <p className="text-muted text-uppercase small mb-1">Despesas e Reembolsos</p>
                                                <h3 className="mb-0">{formatMoeda(minhasSolicitacoes.filter(s => s.tipo !== 'Adiantamento').reduce((acc, curr) => acc + parseFloat(curr.total_solicitado), 0))}</h3>
                                            </Card.Body></Card>
                                        </Col>
                                    </Row>
                                )}
                            </div>
                        </Tab>
                        
                        <Tab eventKey="adiantamentos" title="Meus Adiantamentos">
                            <div className="p-4">
                                {loading ? <Spinner animation="border" className="d-block mx-auto my-4" /> : renderMinhasTabelas(true)}
                            </div>
                        </Tab>

                        <Tab eventKey="despesas" title="Relatório de Despesas (Reembolsos)">
                            <div className="p-4">
                                {loading ? <Spinner animation="border" className="d-block mx-auto my-4" /> : renderMinhasTabelas(false)}
                            </div>
                        </Tab>

                        {/* Aba Condicional: Só aparece se o usuário for um Gestor ou Admin */}
                        {isManager && (
                            <Tab eventKey="aprovacoes" title="Aprovações da Equipe">
                                <div className="p-4 bg-white">
                                    {loading ? <Spinner animation="border" className="d-block mx-auto my-4" /> : (
                                        <div className="table-responsive">
                                            <Table hover className="align-middle bg-white shadow-sm border">
                                                <thead className="table-light text-uppercase small text-muted">
                                                    <tr><th>Nº</th><th>Colaborador</th><th>Data</th><th>Tipo</th><th>Total</th><th>Status</th><th className="text-end">Ações</th></tr>
                                                </thead>
                                                <tbody>
                                                    {aprovacoes.length === 0 ? <tr><td colSpan="7" className="text-center py-4">Nenhuma aprovação pendente.</td></tr> : aprovacoes.map(s => (
                                                        <tr key={s.id}>
                                                            <td className="fw-bold text-muted">#{s.id}</td>
                                                            <td><strong>{s.colaborador?.nome_completo}</strong><br/><small className="text-muted">{s.colaborador?.setor?.nome_setor}</small></td>
                                                            <td>{formatData(s.created_at)}</td><td>{s.tipo}</td><td className="fw-bold text-primary">{formatMoeda(s.total_solicitado)}</td>
                                                            <td><Badge bg={getStatusBadge(s.status)}>{s.status}</Badge></td>
                                                            <td className="text-end">
                                                                {s.status === 'Pendente Gestor' && (
                                                                    <>
                                                                        <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleStatusChange(s.id, 'Aprovado')} title="Aprovar"><FaCheck /></Button>
                                                                        <Button variant="outline-danger" size="sm" onClick={() => handleStatusChange(s.id, 'Recusado')} title="Recusar"><FaTimes /></Button>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            </Tab>
                        )}
                    </Tabs>
                </Card.Body>
            </Card>

            {/* Modal de Lançamento */}
            {showModal && (
                <NovaSolicitacaoModal 
                    show={showModal} 
                    onHide={() => setShowModal(false)}
                    onSuccess={handleSuccessUpload}
                />
            )}
        </Container>
    );
}
