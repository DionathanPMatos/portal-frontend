import React from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import PainelVendedor from './PainelVendedor';
import PainelGestor from './PainelGestor';
import DashboardVisitas from './DashboardVisitas';
import { FaMapMarkedAlt } from 'react-icons/fa';
import '../../App.css';

export default function Visitas({ user }) {
    const isManager = user?.privilegios?.includes('Admin') || user?.privilegios?.includes('Gestor');

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <Container fluid className="px-0">
                    {/* Header Padrão do Sistema */}
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h2 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                                <FaMapMarkedAlt className="text-primary" /> Visitas Comerciais
                            </h2>
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
                </Container>
            </div>
        </div>
    );
}