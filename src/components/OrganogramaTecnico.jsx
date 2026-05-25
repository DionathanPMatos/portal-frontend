import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaUserTie, FaIndustry } from 'react-icons/fa';
import axios from 'axios';
import '../App.css';

const OrganogramaTecnico = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Função para formatar nomes
const formatarNome = (nome) => {
        // A verificação de segurança que previne o erro
        if (!nome) return ''; 
        return nome.toLowerCase().split(' ').map(palavra => 
            palavra.charAt(0).toUpperCase() + palavra.slice(1)
        ).join(' ');
    };

    // Função auxiliar para limpar número e criar o link direto do WhatsApp
    const formatarWhatsApp = (numero) => {
        if (!numero) return '';
        const apenasNumeros = numero.replace(/\D/g, ''); // Remove parênteses, traços e espaços
        // Adiciona "55" (Brasil) se o número não tiver o código do país
        return apenasNumeros.length <= 11 ? `55${apenasNumeros}` : apenasNumeros;
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/funcionarios-tecnicos');
            setEmployees(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Erro ao buscar o organograma.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    if (loading) {
        return (
            <div className="dash-grid">
                <div className="container-main p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="text-center text-muted">
                        <Spinner animation="border" className="mb-3 text-primary" />
                        <h5>Carregando organograma...</h5>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dash-grid">
                <div className="container-main p-4"><Alert variant="danger">{error}</Alert></div>
            </div>
        );
    }

    // Filtragem por Busca de Texto (Nome do Gerente ou Nome da Marca)
    const filteredEmployees = employees.filter(emp => {
        const searchLower = searchTerm.toLowerCase();
        const nome = emp.nome_completo ? emp.nome_completo.toLowerCase() : '';
        const marcas = emp.fabricantes_nomes ? emp.fabricantes_nomes.toLowerCase() : '';
        return nome.includes(searchLower) || marcas.includes(searchLower);
    });

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <Container fluid className="px-0">
                    
                    {/* Header da Página */}
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h2 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                                <FaUserTie className="text-primary" /> Organograma Técnico
                            </h2>
                            <p className="text-muted mb-0">Conheça os gerentes de produto e as marcas que representam.</p>
                        </div>
                    </div>

                    {/* Filtro de Busca */}
                    <Row className="mb-4">
                        <Col md={6} lg={4}>
                            <InputGroup className="shadow-sm">
                                <InputGroup.Text className="bg-white border-end-0">
                                    <FaSearch className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control 
                                    placeholder="Buscar por gerente ou fabricante..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="border-start-0 ps-0 shadow-none" 
                                />
                            </InputGroup>
                        </Col>
                    </Row>

                    <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((employee) => (
                                <Col key={employee.id}>
                                    <Card className="h-100 text-center shadow-sm border-0" 
                                          style={{ transition: 'transform 0.2s, box-shadow 0.2s', borderRadius: '12px' }}
                                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; }}
                                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; }}>
                                        
                                        <div className="pt-4 pb-3" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                                            <img 
                                                src={employee.userpic_base64 || 'default-avatar.png'} 
                                                alt={formatarNome(employee.nome_completo)}
                                                className="border border-4 border-white shadow-sm"
                                                style={{ 
                                                    width: '110px', 
                                                    height: '110px', 
                                                    borderRadius: '50%', 
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                        <Card.Body className="d-flex flex-column p-4">
                                            <Card.Title className="fw-bold text-dark mb-1 fs-5">{formatarNome(employee.nome_completo)}</Card.Title>
                                            <Card.Subtitle className="mb-3 text-muted small text-uppercase fw-semibold">{employee.setor}</Card.Subtitle>
                                            
                                            {/* Informações adicionais do Colaborador */}
                                            <div className="mt-2 text-start">
                                                <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>
                                                    <strong>Cargo:</strong> {employee.cargo || 'Não informado'}
                                                </p>
                                                <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>
                                                    <strong>E-mail:</strong> {employee.email || 'Não informado'}
                                                </p>
                                                <p className="mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                                    <strong>Contato:</strong> {employee.contato || 'Não informado'}
                                                </p>
                                            </div>

                                            {/* Botões de Ação Rápida */}
                                            <div className="d-flex justify-content-center gap-2 mt-3 pt-3 border-top mb-3">
                                                {/* Botão do WhatsApp */}
                                                {employee.contato && (
                                                    <a 
                                                        href={`https://wa.me/${formatarWhatsApp(employee.contato)}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="btn btn-success btn-sm text-white d-flex align-items-center gap-1 shadow-sm w-100 justify-content-center fw-semibold" 
                                                        title="Enviar mensagem no WhatsApp"
                                                    >
                                                        <i class="fa-brands fa-whatsapp"></i> WhatsApp
                                                    </a>
                                                )}
                                                
                                                {/* Botão do Microsoft Teams */}
                                                {employee.email && (
                                                    <a 
                                                        href={`https://teams.microsoft.com/l/chat/0/0?users=${employee.email}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="btn btn-primary btn-sm d-flex text-white align-items-center gap-1 shadow-sm w-100 justify-content-center fw-semibold"
                                                        title="Conversar no Teams"
                                                    >
                                                        Teams
                                                    </a>
                                                )}
                                            </div>

                                            <div className="mt-auto pt-3 border-top">
                                                <div className="text-muted small mb-3 d-flex align-items-center justify-content-center gap-2 fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                                                    <FaIndustry /> Marcas Representadas
                                                </div>
                                                <div className="d-flex flex-wrap justify-content-center gap-2">
                                                    {employee.fabricantes_nomes ? (
                                                        employee.fabricantes_nomes.split(', ').map(fab => (
                                                            <span key={fab} className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1 shadow-sm" style={{ fontSize: '0.75rem' }}>
                                                                {fab}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted small fst-italic">Nenhuma marca vinculada</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col xs={12}>
                                <Alert variant="info" className="text-center p-4">
                                    Nenhum gerente ou marca encontrado para a sua busca.
                                </Alert>
                            </Col>
                        )}
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default OrganogramaTecnico;