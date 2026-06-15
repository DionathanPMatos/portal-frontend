import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Card, Form, InputGroup, Button, Table, Badge, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaPlus, FaExternalLinkAlt, FaTrash, FaCheck, FaWrench } from 'react-icons/fa';
import apiClient from '../../../services/api';
// import '../../../styles/App.css';

// Mocks para ajudar na renderização visual (podem ser criadas novas depois)
const CATEGORIAS_MOCK = ["Segurança Eletrônica", "Pon Lan", "Networking", "Data Center", "Áudio e Vídeo IP", "Ferramentas e Testes", "Energia"];

const getBadgeBg = (text) => {
    const colors = ['primary', 'danger', 'success', 'purple', 'warning text-dark', 'info', 'secondary'];
    const index = text.length % colors.length;
    return colors[index];
};

const FerramentasUteisPage = () => {
    const [ferramentas, setFerramentas] = useState([]);
    const [fabricantes, setFabricantes] = useState([]);
    const [categorias, setCategorias] = useState(CATEGORIAS_MOCK);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroFabricante, setFiltroFabricante] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ nome: '', link: '', solucao: '', fabricante_id: '' });

    const [showNewCatInput, setShowNewCatInput] = useState(false);
    const [newCatText, setNewCatText] = useState('');

    const fetchData = useCallback(async () => { // Added useCallback
        setLoading(true);
        try {
            const [ferRes, fabRes] = await Promise.all([
                apiClient.get('/api/ferramentas'),
                apiClient.get('/api/fabricantes')
            ]);
            setFerramentas(ferRes.data);
            setFabricantes(fabRes.data);
            
            // Junta as categorias existentes no DB com as do MOCK (Remove duplicatas)
            const dbCategorias = ferRes.data.map(f => f.solucao);
            const allCategorias = Array.from(new Set([...CATEGORIAS_MOCK, ...dbCategorias]));
            setCategorias(allCategorias);
        } catch (err) {
            setError('Falha ao carregar as ferramentas.');
        } finally {
            setLoading(false);
        }
    }, []); // Added useCallback

    useEffect(() => { fetchData(); }, []);

    const filteredTools = useMemo(() => {
        return ferramentas.filter(fer => {
            const matchSearch = fer.nome.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCat = filtroCategoria ? fer.solucao === filtroCategoria : true;
            const matchFab = filtroFabricante ? String(fer.fabricante_id) === String(filtroFabricante) : true;
            return matchSearch && matchCat && matchFab;
        });
    }, [ferramentas, searchTerm, filtroCategoria, filtroFabricante]);

    const handleOpenModal = () => {
        setFormData({ nome: '', link: '', solucao: '', fabricante_id: '' });
        setShowNewCatInput(false);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'solucao' && value === 'CREATE_NEW') {
            setShowNewCatInput(true);
            setFormData({ ...formData, solucao: '' });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleAddNewCategoria = () => {
        if (newCatText.trim() && !categorias.includes(newCatText.trim())) {
            setCategorias([...categorias, newCatText.trim()]);
            setFormData({ ...formData, solucao: newCatText.trim() });
        }
        setShowNewCatInput(false);
        setNewCatText('');
    };

    const handleSaveTool = async (e) => {
        e.preventDefault();
        
        // Formata link para conter http/https caso o usuário esqueça
        let finalLink = formData.link.trim();
        if (!/^https?:\/\//i.test(finalLink)) {
            finalLink = 'https://' + finalLink;
        }

        setSaving(true);
        try {
            await apiClient.post('/api/ferramentas', { ...formData, link: finalLink });
            fetchData();
            handleCloseModal();
        } catch (err) {
            alert('Erro ao salvar a ferramenta.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTool = async (id) => {
        if (window.confirm("Deseja realmente excluir esta ferramenta?")) {
            try {
                await apiClient.delete(`/api/ferramentas/${id}`);
                setFerramentas(ferramentas.filter(f => f.id !== id));
            } catch (err) {
                alert('Erro ao excluir ferramenta.');
            }
        }
    };

    return (
        <div className='container-main p-4'>
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaWrench /> Caixa de Ferramentas
                    </h2>
                    <p className="page-header-subtitle">Calculadoras, simuladores e ferramentas oficiais de fabricantes para o pré-vendas.</p>
                </div>
                <div className="page-header-actions-wrapper">
                    <Button variant="primary" className="btn-header-action" onClick={handleOpenModal}>
                        <FaPlus className="me-2" /> Nova Ferramenta
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row className="g-3 align-items-center">
                        <Col lg={4}>
                            <div className="header-search-container">
                                <FaSearch className="search-icon" />
                                <Form.Control 
                                    type="text"
                                    className="search-input"
                                    placeholder="Buscar ferramenta..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                        </Col>
                        <Col lg={4}>
                            <Form.Select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                                <option value="">Todas as Soluções</option>
                                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </Form.Select>
                        </Col>
                        <Col lg={4}>
                            <Form.Select value={filtroFabricante} onChange={(e) => setFiltroFabricante(e.target.value)}>
                                <option value="">Todos os Fabricantes</option>
                                {fabricantes.map(fab => <option key={fab.id} value={fab.id}>{fab.name}</option>)}
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0">
                                    <div className="table-responsive">
                                        <Table hover className="align-middle border mb-0">
                                            <thead className="table-light text-muted small text-uppercase">
                                                <tr>
                                                    <th className="px-4 py-3 fw-bold border-0">Ferramenta</th>
                                                    <th className="py-3 fw-bold border-0">Solução</th>
                                                    <th className="py-3 fw-bold border-0">Fabricante</th>
                                                    <th className="py-3 fw-bold border-0">Criado por</th>
                                                    <th className="py-3 fw-bold border-0">Data</th>
                                                    <th className="text-end px-4 py-3 fw-bold border-0">Acessar</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan="6" className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                                                ) : filteredTools.length > 0 ? (
                                                    filteredTools.map((fer) => (
                                                        <tr key={fer.id}>
                                                            <td className="px-4 py-3 fw-bold text-dark">{fer.nome}</td>
                                                            <td className="py-3"><Badge bg={getBadgeBg(fer.solucao)}>{fer.solucao}</Badge></td>
                                                            <td className="py-3 text-muted">{fer.fabricante_nome || 'Geral'}</td>
                                                            <td className="py-3 text-muted small">{fer.usuario_nome || 'Sistema'}</td>
                                                            <td className="py-3 text-muted small">{new Date(fer.created_at).toLocaleDateString('pt-BR')}</td>
                                                            <td className="py-3 text-end px-4">
                                                                <a href={fer.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm me-2 shadow-sm" title="Acessar Ferramenta"><FaExternalLinkAlt /> Acessar</a>
                                                                <Button variant="light" size="sm" className="shadow-sm text-danger" title="Excluir" onClick={() => handleDeleteTool(fer.id)}><FaTrash /></Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="6" className="text-center py-5 text-muted">Nenhuma ferramenta encontrada.</td></tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
            </Card>

                    <Modal show={showModal} onHide={handleCloseModal} size="md" centered>
                        <Form onSubmit={handleSaveTool}>
                            <Modal.Header closeButton><Modal.Title>Adicionar Ferramenta</Modal.Title></Modal.Header>
                            <Modal.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Nome da Ferramenta *</Form.Label>
                                    <Form.Control type="text" name="nome" placeholder="Ex: Calculadora de Nobreak" value={formData.nome} onChange={handleInputChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Link de Acesso (URL) *</Form.Label>
                                    <Form.Control type="url" name="link" placeholder="https://..." value={formData.link} onChange={handleInputChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Categoria / Solução *</Form.Label>
                                    {!showNewCatInput ? (<Form.Select name="solucao" value={formData.solucao} onChange={handleInputChange} required><option value="">Selecione...</option>{categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}<option value="CREATE_NEW" className="fw-bold text-primary">[+] Criar Nova Solução</option></Form.Select>) : (<InputGroup><Form.Control type="text" placeholder="Nome da nova solução" value={newCatText} onChange={(e) => setNewCatText(e.target.value)} autoFocus /><Button variant="success" onClick={handleAddNewCategoria}><FaCheck /></Button><Button variant="outline-secondary" onClick={() => setShowNewCatInput(false)}>X</Button></InputGroup>)}
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Fabricante Relacionado</Form.Label>
                                    <Form.Select name="fabricante_id" value={formData.fabricante_id} onChange={handleInputChange}><option value="">Nenhum / Uso Geral</option>{fabricantes.map(fab => <option key={fab.id} value={fab.id}>{fab.name}</option>)}</Form.Select>
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer className="bg-light">
                                <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                                <Button variant="primary" type="submit" disabled={!formData.solucao || showNewCatInput || saving}>{saving ? <Spinner size="sm" animation="border" /> : 'Salvar Ferramenta'}</Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
        </div>
    );
};
export default FerramentasUteisPage; // Exporta o nome atualizado