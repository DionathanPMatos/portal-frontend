import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Pagination,
} from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import apiClient from "../../../../services/api";
import ClienteFormModal from "./ClienteFormModal";

const onlyDigits = (v = "") => String(v || "").replace(/\D/g, "");

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

// ClienteFormModal importado de "./ClienteFormModal"

export default function Clientes() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalProjetosAndamento, setTotalProjetosAndamento] = useState(0);
  const [totalClientesMes, setTotalClientesMes] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [perfil, setPerfil] = useState("");
  const [segmento, setSegmento] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // IMPORT
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const fetchClientes = async (currentPage = page) => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiClient.get("/api/clientes", {
        params: {
          ativo: 1,
          uf: uf || undefined,
          cidade: cidade || undefined,
          perfil: perfil || undefined,
          segmento: segmento || undefined,
          search: search || undefined,
          page: currentPage,
          limit,
        },
      });
      setClientes(res.data?.data || []);
      setTotalClientes(res.data?.total || 0);
      setTotalProjetosAndamento(res.data?.totalProjetosAndamento || 0);
      setTotalClientesMes(res.data?.totalClientesMes || 0);
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
    fetchClientes(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchClientes(1);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, uf, cidade, perfil, segmento]);

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
      await apiClient.delete(`/api/clientes/${id}`);
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

      const r = await apiClient.post("/api/clientes/import", fd, {
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

  const downloadSampleCSV = () => {
    const csvContent = "nome_cliente,cnpj_cpf,razao_social,nome_fantasia,segmento,perfil,cep,logradouro,numero,complemento,bairro,cidade,uf,site,inscricao_estadual,observacoes\nCliente Exemplo,00000000000000,Razao Exemplo LTDA,Exemplo,Tecnologia,Cliente Final,00000000,Rua Exemplo,123,Sala 1,Centro,Sao Paulo,SP,https://exemplo.com,ISENTO,Observacao de teste";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "modelo_importacao_clientes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(totalClientes / limit);

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

          {/* KPIs da Diretoria */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="shadow-sm border-0 bg-primary text-white h-100">
                <Card.Body>
                  <h6>Total de Clientes Ativos</h6>
                  <h3 className="mb-0">{totalClientes}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-0 bg-success text-white h-100">
                <Card.Body>
                  <h6>Clientes Adicionados no Mês</h6>
                  <h3 className="mb-0">{totalClientesMes}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-0 bg-info text-white h-100">
                <Card.Body>
                  <h6>Projetos em Andamento</h6>
                  <h3 className="mb-0">{totalProjetosAndamento}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

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

            <Col md={1}>
              <Form.Select value={uf} onChange={(e) => setUf(e.target.value)}>
                <option value="">UF</option>
                {UFS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Control
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
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
                  setCidade("");
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
                <th>Cidade</th>
                <th>Perfil</th>
                <th>Segmento</th>
                <th>Criado em</th>
                <th>Projetos</th>
                <th style={{ width: 240 }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {clientes.length > 0 ? (
                clientes.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/crm/clientes/${c.id}`} style={{ textDecoration: "none" }}>
                        {c.nome_cliente}
                      </Link>
                    </td>
                    <td>{c.cnpj_cpf || "-"}</td>
                    <td>{c.uf || "-"}</td>
                    <td>{c.cidade || "-"}</td>
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

          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-3">
              <Pagination.Prev onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
            </Pagination>
          )}

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
              <div className="text-end mb-3">
                <Button variant="outline-info" size="sm" onClick={downloadSampleCSV}>
                  Baixar Planilha Modelo (CSV)
                </Button>
              </div>
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
