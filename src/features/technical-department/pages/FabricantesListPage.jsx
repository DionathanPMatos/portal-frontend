import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, InputGroup, Form } from 'react-bootstrap';
import { FaSearch, FaIndustry } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import apiClient from '../../../services/api'; // Importa a instância configurada do Axios

const FabricantesListPage = () => { // Renomeado
    const [fabricantes, setFabricantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchFabricantes = async () => {
            try {
                const response = await apiClient.get('/api/fabricantes');
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
        <div className='container-main p-4'>
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaIndustry /> Portfólio de Fabricantes
                    </h2>
                    <p className="page-header-subtitle">Nossas Marcas. Conheça mais sobre cada marca que compõe o nosso portfólio.</p>
                </div>
            </div>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col lg={6}>
                            <div className="header-search-container">
                                <FaSearch className="search-icon" />
                                <Form.Control
                                    type="text"
                                    className="search-input"
                                    placeholder="Buscar fabricante..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {loading ? (
                <div className="dash-grid">
                    <div className='container-main'>
                        <div className="mt-5 text-center"><Spinner animation="border" variant="primary" /></div>
                    </div>
                </div>
            ) : (
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {filteredFabricantes.map(fab => (
                        <Col key={fab.id}>
                            <Card as={Link} to={`/dtc/fabricantes/${fab.id}`} className="h-100 text-center shadow-sm border text-decoration-none" style={{ transition: 'transform 0.2s', borderRadius: '12px' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                                    {fab.logo_url ? (
                                        <img src={fab.logo_url} alt={`Logo ${fab.name}`} style={{ height: '80px', width: '100%', objectFit: 'contain', marginBottom: '15px' }} />
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
        </div>
    );
};
export default FabricantesListPage; // Exporta o nome atualizado