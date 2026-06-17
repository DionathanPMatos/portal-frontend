import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Alert, Spinner, Table, Badge, Tabs, Tab, Modal, ListGroup, Form } from 'react-bootstrap';
import { FaCalendarAlt, FaPlus, FaList, FaTasks, FaHistory, FaUsers, FaTags, FaCheck, FaTimes, FaUserTie, FaCogs, FaTrash } from 'react-icons/fa';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../../styles/Dashboard.css'; // Importa o CSS para o cabeçalho padrão
import apiClient from '../../../services/api';
import BookingFormModal from '../components/BookingFormModal';
import ManageBookingCategories from '../components/ManageBookingCategories'; // NOVO
import ManageBookingInterests from '../components/ManageBookingInterests'; // NOVO
import { useAuth } from '../../../contexts/AuthContext';

const locales = {
    'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const calendarMessages = {
    allDay: 'Dia Inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    showMore: total => `+ Ver mais (${total})`
};

const ReserveRoomPage = () => {
    const [eventos, setEventos] = useState([]);
    const [minhasReservas, setMinhasReservas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false); // Para o modal de visualização
    const [initialBookingData, setInitialBookingData] = useState(null); // Para pré-preencher o modal de nova reserva

    // State for management tab
    const { user } = useAuth();
    const [funcionarios, setFuncionarios] = useState([]);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [apresentadorId, setApresentadorId] = useState('');
    const [showPresenterSelect, setShowPresenterSelect] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showRefusalReason, setShowRefusalReason] = useState(false);
    const [motivoRecusa, setMotivoRecusa] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date()); // Controla qual dia/mês está visível
    const [currentView, setCurrentView] = useState('month');     // Controla se está vendo Mês, Semana ou Dia

    const canManage = user && (user.privilegios?.includes('admin') || user.privilegios?.includes('marketing'));

    const handleSelectEvent = useCallback((event) => {
        const fullReserva = minhasReservas.find(r => r.id === event.id);
        if (fullReserva) {
            setSelectedReserva(fullReserva);
            // Se o usuário pode gerenciar e a reserva está pendente, abre o modal de aprovação
            if (canManage && fullReserva.status === 'Pendente') {
                handleShowApprovalModal(fullReserva);
            } else {
                // Caso contrário, abre o modal de apenas visualização
                setShowDetailsModal(true);
            }
        }
    }, [minhasReservas, canManage]);

    const handleSelectSlot = useCallback((slotInfo) => {
        // Impede a criação de reservas no passado
        if (new Date(slotInfo.start) < new Date()) return;

        setInitialBookingData({ data_inicio_visita: slotInfo.start, data_fim_visita: slotInfo.end });
        setShowModal(true);
    }, []);
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const requests = [
                apiClient.get('/api/marketing/reservas/calendario'),
                apiClient.get('/api/marketing/reservas'),
                apiClient.get('/api/marketing/reservas/categorias')
            ];

            if (canManage) {
                requests.push(apiClient.get('/api/funcionarios'));
            }

            const responses = await Promise.all(requests);
            
            const eventosRes = responses[0];
            const reservasRes = responses[1];
            const categoriasRes = responses[2];
            
            // Converte as datas para objetos Date para o calendário
            const formattedEvents = eventosRes.data.map(ev => ({
                ...ev,
                start: new Date(ev.start),
                end: new Date(ev.end),
            }));

            setEventos(formattedEvents);
            setMinhasReservas(reservasRes.data);
            setCategorias(categoriasRes.data);

            if (canManage) {
                setFuncionarios(responses[3].data);
            }
        } catch (err) {
            setError('Falha ao carregar os dados de reserva.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [canManage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSuccess = () => {
        setSuccess('Sua solicitação de reserva foi enviada com sucesso e aguarda aprovação.');
        fetchData(); // Recarrega os dados após o sucesso
        setTimeout(() => setSuccess(null), 5000);
    };

    const getStatusBadge = (status) => {
        const variants = {
            'Pendente': 'warning',
            'Aprovado': 'success',
            'Recusado': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    // --- Management Handlers ---
    const handleShowApprovalModal = (reserva) => {
        setSelectedReserva(reserva);
        setShowPresenterSelect(false);
        setShowRefusalReason(false);
        setApresentadorId('');
        setMotivoRecusa('');
        setShowApprovalModal(true);
    };

    const handleCloseApprovalModal = () => {
        setShowApprovalModal(false);
        setSelectedReserva(null);
        setError(null); // Clear modal-specific errors
    };

    const handleDecision = async (status) => {
        if (status === 'Aprovado' && !apresentadorId) {
            setError('Por favor, selecione um apresentador para aprovar a reserva.');
            return;
        }
        if (status === 'Recusado' && !motivoRecusa.trim()) {
            setError('Por favor, informe o motivo da recusa.');
            return;
        }
        setActionLoading(true);
        setError(null);
        try {
            await apiClient.put(`/api/marketing/reservas/${selectedReserva.id}/aprovar`, {
                status,
                apresentador_id: status === 'Aprovado' ? parseInt(apresentadorId) : null,
                motivo_recusa: status === 'Recusado' ? motivoRecusa : null
            });
            setSuccess(`Reserva #${selectedReserva.id} foi ${status.toLowerCase()} com sucesso!`);
            handleCloseApprovalModal();
            fetchData();
            window.dispatchEvent(new Event('notificacao-atualizada'));
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao processar a decisão.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteReserva = async (reservaId) => {
        if (window.confirm(`Tem certeza que deseja excluir permanentemente a reserva #${reservaId}? Esta ação não pode ser desfeita.`)) {
            try {
                await apiClient.delete(`/api/marketing/reservas/${reservaId}`);
                setSuccess(`Reserva #${reservaId} foi excluída com sucesso.`);
                fetchData(); // Recarrega os dados para atualizar a lista
            } catch (err) {
                setError(err.response?.data?.error || 'Erro ao excluir a reserva.');
                console.error(err);
            }
        }
    };

    // Filtros para as abas
    const pendingReservas = canManage ? minhasReservas.filter(r => r.status === 'Pendente') : [];
    const processedReservas = canManage ? minhasReservas.filter(r => r.status !== 'Pendente') : [];

    // Filtro para a aba "Minhas Reservas" - mostra apenas as do usuário logado
    const userReservas = user ? minhasReservas.filter(r => r.solicitante_id === user.id) : [];

    // Callback para estilizar os eventos no calendário com base na categoria
    const eventPropGetter = useCallback((event) => {
        // O 'event.color' agora contém a cor da categoria, vinda do backend
        const backgroundColor = event.color || '#6c757d';
        return { style: { backgroundColor, borderColor: backgroundColor } };
    }, []);

    return (
        <div className="p-3">
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

            {loading ? (
                <div className="text-center p-5"><Spinner animation="border" /></div>
            ) : (
                <Tabs defaultActiveKey="calendario" id="reserva-tabs" className="mb-4 custom-tabs bg-white p-3 rounded shadow-sm">
                    <Tab eventKey="calendario" title={<><FaCalendarAlt className="me-2" />Disponibilidade</>}>
                        <Card className="shadow-sm border-0 mt-3">
                            <Card.Body>
                                <p className="text-muted">Calendário de reservas já <strong>aprovadas</strong>. Use os horários livres para sua solicitação.</p>
                                <div style={{ height: '600px' }}>
                                    <Calendar
                                        localizer={localizer}
                                        selectable
                                        events={eventos}
                                        startAccessor="start"
                                        endAccessor="end"
                                        style={{ height: '600px' }}
                                        messages={calendarMessages}
                                        culture="pt-BR"
                                        onSelectEvent={handleSelectEvent}
                                        onSelectSlot={handleSelectSlot}
                                                date={currentDate}
                                        view={currentView}
                                        onNavigate={(newDate) => setCurrentDate(newDate)}
                                        onView={(newView) => setCurrentView(newView)}
                                        eventPropGetter={(event) => {
                                            let backgroundColor = '#007bff';
                                            if (event.status === 'Aprovado') backgroundColor = '#28a745';
                                            if (event.status === 'Recusado') backgroundColor = '#dc3545';
                                            return { style: { backgroundColor, color: 'white', borderRadius: '4px' } };
                                        }}    
                                    />
                                </div>
                                <div className="mt-4 pt-3 border-top">
                                    <h6 className="text-muted small">LEGENDA DE CORES</h6>
                                    <div className="d-flex flex-wrap gap-3">
                                        {categorias.map(cat => (
                                            <div key={cat.id} className="d-flex align-items-center gap-2">
                                                <div style={{ width: '15px', height: '15px', backgroundColor: cat.cor, borderRadius: '3px', border: '1px solid #ddd' }}></div>
                                                <span className="small">{cat.nome}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Tab>
                    <Tab eventKey="solicitacoes" title={<><FaList className="me-2" />Minhas Reservas</>}>
                        <Card className="shadow-sm border-0 mt-3">
                            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                                <h5 className="mb-0 fw-bold text-dark">Minhas Solicitações</h5>
                                <Button variant="primary" onClick={() => setShowModal(true)}>
                                    <FaPlus className="me-2" /> Nova Solicitação
                                </Button>
                            </Card.Header>
                            <Table responsive hover className="align-middle mb-0">
                                <thead className="text-muted small text-uppercase">
                                    <tr>
                                        <th>Compromisso</th>
                                        <th>Cliente</th>
                                        <th>Local</th>
                                        <th>Data</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userReservas.length > 0 ? userReservas.map(res => (
                                        <tr key={res.id}>
                                            <td className="fw-bold">{res.titulo}</td>
                                            <td>{res.nome_cliente}</td>
                                            <td>{res.local?.nome || 'N/A'}</td>
                                            <td>{new Date(res.data_inicio_visita).toLocaleString()}</td>
                                            <td>
                                                {getStatusBadge(res.status)}
                                                {res.status === 'Recusado' && res.motivo_recusa && (
                                                    <div className="text-muted small mt-1" title={res.motivo_recusa}>
                                                        Motivo: {res.motivo_recusa.substring(0, 30)}{res.motivo_recusa.length > 30 ? '...' : ''}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="text-center py-4 text-muted">Nenhuma solicitação encontrada.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card>
                    </Tab>
                    {canManage && (
                        <Tab eventKey="gerenciar" title={<><FaTasks className="me-2" />Gerenciar Solicitações <Badge pill bg="danger">{pendingReservas.length}</Badge></>}>
                            <Tabs defaultActiveKey="pendentes" className="mb-3 mt-3 nav-pills">
                                <Tab eventKey="pendentes" title={<>Pendentes <Badge pill bg="warning">{pendingReservas.length}</Badge></>}>
                                    <Card className="shadow-sm border-0">
                                        <Card.Header className="fw-bold">Solicitações Pendentes de Aprovação</Card.Header>
                                        <Table responsive hover className="align-middle mb-0">
                                            <thead><tr><th>Solicitante</th><th>Cliente</th><th>Local</th><th>Período</th><th>Ação</th></tr></thead>
                                            <tbody>
                                                {pendingReservas.length > 0 ? pendingReservas.map(res => (
                                                    <tr key={res.id}>
                                                        <td>{res.solicitante.nome_completo}</td>
                                                        <td>{res.nome_cliente}</td>
                                                        <td>{res.local.nome}</td>
                                                        <td>{new Date(res.data_inicio_visita).toLocaleString()} até {new Date(res.data_fim_visita).toLocaleString()}</td>
                                                        <td><Button variant="primary" size="sm" onClick={() => handleShowApprovalModal(res)}>Gerenciar</Button></td>
                                                    </tr>
                                                )) : <tr><td colSpan="5" className="text-center py-4 text-muted">Nenhuma reserva pendente.</td></tr>}
                                            </tbody>
                                        </Table>
                                    </Card>
                                </Tab>
                                <Tab eventKey="historico" title={<><FaHistory className="me-2" />Histórico</>}>
                                    <Card className="shadow-sm border-0">
                                        <Card.Header className="fw-bold">Histórico de Solicitações Processadas</Card.Header>
                                        <Table responsive hover className="align-middle mb-0 small">
                                            <thead><tr><th>Solicitante</th><th>Cliente</th><th>Local</th><th>Período</th><th>Apresentador</th><th>Processado por</th><th>Status</th><th className="text-end">Ações</th></tr></thead>
                                            <tbody>
                                                {processedReservas.length > 0 ? processedReservas.map(res => (
                                                    <tr key={res.id}>
                                                        <td>{res.solicitante.nome_completo}</td>
                                                        <td>{res.nome_cliente}</td>
                                                        <td>{res.local.nome}</td>
                                                        <td>{new Date(res.data_inicio_visita).toLocaleString()}</td>
                                                        <td>{res.apresentador?.nome_completo || '-'}</td>
                                                        <td>{res.aprovador?.nome_completo || 'N/A'}</td>
                                                        <td>
                                                            {getStatusBadge(res.status)}
                                                            {res.status === 'Recusado' && res.motivo_recusa && (
                                                                <div className="text-muted small mt-1" title={res.motivo_recusa}>
                                                                    Motivo: {res.motivo_recusa.substring(0, 30)}{res.motivo_recusa.length > 30 ? '...' : ''}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="text-end">
                                                            <Button variant="light" size="sm" className="text-danger" onClick={() => handleDeleteReserva(res.id)} title="Excluir Reserva Permanentemente">
                                                                <FaTrash />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )) : <tr><td colSpan="8" className="text-center py-4 text-muted">Nenhuma reserva processada.</td></tr>}
                                            </tbody>
                                        </Table>
                                    </Card>
                                </Tab>
                            </Tabs>
                        </Tab>
                    )}
                    {canManage && (
                        <Tab eventKey="configuracoes" title={<><FaCogs className="me-2" />Configurações</>}>
                            <p className="text-muted mt-3">Gerencie as opções disponíveis para o agendamento de visitas.</p>
                            <Tabs defaultActiveKey="categorias" className="mb-3 nav-pills">
                                <Tab eventKey="categorias" title="Categorias de Reserva">
                                    <ManageBookingCategories />
                                </Tab>
                                <Tab eventKey="interesses" title="Áreas de Interesse">
                                    <ManageBookingInterests />
                                </Tab>
                            </Tabs>
                        </Tab>
                    )}
                </Tabs>
            )}

            <BookingFormModal
                show={showModal}
                onHide={() => {
                    setShowModal(false);
                    setInitialBookingData(null); // Limpa os dados ao fechar
                }}
                onSuccess={handleSuccess}
                initialData={initialBookingData}
            />

            {/* Approval Modal */}
            {canManage && selectedReserva && (
                <Modal show={showApprovalModal} onHide={handleCloseApprovalModal} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Analisar Solicitação de Reserva #{selectedReserva.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item><strong>Título:</strong> {selectedReserva.titulo}</ListGroup.Item>
                            <ListGroup.Item><strong>Solicitante:</strong> {selectedReserva.solicitante.nome_completo}</ListGroup.Item>
                            <ListGroup.Item><strong>Cliente:</strong> {selectedReserva.nome_cliente}</ListGroup.Item>
                            <ListGroup.Item><strong><FaTags className="me-2" />Interesses:</strong> {selectedReserva.interesses?.length > 0 ? selectedReserva.interesses.map(i => <Badge key={i.interesse_id} bg="info" className="me-1">{i.interesse.nome}</Badge>) : 'N/A'}</ListGroup.Item>
                            <ListGroup.Item><strong>Local:</strong> {selectedReserva.local.nome}</ListGroup.Item>
                            <ListGroup.Item><strong>Início:</strong> {new Date(selectedReserva.data_inicio_visita).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</ListGroup.Item>
                            <ListGroup.Item><strong>Fim:</strong> {new Date(selectedReserva.data_fim_visita).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</ListGroup.Item>
                            <ListGroup.Item><strong>Visitantes:</strong> {selectedReserva.visitantes || 'N/A'}</ListGroup.Item>
                            <ListGroup.Item><strong><FaUsers className="me-2" />Participantes Internos:</strong> {selectedReserva.participantes?.length > 0 ? selectedReserva.participantes.map(p => <div key={p.funcionario_id}><Badge pill bg="secondary">{p.funcionario.nome_completo}</Badge></div>) : 'Nenhum'}</ListGroup.Item>
                            <ListGroup.Item><strong>Observações:</strong> {selectedReserva.observacoes || 'N/A'}</ListGroup.Item>
                        </ListGroup>

                        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                        {showRefusalReason && (
                            <Card className="mt-3 bg-light border-danger"><Card.Body>
                                <Form.Group>
                                    <Form.Label className="fw-bold text-danger">Motivo da Recusa</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={motivoRecusa}
                                        onChange={e => setMotivoRecusa(e.target.value)}
                                        placeholder="Descreva o motivo pelo qual a reserva está sendo recusada."
                                        required
                                    />
                                </Form.Group>
                            </Card.Body></Card>
                        )}

                        {showPresenterSelect && (
                            <Card className="mt-3 bg-light border"><Card.Body>
                                <Form.Group>
                                    <Form.Label className="fw-bold"><FaUserTie className="me-2" />Selecione o Apresentador</Form.Label>
                                    <Form.Select value={apresentadorId} onChange={e => setApresentadorId(e.target.value)} required>
                                        <option value="">-- Escolha um colaborador --</option>
                                        {funcionarios.map(f => (<option key={f.id} value={f.id}>{f.nome_completo}</option>))}
                                    </Form.Select>
                                </Form.Group>
                            </Card.Body></Card>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="d-flex justify-content-between">
                        <Button variant="secondary" onClick={handleCloseApprovalModal} disabled={actionLoading}>Cancelar</Button>
                        <div className="d-flex gap-2">
                            {!showRefusalReason ? (
                                <Button variant="danger" onClick={() => setShowRefusalReason(true)} disabled={actionLoading || showPresenterSelect}>
                                    <FaTimes className="me-2" />Recusar
                                </Button>
                            ) : (
                                <Button variant="danger" onClick={() => handleDecision('Recusado')} disabled={actionLoading || !motivoRecusa}>
                                    {actionLoading ? <Spinner size="sm" /> : 'Confirmar Recusa'}
                                </Button>
                            )}

                            {!showPresenterSelect ? (<Button variant="success" onClick={() => setShowPresenterSelect(true)} disabled={actionLoading || showRefusalReason}><FaCheck className="me-2" />Aprovar...</Button>
                            ) : (<Button variant="success" onClick={() => handleDecision('Aprovado')} disabled={actionLoading || !apresentadorId}>{actionLoading ? <Spinner size="sm" /> : 'Confirmar Aprovação'}</Button>)}
                        </div>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Details Modal (Read-only) */}
            {selectedReserva && (
                <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Detalhes da Reserva #{selectedReserva.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item><strong>Status:</strong> {getStatusBadge(selectedReserva.status)}</ListGroup.Item>
                            {selectedReserva.status === 'Recusado' && selectedReserva.motivo_recusa && <ListGroup.Item><strong>Motivo da Recusa:</strong> {selectedReserva.motivo_recusa}</ListGroup.Item>}
                            <ListGroup.Item><strong>Título:</strong> {selectedReserva.titulo}</ListGroup.Item>
                            <ListGroup.Item><strong>Solicitante:</strong> {selectedReserva.solicitante.nome_completo}</ListGroup.Item>
                            <ListGroup.Item><strong>Cliente:</strong> {selectedReserva.nome_cliente}</ListGroup.Item>
                            <ListGroup.Item><strong><FaTags className="me-2" />Interesses:</strong> {selectedReserva.interesses?.length > 0 ? selectedReserva.interesses.map(i => <Badge key={i.interesse_id} bg="info" className="me-1">{i.interesse.nome}</Badge>) : 'N/A'}</ListGroup.Item>
                            <ListGroup.Item><strong><FaUsers className="me-2" />Participantes Internos:</strong> {selectedReserva.participantes?.length > 0 ? selectedReserva.participantes.map(p => <div key={p.funcionario_id}><Badge pill bg="secondary">{p.funcionario.nome_completo}</Badge></div>) : 'Nenhum'}</ListGroup.Item>
                            <ListGroup.Item><strong>Observações:</strong> {selectedReserva.observacoes || 'N/A'}</ListGroup.Item>
                        </ListGroup>
                    </Modal.Body>
                    <Modal.Footer><Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Fechar</Button></Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default ReserveRoomPage;
