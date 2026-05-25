import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Spinner, Alert, Table, Badge, Button } from 'react-bootstrap';
import axios from 'axios';
import DtcUpdateModal from './DtcUpdateModal';

const DashboardDTC = () => {
    const [projetos, setProjetos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            // --- ALTERAÇÃO PRINCIPAL AQUI ---
            // Busca projetos, técnicos do DTC (ID 6) e técnicos do setor Técnico (ID 3)
            const [projetosRes, tecnicosDtcRes, tecnicosTecnicoRes] = await Promise.all([
                axios.get('/api/projetos/dtc'),
                axios.get('/api/funcionarios', { params: { setorId: 3 } }), // Setor DTC
                axios.get('/api/funcionarios', { params: { setorId: 3 } })  // Setor Técnico
            ]);
            
            // Junta as duas listas de funcionários em uma só
            const todosTecnicos = [...tecnicosDtcRes.data, ...tecnicosTecnicoRes.data];

            // Remove duplicados caso um funcionário, por algum motivo, esteja nos dois
            const tecnicosUnicos = Array.from(new Set(todosTecnicos.map(a => a.id)))
                .map(id => {
                    return todosTecnicos.find(a => a.id === id)
                });
            
            // Ordena a lista final por nome
            tecnicosUnicos.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));

            setProjetos(projetosRes.data);
            setTecnicos(tecnicosUnicos); // Define o estado com a lista combinada e única

        } catch (err) {
            setError('Erro ao buscar dados para o dashboard do DTC.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (projeto) => {
        setSelectedProject(projeto);
        setShowModal(true);
    };
    
    const handleSuccess = () => {
        setShowModal(false);
        fetchData();
    };
    
    const getStatusPropostaBadge = (status) => {
        switch (status) {
            case 'Pendente': return 'warning';
            case 'Em Elaboração': return 'info';
            case 'Concluída': return 'success';
            case 'Revisão Solicitada': return 'danger';
            default: return 'secondary';
        }
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <div className="dash-grid">
            <div className='container-main'>
                <Container className="mt-4">
                    <h2 className="mb-4">Fila de Propostas Técnicas (DTC)</h2>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Projeto</th>
                                <th>Cliente</th>
                                <th>Vendedor Solicitante</th>
                                <th>Status da Proposta</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projetos.length > 0 ? (
                                projetos.map((projeto) => (
                                    <tr key={projeto.id}>
                                        <td>
                                            <Link to={`/crm/projetos/${projeto.id}`}>
                                                {projeto.nome_projeto}
                                            </Link>
                                        </td>
                                        <td>{projeto.nome_cliente}</td>
                                        <td>{projeto.nome_vendedor}</td>
                                        <td>
                                            <Badge bg={getStatusPropostaBadge(projeto.status_proposta_dtc)}>
                                                {projeto.status_proposta_dtc}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button variant="primary" size="sm" onClick={() => handleOpenModal(projeto)}>
                                                Gerenciar
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">Nenhuma solicitação de proposta pendente.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Container>
            </div>

            {selectedProject && (
                <DtcUpdateModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    onSuccess={handleSuccess}
                    projeto={selectedProject}
                    tecnicos={tecnicos}
                />
            )}
        </div>
    );
};

export default DashboardDTC;