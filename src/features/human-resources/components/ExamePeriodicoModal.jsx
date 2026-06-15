import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../../../services/api';

const motivoOptions = ["Admissional", "Demissional", "Periódico", "Mudança de Cargo", "Retorno ao Trabalho", "Outro"];
const statusOptions = ["Pendente", "Concluído", "Atrasado"];

const ExamePeriodicoModal = ({ show, onHide, onSaveSuccess, employeeId, exameToEdit }) => {
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show) {
            if (exameToEdit) {
                setFormData({
                    ...exameToEdit,
                    data_exame: exameToEdit.data_exame ? exameToEdit.data_exame.split('T')[0] : '',
                });
            } else {
                resetForm();
            }
            setFile(null);
        }
    }, [exameToEdit, show]);

    const resetForm = () => {
        setFormData({
            data_exame: '',
            motivo: '',
            status: 'Pendente',
            observacoes: '',
            anexo_url: null,
            anexo_nome_arquivo: null,
        });
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleRemoveAnexo = () => {
        setFormData(prev => ({ ...prev, anexo_url: null, anexo_nome_arquivo: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const submissionData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'anexo_url' && key !== 'anexo_nome_arquivo') {
                submissionData.append(key, formData[key] || '');
            }
        });
        if (file) {
            submissionData.append('file', file);
        } else if (formData.anexo_url === null) {
            submissionData.append('anexo_url', 'null'); // Signal to backend to delete
        }

        try {
            if (exameToEdit) {
                await apiClient.put(`/api/exames/${exameToEdit.id}`, submissionData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await apiClient.post(`/api/funcionarios/${employeeId}/exames`, submissionData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            onSaveSuccess();
            handleClose();
        } catch (err) {
            console.error('Erro ao salvar exame:', err);
            setError(err.response?.data?.error || 'Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{exameToEdit ? 'Editar Exame Periódico' : 'Adicionar Novo Exame'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Data do Exame*</Form.Label><Form.Control type="date" name="data_exame" value={formData.data_exame || ''} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Motivo</Form.Label><Form.Select name="motivo" value={formData.motivo || ''} onChange={handleChange}><option value="">Selecione...</option>{motivoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</Form.Select></Form.Group></Col>
                    </Row>
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select name="status" value={formData.status || ''} onChange={handleChange}>{statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</Form.Select></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Anexo</Form.Label>
                                {formData.anexo_url ? (
                                    <div className="d-flex align-items-center"><a href={formData.anexo_url} target="_blank" rel="noopener noreferrer" className="me-2">{formData.anexo_nome_arquivo}</a><Button variant="outline-danger" size="sm" onClick={handleRemoveAnexo}>Remover</Button></div>
                                ) : ( <Form.Control type="file" onChange={handleFileChange} /> )}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3"><Form.Label>Observações</Form.Label><Form.Control as="textarea" rows={3} name="observacoes" value={formData.observacoes || ''} onChange={handleChange} /></Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner as="span" size="sm" /> : 'Salvar'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ExamePeriodicoModal;