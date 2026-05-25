// Novo arquivo: src/components/SetoresModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, InputGroup, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

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
            const response = await axios.get('http://localhost:3000/api/setores');
            setSetores(response.data);
        } catch (err) {
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
        const url = editingSetor ? `http://localhost:3000/api/setores/${editingSetor.id}` : 'http://localhost:3000/api/setores';
        const method = editingSetor ? 'put' : 'post';
        try {
            await axios[method](url, { nome_setor: nomeSetor });
            resetForm();
            await fetchSetores();
            onSetoresUpdate();
        } catch (err) {
            setError('Falha ao salvar setor.');
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este setor?')) {
            try {
                await axios.delete(`http://localhost:3000/api/setores/${id}`);
                await fetchSetores();
                onSetoresUpdate();
            } catch (err) {
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