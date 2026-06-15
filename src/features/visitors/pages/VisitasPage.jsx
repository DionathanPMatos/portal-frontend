import React from 'react';
import { Container, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import PainelVendedorPage from './PainelVendedorPage'; // Renomeado
import PainelGestorPage from './PainelGestorPage'; // Renomeado
import DashboardVisitasPage from './DashboardVisitasPage'; // Renomeado
import { FaMapMarkedAlt } from 'react-icons/fa';
import '../../../styles/App.css'; // Caminho ajustado para o CSS global

export default function VisitasPage({ user }) { // Renomeado
    const privilegios = user?.privilegios?.toLowerCase() || '';
    const isManager = privilegios.includes('admin') || privilegios.includes('gestor');

    return (
        <div className='container-main p-4'>
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaMapMarkedAlt /> Painel de Visitas Comerciais
                    </h2>
                    <p className="page-header-subtitle">Monitore o fluxo de agendamentos, o volume de visitas autorizadas e a produtividade da força de vendas.</p>
                </div>
            </div>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>

                            <Tabs defaultActiveKey={isManager ? "dashboard" : "minhas-visitas"} className="mb-4">
                                {isManager && (
                                    <Tab eventKey="dashboard" title="Dashboard">
                                        <DashboardVisitasPage />
                                    </Tab>
                                )}
                                {isManager && (
                                    <Tab eventKey="gestao" title="Gestão de Visitas">
                                        <PainelGestorPage />
                                    </Tab>
                                )}
                                <Tab eventKey="minhas-visitas" title="Minhas Visitas">
                                    <PainelVendedorPage />
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
        </div>
    );
}