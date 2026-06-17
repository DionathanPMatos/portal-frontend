import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Table, Badge, ProgressBar, ListGroup } from 'react-bootstrap';
import { FaHardHat, FaTruck, FaClipboardList, FaFileSignature, FaTools } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import apiClient from '../../../services/api';

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const KpiCard = ({ title, value, variation, sparklineData, icon }) => (
    <Card className="h-100 shadow-sm border-0">
        <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <span className="text-muted fw-bold kpi-card-title-font">{title}</span>
                    <h4 className="mt-1 mb-0 kpi-main-metric">{value}</h4>
                    <Badge bg={variation >= 0 ? 'success-soft' : 'danger-soft'} text={variation >= 0 ? 'success' : 'danger'}>
                        {variation >= 0 ? '▲' : '▼'} {variation}%
                    </Badge>
                </div>
                <div className="kpi-icon-circle kpi-icon-circle-blue">{icon}</div>
            </div>
            <div style={{ height: '40px', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData.map(v => ({ value: v }))}>
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card.Body>
    </Card>
);

const FacilitiesDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiClient.get('/api/facilities/dashboard');
                setData(response.data);
            } catch (err) {
                setError('Não foi possível carregar os dados do dashboard.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /> Carregando dashboard...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!data) {
        return <Alert variant="info">Nenhum dado disponível para o dashboard.</Alert>;
    }
    
    const getStatusBadge = (status) => {
        const variants = {
            'Ativo': 'success', 'Em Manutenção': 'warning', 'Inativo': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const getOsStatusBadge = (status) => {
        const variants = { 'Aberta': 'danger', 'Em andamento': 'primary', 'Agendado': 'info', 'Pendente': 'warning', 'Concluído': 'success' };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };
    return (
        <div className="p-3">
            {/* Linha 1 - KPIs */}
            <Row xs={1} sm={2} lg={3} xl={5} className="g-4 mb-4">
                <Col><KpiCard title="Equipamentos Ativos" value={data.kpis.equipamentos.total} variation={data.kpis.equipamentos.variation} sparklineData={data.kpis.equipamentos.sparkline} icon={<FaTools />} /></Col>
                <Col><KpiCard title="Veículos da Frota" value={data.kpis.frota.total} variation={data.kpis.frota.variation} sparklineData={data.kpis.frota.sparkline} icon={<FaTruck />} /></Col>
                <Col><KpiCard title="Obras em Andamento" value={data.kpis.obras.total} variation={data.kpis.obras.variation} sparklineData={data.kpis.obras.sparkline} icon={<FaHardHat />} /></Col>
                <Col><KpiCard title="Ordens de Serviço Abertas" value={data.kpis.ordensServico.total} variation={data.kpis.ordensServico.variation} sparklineData={data.kpis.ordensServico.sparkline} icon={<FaClipboardList />} /></Col>
                <Col><KpiCard title="Contratos Ativos" value={data.kpis.contratos.total} variation={data.kpis.contratos.variation} sparklineData={data.kpis.contratos.sparkline} icon={<FaFileSignature />} /></Col>
            </Row>

            {/* Linha 2 */}
            <Row className="g-4 mb-4">
                <Col lg={4}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="fw-bold">Equipamentos por Categoria</Card.Header>
                        <Card.Body className="d-flex justify-content-center align-items-center">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={data.equipamentosPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {data.equipamentosPorCategoria.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={8}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="fw-bold">Ordens de Serviço em Andamento</Card.Header>
                        <Table responsive hover className="align-middle mb-0">
                            <thead><tr><th>OS #</th><th>Categoria</th><th>Descrição</th><th>Solicitante</th><th>Status</th><th>Prazo</th></tr></thead>
                            <tbody>
                                {data.ordensServicoAndamento.length > 0 ? data.ordensServicoAndamento.map(os => (
                                    <tr key={os.id}>
                                        <td>{os.id}</td>
                                        <td>{os.categoria}</td>
                                        <td>{os.descricao}</td>
                                        <td>{os.solicitante}</td>
                                        <td>{getOsStatusBadge(os.status)}</td>
                                        <td>{os.prazo ? new Date(os.prazo).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="text-center py-4 text-muted">Nenhuma OS em andamento.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col lg={12}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="fw-bold">Obras e Projetos em Andamento</Card.Header>
                        <Table responsive hover className="align-middle mb-0">
                            <thead><tr><th>Obra</th><th>Local</th><th>Etapa</th><th>Progresso</th><th>Prazo</th></tr></thead>
                            <tbody>
                                {data.obrasAndamento.length > 0 ? data.obrasAndamento.map(obra => (
                                    <tr key={obra.id}>
                                        <td>{obra.obra}</td>
                                        <td>{obra.local}</td>
                                        <td><Badge bg="info">{obra.etapa || 'N/A'}</Badge></td>
                                        <td><ProgressBar now={obra.progresso} label={`${obra.progresso}%`} style={{height: '10px'}} /></td>
                                        <td>{obra.prazo ? new Date(obra.prazo).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="text-center py-4 text-muted">Nenhuma obra em andamento.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>

            {/* Linha 3 */}
            <Row className="g-4 mb-4">
                <Col lg={4}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="fw-bold">Status da Frota</Card.Header>
                        <Card.Body className="d-flex justify-content-center align-items-center">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={data.frotaPorStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {data.frotaPorStatus.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={8}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="fw-bold">Solicitações Recentes</Card.Header>
                        <ListGroup variant="flush">
                            {data.solicitacoesRecentes.length > 0 ? data.solicitacoesRecentes.map(sol => (
                                <ListGroup.Item key={sol.id} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-bold">{sol.titulo}</div>
                                        <div className="text-muted small">{sol.solicitante}</div>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-semibold">{new Date(sol.data).toLocaleDateString()}</div>
                                        {getOsStatusBadge(sol.status)}
                                    </div>
                                </ListGroup.Item>
                            )) : (
                                <ListGroup.Item className="text-muted text-center p-4">Nenhuma solicitação recente.</ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
            <Row>
            <Col lg={8}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="fw-bold">Solicitações Recentes</Card.Header>
                        <ListGroup variant="flush">
                            {data.solicitacoesRecentes.length > 0 ? data.solicitacoesRecentes.map(sol => (
                                <ListGroup.Item key={sol.id} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-bold">{sol.titulo}</div>
                                        <div className="text-muted small">{sol.solicitante}</div>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-semibold">{new Date(sol.data).toLocaleDateString()}</div>
                                        {getOsStatusBadge(sol.status)}
                                    </div>
                                </ListGroup.Item>
                            )) : (
                                <ListGroup.Item className="text-muted text-center p-4">Nenhuma solicitação recente.</ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
           
            
                <Col lg={12}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="fw-bold">Contratos Próximos do Vencimento</Card.Header>
                        <Table responsive hover className="align-middle mb-0">
                            <thead><tr><th>Contrato</th><th>Fornecedor</th><th>Serviço</th><th>Vencimento</th><th>Status</th></tr></thead>
                            <tbody>
                                {data.contratosVencendo.length > 0 ? data.contratosVencendo.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.contrato}</td>
                                        <td>{c.fornecedor}</td>
                                        <td>{c.servico}</td>
                                        <td><Badge bg="warning-soft" text="warning">{new Date(c.vencimento).toLocaleDateString()}</Badge></td>
                                        <td>{getStatusBadge(c.status)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="text-center py-4 text-muted">Nenhum contrato próximo do vencimento.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
                <Col lg={12}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="fw-bold">Contratos Próximos do Vencimento</Card.Header>
                        <Table responsive hover className="align-middle mb-0">
                            <thead><tr><th>Contrato</th><th>Fornecedor</th><th>Serviço</th><th>Vencimento</th><th>Status</th></tr></thead>
                            <tbody>
                                {data.contratosVencendo.length > 0 ? data.contratosVencendo.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.contrato}</td>
                                        <td>{c.fornecedor}</td>
                                        <td>{c.servico}</td>
                                        <td><Badge bg="warning-soft" text="warning">{new Date(c.vencimento).toLocaleDateString()}</Badge></td>
                                        <td>{getStatusBadge(c.status)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="text-center py-4 text-muted">Nenhum contrato próximo do vencimento.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}


export default FacilitiesDashboard;