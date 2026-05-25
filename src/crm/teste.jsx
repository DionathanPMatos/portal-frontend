import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Card, Button, Spinner, Alert, Table, InputGroup, Form } from 'react-bootstrap';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProjetoFormModal from './ProjetoFormModal';
import SortableItem from './SortableItem';
import './crm.css';
import '../App.css';



const ETAPAS_KANBAN = ['Prospeccao','Dtc','Poc','Negociacao','Aprovação','Fechado','Perdido','Ganho'];

const DashboardProjetos = () => {
    const [projetos, setProjetos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [defaultStage, setDefaultStage] = useState('');
    const [viewMode, setViewMode] = useState('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const sensors = useSensors(useSensor(PointerSensor));

    const fetchProjetos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/projetos', {
                params: { search: debouncedSearchTerm }
            });
            setProjetos(response.data || []);
        } catch (err) {
            setError('Erro ao buscar projetos.');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchProjetos();
    }, [fetchProjetos]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) return; // Se soltar fora, ignora

        const activeId = active.id;
        const overId = over.id;

        // CORREÇÃO: Lógica robusta para identificar a coluna de destino
        const activeContainer = active.data.current?.parent;
        let overContainer;
        if (over.data.current?.type === 'card') {
            // Se soltou sobre um CARD, o destino é a coluna PAI daquele card
            overContainer = over.data.current.parent;
        } else {
            // Se soltou sobre uma COLUNA, o destino é o ID da própria coluna
            overContainer = overId;
        }
        
        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        const originalProjetos = [...projetos];
        // Atualização Otimista
        setProjetos(projetosAtuais => projetosAtuais.map(p => 
            p.id === activeId ? { ...p, etapa_funil: overContainer } : p
        ));

        try {
            await axios.patch(`/api/projetos/${activeId}/mover`, { novaEtapa: overContainer });
        } catch (err) {
            alert('Falha ao salvar. Revertendo alteração.');
            setProjetos(originalProjetos);
        }
    };

    const handleOpenModal = (etapa = '') => {
        setDefaultStage(etapa);
        setShowModal(true);
    };

    const handleProjectCreated = () => {
        setShowModal(false);
        if (searchTerm) {
            setSearchTerm('');
        } else {
            fetchProjetos();
        }
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    const renderKanban = () => (
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners} 
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-board">
                {ETAPAS_KANBAN.map(etapa => {
                    const projetosDaEtapa = projetos.filter(p => p.etapa_funil === etapa);
                    return (
                        <div key={etapa} className="kanban-column">
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{etapa.replace(/([A-Z])/g, ' $1').trim()} ({projetosDaEtapa.length})</h5>
                                    <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(etapa)}>+</Button>
                                </Card.Header>
                                <Card.Body>
                                    <SortableContext id={etapa} items={projetosDaEtapa.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                        <div className="kanban-cards-container">
                                            {projetosDaEtapa.length > 0 ? (
                                                projetosDaEtapa.map(projeto => 
                                                    // CORREÇÃO: Passando o 'containerId' para o card
                                                    <SortableItem key={projeto.id} id={projeto.id} projeto={projeto} containerId={etapa} />
                                                )
                                            ) : (
                                                <div className="kanban-placeholder">
                                                    {searchTerm ? 'Nenhum resultado' : '+ Arraste um card aqui'}
                                                </div>
                                            )}
                                        </div>
                                    </SortableContext>
                                </Card.Body>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </DndContext>
    );

    const renderLista = () => (
        <Table striped bordered hover responsive>
            <thead>
                <tr>
                    <th>#ID</th><th>Nome do Projeto</th><th>Cliente</th><th>Vendedor</th><th>Etapa</th>
                </tr>
            </thead>
            <tbody>
                {projetos && projetos.length > 0 ? (
                    projetos.map((projeto) => (
                        <tr key={projeto.id}>
                            <td>{projeto.id}</td>
                            <td><Link to={`/crm/projetos/${projeto.id}`}>{projeto.nome_projeto}</Link></td>
                            <td>{projeto.nome_cliente}</td>
                            <td>{projeto.nome_vendedor}</td>
                            <td><span className="badge bg-secondary">{projeto.etapa_funil}</span></td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="5" className="text-center">Nenhum projeto encontrado.</td></tr>
                )}
            </tbody>
        </Table>
    );

    return (
        <div className="dash-grid" >
            <div className='container-main'>
                <Container fluid className="kanban-board-container">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Dashboard de Projetos</h2>
                        <div>
                            <Link to="/crm/projetos-perdidos" className="btn btn-secondary me-2 text-white">Projetos Perdidos</Link>
                            <Button variant="info" className="me-2" onClick={() => setViewMode(viewMode === "kanban" ? "lista" : "kanban")}>
                                Ver em {viewMode === "kanban" ? "Lista" : "Kanban"}
                            </Button>
                            <Button variant="primary" onClick={() => handleOpenModal()}>+ Novo Projeto</Button>
                        </div>
                    </div>

                    <InputGroup className="mb-4">
                        <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                        <Form.Control
                            placeholder="Buscar por nome do projeto, cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    
                    {viewMode === 'kanban' ? renderKanban() : renderLista()}
                </Container>
            </div>
            <ProjetoFormModal show={showModal} onHide={() => setShowModal(false)} onSuccess={handleProjectCreated} defaultStage={defaultStage} />
        </div>
    );
};

export default DashboardProjetos;