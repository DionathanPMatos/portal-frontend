import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Tab, Alert } from 'react-bootstrap';
import { FaTachometerAlt, FaUsers, FaSitemap, FaUmbrellaBeach, FaGift, FaChalkboardTeacher, FaClipboardCheck, FaUserTie, FaFileAlt } from 'react-icons/fa';
import HRDashboardPage from './HRDashboardPage';
import ManageEmployees from './ManageEmployees';
import BeneficiosHubPage from './BeneficiosHubPage'; // Alterado para o Hub de Benefícios

// Componente de placeholder para abas futuras
const PlaceholderTab = ({ title }) => (
    <div className="p-5 text-center">
        <Alert variant="info">
            <Alert.Heading>Em Breve</Alert.Heading>
            <p>A funcionalidade de <strong>{title}</strong> está em desenvolvimento e será disponibilizada em breve.</p>
        </Alert>
    </div>
);

const HRHubPage = () => {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'dashboard';
    const [activeTab, setActiveTab] = useState(initialTab);

    return (
        <div className="container-main p-4">
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaUsers /> Central de Recursos Humanos
                    </h2>
                    <p className="page-header-subtitle">Gerencie colaboradores, benefícios, avaliações e indicadores de RH.</p>
                </div>
            </div>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="hr-hub-tabs" className="mb-3 custom-tabs" fill>
                <Tab eventKey="dashboard" title={<><FaTachometerAlt className="me-2" />Dashboard</>}>
                    <HRDashboardPage />
                </Tab>
                <Tab eventKey="colaboradores" title={<><FaUsers className="me-2" />Colaboradores</>}>
                    <ManageEmployees />
                </Tab>
                <Tab eventKey="organograma" title={<><FaSitemap className="me-2" />Organograma</>}>
                    <PlaceholderTab title="Organograma" />
                </Tab>
                <Tab eventKey="ferias" title={<><FaUmbrellaBeach className="me-2" />Férias</>}>
                    <PlaceholderTab title="Controle de Férias" />
                </Tab>
                <Tab eventKey="beneficios" title={<><FaGift className="me-2" />Benefícios</>}>
                    <BeneficiosHubPage />
                </Tab>
                <Tab eventKey="treinamentos" title={<><FaChalkboardTeacher className="me-2" />Treinamentos</>}>
                    <PlaceholderTab title="Treinamentos e Desenvolvimento" />
                </Tab>
                <Tab eventKey="avaliacoes" title={<><FaClipboardCheck className="me-2" />Avaliações</>}>
                    <PlaceholderTab title="Avaliações de Desempenho" />
                </Tab>
                <Tab eventKey="recrutamento" title={<><FaUserTie className="me-2" />Recrutamento</>}>
                    <PlaceholderTab title="Recrutamento e Seleção" />
                </Tab>
                <Tab eventKey="relatorios" title={<><FaFileAlt className="me-2" />Relatórios</>}>
                    <PlaceholderTab title="Relatórios de RH" />
                </Tab>
            </Tabs>
        </div>
    );
};

export default HRHubPage;