import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, InputGroup, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../../../services/api';

const CentroCustoModal = ({ show, onHide, onUpdate }) => {
    const [centrosCusto, setCentrosCusto] = useState([]);
    const [nome, setNome] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/api/centro-custos');
            setCentrosCusto(response.data);
        } catch (err) {
            console.error('Erro ao buscar centros de custo:', err);
            setError('Falha ao buscar centros de custo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchData();
        }
    }, [show]);

    const handleSave = async () => {
        if (!nome.trim()) return;
        const url = editingItem ? `/api/centro-custos/${editingItem.id}` : '/api/centro-custos';
        const method = editingItem ? 'put' : 'post';

        try {
            await apiClient[method](url, { nome });
            resetForm();
            await fetchData();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Erro ao salvar:', err);
            setError(err.response?.data?.error || (editingItem ? 'Falha ao atualizar.' : 'Falha ao adicionar.'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este centro de custo?')) {
            try {
                await apiClient.delete(`/api/centro-custos/${id}`);
                await fetchData();
                if (onUpdate) onUpdate();
            } catch (err) {
                console.error('Erro ao excluir:', err);
                setError('Falha ao excluir. Verifique se não há funcionários vinculados.');
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setNome(item.nome);
    };

    const resetForm = () => {
        setNome('');
        setEditingItem(null);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Gerenciar Centros de Custo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <InputGroup className="mb-3">
                    <Form.Control placeholder="Nome do centro de custo" value={nome} onChange={(e) => setNome(e.target.value)} />
                    <Button variant="primary" onClick={handleSave}>{editingItem ? 'Atualizar' : 'Adicionar'}</Button>
                </InputGroup>
                {editingItem && <Button variant="light" size="sm" onClick={resetForm} className="mb-3">Cancelar Edição</Button>}
                <hr />
                <h5>Centros de Custo Atuais</h5>
                {loading ? <Spinner animation="border" size="sm" /> : (
                    <ListGroup>
                        {centrosCusto.map(item => ( // 🚀 CORREÇÃO: Adiciona o ID na exibição do centro de custo
                            <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center text-break">
                                ({item.id}) {item.nome}
                                <div>
                                    <Button variant="outline-info" size="sm" onClick={() => handleEdit(item)}>Editar</Button>
                                    <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDelete(item.id)}>Excluir</Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default CentroCustoModal;