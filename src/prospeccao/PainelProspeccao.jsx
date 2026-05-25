import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import OportunidadeCard from './OportunidadeCard';
import FiltrosProspeccao from './FiltrosProspeccao';
// Importe componentes do React-Bootstrap que você já usa
import { Container, Spinner, Button, Alert } from 'react-bootstrap';

const PainelProspeccao = () => {
    const [oportunidades, setOportunidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [runningAgent, setRunningAgent] = useState(false);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState(''); // Estado para erros das ações
    const [filtros, setFiltros] = useState({
        vertical: '',
        prioridade: '',
        tipo: '',
        status: 'Novo', // Começa mostrando apenas os 'Novos'
    });

    // Função para buscar oportunidades (modificada para filtrar descartados por padrão)
    const fetchOportunidades = useCallback(async (currentFilters) => {
        setLoading(true);
        setError('');
        setActionError(''); // Limpa erros de ação ao recarregar
        try {
            // Se o filtro de status for '', não inclui 'Descartado' na busca
            const paramsToFetch = { ...currentFilters };
            if (paramsToFetch.status === '') {
                 // Busca todos, exceto os descartados (se o backend suportar isso)
                 // Se o backend não suportar, teremos que filtrar no frontend depois
                 // Por simplicidade, vamos manter a lógica atual: '' busca TUDO
                 // A mudança no texto do filtro ajuda o usuário
            }
            
            const params = new URLSearchParams(paramsToFetch).toString();
            const res = await axios.get(`/api/oportunidades?${params}`); 
            setOportunidades(res.data);
        } catch (err) {
            console.error('Erro ao buscar oportunidades:', err);
            setError(err.response?.data?.error || 'Erro ao buscar dados.');
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Removido 'filtros' da dependência para evitar recarregamento a cada ação


    useEffect(() => {
        fetchOportunidades(filtros); // Busca inicial com os filtros padrão
    }, [fetchOportunidades, filtros]); // Re-busca quando os filtros mudam


    // Função genérica para atualizar status via API
    const updateOportunidadeStatus = useCallback(async (id, newStatus) => {
        setActionError(''); // Limpa erro anterior
        // Otimista: Atualiza a UI imediatamente (opcional)
        /* setOportunidades(prev => 
            prev.map(op => 
                op.id === id ? { ...op, status: newStatus, is_viewed: true } : op
            )
        ); */

        try {
            // Marca como visualizado junto com a mudança de status
            const res = await axios.patch(`/api/oportunidades/${id}`, { 
                status: newStatus, 
                is_viewed: true 
            });
            
            // Atualiza o estado local com os dados retornados pela API (mais seguro)
             setOportunidades(prev => 
                prev.map(op => 
                    op.id === id ? res.data : op // Substitui pelo objeto atualizado
                )
             );

        } catch (err) {
            console.error(`Erro ao ${newStatus === 'Qualificado' ? 'qualificar' : 'descartar'} oportunidade:`, err);
            setActionError(`Erro ao atualizar oportunidade ${id}. Tente novamente.`);
            // Reverte a UI se a atualização falhou (se fez a atualização otimista)
            // fetchOportunidades(filtros); // Ou recarrega tudo
        }
    }, []); // Sem dependências complexas aqui


    // Handlers específicos que chamam a função genérica
    const handleQualificar = useCallback((id) => {
        updateOportunidadeStatus(id, 'Qualificado');
    }, [updateOportunidadeStatus]);

    const handleDescartar = useCallback((id) => {
        updateOportunidadeStatus(id, 'Descartado');
    }, [updateOportunidadeStatus]);



    const handleRunAgent = async () => {
        setRunningAgent(true);
        try {
            const res = await axios.post('/api/agente/executar');
            alert(res.data.msg);
            // Recarrega as oportunidades após um tempo
           setTimeout(() => {
    fetchOportunidades(filtros); // Chama a função dentro de uma arrow function e passa os filtros atuais
}, 5000);
        } catch (err) {
            console.error('Erro ao disparar agente:', err);
            alert('Erro ao disparar agente.');
        } finally {
            setRunningAgent(false);
        }
    };

    const handleFilterChange = (e) => {
        setFiltros({
            ...filtros,
            [e.target.name]: e.target.value
        });
    };

    return (
        // Use o container do seu layout
        <div className="container-main">
        <Container fluid className="p-4"> 
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Painel de Prospecção Inteligente</h2>
                <Button onClick={handleRunAgent} disabled={runningAgent} variant="primary">
                    {runningAgent ? <Spinner as="span" animation="border" size="sm" /> : 'Analisar Novas Fontes'}
                </Button>
            </div>

            <FiltrosProspeccao filtros={filtros} onChange={handleFilterChange} />
            
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            {actionError && <Alert variant="warning" className="mt-3">{actionError}</Alert>} {/* Mostra erros de ação */}

            <div style={{ marginTop: '20px' }}>
                {loading ? (
                    <div className="text-center"><Spinner animation="border" /></div>
                ) : (
                    <div className="oportunidade-lista">
                        {oportunidades.length === 0 ? (
                            <Alert variant="info">Nenhuma oportunidade encontrada com os filtros atuais.</Alert>
                        ) : (
                            oportunidades.map(op => (
                                <OportunidadeCard 
                                    key={op.id} 
                                    op={op} 
                                    // Passa os handlers para o Card
                                    onQualificar={handleQualificar} 
                                    onDescartar={handleDescartar} 
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        
        </Container>
        </div>
        
    );
};  


export default PainelProspeccao;