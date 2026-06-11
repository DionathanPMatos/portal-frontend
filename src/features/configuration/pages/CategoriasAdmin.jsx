import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Modal, Spinner, Badge, Tabs, Tab, Row, Col, InputGroup } from 'react-bootstrap';
import apiClient from '../../../services/api'; 
import { FaPlus, FaTrash, FaSitemap, FaEdit, FaBriefcase, FaSearch } from 'react-icons/fa';

function CategoriasAdmin() {
  const [activeTab, setActiveTab] = useState('categorias');
  const [subgrupos, setSubgrupos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [verticais, setVerticais] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modais e Estados do Formulário
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // 🚀 Diz se estamos editando ou criando
  const [nomeSubgrupo, setNomeSubgrupo] = useState('');
  const [setorId, setSetorId] = useState('');
  const [verticalId, setVerticalId] = useState(''); // NOVO ESTADO

  // Modal Verticais
  const [showVerticalModal, setShowVerticalModal] = useState(false);
  const [editingVerticalId, setEditingVerticalId] = useState(null);
  const [nomeVertical, setNomeVertical] = useState('');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSub, resSetores, resVert] = await Promise.all([
        apiClient.get('/api/faq/subgrupos'),
        apiClient.get('/api/setores'),
        apiClient.get('/api/verticais') 
      ]);
      setSubgrupos(resSub.data);
      setSetores(resSetores.data);
      setVerticais(resVert.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Abre o modal para CRIAR
  const handleOpenCreate = () => {
    setEditingId(null);
    setNomeSubgrupo('');
    setSetorId('');
    setVerticalId('');
    setShowModal(true);
  };

  // 🚀 Abre o modal para EDITAR
  const handleOpenEdit = (categoria) => {
    setEditingId(categoria.id);
    setNomeSubgrupo(categoria.nome);
    setSetorId(categoria.setor_id);
    setVerticalId(categoria.vertical_id || '');
    setShowModal(true);
  };

  const handleSaveCategoria = async (e) => {
    e.preventDefault();
    if (!setorId) return alert("Selecione um setor!");
    
    try {
      const payload = { 
        nome: nomeSubgrupo, 
        setor_id: parseInt(setorId),
        vertical_id: verticalId ? parseInt(verticalId) : null 
      };

      if (editingId) {
        // Atualiza a categoria existente
        await apiClient.put(`/api/faq/subgrupos/${editingId}`, payload);
      } else {
        // Cria uma nova
        await apiClient.post('/api/faq/subgrupos', payload);
      }

      setShowModal(false);
      fetchData(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      alert("Erro ao salvar categoria.");
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta categoria?")) return;
    try {
      await apiClient.delete(`/api/faq/subgrupos/${id}`);
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir categoria. Ela pode estar em uso.");
    }
  };

  const getNomeSetor = (id) => {
    const setor = setores.find(s => String(s.id) === String(id));
    return setor ? setor.nome_setor : `Setor ID: ${id}`;
  };

  const getNomeVertical = (id) => {
    if (!id) return <span className="text-muted small">Nenhuma</span>;
    const vertical = verticais.find(v => String(v.id) === String(id));
    return vertical ? <Badge bg="secondary">{vertical.nome}</Badge> : `Vertical ID: ${id}`;
  };

  const filteredSubgrupos = subgrupos.filter(sub => {
    const matchSearch = sub.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSetor = filtroSetor ? String(sub.setor_id) === String(filtroSetor) : true;
    return matchSearch && matchSetor;
  });

  // ==========================================
  // VERTICAIS
  // ==========================================
  const handleOpenCreateVertical = () => {
    setEditingVerticalId(null);
    setNomeVertical('');
    setShowVerticalModal(true);
  };

  const handleOpenEditVertical = (vert) => {
    setEditingVerticalId(vert.id);
    setNomeVertical(vert.nome);
    setShowVerticalModal(true);
  };

  const handleSaveVertical = async (e) => {
    e.preventDefault();
    try {
      const payload = { nome: nomeVertical };
      if (editingVerticalId) await apiClient.put(`/api/verticais/${editingVerticalId}`, payload);
      else await apiClient.post('/api/verticais', payload);
      setShowVerticalModal(false);
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar vertical:", error);
      alert("Erro ao salvar vertical. Ela já pode existir.");
    }
  };

  const handleDeleteVertical = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta vertical?")) return;
    try {
      await apiClient.delete(`/api/verticais/${id}`);
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir vertical. Ela pode estar vinculada a projetos ou engenheiros.");
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 className="m-0 text-dark fw-bold"><FaSitemap className="me-2 text-primary"/> Gestão de Categorias e Verticais</h2>
            <p className="text-muted mb-0">Gerencie as categorias/subgrupos e as Verticais de Negócio do sistema.</p>
        </div>
        {activeTab === 'categorias' ? (
            <Button variant="primary" className="shadow-sm" onClick={handleOpenCreate}>
            <FaPlus className="me-2" /> Nova Categoria
            </Button>
        ) : (
            <Button variant="primary" className="shadow-sm" onClick={handleOpenCreateVertical}>
            <FaPlus className="me-2" /> Nova Vertical
            </Button>
        )}
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 custom-tabs">
        {/* TAB 1: CATEGORIAS */}
        <Tab eventKey="categorias" title="Categorias de Verticais">
          <Card className="shadow-sm border-0 mt-3">
            <Card.Body>
              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : (
                <>
                  <Row className="mb-4 g-3">
                    <Col md={6} lg={4}>
                      <InputGroup className="shadow-sm">
                        <InputGroup.Text className="bg-white border-end-0">
                          <FaSearch className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                          placeholder="Buscar categoria..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="border-start-0 ps-0 shadow-none"
                        />
                      </InputGroup>
                    </Col>
                    <Col md={6} lg={4}>
                      <Form.Select className="shadow-sm shadow-none" value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)}>
                        <option value="">Todos os Setores</option>
                        {setores.map(s => <option key={s.id} value={s.id}>{s.nome_setor}</option>)}
                      </Form.Select>
                    </Col>
                  </Row>
                <Table responsive hover className="align-middle">
                  <thead className="table-light text-uppercase small text-muted">
                    <tr>
                      <th>ID</th>
                      <th>Nome da Categoria</th>
                      <th>Setor Pertencente</th>
                      <th>Vertical Associada</th>
                      <th className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubgrupos.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-4">Nenhuma categoria encontrada.</td></tr>
                    ) : (
                      filteredSubgrupos.map((sub) => (
                        <tr key={sub.id}>
                          <td>{sub.id}</td>
                          <td className="fw-bold">{sub.nome}</td>
                          <td>
                            <Badge bg="info" className="text-dark border border-info">
                                {getNomeSetor(sub.setor_id)}
                            </Badge>
                          </td>
                          <td>
                            {getNomeVertical(sub.vertical_id)}
                          </td>
                          <td className="text-end">
                            <Button variant="light" size="sm" className="text-primary shadow-sm me-2" onClick={() => handleOpenEdit(sub)}><FaEdit /></Button>
                            <Button variant="light" size="sm" className="text-danger shadow-sm" onClick={() => handleDeleteCategoria(sub.id)}><FaTrash /></Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* TAB 2: VERTICAIS */}
        <Tab eventKey="verticais" title="Verticais de Negócio">
          <Card className="shadow-sm border-0 mt-3">
            <Card.Body>
              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : (
                <Table responsive hover className="align-middle">
                  <thead className="table-light text-uppercase small text-muted">
                    <tr>
                      <th>ID</th>
                      <th>Nome da Vertical</th>
                      <th className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verticais.length === 0 ? (
                      <tr><td colSpan="3" className="text-center py-4">Nenhuma vertical cadastrada.</td></tr>
                    ) : (
                      verticais.map((v) => (
                        <tr key={v.id}>
                          <td>{v.id}</td>
                          <td className="fw-bold"><FaBriefcase className="text-muted me-2"/> {v.nome}</td>
                          <td className="text-end">
                            <Button variant="light" size="sm" className="text-primary shadow-sm me-2" onClick={() => handleOpenEditVertical(v)}><FaEdit /></Button>
                            <Button variant="light" size="sm" className="text-danger shadow-sm" onClick={() => handleDeleteVertical(v.id)}><FaTrash /></Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* MODAL: CRIAR / EDITAR CATEGORIA */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSaveCategoria}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Editar Categoria' : 'Criar Nova Categoria'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Setor Responsável</Form.Label>
              <Form.Select required value={setorId} onChange={(e) => setSetorId(e.target.value)}>
                <option value="">-- Selecione o Setor --</option>
                {setores.map(s => (
                    <option key={s.id} value={s.id}>{s.nome_setor}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">A qual departamento esta categoria pertence?</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Nome da Categoria</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={nomeSubgrupo} 
                onChange={(e) => setNomeSubgrupo(e.target.value)} 
                placeholder="Ex: DAHUA - Câmeras..." 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Vertical (Opcional)</Form.Label>
              <Form.Select value={verticalId} onChange={(e) => setVerticalId(e.target.value)}>
                <option value="">-- Nenhuma / Geral --</option>
                {verticais.map(v => (
                    <option key={v.id} value={v.id}>{v.nome}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">Selecione uma vertical caso esta categoria seja específica (Ex: Networking, Segurança).</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">
                {editingId ? 'Salvar Alterações' : 'Salvar Categoria'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL: CRIAR / EDITAR VERTICAL */}
      <Modal show={showVerticalModal} onHide={() => setShowVerticalModal(false)}>
        <Form onSubmit={handleSaveVertical}>
          <Modal.Header closeButton>
            <Modal.Title>{editingVerticalId ? 'Editar Vertical' : 'Criar Nova Vertical'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Nome da Vertical de Negócio</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={nomeVertical} 
                onChange={(e) => setNomeVertical(e.target.value)} 
                placeholder="Ex: Segurança Eletrônica, Networking..." 
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowVerticalModal(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">
                {editingVerticalId ? 'Salvar Alterações' : 'Salvar Vertical'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default CategoriasAdmin;