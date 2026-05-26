import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';

export default function PainelGestor() {
    const [visitas, setVisitas] = useState([]);
    const [feedbackAtual, setFeedbackAtual] = useState(null);

    useEffect(() => {
        carregarVisitas();
    }, []);

    const carregarVisitas = async () => {
        try {
            const { data } = await axios.get('/api/visitas');
            setVisitas(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAutorizacao = async (id, status) => {
        try {
            await axios.patch(`/api/visitas/${id}/autorizar`, { status_autorizacao: status });
            carregarVisitas();
        } catch (error) {
            alert('Erro ao processar autorização.');
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'Autorizada') return <Badge bg="success">Autorizada</Badge>;
        if (status === 'Recusada') return <Badge bg="danger">Recusada</Badge>;
        return <Badge bg="warning" text="dark">Pendente</Badge>;
    };

    return (
        <div>
            <h4 className="mb-3">Gestão de Visitas</h4>
            <Card className="shadow-sm">
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Vendedor</th>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th>Objetivo</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitas.map(v => (
                                <tr key={v.id}>
                                    <td>{v.vendedor_nome}</td>
                                    <td>{v.nome_cliente}</td>
                                    <td>{new Date(v.data_visita).toLocaleDateString()}</td>
                                    <td>{v.justificativa_objetivo}</td>
                                    <td>{getStatusBadge(v.status_autorizacao)}</td>
                                    <td>
                                        {v.status_autorizacao === 'Pendente' && (
                                            <div className="d-flex gap-2">
                                                <Button size="sm" variant="success" onClick={() => handleAutorizacao(v.id, 'Autorizada')}>Aprovar</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleAutorizacao(v.id, 'Recusada')}>Recusar</Button>
                                            </div>
                                        )}
                                        {v.feedback_vendedor && (
                                            <Button size="sm" variant="info" className="mt-1" onClick={() => setFeedbackAtual(v.feedback_vendedor)}>
                                                Ler Feedback
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {visitas.length === 0 && <tr><td colSpan="6" className="text-center">Nenhuma visita encontrada.</td></tr>}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={!!feedbackAtual} onHide={() => setFeedbackAtual(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Feedback do Vendedor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{feedbackAtual}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setFeedbackAtual(null)}>Fechar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}