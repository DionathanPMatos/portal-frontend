import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Card, Form, Modal } from 'react-bootstrap';
import apiClient from '../../../services/api';

const ManageBenefitRequests = () => {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showRecusaModal, setShowRecusaModal] = useState(false);
    const [currentSolicitacao, setCurrentSolicitacao] = useState(null);
    const [motivoRecusa, setMotivoRecusa] = useState('');

    const fetchSolicitacoes = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/beneficios/solicitacoes');
            setSolicitacoes(response.data);
        } catch (err) {
            console.error('Erro ao carregar solicitações:', err);
            setError('Erro ao carregar solicitações.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitacoes();
    }, []);

    const handleAprovar = async (id) => {
        try {
            await apiClient.put(`/api/beneficios/solicitacoes/${id}/aprovar`);
            fetchSolicitacoes();
        } catch (err) {
            console.error('Erro ao aprovar solicitação:', err);
            setError('Erro ao aprovar solicitação.');
        }
    };

    const handleOpenRecusaModal = (solicitacao) => {
        setCurrentSolicitacao(solicitacao);
        setShowRecusaModal(true);
    };

    const handleRecusar = async () => {
        if (!motivoRecusa) {
            alert('Por favor, informe o motivo da recusa.');
            return;
        }
        try {
            await apiClient.put(`/api/beneficios/solicitacoes/${currentSolicitacao.id}/recusar`, { motivo: motivoRecusa });
            setShowRecusaModal(false);
            setMotivoRecusa('');
            fetchSolicitacoes();
        } catch (err) {
            console.error('Erro ao recusar solicitação:', err);
            setError('Erro ao recusar solicitação.');
        }
    };

    return (
        <>
            <p className="text-muted">Aprove ou recuse as solicitações de benefícios feitas pelos colaboradores.</p>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? <div className="text-center"><Spinner animation="border" /></div> : (
                <Card className="shadow-sm border-0">
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Colaborador</th>
                                <th>Benefício Solicitado</th>
                                <th>Data da Solicitação</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitacoes.length > 0 ? solicitacoes.map(s => (
                                <tr key={s.id}>
                                    <td>{s.funcionario.nome_completo}</td>
                                    <td>{s.beneficio.nome}</td>
                                    <td>{new Date(s.data_solicitacao).toLocaleDateString('pt-BR')}</td>
                                    <td className="text-end">
                                        <Button variant="success" size="sm" className="me-2" onClick={() => handleAprovar(s.id)}>Aprovar</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleOpenRecusaModal(s)}>Recusar</Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center text-muted">Nenhuma solicitação pendente.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card>
            )}

            <Modal show={showRecusaModal} onHide={() => setShowRecusaModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Recusar Solicitação</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Motivo da Recusa</Form.Label>
                        <Form.Control as="textarea" rows={3} value={motivoRecusa} onChange={(e) => setMotivoRecusa(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRecusaModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleRecusar}>Confirmar Recusa</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ManageBenefitRequests;