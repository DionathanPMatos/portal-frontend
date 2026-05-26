import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Container, Button, Spinner, Alert, Form, Table, ButtonGroup, Row, Col } from 'react-bootstrap';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProjetoFormModal from './ProjetoFormModal';
import SortableItem from './SortableItem';
import './crm.css';
import '../../App.css';

// Lista de etapas para as colunas do Kanban
// (Excluímos "Perdido" e os status de entrega, que não são colunas ativas do funil)
const ETAPAS_KANBAN = [
    '05% - Prospecção',
    '25% - Especificação de Projeto',
    '35% - POC',
    '55% - Envio de Proposta - Projeto',
    '75% - Aguardando Aprovação',
    '95% - Pedido Fechado'
];

// Lista completa para mapeamento de cores e classes
const ETAPAS_COMPLETAS = [
    '0% - Projeto Perdido',
    '05% - Prospecção',
    '25% - Especificação de Projeto',
    '35% - POC',
    '55% - Envio de Proposta - Projeto',
    '75% - Aguardando Aprovação',
    '95% - Pedido Fechado',
    '98% - Parcialmente Entregue',
    '100% - Faturado e Entregue',
    'Ganho'
];

// Função para gerar nomes de classe CSS amigáveis
const getClasseAmigavel = (etapa) => {
    if (!etapa) return 'etapa-default';
    return 'etapa-' + etapa.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

// Gera os mapas de classe e cor dinamicamente
const etapaClasseMap = ETAPAS_COMPLETAS.reduce((acc, etapa) => {
    acc[etapa] = getClasseAmigavel(etapa);
    return acc;
}, {});

// Mapeamento de cores (sinta-se à vontade para ajustar)
const etapaColorMap = {
    '0% - Projeto Perdido': '#6c757d',          // Cinza
    '05% - Prospecção': '#0d6efd',               // Azul
    '25% - Especificação de Projeto': '#dc3545', // Vermelho (Era Dtc)
    '35% - POC': '#6f42c1',                      // Roxo
    '55% - Envio de Proposta - Projeto': '#fd7e14', // Laranja
    '75% - Aguardando Aprovação': '#ffc107',      // Amarelo
    '95% - Pedido Fechado': '#198754',           // Verde
    '98% - Parcialmente Entregue': '#0dcaf0',    // Ciano
    '100% - Faturado e Entregue': '#198754',     // Verde Escuro
    'Ganho': '#198754'                           // Verde
};


const KanbanColumn = ({ etapa, projetos, isOver, handleOpenModal, children }) => {
    const { setNodeRef } = useDroppable({ id: etapa });
    const idsDosProjetos = projetos.map(p => p.id);

    return (
        <div className="kanban-column">
            <div className={`kanban-column-header ${etapaClasseMap[etapa] || ''}`}>
                <h5>{etapa}</h5>
                <div className="kanban-column-info">
                    <span>{projetos.length} negócios</span>
                    <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projetos.reduce((sum, p) => sum + parseFloat(p.valor_estimado || 0), 0))}</strong>
                </div>
            </div>            <button className="kanban-quick-add" onClick={() => handleOpenModal(etapa)}>
                + Registro Rápido
            </button>

            <div ref={setNodeRef} className={`kanban-cards-container ${isOver ? 'drag-over' : ''}`}>
                <SortableContext id={etapa} items={idsDosProjetos} strategy={verticalListSortingStrategy}>
                    {children.length > 0 ? children : (

                        <div className="kanban-empty-placeholder">Arraste um card aqui</div>
                    )}
                </SortableContext>
            </div>

        </div>
    );
};

