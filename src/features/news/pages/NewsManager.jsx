import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Badge, Modal, Row, Col, Spinner, InputGroup, Tabs, Tab, ListGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaTags, FaChartBar, FaEye, FaHeart, FaComment, FaPaperclip, FaTimes, FaFileExcel, FaFilter, FaRegNewspaper } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import apiClient from '../../../services/api';
import NewsMetricsDashboard from '../components/NewsMetricsDashboard';

export default function NewsManager() {
    const [news, setNews] = useState([]);
    const [setores, setSetores] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('manager');
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [filters, setFilters] = useState({
        status: '',
        categoryId: '',
        startDate: '',
        endDate: '',
    });

    // State para o modal principal de notícias
    const [showModal, setShowModal] = useState(false);
    const getInitialFormData = () => ({
        id: null,
        titulo: '',
        resumo: '',
        conteudo: '',
        tipo: 'Informativo',
        fixado: false,
        setores_alvo: [],
        category_id: '',
        status: 'DRAFT',
        requires_confirmation: false, // Corrected from requires_confirmation
        published_at: '',
        expires_at: '',
        attachments: []
    });
    const [formData, setFormData] = useState(getInitialFormData());
    const [attachmentFiles, setAttachmentFiles] = useState([]);

    // State para o modal de gerenciamento de categorias
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, [filters]); // Refetch when filters change

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchNews(), fetchSetores(), fetchCategories()]);
        } catch (err) {
            console.error("Erro ao carregar dados iniciais", err);
            alert("Falha ao carregar dados. Tente recarregar a página.");
        } finally {
            setLoading(false);
        }
    };

    const fetchNews = async () => {
        try {
            // Busca as notícias para o gerenciador, incluindo os rascunhos do autor.
            const { data } = await apiClient.get('/api/noticias', {
                params: { 
                    view: 'manager',
                    ...filters
                }
            });
            setNews(data);
        } catch (err) { console.error("Erro ao buscar notícias:", err); }
    };

    const fetchSetores = async () => {
        try {
            const { data } = await apiClient.get('/api/setores');
            setSetores(data);
        } catch (err) { console.error(err); }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await apiClient.get('/api/noticias/categories');
            setCategories(data);
        } catch (err) { console.error("Erro ao buscar categorias:", err); }
    };

    const handleShowModal = (n = null) => {
        if (n) {
            setFormData({
                ...getInitialFormData(),
                ...n,
                category_id: n.category_id || '',
                published_at: n.published_at ? new Date(n.published_at).toISOString().slice(0, 16) : '',
                expires_at: n.expires_at ? new Date(n.expires_at).toISOString().slice(0, 16) : '',
                attachments: n.attachments || []
            });
        } else {
            setFormData(getInitialFormData());
        }
        setAttachmentFiles([]); // Limpa a seleção de novos arquivos ao abrir o modal
        setShowModal(true);
    };

    const handleSaveNews = async (status) => {
        setIsSaving(true);
        try {
            let payload = {
                ...formData,
                status: status, // 'DRAFT' ou 'PUBLISHED'
                setores_alvo: formData.setores_alvo.map(Number),
                category_id: formData.category_id ? Number(formData.category_id) : null
            };

            let response;
            if (formData.id) {
                response = await apiClient.put(`/api/noticias/${formData.id}`, payload);
            } else {
                response = await apiClient.post('/api/noticias', payload);
            }

            const newsId = response.data.id;

            // Se houver novos anexos, faz o upload deles
            if (attachmentFiles.length > 0) {
                const attachmentFormData = new FormData();
                attachmentFiles.forEach(file => {
                    attachmentFormData.append('attachments', file);
                });
                await apiClient.post(`/api/noticias/${newsId}/attachments`, attachmentFormData);
            }

            // Fecha o modal e atualiza a lista principal, dando feedback ao usuário.
            setShowModal(false);
            fetchNews();

        } catch (err) {
            console.error("Erro ao salvar notícia:", err);
            alert('Erro ao salvar notícia.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta notícia permanentemente?')) {
            try {
                await apiClient.delete(`/api/noticias/${id}`);
                fetchNews();
            } catch (err) {
                console.error("Erro ao excluir notícia:", err);
                alert('Erro ao excluir.');
            }
        }
    };

    const handleSectorToggle = (setorId) => {
        const sId = Number(setorId);
        setFormData(prev => {
            const current = prev.setores_alvo || [];
            return {
                ...prev,
                setores_alvo: current.includes(sId) ? current.filter(id => id !== sId) : [...current, sId]
            };
        });
    };

    // --- Funções do CRUD de Categorias ---
    const handleOpenCategoryModal = (cat = null) => {
        if (cat) {
            setEditingCategory(cat);
            setCategoryName(cat.name);
        } else {
            setEditingCategory(null);
            setCategoryName('');
        }
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        try {
            const payload = { name: categoryName };
            if (editingCategory) {
                await apiClient.put(`/api/noticias/categories/${editingCategory.id}`, payload);
            } else {
                await apiClient.post('/api/noticias/categories', payload);
            }
            await fetchCategories(); // Re-busca as categorias para atualizar o select
            handleOpenCategoryModal(); // Reseta e mantém o modal aberto para adicionar mais
        } catch (error) {
            console.error("Erro ao salvar categoria:", error);
            alert("Erro ao salvar categoria. O nome pode já existir.");
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await apiClient.delete(`/api/noticias/categories/${id}`);
            await fetchCategories();
        } catch (error) {
            console.error("Erro ao deletar categoria:", error);
            alert("Erro ao deletar. A categoria pode estar em uso.");
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!window.confirm("Tem certeza que deseja remover este anexo?")) return;
        try {
            await apiClient.delete(`/api/noticias/attachments/${attachmentId}`);
            // Remove o anexo do estado local para atualizar a UI imediatamente
            setFormData(prev => ({ ...prev, attachments: prev.attachments.filter(att => att.id !== attachmentId) }));
        } catch (error) {
            console.error("Erro ao deletar anexo:", error);
            alert("Erro ao remover o anexo.");
        }
    };
    
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await apiClient.get('/api/noticias/excel-report', {
                responseType: 'blob', // Important to handle file download
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'relatorio_noticias.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao exportar para Excel:', error);
            alert('Falha ao gerar o relatório.');
        } finally {
            setIsExporting(false);
        }
    };

    // Configuração do editor WYSIWYG para habilitar o upload de imagens
    const editorConfiguration = {
        // Habilita o plugin de upload de imagem simples, que já vem no build clássico
        simpleUpload: {
            // A URL do endpoint que criamos no backend para receber a imagem
            uploadUrl: `${apiClient.defaults.baseURL}/api/noticias/upload-image`,
            // Envia o token de autenticação no cabeçalho da requisição de upload
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('@portal_token')}`
            }
        },
        // Opcional: traduz a interface do editor para português
        language: 'pt-br',
    };

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <div className="page-header-colored mb-4">
                    <div className="page-header-title-wrapper">
                        <h2 className="page-header-title d-flex align-items-center gap-3">
                            <FaRegNewspaper /> Gerenciador de Notícias
                        </h2>
                        <p className="page-header-subtitle">Crie, edite e publique comunicados internos para toda a empresa.</p>
                    </div>
                    <div className="page-header-actions-wrapper">
                        <Button variant="light" className="btn-header-action" onClick={handleExport} disabled={isExporting}>
                            {isExporting ? <Spinner as="span" size="sm" /> : <FaFileExcel className="me-2"/>} Gerar Relatório
                        </Button>
                        <Button variant="light" className="btn-header-action" onClick={() => handleOpenCategoryModal()}><FaTags className="me-2"/> Categorias</Button>
                        <Button variant="primary" onClick={() => handleShowModal()}><FaPlus className="me-2"/> Nova Postagem</Button>
                    </div>
                </div>

                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="news-manager-tabs" className="mb-3">
                    <Tab eventKey="manager" title="Gerenciador de Notícias">
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-light p-3">
                                <Row className="g-2 align-items-center">
                                    <Col xs="auto"><FaFilter className="text-muted" /></Col>
                                    <Col md={3}>
                                        <Form.Select size="sm" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                                            <option value="">Todos os Status</option>
                                            <option value="PUBLISHED">Publicado</option>
                                            <option value="DRAFT">Rascunho</option>
                                            <option value="SCHEDULED">Agendado</option>
                                            <option value="ARCHIVED">Arquivado</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Select size="sm" value={filters.categoryId} onChange={e => setFilters({...filters, categoryId: e.target.value})}>
                                            <option value="">Todas as Categorias</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </Form.Select>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Control type="date" size="sm" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
                                    </Col>
                                    <Col md={2}>
                                        <Form.Control type="date" size="sm" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
                                    </Col>
                                    <Col>
                                        <Button variant="outline-secondary" size="sm" onClick={() => setFilters({ status: '', categoryId: '', startDate: '', endDate: ''})}>
                                            Limpar Filtros
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Header>
                            <Table responsive hover className="align-middle mb-0">
                                <thead className="table-light text-uppercase small text-muted">
                                    <tr>
                                        <th>Título</th>
                                        <th>Categoria</th>
                                        <th>Status</th>
                                        <th>Engajamento</th>
                                        <th>Autor</th>
                                        <th>Data Criação</th>
                                        <th className="text-end">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="text-center p-5"><Spinner animation="border" /> Carregando notícias...</td></tr>
                                    ) : news.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center p-4 text-muted">Nenhuma notícia encontrada com os filtros aplicados.</td></tr>
                                    ) : news.map(n => (
                                        <tr key={n.id}>
                                            <td className="fw-bold">{n.titulo}</td>
                                            <td><Badge bg="light" text="dark" className="border">{n.category_name || 'N/A'}</Badge></td>
                                            <td>
                                                {(() => {
                                                    const isExpired = n.expires_at && new Date(n.expires_at) < new Date();
                                                    if (isExpired && n.status !== 'DRAFT') return <Badge bg="dark">Expirado</Badge>;
                                                    if (n.status === 'PUBLISHED') return <Badge bg="success">Publicado</Badge>;
                                                    if (n.status === 'SCHEDULED') return <Badge bg="info">Agendado</Badge>;
                                                    if (n.status === 'ARCHIVED') return <Badge bg="secondary">Arquivado</Badge>;
                                                    return <Badge bg="light" text="dark" className="border">Rascunho</Badge>;
                                                })()}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-3 text-muted small">
                                                    <span title="Visualizações"><FaEye className="me-1" />{n.view_count || 0}</span>
                                                    <span title="Curtidas"><FaHeart className="me-1" />{n.likes_count || 0}</span>
                                                    <span title="Comentários"><FaComment className="me-1" />{n.comments_count || 0}</span>
                                                </div>
                                            </td>
                                            <td>{n.autor || 'Sistema'}</td>
                                            <td>{new Date(n.created_at).toLocaleDateString('pt-BR')}</td>
                                            <td className="text-end">
                                                {n.requires_confirmation && (
                                                    <Button as={Link} to={`/admin/noticias/${n.id}/report`} variant="light" size="sm" className="text-info me-2" title="Relatório de Leitura">
                                                        <FaChartBar />
                                                    </Button>
                                                )}
                                                <Button variant="light" size="sm" className="text-primary me-2" onClick={() => handleShowModal(n)} title="Editar"><FaEdit /></Button>
                                                <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(n.id)}><FaTrash /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card>
                    </Tab>
                    <Tab eventKey="metrics" title="Métricas de Visualização">
                        <NewsMetricsDashboard />
                    </Tab>
                </Tabs>

                <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" backdrop="static">
                    <Form>
                        <Modal.Header closeButton><Modal.Title>{formData.id ? 'Editar Notícia' : 'Nova Postagem'}</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <Row className="g-3">
                                <Col md={12}><Form.Group><Form.Label>Título</Form.Label><Form.Control required type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} /></Form.Group></Col>
                                
                                <Col md={3}>
                                    <Form.Group><Form.Label>Tipo</Form.Label>
                                        <Form.Select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                                            <option value="Informativo">Informativo</option><option value="Aviso">Aviso</option>
                                            <option value="Evento">Evento</option><option value="Urgente">Urgente</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group><Form.Label>Categoria</Form.Label>
                                        <Form.Select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                                            <option value="">-- Sem Categoria --</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group><Form.Label>Agendar Publicação (Opcional)</Form.Label>
                                        <Form.Control type="datetime-local" value={formData.published_at} onChange={e => setFormData({...formData, published_at: e.target.value})} />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group><Form.Label>Data de Expiração (Opcional)</Form.Label>
                                        <Form.Control type="datetime-local" value={formData.expires_at} onChange={e => setFormData({...formData, expires_at: e.target.value})} />
                                        <Form.Text className="text-muted">A notícia será arquivada após esta data.</Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={12}><Form.Group><Form.Label>Resumo (Texto do Card)</Form.Label><Form.Control as="textarea" rows={2} required maxLength={200} value={formData.resumo} onChange={e => setFormData({...formData, resumo: e.target.value})} /></Form.Group></Col>
                                <Col md={12}>
                                    <Form.Group><Form.Label>Conteúdo Completo</Form.Label>
                                        <CKEditor 
                                            editor={ClassicEditor} 
                                            config={editorConfiguration} // 🚀 Adiciona a configuração do editor
                                            data={formData.conteudo} 
                                            onChange={(e, editor) => setFormData({...formData, conteudo: editor.getData()})} 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="d-block mb-2">Visibilidade (Selecione setores. Vazio = Todos)</Form.Label>
                                        <div className="d-flex flex-wrap gap-2 p-3 bg-light rounded border">
                                            {setores.map(s => (
                                                <Form.Check key={s.id} type="checkbox" id={`setor-${s.id}`} label={s.nome_setor} 
                                                    checked={(formData.setores_alvo || []).includes(s.id)}
                                                    onChange={() => handleSectorToggle(s.id)}
                                                />
                                            ))}
                                        </div>
                                    </Form.Group>
                                </Col>

                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="d-block mb-2"><FaPaperclip /> Anexos</Form.Label>
                                        {formData.attachments && formData.attachments.length > 0 && (
                                            <ListGroup className="mb-2">
                                                {formData.attachments.map(att => (
                                                    <ListGroup.Item key={att.id} className="d-flex justify-content-between align-items-center">
                                                        <a href={att.file_url} target="_blank" rel="noopener noreferrer">{att.file_name}</a>
                                                        <Button variant="link" size="sm" className="text-danger" onClick={() => handleDeleteAttachment(att.id)}>
                                                            <FaTimes />
                                                        </Button>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                        <Form.Control 
                                            type="file" 
                                            multiple 
                                            onChange={(e) => setAttachmentFiles(Array.from(e.target.files))} 
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}><Form.Check type="switch" label="Fixar no topo do mural?" checked={formData.fixado} onChange={e => setFormData({...formData, fixado: e.target.checked})} /></Col>
                                <Col md={6}><Form.Check type="switch" label="Exigir confirmação de leitura ('Estou Ciente')" checked={formData.requires_confirmation} onChange={e => setFormData({...formData, requires_confirmation: e.target.checked})} /></Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer className="d-flex justify-content-between">
                            <Button variant="light" onClick={() => setShowModal(false)}>Cancelar</Button>
                            <div>
                                <Button variant="outline-primary" className="me-2" onClick={() => handleSaveNews('DRAFT')} disabled={isSaving}>
                                    {isSaving ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Salvando...</> : 'Salvar como Rascunho'}
                                </Button>
                                <Button variant="primary" onClick={() => handleSaveNews('PUBLISHED')} disabled={isSaving}>
                                    {isSaving ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Salvando...</> : (formData.published_at && new Date(formData.published_at) > new Date() ? 'Agendar Publicação' : 'Publicar Agora')}
                                </Button>
                            </div>
                        </Modal.Footer>
                    </Form>
                </Modal>

                {/* Modal para Gerenciar Categorias */}
                <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title><FaTags className="me-2"/> Gerenciar Categorias</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSaveCategory} className="mb-3">
                            <InputGroup>
                                <Form.Control
                                    placeholder={editingCategory ? "Editar nome..." : "Nova categoria..."}
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    required
                                />
                                <Button type="submit" variant="primary">{editingCategory ? 'Atualizar' : 'Adicionar'}</Button>
                                {editingCategory && <Button variant="outline-secondary" onClick={() => handleOpenCategoryModal()}>Cancelar</Button>}
                            </InputGroup>
                        </Form>
                        <Table striped bordered hover size="sm">
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id}>
                                        <td>{cat.name}</td>
                                        <td className="text-end" style={{ width: '100px' }}>
                                            <Button variant="link" size="sm" className="text-primary p-0 me-2" onClick={() => handleOpenCategoryModal(cat)}><FaEdit /></Button>
                                            <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDeleteCategory(cat.id)}><FaTrash /></Button>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr><td className="text-center text-muted">Nenhuma categoria.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
}