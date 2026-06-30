import React, { useState, useEffect } from "react";
import { Table, Badge, Button, Form, Alert, Spinner, Offcanvas } from "react-bootstrap";
import ModalPrestador from "../components/ModalPrestador";
import ModalImportarPrestador from "../components/ModalImportarPrestador";
import apiClient from "../../../services/api";

const emptyPrestador = { 
  nome_fantasia: "", cnpj: "", contato: "", telefone: "", email: "", especialidade: "", classificacao: 0, observacoes: "", ativo: true,
  razao_social: "", cpf_responsavel: "", inscricao_estadual: "", site_empresa: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", subcategoria: "", porte_empresa: "", nome_responsavel: "", whatsapp_comercial: "", contrato_assinado: false, data_vencimento_seguro: "" 
};

export default function Fornecedores() {
  const [prestadores, setPrestadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEspecialidade, setFilterEspecialidade] = useState("");
  const [filterLocalidade, setFilterLocalidade] = useState("");
  const [filterClassificacao, setFilterClassificacao] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  // Modais
  const [showPrestadorModal, setShowPrestadorModal] = useState(false);
  const [prestadorData, setPrestadorData] = useState(emptyPrestador);
  const [showImportarModal, setShowImportarModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/facilities/prestadores");
      setPrestadores(res.data || []);
    } catch (e) {
      console.error(e);
      setErr("Erro ao buscar fornecedores.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrestador = async () => {
    try {
      if (prestadorData.id) {
        await apiClient.put(`/api/facilities/prestadores/${prestadorData.id}`, prestadorData);
        setSuccess("Fornecedor atualizado com sucesso!");
      } else {
        await apiClient.post("/api/facilities/prestadores", prestadorData);
        setSuccess("Fornecedor cadastrado com sucesso!");
      }
      setShowPrestadorModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.error || "Erro ao salvar fornecedor.");
    }
  };

  const handleEditPrestador = (p) => {
    setPrestadorData({
      ...p,
      data_vencimento_seguro: p.data_vencimento_seguro ? p.data_vencimento_seguro.split('T')[0] : ""
    });
    setShowPrestadorModal(true);
  };

  const handleToggleAtivo = async (p) => {
    try {
      await apiClient.put(`/api/facilities/prestadores/${p.id}`, { ...p, ativo: !p.ativo });
      fetchData();
      setSuccess(p.ativo ? "Fornecedor inativado!" : "Fornecedor ativado!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
      setErr("Erro ao alterar status do fornecedor.");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<i key={i} className={`bi bi-star${i <= rating ? '-fill text-warning' : ' text-secondary'}`}></i>);
    }
    return <span>{stars}</span>;
  };

  // Coleta dados únicos para filtros
  const especialidadesUnicas = [...new Set(prestadores.map(p => p.especialidade).filter(Boolean))].sort();
  const localidadesUnicas = [...new Set(prestadores.filter(p => p.cidade && p.uf).map(p => `${p.cidade}/${p.uf}`))].sort();

  const filteredPrestadores = prestadores.filter(p => {
    const matchesSearch = !searchTerm || (
      (p.nome_fantasia && p.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.razao_social && p.razao_social.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.cnpj && p.cnpj.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''))) ||
      (p.especialidade && p.especialidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.subcategoria && p.subcategoria.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const matchesEspecialidade = !filterEspecialidade || p.especialidade === filterEspecialidade;
    const matchesStatus = filterStatus === "" || String(p.ativo) === filterStatus;
    
    const local = p.cidade && p.uf ? `${p.cidade}/${p.uf}` : "";
    const matchesLocalidade = !filterLocalidade || local === filterLocalidade;
    const matchesClassificacao = !filterClassificacao || String(p.classificacao || 0) === filterClassificacao;
    
    return matchesSearch && matchesEspecialidade && matchesStatus && matchesLocalidade && matchesClassificacao;
  });

  return (
    <div className="mt-3">
      {err && <Alert variant="danger" onClose={() => setErr("")} dismissible>{err}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

      <div className="d-flex justify-content-between align-items-center mt-3 mb-3 flex-wrap gap-2">
        <div className="d-flex gap-2 flex-wrap flex-grow-1" style={{ maxWidth: '600px' }}>
          <Form.Control
            type="text"
            placeholder="Buscar por nome, CNPJ, especialidade ou subcategoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowFilterSidebar(true)} 
            className="d-flex align-items-center gap-2"
          >
            <i className="bi bi-funnel"></i> Filtros
            {(filterEspecialidade || filterLocalidade || filterClassificacao || filterStatus) && (
              <Badge bg="primary">Ativos</Badge>
            )}
          </Button>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={() => setShowImportarModal(true)}>
            <i className="bi bi-file-earmark-spreadsheet me-1"></i> Importar CSV
          </Button>
          <Button variant="primary" onClick={() => { setPrestadorData(emptyPrestador); setShowPrestadorModal(true); }}>
            <i className="bi bi-plus-lg me-1"></i> Novo Fornecedor
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="bg-light">
            <tr>
              <th>Nome Fantasia / Razão Social</th>
              <th>CNPJ / Porte</th>
              <th>Especialidade & Subcategoria</th>
              <th>Localidade (Cidade/UF)</th>
              <th>Contatos Principais</th>
              <th>Compliance & Seguro</th>
              <th>Status</th>
              <th style={{ width: '150px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrestadores.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="fw-bold text-dark">{p.nome_fantasia}</div>
                  <div className="text-muted small">{p.razao_social || "-"}</div>
                  <div className="mt-1">{renderStars(p.classificacao)}</div>
                </td>
                <td>
                  <div>{p.cnpj || "-"}</div>
                  {p.porte_empresa && <Badge bg="secondary" className="mt-1">{p.porte_empresa}</Badge>}
                </td>
                <td>
                  <div className="fw-semibold text-primary">{p.especialidade || "-"}</div>
                  <div className="text-muted small">{p.subcategoria || "-"}</div>
                </td>
                <td>{p.cidade && p.uf ? `${p.cidade}/${p.uf}` : "-"}</td>
                <td>
                  <div>{p.contato ? <strong>{p.contato}</strong> : "-"}</div>
                  <div className="small text-muted">{p.telefone} / {p.email}</div>
                </td>
                <td>
                  <div className="mb-1">
                    {p.contrato_assinado ? (
                      <Badge bg="success"><i className="bi bi-check-circle me-1"></i>Contrato OK</Badge>
                    ) : (
                      <Badge bg="warning" text="dark"><i className="bi bi-clock me-1"></i>Sem Contrato</Badge>
                    )}
                  </div>
                  {p.data_vencimento_seguro && (
                    <div className="small" style={{ fontSize: '0.8rem' }}>
                      Seguro: <strong className={new Date(p.data_vencimento_seguro) < new Date() ? "text-danger" : "text-muted"}>
                        {new Date(p.data_vencimento_seguro).toLocaleDateString("pt-BR")}
                      </strong>
                    </div>
                  )}
                </td>
                <td>
                  <Badge bg={p.ativo ? "success" : "secondary"}>
                    {p.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => handleEditPrestador(p)}>
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button size="sm" variant={p.ativo ? "outline-danger" : "outline-success"} onClick={() => handleToggleAtivo(p)}>
                    <i className={p.ativo ? "bi bi-slash-circle" : "bi bi-check-circle"}></i>
                  </Button>
                </td>
              </tr>
            ))}
            {filteredPrestadores.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted py-4">Nenhum fornecedor encontrado.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Modal Cadastro/Edição */}
      <ModalPrestador 
        show={showPrestadorModal} 
        onHide={() => setShowPrestadorModal(false)} 
        prestadorData={prestadorData} 
        setPrestadorData={setPrestadorData} 
        onSave={handleSavePrestador} 
      />

      {/* Modal Importar */}
      <ModalImportarPrestador 
        show={showImportarModal} 
        onHide={() => setShowImportarModal(false)} 
        onSave={() => {
          setShowImportarModal(false);
          fetchData();
        }} 
      />

      {/* Painel de Filtros Lateral (Offcanvas) */}
      <Offcanvas show={showFilterSidebar} onHide={() => setShowFilterSidebar(false)} placement="end">
        <Offcanvas.Header closeButton className="bg-light">
          <Offcanvas.Title className="text-primary fw-bold">
            <i className="bi bi-funnel me-2"></i>Filtros Avançados
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label className="fw-semibold">Especialidade</Form.Label>
              <Form.Select value={filterEspecialidade} onChange={e => setFilterEspecialidade(e.target.value)}>
                <option value="">Todas Especialidades</option>
                {especialidadesUnicas.map(esp => <option key={esp} value={esp}>{esp}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-semibold">Localidade</Form.Label>
              <Form.Select value={filterLocalidade} onChange={e => setFilterLocalidade(e.target.value)}>
                <option value="">Todas Localidades</option>
                {localidadesUnicas.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-semibold">Avaliação Mínima</Form.Label>
              <Form.Select value={filterClassificacao} onChange={e => setFilterClassificacao(e.target.value)}>
                <option value="">Qualquer Avaliação</option>
                <option value="5">5 Estrelas</option>
                <option value="4">4 Estrelas</option>
                <option value="3">3 Estrelas</option>
                <option value="2">2 Estrelas</option>
                <option value="1">1 Estrela</option>
                <option value="0">Sem avaliação</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-semibold">Situação</Form.Label>
              <Form.Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Todos os Status</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </Form.Select>
            </Form.Group>

            <hr />

            <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                className="w-100" 
                onClick={() => {
                  setFilterEspecialidade("");
                  setFilterLocalidade("");
                  setFilterClassificacao("");
                  setFilterStatus("");
                  setSearchTerm("");
                }}
              >
                Limpar
              </Button>
              <Button variant="primary" className="w-100" onClick={() => setShowFilterSidebar(false)}>
                Aplicar
              </Button>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
