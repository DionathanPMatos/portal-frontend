import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, Spinner, Alert, Badge, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const DashboardCompras = () => {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- ADIÇÃO: Estados para controlar o modal de edição ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [solicitacaoEmEdicao, setSolicitacaoEmEdicao] = useState(null);
    const [formData, setFormData] = useState({
        status: '',
        data_prevista_disponibilidade: ''
    });

    const fetchSolicitacoes = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/compras/solicitacoes');
            setSolicitacoes(response.data);
        } catch (err) {
            setError('Erro ao carregar as solicitações de compra.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitacoes();
    }, []);

    // --- ADIÇÃO: Funções para controlar o modal ---
    const handleOpenEditModal = (solicitacao) => {
        setSolicitacaoEmEdicao(solicitacao);
        // Formata a data para o formato YYYY-MM-DD que o input 'date' espera
        const dataFormatada = solicitacao.data_prevista_disponibilidade 
            ? new Date(solicitacao.data_prevista_disponibilidade).toISOString().split('T')[0] 
            : '';
            
        setFormData({
            status: solicitacao.status,
            data_prevista_disponibilidade: dataFormatada
        });
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSolicitacaoEmEdicao(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            const payload = {
                status: formData.status,
                // Envia a data apenas se ela for preenchida, senão envia null
                data_prevista_disponibilidade: formData.data_prevista_disponibilidade || null
            };
            await axios.patch(`/api/compras/solicitacoes/${solicitacaoEmEdicao.id}`, payload);
            handleCloseEditModal();
            fetchSolicitacoes(); // Recarrega a lista para mostrar as atualizações
        } catch (err) {
            alert('Erro ao salvar as alterações.');
            console.error(err);
        }
    };


    const getStatusBadge = (status) => { /* ... sua função existente ... */ };
    const formatDate = (dateString) => { /* ... sua função existente ... */ };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <div className="dash-grid">
            <div className="container-main">
                <Container className="mt-4">
                    <h2 className="mb-4">Dashboard de Compras</h2>
                    
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Projeto</th>
                                <th>Data da Solicitação</th>
                                <th>Previsão de Entrega</th>
                                <th>Status</th>
                                <th>Itens Faltantes</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitacoes.length > 0 ? (
                                solicitacoes.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.id}</td>
                                        <td><Link to={`/crm/projetos/${s.projeto_id}`}>{s.nome_projeto}</Link></td>
                                        <td>{formatDate(s.data_solicitacao)}</td>
                                        {/* --- ADIÇÃO: Exibe a nova data na tabela --- */}
                                        <td>{s.data_prevista_disponibilidade ? formatDate(s.data_prevista_disponibilidade) : 'Não definida'}</td>
                                        <td><Badge bg={getStatusBadge(s.status)}>{s.status}</Badge></td>
                                        <td>
                                            <ul className="list-unstyled mb-0">
                                                {s.itens_faltantes.map(item => (
                                                    <li key={item.codigo_produto}>{item.quantidade_pedida}x - {item.descricao_produto}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td>
                                            {/* --- ADIÇÃO: Botão para abrir o modal --- */}
                                            <Button variant="outline-primary" size="sm" onClick={() => handleOpenEditModal(s)}>
                                                Editar
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">Nenhuma solicitação de compra encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Container>
            </div>

            {/* --- ADIÇÃO: Modal de Edição --- */}
            {solicitacaoEmEdicao && (
                <Modal show={showEditModal} onHide={handleCloseEditModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Editar Solicitação de Compra #{solicitacaoEmEdicao.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="status" value={formData.status} onChange={handleFormChange}>
                                    <option value="Pendente">Pendente</option>
                                    <option value="Em Cotação">Em Cotação</option>
                                    <option value="Comprado">Comprado</option>
                                    <option value="Cancelado">Cancelado</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Data Prevista de Disponibilidade</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="data_prevista_disponibilidade"
                                    value={formData.data_prevista_disponibilidade}
                                    onChange={handleFormChange}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleSaveChanges}>
                            Salvar Alterações
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default DashboardCompras;