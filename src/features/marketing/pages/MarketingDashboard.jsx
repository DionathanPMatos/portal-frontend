import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, ListGroup, Image } from 'react-bootstrap';
import { FaCalendarCheck, FaChartLine, FaUserFriends, FaChartPie, FaTags, FaMoon, FaCalendarDay } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import apiClient from '../../../services/api';

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const KpiCard = ({ title, value, icon, unit = '' }) => (
    <Card className="h-100 shadow-sm border-0">
        <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <span className="text-muted fw-bold kpi-card-title-font">{title}</span>
                    <h4 className="mt-1 mb-0 kpi-main-metric">{value} <small className="text-muted fs-6">{unit}</small></h4>
                </div>
                <div className="kpi-icon-circle kpi-icon-circle-blue">{icon}</div>
            </div>
        </Card.Body>
    </Card>
);

const MarketingDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiClient.get('/api/marketing/dashboard');
                setData(response.data);
            } catch (err) {
                setError('Não foi possível carregar os dados do dashboard de marketing.');
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
        return <Alert variant="info">Nenhum dado disponível para o dashboard de marketing.</Alert>;
    }

    return (
        <div className="p-3">
            {/* KPI Cards */}
            <Row xs={1} sm={2} lg={2} xl={3} className="g-4 mb-4">
                <Col><KpiCard title="Total de Visitas no Mês" value={data.visitasMes} icon={<FaCalendarCheck />} /></Col>
                <Col><KpiCard title="Dias Ociosos no Mês" value={data.diasOciosos} icon={<FaMoon />} unit="dias" /></Col>
                <Col className="mt-4 mt-xl-0"><KpiCard title="Top Solicitante" value={data.topSolicitantes[0]?.name || 'N/A'} icon={<FaUserFriends />} unit={`(${data.topSolicitantes[0]?.value || 0} visitas)`} /></Col>
            </Row>

            {/* Charts */}
            <Row className="g-4">
                <Col lg={7}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="fw-bold"><FaChartLine className="me-2" />Visitas Aprovadas no Ano</Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.visitasAno} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="visitas" stroke="#8884d8" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={5}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="fw-bold"><FaUserFriends className="me-2" />Top 5 Solicitantes</Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.topSolicitantes} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Visitas" fill="#00C49F" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mt-4">
                <Col lg={6}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="fw-bold"><FaChartPie className="me-2" />Categorias de Compromisso</Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={data.distribuicaoCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {data.distribuicaoCategoria.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="fw-bold"><FaTags className="me-2" />Áreas de Interesse do Cliente</Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={data.distribuicaoInteresse} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {data.distribuicaoInteresse.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="fw-bold"><FaCalendarDay className="me-2" />Próximas Visitas</Card.Header>
                        <ListGroup variant="flush">
                            {data.proximasVisitas.length > 0 ? data.proximasVisitas.map(visita => (
                                <ListGroup.Item key={visita.id} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-bold">{visita.titulo}</div>
                                        <div className="text-muted small">{visita.nome_cliente} - {visita.local.nome}</div>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-semibold">{new Date(visita.data_inicio_visita).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</div>
                                        <div className="text-muted small">{new Date(visita.data_inicio_visita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </ListGroup.Item>
                            )) : (
                                <ListGroup.Item className="text-muted text-center p-4">Nenhuma visita futura agendada.</ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default MarketingDashboard;