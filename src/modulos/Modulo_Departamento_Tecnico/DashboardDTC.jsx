import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Table, Badge, Button } from 'react-bootstrap';
import { FaClipboardList } from 'react-icons/fa';
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
        
                <Container fluid className="px-4">
                    <Row>
                        <Col>
                            <Card className="shadow-sm border-0">
                                <Card.Header>
                                    <Card.Title as="h4" className="d-flex align-items-center gap-2 mb-0">
                                        <FaClipboardList /> Fila de Propostas Técnicas (DTC)
                                    </Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                        <div>
                                            <h4 className="fw-bold mb-1 text-dark">
                                                Propostas Pendentes
                                            </h4>
                                            <p className="text-muted mb-0">
                                                Gerencie as solicitações de propostas técnicas enviadas pela equipe comercial.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <Table hover className="align-middle border mb-0">
                                            <thead className="table-light text-muted small text-uppercase">
                                                <tr>
                                                    <th className="py-3 px-4">Projeto</th>
                                                    <th className="py-3">Cliente</th>
                                                    <th className="py-3">Vendedor Solicitante</th>
                                                    <th className="py-3">Status da Proposta</th>
                                                    <th className="py-3 text-end px-4">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {projetos.length > 0 ? (
                                                    projetos.map((projeto) => (
                                                        <tr key={projeto.id}>
                                                            <td className="px-4 py-3 fw-bold text-dark">
                                                                <Link to={`/crm/projetos/${projeto.id}`} className="text-decoration-none">
                                                                    {projeto.nome_projeto}
                                                                </Link>
                                                            </td>
                                                            <td className="py-3">{projeto.nome_cliente}</td>
                                                            <td className="py-3 text-muted">{projeto.nome_vendedor}</td>
                                                            <td className="py-3">
                                                                <Badge bg={getStatusPropostaBadge(projeto.status_proposta_dtc)}>
                                                                    {projeto.status_proposta_dtc}
                                                                </Badge>
                                                            </td>
                                                            <td className="py-3 text-end px-4">
                                                                <Button variant="primary" size="sm" className="shadow-sm" onClick={() => handleOpenModal(projeto)}>
                                                                    Gerenciar
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-5 text-muted">Nenhuma solicitação de proposta pendente.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
   );
            {selectedProject && (
                <DtcUpdateModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    onSuccess={handleSuccess}
                    projeto={selectedProject}
                    tecnicos={tecnicos}
                />
            )}
      
 
};

export default DashboardDTC;