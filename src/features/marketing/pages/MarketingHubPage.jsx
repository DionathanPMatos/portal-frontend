import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Tab, Alert } from 'react-bootstrap';
import { FaTachometerAlt, FaBullhorn, FaChalkboard, FaBoxOpen, FaCalendarDay, FaShareAlt, FaRobot, FaClipboardList, FaFileContract } from 'react-icons/fa';
import ReserveRoomPage from './ReserveRoomPage';
import MarketingDashboard from './MarketingDashboard'; // 🚀 Importa o novo dashboard


// --- Componente de Placeholder ---
const PlaceholderTab = ({ title }) => (
    <div className="p-5 text-center">
        <Alert variant="info">
            <Alert.Heading>Em Breve</Alert.Heading>
            <p>A funcionalidade de <strong>{title}</strong> está em desenvolvimento e será disponibilizada em breve.</p>
        </Alert>
    </div>
);

// --- Importe suas páginas de Marketing aqui ---
const MarketingMaterialsPage = () => <PlaceholderTab title="Gestão de Materiais de Marketing" />;
const MarketingRequestsPage = () => <PlaceholderTab title="Acompanhamento de Solicitações" />;

const MarketingHubPage = () => {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'dashboard';
    const [activeTab, setActiveTab] = useState(initialTab);

    return (
        <div className="container-main p-4">
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaBullhorn /> Central de Marketing
                    </h2>
                    <p className="page-header-subtitle">Gerencie campanhas, materiais, showroom e indicadores de marketing.</p>
                </div>
            </div>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="marketing-hub-tabs" className="mb-3 custom-tabs" fill>
                <Tab eventKey="dashboard" title={<><FaTachometerAlt className="me-2" />Dashboard</>}><MarketingDashboard /></Tab>
                <Tab eventKey="campanhas" title={<><FaBullhorn className="me-2" />Campanhas</>}><PlaceholderTab title="Gestão de Campanhas" /></Tab>
                <Tab eventKey="showroom" title={<><FaChalkboard className="me-2" />Showroom</>}>
                    <ReserveRoomPage />
                </Tab>
                <Tab eventKey="materiais" title={<><FaBoxOpen className="me-2" />Materiais</>}><MarketingMaterialsPage /></Tab>
                <Tab eventKey="eventos" title={<><FaCalendarDay className="me-2" />Eventos</>}><PlaceholderTab title="Gestão de Eventos" /></Tab>
                <Tab eventKey="redes-sociais" title={<><FaShareAlt className="me-2" />Redes Sociais</>}><PlaceholderTab title="Gestão de Redes Sociais" /></Tab>
                <Tab eventKey="automacao" title={<><FaRobot className="me-2" />Automação</>}><PlaceholderTab title="Automação de Marketing" /></Tab>
                <Tab eventKey="solicitacoes" title={<><FaClipboardList className="me-2" />Solicitações</>}><MarketingRequestsPage /></Tab>
                <Tab eventKey="relatorios" title={<><FaFileContract className="me-2" />Relatórios</>}><PlaceholderTab title="Relatórios de Marketing" /></Tab>
            </Tabs>
        </div>
    );
};

export default MarketingHubPage;