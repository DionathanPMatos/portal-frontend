import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Modal, Form, Spinner, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaIndustry } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const GerenciarFabricantes = () => {
    const [fabricantes, setFabricantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: null, name: '', logo_base64: '', resumo: '', key_accounts: '',
        registros_projetos: '', garantias: '', prazos_compras: '',
        certificacoes_treinamentos: '', contatos_suporte: '', links_uteis: ''
    });

    const fetchFabricantes = async () => {
        try {
            const response = await axios.get('/api/fabricantes');
            setFabricantes(response.data);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchFabricantes(); }, []);

    const handleClose = () => {
        setShowModal(false);
        setFormData({ id: null, name: '', logo_base64: '', resumo: '', key_accounts: '', registros_projetos: '', garantias: '', prazos_compras: '', certificacoes_treinamentos: '', contatos_suporte: '', links_uteis: '' });
    };

    const handleShow = (fab = null) => {
        if (fab) {
            setEditMode(true);
            setFormData(fab);
        } else {
            setEditMode(false);
        }
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, logo_base64: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`/api/fabricantes/${formData.id}`, formData);
            } else {
                await axios.post('/api/fabricantes', formData);
            }
            fetchFabricantes();
            handleClose();
        } catch (err) {
            alert("Erro ao salvar fabricante.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Deseja realmente remover este fabricante?")) {
            try {
                await axios.delete(`/api/fabricantes/${id}`);
                fetchFabricantes();
            } catch (err) { alert("Erro ao remover."); }
        }
    };

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <Container fluid className="px-0">
                    <Row>
                        <Col>
                            <Card className="shadow-sm border-0">
                                <Card.Header>
                                    <Card.Title as="h4"> <FaIndustry />&nbsp;Gerenciar Fabricantes</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                        <div>
                                            <h4 className="fw-bold mb-1 text-dark">Cadastro de Marcas</h4>
                                            <p className="text-muted mb-0">Adicione e configure o perfil completo dos fabricantes representados.</p>
                                        </div>
                                        <Button variant="primary" className="d-flex align-items-center gap-2 px-3 shadow-sm" onClick={() => handleShow()}>
                                            <FaPlus /> Nova Marca
                                        </Button>
                                    </div>

                                    {loading ? (
                                        <div className="text-center p-5"><Spinner animation="border" /></div>
                                    ) : (
                                        <Table responsive hover className="mb-0 align-middle border">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="border-0 px-4 py-3" style={{ width: '80px' }}>Logo</th>
                                                    <th className="border-0 py-3">Nome da Marca</th>
                                                    <th className="border-0 text-end px-4 py-3">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fabricantes.map(fab => (
                                                    <tr key={fab.id}>
                                                        <td className="px-4 py-3">
                                                            {fab.logo_base64 ? <img src={fab.logo_base64} alt={fab.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }}/> : <FaIndustry size={24} className="text-muted"/>}
                                                        </td>
                                                        <td className="fw-semibold">{fab.name}</td>
                                                        <td className="text-end px-4 py-3">
                                                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShow(fab)}><FaEdit /></Button>
                                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(fab.id)}><FaTrash /></Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {fabricantes.length === 0 && (
                                                    <tr><td colSpan="3" className="text-center py-4 text-muted">Nenhum fabricante cadastrado.</td></tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>

                <Modal show={showModal} onHide={handleClose} size="xl" scrollable>
                    <Modal.Header closeButton className="bg-light">
                        <Modal.Title className="fw-bold">{editMode ? 'Editar Perfil do Fabricante' : 'Nova Marca / Fabricante'}</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body className="p-4">
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">Nome da Marca *</Form.Label>
                                        <Form.Control type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ex: Furukawa, Axis, etc." />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">Logotipo</Form.Label>
                                        <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                                        {formData.logo_base64 && <div className="mt-2 text-center border rounded p-2"><img src={formData.logo_base64} alt="Preview" style={{ maxHeight: '50px', objectFit: 'contain' }} /></div>}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <hr />
                            <h6 className="fw-bold text-muted mb-3">Informações das Abas do Perfil</h6>
                            <p className="text-muted small mb-3">* Navegue pelas abas abaixo para editar as diferentes seções do perfil da marca.</p>
                            
                            <Tabs defaultActiveKey="resumo" className="mb-4 custom-tabs">
                                {['resumo', 'key_accounts', 'registros_projetos', 'garantias', 'prazos_compras', 'certificacoes_treinamentos', 'contatos_suporte', 'links_uteis'].map((field) => (
                                    <Tab eventKey={field} title={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} key={field}>
                                        <div className="mt-3">
                                            <CKEditor
                                                editor={ClassicEditor}
                                                data={formData[field] || ''}
                                                onChange={(event, editor) => {
                                                    const data = editor.getData();
                                                    setFormData((prev) => ({ ...prev, [field]: data }));
                                                }}
                                            />
                                        </div>
                                    </Tab>
                                ))}
                            </Tabs>
                            <p className="text-muted small">* Utilize o editor acima para formatar o texto com negrito, listas e links. O formato será mantido no perfil final.</p>
                        </Modal.Body>
                        <Modal.Footer className="bg-light">
                            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                            <Button variant="primary" type="submit" className="px-4 fw-bold">{editMode ? 'Salvar Alterações' : 'Cadastrar Marca'}</Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};
export default GerenciarFabricantes;