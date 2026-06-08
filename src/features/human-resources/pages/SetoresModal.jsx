// Novo arquivo: src/components/SetoresModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, InputGroup, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../../../services/api';

const SetoresModal = ({ show, onHide, onSetoresUpdate }) => {
    const [setores, setSetores] = useState([]);
    const [nomeSetor, setNomeSetor] = useState('');
    const [editingSetor, setEditingSetor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSetores = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/api/setores');
            setSetores(response.data);
        } catch (err) {
            console.error('Erro ao buscar setores:', err);
            setError('Falha ao buscar setores.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchSetores();
        }
    }, [show]);

    const handleSave = async () => {
        if (!nomeSetor.trim()) return;
        const url = editingSetor ? `/api/setores/${editingSetor.id}` : '/api/setores';
        const method = editingSetor ? 'put' : 'post';
        try {
            await apiClient[method](url, { nome_setor: nomeSetor });
            resetForm();
            await fetchSetores();
            onSetoresUpdate();
        } catch (err) {
            console.error('Erro ao salvar setor:', err);
            setError(editingSetor ? 'Falha ao atualizar setor.' : 'Falha ao adicionar setor.');
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este setor?')) {
            try {
                await apiClient.delete(`/api/setores/${id}`);
                await fetchSetores();
                onSetoresUpdate();
            } catch (err) {
                console.error('Erro ao excluir setor:', err);
                setError('Falha ao excluir setor. Verifique se não há funcionários vinculados a ele.');
            }
        }
    };

    const handleEdit = (setor) => {
        setEditingSetor(setor);
        setNomeSetor(setor.nome_setor);
    };

    const resetForm = () => {
        setNomeSetor('');
        setEditingSetor(null);
        setError(null);
    };
    
    const handleClose = () => {
        resetForm();
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Gerenciar Setores</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <InputGroup className="mb-3">
                    <Form.Control
                        placeholder="Nome do setor"
                        value={nomeSetor}
                        onChange={(e) => setNomeSetor(e.target.value)}
                    />
                    <Button variant="primary" onClick={handleSave}>
                        {editingSetor ? 'Atualizar' : 'Adicionar'}
                    </Button>
                </InputGroup>
                {editingSetor && <Button variant="light" size="sm" onClick={resetForm}>Cancelar Edição</Button>}
                <hr />
                <h5>Setores Atuais</h5>
                {loading ? <Spinner animation="border" size="sm" /> : (
                    <ListGroup>
                        {setores.map(setor => (
                            <ListGroup.Item key={setor.id} className="d-flex justify-content-between align-items-center">
                                {setor.nome_setor}
                                <div>
                                    <Button variant="outline-info" size="sm" onClick={() => handleEdit(setor)}>Editar</Button>
                                    <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDelete(setor.id)}>Excluir</Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default SetoresModal;