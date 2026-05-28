import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Spinner,
  Alert,
  Button,
  Table,
  Breadcrumb,
  Row,
  Col,
  Card,
  Form,
  Modal,
  InputGroup,
} from "react-bootstrap";
import { FaUser } from "react-icons/fa";

const onlyDigits = (v = "") => String(v || "").replace(/\D/g, "");

// Configura o Axios para apontar para o backend de forma global e dinâmica
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatDateBR = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("pt-BR");
};

const PERFIS = ["Cliente Final", "Distribuidor", "Integrador", "Revenda", "Fabricante"];
const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const emptyCliente = {
  nome_cliente: "",
  razao_social: "",
  nome_fantasia: "",
  cnpj_cpf: "",
  cnpj_matriz: "",
  inscricao_estadual: "",
  site: "",
  observacoes: "",
  segmento: "",
  perfil: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};

function ClienteFormModal({ show, onHide, initialValue, onSaved }) {
  const isEdit = Boolean(initialValue?.id);

  const [saving, setSaving] = useState(false);
  const [busyLookup, setBusyLookup] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(emptyCliente);

  useEffect(() => {
    setErr("");
    setData({ ...emptyCliente, ...(initialValue || {}) });
  }, [initialValue, show]);

  const setField = (k, v) => setData((prev) => ({ ...prev, [k]: v }));

  const importarCNPJ = async () => {
    setErr("");
    const cnpj = onlyDigits(data.cnpj_cpf);
    if (cnpj.length !== 14) {
      setErr("CNPJ inválido (precisa ter 14 dígitos).");
      return;
    }

    setBusyLookup(true);
    try {
      const r = await axios.get(`/api/utils/cnpj/${cnpj}`);
      const d = r.data || {};

      setData((prev) => ({
        ...prev,
        cnpj_cpf: d.cnpj || prev.cnpj_cpf,
        razao_social: d.razao_social || prev.razao_social || "",
        nome_fantasia: d.nome_fantasia || prev.nome_fantasia || "",
        cep: d.cep || prev.cep || "",
        logradouro: d.logradouro || prev.logradouro || "",
        numero: d.numero || prev.numero || "",
        complemento: d.complemento || prev.complemento || "",
        bairro: d.bairro || prev.bairro || "",
        cidade: d.cidade || prev.cidade || "",
        uf: (d.uf || prev.uf || "").toUpperCase(),
      }));
    } catch (e) {
      console.error(e);
      setErr("Falha ao importar CNPJ.");
    } finally {
      setBusyLookup(false);
    }
  };

  const buscarCEP = async () => {
    setErr("");
    const cep = onlyDigits(data.cep);
    if (cep.length !== 8) {
      setErr("CEP inválido (precisa ter 8 dígitos).");
      return;
    }

    setBusyLookup(true);
    try {
      const r = await axios.get(`/api/utils/cep/${cep}`);
      const d = r.data || {};

      setData((prev) => ({
        ...prev,
        cep: d.cep || prev.cep,
        logradouro: d.logradouro || prev.logradouro || "",
        complemento: d.complemento || prev.complemento || "",
        bairro: d.bairro || prev.bairro || "",
        cidade: d.cidade || prev.cidade || "",
        uf: (d.uf || prev.uf || "").toUpperCase(),
      }));
    } catch (e) {
      console.error(e);
      setErr("Falha ao buscar CEP.");
    } finally {
      setBusyLookup(false);
    }
  };

  const handleSave = async () => {
    setErr("");
    setSaving(true);

    try {
      const payload = {
        ...data,
        nome_cliente: (data.nome_cliente || "").trim(),
        cnpj_cpf: onlyDigits(data.cnpj_cpf),
        cnpj_matriz: onlyDigits(data.cnpj_matriz),
        cep: onlyDigits(data.cep),
        uf: String(data.uf || "").toUpperCase().slice(0, 2),
      };

      if (!payload.nome_cliente) {
        setErr("O campo 'Nome do Cliente' é obrigatório.");
        return;
      }

      if (isEdit) {
        await axios.put(`/api/clientes/${initialValue.id}`, payload);
      } else {
        await axios.post(`/api/clientes`, payload);
      }

      onSaved?.();
      onHide?.();
    } catch (e) {
      console.error(e);
      setErr("Falha ao salvar cliente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar Cliente" : "Novo Cliente"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}

        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nome do Cliente (lista)</Form.Label>
              <Form.Control
                value={data.nome_cliente || ""}
                onChange={(e) => setField("nome_cliente", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>CNPJ</Form.Label>
              <InputGroup>
                <Form.Control
                  value={data.cnpj_cpf || ""}
                  onChange={(e) => setField("cnpj_cpf", e.target.value)}
                  placeholder="Somente números ou com máscara"
                />
                <Button
                  variant="outline-primary"
                  onClick={importarCNPJ}
                  disabled={busyLookup}
                  title="Importa razão social, fantasia e endereço"
                >
                  {busyLookup ? "..." : "Importar"}
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Razão Social</Form.Label>
              <Form.Control
                value={data.razao_social || ""}
                onChange={(e) => setField("razao_social", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Nome Fantasia</Form.Label>
              <Form.Control
                value={data.nome_fantasia || ""}
                onChange={(e) => setField("nome_fantasia", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Segmento</Form.Label>
              <Form.Control
                value={data.segmento || ""}
                onChange={(e) => setField("segmento", e.target.value)}
                placeholder="Ex: Telecom, Energia, Varejo..."
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Perfil</Form.Label>
              <Form.Select
                value={data.perfil || ""}
                onChange={(e) => setField("perfil", e.target.value)}
              >
                <option value="">Selecione</option>
                {PERFIS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>CEP</Form.Label>
              <InputGroup>
                <Form.Control
                  value={data.cep || ""}
                  onChange={(e) => setField("cep", e.target.value)}
                />
                <Button variant="outline-primary" onClick={buscarCEP} disabled={busyLookup}>
                  {busyLookup ? "..." : "Buscar"}
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Logradouro</Form.Label>
              <Form.Control
                value={data.logradouro || ""}
                onChange={(e) => setField("logradouro", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label>Nº</Form.Label>
              <Form.Control
                value={data.numero || ""}
                onChange={(e) => setField("numero", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Complemento</Form.Label>
              <Form.Control
                value={data.complemento || ""}
                onChange={(e) => setField("complemento", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={5}>
            <Form.Group>
              <Form.Label>Bairro</Form.Label>
              <Form.Control
                value={data.bairro || ""}
                onChange={(e) => setField("bairro", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={5}>
            <Form.Group>
              <Form.Label>Cidade</Form.Label>
              <Form.Control
                value={data.cidade || ""}
                onChange={(e) => setField("cidade", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label>UF</Form.Label>
              <Form.Select
                value={String(data.uf || "").toUpperCase()}
                onChange={(e) => setField("uf", e.target.value)}
              >
                <option value="">Selecione</option>
                {UFS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Site</Form.Label>
              <Form.Control
                value={data.site || ""}
                onChange={(e) => setField("site", e.target.value)}
                placeholder="https://"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Inscrição Estadual</Form.Label>
              <Form.Control
                value={data.inscricao_estadual || ""}
                onChange={(e) => setField("inscricao_estadual", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group>
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={data.observacoes || ""}
                onChange={(e) => setField("observacoes", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function Clientes() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [uf, setUf] = useState("");
  const [perfil, setPerfil] = useState("");
  const [segmento, setSegmento] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // IMPORT
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const fetchClientes = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await axios.get("/api/clientes", {
        params: {
          ativo: 1,
          uf: uf || undefined,
          perfil: perfil || undefined,
          segmento: segmento || undefined,
          search: search || undefined,
        },
      });
      setClientes(res.data || []);
    } catch (e) {
      console.error(e);
      setErr("Erro ao buscar clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchClientes(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, uf, perfil, segmento]);

  const filteredLocal = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return clientes;
    return clientes.filter((c) => {
      const a = (c.nome_cliente || "").toLowerCase();
      const b = (c.cnpj_cpf || "").toLowerCase();
      return a.includes(t) || b.includes(t);
    });
  }, [clientes, search]);

  const openNew = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setShowModal(true);
  };

  const handleInativar = async (id) => {
    if (!window.confirm("Inativar este cliente?")) return;

    setErr("");
    setSuccess("");
    try {
      await axios.delete(`/api/clientes/${id}`);
      setSuccess("Cliente inativado.");
      fetchClientes();
      setTimeout(() => setSuccess(""), 2500);
    } catch (e) {
      console.error(e);
      setErr("Falha ao inativar cliente.");
    }
  };

  const onSaved = () => {
    setSuccess("Cliente salvo.");
    fetchClientes();
    setTimeout(() => setSuccess(""), 2500);
  };

  const handleImport = async () => {
    setErr("");
    setSuccess("");
    setImportResult(null);

    if (!importFile) {
      setErr("Selecione um arquivo .xlsx ou .csv.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("file", importFile);

      const r = await axios.post("/api/clientes/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImportResult(r.data);
      setSuccess("Importação concluída.");
      fetchClientes();
    } catch (e) {
      console.error(e);
      setErr("Falha na importação.");
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (

        <Container fluid className="px-4">
            <Row>
              <Col> 
                    <Card className="shadow-sm border-0">
                        <Card.Header>
                            <Card.Title as="h4"> <FaUser /> Gestão de Clientes</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {/* Header Padrão do Sistema */}
                            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                <div>
                                    <h4 className="fw-bold mb-1 text-dark">
                                       Gerencie os clientes, visualize detalhes e acompanhe os projetos relacionados.</h4>
                                  
                                </div>
                            </div>
          <Row className="align-items-center mb-3">
 
            <Col className="text-end">
              <Button variant="primary" onClick={openNew} className="me-2">
                Novo Cliente
              </Button>
              <Button variant="outline-primary" onClick={() => setShowImport(true)}>
                Importar Planilha
              </Button>
            </Col>
          </Row>

          {err && (
            <Alert variant="danger" onClose={() => setErr("")} dismissible>
              {err}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onClose={() => setSuccess("")} dismissible>
              {success}
            </Alert>
          )}

          {/* Filtros */}
          <Row className="g-2 mb-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>Buscar</InputGroup.Text>
                <Form.Control
                  placeholder="Nome ou CNPJ"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col md={2}>
              <Form.Select value={uf} onChange={(e) => setUf(e.target.value)}>
                <option value="">UF</option>
                {UFS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
                <option value="">Perfil</option>
                {PERFIS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Control
                placeholder="Segmento (ex: Telecom)"
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
              />
            </Col>

            <Col md={12} className="text-end">
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                onClick={() => {
                  setSearch("");
                  setUf("");
                  setPerfil("");
                  setSegmento("");
                }}
              >
                Limpar filtros
              </Button>
              <Button variant="outline-primary" size="sm" onClick={fetchClientes}>
                Atualizar
              </Button>
            </Col>
          </Row>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>CNPJ</th>
                <th>UF</th>
                <th>Perfil</th>
                <th>Segmento</th>
                <th>Criado em</th>
                <th>Projetos</th>
                <th style={{ width: 240 }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredLocal.length > 0 ? (
                filteredLocal.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/crm/clientes/${c.id}`} style={{ textDecoration: "none" }}>
                        {c.nome_cliente}
                      </Link>
                    </td>
                    <td>{c.cnpj_cpf || "-"}</td>
                    <td>{c.uf || "-"}</td>
                    <td>{c.perfil || "-"}</td>
                    <td>{c.segmento || "-"}</td>
                    <td>{formatDateBR(c.created_at)}</td>
                    <td>{c.projetos_count ?? 0}</td>
                    <td>
                      <Button
                        as={Link}
                        to={`/crm/clientes/${c.id}`}
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                      >
                        Abrir
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="me-2"
                        onClick={() => openEdit(c)}
                      >
                        Editar
                      </Button>

                      <Button size="sm" variant="outline-danger" onClick={() => handleInativar(c.id)}>
                        Inativar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          <ClienteFormModal
            show={showModal}
            onHide={() => setShowModal(false)}
            initialValue={editing}
            onSaved={onSaved}
          />

          {/* MODAL IMPORT */}
          <Modal show={showImport} onHide={() => setShowImport(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Importar Clientes</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Arquivo (.xlsx ou .csv)</Form.Label>
                <Form.Control
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
                <Form.Text>
                  Colunas aceitas (nome livre): nome_cliente, cnpj_cpf, razao_social, nome_fantasia,
                  segmento, perfil, cep, logradouro, numero, complemento, bairro, cidade, uf, site,
                  inscricao_estadual, observacoes.
                </Form.Text>
              </Form.Group>

              {importResult && (
                <Alert variant="secondary">
                  <div>
                    <strong>Inseridos:</strong> {importResult.inserted}
                  </div>
                  <div>
                    <strong>Atualizados:</strong> {importResult.updated}
                  </div>
                  <div>
                    <strong>Ignorados:</strong> {importResult.skipped}
                  </div>

                  {importResult.errors?.length ? (
                    <div style={{ marginTop: 8 }}>
                      <strong>Erros:</strong>
                      <ul style={{ marginBottom: 0 }}>
                        {importResult.errors.slice(0, 15).map((er, idx) => (
                          <li key={idx}>
                            Linha {er.line}: {er.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowImport(false)}>
                Fechar
              </Button>
              <Button variant="primary" onClick={handleImport}>
                Importar
              </Button>
            </Modal.Footer>
          </Modal>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>

  );
}
