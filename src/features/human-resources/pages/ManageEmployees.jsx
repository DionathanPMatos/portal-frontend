import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // 🚀 Importa o useNavigate
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Dropdown,
  Form,
  Spinner,
  Alert,
  Modal,
  Offcanvas,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaFileImport,
  FaBriefcase,
  FaSitemap,
  FaSearch,
  FaUserTimes,
  FaCog,
  FaFilter,
  FaBuilding,
  FaUsers,
  FaDollarSign,
  FaClipboardList,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import CargosModal from "./CargosModal";
import SetoresModal from "./SetoresModal";
import UnidadesModal from "./UnidadesModal.jsx";
import TimesModal from "../components/TimesModal.jsx";
import CentroCustoModal from "../components/CentroCustoModal.jsx";
import OnboardingTemplateModal from "../components/OnboardingTemplateModal.jsx";
import apiClient from "../../../services/api";
import EmployeeEditModal from "../components/EmployeeEditModal.jsx";
import ImportModal from "../components/ImportModal";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../styles/index.css";
import "../../../styles/Header.css";

// A importação de '../../../App.jsx' foi removida.
// Estilos globais devem ser importados no arquivo de entrada principal da sua aplicação (ex: main.jsx ou index.js).
const ManageEmployees = () => {
  // === PADRONIZAÇÃO DE HOOKS: Todos os states e hooks declarados estritamente no topo ===
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [employees, setEmployees] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [verticais, setVerticais] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [times, setTimes] = useState([]);
  const [beneficios, setBeneficios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [isCargosModalOpen, setIsCargosModalOpen] = useState(false);
  const [isSetoresModalOpen, setIsSetoresModalOpen] = useState(false);
  const [isUnidadesModalOpen, setIsUnidadesModalOpen] = useState(false);
  const [isOnboardingTemplateModalOpen, setIsOnboardingTemplateModalOpen] =
    useState(false);
  const [isCentroCustoModalOpen, setIsCentroCustoModalOpen] = useState(false);
  const [isTimesModalOpen, setIsTimesModalOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [filtroCargo, setFiltroCargo] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);

  // Filtros - Controle do Offcanvas
  const [showFiltros, setShowFiltros] = useState(false);

  // === FUNÇÕES AUXILIARES E CALLBACKS ===
  const formatarNome = (nome) => {
    if (!nome) return "";
    const palavras = nome.toLowerCase().split(" ");
    const nomeFormatado = palavras
      .map((palavra) => {
        if (["de", "da", "do", "dos"].includes(palavra)) {
          return palavra;
        }
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
      })
      .join(" ");
    return nomeFormatado;
  };

  // 🚀 Garante que fetchDropdownData seja uma função estável e definida corretamente
  const fetchDropdownData = useCallback(async () => {
    try {
      const [
        cargosRes,
        setoresRes,
        unidadesRes,
        fabricantesRes,
        verticaisRes,
        subgruposRes,
        timesRes,
        beneficiosRes,
        centrosCustoRes,
      ] = await Promise.all([
        apiClient.get("/api/cargos"),
        apiClient.get("/api/setores"),
        apiClient.get("/api/unidades"),
        apiClient.get("/api/fabricantes"),
        apiClient.get("/api/verticais"),
        apiClient.get("/api/faq/subgrupos"),
        apiClient.get("/api/times"),
        apiClient.get("/api/beneficios"),
        apiClient.get("/api/centro-custos"),
      ]);
      setCargos(cargosRes.data);
      setSetores(setoresRes.data);
      setUnidades(unidadesRes.data);
      setFabricantes(fabricantesRes.data);
      setVerticais(verticaisRes.data);
      setSubgrupos(subgruposRes.data);
      setTimes(timesRes.data);
      setBeneficios(beneficiosRes.data);
      setCentrosCusto(centrosCustoRes.data);
      console.log("✅ Dropdown data fetched successfully!"); // Log para confirmar execução
    } catch (err) {
      console.error("Erro ao buscar dados de dropdowns:", err);
      setError("Falha ao carregar dados de configuração.");
    }
    // Adiciona dependências vazias para que a função seja criada apenas uma vez
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.get("/api/funcionarios", {
        params: { cargoId: filtroCargo, setorId: filtroSetor },
      });
      setEmployees(response.data);
    } catch (err) {
      console.error("Erro ao buscar funcionários:", err);
      setError("Erro ao buscar funcionários.");
    } finally {
      setLoading(false);
    }
  }, [filtroCargo, filtroSetor]);

  // === EFEITOS ===
  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      fetchDropdownData();
      fetchEmployees();
    }
  }, [isLoggedIn, fetchEmployees, fetchDropdownData]);

  // === MANIPULADORES DE EVENTOS ===
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowAddEditModal(true);
  };

  const handleAddClick = () => {
    setEditingEmployee(null);
    setShowAddEditModal(true);
  };

  const handleCloseAndResetModal = () => {
    setShowAddEditModal(false);
    setEditingEmployee(null);
  };

  const handleDeleteClick = (employee) => {
    setSuccessMessage(null);
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await apiClient.delete(`/api/funcionarios/${employeeToDelete.id}`);
      await fetchEmployees();
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
      setSuccessMessage("Colaborador inativado com sucesso!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Erro ao inativar o colaborador:", err);
      setError("Erro ao inativar o colaborador.");
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
  };

  const handleViewDetails = (employeeId) => {
    // 🚀 Função para navegar para a página de detalhes
    navigate(`/rh/colaboradores/${employeeId}`);
  };

  const renderPrivileges = (privString) => {
    if (!privString || privString === "usuario")
      return <Badge bg="info">USUÁRIO</Badge>;
    if (privString.includes("admin"))
      return <Badge bg="danger">ADMINISTRADOR</Badge>;
    const privArray = privString.split(",");
    if (privArray.length > 2)
      return <Badge bg="primary">PERSONALIZADO ({privArray.length})</Badge>;
    return privArray.map((p) => (
      <Badge bg="secondary" className="me-1 text-uppercase" key={p}>
        {p}
      </Badge>
    ));
  };

  const getStatusBadge = (ativo) => {
    if (ativo) {
      return <Badge bg="success">Ativo</Badge>;
    }
    return <Badge bg="danger">Inativo</Badge>;
  };

  // === FILTRAGEM EM MEMÓRIA ===
  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      emp.nome_completo?.toLowerCase().includes(searchLower) ||
      emp.email?.toLowerCase().includes(searchLower)
    );
  });

  // === RETORNO CONDICIONAL DE LOADING (Mergulhado antes do return principal para não quebrar hooks) ===
  if (loading) {
    return (
      <div className="dash-grid">
        <div className="container-main">
          <Container className="mt-5 text-center">
            <Spinner animation="border" />
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        {/* === BOTÃO DE FILTROS ===*/}
        <Button
          variant="outline-secondary"
          onClick={() => setShowFiltros(true)}
          className="d-flex align-items-center gap-2"
        >
          <FaFilter /> Filtros
        </Button>

        <div className="header-search-container position-relative">
          {/* O ícone precisa da classe que define o estilo dele (cor, posição) */}
          <FaSearch className="search-icon position-absolute text-muted" />

          <Form.Control
            type="text"
            className="search-input ps-5 py-2 shadow-sm border-0"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ borderRadius: "10px" }}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* === BOTÃO DE ADICIONAR COLABORADOR ===*/}
          <Button
            variant="primary"
            onClick={handleAddClick}
            className="d-flex align-items-center gap-2"
          >
            <FaUserPlus /> Novo Colaborador
          </Button>

          {/* === DROPDOWN DE CONFIGURAÇÕES ===*/}
          {/* Dropdown de Configurações (AQUELE QUE VOCÊ QUERIA DE VOLTA) */}
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-settings">
              <FaCog />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={() => setShowImportModal(true)}>
                <FaFileImport className="me-2" /> Importar CSV
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setIsCargosModalOpen(true)}>
                <FaBriefcase className="me-2" /> Gerenciar Cargos
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setIsSetoresModalOpen(true)}>
                <FaSitemap className="me-2" /> Gerenciar Setores
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setIsCentroCustoModalOpen(true)}>
                <FaDollarSign className="me-2" /> Gerenciar Centros de Custo
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setIsTimesModalOpen(true)}>
                <FaUsers className="me-2" /> Gerenciar Times
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setIsOnboardingTemplateModalOpen(true)}
              >
                <FaClipboardList className="me-2" /> Gerenciar Onboarding
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setIsUnidadesModalOpen(true)}>
                <FaBuilding className="me-2" /> Gerenciar Filiais
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      {/* 2. LISTAGEM (TABELA) */}
      <Card className="shadow-sm border-0 mb-4">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="px-4 py-3 fw-bold border-0">Colaborador</th>
                <th className="py-3 fw-bold border-0">Status</th>
                <th className="py-3 fw-bold border-0">Departamento / Cargo</th>
                <th className="py-3 fw-bold border-0">Acesso</th>
                <th className="text-end px-4 py-3 fw-bold border-0">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center">
                        <img
                          src={employee.userpic_url || "default-avatar.png"}
                          alt="Foto"
                          className="rounded-circle me-3 border bg-light"
                          style={{
                            width: "45px",
                            height: "45px",
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <div
                            className="fw-bold text-dark text-decoration-none"
                            onClick={() => handleViewDetails(employee.id)}
                            style={{
                              cursor: "pointer",
                            }}
                            title="Ver detalhes"
                          >
                            {formatarNome(employee.nome_completo)}
                          </div>
                          <div className="text-muted small">
                            {employee.email}
                          </div>
                          {employee.nome_unidade && (
                            <Badge
                              bg="light"
                              text="dark"
                              className="border mt-1"
                            >
                              {employee.nome_unidade}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">{getStatusBadge(employee.ativo)}</td>
                    <td className="py-3">
                      <div className="fw-semibold text-dark">
                        {employee.nome_setor || "-"}
                      </div>
                      <div className="text-muted small">
                        {employee.nome_cargo || "-"}
                      </div>
                    </td>
                    <td className="py-3">
                      {renderPrivileges(employee.privilegios)}
                    </td>
                    <td className="text-end px-4 py-3">
                      <Button
                        variant="light"
                        size="sm"
                        className="me-2 shadow-sm text-primary"
                        onClick={() => handleEdit(employee)}
                        title="Editar"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="shadow-sm text-danger"
                        onClick={() => handleDeleteClick(employee)}
                        title="Inativar"
                      >
                        <FaUserTimes />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    {isLoggedIn
                      ? "Nenhum colaborador encontrado para o filtro selecionado."
                      : "Efetue login para visualizar."}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>
      {/* 3. FILTROS LATERAIS (O OFFCANVAS FICA NA RAIZ DO RENDER JUNTO AOS MODAIS) */}
      <Offcanvas
        show={showFiltros}
        onHide={() => setShowFiltros(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fw-bold">
            Filtros Avançados
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              fetchEmployees();
              setShowFiltros(false);
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-muted">
                Setor
              </Form.Label>
              <Form.Select
                value={filtroSetor}
                onChange={(e) => setFiltroSetor(e.target.value)}
              >
                <option value="">Todos os setores</option>
                {Array.isArray(setores) &&
                  setores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome_setor}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-muted">
                Cargo
              </Form.Label>
              <Form.Select
                value={filtroCargo}
                onChange={(e) => setFiltroCargo(e.target.value)}
              >
                <option value="">Todos os cargos</option>
                {Array.isArray(cargos) &&
                  cargos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome_cargo}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex gap-2 mt-4">
              <Button
                variant="outline-secondary"
                className="w-50"
                onClick={() => {
                  setFiltroSetor("");
                  setFiltroCargo("");
                }}
              >
                Limpar
              </Button>
              <Button variant="primary" type="submit" className="w-50">
                Aplicar Filtros
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
      {/* 🚀 CORREÇÃO: Passa a função correta para atualizar os dados após a edição nos modais. */}
      <CargosModal
        show={isCargosModalOpen}
        onHide={() => setIsCargosModalOpen(false)}
        onCargosUpdate={fetchDropdownData}
      />
      <SetoresModal
        show={isSetoresModalOpen}
        onHide={() => setIsSetoresModalOpen(false)}
        onSetoresUpdate={fetchDropdownData}
      />
      <CentroCustoModal
        show={isCentroCustoModalOpen}
        onHide={() => setIsCentroCustoModalOpen(false)}
      />
      <OnboardingTemplateModal
        show={isOnboardingTemplateModalOpen}
        onHide={() => setIsOnboardingTemplateModalOpen(false)}
      />
      <TimesModal
        show={isTimesModalOpen}
        onHide={() => setIsTimesModalOpen(false)}
      />
      <UnidadesModal
        show={isUnidadesModalOpen}
        onHide={() => setIsUnidadesModalOpen(false)}
        onUnidadesUpdate={fetchDropdownData}
      />
      <ImportModal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        onComplete={fetchEmployees}
      />
      <EmployeeEditModal
        show={showAddEditModal}
        onHide={handleCloseAndResetModal}
        employeeToEdit={editingEmployee}
        // Passando todos os dados necessários para os dropdowns
        cargos={cargos}
        setores={setores}
        unidades={unidades}
        fabricantes={fabricantes}
        verticais={verticais}
        subgrupos={subgrupos}
        timesList={times}
        beneficiosList={beneficios}
        centrosCusto={centrosCusto}
        employees={employees}
        onSaveSuccess={() => {
          setSuccessMessage("Operação realizada com sucesso!");
          fetchEmployees();
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
      />
      <Modal show={showDeleteModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Inativação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja inativar o acesso de{" "}
          <strong>{formatarNome(employeeToDelete?.nome_completo)}</strong>? Ele
          não poderá mais logar, mas o histórico de projetos será mantido.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary btn-sm" onClick={cancelDelete}>
            Cancelar
          </Button>
          <Button variant="danger btn-sm" onClick={confirmDelete}>
            Inativar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageEmployees;
