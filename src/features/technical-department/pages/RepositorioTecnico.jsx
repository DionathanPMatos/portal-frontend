import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Table, Badge, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaFolderOpen, FaSearch, FaPlus, FaExternalLinkAlt, FaTrash, FaCheck } from 'react-icons/fa';
import apiClient from '../../../services/api'; // Importa a instância configurada do Axios
// import '../../App.css'; // Removido: estilos globais devem ser importados apenas em main.jsx ou App.jsx

// --- MOCKS INICIAIS ---
const CATEGORIAS_MOCK = ["Segurança Eletrônica", "Pon Lan", "Networking", "Data Center", "Áudio e Vídeo IP", "Ferramentas e Testes"];
const TIPOS_MOCK = ["Datasheet", "TR (Termo de Referência)", "Manual", "Topologia", "Proposta Técnica"];

// Função auxiliar para gerar cores de badges baseadas no texto
const getBadgeBg = (text, isType = false) => {
    const colors = isType ? ['info', 'secondary', 'dark', 'success', 'warning text-dark'] : ['primary', 'danger', 'success', 'purple', 'warning text-dark', 'info'];
    const index = text.length % colors.length;
    return colors[index];
};

const RepositorioTecnico = () => {
    // --- ESTADOS DE DADOS ---
    const [documentos, setDocumentos] = useState([]);
    const [categorias, setCategorias] = useState(CATEGORIAS_MOCK);
    const [tipos, setTipos] = useState(TIPOS_MOCK);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- ESTADOS DE FILTRO ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');

    // --- ESTADOS DO MODAL E FORMULÁRIO ---
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [formData, setFormData] = useState({ nome: '', categoria: '', tipo: '', descricao: '' });
    
    // Controles para adição dinâmica de selects
    const [showNewCatInput, setShowNewCatInput] = useState(false);
    const [newCatText, setNewCatText] = useState('');
    
    const [showNewTipoInput, setShowNewTipoInput] = useState(false);
    const [newTipoText, setNewTipoText] = useState('');

    // --- BUSCA INICIAL DOS DADOS DA API ---
    const fetchDocumentos = async () => {
        setLoading(true);
        try {
            const [response, verticaisRes] = await Promise.all([
                apiClient.get('/api/repositorio'),
                apiClient.get('/api/verticais')
            ]);
            setDocumentos(response.data);
            
            // Junta as categorias existentes no DB com as do MOCK e as Verticais Oficiais (Remove duplicatas e ordena)
            const dbCategorias = response.data.map(doc => doc.categoria);
            const verticaisNomes = verticaisRes.data.map(v => v.nome);
            const allCategorias = Array.from(new Set([...CATEGORIAS_MOCK, ...dbCategorias, ...verticaisNomes])).sort();
            setCategorias(allCategorias);
            
            setError(null);
        } catch (err) {
            console.error('Erro ao carregar os documentos do repositório:', err);
            setError('Falha ao carregar os documentos do repositório.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDocumentos(); }, []);

    // --- LÓGICA DE FILTRAGEM (useMemo otimizado) ---
    const filteredDocs = useMemo(() => {
        return documentos.filter(doc => {
            const matchSearch = doc.nome.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCat = filtroCategoria ? doc.categoria === filtroCategoria : true;
            const matchTipo = filtroTipo ? doc.tipo === filtroTipo : true;
            return matchSearch && matchCat && matchTipo;
        });
    }, [documentos, searchTerm, filtroCategoria, filtroTipo]);

    // --- HANDLERS DO FORMULÁRIO ---
    const handleOpenModal = () => {
        setFormData({ nome: '', categoria: '', tipo: '', descricao: '' });
        setFileToUpload(null);
        setShowNewCatInput(false);
        setShowNewTipoInput(false);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'categoria' && value === 'CREATE_NEW') {
            setShowNewCatInput(true);
            setFormData({ ...formData, categoria: '' });
            return;
        }
        if (name === 'tipo' && value === 'CREATE_NEW') {
            setShowNewTipoInput(true);
            setFormData({ ...formData, tipo: '' });
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    // --- INSERÇÃO DINÂMICA DE CATEGORIA E TIPO ---
    const handleAddNewCategoria = () => {
        if (newCatText.trim() && !categorias.includes(newCatText.trim())) {
            setCategorias([...categorias, newCatText.trim()]);
            setFormData({ ...formData, categoria: newCatText.trim() });
        }
        setShowNewCatInput(false);
        setNewCatText('');
    };

    const handleAddNewTipo = () => {
        if (newTipoText.trim() && !tipos.includes(newTipoText.trim())) {
            setTipos([...tipos, newTipoText.trim()]);
            setFormData({ ...formData, tipo: newTipoText.trim() });
        }
        setShowNewTipoInput(false);
        setNewTipoText('');
    };

    // --- CRUD DOCUMENTOS ---
    const handleSaveDocument = async (e) => {
        e.preventDefault();
        if (!fileToUpload) {
            alert("Por favor, selecione o arquivo que deseja armazenar.");
            return;
        }
        
        setUploading(true);
        
        const uploadData = new FormData();
        uploadData.append('file', fileToUpload);
        uploadData.append('nome', formData.nome);
        uploadData.append('categoria', formData.categoria);
        uploadData.append('tipo', formData.tipo);
        uploadData.append('descricao', formData.descricao);

        try {
            await apiClient.post('/api/repositorio', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchDocumentos();
            handleCloseModal();
        } catch (err) {
                console.error('Erro ao enviar o documento:', err);
            alert('Erro ao enviar o documento. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = async (id) => {
        if (window.confirm("Deseja realmente excluir este documento?")) {
            try {
                await apiClient.delete(`/api/repositorio/${id}`);
                setDocumentos(documentos.filter(doc => doc.id !== id));
            } catch (err) {
                console.error('Erro ao deletar o documento:', err);
                alert('Erro ao deletar o documento.');
            }
        }
    };

    return (
        <Container fluid className="px-4">
            <Row>
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <Card.Title as="h4" className="mb-0 d-flex align-items-center gap-2">
                                <FaFolderOpen /> Repositório Técnico
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {/* Header Interno Padrão */}
                            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                <div>
                                    <h4 className="fw-bold mb-1 text-dark">
                                        Central de Documentos
                                    </h4>
                                    <p className="text-muted mb-0">
                                        Acesse propostas, TRs, manuais e materiais de apoio organizados por solução.
                                    </p>
                                </div>
                                <Button variant="primary" className="d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenModal}>
                                    <FaPlus /> Adicionar Documento
                                </Button>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}

                            {/* Barra de Filtros */}
                            <Row className="mb-4 g-3">
                                <Col md={12} lg={4}>
                                    <InputGroup className="shadow-sm">
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <FaSearch className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Buscar pelo nome do arquivo..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="border-start-0 ps-0 shadow-none"
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={6} lg={4}>
                                    <Form.Select className="shadow-sm shadow-none" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                                        <option value="">Todas as Categorias (Solução)</option>
                                        {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </Form.Select>
                                </Col>
                                <Col md={6} lg={4}>
                                    <Form.Select className="shadow-sm shadow-none" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                                        <option value="">Todos os Tipos</option>
                                        {tipos.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                                    </Form.Select>
                                </Col>
                            </Row>

                            {/* Tabela de Dados */}
                            <div className="table-responsive">
                                <Table hover className="align-middle border mb-0">
                                    <thead className="table-light text-muted small text-uppercase">
                                        <tr>
                                            <th className="py-3 px-4">Nome do Documento</th>
                                            <th className="py-3">Solução</th>
                                            <th className="py-3">Tipo</th>
                                            <th className="py-3">Descrição Breve</th>
                                            <th className="py-3 text-end px-4">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="5" className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                                        ) : filteredDocs.length > 0 ? (
                                            filteredDocs.map((doc) => (
                                                <tr key={doc.id}>
                                                    <td className="px-4 py-3 fw-bold text-dark">{doc.nome}</td>
                                                    <td className="py-3">
                                                        <Badge bg={getBadgeBg(doc.categoria, false)}>{doc.categoria}</Badge>
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge bg={getBadgeBg(doc.tipo, true)}>{doc.tipo}</Badge>
                                                    </td>
                                                    <td className="py-3 text-muted small text-truncate" style={{ maxWidth: '250px' }}>
                                                        {doc.descricao || '-'}
                                                    </td>
                                                    <td className="py-3 text-end px-4">
                                                        <a href={doc.caminho_arquivo} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm me-2 shadow-sm text-primary" title="Abrir Arquivo">
                                                            <FaExternalLinkAlt />
                                                        </a>
                                                        <Button variant="light" size="sm" className="shadow-sm text-danger" title="Excluir" onClick={() => handleDeleteDocument(doc.id)}>
                                                            <FaTrash />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted">
                                                    Nenhum documento encontrado para os filtros selecionados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* MODAL DE CADASTRO */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered backdrop="static">
                <Form onSubmit={handleSaveDocument}>
                    <Modal.Header closeButton>
                        <Modal.Title>Adicionar Novo Documento</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Nome do Arquivo/Documento *</Form.Label>
                                    <Form.Control type="text" name="nome" placeholder="Ex: Proposta Comercial V2..." value={formData.nome} onChange={handleInputChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Fazer Upload do Arquivo *</Form.Label>
                                    <Form.Control type="file" onChange={(e) => setFileToUpload(e.target.files[0])} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Categoria (Solução) *</Form.Label>
                                    {!showNewCatInput ? (
                                        <Form.Select name="categoria" value={formData.categoria} onChange={handleInputChange} required>
                                            <option value="">Selecione...</option>
                                            {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            <option value="CREATE_NEW" className="fw-bold text-primary">[+] Criar Nova Categoria</option>
                                        </Form.Select>
                                    ) : (
                                        <InputGroup>
                                            <Form.Control type="text" placeholder="Nome da nova categoria" value={newCatText} onChange={(e) => setNewCatText(e.target.value)} autoFocus />
                                            <Button variant="success" onClick={handleAddNewCategoria}><FaCheck /></Button>
                                            <Button variant="outline-secondary" onClick={() => setShowNewCatInput(false)}>X</Button>
                                        </InputGroup>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Tipo de Documento *</Form.Label>
                                    {!showNewTipoInput ? (
                                        <Form.Select name="tipo" value={formData.tipo} onChange={handleInputChange} required>
                                            <option value="">Selecione...</option>
                                            {tipos.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                                            <option value="CREATE_NEW" className="fw-bold text-primary">[+] Criar Novo Tipo</option>
                                        </Form.Select>
                                    ) : (
                                        <InputGroup>
                                            <Form.Control type="text" placeholder="Nome do novo tipo" value={newTipoText} onChange={(e) => setNewTipoText(e.target.value)} autoFocus />
                                            <Button variant="success" onClick={handleAddNewTipo}><FaCheck /></Button>
                                            <Button variant="outline-secondary" onClick={() => setShowNewTipoInput(false)}>X</Button>
                                        </InputGroup>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Descrição Breve / Observações</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="descricao" placeholder="Descreva brevemente o conteúdo deste documento..." value={formData.descricao} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                        <Button variant="primary" type="submit" disabled={!formData.categoria || !formData.tipo || showNewCatInput || showNewTipoInput || uploading}>
                            {uploading ? <Spinner size="sm" animation="border" /> : 'Salvar Documento'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default RepositorioTecnico;