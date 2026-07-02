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
  Tabs,
  Tab,
  Offcanvas
} from "react-bootstrap";
import { FaUser, FaFilter, FaRedo, FaTrash, FaEdit, FaSearch, FaSlidersH, FaFileDownload, FaPlus } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiClient from "../../../../services/api";
import ClienteFormModal from "./ClienteFormModal";
import "../../../../styles/App.css"; // Estilos globais do portal

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

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6'];

export default function Clientes() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [allClientes, setAllClientes] = useState([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalProjetosAndamento, setTotalProjetosAndamento] = useState(0);
  const [totalClientesMes, setTotalClientesMes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingDash, setLoadingDash] = useState(false);

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
  const [showFilters, setShowFilters] = useState(false);
  const [editing, setEditing] = useState(null);

  // IMPORT
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);

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

  const fetchAllClientes = async () => {
    setLoadingDash(true);
    try {
      const res = await apiClient.get("/api/clientes", {
        params: { ativo: 1, limit: 1000 }
      });
      setAllClientes(res.data?.data || []);
    } catch (e) {
      console.error("Erro ao buscar clientes totais:", e);
    } finally {
      setLoadingDash(false);
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchAllClientes();
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

  // Agregações em memória para os gráficos do Dashboard
  const ufData = useMemo(() => {
    const counts = {};
    allClientes.forEach(c => {
      const state = (c.uf || "N/A").toUpperCase().trim();
      counts[state] = (counts[state] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [allClientes]);

  const perfilData = useMemo(() => {
    const counts = {};
    allClientes.forEach(c => {
      const p = c.perfil || "N/A";
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allClientes]);

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
      fetchAllClientes();
      setTimeout(() => setSuccess(""), 2500);
    } catch (e) {
      console.error(e);
      setErr("Falha ao inativar cliente.");
    }
  };

  const onSaved = () => {
    setSuccess("Cliente salvo.");
    fetchClientes();
    fetchAllClientes();
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

    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("file", importFile);

      const r = await apiClient.post("/api/clientes/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImportResult(r.data);
      setSuccess("Importação concluída com sucesso.");
      fetchClientes();
      fetchAllClientes();
    } catch (e) {
      console.error("Erro completo da importação:", e);
      const errMsg = e.response?.data?.error || e.response?.data?.message || e.message || "Falha na importação.";
      setErr(`Falha na importação: ${errMsg}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = "\uFEFFnome_cliente,cnpj_cpf,razao_social,nome_fantasia,segmento,perfil,cep,logradouro,numero,complemento,bairro,cidade,uf,site,inscricao_estadual,observacoes,contato_nome,contato_telefone,contato_email,contato_cargo\nCliente Exemplo,00000000000000,Razao Exemplo LTDA,Exemplo,Tecnologia,Cliente Final,00000000,Rua Exemplo,123,Sala 1,Centro,Sao Paulo,SP,https://exemplo.com,ISENTO,Observacao de teste,Jose da Silva,11999998888,jose@exemplo.com,Diretor";
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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="container-main p-4">
      <div className="page-header-colored mb-4">
        <div className="page-header-title-wrapper">
          <h2 className="page-header-title d-flex align-items-center gap-3">
            <FaUser /> Gestão de Clientes
          </h2>
          <p className="page-header-subtitle">
            Gerencie a carteira de clientes, visualize métricas e importe dados estruturados.
          </p>
        </div>
      </div>

      {err && (
        <Alert variant="danger" onClose={() => setErr("")} dismissible className="shadow-sm">
          {err}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible className="shadow-sm">
          {success}
        </Alert>
      )}

      {/* Tabs Layout */}
      <Tabs defaultActiveKey="dashboard" className="mb-4" mountOnEnter>
        {/* Aba Dashboard */}
        <Tab eventKey="dashboard" title="Dashboard">
          {/* KPIs */}
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Card className="shadow-sm border-0 bg-primary text-white h-100 p-2">
                <Card.Body>
                  <span className="text-white-50 small fw-bold">CLIENTES ATIVOS</span>
                  <h2 className="fw-bold mb-0 mt-1">{totalClientes}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-0 bg-success text-white h-100 p-2">
                <Card.Body>
                  <span className="text-white-50 small fw-bold">ADICIONADOS NO MÊS</span>
                  <h2 className="fw-bold mb-0 mt-1">{totalClientesMes}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-0 bg-info text-white h-100 p-2">
                <Card.Body>
                  <span className="text-white-50 small fw-bold">PROJETOS EM ANDAMENTO</span>
                  <h2 className="fw-bold mb-0 mt-1">{totalProjetosAndamento}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {loadingDash ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Row className="g-4">
              {/* Gráfico UF */}
              <Col lg={7}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <h6 className="fw-bold text-dark mb-3">Distribuição de Clientes por Estado (UF)</h6>
                    {ufData.length > 0 ? (
                      <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ufData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                            <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                            <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                            <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Clientes" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center text-muted py-5">Nenhum dado geográfico disponível.</div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Gráfico Perfil */}
              <Col lg={5}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <h6 className="fw-bold text-dark mb-3">Distribuição por Perfil de Cliente</h6>
                    {perfilData.length > 0 ? (
                      <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={perfilData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              outerRadius={80}
                              dataKey="value"
                            >
                              {perfilData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center text-muted py-5">Nenhum dado de perfil disponível.</div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>

        {/* Aba Lista de Clientes */}
        <Tab eventKey="lista" title="Lista de Clientes">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              {/* Painel superior de ações */}
              <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
                <div className="d-flex gap-2 align-items-center flex-grow-1">
                  <div className="header-search-container m-0" style={{ maxWidth: "300px", flexGrow: 1 }}>
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Pesquisar cliente..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button variant="outline-secondary" onClick={() => setShowFilters(true)} className="d-flex align-items-center gap-1">
                    <FaFilter /> Filtros {(uf || cidade || perfil || segmento || search) && <span className="badge bg-primary">Ativos</span>}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => fetchClientes(1)} className="d-flex align-items-center gap-1">
                    <FaRedo /> Atualizar
                  </Button>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="outline-success" onClick={() => setShowImport(true)} className="d-flex align-items-center gap-1">
                    <FaFileDownload /> Importar Planilha
                  </Button>
                  <Button variant="primary" onClick={openNew} className="d-flex align-items-center gap-1">
                    <FaPlus /> Novo Cliente
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead className="bg-light text-muted text-uppercase fs-7">
                        <tr>
                          <th>Cliente</th>
                          <th>CNPJ/CPF</th>
                          <th>Localização</th>
                          <th>Perfil</th>
                          <th>Segmento</th>
                          <th>Criado em</th>
                          <th className="text-center">Projetos</th>
                          <th style={{ width: 220 }} className="text-end">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientes.length > 0 ? (
                          clientes.map((c) => (
                            <tr key={c.id}>
                              <td className="fw-semibold">
                                <Link to={`/crm/clientes/${c.id}`} className="text-decoration-none text-dark">
                                  {c.nome_cliente}
                                </Link>
                              </td>
                              <td className="text-secondary">{c.cnpj_cpf || "-"}</td>
                              <td>
                                {c.cidade ? `${c.cidade}/${c.uf || ""}` : c.uf || "-"}
                              </td>
                              <td>
                                <span className={`badge bg-light text-dark border`}>
                                  {c.perfil || "N/A"}
                                </span>
                              </td>
                              <td className="text-secondary">{c.segmento || "-"}</td>
                              <td className="text-secondary fs-7">{formatDateBR(c.created_at)}</td>
                              <td className="text-center fw-bold text-primary">{c.projetos_count ?? 0}</td>
                              <td className="text-end text-nowrap">
                                <div className="d-inline-flex gap-1">
                                  <Button
                                    as={Link}
                                    to={`/crm/clientes/${c.id}`}
                                    size="sm"
                                    variant="light"
                                    className="btn-action"
                                  >
                                    Detalhes
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    className="btn-action"
                                    onClick={() => openEdit(c)}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    className="btn-action"
                                    onClick={() => handleInativar(c.id)}
                                  >
                                    Inativar
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="text-center py-4 text-muted">
                              Nenhum cliente encontrado com os filtros selecionados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <Pagination className="justify-content-center mt-3">
                      <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                      <Pagination.Prev onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
                      {getPageNumbers()[0] > 1 && <Pagination.Ellipsis disabled />}
                      {getPageNumbers().map((p) => (
                        <Pagination.Item key={p} active={p === page} onClick={() => setPage(p)}>
                          {p}
                        </Pagination.Item>
                      ))}
                      {getPageNumbers()[getPageNumbers().length - 1] < totalPages && <Pagination.Ellipsis disabled />}
                      <Pagination.Next onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
                      <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
                    </Pagination>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Form Modal */}
      <ClienteFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        initialValue={editing}
        onSaved={onSaved}
      />

      {/* Offcanvas Filtros */}
      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold"><FaFilter size={16} /> Filtros de Clientes</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label className="fw-semibold small text-muted">Busca Rápida</Form.Label>
              <Form.Control
                placeholder="Nome, Fantasia ou CNPJ"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-semibold small text-muted">Estado (UF)</Form.Label>
              <Form.Select value={uf} onChange={(e) => setUf(e.target.value)}>
                <option value="">Todos</option>
                {UFS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-semibold small text-muted">Cidade</Form.Label>
              <Form.Control
                placeholder="Nome da cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-semibold small text-muted">Perfil</Form.Label>
              <Form.Select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
                <option value="">Todos</option>
                {PERFIS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-semibold small text-muted">Segmento</Form.Label>
              <Form.Control
                placeholder="Telecom, Varejo, etc."
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
              />
            </Form.Group>

            <div className="d-flex gap-2 mt-4 pt-3 border-top">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearch("");
                  setUf("");
                  setCidade("");
                  setPerfil("");
                  setSegmento("");
                }}
              >
                Limpar Todos
              </Button>
              <Button variant="primary" className="w-100" onClick={() => setShowFilters(false)}>
                Visualizar
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Modal Import */}
      <Modal show={showImport} onHide={() => setShowImport(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Importar Clientes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-end mb-3">
            <Button variant="outline-info" size="sm" onClick={downloadSampleCSV} className="d-inline-flex align-items-center gap-1">
              <FaFileDownload /> Baixar Planilha Modelo (CSV)
            </Button>
          </div>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Arquivo (.xlsx ou .csv)</Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            <Form.Text className="text-muted d-block mt-2 small">
              Colunas aceitas: <strong>nome_cliente, cnpj_cpf, razao_social, nome_fantasia,
              segmento, perfil, cep, logradouro, numero, complemento, bairro, cidade, uf, site,
              inscricao_estadual, observacoes</strong>.<br />
              Para importar contatos vinculados, utilize também: <strong>contato_nome, contato_telefone, contato_email, contato_cargo</strong>.
            </Form.Text>
          </Form.Group>

          {importResult && (
            <Alert variant="secondary" className="border-0">
              <div className="fw-bold mb-2">Relatório de Importação:</div>
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
                <div style={{ marginTop: 12 }}>
                  <strong>Erros encontrados:</strong>
                  <ul className="mt-1 ps-3 fs-7 text-danger">
                    {importResult.errors.slice(0, 10).map((er, idx) => (
                      <li key={idx}>
                        Linha {er.line}: {er.error}
                      </li>
                    ))}
                  </ul>
                  {importResult.errors.length > 10 && <span className="small text-muted">...e mais {importResult.errors.length - 10} erros.</span>}
                </div>
              ) : null}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImport(false)} disabled={importing}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleImport} disabled={importing}>
            {importing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processando...
              </>
            ) : (
              "Processar Arquivo"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
