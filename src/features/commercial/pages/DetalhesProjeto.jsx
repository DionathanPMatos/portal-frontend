import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Row, Col, Breadcrumb, Button, Modal, Form, ListGroup, InputGroup, Badge, Tabs, Tab, FormCheck, Accordion, Table } from 'react-bootstrap';
import ProjetoFormModal from './CRM/ProjetoFormModal';
import PedidoErpModal from './CRM/PedidoErpModal';
import '../../../styles/App.css';
import './../styles/Crm.css';
import apiClient from '../../../services/api';

// --- SUB-COMPONENTE CORRIGIDO PARA GERENCIAR UM ÚNICO PEDIDO ---
const PedidoAccordionItem = ({ projetoId, pedidoVinculado, onDesvincular }) => {
    // CORREÇÃO 1: Unificamos o estado em um único objeto 'detalhes'.
    const [detalhes, setDetalhes] = useState({ pedido: null, estoque: null, solicitacao: null });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

const carregarDetalhesPedido = async () => {
        if (detalhes.pedido) return;
        setIsLoading(true);
        setError('');
        try {
            const resPedido = await apiClient.get(`/api/erp/pedido/${pedidoVinculado.numero_pedido}`);
            const resEstoque = resPedido.data.itens.length > 0
                ? await apiClient.post(`/api/erp/estoque`, { codigos: resPedido.data.itens.map(i => i.codigo) })
                : { data: [] };
            
            // CORREÇÃO 2: Atualizamos o estado 'detalhes' corretamente.
            setDetalhes({
                pedido: resPedido.data,
                estoque: resEstoque.data,
                solicitacao: null // A solicitação de compra é carregada separadamente se necessário
            });

        } catch (err) {
            console.error('Erro ao buscar detalhes do pedido ou estoque:', err);
            setError('Falha ao carregar detalhes do pedido do ERP.');
        } finally {
            setIsLoading(false);
        }
    };
    // Efeito para "escutar" por atualizações no status da compra
    useEffect(() => {
        // CORREÇÃO 3: Agora a verificação usa 'detalhes.solicitacao', que é seguro.
        if (!detalhes.solicitacao || ['Comprado', 'Cancelado'].includes(detalhes.solicitacao.status)) {
            return;
        }
        const interval = setInterval(async () => {
            const res = await apiClient.get(`/api/compras/solicitacao/pedido/${pedidoVinculado.id}`).catch(() => null);
            if (res && res.data && res.data.status !== detalhes.solicitacao.status) {
                setDetalhes(d => ({ ...d, solicitacao: res.data }));
            }
        }, 10000); // Verifica a cada 10 segundos
        return () => clearInterval(interval);
    }, [detalhes.solicitacao, pedidoVinculado.id]);

    const handleSolicitarCompra = async () => {
        // CORREÇÃO 4: Usa 'detalhes.estoque' para encontrar os itens.
        const itensParaComprar = detalhes.estoque.filter(item => item.status === 'Insuficiente');
        if (itensParaComprar.length === 0) return;

        if (window.confirm('Confirmar o envio da solicitação de compra?')) {
            try {
                const res = await apiClient.post('/api/compras/solicitacoes', {
                    projeto_id: projetoId,
                    projeto_pedido_id: pedidoVinculado.id,
                    itens_faltantes: itensParaComprar
                });
                setDetalhes(d => ({ ...d, solicitacao: res.data }));
                alert('Solicitação de compra enviada!');
            } catch (err) {
                alert(err.response?.data?.error || 'Erro ao enviar solicitação.');
            }
        }
    };

    const hasInsufficientStock = detalhes.estoque?.some(item => item.status === 'Insuficiente');
  // --- LÓGICA DO BADGE CORRIGIDA ---
    const getBadgeStatus = () => {
        if (detalhes.solicitacao) {
            return { bg: 'success', text: 'white', label: `Compra: ${detalhes.solicitacao.status}` };
        }
        // Se o estoque ainda não foi carregado, mostra "Verificar Estoque"
        if (detalhes.estoque === null) {
            return { bg: 'secondary', text: 'white', label: 'Verificar Estoque' };
        }
        if (hasInsufficientStock) {
            return { bg: 'warning', text: 'dark', label: 'Pendente de Compra' };
        }
        return { bg: 'primary', text: 'white', label: 'Estoque OK' };
    };
    
    const badgeStatus = getBadgeStatus();

return (
        <Accordion.Item eventKey={pedidoVinculado.numero_pedido}>
            <Accordion.Header onClick={carregarDetalhesPedido}>
                Pedido ERP: {pedidoVinculado.numero_pedido} {detalhes.pedido ? `(Valor: ${parseFloat(detalhes.pedido.valor_total_pedido || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})` : ''}
                <Badge bg={badgeStatus.bg} text={badgeStatus.text} className="ms-3">{badgeStatus.label}</Badge>
            </Accordion.Header>
            <Accordion.Body>
                {isLoading && <Spinner animation="border" size="sm" />}
                {error && <Alert variant="danger">{error}</Alert>}
                {detalhes.pedido && (
                    <div>
                        <h6>Itens do Pedido</h6>
                        {/* Aqui iria a lógica para renderizar os itens do pedido, estoque, etc. */}
                        <p>Cliente: {detalhes.pedido.cliente_nome}</p>
                        <Table striped bordered hover size="sm">
                           <thead><tr><th>Item</th><th>Qtd</th><th>Valor Unit.</th></tr></thead>
                           <tbody>
                               {detalhes.pedido.itens.map(item => (
                                   <tr key={item.codigo}>
                                       <td>{item.descricao}</td>
                                       <td>{item.quantidade}</td>
                                       <td>{parseFloat(item.valor_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                   </tr>
                               ))}
                           </tbody>
                        </Table>
                        {hasInsufficientStock && !detalhes.solicitacao && (
                            <Button variant="warning" size="sm" className="me-2" onClick={handleSolicitarCompra}>
                                Solicitar Compra de Faltantes
                            </Button>
                        )}
                        <Button variant="outline-danger" size="sm" onClick={() => onDesvincular(pedidoVinculado.id)}>
                            Desvincular Pedido
                        </Button>
                    </div>
                )}
            </Accordion.Body>
        </Accordion.Item>
    );
};


// --- COMPONENTE PRINCIPAL ---
const DetalhesProjeto = ({ user }) => {    const { id } = useParams();
    const navigate = useNavigate();

    // --- SEUS ESTADOS EXISTENTES ---
    const [projeto, setProjeto] = useState(null);
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showLostModal, setShowLostModal] = useState(false);
    const [motivoPerda, setMotivoPerda] = useState('');
    const [fileToUpload, setFileToUpload] = useState(null);
    const [numeroPedidoErp, setNumeroPedidoErp] = useState('');
    const [pedidoImportado, setPedidoImportado] = useState(null);
    const [showPedidoModal, setShowPedidoModal] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    
    // --- ESTADOS DO FEED DE ATIVIDADES ---
    const [atividades, setAtividades] = useState([]);
    const [atividadeLoading, setAtividadeLoading] = useState(false);
    const [abaAtiva, setAbaAtiva] = useState('nota');
    const [textoNota, setTextoNota] = useState('');
    const [textoAtividade, setTextoAtividade] = useState('');
    const [dataTarefa, setDataTarefa] = useState('');

    const USUARIO_LOGADO_ID = user?.id || 1;

    const fetchData = async () => {
        try {
            // Unificando as chamadas de dados iniciais
            const [projetoRes, documentosRes, atividadesRes] = await Promise.all([
                apiClient.get(`/api/projetos/${id}`),
                apiClient.get(`/api/projetos/${id}/documentos`),
                apiClient.get(`/api/projetos/${id}/atividades`)
            ]);
            setProjeto(projetoRes.data);
            setDocumentos(documentosRes.data);
            setAtividades(atividadesRes.data);
        } catch (err) {
            setError('Erro ao buscar dados do projeto.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [id]);

    // --- FUNÇÕES DE LÓGICA (HANDLERS) ---
    const handleAddAtividade = async (tipo, dados) => {
        if (!dados.descricao.trim()) {
            alert('A descrição é obrigatória.');
            return;
        }
        setAtividadeLoading(true);
        try {
            const payload = {
                usuario_id: USUARIO_LOGADO_ID,
                tipo_atividade: tipo,
                descricao: dados.descricao,
                data_conclusao_prevista: dados.data || null,
            };
            const response = await apiClient.post(`/api/projetos/${id}/atividades`, payload);
            setAtividades([response.data, ...atividades]);
            
            setTextoNota('');
            setTextoAtividade('');
            setDataTarefa('');
        } catch (err) {
            alert('Erro ao adicionar atividade.');
        } finally {
            setAtividadeLoading(false);
        }
    };

    const handleToggleTask = async (taskId, statusAtual) => {
        setAtividades(atividades.map(ativ => ativ.id === taskId ? { ...ativ, concluida: !statusAtual } : ativ));
        try {
            await apiClient.patch(`/api/atividades/${taskId}/toggle`);
        } catch (err) {
            alert('Falha ao atualizar a tarefa. Revertendo.');
            setAtividades(atividades.map(ativ => ativ.id === taskId ? { ...ativ, concluida: statusAtual } : ativ));
        }
    };

    const handleProjectUpdated = () => {
        setShowEditModal(false);
        fetchData();
    };

const handleMarkAsLost = async () => {
    if (!motivoPerda) {
        alert('Por favor, informe o motivo da perda.');
        return;
    }
    try {
        await apiClient.patch(`/api/projetos/${id}/perder`, {
            motivo_perda: motivoPerda
        });
        setShowLostModal(false);
        navigate('/crm/projetos');
    } catch (err) {
        alert(err.response?.data?.error || 'Ocorreu um erro.');
    }
};

    const handleSolicitarProposta = async () => {
        if (window.confirm('Tem certeza?')) {
            try {
                const response = await apiClient.patch(`/api/projetos/${id}/solicitar-proposta`);
                setSuccess(response.data.message);
                fetchData();
                setTimeout(() => setSuccess(''), 4000);
            } catch (err) {
                alert(err.response?.data?.error || 'Ocorreu um erro.');
            }
        }
    };

    const handleEnviarParaRevisao = async () => {
        if (window.confirm('Tem certeza?')) {
            try {
                const response = await apiClient.patch(`/api/projetos/${id}/revisar`);
                setSuccess(response.data.message);
                fetchData();
                setTimeout(() => setSuccess(''), 4000);
            } catch (err) {
                alert(err.response?.data?.error || 'Ocorreu um erro.');
            }
        }
    };

    const handleFileUpload = async (event) => {
        event.preventDefault();
        if (!fileToUpload) return alert('Por favor, selecione um arquivo.');
        
        const formData = new FormData();
        formData.append('documento', fileToUpload);
        try {
            const response = await apiClient.post(`/api/projetos/${id}/upload`, formData);
            setSuccess(response.data.message);
            event.target.reset();
            fetchData(); // Para atualizar a lista de documentos
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao fazer upload.');
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (window.confirm('Tem certeza?')) {
            try {
                await apiClient.delete(`/api/projetos/documentos/${docId}`);
                setSuccess('Documento excluído com sucesso!');
                fetchData(); // Para atualizar a lista de documentos
            } catch (err) {
                alert(err.response?.data?.error || 'Erro ao excluir documento.');
            }
        }
    };

    const handleVerificarPedido = async () => {
        if (!numeroPedidoErp.trim()) return;
        setImportLoading(true);
        setImportError('');
        try {
            const res = await apiClient.get(`/api/erp/pedido/${numeroPedidoErp}`);
            setPedidoImportado(res.data);
            setShowPedidoModal(true);
        } catch (err) {
            setImportError(err.response?.data?.error || `Pedido "${numeroPedidoErp}" não encontrado no ERP.`);
        } finally {
            setImportLoading(false);
        }
    };

    const handleAtrelarPedido = async () => {
        if (!pedidoImportado) return;
        setIsLinking(true);
        try {
            await apiClient.patch(`/api/projetos/${id}/atrelar-pedido`, { numero_pedido: pedidoImportado.numero_pedido });
            setShowPedidoModal(false);
            setNumeroPedidoErp('');
            setPedidoImportado(null);
            setSuccess('Pedido vinculado com sucesso!');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao vincular pedido.');
        } finally {
            setIsLinking(false);
        }
    };

    const handleDesvincularPedido = async (pedidoVinculadoId) => {
        if (window.confirm('Tem certeza que deseja desvincular este pedido do projeto?')) {
            try {
                await apiClient.delete(`/api/projeto-pedidos/${pedidoVinculadoId}`);
                setSuccess('Pedido desvinculado com sucesso!');
                fetchData();
            } catch (err) {
                alert(err.response?.data?.error || 'Erro ao desvincular o pedido.');
            }
        }
    };

    // --- FUNÇÕES DE FORMATAÇÃO E HELPERS ---
    const formatDate = (dateString) => {
        if (!dateString) return 'Não definida';
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    };

    const renderAtividadeIcone = (tipo) => {
        switch (tipo) {
            case 'Nota': return <i className="bi bi-chat-right-text-fill text-primary"></i>;
            case 'Tarefa': return <i className="bi bi-check2-circle text-warning"></i>;
            case 'Ligação': return <i className="bi bi-telephone-fill text-info"></i>;
            case 'Reunião': return <i className="bi bi-people-fill text-success"></i>;
            default: return <i className="bi bi-record-circle-fill text-secondary"></i>;
        }
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

    const getCompraStatusBadge = (status) => {
        switch (status) {
            case 'Pendente': return 'warning';
            case 'Em Cotação': return 'info';
            case 'Comprado': return 'success';
            case 'Cancelado': return 'danger';
            default: return 'secondary';
        }
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!projeto) return <Container className="mt-5"><Alert variant="warning">Projeto não encontrado.</Alert></Container>;

    // --- RENDERIZAÇÃO DO COMPONENTE ---
    return (
        <div className="dash-grid">
            <div className='container-main'>
                <Container className="mt-4 grid-container">
                    <Breadcrumb>
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/crm/projetos" }}>Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>{projeto.nome_projeto}</Breadcrumb.Item>
                    </Breadcrumb>

                    {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

                    {/* CARD PRINCIPAL: DETALHES DO PROJETO */}
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h4>{projeto.nome_projeto}</h4>
                            <div>
                                { /* ALTERAÇÃO 1: A condição foi mudada para 'Dtc' */}
                                {projeto.etapa_funil === '25% - Especificação de Projeto' && !projeto.status_proposta_dtc && (
                                    <Button variant="outline-primary" size="sm" onClick={handleSolicitarProposta} className="me-2">
                                        Solicitar Proposta Técnica
                                    </Button>
                                )}
                                <Button variant="outline-info" size="sm" onClick={() => setShowEditModal(true)} className="me-2">
                                    Editar
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => setShowLostModal(true)}>
                                    Marcar como Perdido
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                {/* Coluna da Esquerda com Detalhes */}
                                <Col md={8}>
                                    <h5><i className="bi bi-info-circle-fill me-2"></i>Detalhes do Projeto</h5>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <p className="mb-1"><strong>Cliente:</strong> {projeto.nome_cliente}</p>
                                            <p className="mb-1"><strong>Vendedor:</strong> {projeto.nome_vendedor}</p>
                                            <p className="mb-1"><strong>Tipo:</strong> {projeto.tipo_projeto || 'N/A'}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p className="mb-1">
                                                <strong>Valor Estimado:</strong>
                                                {projeto.valor_estimado
                                                    ? ` R$ ${parseFloat(projeto.valor_estimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                                    : 'Não informado'}
                                            </p>
                                            <p className="mb-1"><strong>Previsão de Fechamento:</strong> {formatDate(projeto.data_fechamento_prevista)}</p>
                                        </Col>
                                    </Row>
                                    <hr />
                                    {/* Seção de Classificação */}
                                    <h6><i className="bi bi-tags-fill me-2"></i>Classificação</h6>
                                    <Row>
                                        <Col md={4}><p className="mb-1"><strong>Segmentação:</strong> {projeto.nome_segmentacao || 'N/A'}</p></Col>
                                        <Col md={4}><p className="mb-1"><strong>Vertical:</strong> {projeto.nome_vertical || 'N/A'}</p></Col>
                                        <Col md={4}><p className="mb-1"><strong>Integrador:</strong> {projeto.nome_integrador || 'N/A'}</p></Col>
                                    </Row>
                                    <hr />
                                    {/* Seção de Listas */}
                                    <div className="d-flex flex-wrap gap-4">
                                        <div>
                                            <h6><i className="bi bi-people-fill me-2"></i>Colaboradores</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {projeto.colaboradores && projeto.colaboradores.length > 0 ? (
                                                    projeto.colaboradores.map(c => <Badge key={c.id} pill bg="secondary">{c.nome_completo}</Badge>)
                                                ) : (
                                                    <small className="text-muted">Nenhum.</small>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h6><i className="bi bi-cpu-fill me-2"></i>Fabricantes</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {projeto.fabricantes && projeto.fabricantes.length > 0 ? (
                                                    projeto.fabricantes.map(f => <Badge key={f.id} pill bg="dark">{f.name}</Badge>)
                                                ) : (
                                                    <small className="text-muted">Nenhum.</small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Col>

                                {/* Coluna da Direita com Status */}

                                <Col md={4} className="border-start">
                                    <h5><i className="bi bi-check-circle-fill me-2"></i>Status</h5>
                                    <p><strong>Etapa do Funil:</strong> <Badge bg="primary text-light">{projeto.etapa_funil}</Badge></p>

                                    <div className="mb-2">
                                        <strong>Registro Fabricante:</strong>
                                        {projeto.numero_registro_fabricante ? (
                                            <Badge bg="success" className="ms-2">Registrado</Badge>
                                        ) : (
                                            <Badge bg="danger" text="light" className="ms-2">Pendente</Badge>
                                        )}
                                        {projeto.numero_registro_fabricante &&
                                            <p className="text-muted small mt-1 mb-0">N°: {projeto.numero_registro_fabricante}</p>
                                        }
                                    </div>

                                    {projeto.status_proposta_dtc && (
                                        <div className="d-flex align-items-center flex-wrap">
                                            <strong className="me-2">Status da Proposta:</strong>
                                            <Badge bg={getStatusPropostaBadge(projeto.status_proposta_dtc)} text="light">
                                                {projeto.status_proposta_dtc}
                                            </Badge>
                                            {projeto.status_proposta_dtc === 'Concluída' && (
                                                <Button variant="danger" size="sm" onClick={handleEnviarParaRevisao} className="ms-2">
                                                    Enviar para Revisão
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* CARD DO FEED DE ATIVIDADES */}
                    <Card className="mt-4">
                        <Card.Header>
                            <Tabs activeKey={abaAtiva} onSelect={(k) => setAbaAtiva(k)} id="activity-tabs" className="mb-0">
                                <Tab eventKey="nota" title={<><i className="bi bi-chat-right-text me-2"></i>Nota</>}></Tab>
                                <Tab eventKey="tarefa" title={<><i className="bi bi-check2-circle me-2"></i>Tarefa</>}></Tab>
                                <Tab eventKey="ligacao" title={<><i className="bi bi-telephone me-2"></i>Ligação</>}></Tab>
                                <Tab eventKey="reuniao" title={<><i className="bi bi-people me-2"></i>Reunião</>}></Tab>
                            </Tabs>
                        </Card.Header>
                        <Card.Body>
                            {abaAtiva === 'nota' && (
                                <InputGroup>
                                    <Form.Control as="textarea" rows={2} placeholder="Adicione uma nota sobre este projeto..." value={textoNota} onChange={(e) => setTextoNota(e.target.value)} />
                                    <Button onClick={() => handleAddAtividade('Nota', { descricao: textoNota })} disabled={atividadeLoading}>{atividadeLoading ? <Spinner size="sm" /> : 'Registrar'}</Button>
                                </InputGroup>
                            )}
                            {abaAtiva === 'tarefa' && (
                                <Row>
                                    <Col md={8}>
                                        <Form.Control as="textarea" rows={2} placeholder="Descreva a tarefa..." value={textoAtividade} onChange={(e) => setTextoAtividade(e.target.value)} />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label>Data de Conclusão</Form.Label>
                                        <Form.Control type="datetime-local" value={dataTarefa} onChange={(e) => setDataTarefa(e.target.value)} />
                                    </Col>
                                    <Col md={12} className="text-end mt-2">
                                        <Button onClick={() => handleAddAtividade('Tarefa', { descricao: textoAtividade, data: dataTarefa })} disabled={atividadeLoading}>{atividadeLoading ? <Spinner size="sm" /> : 'Criar Tarefa'}</Button>
                                    </Col>
                                </Row>
                            )}
                            {abaAtiva === 'ligacao' && (
                                <InputGroup>
                                    <Form.Control as="textarea" rows={2} placeholder="Descreva o que foi discutido na ligação..." value={textoAtividade} onChange={(e) => setTextoAtividade(e.target.value)} />
                                    <Button onClick={() => handleAddAtividade('Ligação', { descricao: textoAtividade })} disabled={atividadeLoading}>{atividadeLoading ? <Spinner size="sm" /> : 'Registrar'}</Button>
                                </InputGroup>
                            )}
                            {abaAtiva === 'reuniao' && (
                                <InputGroup>
                                    <Form.Control as="textarea" rows={2} placeholder="Descreva a pauta e o que foi decidido na reunião..." value={textoAtividade} onChange={(e) => setTextoAtividade(e.target.value)} />
                                    <Button onClick={() => handleAddAtividade('Reunião', { descricao: textoAtividade })} disabled={atividadeLoading}>{atividadeLoading ? <Spinner size="sm" /> : 'Registrar'}</Button>
                                </InputGroup>
                            )}
                        </Card.Body>
                        <hr className="my-0" />
                        <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {atividades.map(ativ => {
                                const isTask = ativ.tipo_atividade === 'Tarefa';
                                const isOverdue = isTask && !ativ.concluida && new Date(ativ.data_conclusao_prevista) < new Date();

                                return (
                                    <ListGroup.Item key={ativ.id} className={`d-flex align-items-start border-0 px-3 py-3 ${ativ.concluida ? 'bg-light' : ''}`}>
                                        <div className="d-flex flex-column align-items-center me-3">
                                            {isTask ? (
                                                <FormCheck type="checkbox" checked={!!ativ.concluida} onChange={() => handleToggleTask(ativ.id, !!ativ.concluida)} className="task-checkbox" />
                                            ) : (
                                                <div className="icon-circle-sm bg-light">{renderAtividadeIcone(ativ.tipo_atividade)}</div>
                                            )}
                                        </div>
                                        <div className="w-100">
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <strong>{ativ.nome_usuario || 'Usuário'}</strong>
                                                    <small className="text-muted ms-2">adicionou uma {ativ.tipo_atividade.toLowerCase()}</small>
                                                </div>
                                                <small className="text-muted">{formatDate(ativ.data_criacao)}</small>
                                            </div>
                                            <p className={`mb-1 ${ativ.concluida ? 'text-decoration-line-through text-muted' : ''}`} style={{ whiteSpace: 'pre-wrap' }}>{ativ.descricao}</p>
                                            {isTask && !ativ.concluida && ativ.data_conclusao_prevista && (
                                                <small className={isOverdue ? 'text-danger fw-bold' : 'text-muted'}>
                                                    Vencimento: {formatDate(ativ.data_conclusao_prevista)}
                                                    {isOverdue && " (Atrasada)"}
                                                </small>
                                            )}
                                        </div>
                                    </ListGroup.Item>
                                )
                            })}
                            {atividades.length === 0 && !loading && <p className="text-muted text-center py-3">Nenhuma atividade registrada ainda.</p>}
                        </ListGroup>
                    </Card>

                    {/* NOVA SEÇÃO DE PEDIDOS COM ACCORDION */}
                    {['55% - Envio de Proposta - Projeto','35% - POC','75% - Aguardando Aprovação', '95% - Pedido Fechado','98% - Parcialmente Entregue',
    '100% - Faturado e Entregue',
    'Ganho'].includes(projeto.etapa_funil) && (
                        <Card className="mt-4">
                            <Card.Header><h5>Gestão de Pedidos (ERP)</h5></Card.Header>
                            <Card.Body>
                                <InputGroup className="mb-4">   
                                    <Form.Control
                                        placeholder="Insira o N° do Pedido do ERP para vincular"
                                        value={numeroPedidoErp}
                                        onChange={(e) => { setNumeroPedidoErp(e.target.value); setImportError(''); }}
                                    />
                                    <Button variant="success" onClick={handleVerificarPedido} disabled={!numeroPedidoErp.trim() || importLoading}>
                                        {importLoading ? <Spinner size="sm"/> : <><i className="bi bi-search me-2"></i>Verificar e Vincular</>}
                                    </Button>
                                </InputGroup>
                                {importError && <Alert variant="danger">{importError}</Alert>}
                                <hr/>
                                <h6>Pedidos Vinculados</h6>
                                {projeto.pedidos && projeto.pedidos.length > 0 ? (
                                    <Accordion>
                                        {projeto.pedidos.map(p => (
                                            <PedidoAccordionItem key={p.id} projetoId={projeto.id} pedidoVinculado={p} onDesvincular={handleDesvincularPedido} />
                                        ))}
                                    </Accordion>
                                ) : (
                                    <p className="text-muted">Nenhum pedido vinculado a este projeto.</p>
                                )}
                            </Card.Body>
                        </Card>
                    )}

                    {/* CARD DE DOCUMENTOS */}
                    <Card className="mt-4">
                        <Card.Header>
                            <h5>Documentos do Projeto</h5>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush" className="mb-3">
                                {documentos.length > 0 ? (
                                    documentos.map(doc => (
                                        <ListGroup.Item key={doc.id} className="d-flex justify-content-between align-items-center">
                                            <a href={doc.caminho_arquivo} target="_blank" rel="noopener noreferrer">
                                                {doc.nome_original}
                                            </a>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteDocument(doc.id)}>
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <p className="text-muted">Nenhum documento anexado.</p>
                                )}
                            </ListGroup>
                            <Form onSubmit={handleFileUpload}>
                                <Form.Group>
                                    <Form.Label>Anexar Novo Documento</Form.Label>
                                    <Form.Control type="file" onChange={(e) => setFileToUpload(e.target.files[0])} />
                                </Form.Group>
                                <Button variant="secondary" type="submit" className="mt-2" size="sm">
                                    Enviar Documento
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Container>
            </div>

            {/* MODAIS */}
            {projeto && (
                <ProjetoFormModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    onSuccess={handleProjectUpdated}
                    projetoParaEditar={projeto}
                />
            )}

            <Modal show={showLostModal} onHide={() => setShowLostModal(false)}>
                <Modal.Header closeButton><Modal.Title>Marcar Projeto como Perdido</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p>Tem certeza que deseja marcar o projeto <strong>"{projeto?.nome_projeto}"</strong> como perdido?</p>
                    <Form.Group>
                        <Form.Label>Motivo da Perda (obrigatório)</Form.Label>
                        <Form.Control as="textarea" rows={3} value={motivoPerda} onChange={(e) => setMotivoPerda(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLostModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleMarkAsLost}>Confirmar Perda</Button>
                </Modal.Footer>
            </Modal>

            <PedidoErpModal
                show={showPedidoModal}
                onHide={() => setShowPedidoModal(false)}
                pedido={pedidoImportado}
                isLinking={isLinking}
                onConfirmar={handleAtrelarPedido}
            />
        </div>
    );
};

export default DetalhesProjeto;