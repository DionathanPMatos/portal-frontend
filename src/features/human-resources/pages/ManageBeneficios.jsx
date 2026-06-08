import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import apiClient from '../../../services/api';

const ManageBeneficios = () => {
    const [beneficios, setBeneficios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Form fields
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [existingLogoUrl, setExistingLogoUrl] = useState('');

    useEffect(() => {
        fetchBeneficios();
    }, []);

    const fetchBeneficios = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/beneficios');
            setBeneficios(response.data);
            setError(null);
        } catch (err) {
            setError('Erro ao carregar os benefícios.');
        } finally {
            setLoading(false);
        }
    };

    const fileToBase64 = (file) => (
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        })
    );

    const handleShowModal = (beneficio = null) => {
        if (beneficio) {
            setEditingId(beneficio.id);
            setNome(beneficio.nome);
            setDescricao(beneficio.descricao || '');
            setExistingLogoBase64(beneficio.logo_base64 || '');
        } else {
            setEditingId(null);
            setNome('');
            setDescricao('');
            setExistingLogoBase64('');
        }
        setLogoFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('nome', nome);
            formData.append('descricao', descricao);

            if (logoFile) {
                formData.append('logo_file', logoFile);
            } else if (editingId) {
                // Envia a URL existente para que o backend saiba se deve mantê-la ou limpá-la
                formData.append('logo_url', existingLogoUrl);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (editingId) {
                // O método PUT com FormData pode ser problemático em alguns servidores, mas axios lida bem.
                await apiClient.put(`/api/beneficios/${editingId}`, formData, config);
                setSuccessMessage('Benefício atualizado com sucesso!');
            } else {
                await apiClient.post('/api/beneficios', formData, config);
                setSuccessMessage('Benefício criado com sucesso!');
            }

            handleCloseModal();
            fetchBeneficios();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Erro ao salvar benefício:", err);
            const errorMsg = err.response?.data?.error || 'Erro ao salvar o benefício.';
            setError(errorMsg);
            // Limpa o erro após alguns segundos
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja inativar/remover este benefício?')) {
            try {
                await apiClient.delete(`/api/beneficios/${id}`);
                setSuccessMessage('Benefício removido com sucesso!');
                fetchBeneficios();
                setTimeout(() => setSuccessMessage(null), 3000);
            } catch (err) {
                setError('Erro ao remover benefício.');
            }
        }
    };

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <Container fluid className="px-0">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h2 className="fw-bold mb-1 text-dark">Gestão de Benefícios (RH)</h2>
                            <p className="text-muted mb-0">Crie e edite os benefícios que a empresa oferece aos colaboradores.</p>
                        </div>
                        <Button variant="primary" onClick={() => handleShowModal()}>
                            <FaPlus className="me-2" /> Novo Benefício
                        </Button>
                    </div>

                    {successMessage && <Alert variant="success">{successMessage}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" /></div>
                    ) : (
                        <Card className="shadow-sm border-0">
                            <Table responsive hover className="mb-0 align-middle">
                                <thead className="bg-light text-uppercase text-muted small">
                                    <tr>
                                        <th className="px-4 py-3">Logo</th>
                                        <th className="py-3">Nome do Benefício</th>
                                        <th className="text-end px-4 py-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {beneficios.length > 0 ? (
                                        beneficios.map(b => (
                                            <tr key={b.id}>
                                                <td className="px-4 py-3" style={{ width: '100px' }}>
                                                    {b.logo_url ? (
                                                        <img src={b.logo_url} alt={b.nome} className="rounded border bg-light" style={{ height: '40px', width: '60px', objectFit: 'contain' }} />
                                                    ) : (
                                                        <span className="text-muted small">Sem logo</span>
                                                    )}
                                                </td>
                                                <td className="py-3 fw-semibold">{b.nome}</td>
                                                <td className="text-end px-4 py-3">
                                                    <Button variant="light" size="sm" className="me-2 text-primary shadow-sm" onClick={() => handleShowModal(b)}><FaEdit /></Button>
                                                    <Button variant="light" size="sm" className="text-danger shadow-sm" onClick={() => handleDelete(b.id)}><FaTrash /></Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="text-center py-4 text-muted">Nenhum benefício cadastrado.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card>
                    )}
                </Container>

                <Modal show={showModal} onHide={handleCloseModal} size="xl" backdrop="static">
                    <Form onSubmit={handleSubmit}>
                        <Modal.Header closeButton>
                            <Modal.Title>{editingId ? 'Editar Benefício' : 'Novo Benefício'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-md-8">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nome do Benefício</Form.Label>
                                        <Form.Control required type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Plano de Saúde Bradesco" />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Subir Logo</Form.Label>
                                        <Form.Control type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                                        {existingLogoUrl && !logoFile && (
                                            <div className="mt-2 text-center border p-2 bg-light rounded">
                                                <img src={existingLogoUrl} alt="Logo atual" style={{ height: '40px', objectFit: 'contain' }} />
                                            </div>
                                        )}
                                    </Form.Group>
                                </div>
                            </div>
                            <Form.Group className="mb-3">
                                <Form.Label>Detalhes do Benefício (Regras, Coparticipação, Links, etc.)</Form.Label>
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={descricao}
                                    onChange={(event, editor) => setDescricao(editor.getData())}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                            <Button variant="primary" type="submit">Salvar Benefício</Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default ManageBeneficios;