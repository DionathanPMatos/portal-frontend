import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaRobot, FaFilter } from 'react-icons/fa';

// Opções de status para o dropdown
const statusOptions = [
    { value: 'Novo', label: 'Novo', variant: 'primary' },
    { value: 'Em Prospecção', label: 'Em Prospecção', variant: 'info' },
    { value: 'Contatado', label: 'Contatado', variant: 'success' },
    { value: 'Descartado', label: 'Descartado', variant: 'danger' },
];

// Função para obter a cor (variant) do Badge
const getStatusVariant = (status) => {
    return statusOptions.find(opt => opt.value === status)?.variant || 'secondary';
};

const GerenciamentoLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para os filtros
    const [filtroRegiao, setFiltroRegiao] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');

    const [searchSegmento, setSearchSegmento] = useState('indústria');
    const [searchLocalidade, setSearchLocalidade] = useState('Santa Catarina');
    const [searchPorte, setSearchPorte] = useState('grande porte');

    // Estados para o agente
    const [agentLoading, setAgentLoading] = useState(false);
    const [agentMessage, setAgentMessage] = useState('');

    

    // Função para buscar os leads da API
    const fetchLeads = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Constrói a URL com os parâmetros de filtro
            const params = new URLSearchParams();
            if (filtroRegiao) params.append('regiao', filtroRegiao);
            if (filtroStatus) params.append('status', filtroStatus);

            const response = await fetch(`http://localhost:3000/api/leads?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Falha ao buscar leads');
            }
            const data = await response.json();
            setLeads(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filtroRegiao, filtroStatus]); // <-- Depende dos filtros

    // Busca inicial ao carregar a página
    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Handler para disparar o agente de prospecção
 // Handler para disparar o agente de prospecção
    const handleRunAgent = async () => {
        if (!searchSegmento) {
            setError('O campo "Segmento" é obrigatório para a pesquisa.');
            return;
        }

        setAgentLoading(true);
        setAgentMessage('Disparando agente... A pesquisar no Google.');
        setError('');
        try {
            // =================================================================
            // (MODIFICADO) Enviar os filtros no corpo da requisição
            // =================================================================
            const response = await fetch('http://localhost:3000/api/agente/executar-leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    segmento: searchSegmento,
                    localidade: searchLocalidade,
                    porte: searchPorte
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao executar o agente.');
            }
            setAgentMessage(data.msg || 'Agente executado. Atualizando lista...');
            fetchLeads(); // Re-busca os leads após o agente rodar
        } catch (err) {
            setError(err.message);
        } finally {
            setAgentLoading(false);
        }
    };

    // Handler para mudar o status de um lead
    const handleStatusChange = async (leadId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:3000/api/leads/${leadId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                throw new Error('Falha ao atualizar status');
            }
            // Atualiza o status localmente para refletir a mudança
            setLeads(prevLeads =>
                prevLeads.map(lead =>
                    lead.id === leadId ? { ...lead, status: newStatus } : lead
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };

return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={12}>
                    <Link to="/admin" className="btn btn-outline-secondary mb-3">
                        {/* ... (ícone Voltar) */}
                    </Link>

                    {/* Card para Disparar o Agente */}
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header as="h5">Prospecção de Leads (Pesquisa Rápida)</Card.Header>
                        <Card.Body>
                            {/* ================================================================= */}
                            {/* (NOVOS) Campos de Filtro para Pesquisa */}
                            {/* ================================================================= */}
                            <Form>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group controlId="searchSegmento">
                                            <Form.Label>Segmento*</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Ex: indústria, hospital" 
                                                value={searchSegmento}
                                                onChange={(e) => setSearchSegmento(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="searchLocalidade">
                                            <Form.Label>Localidade</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Ex: Santa Catarina, SP" 
                                                value={searchLocalidade}
                                                onChange={(e) => setSearchLocalidade(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="searchPorte">
                                            <Form.Label>Porte / Termo-chave</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Ex: grande porte, multinacional" 
                                                value={searchPorte}
                                                onChange={(e) => setSearchPorte(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button variant="primary" onClick={handleRunAgent} disabled={agentLoading} className="mt-3">
                                    {agentLoading ? (
                                        'Buscando...'
                                    ) : (
                                        <><FaRobot className="me-2" /> Disparar Agente</>
                                    )}
                                </Button>
                            </Form>
                            {agentMessage && <Alert variant="info" className="mt-3 mb-0">{agentMessage}</Alert>}
                        </Card.Body>
                    </Card>

                    {/* Card Principal de Gerenciamento */}
                    <Card className="shadow-sm border-0">
                        <Card.Header as="h5">Leads Sugeridos</Card.Header>
                        <Card.Body>
                            {/* Filtros */}
                            <Form as={Row} className="mb-3">
                                <Col md={5}>
                                    <Form.Group controlId="filtroRegiao">
                                        <Form.Label>Filtrar por Região</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="Ex: SC, Paraná" 
                                            value={filtroRegiao}
                                            onChange={(e) => setFiltroRegiao(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={5}>
                                    <Form.Group controlId="filtroStatus">
                                        <Form.Label>Filtrar por Status</Form.Label>
                                        <Form.Select
                                            value={filtroStatus}
                                            onChange={(e) => setFiltroStatus(e.target.value)}
                                        >
                                            <option value="">Todos os Status</option>
                                            {statusOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={2} className="d-flex align-items-end">
                                    <Button variant="outline-primary" onClick={fetchLeads} className="w-100">
                                        <FaFilter className="me-2" /> Filtrar
                                    </Button>
                                </Col>
                            </Form>
                            
                            <hr />

 {/* Tabela de Leads */}
                            {/* ... (loading e error) ... */}
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            {/* ================================================================= */}
                                            {/* (MODIFICADO) Cabeçalho da Tabela */}
                                            {/* ================================================================= */}
                                            <th>Resultado (Título e Snippet)</th>
                                            <th>Segmento (Pesquisa)</th>
                                            <th>Região (Pesquisa)</th>
                                            <th>Termo Pesquisado</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* ... (leads.length === 0) ... */}
                                        {
                                            leads.map(lead => (
                                                <tr key={lead.id}>
                                                    {/* ================================================================= */}
                                                    {/* (MODIFICADO) Corpo da Tabela */}
                                                    {/* ================================================================= */}
                                                    <td>
                                                        <a href={lead.link} target="_blank" rel="noopener noreferrer" className="fw-bold">
                                                            {lead.titulo}
                                                        </a>
                                                        <small className="d-block text-muted mt-1">{lead.snippet}</small>
                                                    </td>
                                                    <td>{lead.setor}</td>
                                                    <td>{lead.regiao}</td>
                                                    <td><Badge bg="secondary">{lead.termo_pesquisa}</Badge></td>
                                                    <td>
                                                        <Form.Select
                                                            size="sm"
                                                            value={lead.status}
                                                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                            className={`fw-bold border-${getStatusVariant(lead.status)} text-${getStatusVariant(lead.status)}`}
                                                        >
                                                            {statusOptions.map(opt => (
                                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </Table>
                            {/* ... (fim do loading e error) ... */}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default GerenciamentoLeads;