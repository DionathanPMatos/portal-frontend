import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Table, Badge, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaPlus, FaExternalLinkAlt, FaTrash, FaCheck, FaWrench } from 'react-icons/fa';
import axios from 'axios';
import '../../App.css';

// Mocks para ajudar na renderização visual (podem ser criadas novas depois)
const CATEGORIAS_MOCK = ["Segurança Eletrônica", "Pon Lan", "Networking", "Data Center", "Áudio e Vídeo IP", "Ferramentas e Testes", "Energia"];

const getBadgeBg = (text) => {
    const colors = ['primary', 'danger', 'success', 'purple', 'warning text-dark', 'info', 'secondary'];
    const index = text.length % colors.length;
    return colors[index];
};

const FerramentasUteis = () => {
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

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ferRes, fabRes] = await Promise.all([
                axios.get('/api/ferramentas'),
                axios.get('/api/fabricantes')
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
    };

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
            await axios.post('/api/ferramentas', { ...formData, link: finalLink });
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
                await axios.delete(`/api/ferramentas/${id}`);
                setFerramentas(ferramentas.filter(f => f.id !== id));
            } catch (err) {
                alert('Erro ao excluir ferramenta.');
            }
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
                                    <Card.Title as="h4" className="d-flex align-items-center gap-2 mb-0"> <FaWrench /> Ferramentas Úteis</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                        <div>
                                            <h4 className="fw-bold mb-1 text-dark">Caixa de Ferramentas</h4>
                                            <p className="text-muted mb-0">Calculadoras, simuladores e ferramentas oficiais de fabricantes para o pré-vendas.</p>
                                        </div>
                                        <Button variant="primary" className="d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenModal}>
                                            <FaPlus /> Nova Ferramenta
                                        </Button>
                                    </div>

                                    {error && <Alert variant="danger">{error}</Alert>}

                                    <Row className="mb-4 g-3">
                                        <Col md={12} lg={4}>
                                            <InputGroup className="shadow-sm">
                                                <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                                <Form.Control placeholder="Buscar ferramenta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border-start-0 ps-0 shadow-none"/>
                                            </InputGroup>
                                        </Col>
                                        <Col md={6} lg={4}>
                                            <Form.Select className="shadow-sm shadow-none" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                                                <option value="">Todas as Soluções</option>
                                                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </Form.Select>
                                        </Col>
                                        <Col md={6} lg={4}>
                                            <Form.Select className="shadow-sm shadow-none" value={filtroFabricante} onChange={(e) => setFiltroFabricante(e.target.value)}>
                                                <option value="">Todos os Fabricantes</option>
                                                {fabricantes.map(fab => <option key={fab.id} value={fab.id}>{fab.name}</option>)}
                                            </Form.Select>
                                        </Col>
                                    </Row>

                                    <div className="table-responsive">
                                        <Table hover className="align-middle border mb-0">
                                            <thead className="table-light text-muted small text-uppercase">
                                                <tr>
                                                    <th className="py-3 px-4">Ferramenta</th>
                                                    <th className="py-3">Solução</th>
                                                    <th className="py-3">Fabricante</th>
                                                    <th className="py-3">Criado por</th>
                                                    <th className="py-3">Data</th>
                                                    <th className="py-3 text-end px-4">Acessar</th>
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
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

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
                </Container>
            </div>
        </div>
    );
};
export default FerramentasUteis;