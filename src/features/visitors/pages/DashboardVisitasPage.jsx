import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiClient from '../../../services/api'; // Importa a instância configurada do Axios

export default function DashboardVisitasPage() { // Renomeado
    const [metrics, setMetrics] = useState(null);
    const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
    const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());

    const meses = [
        { valor: 'todos', label: 'Ano Inteiro' },
        { valor: 1, label: 'Janeiro' },
        { valor: 2, label: 'Fevereiro' },
        { valor: 3, label: 'Março' },
        { valor: 4, label: 'Abril' },
        { valor: 5, label: 'Maio' },
        { valor: 6, label: 'Junho' },
        { valor: 7, label: 'Julho' },
        { valor: 8, label: 'Agosto' },
        { valor: 9, label: 'Setembro' },
        { valor: 10, label: 'Outubro' },
        { valor: 11, label: 'Novembro' },
        { valor: 12, label: 'Dezembro' }
    ];

    const anos = [];
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual - 2; i <= anoAtual + 1; i++) {
        anos.push(i);
    }

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const { data } = await apiClient.get('/api/visitas/dashboard', {
                    params: { mes: filtroMes, ano: filtroAno }
                });
                setMetrics(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchMetrics();
    }, [filtroMes, filtroAno]);

    if (!metrics) return <div>Carregando dashboard...</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Painel de Indicadores</h4>
                <div className="d-flex gap-2">
                    <Form.Select size="sm" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} style={{ width: '150px' }}>
                        {meses.map(m => <option key={m.valor} value={m.valor}>{m.label}</option>)}
                    </Form.Select>
                    <Form.Select size="sm" value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)} style={{ width: '100px' }}>
                        {anos.map(a => <option key={a} value={a}>{a}</option>)}
                    </Form.Select>
                </div>
            </div>
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center shadow-sm border-0 border-start border-4 border-primary">
                        <Card.Body>
                            <h6 className="text-muted">Total Solicitadas</h6>
                            <h3 className="mb-0 fw-bold">{metrics.kpis?.total_visitas || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm border-0 border-start border-4 border-warning">
                        <Card.Body>
                            <h6 className="text-muted">Pendentes</h6>
                            <h3 className="mb-0 fw-bold">{metrics.kpis?.pendentes || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm border-0 border-start border-4 border-success">
                        <Card.Body>
                            <h6 className="text-muted">Autorizadas</h6>
                            <h3 className="mb-0 fw-bold">{metrics.kpis?.autorizadas || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm border-0 border-start border-4 border-danger">
                        <Card.Body>
                            <h6 className="text-muted">Recusadas</h6>
                            <h3 className="mb-0 fw-bold">{metrics.kpis?.recusadas || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm">
                <Card.Body>
                    <h5>Visitas Autorizadas por Vendedor</h5>
                    {metrics.ranking && metrics.ranking.length > 0 ? (
                        <div style={{ width: '100%', height: Math.max(300, metrics.ranking.length * 50) }}>
                            <ResponsiveContainer>
                                <BarChart data={metrics.ranking} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis dataKey="vendedor" type="category" width={120} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="total_visitas" name="Visitas" fill="#0d6efd" radius={[0, 4, 4, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-muted text-center mt-4">Dados insuficientes para gerar o gráfico.</p>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}