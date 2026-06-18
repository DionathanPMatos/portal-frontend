import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { FaTachometerAlt, FaClipboardList, FaCalendarAlt, FaBell } from 'react-icons/fa';

// Importe os sub-componentes conforme forem criados nas próximas etapas:
import FeriasDashboard from '../components/ferias/FeriasDashboard';
import FeriasSolicitacoes from '../components/ferias/FeriasSolicitacoes';
import FeriasCalendario from '../components/ferias/FeriasCalendario';
import FeriasAlertas from '../components/ferias/FeriasAlertas';

const FeriasPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="p-3">
            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3 custom-tabs">
                <Tab eventKey="dashboard" title={<><FaTachometerAlt className="me-2" />Visão Geral</>}>
                    <FeriasDashboard />
                </Tab>
                <Tab eventKey="solicitacoes" title={<><FaClipboardList className="me-2" />Solicitações</>}>
                    <FeriasSolicitacoes />
                </Tab>
                <Tab eventKey="calendario" title={<><FaCalendarAlt className="me-2" />Calendário</>}>
                    <FeriasCalendario />
                </Tab>
                <Tab eventKey="alertas" title={<><FaBell className="me-2" />Alertas</>}>
                    <FeriasAlertas />
                </Tab>
            </Tabs>
        </div>
    );
};

export default FeriasPage;