import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, InputGroup, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../../../services/api';

const UnidadesModal = ({ show, onHide, onUnidadesUpdate }) => {
    const [unidades, setUnidades] = useState([]);
    const [nomeUnidade, setNomeUnidade] = useState('');
    const [editingUnidade, setEditingUnidade] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUnidades = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/api/unidades');
            setUnidades(response.data);
        } catch (err) {
            console.error('Erro ao buscar unidades:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) fetchUnidades();
    }, [show]);

    const handleSave = async () => {
        if (!nomeUnidade.trim()) return;
        const url = editingUnidade ? `/api/unidades/${editingUnidade.id}` : '/api/unidades';
        const method = editingUnidade ? 'put' : 'post';

        try {
            await apiClient[method](url, { nome_unidade: nomeUnidade });
            resetForm();
            await fetchUnidades();
            if (onUnidadesUpdate) onUnidadesUpdate();
        } catch (err) {
            console.error('Erro ao salvar:', err);
            setError(editingUnidade ? 'Falha ao atualizar unidade.' : 'Falha ao adicionar unidade.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
            try {
                await apiClient.delete(`/api/unidades/${id}`);
                await fetchUnidades();
                if (onUnidadesUpdate) onUnidadesUpdate();
            } catch (err) {
                console.error('Erro ao excluir:', err);
                setError('Falha ao excluir. Verifique se não há funcionários vinculados.');
            }
        }
    };

    const handleEdit = (unidade) => {
        setEditingUnidade(unidade);
        setNomeUnidade(unidade.nome_unidade);
    };

    const resetForm = () => {
        setNomeUnidade('');
        setEditingUnidade(null);
        setError(null);
    };

    return (
        <Modal show={show} onHide={() => { resetForm(); onHide(); }} centered>
            <Modal.Header closeButton>
                <Modal.Title>Gerenciar Unidades / Filiais</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <InputGroup className="mb-3">
                    <Form.Control placeholder="Nome da unidade/filial" value={nomeUnidade} onChange={(e) => setNomeUnidade(e.target.value)} />
                    <Button variant="primary" onClick={handleSave}>{editingUnidade ? 'Atualizar' : 'Adicionar'}</Button>
                </InputGroup>
                {editingUnidade && <Button variant="light" size="sm" onClick={resetForm} className="mb-3">Cancelar Edição</Button>}
                {loading ? <Spinner animation="border" size="sm" /> : (
                    <ListGroup>
                        {unidades.map(unidade => ( // 🚀 CORREÇÃO: Adiciona o ID na exibição da unidade
                            <ListGroup.Item key={unidade.id} className="d-flex justify-content-between align-items-center text-break">
                                ({unidade.id}) {unidade.nome_unidade}
                                <div><Button variant="outline-info" size="sm" onClick={() => handleEdit(unidade)}>Editar</Button><Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDelete(unidade.id)}>Excluir</Button></div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
        </Modal>
    );
};
export default UnidadesModal;