import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Container,
  Button,
  Spinner,
  Alert,
  Form,
  Table,
  Row,
  Col,
  Tabs,
  Tab,
} from "react-bootstrap";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useSearchParams, Link } from "react-router-dom";
import {
  FaChartLine,
  FaTh,
  FaList,
  FaCalendarCheck,
  FaCalendarAlt,
  FaUsers,
  FaChartPie,
  FaRobot,
  FaSearch,
} from "react-icons/fa";
import ProjetoFormModal from "./CRM/ProjetoFormModal";
import SortableItem from "./CRM/SortableItem";
import "../styles/Crm.css";
import "../../../styles/Header.css";
import "../../../styles/App.css";
import apiClient from "../../../services/api";

// Lista de etapas para as colunas do Kanban
const ETAPAS_KANBAN = [
  "05% - Prospecção",
  "25% - Especificação de Projeto",
  "35% - POC",
  "55% - Envio de Proposta - Projeto",
  "75% - Aguardando Aprovação",
  "95% - Pedido Fechado",
];

// Lista completa para mapeamento de cores e classes
const ETAPAS_COMPLETAS = [
  "0% - Projeto Perdido",
  "05% - Prospecção",
  "25% - Especificação de Projeto",
  "35% - POC",
  "55% - Envio de Proposta - Projeto",
  "75% - Aguardando Aprovação",
  "95% - Pedido Fechado",
  "98% - Parcialmente Entregue",
  "100% - Faturado e Entregue",
  "Ganho",
];

