import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Button, Table, Badge, Alert, Spinner, Tabs, Tab, Form, ProgressBar } from "react-bootstrap";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import ModalProjeto from "../components/ModalProjeto";
import ModalEtapa from "../components/ModalEtapa";
import ModalOrcamento from "../components/ModalOrcamento";
import ModalMaterial from "../components/ModalMaterial";
import ModalChecklist from "../components/ModalChecklist";
import ModalComentario from "../components/ModalComentario";
import ModalEtapaDetalhes from "../components/ModalEtapaDetalhes";
import ModalOrcamentoDetalhes from "../components/ModalOrcamentoDetalhes";
import ModalMaterialDetalhes from "../components/ModalMaterialDetalhes";
import ChecklistManager from "../components/ChecklistManager";
import ObrasGanttChart from "../components/ObrasGanttChart";
import { FaHistory, FaHammer, FaFilter, FaPlus, FaSearch, FaTimes, FaHardHat } from "react-icons/fa"; // Ícone para o histórico
import { useAuth } from "../../../contexts/AuthContext"; // Para permissões de usuário
import apiClient from "../../../services/api";
import { Offcanvas } from "react-bootstrap";


const emptyProject = {
  nome_projeto: "",
  descricao: "",
  filial_id: "",
  responsavel_id: "",
  data_inicio: "",
  data_prevista_conclusao: "",
  orcamento_total: 0,
  prioridade: "Normal",
  observacoes: "",
  equipe_ids: [] // Adiciona o campo para a equipe no objeto do projeto
};

