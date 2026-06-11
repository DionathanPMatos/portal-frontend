import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../../services/api';

const BookingFormModal = ({ show, onHide, onSuccess }) => {
    const [formData, setFormData] = useState({
        titulo: '',
        nome_cliente: '',
        interesse_cliente: '',
        local_id: '',
        data_inicio_visita: '',
        data_fim_visita: '',
        visitantes: '',
        observacoes: '',
        filial_id: ''
    });
    const [locais, setLocais] = useState([]);
    const [filiais, setFiliais] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show) {
            const fetchData = async () => {
                try {
                    const [locaisRes, filiaisRes] = await Promise.all([
                        apiClient.get('/api/marketing/locais'),
                        apiClient.get('/api/unidades')
                    ]);
                    setLocais(locaisRes.data);
                    setFiliais(filiaisRes.data);
                } catch (err) {
                    console.error(err);
                    setError('Falha ao carregar locais e filiais.');
                }
            };
            fetchData();
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validação simples
        if (new Date(formData.data_fim_visita) <= new Date(formData.data_inicio_visita)) {
            setError('A data final deve ser posterior à data inicial.');
            setLoading(false);
            return;
        }

        try {
            await apiClient.post('/api/marketing/reservas', formData);
            onSuccess(); // Chama a função de sucesso do componente pai
            handleClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Ocorreu um erro ao criar a reserva.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            titulo: '', nome_cliente: '', interesse_cliente: '', local_id: '',
            data_inicio_visita: '', data_fim_visita: '', visitantes: '', observacoes: '', filial_id: ''
        });
        setError(null);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Solicitar Reserva de Sala/Showroom</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Título do Compromisso</Form.Label>
                                <Form.Control type="text" name="titulo" value={formData.titulo} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome do Cliente</Form.Label>
                                <Form.Control type="text" name="nome_cliente" value={formData.nome_cliente} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Filial Solicitante</Form.Label>
                                <Form.Select name="filial_id" value={formData.filial_id} onChange={handleChange}>
                                    <option value="">Selecione a filial...</option>
                                    {filiais.map(f => <option key={f.id} value={f.id}>{f.nome_unidade}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Interesse do Cliente</Form.Label>
                                <Form.Control as="textarea" rows={2} name="interesse_cliente" value={formData.interesse_cliente} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Local Desejado</Form.Label>
                                <Form.Select name="local_id" value={formData.local_id} onChange={handleChange} required>
                                    <option value="">Selecione o local...</option>
                                    {locais.map(local => <option key={local.id} value={local.id}>{local.nome}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Início da Visita</Form.Label>
                                <Form.Control type="datetime-local" name="data_inicio_visita" value={formData.data_inicio_visita} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Fim da Visita</Form.Label>
                                <Form.Control type="datetime-local" name="data_fim_visita" value={formData.data_fim_visita} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nomes dos Visitantes (separados por vírgula)</Form.Label>
                                <Form.Control as="textarea" rows={2} name="visitantes" value={formData.visitantes} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Observações Adicionais</Form.Label>
                                <Form.Control as="textarea" rows={2} name="observacoes" value={formData.observacoes} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Enviar Solicitação'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default BookingFormModal;
