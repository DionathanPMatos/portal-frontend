import React from 'react';
import { Container, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import PainelVendedor from './PainelVendedor';
import PainelGestor from './PainelGestor';
import DashboardVisitas from './DashboardVisitas';
import { FaMapMarkedAlt } from 'react-icons/fa';
import '../../App.css';

export default function Visitas({ user }) {
    const isManager = user?.privilegios?.includes('Admin') || user?.privilegios?.includes('Gestor');

    return (
        <Container fluid className="px-4">
            <Row>
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Header>
                            <Card.Title  as="h4"> <FaMapMarkedAlt />&nbsp;Painel de Visitas Comerciais</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {/* Header Padrão do Sistema */}
                            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                <div>
                                    <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                                         Monitore o fluxo de agendamentos, o volume de visitas autorizadas e a produtividade da força de vendas.
                                    </h4>
                                    <p className="text-muted mb-0">Acompanhe as métricas e gerencie as solicitações de visitas a clientes.</p>
                                </div>
                            </div>

                            <Tabs defaultActiveKey={isManager ? "dashboard" : "minhas-visitas"} className="mb-4">
                                {isManager && (
                                    <Tab eventKey="dashboard" title="Dashboard">
                                        <DashboardVisitas />
                                    </Tab>
                                )}
                                {isManager && (
                                    <Tab eventKey="gestao" title="Gestão de Visitas">
                                        <PainelGestor />
                                    </Tab>
                                )}
                                <Tab eventKey="minhas-visitas" title="Minhas Visitas">
                                    <PainelVendedor />
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}