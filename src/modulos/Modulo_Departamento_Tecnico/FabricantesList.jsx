import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, InputGroup, Form } from 'react-bootstrap';
import { FaSearch, FaIndustry } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const FabricantesList = () => {
    const [fabricantes, setFabricantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchFabricantes = async () => {
            try {
                const response = await axios.get('/api/fabricantes');
                setFabricantes(response.data);
            } catch (err) {
                console.error("Erro ao buscar fabricantes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFabricantes();
    }, []);

    const filteredFabricantes = fabricantes.filter(fab =>
        fab.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
           
                <Container fluid className="px-0">
                    <Row>
                        <Col>
                            <Card className="shadow-sm border-0">
                                <Card.Header>
                                    <Card.Title as="h4"> <FaIndustry />&nbsp;Portfólio de Fabricantes</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                        <div>
                                            <h4 className="fw-bold mb-1 text-dark">
                                                Nossas Marcas
                                            </h4>
                                            <p className="text-muted mb-0">Conheça mais sobre cada marca que compõe o nosso portfólio.</p>
                                        </div>
                                    </div>

                                    <Row className="mb-4">
                                        <Col md={6} lg={4}>
                                            <InputGroup className="shadow-sm">
                                                <InputGroup.Text className="bg-white border-end-0">
                                                    <FaSearch className="text-muted" />
                                                </InputGroup.Text>
                                                <Form.Control
                                                    placeholder="Buscar fabricante..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="border-start-0 ps-0 shadow-none"
                                                />
                                            </InputGroup>
                                        </Col>
                                    </Row>

                                    {loading ? (
                                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                                    ) : (
                                        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                                            {filteredFabricantes.map(fab => (
                                                <Col key={fab.id}>
                                                    <Card as={Link} to={`/dtc/fabricantes/${fab.id}`} className="h-100 text-center shadow-sm border text-decoration-none" style={{ transition: 'transform 0.2s', borderRadius: '12px' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                                                        <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                                                            {fab.logo_base64 ? (
                                                                <img src={fab.logo_base64} alt={`Logo ${fab.name}`} style={{ height: '80px', width: '100%', objectFit: 'contain', marginBottom: '15px' }} />
                                                            ) : (
                                                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}><FaIndustry size={30} className="text-muted" /></div>
                                                            )}
                                                            <Card.Title className="fw-bold text-dark fs-5 mb-0">{fab.name}</Card.Title>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            
    
    );
};
export default FabricantesList;