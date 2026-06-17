import React from 'react';
import { Card, Table, Badge, Form, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaHistory, FaTasks } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';

const MarketingRequestsPage = ({ solicitacoes = [], loading, error, success, setError, setSuccess, onStatusChange }) => {
    const { user } = useAuth();
    const canManage = user && (user.privilegios?.includes('admin') || user.privilegios?.includes('gestor') || user.privilegios?.includes('marketing'));

    const getStatusBadge = (status) => {
        const variants = {
            'Pendente': 'warning',
            'Aprovado': 'primary',
            'Enviado': 'info',
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
        <div className="p-3">
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
            
            <Tabs defaultActiveKey="minhas" className="mb-3 custom-tabs">
                <Tab eventKey="minhas" title={<><FaHistory className="me-2" />Minhas Solicitações</>}>
                    <Card className="shadow-sm border-0 mt-3">
                        <Card.Header className="bg-light fw-bold text-dark d-flex align-items-center gap-2">
                            <FaHistory /> Histórico das Minhas Solicitações
                        </Card.Header>
                        <Table responsive hover className="align-middle mb-0">
                            <thead className="text-muted small text-uppercase">
                                <tr><th>Data</th><th>Itens</th><th>Justificativa</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {minhasSolicitacoes.length > 0 ? minhasSolicitacoes.map(sol => (
                                    <tr key={sol.id}>
                                        <td>{new Date(sol.data_solicitacao).toLocaleDateString()}</td>
                                        <td>{sol.itens.map(item => (<div key={item.produto_id}>{item.quantidade}x {item.produto.nome}</div>))}</td>
                                        <td>{sol.justificativa}</td>
                                        <td>{getStatusBadge(sol.status)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center py-4 text-muted">Nenhuma solicitação encontrada.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Tab>

                {canManage && (
                    <Tab eventKey="gerenciar" title={<><FaTasks className="me-2" />Gerenciar Solicitações <Badge bg="danger" pill>{solicitacoesPendentes.length}</Badge></>}>
                        <Card className="shadow-sm border-0 mt-3">
                            <Card.Header className="fw-bold d-flex align-items-center gap-2 bg-light"><FaTasks /> Todas as Solicitações</Card.Header>
                            <Table responsive hover className="align-middle mb-0">
                                <thead><tr><th>ID</th><th>Solicitante</th><th>Data</th><th>Itens</th><th>Justificativa</th><th>Status</th></tr></thead>
                                <tbody>
                                    {solicitacoes.length > 0 ? solicitacoes.map(sol => (
                                        <tr key={sol.id}>
                                            <td>#{sol.id}</td>
                                            <td>{sol.solicitante?.nome_completo}</td>
                                            <td>{new Date(sol.data_solicitacao).toLocaleDateString()}</td>
                                            <td>{sol.itens.map(item => <div key={item.produto_id}>{item.quantidade}x {item.produto?.nome}</div>)}</td>
                                            <td>{sol.justificativa}</td>
                                            <td><Form.Select size="sm" value={sol.status} onChange={(e) => onStatusChange(sol.id, e.target.value)} style={{minWidth: '120px'}}><option>Pendente</option><option>Aprovado</option><option>Enviado</option><option>Entregue</option><option>Recusado</option></Form.Select></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="text-center py-4 text-muted">Nenhuma solicitação encontrada.</td></tr>
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

export default MarketingRequestsPage;