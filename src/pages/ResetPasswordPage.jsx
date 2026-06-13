import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../services/api';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Token de redefinição inválido ou ausente.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('As senhas não correspondem.');
            return;
        }

        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/api/auth/reset-password', { token, newPassword });
            setSuccess('Sua senha foi redefinida com sucesso! Você já pode fazer o login com a nova senha.');
            setTimeout(() => navigate('/'), 5000); // Redireciona para o login após 5s
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Ocorreu um erro. O link pode ter expirado.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container d-flex align-items-center justify-content-center">
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <Card className="shadow-lg border-0 rounded-4">
                            <Card.Body className="p-4 p-md-5">
                                <h3 className="fw-bold text-center mb-4">Redefinir Senha</h3>
                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}

                                {!success && (
                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nova Senha</Form.Label>
                                            <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={!token} />
                                        </Form.Group>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Confirmar Nova Senha</Form.Label>
                                            <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={!token} />
                                        </Form.Group>
                                        <div className="d-grid">
                                            <Button variant="primary" type="submit" disabled={loading || !token}>
                                                {loading ? <Spinner as="span" size="sm" /> : 'Salvar Nova Senha'}
                                            </Button>
                                        </div>
                                    </Form>
                                )}
                                <div className="text-center mt-4">
                                    <Link to="/">Voltar para o Login</Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ResetPasswordPage;