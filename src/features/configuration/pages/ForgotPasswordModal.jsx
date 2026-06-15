import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../../services/api';

const ForgotPasswordModal = ({ show, onHide }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            await apiClient.post('/api/auth/forgot-password', { email });
            setMessage('Se um usuário com este e-mail existir, um link para redefinição de senha foi enviado.');
        } catch (err) {
            setError('Ocorreu um erro. Tente novamente mais tarde.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setMessage('');
        setError('');
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Redefinir Senha</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {message && <Alert variant="success">{message}</Alert>}
                    <p className="text-muted">Digite seu e-mail corporativo para receber as instruções de redefinição de senha.</p>
                    <Form.Group className="mb-3">
                        <Form.Label>E-mail</Form.Label>
                        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner as="span" size="sm" /> : 'Enviar Link'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ForgotPasswordModal;