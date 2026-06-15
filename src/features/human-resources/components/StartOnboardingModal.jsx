import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../../services/api';

const StartOnboardingModal = ({ show, onHide, employeeId, onSuccess }) => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            const fetchTemplates = async () => {
                setLoading(true);
                try {
                    const response = await apiClient.get('/api/onboarding-templates');
                    setTemplates(response.data);
                    if (response.data.length > 0) {
                        setSelectedTemplate(response.data[0].id);
                    }
                } catch (err) {
                    setError('Erro ao carregar modelos de onboarding.');
                } finally {
                    setLoading(false);
                }
            };
            fetchTemplates();
        }
    }, [show]);

    const handleSubmit = async () => {
        if (!selectedTemplate) {
            setError('Por favor, selecione um modelo.');
            return;
        }
        try {
            await apiClient.post(`/api/funcionarios/${employeeId}/iniciar-onboarding`, {
                template_id: selectedTemplate
            });
            onSuccess();
        } catch (err) {
            setError('Erro ao iniciar o processo de onboarding.');
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Iniciar Processo de Onboarding</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form.Group>
                    <Form.Label>Selecione o Modelo de Onboarding</Form.Label>
                    {loading ? <Spinner size="sm" /> : (
                        <Form.Select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                        </Form.Select>
                    )}
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={!selectedTemplate || loading}>Iniciar</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default StartOnboardingModal;