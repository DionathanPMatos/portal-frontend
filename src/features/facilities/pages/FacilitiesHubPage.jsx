import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Tab, Alert } from 'react-bootstrap';
import { FaTachometerAlt, FaTools, FaTruck, FaHardHat, FaWrench, FaClipboardList, FaFileSignature, FaHandshake, FaChartBar, FaBuilding } from 'react-icons/fa';
import FacilitiesDashboard from './FacilitiesDashboard';
import Facilities from './Facilities'; // Assumindo que este é o componente de Equipamentos
import GestaoObras from './GestaoObras'; // Assumindo que este é o componente de Obras
import Frota from '../../fleet-management/pages/Frota'; // 🚀 Importa o componente de Frota
import Fornecedores from './Fornecedores';


const PlaceholderTab = ({ title }) => (
    <div className="p-5 text-center">
        <Alert variant="info">
            <Alert.Heading>Em Breve</Alert.Heading>
            <p>A funcionalidade de <strong>{title}</strong> está em desenvolvimento e será disponibilizada em breve.</p>
        </Alert>
    </div>
);

const FacilitiesHubPage = () => {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'visao-geral';
    const [activeTab, setActiveTab] = useState(initialTab);

    return (
        <div className="container-main p-4">
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaBuilding /> Central de Facilities
                    </h2>
                    <p className="page-header-subtitle">Gerencie a infraestrutura, frota, obras e serviços da empresa.</p>
                </div>
            </div>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="facilities-hub-tabs" className="mb-3 custom-tabs" fill>
                <Tab eventKey="visao-geral" title={<><FaTachometerAlt className="me-2" />Visão Geral</>}><FacilitiesDashboard /></Tab>
                <Tab eventKey="equipamentos" title={<><FaTools className="me-2" />Equipamentos</>}><Facilities /></Tab>
                <Tab eventKey="frota" title={<><FaTruck className="me-2" />Frota</>}><Frota /></Tab>
                <Tab eventKey="obras" title={<><FaHardHat className="me-2" />Obras e Projetos</>}><GestaoObras /></Tab>
                <Tab eventKey="manutencoes" title={<><FaWrench className="me-2" />Serviços e Manutenções</>}><PlaceholderTab title="Ordens de Serviço" /></Tab>
                <Tab eventKey="solicitacoes" title={<><FaClipboardList className="me-2" />Solicitações</>}><PlaceholderTab title="Central de Solicitações" /></Tab>
                <Tab eventKey="contratos" title={<><FaFileSignature className="me-2" />Contratos</>}><PlaceholderTab title="Gestão de Contratos" /></Tab>
                <Tab eventKey="fornecedores" title={<><FaHandshake className="me-2" />Fornecedores</>}><Fornecedores /></Tab>
                <Tab eventKey="relatorios" title={<><FaChartBar className="me-2" />Relatórios</>}><PlaceholderTab title="Relatórios de Facilities" /></Tab>
            </Tabs>
        </div>
    );
};

export default FacilitiesHubPage;