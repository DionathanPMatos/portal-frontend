import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { IMaskInput } from 'react-imask';
import apiClient from '../../../services/api';

const parentescoOptions = [
    "Nenhum", "Cônjuge", "Companheiro(a)", "Filho(a) ou enteado(a)", 
    "Filho(a) ou enteado(a) universitário(a)", "Irmão(ã), neto(a) ou bisneto(a) com guarda judicial",
    "Irmão(ã), neto(a) ou bisneto(a) universitário(a) com guarda judicial",
    "Pais, avós e bisavós", "Menor pobre com guarda judicial",
    "Pessoa absolutamente incapaz (tutor ou curador)", "Agregado/Outros", "Ex-cônjuge"
];

const escolaridadeOptions = [
    "Nenhum", "Analfabeto", "Até o 5º ano incompleto do Ensino Fundamental",
    "5º ano completo do Ensino Fundamental", "Do 6º ao 9º ano do Ensino Fundamental incompleto",
    "Ensino Fundamental completo", "Ensino Médio incompleto", "Ensino Médio completo",
    "Técnico incompleto", "Técnico completo", "Tecnólogo incompleto", "Tecnólogo completo",
    "Educação Superior incompleta", "Educação Superior completa",
    "Pós-graduação incompleta", "Pós-graduação completa", "Mestrado incompleto", "Mestrado completo",
    "Doutorado incompleto", "Doutorado completo", "Pós-doutorado"
];

const DependentsModal = ({ show, onHide, onSaveSuccess, employeeId, dependentToEdit }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show) {
            if (dependentToEdit) {
                setFormData({
                    ...dependentToEdit,
                    data_nascimento: dependentToEdit.data_nascimento ? dependentToEdit.data_nascimento.split('T')[0] : '',
                });
            } else {
                resetForm();
            }
        }
    }, [dependentToEdit, show]);

    const resetForm = () => {
        setFormData({
            nome_completo: '',
            data_nascimento: '',
            grau_parentesco: '',
            escolaridade: '',
            cpf: '',
            contato: '',
            email: '',
            possui_incapacidade: false,
            observacoes: ''
        });
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMaskedChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const dataToSubmit = {
            ...formData,
            data_nascimento: formData.data_nascimento ? new Date(formData.data_nascimento) : null,
        };

        try {
            if (dependentToEdit) {
                await apiClient.put(`/api/dependentes/${dependentToEdit.id}`, dataToSubmit);
            } else {
                await apiClient.post(`/api/funcionarios/${employeeId}/dependentes`, dataToSubmit);
            }
            onSaveSuccess();
            handleClose();
        } catch (err) {
            console.error('Erro ao salvar dependente:', err);
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
                    <Modal.Title>{dependentToEdit ? 'Editar Dependente' : 'Adicionar Novo Dependente'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome Completo*</Form.Label>
                                <Form.Control type="text" name="nome_completo" value={formData.nome_completo || ''} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Data de Nascimento</Form.Label>
                                <Form.Control type="date" name="data_nascimento" value={formData.data_nascimento || ''} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Grau de Parentesco</Form.Label>
                                <Form.Select name="grau_parentesco" value={formData.grau_parentesco || ''} onChange={handleChange}>
                                    <option value="">Selecione...</option>
                                    {parentescoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>CPF</Form.Label>
                                <IMaskInput
                                    mask="000.000.000-00"
                                    value={formData.cpf || ''}
                                    onAccept={(value) => handleMaskedChange('cpf', value)}
                                    className="form-control"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label>Escolaridade</Form.Label>
                        <Form.Select name="escolaridade" value={formData.escolaridade || ''} onChange={handleChange}>
                            <option value="">Selecione...</option>
                            {escolaridadeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Contato (Telefone)</Form.Label>
                                <IMaskInput
                                    mask="(00) 00000-0000"
                                    value={formData.contato || ''}
                                    onAccept={(value) => handleMaskedChange('contato', value)}
                                    className="form-control"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>E-mail</Form.Label>
                                <Form.Control type="email" name="email" value={formData.email || ''} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Check type="switch" id="possui-incapacidade-switch" name="possui_incapacidade" label="Possui incapacidade física ou mental para o trabalho?" checked={formData.possui_incapacidade || false} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Observações</Form.Label>
                        <Form.Control as="textarea" rows={2} name="observacoes" value={formData.observacoes || ''} onChange={handleChange} />
                    </Form.Group>
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

export default DependentsModal;