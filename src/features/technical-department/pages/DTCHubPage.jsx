import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Tab, Alert } from 'react-bootstrap';
import { FaProjectDiagram, FaUsersCog, FaIndustry, FaBook, FaChartBar, FaTachometerAlt } from 'react-icons/fa';

// Importar os componentes existentes para cada aba
import DashboardDTCPage from './DashboardDTCPage';
import OrganogramaTecnicoPage from './OrganogramaTecnicoPage';
import FabricantesListPage from './FabricantesListPage';
import RepositorioTecnicoPage from './RepositorioTecnico';
import DtcDashboard from './DtcDashboard'; // Importa o novo dashboard

const DTCHubPage = () => {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'visao-geral';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Componente para abas em desenvolvimento
    const Placeholder = ({ title }) => (
        <div className="p-4">
            <Alert variant="info">
                <Alert.Heading>Em Desenvolvimento</Alert.Heading>
                <p>A área de <strong>{title}</strong> do departamento técnico está sendo construída e será disponibilizada em breve.</p>
            </Alert>
        </div>
    );

    return (
        <div className="container-main p-4">
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaProjectDiagram /> Departamento Técnico
                    </h2>
                    <p className="page-header-subtitle">Central de ferramentas, projetos e conhecimento técnico.</p>
                </div>
            </div>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="dtc-hub-tabs" className="mb-3 custom-tabs">
                <Tab eventKey="visao-geral" title={<><FaTachometerAlt className="me-2" />Visão Geral</>}>
                    <DtcDashboard />
                </Tab>
                <Tab eventKey="pre-vendas" title={<><FaProjectDiagram className="me-2" />Pré-Vendas (Projetos)</>}>
                    <div className="p-1"><DashboardDTCPage /></div>
                </Tab>
                <Tab eventKey="gerentes-produtos" title={<><FaUsersCog className="me-2" />Gerentes de Produtos</>}>
                    <div className="p-1"><OrganogramaTecnicoPage /></div>
                </Tab>
                <Tab eventKey="fabricantes" title={<><FaIndustry className="me-2" />Fabricantes</>}>
                    <div className="p-1"><FabricantesListPage /></div>
                </Tab>
                <Tab eventKey="repositorio" title={<><FaBook className="me-2" />Repositório Técnico</>}>
                    <div className="p-1"><RepositorioTecnicoPage /></div>
                </Tab>
                <Tab eventKey="relatorios" title={<><FaChartBar className="me-2" />Relatórios</>}>
                    <Placeholder title="Relatórios" />
                </Tab>
            </Tabs>
        </div>
    );
};

export default DTCHubPage;