const getClasseAmigavel = (etapa) => {
  if (!etapa) return "etapa-default";
  return (
    "etapa-" +
    etapa
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
};

const etapaClasseMap = ETAPAS_COMPLETAS.reduce((acc, etapa) => {
  acc[etapa] = getClasseAmigavel(etapa);
  return acc;
}, {});

const etapaColorMap = {
  "0% - Projeto Perdido": "#6c757d",
  "05% - Prospecção": "#0d6efd",
  "25% - Especificação de Projeto": "#dc3545",
  "35% - POC": "#6f42c1",
  "55% - Envio de Proposta - Projeto": "#fd7e14",
  "75% - Aguardando Aprovação": "#ffc107",
  "95% - Pedido Fechado": "#198754",
  "98% - Parcialmente Entregue": "#0dcaf0",
  "100% - Faturado e Entregue": "#198754",
  Ganho: "#198754",
};

const KanbanColumn = ({
  etapa,
  projetos,
  isOver,
  handleOpenModal,
  children,
}) => {
  const { setNodeRef } = useDroppable({ id: etapa });
  const idsDosProjetos = projetos.map((p) => p.id);

  return (
    <div className="kanban-column">
      <div className={`kanban-column-header ${etapaClasseMap[etapa] || ""}`}>
        <h5>{etapa}</h5>
        <div className="kanban-column-info">
          <span>{projetos.length} negócios</span>
          <strong>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(
              projetos.reduce(
                (sum, p) => sum + parseFloat(p.valor_estimado || 0),
                0,
              ),
            )}
          </strong>
        </div>
      </div>
      <button
        className="kanban-quick-add"
        onClick={() => handleOpenModal(etapa)}
      >
        + Registro Rápido
      </button>
      <div
        ref={setNodeRef}
        className={`kanban-cards-container ${isOver ? "drag-over" : ""}`}
      >
        <SortableContext
          id={etapa}
          items={idsDosProjetos}
          strategy={verticalListSortingStrategy}
        >
          {children.length > 0 ? (
            children
          ) : (
            <div className="kanban-empty-placeholder">Arraste um card aqui</div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

// 🚀 Placeholder Tab Padronizada
const PlaceholderTab = ({ title }) => (
  <div className="p-5 text-center">
    <Alert variant="info" className="d-inline-block text-start w-50">
      <Alert.Heading>Em Breve</Alert.Heading>
      <p className="mb-0">
        A funcionalidade de <strong>{title}</strong> está em desenvolvimento e
        será disponibilizada em breve.
      </p>
    </Alert>
  </div>
);

const DashboardProjetos = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "kanban";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [defaultStage, setDefaultStage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeColumn, setActiveColumn] = useState(null);
  const [vendedores, setVendedores] = useState([]);
  const [filtroVendedor, setFiltroVendedor] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState("");
  const sensors = useSensors(useSensor(PointerSensor));

  // Estados para o Upload
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileInputRef = useRef(null);

  const fetchProjetosEVendedores = useCallback(async () => {
    try {
      setLoading(true);
      const [projetosRes, vendedoresRes] = await Promise.all([
        apiClient.get("/api/projetos"),
        apiClient.get("/api/vendedores"),
      ]);

      setProjetos(projetosRes.data);
      setVendedores(vendedoresRes.data);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError("Falha ao buscar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjetosEVendedores();
  }, [fetchProjetosEVendedores]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const handleOpenModal = (etapa = "") => {
    setDefaultStage(typeof etapa === "string" ? etapa : "");
    setShowModal(true);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    const overId = over?.id;
    const overIsColumn = ETAPAS_KANBAN.includes(overId);
    const parentColumn = over?.data?.current?.parent;
    if (overIsColumn) {
      setActiveColumn(overId);
    } else if (parentColumn) {
      setActiveColumn(parentColumn);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImportSubmit(file);
    }
  };

  const handleImportSubmit = async (file) => {
    if (!file) return;

    setIsImporting(true);
    setImportError("");
    setImportSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post(
        "/api/crm/projetos/importar",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setImportSuccess(response.data.message);
      fetchProjetosEVendedores();
    } catch (err) {
      setImportError(err.response?.data?.error || "Erro ao importar arquivo.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragEnd = async (event) => {
    setActiveColumn(null);
    const { active, over } = event;
    if (!over) return;
    const activeContainer = active.data.current?.parent;
    const overContainer = over.data.current?.parent || over.id;
    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }
    setProjetos((prev) =>
      prev.map((p) =>
        p.id === active.id ? { ...p, etapa_funil: overContainer } : p,
      ),
    );
    try {
      await apiClient.patch(`/api/projetos/${active.id}/mover`, {
        novaEtapa: overContainer,
      });
    } catch (err) {
      console.error("Erro ao mover projeto:", err);
      setError("Não foi possível salvar a alteração. Sincronizando novamente.");
      fetchProjetosEVendedores();
    }
  };

  const filteredProjetos = useMemo(
    () =>
      projetos.filter((p) => {
        const searchMatch =
          (p.nome_projeto || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (p.nome_cliente || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const vendedorMatch =
          !filtroVendedor || p.vendedor_id === parseInt(filtroVendedor);

        const etapaMatch = !filtroEtapa || p.etapa_funil === filtroEtapa;

        return searchMatch && vendedorMatch && etapaMatch;
      }),
    [projetos, searchTerm, filtroVendedor, filtroEtapa],
  );

  const renderLista = () => {
    const projetosAgrupados = filteredProjetos.reduce((acc, projeto) => {
      const etapa = projeto.etapa_funil || "Sem Etapa";
      if (!acc[etapa]) {
        acc[etapa] = [];
      }
      acc[etapa].push(projeto);
      return acc;
    }, {});

    const etapasOrdenadas = Object.keys(projetosAgrupados).sort();

    return (
      <div className="list-view-container mt-3">
        <Table
          responsive
          hover
          className="project-list-table bg-white shadow-sm rounded"
        >
          <thead className="table-light">
            <tr>
              <th>Projeto</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th>Previsão Fechamento</th>
              <th>Próxima Atividade</th>
              <th>Registro</th>
              <th className="text-end">Valor</th>
            </tr>
          </thead>
          {etapasOrdenadas.length > 0 ? (
            etapasOrdenadas.map((etapa) => (
              <tbody key={etapa}>
                <tr className="list-group-row">
                  <th
                    colSpan="7"
                    style={{
                      backgroundColor: etapaColorMap[etapa] || "#6c757d",
                      color: "#fff",
                    }}
                  >
                    {etapa}
                  </th>
                </tr>
                {projetosAgrupados[etapa].map((projeto) => (
                  <tr key={projeto.id}>
                    <td>
                      <Link
                        to={`/crm/projetos/${projeto.id}`}
                        className="fw-semibold text-decoration-none"
                      >
                        {projeto.nome_projeto}
                      </Link>
                    </td>
                    <td>{projeto.nome_cliente}</td>
                    <td>{projeto.nome_vendedor}</td>
                    <td>
                      {projeto.data_fechamento_prevista
                        ? new Date(
                            projeto.data_fechamento_prevista,
                          ).toLocaleDateString()
                        : "--"}
                    </td>
                    <td>
                      <span className="text-muted">--</span>
                    </td>
                    <td>{projeto.numero_registro_fabricante || "--"}</td>
                    <td className="text-end fw-bold">
                      {formatCurrency(projeto.valor_estimado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            ))
          ) : (
            <tbody>
              <tr>
                <td colSpan="7" className="text-center p-5 text-muted">
                  Nenhum projeto encontrado para os filtros selecionados.
                </td>
              </tr>
            </tbody>
          )}
        </Table>
      </div>
    );
  };

  const renderKanban = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="kanban-board mt-3">
        {ETAPAS_KANBAN.map((etapa) => {
          const projetosDaEtapa = filteredProjetos.filter(
            (p) => p.etapa_funil === etapa,
          );
          const isOver = activeColumn === etapa;

          return (
            <KanbanColumn
              key={etapa}
              etapa={etapa}
              projetos={projetosDaEtapa}
              isOver={isOver}
              handleOpenModal={handleOpenModal}
            >
              {projetosDaEtapa.map((projeto) => (
                <SortableItem
                  key={projeto.id}
                  projeto={projeto}
                  containerId={etapa}
                />
              ))}
            </KanbanColumn>
          );
        })}
      </div>
    </DndContext>
  );

  if (loading)
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Carregando CRM...</p>
      </div>
    );

  return (
    <div className="container-main p-4">
      {/* 🚀 Header Padrão */}
      <div className="page-header-colored mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="page-header-title-wrapper">
          <h2 className="page-header-title d-flex align-items-center gap-3">
            <FaChartLine /> Central de Vendas (CRM)
          </h2>
          <p className="page-header-subtitle mb-0">
            Gerencie o funil de vendas, prospecte e acompanhe métricas.
          </p>
        </div>

        {/* 🚀 Área de Ações e Busca */}
        <div className="header-search-container position-relative">
          <FaSearch className="search-icon position-absolute text-muted" />

          <Form.Control
            type="text"
            placeholder="Buscar projeto ou cliente..."
            className="search-input ps-5 py-2 shadow-sm border-0"
            style={{ borderRadius: "10px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex gap-2">
          <Button
            variant="outline-light"
            onClick={() => fileInputRef.current.click()}
            disabled={isImporting}
            title="Importar projetos (Excel/CSV)"
            className="d-flex align-items-center justify-content-center"
            style={{ height: "38px" }}
          >
            {isImporting ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              <i className="bi bi-upload"></i>
            )}
          </Button>

          <Button
            variant="primary shadow-sm"
            onClick={() => handleOpenModal()}
            className="fw-bold shadow-sm"
          >
            + Criar Projeto
          </Button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept=".xlsx, .xls, .csv"
      />

      {/* 🚀 Alertas de Erro/Sucesso */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {importError && (
        <Alert variant="danger" onClose={() => setImportError("")} dismissible>
          {importError}
        </Alert>
      )}
      {importSuccess && (
        <Alert
          variant="success"
          onClose={() => setImportSuccess("")}
          dismissible
        >
          {importSuccess}
        </Alert>
      )}

      {/* 🚀 Filtros Globais (Aplicados ao Kanban e Lista) */}
      {(activeTab === "kanban" || activeTab === "lista") && (
        <Row className="mb-3">
          <Col md={3} sm={6}>
            <Form.Group>
              <Form.Select
                className="shadow-sm border-0"
                value={filtroEtapa}
                onChange={(e) => setFiltroEtapa(e.target.value)}
              >
                <option value="">Todas as Etapas</option>
                {ETAPAS_KANBAN.map((etapa) => (
                  <option key={etapa} value={etapa}>
                    {etapa}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3} sm={6}>
            <Form.Group>
              <Form.Select
                className="shadow-sm border-0"
                value={filtroVendedor}
                onChange={(e) => setFiltroVendedor(e.target.value)}
              >
                <option value="">Todos os Vendedores</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nome_completo}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      )}

      {/* 🚀 Tabs Padronizadas */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        id="crm-hub-tabs"
        className="mb-3 custom-tabs"
        fill
      >
        <Tab
          eventKey="kanban"
          title={
            <>
              <FaTh className="me-2" />
              Funil (Kanban)
            </>
          }
        >
          {renderKanban()}
        </Tab>
        <Tab
          eventKey="lista"
          title={
            <>
              <FaList className="me-2" />
              Lista de Projetos
            </>
          }
        >
          {renderLista()}
        </Tab>
        <Tab
          eventKey="atividades"
          title={
            <>
              <FaCalendarCheck className="me-2" />
              Atividades
            </>
          }
        >
          <PlaceholderTab title="Gestão de Atividades" />
        </Tab>
        <Tab
          eventKey="calendario"
          title={
            <>
              <FaCalendarAlt className="me-2" />
              Calendário
            </>
          }
        >
          <PlaceholderTab title="Calendário de Entregas" />
        </Tab>
        <Tab
          eventKey="clientes"
          title={
            <>
              <FaUsers className="me-2" />
              Clientes
            </>
          }
        >
          <PlaceholderTab title="Carteira de Clientes" />
        </Tab>
        <Tab
          eventKey="relatorios"
          title={
            <>
              <FaChartPie className="me-2" />
              Relatórios
            </>
          }
        >
          <PlaceholderTab title="Relatórios e Métricas" />
        </Tab>
        <Tab
          eventKey="prospeccao"
          title={
            <>
              <FaRobot className="me-2" />
              Prospecção IA
            </>
          }
        >
          <div className="p-5 text-center">
            <Alert variant="primary" className="d-inline-block text-start w-50">
              <Alert.Heading>Redirecionamento</Alert.Heading>
              <p>Acesse o módulo de Prospecção IA clicando no botão abaixo:</p>
              <Link to="/crm/prospeccao" className="btn btn-primary mt-2">
                Acessar Prospecção IA
              </Link>
            </Alert>
          </div>
        </Tab>
      </Tabs>

      <ProjetoFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSuccess={fetchProjetosEVendedores}
        defaultStage={defaultStage}
      />
    </div>
  );
};

export default DashboardProjetos;
