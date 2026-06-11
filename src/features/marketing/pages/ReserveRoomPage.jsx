import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Alert, Spinner, Table, Badge, Tabs, Tab } from 'react-bootstrap';
import { FaCalendarAlt, FaPlus, FaList } from 'react-icons/fa';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import apiClient from '../../../services/api';
import BookingFormModal from '../components/BookingFormModal';

// Configuração do localizador para o calendário
const localizer = momentLocalizer(moment);

const ReserveRoomPage = () => {
    const [eventos, setEventos] = useState([]);
    const [minhasReservas, setMinhasReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [eventosRes, reservasRes] = await Promise.all([
                apiClient.get('/api/marketing/reservas/calendario'),
                apiClient.get('/api/marketing/reservas')
            ]);
            
            // Converte as datas para objetos Date para o calendário
            const formattedEvents = eventosRes.data.map(ev => ({
                ...ev,
                start: new Date(ev.start),
                end: new Date(ev.end),
            }));

            setEventos(formattedEvents);
            setMinhasReservas(reservasRes.data);
        } catch (err) {
            setError('Falha ao carregar os dados de reserva.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

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

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <Container fluid className="px-0">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h2 className="fw-bold mb-1 text-dark">Reserva de Salas e Showroom</h2>
                            <p className="text-muted mb-0">Consulte a disponibilidade e faça sua solicitação.</p>
                        </div>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

                    {loading ? (
                        <div className="text-center p-5"><Spinner animation="border" /></div>
                    ) : (
                        <Tabs defaultActiveKey="calendario" id="reserva-tabs" className="mb-3 custom-tabs">
                            <Tab eventKey="calendario" title={<><FaCalendarAlt className="me-2" />Disponibilidade</>}>
                                <Card className="shadow-sm border-0">
                                    <Card.Body>
                                        <p className="text-muted">Calendário de reservas já <strong>aprovadas</strong>. Use os horários livres para sua solicitação.</p>
                                        <div style={{ height: '600px' }}>
                                            <Calendar
                                                localizer={localizer}
                                                events={eventos}
                                                startAccessor="start"
                                                endAccessor="end"
                                                style={{ height: '100%' }}
                                                messages={{
                                                    next: "Próximo",
                                                    previous: "Anterior",
                                                    today: "Hoje",
                                                    month: "Mês",
                                                    week: "Semana",
                                                    day: "Dia",
                                                    agenda: "Agenda",
                                                }}
                                            />
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Tab>
                            <Tab eventKey="solicitacoes" title={<><FaList className="me-2" />Minhas Reservas</>}>
                                <Card className="shadow-sm border-0">
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
                                            {minhasReservas.length > 0 ? minhasReservas.map(res => (
                                                <tr key={res.id}>
                                                    <td className="fw-bold">{res.titulo}</td>
                                                    <td>{res.nome_cliente}</td>
                                                    <td>{res.local.nome}</td>
                                                    <td>{new Date(res.data_inicio_visita).toLocaleString()}</td>
                                                    <td>{getStatusBadge(res.status)}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="5" className="text-center py-4 text-muted">Nenhuma solicitação encontrada.</td></tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Card>
                            </Tab>
                        </Tabs>
                    )}
                </Container>
            </div>
            <BookingFormModal show={showModal} onHide={() => setShowModal(false)} onSuccess={handleSuccess} />
        </div>
    );
};

export default ReserveRoomPage;
