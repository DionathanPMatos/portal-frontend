// Novo arquivo: CargosModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, InputGroup, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const CargosModal = ({ show, onHide, onCargosUpdate }) => {
    const [cargos, setCargos] = useState([]);
    const [nomeCargo, setNomeCargo] = useState('');
    const [editingCargo, setEditingCargo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCargos = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/cargos');
            setCargos(response.data);
        } catch (err) {
            setError('Falha ao buscar cargos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchCargos();
        }
    }, [show]);

    const handleSave = async () => {
        if (!nomeCargo.trim()) return;

        const url = editingCargo
            ? `/api/cargos/${editingCargo.id}`
            : '/api/cargos';
        
        const method = editingCargo ? 'put' : 'post';

        try {
            await axios[method](url, { nome_cargo: nomeCargo });
            resetForm();
            await fetchCargos();
            onCargosUpdate(); // Informa o componente pai que a lista de cargos mudou
        } catch (err) {
            setError('Falha ao salvar cargo.');
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este cargo?')) {
            try {
                await axios.delete(`/api/cargos/${id}`);
                await fetchCargos();
                onCargosUpdate(); // Informa o componente pai
            } catch (err) {
                setError('Falha ao excluir cargo. Verifique se não há funcionários vinculados a ele.');
            }
        }
    };

    const handleEdit = (cargo) => {
        setEditingCargo(cargo);
        setNomeCargo(cargo.nome_cargo);
    };

    const resetForm = () => {
        setNomeCargo('');
        setEditingCargo(null);
        setError(null);
    };
    
    const handleClose = () => {
        resetForm();
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Gerenciar Cargos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger btn-sm">{error}</Alert>}
                <InputGroup className="mb-3">
                    <Form.Control
                        placeholder="Nome do cargo"
                        value={nomeCargo}
                        onChange={(e) => setNomeCargo(e.target.value)}
                    />
                    <Button variant="primary btn-sm" onClick={handleSave}>
                        {editingCargo ? 'Atualizar' : 'Adicionar'}
                    </Button>
                </InputGroup>
                {editingCargo && <Button variant="light" size="sm" onClick={resetForm}>Cancelar Edição</Button>}
                <hr />
                <h5>Cargos Atuais</h5>
                {loading ? <Spinner animation="border" size="sm" /> : (
                    <ListGroup>
                        {cargos.map(cargo => (
                            <ListGroup.Item key={cargo.id} className="d-flex justify-content-between align-items-center">
                                {cargo.nome_cargo}
                                <div>
                                    <Button variant="outline-info btn-sm" size="sm" onClick={() => handleEdit(cargo)}>Editar</Button>
                                    <Button variant="outline-danger btn-sm" size="sm" className="ms-2" onClick={() => handleDelete(cargo.id)}>Excluir</Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default CargosModal;