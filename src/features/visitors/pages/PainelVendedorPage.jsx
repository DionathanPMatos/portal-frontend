import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Modal, Badge } from 'react-bootstrap';
import apiClient from '../../../services/api'; // Importa a instância configurada do Axios

export default function PainelVendedorPage() { // Renomeado
    const [visitas, setVisitas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [novaVisita, setNovaVisita] = useState({ cliente_id: '', data_visita: '', justificativa_objetivo: '' });
    const [feedbackVisita, setFeedbackVisita] = useState({ id: null, feedback: '', requerRetorno: false, dataRetorno: '' });

    useEffect(() => {
        carregarVisitas();
        carregarClientes();
    }, []);

    const carregarVisitas = async () => {
        try {
            const { data } = await apiClient.get('/api/visitas');
            setVisitas(data);
        } catch (error) {
            console.error(error);
        }
    };

    const carregarClientes = async () => {
        try {
            const response = await apiClient.get('/api/clientes');
            // A API de clientes retorna um objeto paginado { data: [...], total: ... }
            setClientes(response.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSolicitarVisita = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/api/visitas', novaVisita);
            setShowModal(false);
            setNovaVisita({ cliente_id: '', data_visita: '', justificativa_objetivo: '' });
            carregarVisitas();
        } catch (error) {
            console.error(error);
            alert('Erro ao solicitar visita.');
        }
    };

    const handleSalvarFeedback = async (e) => {
        e.preventDefault();
        try {
            await apiClient.patch(`/api/visitas/${feedbackVisita.id}/feedback`, {
                feedback_vendedor: feedbackVisita.feedback,
                requer_retorno: feedbackVisita.requerRetorno,
                data_retorno: feedbackVisita.dataRetorno
            });
            setShowFeedbackModal(false);
            setFeedbackVisita({ id: null, feedback: '', requerRetorno: false, dataRetorno: '' });
            carregarVisitas();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar feedback.');
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'Autorizada') return <Badge bg="success">Autorizada</Badge>;
        if (status === 'Recusada') return <Badge bg="danger">Recusada</Badge>;
        return <Badge bg="warning" text="dark">Pendente</Badge>;
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Minhas Visitas</h4>
                <Button variant="primary" onClick={() => setShowModal(true)}>+ Nova Solicitação</Button>
            </div>

            <Card className="shadow-sm">
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Objetivo</th>
                                <th>Status</th>
                                <th>Retorno Previsto</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitas.map(v => (
                                <tr key={v.id}>
                                    <td>{new Date(v.data_visita).toLocaleDateString()}</td>
                                    <td>{v.nome_cliente}</td>
                                    <td>{v.justificativa_objetivo}</td>
                                    <td>{getStatusBadge(v.status_autorizacao)}</td>
                                    <td>
                                        {v.data_retorno ? new Date(v.data_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : (v.feedback_vendedor && !v.requer_retorno ? 'Não' : '-')}
                                    </td>
                                    <td>
                                        {v.status_autorizacao === 'Autorizada' && !v.feedback_vendedor && (
                                            <Button size="sm" variant="info" onClick={() => { setFeedbackVisita({ id: v.id, feedback: '', requerRetorno: false, dataRetorno: '' }); setShowFeedbackModal(true); }}>
                                                Dar Feedback
                                            </Button>
                                        )}
                                        {v.feedback_vendedor && <Badge bg="secondary">Feedback Enviado</Badge>}
                                    </td>
                                </tr>
                            ))}
                            {visitas.length === 0 && <tr><td colSpan="6" className="text-center">Nenhuma visita encontrada.</td></tr>}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Modal Solicitar Visita */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form onSubmit={handleSolicitarVisita}>
                    <Modal.Header closeButton>
                        <Modal.Title>Solicitar Visita</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Cliente</Form.Label>
                            <Form.Select required value={novaVisita.cliente_id} onChange={(e) => setNovaVisita({ ...novaVisita, cliente_id: e.target.value })}>
                                <option value="">Selecione um cliente...</option>
                                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome_cliente}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Data da Visita</Form.Label>
                            <Form.Control type="date" required value={novaVisita.data_visita} onChange={(e) => setNovaVisita({ ...novaVisita, data_visita: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Justificativa/Objetivo</Form.Label>
                            <Form.Control as="textarea" rows={3} required value={novaVisita.justificativa_objetivo} onChange={(e) => setNovaVisita({ ...novaVisita, justificativa_objetivo: e.target.value })} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit">Solicitar</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Feedback */}
            <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)}>
                <Form onSubmit={handleSalvarFeedback}>
                    <Modal.Header closeButton>
                        <Modal.Title>Relatório da Visita</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Feedback</Form.Label>
                            <Form.Control as="textarea" rows={4} required value={feedbackVisita.feedback} onChange={(e) => setFeedbackVisita({ ...feedbackVisita, feedback: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check 
                                type="switch"
                                id="switch-retorno"
                                label="É necessário agendar um retorno neste cliente?"
                                checked={feedbackVisita.requerRetorno}
                                onChange={(e) => setFeedbackVisita({ ...feedbackVisita, requerRetorno: e.target.checked })}
                            />
                        </Form.Group>
                        {feedbackVisita.requerRetorno && (
                            <Form.Group className="mb-3">
                                <Form.Label>Data Sugerida para Retorno</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    required={feedbackVisita.requerRetorno}
                                    value={feedbackVisita.dataRetorno} 
                                    onChange={(e) => setFeedbackVisita({ ...feedbackVisita, dataRetorno: e.target.value })} 
                                />
                            </Form.Group>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit">Salvar Feedback</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}