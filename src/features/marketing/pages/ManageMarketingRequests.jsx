import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Spinner, Table, Badge, Form } from 'react-bootstrap';
import { FaTasks, FaBoxOpen } from 'react-icons/fa';
import apiClient from '../../../services/api';

const ManageMarketingRequestsPage = () => {
    const [solicitacoesMateriais, setSolicitacoesMateriais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch only material requests
            const materiaisRes = await apiClient.get('/api/marketing/solicitacoes');
            setSolicitacoesMateriais(materiaisRes.data);
        } catch (err) {
            setError('Falha ao carregar solicitações de materiais.');
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
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Falha ao atualizar status.');
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'Pendente': 'warning', 'Aprovado': 'primary', 'Enviado': 'info', 'Entregue': 'success',
            'Recusado': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    return (
        <div className='container-main p-4'>
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaTasks /> Gestão de Pedidos de Material
                    </h2>
                    <p className="page-header-subtitle">Gerencie os pedidos de materiais feitos pelos colaboradores.</p>
                </div>
            </div>

            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="fw-bold d-flex align-items-center gap-2">
                            <FaBoxOpen /> Solicitações de Materiais
                        </Card.Header>
                        {loading ? <div className="text-center p-5"><Spinner animation="border" /></div> : (
                            <Table responsive hover className="align-middle mb-0">
                                <thead><tr><th>ID</th><th>Solicitante</th><th>Data</th><th>Itens</th><th>Status</th></tr></thead>
                                <tbody>
                                    {solicitacoesMateriais.length > 0 ? solicitacoesMateriais.map(sol => (
                                        <tr key={sol.id}>
                                            <td>#{sol.id}</td>
                                            <td>{sol.solicitante.nome_completo}</td>
                                            <td>{new Date(sol.data_solicitacao).toLocaleDateString()}</td>
                                            <td>
                                                {sol.itens.map(item => <div key={item.produto_id} className="fw-bold">{item.quantidade}x {item.produto.nome}</div>)}
                                                <small className="text-muted d-block mt-1"><strong>Motivo:</strong> {sol.justificativa || 'Não informada'}</small>
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
                                        <tr><td colSpan="5" className="text-center py-4 text-muted">Nenhuma solicitação de material encontrada.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </Card>

        </div>
    );
};


export default ManageMarketingRequestsPage;
