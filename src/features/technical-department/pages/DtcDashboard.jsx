import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Table, Badge, ListGroup, Form } from 'react-bootstrap';
import { FaHourglassHalf, FaCog, FaCheckCircle, FaClock, FaCalendarAlt, FaChartPie, FaProjectDiagram, FaQuestionCircle, FaUsersCog, FaRocket, FaBook } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer  } from 'recharts';
import apiClient from '../../../services/api';

const DtcDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get('/api/dtc/dashboard', {
                    params: { month: selectedMonth, year: selectedYear }
                });
                setData(response.data);
            } catch (err) {
                setError('Não foi possível carregar os dados do dashboard.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedMonth, selectedYear]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR') : 'N/A';
    
    const formatInterval = (interval) => {
        if (!interval) return 'N/A';
        const { days, hours, minutes } = interval;
        let parts = [];
        if (days) parts.push(`${days}d`);
        if (hours) parts.push(`${hours}h`);
        if (minutes) parts.push(`${Math.round(minutes)}m`);
        return parts.length > 0 ? parts.join(' ') : 'Menos de 1 min';
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!data) return <Alert variant="info">Nenhum dado para exibir.</Alert>;

    const { kpis, donutChart, projetosAndamento, perguntasPendentes, gerentesProdutos, roadmap, documentosRecentes } = data;
    const COLORS = ['#FFBB28', '#00C49F', '#0088FE'];

    return (
        <div className="p-3">
            <Row className="mb-4 g-3 align-items-center bg-light p-3 rounded">
                <Col xs="auto" className="fw-bold">Filtrar período:</Col>
                <Col md={2}>
                    <Form.Select size="sm" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                        <option value="1">Janeiro</option>
                        <option value="2">Fevereiro</option>
                        <option value="3">Março</option>
                        <option value="4">Abril</option>
                        <option value="5">Maio</option>
                        <option value="6">Junho</option>
                        <option value="7">Julho</option>
                        <option value="8">Agosto</option>
                        <option value="9">Setembro</option>
                        <option value="10">Outubro</option>
                        <option value="11">Novembro</option>
                        <option value="12">Dezembro</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select size="sm" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (<option key={year} value={year}>{year}</option>))}
                    </Form.Select>
                </Col>
            </Row>
            <Row className="g-4 mb-4">
                <Col><CardKpi title="Projetos Aguardando" value={kpis.aguardando} icon={<FaHourglassHalf />} color="orange" /></Col>
                <Col><CardKpi title="Projetos em Desenvolvimento" value={kpis.desenvolvimento} icon={<FaCog />} color="blue" /></Col>
                <Col><CardKpi title="Projetos Entregues" value={kpis.entregues} icon={<FaCheckCircle />} color="green" /></Col>
                <Col><CardKpi title="Tempo Médio de Entrega" value={formatInterval(kpis.tempoMedio)} icon={<FaClock />} color="purple" /></Col>
                <Col><CardKpi title="Projetos no Mês" value={kpis.projetosMes} icon={<FaCalendarAlt />} color="red" /></Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col lg={5}>
                    <Card className="h-100">
                        <Card.Header className="fw-bold d-flex align-items-center gap-2"><FaChartPie /> Projetos por Status</Card.Header>
                        <Card.Body className="d-flex flex-column align-items-center justify-content-center position-relative">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={donutChart.data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                        {donutChart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value} projetos`} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="donut-center-text">
                                <div className="fw-bold fs-4">{formatCurrency(donutChart.valorTotal)}</div>
                                <div className="text-muted small">Valor Total</div>
                            </div>
                            <div className="d-flex justify-content-center gap-4 mt-3">
                                {donutChart.data.map((entry, index) => (
                                    <div key={index} className="d-flex align-items-center">
                                        <span style={{ width: '10px', height: '10px', backgroundColor: COLORS[index % COLORS.length], marginRight: '5px' }}></span>
                                        {entry.name}: {entry.value}
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={7}>
                    <Card className="mb-4">
                        <Card.Header className="fw-bold d-flex align-items-center gap-2"><FaProjectDiagram /> Projetos em Andamento</Card.Header>
                        <Table responsive hover size="sm" className="mb-0">
                            <thead><tr><th>Projeto</th><th>Cliente</th><th>Etapa</th><th>Responsável</th><th>Prazo</th></tr></thead>
                            <tbody>
                                {projetosAndamento.map(p => (<tr key={p.id}><td>{p.nome_projeto}</td><td>{p.nome_cliente}</td><td><Badge bg="primary">{p.etapa_funil}</Badge></td><td>{p.responsavel || 'N/A'}</td><td>{formatDate(p.prazo)}</td></tr>))}
                            </tbody>
                        </Table>
                    </Card>
                    <Card>
                        <Card.Header className="fw-bold d-flex align-items-center gap-2"><FaQuestionCircle /> Perguntas Pendentes</Card.Header>
                        <Table responsive hover size="sm" className="mb-0">
                            <thead><tr><th>Data</th><th>Solicitante</th><th>Vertical</th><th>Status</th></tr></thead>
                            <tbody>
                                {perguntasPendentes.map((q, i) => (<tr key={i}><td>{formatDate(q.data)}</td><td>{q.solicitante}</td><td>{q.vertical || 'N/A'}</td><td><Badge bg="warning">{q.status}</Badge></td></tr>))}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                <Col lg={5}>
                    <Card className="h-100">
                        <Card.Header className="fw-bold d-flex align-items-center gap-2"><FaUsersCog /> Gerentes de Produtos</Card.Header>
                        <ListGroup variant="flush">
                            {gerentesProdutos.map(g => (<ListGroup.Item key={g.id}><div className="fw-bold">{g.gerente}</div><div className="text-muted small"><strong>Linhas:</strong> {g.linhas_produtos || 'N/A'}</div><div className="text-muted small"><strong>Fabricantes:</strong> {g.fabricantes || 'N/A'}</div></ListGroup.Item>))}
                        </ListGroup>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="h-100">
                        <Card.Header className="fw-bold d-flex align-items-center gap-2"><FaRocket /> Lançamentos e Roadmap</Card.Header>
                        <ListGroup variant="flush">
                            {roadmap.map(r => (<ListGroup.Item key={r.id} className="d-flex justify-content-between"><span>{r.title}</span><Badge bg="secondary">{r.date}</Badge></ListGroup.Item>))}
                        </ListGroup>
                    </Card>
                </Col>
                <Col lg={3}>
                    <Card className="h-100">
                        <Card.Header className="fw-bold d-flex align-items-center gap-2"><FaBook /> Documentos Recentes</Card.Header>
                        <ListGroup variant="flush">
                            {documentosRecentes.map(d => (<ListGroup.Item key={d.id}><div className="fw-bold">{d.nome}</div><div className="text-muted small">{d.categoria} - {formatDate(d.created_at)}</div></ListGroup.Item>))}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

const CardKpi = ({ title, value, icon, color }) => (
    <Card className="h-100 shadow-sm border-0">
        <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <span className="text-muted font-weight-bold kpi-card-title-font">{title}</span>
                    <h4 className="mt-1 mb-0 kpi-main-metric">{value}</h4>
                </div>
                <div className={`kpi-icon-circle kpi-icon-circle-${color}`}>{icon}</div>
            </div>
        </Card.Body>
    </Card>
);

export default DtcDashboard;