import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Spinner, Alert, Card, Row, Col, Button, Modal, Form, Tabs, Tab, Table, Breadcrumb } from 'react-bootstrap';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '../../App.css';
import '../../css/Dashboard.css';
import {
  FaHome, FaHandshake, FaProjectDiagram, FaMoneyBill, FaCogs, FaTruck,
  FaPencilAlt, FaBlog, FaEnvelope, FaShoppingCart, FaSignOutAlt, FaBars,
} from "react-icons/fa";


// Componente reutilizável para campos de texto com CKEditor
const EditableField = ({ label, value, onSave, fieldName }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(value || '');
    useEffect(() => { setContent(value || ''); }, [value]);
    const handleSave = () => { onSave(fieldName, content); setIsEditing(false); };

    return (
        <div className="mb-4 p-3 border rounded">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">{label}</h5>
                {!isEditing && <Button size="sm" variant="outline-primary" onClick={() => setIsEditing(true)}>Editar</Button>}
            </div>
            {isEditing ? (
                <>
                    <CKEditor editor={ClassicEditor} data={content} onChange={(event, editor) => setContent(editor.getData())} />
                    <div className="mt-2"><Button size="sm" variant="success" onClick={handleSave} className="me-2">Salvar</Button><Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button></div>
                </>
            ) : (<div dangerouslySetInnerHTML={{ __html: content || '<p><i>Nenhuma informação cadastrada.</i></p>' }} />)}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const Registro = () => {
    // Estados principais
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Estados para modais e dados
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showKeyAccountModal, setShowKeyAccountModal] = useState(false);
    const [selectedManufacturer, setSelectedManufacturer] = useState(null);
    const [editingManufacturer, setEditingManufacturer] = useState(null);
    const [manufacturerToDelete, setManufacturerToDelete] = useState(null);
    const [editingKeyAccount, setEditingKeyAccount] = useState(null);
    const [documentoUpload, setDocumentoUpload] = useState({ file: null, descricao: '' });
    const [funcionariosCompras, setFuncionariosCompras] = useState([]);
    const [funcionariosDTC, setFuncionariosDTC] = useState([]);
    const [selectedResponsaveis, setSelectedResponsaveis] = useState(new Set());

    // --- FUNÇÕES DE ALERTA E CARREGAMENTO ---
    const showSuccess = (message) => { setSuccessMessage(message); setTimeout(() => setSuccessMessage(null), 4000); };
    const handleError = (message) => { setError(message); setTimeout(() => setError(null), 4000); };
    const fetchManufacturers = async () => {
        try { setLoading(true); const res = await axios.get('/api/fabricantes'); setManufacturers(res.data); } 
        catch (err) { handleError('Erro ao carregar fabricantes.'); } 
        finally { setLoading(false); }
    };
    useEffect(() => { fetchManufacturers(); }, []);

    // --- MODAL DE DETALHES ---
    const handleShowDetails = async (id) => {
        try { const res = await axios.get(`/api/fabricantes/${id}`); setSelectedManufacturer(res.data); setShowDetailsModal(true); } 
        catch (err) { handleError('Não foi possível carregar os detalhes do fabricante.'); }
    };
    const handleCloseDetailsModal = () => setShowDetailsModal(false);

    // --- CRUD: FABRICANTE (ADICIONAR/EDITAR DADOS GERAIS) ---
    const handleShowAddModal = () => { setEditingManufacturer({ name: '' }); setShowAddEditModal(true); };
    const handleShowEditModal = (manufacturer) => { setEditingManufacturer(manufacturer); setShowDetailsModal(false); setShowAddEditModal(true); };
    const handleCloseAddEditModal = () => { setShowAddEditModal(false); setEditingManufacturer(null); };
    const handleManufacturerSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const isEditing = !!editingManufacturer?.id;
        try {
            const url = isEditing ? `/api/fabricantes/${editingManufacturer.id}` : '/api/fabricantes';
            const method = isEditing ? 'put' : 'post';
            await axios[method](url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            showSuccess(`Fabricante ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`);
            fetchManufacturers();
            handleCloseAddEditModal();
        } catch (err) { handleError(`Erro ao ${isEditing ? 'atualizar' : 'salvar'} o fabricante.`); }
    };

    // --- CRUD: FABRICANTE (EXCLUIR) ---
    const handleDeleteClick = (manufacturer) => { setManufacturerToDelete(manufacturer); setShowDetailsModal(false); setShowDeleteModal(true); };
    const confirmDelete = async () => {
        try { await axios.delete(`/api/fabricantes/${manufacturerToDelete.id}`); showSuccess('Fabricante excluído com sucesso!'); fetchManufacturers(); setShowDeleteModal(false); } 
        catch (err) { handleError('Erro ao excluir fabricante.'); }
    };

    // --- CRUD: KEY ACCOUNTS ---
    const handleShowKeyAccountModal = (ka = null) => { setEditingKeyAccount(ka || {}); setShowKeyAccountModal(true); };
    const handleCloseKeyAccountModal = () => { setShowKeyAccountModal(false); setEditingKeyAccount(null); };
    const handleKeyAccountSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const keyAccountData = { regiao: form.regiao.value, nome_key_account: form.nome_key_account.value, email: form.email.value, telefone: form.telefone.value };
        const isEditing = !!editingKeyAccount?.id;
        try {
            const url = isEditing ? `/api/keyaccounts/${editingKeyAccount.id}` : `/api/fabricantes/${selectedManufacturer.id}/keyaccounts`;
            const method = isEditing ? 'put' : 'post';
            await axios[method](url, keyAccountData);
            showSuccess(`Key Account ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`);
            handleShowDetails(selectedManufacturer.id);
            handleCloseKeyAccountModal();
        } catch (err) { handleError('Erro ao salvar Key Account.'); }
    };
    const handleDeleteKeyAccount = async (kaId) => {
        if (window.confirm("Tem certeza que deseja excluir este Key Account?")) {
            try { await axios.delete(`/api/keyaccounts/${kaId}`); showSuccess('Key Account excluído com sucesso!'); handleShowDetails(selectedManufacturer.id); } 
            catch (err) { handleError('Erro ao excluir Key Account.'); }
        }
    };

    // --- CRUD: DOCUMENTOS ---
    const handleDocumentUpload = async () => {
        if (!documentoUpload.file) { handleError("Por favor, selecione um arquivo."); return; }
        const formData = new FormData();
        formData.append('documento', documentoUpload.file);
        formData.append('descricao', documentoUpload.descricao);
        try {
            const res = await axios.post(`/api/fabricantes/${selectedManufacturer.id}/documentos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            showSuccess("Documento enviado com sucesso!");
            setSelectedManufacturer(prev => ({ ...prev, documentos: [...prev.documentos, res.data.newDocument] }));
            setDocumentoUpload({ file: null, descricao: '' });
        } catch (err) { handleError("Erro ao enviar o documento."); }
    };
    const handleDeleteDocumento = async (docId) => {
        if (window.confirm("Tem certeza que deseja excluir este documento?")) {
            try {
                await axios.delete(`/api/fabricantes/documentos/${docId}`);
                showSuccess('Documento excluído com sucesso!');
                setSelectedManufacturer(prev => ({ ...prev, documentos: prev.documentos.filter(d => d.id !== docId) }));
            } catch (err) { handleError('Erro ao excluir o documento.'); }
        }
    };

    // --- SALVAR CAMPOS (CKEDITOR) ---
    const handleSaveField = async (fieldName, value) => {
        const formData = new FormData();
        formData.append(fieldName, value);
        try {
            await axios.put(`/api/fabricantes/${selectedManufacturer.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSelectedManufacturer(prev => ({ ...prev, [fieldName]: value }));
            showSuccess('Informação atualizada com sucesso!');
        } catch (err) { handleError('Erro ao salvar a informação.'); }
    };

    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    return (
        <div className="container-main" style={{padding: '2rem 3rem', gap: '2rem'}}>
            <Breadcrumb>
                <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item active>Gerenciamento de Fabricantes</Breadcrumb.Item>
            </Breadcrumb>
            <div className="d-flex justify-content-between align-items-center mb-4"> 
               <h3><icon className="fas fa-industry me-2 " />Fabricantes</h3> 
                <Button variant="success btn-sm btn-primary" onClick={handleShowAddModal}>+ Adicionar Novo Fabricante</Button>
            </div>
            <div className='line-divise'></div>
            
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Row xs={2} md={4} lg={6} className="g-4">
                {manufacturers.map((fab) => (
                    <Col key={fab.id}><Card className="h-100 text-center manufacturer-card" onClick={() => handleShowDetails(fab.id)}><Card.Body className="d-flex align-items-center justify-content-center p-2">{fab.logo_base64 ? <img src={fab.logo_base64} alt={fab.name} style={{ maxWidth: '50%', maxHeight: '80px', objectFit: 'contain' }} /> : <Card.Title className="m-0">{fab.name}</Card.Title>}</Card.Body></Card></Col>
                ))}
            </Row>
            

            {/* MODAIS (renderizados apenas quando necessários) */}
            {selectedManufacturer && <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} fullscreen={true}>
                <Modal.Header closeButton> {selectedManufacturer.logo_base64 && <img src={selectedManufacturer.logo_base64} alt={selectedManufacturer.name} style={{ maxWidth: '150px', maxHeight: '80px', objectFit: 'contain' }} />}</Modal.Header>
                <Modal.Body>
                    <Tabs defaultActiveKey="resumo" id="manufacturer-details-tabs" className="mb-3">
                        <Tab eventKey="resumo link-tab" title="Resumo"><EditableField label="Resumo sobre o Fabricante" value={selectedManufacturer.resumo} fieldName="resumo" onSave={handleSaveField} /></Tab>
                        <Tab eventKey="registro" title="Registro de Projeto"><EditableField label="Como realizar registro de projeto" value={selectedManufacturer.registro_projeto} fieldName="registro_projeto" onSave={handleSaveField} /></Tab>
                        <Tab eventKey="keyaccounts" title="Key Accounts" className="p-3">
                            <Button variant="primary" size="sm" className="mb-3" onClick={() => handleShowKeyAccountModal()}>+ Adicionar Contato</Button>
                            <Table striped bordered hover responsive size="sm">
                                <thead><tr><th>Região</th><th>Nome</th><th>Email</th><th>Telefone</th><th>Ações</th></tr></thead>
                                <tbody>{selectedManufacturer.keyAccounts?.map(ka => (<tr key={ka.id}><td>{ka.regiao}</td><td>{ka.nome_key_account}</td><td>{ka.email}</td><td>{ka.telefone}</td><td><Button size="sm" variant="outline-info" className="me-2" onClick={() => handleShowKeyAccountModal(ka)}>Editar</Button><Button size="sm" variant="outline-danger" onClick={() => handleDeleteKeyAccount(ka.id)}>Excluir</Button></td></tr>))}</tbody>
                            </Table>
                        </Tab>
                        <Tab eventKey="portfolio" title="Portfólio"><EditableField label="Portfólio do Fabricante" value={selectedManufacturer.portfolio} fieldName="portfolio" onSave={handleSaveField} /></Tab>
                        <Tab eventKey="treinamentos" title="Treinamentos"><EditableField label="Treinamentos e Certificações" value={selectedManufacturer.treinamentos} fieldName="treinamentos" onSave={handleSaveField} /></Tab>
                        <Tab eventKey="politica" title="Política Comercial"><EditableField label="Como funciona a política comercial" value={selectedManufacturer.politica_comercial} fieldName="politica_comercial" onSave={handleSaveField} /></Tab>
                        <Tab eventKey="documentos" title="Documentos" className="p-3">
                            <Form.Group className="mb-4 p-3 border rounded">
                                <Form.Label as="h5">Fazer upload de novo arquivo</Form.Label>
                                <Form.Control type="file" className="mb-2" onChange={(e) => setDocumentoUpload(prev => ({ ...prev, file: e.target.files[0] }))} />
                                <Form.Control type="text" placeholder="Descrição do arquivo" value={documentoUpload.descricao} onChange={(e) => setDocumentoUpload(prev => ({ ...prev, descricao: e.target.value }))} />
                                <Button variant="primary" size="sm" className="mt-2" onClick={handleDocumentUpload}>Enviar Arquivo</Button>
                            </Form.Group>
                            <Table striped bordered hover responsive size="sm">
                                <thead><tr><th>Arquivo</th><th>Descrição</th><th>Data do Upload</th><th>Ações</th></tr></thead>
                                <tbody>{selectedManufacturer.documentos?.map(doc => (<tr key={doc.id}><td><a href={`${API_URL}${doc.caminho_arquivo}`} target="_blank" rel="noopener noreferrer">{doc.nome_arquivo}</a></td><td>{doc.descricao}</td><td>{new Date(doc.data_upload).toLocaleDateString()}</td><td><Button size="sm" variant="outline-danger" onClick={() => handleDeleteDocumento(doc.id)}>Excluir</Button></td></tr>))}</tbody>
                            </Table>
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger btn-sm" onClick={() => handleDeleteClick(selectedManufacturer)} className="me-auto">Excluir Fabricante</Button>
                    <Button variant="secondary btn-sm" onClick={handleCloseDetailsModal}>Fechar</Button>
                    <Button variant="primary btn-sm" onClick={() => handleShowEditModal(selectedManufacturer)}>Editar Dados Gerais</Button>
                </Modal.Footer>
            </Modal>}

            <Modal show={showAddEditModal} onHide={handleCloseAddEditModal}>
                 <Form onSubmit={handleManufacturerSubmit}>
                    <Modal.Header closeButton><Modal.Title>{editingManufacturer?.id ? 'Editar' : 'Adicionar'} Fabricante</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3"><Form.Label>Nome</Form.Label><Form.Control type="text" name="name" defaultValue={editingManufacturer?.name} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Logo</Form.Label><Form.Control type="file" name="logo" accept="image/*" /></Form.Group>
                        {editingManufacturer?.logo_base64 && <img src={editingManufacturer.logo_base64} alt="Logo" style={{ maxWidth: '100px' }} />}
                    </Modal.Body>
                    <Modal.Footer><Button variant="secondary btn-sm" onClick={handleCloseAddEditModal}>Cancelar</Button><Button variant="success btn-sm" type="submit">Salvar</Button></Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton><Modal.Title>Confirmar Exclusão</Modal.Title></Modal.Header>
                <Modal.Body>Tem certeza que deseja excluir <strong>{manufacturerToDelete?.name}</strong>?</Modal.Body>
                <Modal.Footer><Button variant="secondary btn-sm" onClick={() => setShowDeleteModal(false)}>Cancelar</Button><Button variant="danger btn-sm" onClick={confirmDelete}>Excluir</Button></Modal.Footer>
            </Modal>

            <Modal show={showKeyAccountModal} onHide={handleCloseKeyAccountModal}>
                <Form onSubmit={handleKeyAccountSubmit}>
                    <Modal.Header closeButton><Modal.Title>{editingKeyAccount?.id ? 'Editar' : 'Adicionar'} Key Account</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3"><Form.Label>Região</Form.Label><Form.Control type="text" name="regiao" defaultValue={editingKeyAccount?.regiao} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Nome</Form.Label><Form.Control type="text" name="nome_key_account" defaultValue={editingKeyAccount?.nome_key_account} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" defaultValue={editingKeyAccount?.email} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Telefone</Form.Label><Form.Control type="text" name="telefone" defaultValue={editingKeyAccount?.telefone} /></Form.Group>
                    </Modal.Body>
                    <Modal.Footer><Button variant="secondary btn-sm" onClick={handleCloseKeyAccountModal}>Cancelar</Button><Button variant="primary btn-sm" type="submit">Salvar</Button></Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Registro;