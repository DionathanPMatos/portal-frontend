import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { FaBoxOpen, FaClipboardList } from 'react-icons/fa';
import MarketingMaterialsPage from './MarketingMaterialsPage';
import MarketingRequestsPage from './MarketingRequestsPage';
import apiClient from '../../../services/api';

const MarketingMaterialsHubPage = () => {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const solicitacoesRes = await apiClient.get('/api/marketing/solicitacoes');
            setSolicitacoes(solicitacoesRes.data);
        } catch (err) {
            setError('Falha ao carregar solicitações. Tente atualizar a página.');
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
            setSuccess(null);
            setError(null);
            await apiClient.put(`/api/marketing/solicitacoes/${solicitacaoId}/status`, { status: newStatus });
            setSuccess(`Status da solicitação #${solicitacaoId} atualizado para ${newStatus}.`);
            fetchData();
            window.dispatchEvent(new Event('notificacao-atualizada'));
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Falha ao atualizar status.');
        }
    };

    return (
        // Estas abas internas não precisam do `fill` ou `justify` para não conflitarem com as abas principais
        <Tabs defaultActiveKey="catalogo" id="materials-hub-tabs" className="mb-3">
            <Tab eventKey="catalogo" title={<><FaBoxOpen className="me-2" />Catálogo e Solicitação</>}>
                <MarketingMaterialsPage onNewRequest={fetchData} />
            </Tab>
            <Tab eventKey="gestao" title={<><FaClipboardList className="me-2" />Gestão de Solicitações</>}>
                <MarketingRequestsPage
                    solicitacoes={solicitacoes}
                    loading={loading}
                    error={error}
                    success={success}
                    setError={setError}
                    setSuccess={setSuccess}
                    onStatusChange={handleMaterialStatusChange}
                />
            </Tab>
        </Tabs>
    );
};

export default MarketingMaterialsHubPage;