export default function GestaoObras({ onlyMyProjects = false }) {
  const { user } = useAuth(); // Hook para obter o usuário logado

  const [loading, setLoading] = useState(true);
  const [projetos, setProjetos] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [evolucao, setEvolucao] = useState([]);
  const [historico, setHistorico] = useState([]); // 5. Estado para o histórico do projeto
  const [funcionarios, setFuncionarios] = useState([]); // 1. Estado para a lista de funcionários
  const [unidades, setUnidades] = useState([]);

  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPrioridade, setFilterPrioridade] = useState("");
  const [filterFilial, setFilterFilial] = useState("");
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  const [showProject, setShowProject] = useState(false);
  const [projectData, setProjectData] = useState(emptyProject);

  const [showEtapa, setShowEtapa] = useState(false);
  const [showOrcamento, setShowOrcamento] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showComentario, setShowComentario] = useState(false);

  // Modais de edição
  const [showEtapaDetalhes, setShowEtapaDetalhes] = useState(false);
  const [etapaSelecionada, setEtapaSelecionada] = useState(null);

  const [showOrcamentoDetalhes, setShowOrcamentoDetalhes] = useState(false);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);

  const [showMaterialDetalhes, setShowMaterialDetalhes] = useState(false);
  const [materialSelecionado, setMaterialSelecionado] = useState(null);

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const statusColors = {
    "Planejamento": "info",
    "Em Execução": "warning",
    "Parado": "danger",
    "Concluído": "success"
  };

  const prioridadeColors = {
    "Baixa": "secondary",
    "Normal": "info",
    "Alta": "warning",
    "Crítica": "danger"
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Busca funcionários junto com os outros dados iniciais
      const [resProj, resUnidades, resFunc] = await Promise.all([
        apiClient.get("/api/obras/projetos").catch(() => ({ data: [] })),
        apiClient.get("/api/unidades").catch(() => ({ data: [] })),
        apiClient.get("/api/funcionarios").catch(() => ({ data: [] }))
      ]);
      setProjetos(resProj.data || []);
      setUnidades(resUnidades.data || []);
      setFuncionarios(resFunc.data || []);
      if (resProj.data && resProj.data.length > 0) {
        await fetchProjectDetails(resProj.data[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErr("Erro ao carregar dados de obras");
    }
    setLoading(false);
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      // 5. Busca o histórico junto com os outros detalhes
      const [resEtapas, resOrcamentos, resMateriais, resChecklists, resComentarios, resEvolucao, resHistorico] = await Promise.all([
        apiClient.get(`/api/obras/etapas/${projectId}`).catch(() => ({ data: [] })),
        apiClient.get(`/api/obras/orcamentos/${projectId}`).catch(() => ({ data: [] })),
        apiClient.get(`/api/obras/materiais/${projectId}`).catch(() => ({ data: [] })),
        apiClient.get(`/api/obras/checklists/${projectId}`).catch(() => ({ data: [] })),
        apiClient.get(`/api/obras/comentarios/${projectId}`).catch(() => ({ data: [] })),
        apiClient.get(`/api/obras/evolucao/${projectId}`).catch(() => ({ data: [] })),
        apiClient.get(`/api/obras/projetos/${projectId}/historico`).catch(() => ({ data: [] }))
      ]);
      setEtapas(resEtapas.data || []);
      setOrcamentos(resOrcamentos.data || []);
      setMateriais(resMateriais.data || []);
      setChecklists(resChecklists.data || []);
      setComentarios(resComentarios.data || []);
      setEvolucao(resEvolucao.data || []);
      setHistorico(resHistorico.data || []);
    } catch (error) {
      console.error("Erro ao carregar detalhes do projeto:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectProject = (projeto) => {
    setProjetoSelecionado(projeto);
    fetchProjectDetails(projeto.id);
  };

  const handleSaveProject = async () => {
    try {
      if (projectData.id) {
        await apiClient.put(`/api/obras/projetos/${projectData.id}`, projectData);
        setSuccess("Projeto atualizado com sucesso!");
      } else {
        const res = await apiClient.post("/api/obras/projetos", projectData);
        projectData.id = res.data.id;
        setSuccess("Projeto criado com sucesso!");
      }
      await fetchData();
      setShowProject(false);
      setProjectData(emptyProject);
    } catch (error) {
      setErr("Erro ao salvar projeto: " + error.message);
    }
  };

  const hasPrivilege = (user, requiredPrivileges) => {
    if (!user || !user.privilegios) return false;
    const userPrivileges = user.privilegios.toLowerCase().split(",");
    return requiredPrivileges.some((p) => userPrivileges.includes(p.toLowerCase()));
  };

  const canEditStage = (etapa) => {
    if (!user) return false;

    // Admins, supervisores e gestores sempre podem editar etapas
    if (hasPrivilege(user, ["Admin", "Supervisor", "Gestor"])) return true;

    // Dono/responsável pelo projeto sempre pode editar
    if (projetoSelecionado && String(projetoSelecionado.responsavel_id) === String(user.id)) return true;

    // Responsáveis específicos da etapa podem editar
    if (etapa && etapa.responsavel_ids) {
      let ids = [];
      try {
        ids = Array.isArray(etapa.responsavel_ids)
          ? etapa.responsavel_ids
          : JSON.parse(etapa.responsavel_ids);
      } catch (e) {
        ids = [];
      }
      return Array.isArray(ids) && ids.map(String).includes(String(user.id));
    }

    return false;
  };

  // 2. Lógica de permissão para visualização de projetos
  // A lógica de permissão foi removida do frontend, pois o backend já filtra os projetos
  // que o usuário pode ver, simplificando o código e centralizando a segurança.

  const filteredProjetos = projetos.filter(p => {
    const matchesSearch = p.nome_projeto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || p.status === filterStatus;
    const matchesPrioridade = !filterPrioridade || p.prioridade === filterPrioridade;
    const matchesFilial = !filterFilial || String(p.filial_id) === String(filterFilial);

    if (onlyMyProjects && user) {
      const isOwner = String(p.responsavel_id) === String(user.id);
      const isTeamMember = Array.isArray(p.equipe_ids) && p.equipe_ids.map(String).includes(String(user.id));
      if (!isOwner && !isTeamMember) return false;
    }

    return matchesSearch && matchesStatus && matchesPrioridade && matchesFilial;
  });

  const activeFiltersCount = [filterStatus, filterPrioridade, filterFilial].filter(Boolean).length;

  const clearFilters = () => {
    setFilterStatus("");
    setFilterPrioridade("");
    setFilterFilial("");
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="dash-grid">
        <div className='container-main'>
          <Container className="mt-5 text-center"><Spinner animation="border" /></Container>
        </div>
      </div>
    );
  }

  return (
    <div className='container-main p-4'>
      {err && <Alert variant="danger" onClose={() => setErr("")} dismissible>{err}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}




      {/* Cabeçalho Superior com Layout Padronizado */}
      <div className="page-header-colored mb-4" >
        <div className="page-header-title-wrapper d-flex justify-content-between align-items-center">
          <div>
            <h2 className="page-header-title d-flex align-items-center gap-3 m-0">
              <FaHardHat /> {onlyMyProjects ? "Minhas Obras e Projetos" : "Gestão de Obras e Projetos"}
            </h2>
            <p className="page-header-subtitle m-0 mt-1 opacity-75">
              {onlyMyProjects ? "Acompanhe as obras e projetos em que você está alocado." : "Gerencie etapas, orçamentos, insumos e checklists de obras corporativas."}
            </p>
          </div>
          <div className="header-search-container">
            <FaSearch className="search-icon" />
            <Form.Control
              type="text"
              className="search-input"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              onClick={() => setShowFilterSidebar(true)}
              className="fw-semibold d-flex align-items-center gap-2 shadow-sm"
            >
              <FaFilter /> Filtrar {activeFiltersCount > 0 && <Badge bg="primary">{activeFiltersCount}</Badge>}
            </Button>
            <Button
              variant="btn btn-primary"
              onClick={() => { setProjectData(emptyProject); setShowProject(true); }}
              className="fw-semibold d-flex align-items-center gap-2 shadow-sm"
            >
              <FaPlus /> Novo Projeto
            </Button>
          </div>
        </div>
      </div>

      {/* Badges de filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="d-flex flex-wrap gap-2 align-items-center mb-4 p-2 bg-light rounded border">
          <span className="text-muted small fw-semibold me-2">Filtros ativos:</span>
          {filterStatus && (
            <Badge bg="info" className="d-flex align-items-center gap-2 p-2">
              Status: {filterStatus}
              <FaTimes style={{ cursor: "pointer" }} onClick={() => setFilterStatus("")} />
            </Badge>
          )}
          {filterPrioridade && (
            <Badge bg="info" className="d-flex align-items-center gap-2 p-2">
              Prioridade: {filterPrioridade}
              <FaTimes style={{ cursor: "pointer" }} onClick={() => setFilterPrioridade("")} />
            </Badge>
          )}
          {filterFilial && (
            <Badge bg="info" className="d-flex align-items-center gap-2 p-2">
              Filial: {unidades.find(u => String(u.id) === String(filterFilial))?.nome_unidade || filterFilial}
              <FaTimes style={{ cursor: "pointer" }} onClick={() => setFilterFilial("")} />
            </Badge>
          )}
          <Button variant="link" size="sm" className="p-0 text-decoration-none ms-auto text-danger fw-semibold" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        </div>
      )}

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row>
            <Col lg={4}>
              <Card className="shadow-sm">
                <Card.Header className="bg-dark text-white">
                  <h5>Projetos ({filteredProjetos.length})</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {filteredProjetos.length === 0 ? (
                    <p className="p-3 text-muted">Nenhum projeto encontrado</p>
                  ) : (
                    <div className="projeto-list">
                      {filteredProjetos.map((p) => (
                        <div
                          key={p.id}
                          className={`projeto-item p-3 border-bottom cursor-pointer ${projetoSelecionado?.id === p.id ? "bg-light" : ""
                            }`}
                          onClick={() => handleSelectProject(p)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="mb-1" style={{ textTransform: 'uppercase' }}>{p.nome_projeto}</h6>
                              <small className="text-muted d-block">{p.filial_nome}</small>
                            </div>
                            <Badge bg={statusColors[p.status]}>{p.status}</Badge>
                          </div>
                          <div className="mt-2">
                            <ProgressBar now={p.percentual_conclusao_calculado} label={`${p.percentual_conclusao_calculado}%`} className="progress-sm" />
                          </div>
                          <div className="mt-2 small">
                            <div>Orçamento: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.orcamento_total || 0)}</strong></div>
                            <div>Gasto: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.custo_atual || 0)}</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={8}>
              {projetoSelecionado ? (
                <Tabs defaultActiveKey="visao" className="mb-3">
                  <Tab eventKey="visao" title="Visão Geral">
                    <Card className="shadow-sm">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 style={{ textTransform: 'uppercase' }}>{projetoSelecionado.nome_projeto}</h5>
                        <div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setProjectData(projetoSelecionado);
                              setShowProject(true);
                            }}
                            className="me-2"
                          >
                            <i className="bi bi-pencil"></i> Editar
                          </Button>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <p><strong>Status:</strong> <Badge bg={statusColors[projetoSelecionado.status]}>{projetoSelecionado.status}</Badge></p>
                            <p><strong>Prioridade:</strong> <Badge bg={prioridadeColors[projetoSelecionado.prioridade]}>{projetoSelecionado.prioridade}</Badge></p>
                            <p><strong>Filial:</strong> {projetoSelecionado.filial_nome}</p>
                            <p><strong>Data Início:</strong> {projetoSelecionado.data_inicio ? format(new Date(projetoSelecionado.data_inicio), 'dd/MM/yyyy') : '-'}</p>
                          </Col>
                          <Col md={6}>
                            <p><strong>Conclusão Prevista:</strong> {projetoSelecionado.data_prevista_conclusao ? format(new Date(projetoSelecionado.data_prevista_conclusao), 'dd/MM/yyyy') : '-'}</p>
                            <p><strong>Andamento:</strong></p>
                            <ProgressBar now={projetoSelecionado.percentual_conclusao_calculado} label={`${projetoSelecionado.percentual_conclusao_calculado}%`} />
                            <p className="mt-2"><strong>Orçamento Total:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projetoSelecionado.orcamento_total || 0)}</p>
                            <p><strong>Custo Atual:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projetoSelecionado.custo_atual || 0)}</p>
                          </Col>
                        </Row>
                        {projetoSelecionado.descricao && (
                          <>
                            <hr />
                            <p><strong>Descrição:</strong></p>
                            <p>{projetoSelecionado.descricao}</p>
                          </>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>

                  <Tab eventKey="gantt" title="Gantt">
                    <ObrasGanttChart
                      project={projetoSelecionado}
                      stages={etapas}
                      employees={funcionarios}
                    />
                  </Tab>

                  <Tab eventKey="equipe" title={`Equipe (${projetoSelecionado?.equipe_ids?.length || 0})`}>
                    <Card className="shadow-sm">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Colaboradores do Projeto</h5>
                        {(hasPrivilege(user, ["Admin", "Supervisor", "Gestor"]) || (projetoSelecionado && String(projetoSelecionado.responsavel_id) === String(user.id))) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setProjectData(projetoSelecionado);
                              setShowProject(true);
                            }}
                          >
                            <i className="bi bi-pencil"></i> Editar Integrantes
                          </Button>
                        )}
                      </Card.Header>
                      <Card.Body>
                        {(!projetoSelecionado?.equipe_ids || projetoSelecionado.equipe_ids.length === 0) ? (
                          <p className="text-muted">Nenhum colaborador vinculado a este projeto.</p>
                        ) : (
                          <Table hover responsive size="sm">
                            <thead className="table-light">
                              <tr>
                                <th>Nome</th>
                                <th>Cargo</th>
                                <th>Setor</th>
                              </tr>
                            </thead>
                            <tbody>
                              {funcionarios
                                .filter(f => projetoSelecionado.equipe_ids.includes(f.id))
                                .map((membro) => (
                                  <tr key={membro.id}>
                                    <td>{membro.nome_completo}</td>
                                    <td>{membro.nome_cargo || '-'}</td>
                                    <td>{membro.nome_setor || '-'}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </Table>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>

                  <Tab eventKey="etapas" title={`Etapas (${etapas.length})`}>
                    <Card className="shadow-sm">
                      <Card.Header>
                        {(hasPrivilege(user, ["Admin", "Supervisor", "Gestor"]) || (projetoSelecionado && String(projetoSelecionado.responsavel_id) === String(user.id))) && (
                          <Button variant="success" size="sm" onClick={() => setShowEtapa(true)}>
                            <i className="bi bi-plus"></i> Nova Etapa
                          </Button>
                        )}
                      </Card.Header>
                      <Card.Body>
                        {etapas.length === 0 ? (
                          <p className="text-muted">Nenhuma etapa criada</p>
                        ) : (
                          <Table hover responsive size="sm">
                            <thead className="table-light">
                              <tr>
                                <th>#</th>
                                <th>Nome</th>
                                <th>Status</th>
                                <th>Andamento</th>
                                <th>Período</th>
                                <th>Ação</th>
                              </tr>
                            </thead>
                            <tbody>
                              {etapas.map((e) => (
                                <tr key={e.id} style={{ cursor: "pointer" }}>
                                  <td>{e.numero_etapa}</td>
                                  <td>{e.nome_etapa}</td>
                                  <td><Badge bg={statusColors[e.status] || "secondary"}>{e.status}</Badge></td>
                                  <td>
                                    <ProgressBar now={e.percentual_calculado} style={{ height: '20px' }} label={`${e.percentual_calculado}%`} />
                                  </td>
                                  <td className="small">
                                    {e.data_inicio_planejada && format(new Date(e.data_inicio_planejada), 'dd/MM')} - {e.data_fim_planejada && format(new Date(e.data_fim_planejada), 'dd/MM')}
                                  </td>
                                  <td>
                                    {canEditStage(e) ? (
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => {
                                          setEtapaSelecionada(e);
                                          setShowEtapaDetalhes(true);
                                        }}
                                      >
                                        ✎ Editar
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() => {
                                          setEtapaSelecionada(e);
                                          setShowEtapaDetalhes(true);
                                        }}
                                        disabled
                                      >
                                        🔒 Sem Permissão
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>

                  <Tab eventKey="checklists" title={`Checklists (${checklists.length})`}>
                    <Card className="shadow-sm">
                      <Card.Header>
                        <Button variant="success" size="sm" onClick={() => setShowChecklist(true)}>
                          <i className="bi bi-plus"></i> Novo Checklist
                        </Button>
                      </Card.Header>
                      <Card.Body>
                        <ChecklistManager
                          projetoId={projetoSelecionado?.id}
                          etapaId={null}
                          checklists={checklists}
                          onUpdate={() => fetchProjectDetails(projetoSelecionado.id)}
                          funcionarios={funcionarios}
                          projeto={projetoSelecionado}
                          stages={etapas}
                        />
                      </Card.Body>
                    </Card>
                  </Tab>


                  <Tab eventKey="orcamentos" title={`Orçamentos (${orcamentos.length})`}>
                    <Card className="shadow-sm">
                      <Card.Header>
                        <Button variant="success" size="sm" onClick={() => setShowOrcamento(true)}>
                          <i className="bi bi-plus"></i> Novo Orçamento
                        </Button>
                      </Card.Header>
                      <Card.Body>
                        {orcamentos.length === 0 ? (
                          <p className="text-muted">Nenhum orçamento</p>
                        ) : (
                          <Table hover responsive size="sm">
                            <thead className="table-light">
                              <tr>
                                <th>Descrição</th>
                                <th>Prestador</th>
                                <th>Valor Est.</th>
                                <th>Valor Real</th>
                                <th>Status</th>
                                <th>Ação</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orcamentos.map((o) => (
                                <tr key={o.id}>
                                  <td>{o.descricao}</td>
                                  <td><small>{o.prestador_nome}</small></td>
                                  <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.valor_estimado || 0)}</td>
                                  <td>{o.valor_real ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.valor_real) : '-'}</td>
                                  <td><Badge bg={o.status === 'Aprovado' ? 'success' : 'warning'}>{o.status}</Badge></td>
                                  <td>
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={() => {
                                        setOrcamentoSelecionado(o);
                                        setShowOrcamentoDetalhes(true);
                                      }}
                                    >
                                      ✎ Editar
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>

                  <Tab eventKey="materiais" title={`Materiais (${materiais.length})`}>
                    <Card className="shadow-sm">
                      <Card.Header>
                        <Button variant="success" size="sm" onClick={() => setShowMaterial(true)}>
                          <i className="bi bi-plus"></i> Adicionar Material
                        </Button>
                      </Card.Header>
                      <Card.Body>
                        {materiais.length === 0 ? (
                          <p className="text-muted">Nenhum material adicionado</p>
                        ) : (
                          <Table hover responsive size="sm">
                            <thead className="table-light">
                              <tr>
                                <th>Material</th>
                                <th>Qty</th>
                                <th>V. Unit.</th>
                                <th>V. Total</th>
                                <th>Fornecedor</th>
                                <th>Status</th>
                                <th>Ação</th>
                              </tr>
                            </thead>
                            <tbody>
                              {materiais.map((m) => (
                                <tr key={m.id}>
                                  <td>{m.nome_material}</td>
                                  <td>{m.quantidade} {m.unidade}</td>
                                  <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.valor_unitario || 0)}</td>
                                  <td><strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.valor_total || 0)}</strong></td>
                                  <td><small>{m.fornecedor_nome}</small></td>
                                  <td><Badge bg={m.status === 'Entregue' ? 'success' : 'warning'}>{m.status}</Badge></td>
                                  <td>
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={() => {
                                        setMaterialSelecionado(m);
                                        setShowMaterialDetalhes(true);
                                      }}
                                    >
                                      ✎ Editar
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>



                  <Tab eventKey="historico" title={<span><FaHistory /> Histórico</span>}>
                    <Card className="shadow-sm">
                      <Card.Body>
                        {historico.length === 0 ? (
                          <p className="text-muted">Nenhum histórico de alterações encontrado.</p>
                        ) : (
                          <ul className="list-unstyled">
                            {historico.map((h) => (
                              <li key={h.id} className="mb-3 pb-3 border-bottom">
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <strong>{h.usuario_nome}</strong>
                                    <span className="text-muted"> {h.acao}</span>
                                  </div>
                                  <small className="text-muted">
                                    {format(new Date(h.data_modificacao), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                  </small>
                                </div>
                                <p className="mb-0 mt-1 fst-italic text-secondary">"{h.detalhes}"</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>

                  <Tab eventKey="comentarios" title={`Comentários (${comentarios.length})`}>
                    <Card className="shadow-sm">
                      <Card.Header>
                        <Button variant="success" size="sm" onClick={() => setShowComentario(true)}>
                          <i className="bi bi-chat-left-quote"></i> Adicionar Comentário
                        </Button>
                      </Card.Header>
                      <Card.Body>
                        {comentarios.length === 0 ? (
                          <p className="text-muted">Nenhum comentário</p>
                        ) : (
                          comentarios.map((c) => (
                            <div key={c.id} className="mb-3 p-3 border-left-4">
                              <div className="d-flex justify-content-between">
                                <strong>{c.usuario_nome}</strong>
                                <small className="text-muted">
                                  {format(new Date(c.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </small>
                              </div>
                              <p className="mb-1 mt-2">{c.conteudo}</p>
                              <Badge bg="info">{c.tipo}</Badge>
                            </div>
                          ))
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>
                </Tabs>
              ) : (
                <Card className="shadow-sm text-center">
                  <Card.Body className="py-5">
                    <p className="text-muted">Selecione um projeto para visualizar os detalhes</p>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>

          <ModalProjeto
            show={showProject}
            onHide={() => {
              setShowProject(false);
              setProjectData(emptyProject);
            }}
            data={projectData}
            setData={setProjectData}
            onSave={handleSaveProject}
            unidades={unidades}
            funcionarios={funcionarios} // 1. Passa a lista de funcionários para o modal do projeto
          />

          <ModalEtapa
            show={showEtapa}
            onHide={() => setShowEtapa(false)}
            projetoId={projetoSelecionado?.id}
            onSave={() => {
              setShowEtapa(false);
              fetchProjectDetails(projetoSelecionado.id);
            }}
            funcionarios={funcionarios}
          />

          <ModalOrcamento
            show={showOrcamento}
            onHide={() => setShowOrcamento(false)}
            projetoId={projetoSelecionado?.id}
            onSave={() => {
              setShowOrcamento(false);
              fetchProjectDetails(projetoSelecionado.id);
            }}
          />

          <ModalMaterial
            show={showMaterial}
            onHide={() => setShowMaterial(false)}
            projetoId={projetoSelecionado?.id}
            onSave={() => {
              setShowMaterial(false);
              fetchProjectDetails(projetoSelecionado.id);
            }}
          />

          <ModalChecklist
            show={showChecklist}
            onHide={() => setShowChecklist(false)}
            projetoId={projetoSelecionado?.id}
            onSave={() => {
              setShowChecklist(false);
              fetchProjectDetails(projetoSelecionado.id);
            }}
          />

          <ModalComentario
            show={showComentario}
            onHide={() => setShowComentario(false)}
            projetoId={projetoSelecionado?.id}
            onSave={() => {
              setShowComentario(false);
              fetchProjectDetails(projetoSelecionado.id);
            }}
          />

          {/* Modals de Edição/Detalhes */}
          <ModalEtapaDetalhes
            show={showEtapaDetalhes}
            onHide={() => setShowEtapaDetalhes(false)}
            etapa={etapaSelecionada}
            projetoId={projetoSelecionado?.id}
            onUpdate={() => fetchProjectDetails(projetoSelecionado.id)}
            funcionarios={funcionarios} // 4. Passa a lista de funcionários para o modal de detalhes da etapa
          />

          <ModalOrcamentoDetalhes
            show={showOrcamentoDetalhes}
            onHide={() => setShowOrcamentoDetalhes(false)}
            orcamento={orcamentoSelecionado}
            onUpdate={() => fetchProjectDetails(projetoSelecionado.id)}
          />

          <ModalMaterialDetalhes
            show={showMaterialDetalhes}
            onHide={() => setShowMaterialDetalhes(false)}
            material={materialSelecionado}
            onUpdate={() => fetchProjectDetails(projetoSelecionado.id)}
          />

          {/* Painel de Filtros Lateral (Offcanvas) */}
          <Offcanvas show={showFilterSidebar} onHide={() => setShowFilterSidebar(false)} placement="end">
            <Offcanvas.Header closeButton className="bg-light">
              <Offcanvas.Title className="text-primary fw-bold">
                Filtros de Projetos
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Status do Projeto</Form.Label>
                <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">Todos os status</option>
                  <option value="Planejamento">Planejamento</option>
                  <option value="Em Execução">Em Execução</option>
                  <option value="Parado">Parado</option>
                  <option value="Concluído">Concluído</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Prioridade</Form.Label>
                <Form.Select value={filterPrioridade} onChange={(e) => setFilterPrioridade(e.target.value)}>
                  <option value="">Todas as prioridades</option>
                  <option value="Baixa">Baixa</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Filial</Form.Label>
                <Form.Select value={filterFilial} onChange={(e) => setFilterFilial(e.target.value)}>
                  <option value="">Todas as filiais</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>{u.nome_unidade}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="d-grid mt-4">
                <Button variant="outline-danger" onClick={clearFilters}>
                  Limpar Todos os Filtros
                </Button>
              </div>
            </Offcanvas.Body>
          </Offcanvas>

        </Card.Body>
      </Card>
    </div>
  );
}
