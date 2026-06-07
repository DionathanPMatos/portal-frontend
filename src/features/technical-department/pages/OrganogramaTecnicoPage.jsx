import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaUserTie, FaIndustry, FaUsers } from 'react-icons/fa';
import apiClient from '../../../services/api'; // Importa a instância configurada do Axios
// import '../../../styles/App.css'; // Removido: estilos globais devem ser importados apenas em main.jsx ou App.jsx

const OrganogramaTecnicoPage = () => { // Renomeado
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
            const response = await apiClient.get('/api/funcionarios-tecnicos');
            setEmployees(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Erro ao buscar o organograma:', err);
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

    // Agrupa os funcionários em hierarquias com base no nome do Cargo
    const diretores = [];
    const supervisores = [];
    const equipe = [];

    filteredEmployees.forEach(emp => {
        const cargo = emp.cargo ? emp.cargo.toLowerCase() : '';
        if (cargo.includes('diretor') || cargo.includes('head') || cargo.includes('ceo')) {
            diretores.push(emp);
        } else if (cargo.includes('supervisor') || cargo.includes('coordenador') || cargo.includes('gestor')) {
            supervisores.push(emp);
        } else {
            equipe.push(emp);
        }
    });

    // Filtra quem não tem gestor atrelado para exibir na base da tela
    const semGestor = equipe.filter(emp => !emp.gestor_id || !supervisores.some(sup => sup.id === emp.gestor_id));

    // Função para renderizar o Card do Colaborador (Evita repetição de código)
    const renderEmployeeCard = (employee, isCompact = false) => (
        <Card className="h-100 text-center shadow-sm border-0" 
              style={{ transition: 'transform 0.2s, box-shadow 0.2s', borderRadius: '12px' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; }}>
            
            <div className={`pt-${isCompact ? '3' : '4'} pb-${isCompact ? '2' : '3'}`} style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                <img 
                    src={employee.userpic_url || 'default-avatar.png'} 
                    alt={formatarNome(employee.nome_completo)}
                    className="border border-4 border-white shadow-sm"
                    style={{ width: isCompact ? '70px' : '110px', height: isCompact ? '70px' : '110px', borderRadius: '50%', objectFit: 'cover' }}
                />
            </div>
            <Card.Body className={`d-flex flex-column p-${isCompact ? '3' : '4'}`}>
                <Card.Title className={`fw-bold text-dark mb-1 ${isCompact ? 'fs-6' : 'fs-5'}`}>{formatarNome(employee.nome_completo)}</Card.Title>
                <Card.Subtitle className={`mb-${isCompact ? '2' : '3'} text-muted small text-uppercase fw-semibold`} style={{ fontSize: isCompact ? '0.7rem' : '' }}>{employee.setor}</Card.Subtitle>
                
                <div className="mt-2 text-start">
                    <p className="mb-1 text-muted" style={{ fontSize: isCompact ? '0.75rem' : '0.85rem' }}><strong>Cargo:</strong> {employee.cargo || 'Não informado'}</p>
                    <p className="mb-1 text-muted text-truncate" style={{ fontSize: isCompact ? '0.75rem' : '0.85rem' }} title={employee.email}><strong>E-mail:</strong> {employee.email || 'Não informado'}</p>
                    <p className={`mb-${isCompact ? '1' : '2'} text-muted`} style={{ fontSize: isCompact ? '0.75rem' : '0.85rem' }}><strong>Contato:</strong> {employee.contato || 'Não informado'}</p>
                </div>

                <div className={`d-flex justify-content-center gap-2 mt-${isCompact ? '2' : '3'} pt-${isCompact ? '2' : '3'} border-top mb-${isCompact ? '2' : '3'}`}>
                    {employee.contato && (
                        <a href={`https://wa.me/${formatarWhatsApp(employee.contato)}`} target="_blank" rel="noopener noreferrer" 
                           className={`btn btn-success ${isCompact ? 'btn-sm py-1 px-2' : 'btn-sm'} text-white d-flex align-items-center gap-1 shadow-sm w-100 justify-content-center fw-semibold`} 
                           title="Enviar mensagem no WhatsApp" style={{ fontSize: isCompact ? '0.75rem' : '' }}>
                            <i className="fa-brands fa-whatsapp"></i> {isCompact ? 'Whats' : 'WhatsApp'}
                        </a>
                    )}
                    {employee.email && (
                        <a href={`https://teams.microsoft.com/l/chat/0/0?users=${employee.email}`} target="_blank" rel="noopener noreferrer" 
                           className={`btn btn-primary ${isCompact ? 'btn-sm py-1 px-2' : 'btn-sm'} d-flex text-white align-items-center gap-1 shadow-sm w-100 justify-content-center fw-semibold`}
                           title="Conversar no Teams" style={{ fontSize: isCompact ? '0.75rem' : '' }}>
                            Teams
                        </a>
                    )}
                </div>

                <div className={`mt-auto pt-${isCompact ? '2' : '3'} border-top`}>
                    <div className={`text-muted small mb-${isCompact ? '2' : '3'} d-flex align-items-center justify-content-center gap-2 fw-bold text-uppercase`} style={{ letterSpacing: '0.5px', fontSize: isCompact ? '0.7rem' : '' }}>
                        <FaIndustry /> Marcas Representadas
                    </div>
                    <div className="d-flex flex-wrap justify-content-center gap-1">
                        {employee.fabricantes_nomes ? (
                            employee.fabricantes_nomes.split(', ').map(fab => (
                                <span key={fab} className="badge bg-primary bg-gradient shadow-sm border border-primary" style={{ fontSize: isCompact ? '0.65rem' : '0.75rem', padding: isCompact ? '0.3em 0.5em' : '0.4em 0.6em', backgroundColor: '#0f4c81' }}>{fab}</span>
                            ))
                        ) : (
                            <span className="text-muted small fst-italic" style={{ fontSize: isCompact ? '0.7rem' : '' }}>Nenhuma marca vinculada</span>
                        )}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );

    return (
            
                <Container fluid className="px-4">
                    <Row>
                        <Col>
                        <Card className="shadow-sm border-0">
                        <Card.Header>
                            <Card.Title as="h4"> <FaUserTie />&nbsp;Departamento Técnico</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {/* Cabecalho da página */}
                            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                <div>
                                    <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                                        Conheça os gerentes de produto e as marcas que representam.


                                    </h4>
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

                            {/* Exibição em Árvore Hierárquica */}
                            <div className="organograma-wrapper text-center">
                                
                                {/* Camada 1: Diretoria */}
                                {diretores.length > 0 && (
                                    <div className="tier-diretoria mb-3">
                                        <h5 className="text-muted mb-4 fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Diretoria</h5>
                                        <Row className="justify-content-center g-4">
                                            {diretores.map(emp => <Col md={6} lg={4} xl={3} key={emp.id}>{renderEmployeeCard(emp)}</Col>)}
                                        </Row>
                                        {/* Linha de conexão vertical */}
                                        {(supervisores.length > 0 || equipe.length > 0) && (
                                            <div className="mx-auto mt-4" style={{ width: '3px', height: '40px', backgroundColor: '#dee2e6' }}></div>
                                        )}
                                    </div>
                                )}

                                {/* Camada 2: Supervisão e suas Equipes */}
                                {supervisores.length > 0 && (
                                    <div className="tier-supervisao mb-3">
                                        <h5 className="text-muted mb-4 mt-3 fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Supervisão</h5>
                                        <Row className="justify-content-center align-items-start g-4">
                                            {supervisores.map(sup => {
                                                const subordinados = equipe.filter(emp => emp.gestor_id === sup.id);
                                                return (
                                                    <Col md={12} lg={6} xl={6} key={sup.id} className="d-flex flex-column align-items-center mb-5">
                                                        {/* Card do Supervisor */}
                                                        <div style={{ width: '100%', minWidth: '280px', maxWidth: '350px' }}>
                                                            {renderEmployeeCard(sup, false)}
                                                        </div>
                                                        
                                                        {/* Árvore de Subordinados */}
                                                        {subordinados.length > 0 && (
                                                            <>
                                                                <div style={{ width: '3px', height: '30px', backgroundColor: '#dee2e6' }}></div>
                                                                <div className="p-3 bg-light rounded-4 w-100 shadow-sm border border-2 border-light">
                                                                    <h6 className="text-muted mb-3 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                                                                        <FaUsers /> Equipe de {formatarNome(sup.nome_completo.split(' ')[0])}
                                                                    </h6>
                                                                    <Row className="justify-content-center g-2">
                                                                        {subordinados.map(sub => (
                                                                            <Col sm={12} md={12} lg={12} xl={6} key={sub.id}>
                                                                                {renderEmployeeCard(sub, true)}
                                                                            </Col>
                                                                        ))}
                                                                    </Row>
                                                                </div>
                                                            </>
                                                        )}
                                                    </Col>
                                                );
                                            })}
                                        </Row>
                                    </div>
                                )}

                                {/* Camada 3: Gerentes / Especialistas sem Supervisor atrelado */}
                                {semGestor.length > 0 && (
                                    <div className="tier-gerencia mt-4 pt-4 border-top">
                                        <h5 className="text-muted mb-4 mt-2 fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Demais Especialistas e Gerentes</h5>
                                        <Row className="justify-content-center g-4">
                                            {semGestor.map(emp => <Col md={6} lg={4} xl={3} key={emp.id}>{renderEmployeeCard(emp)}</Col>)}
                                        </Row>
                                    </div>
                                )}

                                {/* Caso de busca vazia */}
                                {diretores.length === 0 && supervisores.length === 0 && equipe.length === 0 && (
                                    <Alert variant="info" className="text-center p-4 shadow-sm">
                                        Nenhum colaborador ou marca encontrada para a sua busca.
                                    </Alert>
                                )}
                            </div>

                        </Card.Body>
                    </Card>
                        </Col>
                    </Row>
                </Container>
            
        
          
    );
};

export default OrganogramaTecnicoPage; // Exporta o nome atualizado