import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Tabs, Tab, Card, Row, Col, Spinner, Alert, ListGroup, Badge, Breadcrumb } from 'react-bootstrap';
import { FaArrowLeft, FaUser } from 'react-icons/fa';
import apiClient from '../../../services/api';

const EmployeeDetailsPage = () => {
    const { id: employeeId } = useParams(); // Pega o ID da URL
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            if (!employeeId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get(`/api/funcionarios/${employeeId}`);
                setEmployee(response.data);
            } catch (err) {
                console.error('Erro ao buscar detalhes do colaborador:', err);
                setError('Não foi possível carregar os detalhes do colaborador.');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeDetails();
    }, [employeeId]);

    const renderField = (label, value, isDate = false) => (
        <Col md={4} className="mb-3">
            <div className="text-muted small">{label}</div>
            <div className="fw-semibold">
                {isDate && value ? new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : (value || <span className="text-black-50">--</span>)}
            </div>
        </Col>
    );

    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /> Carregando...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!employee) {
        return <Alert variant="warning">Colaborador não encontrado.</Alert>;
    }

    return (
        <div className="container-main p-4">
            <Breadcrumb>
                <Breadcrumb.Item as={Link} to="/manage-employees">Gestão de Colaboradores</Breadcrumb.Item>
                <Breadcrumb.Item active>{employee.nome_completo}</Breadcrumb.Item>
            </Breadcrumb>

            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaUser /> Detalhes do Colaborador
                    </h2>
                    <p className="page-header-subtitle">Visualize as informações de {employee.nome_completo}.</p>
                </div>
                <div className="page-header-actions-wrapper">
                    <Link to="/manage-employees" className="btn btn-light">
                        <FaArrowLeft className="me-2" />
                        Voltar para a lista
                    </Link>
                </div>
            </div>

            <Tabs defaultActiveKey="pessoal" id="employee-details-tabs" className="mb-3">
                <Tab eventKey="pessoal" title="Pessoal">
                    <Row>
                        <Col lg={8}>
                            <Card className="mb-4">
                                <Card.Header className="fw-bold">Dados Pessoais</Card.Header>
                                <Card.Body>
                                    <Row>
                                        {renderField('Nome Completo', employee.nome_completo)}
                                        {renderField('Nome Social', employee.nome_social)}
                                        {renderField('Data de Nascimento', employee.data_nascimento, true)}
                                        {renderField('Nacionalidade', employee.nacionalidade)}
                                        {renderField('UF Natal', employee.uf_natal)}
                                        {renderField('Cidade Natal', employee.cidade_natal)}
                                        {renderField('Cor/Raça', employee.cor_raca)}
                                        {renderField('Gênero', employee.genero)}
                                        {renderField('Gênero no Documento', employee.genero_documento)}
                                        {renderField('Estado Civil', employee.estado_civil)}
                                        {renderField('Nome da Mãe', employee.nome_mae)}
                                        {renderField('Nome do Pai', employee.nome_pai)}
                                    </Row>
                                </Card.Body>
                            </Card>

                            <Card className="mb-4">
                                <Card.Header className="fw-bold">Formação Acadêmica</Card.Header>
                                <ListGroup variant="flush">
                                    {employee.formacoes && employee.formacoes.length > 0 ? (
                                        employee.formacoes.map(formacao => (
                                            <ListGroup.Item key={formacao.id}>
                                                <div className="d-flex justify-content-between">
                                                    <span className="fw-bold">{formacao.titulo_curso || 'Não especificado'}</span>
                                                    <Badge bg="secondary">{formacao.ano_conclusao}</Badge>
                                                </div>
                                                <div>{formacao.instituicao_ensino}</div>
                                                <div className="text-muted small">{formacao.curso}</div>
                                            </ListGroup.Item>
                                        ))
                                    ) : (
                                        <ListGroup.Item className="text-muted">Nenhuma formação acadêmica cadastrada.</ListGroup.Item>
                                    )}
                                </ListGroup>
                            </Card>
                        </Col>
                        <Col lg={4}>
                            <Card className="mb-4">
                                <Card.Header className="fw-bold">Dados Bancários</Card.Header>
                                <Card.Body>
                                    <Row>
                                        {renderField('Banco', employee.banco)}
                                        {renderField('Tipo de Conta', employee.tipo_conta_bancaria)}
                                        {renderField('Agência', employee.agencia)}
                                        {renderField('Conta', employee.conta)}
                                        {renderField('Tipo de Chave PIX', employee.chave_pix_tipo)}
                                        {renderField('Chave PIX', employee.chave_pix)}
                                    </Row>
                                </Card.Body>
                            </Card>
                            <Card className="mb-4">
                                <Card.Header className="fw-bold">Pessoa com Deficiência (PCD)</Card.Header>
                                <Card.Body>
                                    <Row>
                                        {renderField('Possui Deficiência?', employee.pcd ? 'Sim' : 'Não')}
                                        {employee.pcd && renderField('Tipo', employee.pcd_tipo)}
                                        {employee.pcd && (
                                            <Col xs={12}>
                                                <div className="text-muted small">Observações</div>
                                                <p>{employee.pcd_observacoes || '--'}</p>
                                            </Col>
                                        )}
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
                <Tab eventKey="profissional" title="Profissional">
                    <Alert variant="info">ABA 2 (Profissional) - A ser implementada na sequência.</Alert>
                </Tab>
            </Tabs>
        </div>
    );
};

export default EmployeeDetailsPage;

