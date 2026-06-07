import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Tabs, Tab, Form, Button } from 'react-bootstrap';
import { FaFilter, FaUser, FaChartLine, FaCog, FaBullseye, FaPercentage, FaSyncAlt, FaCalendarCheck, FaRedo, FaChartPie, FaBan } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';
import apiClient from '../../../services/api';

// Helper para formatar moeda
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

// Componente para um card de KPI individual
const KpiCard = ({ title, value, icon, color = 'primary', note }) => (
    <Card className={`shadow-sm border-start border-5 border-${color} h-100`}>
        <Card.Body>
            <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                    <div className={`text-xs fw-bold text-${color} text-uppercase mb-1`}>{title}</div>
                    <div className="h5 mb-0 fw-bold text-gray-800">{value}</div>
                    {note && <small className="text-muted">{note}</small>}
                </Col>
                <Col xs="auto">
                    {icon}
                </Col>
            </Row>
        </Card.Body>
    </Card>
);

// Componente Principal da Página
const KpiComercialPage = () => {
    const [key, setKey] = useState('geral');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados dos dados
    const [kpiData, setKpiData] = useState(null);
    const [vendedores, setVendedores] = useState([]);
    const [metas, setMetas] = useState([]);

    // Estados dos filtros
    const [selectedVendedor, setSelectedVendedor] = useState('');
    const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
    const [selectedAno, setSelectedAno] = useState(new Date().getFullYear());

    // Busca dados iniciais (lista de vendedores e metas)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [vendedoresRes, metasRes] = await Promise.all([
                    apiClient.get('/api/vendedores'),
                    apiClient.get('/api/kpi/metas')
                ]);
                setVendedores(vendedoresRes.data);
                setMetas(metasRes.data);
            } catch (err) {
                setError('Erro ao carregar dados de configuração.');
            }
        };
        fetchInitialData();
    }, []);

    // Busca os dados de KPI quando os filtros mudam
    useEffect(() => {
        const fetchKpiData = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = {
                    mes: selectedMes,
                    ano: selectedAno,
                    vendedor_id: key === 'individual' ? selectedVendedor : undefined
                };
                const { data } = await apiClient.get('/api/kpi/comercial', { params });
                setKpiData(data);
            } catch (err) {
                setError('Erro ao carregar os KPIs.');
                setKpiData(null);
            } finally {
                setLoading(false);
            }
        };

        if (key === 'geral' || (key === 'individual' && selectedVendedor)) {
            fetchKpiData();
        } else {
            setKpiData(null);
            setLoading(false);
        }
    }, [key, selectedVendedor, selectedMes, selectedAno]);

    const handleMetaUpdate = async (vendedorNome, metaAtual) => {
        const novaMetaStr = prompt(`Digite a nova meta de vendas para ${vendedorNome}:`, metaAtual);
        if (novaMetaStr === null) return;

        const novaMeta = parseFloat(novaMetaStr.replace(/[^0-9,.]/g, '').replace(',', '.'));
        if (isNaN(novaMeta)) {
            alert('Valor inválido.');
            return;
        }

        try {
            await apiClient.post('/api/dashboard-metrics/meta-vendedor', { vendedor: vendedorNome, meta: novaMeta });
            const metasRes = await apiClient.get('/api/kpi/metas');
            setMetas(metasRes.data);
            alert('Meta atualizada com sucesso!');
        } catch (err) {
            alert('Erro ao atualizar a meta.');
        }
    };

    const renderFunnel = () => {
        if (!kpiData || !kpiData.funil) return null;
        
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#28a745'];

        const stages = [
            { name: 'Prospecção', value: kpiData.funil['Prospecção'], fill: COLORS[0] },
            { name: 'Qualificação', value: kpiData.funil['Qualificação'], fill: COLORS[1] },
            { name: 'DTC', value: kpiData.funil['Dtc'], fill: COLORS[2] },
            { name: 'Proposta', value: kpiData.funil['Proposta'], fill: COLORS[3] },
            { name: 'Negociação', value: kpiData.funil['Negociação'], fill: COLORS[4] },
            { name: 'Fechado', value: kpiData.funil['Fechado'], fill: COLORS[5] }
        ];

        return (
            <Card className="h-100 shadow-sm">
                <Card.Header><FaFilter className="me-2"/> Funil de Vendas</Card.Header>
                <Card.Body>
                    <ResponsiveContainer width="100%" height={350}>
                        <FunnelChart>
                            <Tooltip formatter={(value, name, props) => [`${value} Projetos`, props.payload.name]} />
                            <Funnel dataKey="value" data={stages} isAnimationActive>
                                <LabelList position="right" fill="#333" stroke="none" dataKey="name" />
                                <LabelList position="center" fill="#fff" stroke="none" dataKey="value" />
                            </Funnel>
                        </FunnelChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>
        );
    };

    const renderDashboardContent = () => {
        if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
        if (error) return <Alert variant="danger">{error}</Alert>;
        if (!kpiData) return <Alert variant="info">Selecione um vendedor para ver os KPIs individuais.</Alert>;

        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

        return (
            <>
                <Row className="g-4 mb-4">
                    <Col md={6} lg={3}><KpiCard title="Volume de Vendas" value={formatCurrency(kpiData.volume_vendas)} icon={<FaChartLine size={32} className="text-gray-300"/>} color="success" /></Col>
                    <Col md={6} lg={3}><KpiCard title="Ticket Médio" value={formatCurrency(kpiData.ticket_medio)} icon={<FaPercentage size={32} className="text-gray-300"/>} color="info" /></Col>
                    <Col md={6} lg={3}><KpiCard title="Hit Rate (Conversão)" value={`${kpiData.hitRate.toFixed(1)}%`} icon={<FaBullseye size={32} className="text-gray-300"/>} color="primary" note="Projetos Ganhos / Abertos" /></Col>
                    <Col md={6} lg={3}><KpiCard title="Clientes Ativos" value={kpiData.clientes_ativos} icon={<FaUser size={32} className="text-gray-300"/>} color="warning" /></Col>
                </Row>
                <Row className="g-4 mb-4">
                    <Col lg={8}>{renderFunnel()}</Col>
                    <Col lg={4}>
                        <Row className="g-4">
                            <Col xs={12}><KpiCard title="Reuniões Agendadas vs Realizadas" value={`${kpiData.reunioes.realizadas} / ${kpiData.reunioes.agendadas}`} icon={<FaCalendarCheck size={32} className="text-gray-300"/>} color="secondary" /></Col>
                            <Col xs={12}><KpiCard title="Taxa de Recompra" value={`${kpiData.taxa_recompra.toFixed(1)}%`} icon={<FaRedo size={32} className="text-gray-300"/>} color="purple" note="Clientes com >1 projeto" /></Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="g-4">
                    <Col lg={6}>
                        <Card className="h-100 shadow-sm">
                            <Card.Header><FaBan className="me-2"/> Principais Motivos de Perda</Card.Header>
                            <Card.Body>
                                {kpiData.motivos_perda && kpiData.motivos_perda.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={kpiData.motivos_perda} dataKey="total" nameKey="motivo_perda" cx="50%" cy="50%" outerRadius={80} label>
                                                {kpiData.motivos_perda.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(value, name) => [`${value} projetos`, name]}/>
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : <div className="text-center text-muted p-5">Nenhum motivo de perda registrado no período.</div>}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6}>
                        <Card className="h-100 shadow-sm">
                            <Card.Header><FaChartPie className="me-2"/> Outros Indicadores</Card.Header>
                            <Card.Body>
                                <Row className="g-3">
                                    <Col sm={6}><KpiCard title="Tempo de Ciclo" value={`${kpiData.tempo_ciclo} dias`} note="(Aguardando dados)" color="dark"/></Col>
                                    <Col sm={6}><KpiCard title="Desconto Médio" value={`${kpiData.desconto_medio}%`} note="(Aguardando dados)" color="dark"/></Col>
                                    <Col sm={6}><KpiCard title="Acurácia do Forecast" value={`${kpiData.acuracia_forecast}%`} note="(Aguardando dados)" color="dark"/></Col>
                                    <Col sm={6}><KpiCard title="Origem dos Clientes" value="N/A" note="(Aguardando dados)" color="dark"/></Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </>
        );
    };

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold mb-1 text-dark">KPIs da Equipe Comercial</h2>
            <p className="text-muted mb-4">Análise de performance de vendas e funil.</p>

            <Tabs id="kpi-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
                <Tab eventKey="geral" title={<><FaChartLine className="me-2"/> Dashboard Geral</>}>
                    <Card className="border-0 shadow-sm"><Card.Body>{renderDashboardContent()}</Card.Body></Card>
                </Tab>
                <Tab eventKey="individual" title={<><FaUser className="me-2"/> KPIs Individuais</>}>
                     <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light">
                            <Form.Group as={Row} className="align-items-center">
                                <Form.Label column sm="auto" className="fw-bold">Selecione o Vendedor:</Form.Label>
                                <Col sm={4}>
                                    <Form.Select value={selectedVendedor} onChange={e => setSelectedVendedor(e.target.value)}>
                                        <option value="">-- Escolha um vendedor --</option>
                                        {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome_completo}</option>)}
                                    </Form.Select>
                                </Col>
                            </Form.Group>
                        </Card.Header>
                        <Card.Body>{renderDashboardContent()}</Card.Body>
                    </Card>
                </Tab>
                <Tab eventKey="metas" title={<><FaCog className="me-2"/> Configuração de Metas</>}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header>Configurar Metas de Vendas Mensais</Card.Header>
                        <Card.Body>
                            <ul className="list-group">
                                {vendedores.map(v => {
                                    const metaVendedor = metas.find(m => m.vendedor === v.nome_completo);
                                    const metaValor = metaVendedor ? metaVendedor.meta : 0;
                                    return (
                                        <li key={v.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>{v.nome_completo}</div>
                                            <div>
                                                <span className="me-3 fw-bold">{formatCurrency(metaValor)}</span>
                                                <Button variant="outline-primary" size="sm" onClick={() => handleMetaUpdate(v.nome_completo, metaValor)}>
                                                    Editar
                                                </Button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default KpiComercialPage;