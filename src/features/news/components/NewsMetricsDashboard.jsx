import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../../../services/api';
import { FaEye, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const NewsMetricsDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setLoading(true);
                const { data } = await apiClient.get('/api/noticias/metrics');
                setMetrics(data);
            } catch (err) {
                setError('Falha ao carregar as métricas de engajamento.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <Row className="g-4">
            <Col xs={12}>
                <Card className="shadow-sm">
                    <Card.Body className="text-center">
                        <FaEye size={30} className="text-primary mb-2" />
                        <Card.Title as="h5">Total de Visualizações Únicas</Card.Title>
                        <Card.Text className="fs-2 fw-bold">{metrics?.totalViews || 0}</Card.Text>
                        <Card.Text className="text-muted small">Soma de todas as visualizações únicas em notícias publicadas.</Card.Text>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={6}>
                <Card className="shadow-sm h-100">
                    <Card.Header as="h5" className="d-flex align-items-center gap-2 bg-light">
                        <FaArrowUp className="text-success" /> Mais Vistas (Top 5)
                    </Card.Header>
                    <ListGroup variant="flush">
                        {metrics?.mostViewed?.map(item => (
                            <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                                <span className="text-truncate" title={item.titulo}>{item.titulo}</span>
                                <Badge bg="success" pill>{item.view_count} views</Badge>
                            </ListGroup.Item>
                        ))}
                        {metrics?.mostViewed?.length === 0 && <ListGroup.Item className="text-muted text-center">Nenhum dado para exibir.</ListGroup.Item>}
                    </ListGroup>
                </Card>
            </Col>

            <Col md={6}>
                <Card className="shadow-sm h-100">
                    <Card.Header as="h5" className="d-flex align-items-center gap-2 bg-light">
                        <FaArrowDown className="text-danger" /> Menos Vistas (Top 5)
                    </Card.Header>
                    <ListGroup variant="flush">
                        {metrics?.leastViewed?.map(item => (
                            <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                                <span className="text-truncate" title={item.titulo}>{item.titulo}</span>
                                <Badge bg="danger" pill>{item.view_count} views</Badge>
                            </ListGroup.Item>
                        ))}
                        {metrics?.leastViewed?.length === 0 && <ListGroup.Item className="text-muted text-center">Nenhum dado para exibir.</ListGroup.Item>}
                    </ListGroup>
                </Card>
            </Col>

            <Col xs={12}>
                <Card className="shadow-sm">
                    <Card.Header as="h5" className="bg-light">Visualizações por Categoria</Card.Header>
                    <Card.Body>
                        {metrics?.viewsPerCategory?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={metrics?.viewsPerCategory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category_name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="view_count" fill="#8884d8" name="Visualizações" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted text-center p-5">Nenhuma visualização registrada em notícias com categoria.</p>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default NewsMetricsDashboard;