import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner, ListGroup, InputGroup, Badge, Card } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import apiClient from '../../../services/api';

const OnboardingTemplateModal = ({ show, onHide }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Form state
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [etapas, setEtapas] = useState([{ titulo: '', descricao: '' }]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/onboarding-templates');
            setTemplates(response.data);
        } catch (err) {
            setError('Erro ao carregar modelos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (show) fetchData(); }, [show]);

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setNome(template.nome);
        setDescricao(template.descricao || '');
        setEtapas(template.etapas.length > 0 ? template.etapas : [{ titulo: '', descricao: '' }]);
    };

    const handleNew = () => {
        setEditingTemplate(null);
        setNome('');
        setDescricao('');
        setEtapas([{ titulo: '', descricao: '' }]);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza?')) {
            try {
                await apiClient.delete(`/api/onboarding-templates/${id}`);
                fetchData();
            } catch (err) { setError('Erro ao excluir.'); }
        }
    };

    const handleEtapaChange = (index, field, value) => {
        const newEtapas = [...etapas];
        newEtapas[index][field] = value;
        setEtapas(newEtapas);
    };

    const addEtapa = () => setEtapas([...etapas, { titulo: '', descricao: '' }]);
    const removeEtapa = (index) => setEtapas(etapas.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { nome, descricao, etapas: etapas.filter(e => e.titulo.trim() !== '') };
        try {
            if (editingTemplate) {
                await apiClient.put(`/api/onboarding-templates/${editingTemplate.id}`, payload);
            } else {
                await apiClient.post('/api/onboarding-templates', payload);
            }
            fetchData();
            handleNew();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar.');
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton><Modal.Title>Gerenciar Modelos de Onboarding</Modal.Title></Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Row>
                    <Col md={5}>
                        <h5>Modelos Cadastrados</h5>
                        {loading ? <Spinner size="sm" /> : (
                            <ListGroup>
                                {templates.map(t => (
                                    <ListGroup.Item key={t.id} action onClick={() => handleEdit(t)} active={editingTemplate?.id === t.id}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>{t.nome} <Badge bg="secondary">{t.etapas.length} etapas</Badge></span>
                                            <Button variant="light" size="sm" className="text-danger" onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}><FaTrash /></Button>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Col>
                    <Col md={7}>
                        <Form onSubmit={handleSubmit}>
                            <h5>{editingTemplate ? 'Editando Modelo' : 'Novo Modelo'} <Button variant="link" onClick={handleNew}>(Limpar)</Button></h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome do Modelo</Form.Label>
                                <Form.Control type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Descrição</Form.Label>
                                <Form.Control as="textarea" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                            </Form.Group>
                            <hr />
                            <h6>Etapas do Onboarding</h6>
                            {etapas.map((etapa, index) => (
                                <Card key={index} className="mb-2">
                                    <Card.Body>
                                        <InputGroup>
                                            <InputGroup.Text>{index + 1}</InputGroup.Text>
                                            <Form.Control
                                                placeholder="Título da etapa"
                                                value={etapa.titulo}
                                                onChange={(e) => handleEtapaChange(index, 'titulo', e.target.value)}
                                            />
                                            <Button variant="outline-danger" onClick={() => removeEtapa(index)}><FaTrash /></Button>
                                        </InputGroup>
                                    </Card.Body>
                                </Card>
                            ))}
                            <Button variant="outline-secondary" size="sm" onClick={addEtapa} className="mt-2"><FaPlus /> Adicionar Etapa</Button>

                            <div className="mt-4 d-flex justify-content-end">
                                <Button variant="primary" type="submit">{editingTemplate ? 'Salvar Alterações' : 'Criar Modelo'}</Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default OnboardingTemplateModal;