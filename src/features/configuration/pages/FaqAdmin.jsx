import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Badge, Spinner } from 'react-bootstrap';
import apiClient from '../../../services/api'; // Ajuste o caminho conforme a sua estrutura
import { FaPlus, FaTrash, FaLink } from 'react-icons/fa';

function FaqAdmin() {
  const [subgrupos, setSubgrupos] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [showSubModal, setShowSubModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  // Formulários
  const [nomeSubgrupo, setNomeSubgrupo] = useState('');
  const [setorId, setSetorId] = useState(3); // Ex: 3 = Departamento Técnico
  const [selectedSubgrupo, setSelectedSubgrupo] = useState(null);
  const [selectedFabricante, setSelectedFabricante] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Busca os subgrupos (já vêm com os fabricantes atrelados graças ao Prisma)
      const resSub = await apiClient.get('/api/faq/subgrupos');
      setSubgrupos(resSub.data);

      // Busca a lista de fabricantes para o select de vínculo
      const resFab = await apiClient.get('/api/fabricantes'); 
      setFabricantes(Array.isArray(resFab.data) ? resFab.data : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNÇÕES DE AÇÃO
  // ==========================================
  const handleCreateSubgrupo = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/faq/subgrupos', { nome: nomeSubgrupo, setor_id: setorId });
      setNomeSubgrupo('');
      setShowSubModal(false);
      fetchData(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao criar subgrupo:", error);
      alert("Erro ao criar subgrupo.");
    }
  };

  const handleLinkFabricante = async (e) => {
    e.preventDefault();
    if (!selectedFabricante) return alert("Selecione um fabricante!");
    try {
      await apiClient.post('/api/faq/vinculos', {
        subgrupo_id: selectedSubgrupo.id,
        fabricante_id: selectedFabricante
      });
      setSelectedFabricante('');
      setShowLinkModal(false);
      fetchData(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao vincular fabricante:", error);
      alert("Erro ao vincular fabricante.");
    }
  };

  const handleUnlinkFabricante = async (fabricanteId, subgrupoId) => {
    if (!window.confirm("Deseja realmente remover este vínculo?")) return;
    try {
      await apiClient.delete(`/api/faq/vinculos/${fabricanteId}/${subgrupoId}`);
      fetchData(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao remover vínculo:", error);
      alert("Erro ao remover vínculo.");
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0">Gestão de Categorias (FAQ)</h2>
        <Button variant="primary" onClick={() => setShowSubModal(true)}>
          <FaPlus className="me-2" /> Novo Subgrupo
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Subgrupo (Categoria)</th>
                  <th>Setor</th>
                  <th>Fabricantes Vinculados</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {subgrupos.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4">Nenhum subgrupo cadastrado.</td></tr>
                ) : (
                  subgrupos.map((sub) => (
                    <tr key={sub.id}>
                      <td>{sub.id}</td>
                      <td className="fw-bold">{sub.nome}</td>
                      <td>{sub.setor_id === 3 ? 'Técnico' : sub.setor_id}</td>
                      <td>
                        {sub.fabricantes.map((vinculo) => (
                          <Badge 
                            bg="secondary" 
                            key={vinculo.fabricante_id} 
                            className="me-2 p-2 d-inline-flex align-items-center"
                          >
                            {vinculo.fabricante.name}
                            <FaTrash 
                              className="ms-2 text-danger" 
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleUnlinkFabricante(vinculo.fabricante_id, sub.id)}
                            />
                          </Badge>
                        ))}
                        {sub.fabricantes.length === 0 && <span className="text-muted small">Nenhum vínculo</span>}
                      </td>
                      <td className="text-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => { setSelectedSubgrupo(sub); setShowLinkModal(true); }}
                        >
                          <FaLink /> Vincular Fabricante
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* MODAL: CRIAR SUBGRUPO */}
      <Modal show={showSubModal} onHide={() => setShowSubModal(false)}>
        <Form onSubmit={handleCreateSubgrupo}>
          <Modal.Header closeButton>
            <Modal.Title>Criar Novo Subgrupo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome do Subgrupo (Ex: Câmeras, DVRs)</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={nomeSubgrupo} 
                onChange={(e) => setNomeSubgrupo(e.target.value)} 
                placeholder="Digite o nome..." 
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Setor Responsável</Form.Label>
              <Form.Select value={setorId} onChange={(e) => setSetorId(e.target.value)}>
                <option value={3}>Departamento Técnico</option>
                {/* No futuro, adicionamos opções para RH, Financeiro, etc */}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSubModal(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Salvar Subgrupo</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL: VINCULAR FABRICANTE */}
      <Modal show={showLinkModal} onHide={() => setShowLinkModal(false)}>
        <Form onSubmit={handleLinkFabricante}>
          <Modal.Header closeButton>
            <Modal.Title>Vincular a: {selectedSubgrupo?.nome}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Selecione o Fabricante</Form.Label>
              <Form.Select 
                required 
                value={selectedFabricante} 
                onChange={(e) => setSelectedFabricante(e.target.value)}
              >
                <option value="">-- Escolha --</option>
                {fabricantes.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowLinkModal(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Criar Vínculo</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default FaqAdmin;