const DashboardProjetos = () => {
    const [projetos, setProjetos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [defaultStage, setDefaultStage] = useState('');
    const [viewMode, setViewMode] = useState('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeColumn, setActiveColumn] = useState(null);
    const [vendedores, setVendedores] = useState([]);
    const [filtroVendedor, setFiltroVendedor] = useState('');
    const [filtroEtapa, setFiltroEtapa] = useState('');
    const sensors = useSensors(useSensor(PointerSensor));

    // Estados para o Upload
    const [fileToUpload, setFileToUpload] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [importSuccess, setImportSuccess] = useState('');
    const fileInputRef = useRef(null); // Referência para o input escondido

    const fetchProjetosEVendedores = useCallback(async () => {
        try {
            setLoading(true);
            const [projetosRes, vendedoresRes] = await Promise.all([
                axios.get('/api/projetos'),
                axios.get('/api/vendedores')
            ]);

            // =======================================================
            // CORREÇÃO APLICADA AQUI
            // =======================================================
            setProjetos(projetosRes.data); // Usando 'projetosRes' em vez de 'response'
            setVendedores(vendedoresRes.data);

        } catch (err) {
            setError('Falha ao buscar dados.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjetosEVendedores();
    }, [fetchProjetosEVendedores]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const handleOpenModal = (etapa = '') => {
        setDefaultStage(etapa);
        setShowModal(true);
    };

    const handleDragOver = (event) => {
        const { over } = event;
        const overId = over?.id;
        const overIsColumn = ETAPAS_KANBAN.includes(overId);
        const parentColumn = over?.data?.current?.parent;
        if (overIsColumn) {
            setActiveColumn(overId);
        } else if (parentColumn) {
            setActiveColumn(parentColumn);
        }
    };

    // Função para lidar com a seleção do arquivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Chama o envio imediatamente após selecionar
            handleImportSubmit(file);
        }
    };

    // Função para enviar o arquivo ao backend
    const handleImportSubmit = async (file) => {
        if (!file) return;

        setIsImporting(true);
        setImportError('');
        setImportSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/crm/projetos/importar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setImportSuccess(response.data.message);
            // Atualiza a lista de projetos após a importação
            fetchProjetosEVendedores();
        } catch (err) {
            setImportError(err.response?.data?.error || 'Erro ao importar arquivo.');
        } finally {
            setIsImporting(false);
            // Limpa o input de arquivo para permitir o mesmo upload novamente
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDragEnd = async (event) => {
        setActiveColumn(null);
        const { active, over } = event;
        if (!over) return;
        const activeContainer = active.data.current?.parent;
        const overContainer = over.data.current?.parent || over.id;
        if (!activeContainer || !overContainer || activeContainer === overContainer) { return; }
        setProjetos(prev => prev.map(p => p.id === active.id ? { ...p, etapa_funil: overContainer } : p));
        try {
            await axios.patch(`/api/projetos/${active.id}/mover`, { novaEtapa: overContainer });
        } catch (err) {
            setError('Não foi possível salvar a alteração. Sincronizando novamente.');
            fetchProjetosEVendedores();
        }
    };

    const filteredProjetos = useMemo(() =>
        projetos.filter(p => {
            // Adicionamos '|| ''' para garantir que o código não quebre se o nome for nulo
            const searchMatch = (p.nome_projeto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.nome_cliente || '').toLowerCase().includes(searchTerm.toLowerCase());

            const vendedorMatch = !filtroVendedor || p.vendedor_id === parseInt(filtroVendedor);

            const etapaMatch = !filtroEtapa || p.etapa_funil === filtroEtapa;

            return searchMatch && vendedorMatch && etapaMatch;
        }),
        [projetos, searchTerm, filtroVendedor, filtroEtapa]);



    const renderLista = () => {
        const projetosAgrupados = filteredProjetos.reduce((acc, projeto) => {
            const etapa = projeto.etapa_funil || 'Sem Etapa';
            if (!acc[etapa]) {
                acc[etapa] = [];
            }
            acc[etapa].push(projeto);
            return acc;
        }, {});

        const etapasOrdenadas = Object.keys(projetosAgrupados).sort();


        return (

            <div className="list-view-container">
                {/* 1. Movendo os filtros para este container, fora de qualquer toolbar */}
                <Row className="mb-3 list-filters">
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Filtrar por Etapa</Form.Label>
                            <Form.Select value={filtroEtapa} onChange={e => setFiltroEtapa(e.target.value)}>
                                <option value="">Todas as Etapas</option>
                                {ETAPAS_KANBAN.map(etapa => <option key={etapa} value={etapa}>{etapa}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Filtrar por Vendedor</Form.Label>
                            <Form.Select value={filtroVendedor} onChange={e => setFiltroVendedor(e.target.value)}>
                                <option value="">Todos os Vendedores</option>
                                {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome_completo}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                {/* 2. A tabela vem logo abaixo dos filtros, dentro do mesmo container */}
                <Table responsive hover className="project-list-table">
                    <thead>
                        <tr>
                            <th>Projeto</th>
                            <th>Cliente</th>
                            <th>Vendedor</th>
                            <th>Previsão Fechamento</th>
                            <th>Próxima Atividade</th>
                            <th>Registro</th>
                            <th className="text-end">Valor</th>
                        </tr>
                    </thead>
                    {etapasOrdenadas.length > 0 ? etapasOrdenadas.map(etapa => (
                        <tbody key={etapa}>
                            <tr className="list-group-row">
                                <th colSpan="7" style={{ '--etapa-bg-color': etapaColorMap[etapa] || '#6c757d' }}>
                                    {etapa}
                                </th>
                            </tr>
                            {projetosAgrupados[etapa].map(projeto => (
                                <tr key={projeto.id}>
                                    <td><Link to={`/crm/projetos/${projeto.id}`}>{projeto.nome_projeto}</Link></td>
                                    <td>{projeto.nome_cliente}</td>
                                    <td>{projeto.nome_vendedor}</td>
                                    <td>
                                        {projeto.data_fechamento_prevista
                                            ? new Date(projeto.data_fechamento_prevista).toLocaleDateString()
                                            : '--'}
                                    </td>
                                    <td><span className="text-muted">--</span></td>
                                    <td>{projeto.numero_registro_fabricante || '--'}</td>
                                    <td className="text-end fw-bold">{formatCurrency(projeto.valor_estimado)}</td>
                                </tr>
                            ))}
                        </tbody>
                    )) : (
                        <tbody>
                            <tr>
                                <td colSpan="7" className="text-center p-4">Nenhum projeto encontrado.</td>
                            </tr>
                        </tbody>
                    )}
                </Table>
            </div>
        );
    }



    const renderKanban = () => (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
            <div className="kanban-board">
                {ETAPAS_KANBAN.map(etapa => {
                    const projetosDaEtapa = filteredProjetos.filter(p => p.etapa_funil === etapa);
                    const isOver = activeColumn === etapa;

                    return (
                        <KanbanColumn
                            key={etapa}
                            etapa={etapa}
                            projetos={projetosDaEtapa}
                            isOver={isOver}
                            handleOpenModal={handleOpenModal}
                        >
                            {projetosDaEtapa.map(projeto => (
                                <SortableItem key={projeto.id} projeto={projeto} containerId={etapa} />
                            ))}
                        </KanbanColumn>
                    );
                })}
            </div>
        </DndContext>
    );

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className="dash-grid">
            <div className='crm-container'>
                <div className="crm-toolbar">
                    <div className="crm-toolbar-left">
                        {/* === CORREÇÃO 1: BOTÃO DE IMPORTAR ADICIONADO AQUI === */}
                        <h4 style={{ color: '#fff' }}>Funil de Vendas &nbsp;
                            <Button variant=" success  text-light" style={{ backgroundColor: '#4fa263ff' }} onClick={handleOpenModal}>+ Criar</Button>

                            {/* Botão de Importação */}
                            <Button
                                variant="outline-light"
                                size="sm"
                                onClick={() => fileInputRef.current.click()}
                                disabled={isImporting}
                                title="Importar projetos de uma planilha"
                                style={{ marginLeft: '10px', verticalAlign: 'middle' }} // Ajuste de alinhamento
                            >
                                {isImporting ? <Spinner as="span" animation="border" size="sm" /> : <i className="bi bi-upload"></i>}
                            </Button>
                            {/* Input de arquivo escondido */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                accept=".xlsx, .xls, .csv" // Aceita os formatos
                            />
                        </h4>
                        {/* === FIM DA CORREÇÃO 1 === */}
 
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <ButtonGroup>
                                <Button className="btn-crm-menu" variant=" btn-sm text-light" onClick={() => setViewMode(viewMode === "kanban" ? "lista" : "kanban")}>
                                    Ver em {viewMode === "kanban" ? "Lista" : "Kanban"}
                                </Button>
                                <Button className="btn-crm-menu" variant=" btn-sm text-light" onClick={handleOpenModal}>Atividades</Button>
                                <Button className="btn-crm-menu" variant=" btn-sm text-light" onClick={handleOpenModal}>Calendário</Button>
                                <Button className="btn-crm-menu" variant=" btn-sm text-light" onClick={handleOpenModal}>Clientes</Button>
                            </ButtonGroup>
                            <ButtonGroup>
                                <Button className="btn-crm-menu" variant=" btn-sm text-light" onClick={handleOpenModal}>Perdidos</Button>
                                <Button className="btn-crm-menu" variant=" btn-sm text-light" onClick={handleOpenModal}>Ganhos</Button>
                                <Button className="btn-crm-menu" variant=" btn-sm text-light" onClick={handleOpenModal}>Relatórios</Button>
                                <Link to="/crm/prospeccao" className="btn btn-sm text-light btn-crm-menu" style={{ backgroundColor: '#007bff' }}>
                                    Prospecção IA
                                </Link>
                            </ButtonGroup>
                        </div>
                    </div>
                    <div className="crm-toolbar-right" >
                        <Form.Control
                            type="text"
                            placeholder="Buscar por nome ou cliente..."
                            style={{ width: '600px', backgroundColor: '#a6a8a69e', color: '#fff' }}

                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="crm-toolbar-right">
                        {/* === CORREÇÃO 2: ALERTAS DE FEEDBACK ADICIONADOS AQUI === */}
                        <div style={{ padding: '0 1rem' }}>
                            {importError && <Alert variant="danger" onClose={() => setImportError('')} dismissible>{importError}</Alert>}
                            {importSuccess && <Alert variant="success" onClose={() => setImportSuccess('')} dismissible>{importSuccess}</Alert>}
                        </div>
                        {/* === FIM DA CORREÇÃO 2 === */}

                    </div>
                </div>
                {viewMode === 'kanban' ? renderKanban() : renderLista()}
            </div>
            <ProjetoFormModal show={showModal} onHide={() => setShowModal(false)} onSuccess={fetchProjetosEVendedores} defaultStage={defaultStage} />
        </div>
    );
};

export default DashboardProjetos;