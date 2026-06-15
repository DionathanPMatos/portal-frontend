import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Card, Form } from 'react-bootstrap';
import { FaUserTie, FaSearch } from 'react-icons/fa';
import apiClient from '../../../services/api';
import "../../../styles/Header.css";


const Funcionarios = () => {
    // Estado para guardar os funcionários já agrupados pelo backend
    const [groupedEmployees, setGroupedEmployees] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Novos estados para os filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSetor, setSelectedSetor] = useState('');
    const [selectedCargo, setSelectedCargo] = useState('');

    // Função para formatar os nomes, como fizemos antes
    const formatarNome = (nome) => {
        if (!nome) return '';
        return nome.toLowerCase().split(' ').map(palavra =>
            palavra.charAt(0).toUpperCase() + palavra.slice(1)
        ).join(' ');
    };

    useEffect(() => {
        const fetchGroupedEmployees = async () => {
            try {
                // Chama a nova rota que criamos no backend
                const response = await apiClient.get('/api/funcionarios/agrupados');
                setGroupedEmployees(response.data);
            } catch (err) { 
                console.error('Erro ao buscar funcionários:', err);
                setError('Não foi possível carregar a lista de funcionários.');
            } finally {
                setLoading(false);
            }
        };

        fetchGroupedEmployees();
    }, []); // Executa apenas uma vez, quando o componente é montado

    if (loading) {
        return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    // Obter listas únicas de setores e cargos baseadas nos dados recebidos
    const setoresList = Object.keys(groupedEmployees).sort();
    const allCargos = new Set();
    Object.values(groupedEmployees).forEach(emps => {
        emps.forEach(emp => {
            if (emp.nome_cargo) allCargos.add(emp.nome_cargo);
        });
    });
    const cargosList = Array.from(allCargos).sort();

    // Aplicação dos filtros dinamicamente
    const filteredGroups = {};
    Object.keys(groupedEmployees).forEach(setor => {
        if (selectedSetor && setor !== selectedSetor) return;

        const filteredEmps = groupedEmployees[setor].filter(emp => {
            const matchesSearch = searchTerm === '' ||
                formatarNome(emp.nome_completo).toLowerCase().includes(searchTerm.toLowerCase()) ||
                (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCargo = selectedCargo === '' || emp.nome_cargo === selectedCargo;

            return matchesSearch && matchesCargo;
        });

        if (filteredEmps.length > 0) {
            filteredGroups[setor] = filteredEmps;
        }
    });

    return (
        <Container fluid className="px-4">
            <Row>
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Header>
                            <Card.Title as="h4"> <FaUserTie />&nbsp;Colaboradores</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {/* Cabecalho da página */}
                            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                <div>
                                    <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                                        Conheça nossa equipe e a estrutura organizacional corporativa.
                                    </h4>
                                </div>
                            </div>
                        

                            {/* Filtros de Busca */}
                            <Row className="mb-4 g-3">
                                <Col md={12} lg={4}>
                                    <div className="header-search-container">
                                        <FaSearch className="search-icon" />
                                        <Form.Control
                                            type="text"
                                            className="search-input"
                                            placeholder="Buscar por nome ou e-mail..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </Col>
                                <Col md={6} lg={4}>
                                    <Form.Select
                                        className="shadow-sm shadow-none"
                                        value={selectedSetor}
                                        onChange={(e) => setSelectedSetor(e.target.value)}
                                    >
                                        <option value="">Todos os Setores</option>
                                        {setoresList.map(setor => (
                                            <option key={setor} value={setor}>{setor}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={6} lg={4}>
                                    <Form.Select
                                        className="shadow-sm shadow-none"
                                        value={selectedCargo}
                                        onChange={(e) => setSelectedCargo(e.target.value)}
                                    >
                                        <option value="">Todos os Cargos</option>
                                        {cargosList.map(cargo => (
                                            <option key={cargo} value={cargo}>{cargo}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Row>

                            <div className="mb-4">
                                {Object.keys(filteredGroups).length === 0 ? (
                                    <Alert variant="info" className="text-center p-4 shadow-sm">
                                        Nenhum colaborador encontrado para os filtros informados.
                                    </Alert>
                                ) : (
                                    /* Percorre as chaves do objeto (os nomes dos setores) já filtrados */
                                    Object.keys(filteredGroups).map(setor => (
                                        <div key={setor} className="mb-5">
                                            <h3 className="mb-3 text-muted text-uppercase fs-5 fw-bold" style={{ borderBottom: '2px solid #e9ecef', paddingBottom: '5px' }}>{setor}</h3>
                                            <div className="d-flex flex-wrap gap-3">
                                                {/* Para cada setor, percorre o array de funcionários */}
                                                {filteredGroups[setor].map(employee => (
                                                    <Card key={employee.id} className="shadow-sm border-0 h-100" style={{ width: '18rem', borderRadius: '12px' }}>
                                                        <Card.Body>
                                                            <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                                                                <img
                                                                    src={employee.userpic_url || 'default-avatar.png'}
                                                                    alt={formatarNome(employee.nome_completo)}
                                                                    className="me-3 shadow-sm border"
                                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%' }}
                                                                />
                                                                <div>
                                                                    <Card.Title className="fs-6 fw-bold mb-1">{formatarNome(employee.nome_completo)}</Card.Title>
                                                                    <Card.Subtitle className="mb-0 text-muted small text-uppercase">{employee.nome_cargo || 'Não definido'}</Card.Subtitle>
                                                                </div>
                                                            </div>
                                                            <Card.Text className="text-muted small">
                                                                <div className="mb-1"><i className="bi bi-envelope-fill me-2"></i>{employee.email || 'Não informado'}</div>
                                                                <div><i className="bi bi-telephone-fill me-2"></i>{employee.contato || 'Não informado'}</div>
                                                            </Card.Text>
                                                        </Card.Body>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>

    );
};

export default Funcionarios;