import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, ListGroup, Image, Form, Carousel, Button } from 'react-bootstrap';
import { FaUsers, FaUserPlus, FaUserMinus, FaBirthdayCake, FaChartPie, FaVenusMars, FaChartLine, FaSyncAlt, FaClipboardCheck, FaUserClock } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Link } from 'react-router-dom';
import apiClient from '../../../services/api';
import KpiDetailsModal from '../components/KpiDetailsModal';

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const HRDashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showKpiModal, setShowKpiModal] = useState(false);
    const [kpiDetails, setKpiDetails] = useState({ title: '', employees: [] });
    const [kpiLoading, setKpiLoading] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/api/rh/dashboard', {
                    params: {
                        year: selectedYear,
                        month: selectedMonth
                    }
                });
                setDashboardData(response.data);
            } catch (err) {
                setError('Não foi possível carregar os dados do dashboard.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedMonth, selectedYear]);

    const handleKpiClick = async (type, count) => {
        if (count === 0) return; // Não abre o modal se o KPI for 0

        setKpiLoading(true);
        setShowKpiModal(true);
        setKpiDetails({ title: 'Carregando...', employees: [] });

        try {
            const response = await apiClient.get('/api/rh/kpi-details', {
                params: { type, year: selectedYear, month: selectedMonth }
            });
            setKpiDetails(response.data);
        } catch (err) {
            console.error("Erro ao buscar detalhes do KPI:", err);
            setKpiDetails({ title: 'Erro ao carregar', employees: [] });
        } finally {
            setKpiLoading(false);
        }
    };


    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /> Carregando dashboard...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!dashboardData) {
        return <div className="text-center p-5"><Alert variant="warning">Nenhum dado para exibir no dashboard.</Alert></div>;
    }

    const { kpis, distribuicaoSetor, distribuicaoGenero, proximosAniversariantes, headcountEvolution, turnoverEvolution, recentRequests } = dashboardData;

    return (
        <div className="p-3">
            <div className="d-flex justify-content-end gap-2 mb-4">
                <Form.Select size="sm" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ width: '130px' }}>
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
                <Form.Select size="sm" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ width: '100px' }}>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </Form.Select>
            </div>

            {/* KPI Cards */}
            <Row xs={1} sm={2} lg={3} xl={5} className="g-4 mb-4 kpi-cards-row">
                <Col>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-muted font-weight-bold kpi-card-title-font">Colaboradores Ativos</span>
                                    <div onClick={() => handleKpiClick('totalColaboradores', kpis.totalColaboradores)} style={{ cursor: kpis.totalColaboradores > 0 ? 'pointer' : 'default' }} title={kpis.totalColaboradores > 0 ? 'Ver lista' : ''}>
                                        <h4 className="mt-1 mb-0 kpi-main-metric">{kpis.totalColaboradores}</h4>
                                    </div>
                                </div>
                                <div className="kpi-icon-circle kpi-icon-circle-blue"><FaUsers /></div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-muted font-weight-bold kpi-card-title-font">Admissões no Mês</span>
                                    <div onClick={() => handleKpiClick('admissoesMes', kpis.admissoesMes)} style={{ cursor: kpis.admissoesMes > 0 ? 'pointer' : 'default' }} title={kpis.admissoesMes > 0 ? 'Ver lista' : ''}>
                                        <h4 className="mt-1 mb-0 kpi-main-metric">{kpis.admissoesMes}</h4>
                                    </div>
                                </div>
                                <div className="kpi-icon-circle kpi-icon-circle-green"><FaUserPlus /></div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-muted font-weight-bold kpi-card-title-font">Desligamentos no Mês</span>
                                    <div onClick={() => handleKpiClick('desligamentosMes', kpis.desligamentosMes)} style={{ cursor: kpis.desligamentosMes > 0 ? 'pointer' : 'default' }} title={kpis.desligamentosMes > 0 ? 'Ver lista' : ''}>
                                        <h4 className="mt-1 mb-0 kpi-main-metric">{kpis.desligamentosMes}</h4>
                                    </div>
                                </div>
                                <div className="kpi-icon-circle kpi-icon-circle-red"><FaUserMinus /></div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-muted font-weight-bold kpi-card-title-font">Média de Idade</span>
                                    <h4 className="mt-1 mb-0 kpi-main-metric">{kpis.mediaIdade} anos</h4>
                                </div>
                                <div className="kpi-icon-circle kpi-icon-circle-cyan"><FaUserClock /></div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-muted font-weight-bold kpi-card-title-font">Aniversariantes do Mês</span>
                                    <div onClick={() => handleKpiClick('aniversariantesMes', kpis.aniversariantesMes)} style={{ cursor: kpis.aniversariantesMes > 0 ? 'pointer' : 'default' }} title={kpis.aniversariantesMes > 0 ? 'Ver lista' : ''}>
                                        <h4 className="mt-1 mb-0 kpi-main-metric">{kpis.aniversariantesMes}</h4>
                                    </div>
                                </div>
                                <div className="kpi-icon-circle kpi-icon-circle-purple"><FaBirthdayCake /></div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row className="g-4">
                <Col lg={6}>
                    <Card className="h-100">
                        <Card.Header className="fw-bold d-flex align-items-center gap-2"><FaChartPie /> Distribuição por Departamento</Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={distribuicaoSetor} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" name="Colaboradores" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card className="h-100">
                        <Card.Header className="fw-bold d-flex justify-content-between align-items-center">
                            <span className="d-flex align-items-center gap-2">
                                <FaClipboardCheck /> Solicitações Recentes
                            </span>
                            <Link to="/rh/beneficios?tab=solicitacoes" className="btn btn-sm btn-outline-primary">Ver Todas</Link>
                        </Card.Header>
                        <ListGroup variant="flush" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {recentRequests && recentRequests.length > 0 ? (
                                recentRequests.map(req => (
                                    <ListGroup.Item key={`req-${req.id}`} className="d-flex align-items-center gap-3 p-3">
                                        <Image src={req.user_pic || `https://ui-avatars.com/api/?name=${req.user_name}&background=random`} roundedCircle style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                                        <div>
                                            <div className="fw-bold">{req.description}</div>
                                            <div className="text-muted small">
                                                {new Date(req.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item className="text-muted p-3 text-center">Nenhuma solicitação pendente.</ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
                
            </Row>
            
            <Row className="g-4 mt-4">
                <Col lg={6}>
                    <Card className="h-100">
                        <Card.Header className="fw-bold d-flex align-items-center gap-2"><FaChartLine /> Evolução do Headcount (Últimos 12 Meses)</Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={headcountEvolution} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Colaboradores" stroke="#8884d8" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card>
                        <Card.Header className="fw-bold d-flex align-items-center gap-2"><FaSyncAlt /> Taxa de Turnover (Últimos 12 Meses)</Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={turnoverEvolution} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis unit="%" allowDecimals={false} />
                                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Taxa (%)" stroke="#ff8042" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mt-4">
                <Col lg={6}>
                    <Card className="h-100">
                        <Card.Header className="fw-bold d-flex align-items-center gap-2"><FaBirthdayCake /> Próximos Aniversariantes</Card.Header>
                        {proximosAniversariantes && proximosAniversariantes.length > 5 ? (
                            <Carousel indicators={false} interval={3000}>
                                {proximosAniversariantes.map(aniversariante => (
                                    <Carousel.Item key={aniversariante.id}>
                                        <div className="d-flex align-items-center gap-3 p-3">
                                            <Image src={aniversariante.userpic_url || `https://ui-avatars.com/api/?name=${aniversariante.nome_completo}&background=random`} roundedCircle style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                                            <div>
                                                <div className="fw-bold">{aniversariante.nome_completo}</div>
                                                <div className="text-muted small">{new Date(aniversariante.nextBirthday).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</div>
                                            </div>
                                        </div>
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        ) : (
                            <ListGroup variant="flush">
                                {proximosAniversariantes && proximosAniversariantes.length > 0 ? (
                                    proximosAniversariantes.map(aniversariante => (
                                        <ListGroup.Item key={aniversariante.id} className="d-flex align-items-center gap-3 p-3">
                                            <Image src={aniversariante.userpic_url || `https://ui-avatars.com/api/?name=${aniversariante.nome_completo}&background=random`} roundedCircle style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                                            <div>
                                                <div className="fw-bold">{aniversariante.nome_completo}</div>
                                                <div className="text-muted small">{new Date(aniversariante.nextBirthday).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</div>
                                            </div>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <ListGroup.Item className="text-muted p-3">Nenhum aniversariante próximo.</ListGroup.Item>
                                )}
                            </ListGroup>
                        )}
                    </Card>
                </Col>
                <Col lg={5}>
                    <Card className="h-100">
                        <Card.Header className="fw-bold d-flex align-items-center gap-2"><FaVenusMars /> Distribuição por Gênero</Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={distribuicaoGenero} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {distribuicaoGenero.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                
            </Row>

            <KpiDetailsModal
                show={showKpiModal}
                onHide={() => setShowKpiModal(false)}
                title={kpiDetails.title}
                employees={kpiDetails.employees}
                loading={kpiLoading}
            />
        </div>
    );
};

export default HRDashboardPage;