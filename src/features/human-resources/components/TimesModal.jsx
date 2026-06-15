import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import apiClient from '../../../services/api';

const TimesModal = ({ show, onHide }) => {
    const [times, setTimes] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingTime, setEditingTime] = useState(null);

    // Form state
    const [nome, setNome] = useState('');
    const [gestorId, setGestorId] = useState('');
    const [membrosIds, setMembrosIds] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [timesRes, funcsRes] = await Promise.all([
                apiClient.get('/api/times'),
                apiClient.get('/api/funcionarios')
            ]);
            setTimes(timesRes.data);
            setFuncionarios(funcsRes.data);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError('Erro ao carregar dados.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchData();
        }
    }, [show]);

    const handleEdit = (time) => {
        setEditingTime(time);
        setNome(time.nome);
        setGestorId(time.gestor_id || '');
        setMembrosIds(time.membros.map(m => m.id));
    };

    const handleNew = () => {
        setEditingTime(null);
        setNome('');
        setGestorId('');
        setMembrosIds([]);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este time? Os membros ficarão sem time.')) {
            try {
                await apiClient.delete(`/api/times/${id}`);
                fetchData();
            } catch (err) { 
                console.error('Erro ao excluir time:', err);
                setError('Erro ao excluir time.');
            }
        }
    };

    const handleMemberChange = (memberId) => {
        setMembrosIds(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            nome,
            gestor_id: gestorId || null,
            membros_ids: membrosIds,
        };

        try {
            if (editingTime) {
                await apiClient.put(`/api/times/${editingTime.id}`, payload);
            } else {
                await apiClient.post('/api/times', payload);
            }
            fetchData();
            handleNew(); // Reset form
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar time.');
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>Gerenciar Times</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Row>
                    <Col md={5}>
                        <h5>Times Cadastrados</h5>
                        {loading ? <Spinner animation="border" size="sm" /> : (
                            <ListGroup>
                                {times.map(time => (
                                    <ListGroup.Item key={time.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{time.nome}</strong>
                                            <div className="text-muted small">
                                                Gestor: {time.gestor?.nome_completo || 'N/A'} <Badge pill bg="secondary">{time.membros.length}</Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Button variant="light" size="sm" onClick={() => handleEdit(time)}><FaEdit /></Button>
                                            <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(time.id)}><FaTrash /></Button>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Col>
                    <Col md={7}>
                        <Form onSubmit={handleSubmit}>
                            <h5>{editingTime ? 'Editando Time' : 'Novo Time'}</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome do Time</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Gestor do Time</Form.Label>
                                <Form.Select value={gestorId} onChange={(e) => setGestorId(e.target.value)}>
                                    <option value="">Selecione um gestor...</option>
                                    {funcionarios.map(f => (
                                        <option key={f.id} value={f.id}>{f.nome_completo}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Membros do Time</Form.Label>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #dee2e6', padding: '1rem', borderRadius: '0.375rem' }}>
                                    {funcionarios.map(f => (
                                        <Form.Check
                                            key={f.id}
                                            type="checkbox"
                                            id={`member-${f.id}`}
                                            label={f.nome_completo}
                                            checked={membrosIds.includes(f.id)}
                                            onChange={() => handleMemberChange(f.id)}
                                        />
                                    ))}
                                </div>
                            </Form.Group>

                            <div className="mt-4 d-flex justify-content-end gap-2">
                                <Button variant="secondary" onClick={handleNew}>
                                    Cancelar Edição
                                </Button>
                                <Button variant="primary" type="submit">
                                    <FaPlus className="me-2" />
                                    {editingTime ? 'Salvar Alterações' : 'Criar Time'}
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default TimesModal;