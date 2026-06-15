import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { FaGift, FaClipboardCheck } from 'react-icons/fa';
import ManageBeneficios from './ManageBeneficios';
import Beneficios from './Beneficios';
import ManageBenefitRequests from '../components/ManageBenefitRequests';

const BeneficiosHubPage = () => {
    return (
        <div className="container-main p-4">
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaGift /> Central de Benefícios
                    </h2>
                    <p className="page-header-subtitle">Visualize e gerencie os benefícios corporativos.</p>
                </div>
            </div>

            <Tabs defaultActiveKey="visualizacao" id="beneficios-hub-tabs" className="mb-3 custom-tabs">
                <Tab eventKey="visualizacao" title="Benefícios Disponíveis">
                    <div className="p-3">
                        <Beneficios />
                    </div>
                </Tab>
                <Tab eventKey="gestao" title="Gestão de Benefícios">
                    <div className="p-3">
                        <ManageBeneficios />
                    </div>
                </Tab>
                <Tab eventKey="solicitacoes" title={<><FaClipboardCheck className="me-2" /> Solicitações</>}>
                    <div className="p-3">
                        <ManageBenefitRequests />
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
};

export default BeneficiosHubPage;