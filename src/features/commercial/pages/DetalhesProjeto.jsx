import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  Breadcrumb,
  Button,
  Modal,
  Form,
  ListGroup,
  InputGroup,
  Badge,
  Tabs,
  Tab,
  FormCheck,
  Accordion,
  Table,
} from "react-bootstrap";
import {
  FaTachometerAlt,
  FaUsers,
  FaSitemap,
  FaUmbrellaBeach,
  FaGift,
  FaChalkboardTeacher,
  FaClipboardCheck,
  FaUserTie,
  FaFileAlt,
} from "react-icons/fa";

import ProjetoFormModal from "./CRM/ProjetoFormModal";
import PedidoErpModal from "./CRM/PedidoErpModal";
import "./../styles/Crm.css";
import apiClient from "../../../services/api";

const getFileIcon = (filename) => {
  if (!filename) return "bi-file-earmark text-secondary";

  const ext = filename.split(".").pop().toLowerCase();

  switch (ext) {
    case "pdf":
      return "bi-file-earmark-pdf-fill text-danger";
    case "xls":
      return "bi-file-earmark-excel-fill text-success";
    case "xlsx":
      return "bi-file-earmark-excel-fill text-success";
    case "csv":
      return "bi-file-earmark-excel-fill text-success";
    case "doc":
      return "bi-file-earmark-word-fill text-primary";
    case "docx":
      return "bi-file-earmark-word-fill text-primary";
    case "jpg":
      return "bi-file-earmark-image-fill text-info";
    case "jpeg":
      return "bi-file-earmark-image-fill text-info";
    case "png":
      return "bi-file-earmark-image-fill text-info";
    case "svg":
      return "bi-file-earmark-image-fill text-info";
    case "dwg":
      return "bi-file-earmark-ruled-fill text-warning";
    case "dxf":
      return "bi-file-earmark-ruled-fill text-warning";
    case "zip":
      return "bi-file-earmark-zip-fill text-dark";
    case "rar":
      return "bi-file-earmark-zip-fill text-dark";
    default:
      return "bi-file-earmark-text-fill text-secondary";
  }
};

// --- SUB-COMPONENTE CORRIGIDO PARA GERENCIAR UM ÚNICO PEDIDO ---
const PedidoAccordionItem = ({ projetoId, pedidoVinculado, onDesvincular }) => {
  const [detalhes, setDetalhes] = useState({
    pedido: null,
    estoque: null,
    solicitacao: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const carregarDetalhesPedido = async () => {
    if (detalhes.pedido) return;
    setIsLoading(true);
    setError("");
    try {
      const resPedido = await apiClient.get(
        `/api/erp/pedido/${pedidoVinculado.numero_pedido}`,
      );
      const resEstoque =
        resPedido.data.itens.length > 0
          ? await apiClient.post(`/api/erp/estoque`, {
              codigos: resPedido.data.itens.map((i) => i.codigo),
            })
          : { data: [] };

      setDetalhes({
        pedido: resPedido.data,
        estoque: resEstoque.data,
        solicitacao: null,
      });
    } catch (err) {
      console.error("Erro ao buscar detalhes do pedido ou estoque:", err);
      setError("Falha ao carregar detalhes do pedido do ERP.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      !detalhes.solicitacao ||
      ["Comprado", "Cancelado"].includes(detalhes.solicitacao.status)
    ) {
      return;
    }
    const interval = setInterval(async () => {
      const res = await apiClient
        .get(`/api/compras/solicitacao/pedido/${pedidoVinculado.id}`)
        .catch(() => null);
      if (res && res.data && res.data.status !== detalhes.solicitacao.status) {
        setDetalhes((d) => ({ ...d, solicitacao: res.data }));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [detalhes.solicitacao, pedidoVinculado.id]);

  const handleSolicitarCompra = async () => {
    const itensParaComprar = detalhes.estoque.filter(
      (item) => item.status === "Insuficiente",
    );
    if (itensParaComprar.length === 0) return;

    if (window.confirm("Confirmar o envio da solicitação de compra?")) {
      try {
        const res = await apiClient.post("/api/compras/solicitacoes", {
          projeto_id: projetoId,
          projeto_pedido_id: pedidoVinculado.id,
          itens_faltantes: itensParaComprar,
        });
        setDetalhes((d) => ({ ...d, solicitacao: res.data }));
        alert("Solicitação de compra enviada!");
      } catch (err) {
        alert(err.response?.data?.error || "Erro ao enviar solicitação.");
      }
    }
  };

  const hasInsufficientStock = detalhes.estoque?.some(
    (item) => item.status === "Insuficiente",
  );

  const getBadgeStatus = () => {
    if (detalhes.solicitacao) {
      return {
        bg: "success",
        text: "white",
        label: `Compra: ${detalhes.solicitacao.status}`,
      };
    }
    if (detalhes.estoque === null) {
      return { bg: "secondary", text: "white", label: "Verificar Estoque" };
    }
    if (hasInsufficientStock) {
      return { bg: "warning", text: "dark", label: "Pendente de Compra" };
    }
    return { bg: "primary", text: "white", label: "Estoque OK" };
  };

  const badgeStatus = getBadgeStatus();

  return (
    <Accordion.Item
      eventKey={pedidoVinculado.numero_pedido}
      className="border-0 shadow-sm mb-2 rounded"
    >
      <Accordion.Header onClick={carregarDetalhesPedido}>
        <div className="fw-semibold">
          Pedido ERP: {pedidoVinculado.numero_pedido}
        </div>
        {detalhes.pedido && (
          <span className="ms-2 text-muted small">
            (Valor:{" "}
            {parseFloat(detalhes.pedido.valor_total_pedido || 0).toLocaleString(
              "pt-BR",
              { style: "currency", currency: "BRL" },
            )}
            )
          </span>
        )}
        <Badge
          bg={badgeStatus.bg}
          text={badgeStatus.text}
          className="ms-3 shadow-sm"
        >
          {badgeStatus.label}
        </Badge>
      </Accordion.Header>
      <Accordion.Body className="bg-light rounded-bottom">
        {isLoading && <Spinner animation="border" size="sm" />}
        {error && (
          <Alert variant="danger" className="border-0 shadow-sm">
            {error}
          </Alert>
        )}
        {detalhes.pedido && (
          <div>
            <div className="mb-3">
              <span className="fw-semibold small text-muted text-uppercase">
                Cliente
              </span>
              <div className="fw-bold">{detalhes.pedido.cliente_nome}</div>
            </div>
            <div className="table-responsive">
              <Table
                hover
                className="align-middle mb-3 shadow-sm bg-white rounded"
                size="sm"
              >
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th className="px-3 py-2 border-0">Item</th>
                    <th className="py-2 border-0 text-center">Qtd</th>
                    <th className="py-2 border-0 text-end px-3">Valor Unit.</th>
                  </tr>
                </thead>
                <tbody>
                  {detalhes.pedido.itens.map((item) => (
                    <tr key={item.codigo}>
                      <td className="px-3 py-2 text-dark">{item.descricao}</td>
                      <td className="py-2 text-center">{item.quantidade}</td>
                      <td className="py-2 text-end px-3">
                        {parseFloat(item.valor_unitario).toLocaleString(
                          "pt-BR",
                          {
                            style: "currency",
                            currency: "BRL",
                          },
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="d-flex gap-2 mt-3">
              {hasInsufficientStock && !detalhes.solicitacao && (
                <Button
                  variant="warning"
                  size="sm"
                  className="shadow-sm fw-semibold"
                  onClick={handleSolicitarCompra}
                >
                  <i className="bi bi-cart-plus me-2"></i>Solicitar Compra de
                  Faltantes
                </Button>
              )}
              <Button
                variant="outline-danger"
                size="sm"
                className="shadow-sm bg-white"
                onClick={() => onDesvincular(pedidoVinculado.id)}
              >
                <i className="bi bi-link-45deg me-2"></i>Desvincular Pedido
              </Button>
            </div>
          </div>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

// --- COMPONENTE PRINCIPAL ---
const DetalhesProjeto = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projeto, setProjeto] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [motivoPerda, setMotivoPerda] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);
  const [numeroPedidoErp, setNumeroPedidoErp] = useState("");
  const [pedidoImportado, setPedidoImportado] = useState(null);
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  const [atividades, setAtividades] = useState([]);
  const [atividadeLoading, setAtividadeLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("nota");
  const [textoNota, setTextoNota] = useState("");
  const [textoAtividade, setTextoAtividade] = useState("");
  const [dataTarefa, setDataTarefa] = useState("");

  const USUARIO_LOGADO_ID = user?.id || 1;

  const fetchData = async () => {
    try {
      const resultados = await Promise.allSettled([
        apiClient.get(`/api/projetos/${id}`),
        apiClient.get(`/api/projetos/${id}/documentos`),
        apiClient.get(`/api/projetos/${id}/atividades`),
      ]);

      if (resultados[0].status === "fulfilled") {
        setProjeto(resultados[0].value.data);
      } else {
        setError("Erro ao buscar dados principais do projeto.");
        console.error(resultados[0].reason);
      }

      if (resultados[1].status === "fulfilled") {
        setDocumentos(resultados[1].value.data);
      } else {
        console.warn(
          "Rota de documentos não encontrada ou falhou (404). Usando array vazio.",
        );
        setDocumentos([]);
      }

      if (resultados[2].status === "fulfilled") {
        setAtividades(resultados[2].value.data);
      } else {
        console.warn(
          "Rota de atividades não encontrada ou falhou (404). Usando array vazio.",
        );
        setAtividades([]);
      }
    } catch (err) {
      setError("Erro crítico ao processar os dados do projeto.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [id]);

  const handleAddAtividade = async (tipo, dados) => {
    if (!dados.descricao.trim()) {
      alert("A descrição é obrigatória.");
      return;
    }
    setAtividadeLoading(true);
    try {
      // 1. Monta o payload exatamente como o backend espera
      const payload = {
        usuarioId: USUARIO_LOGADO_ID,
        tipo: tipo,
        descricao: dados.descricao,
        metadados: {
          data_conclusao_prevista: dados.data || null,
        },
      };

      // 2. Envia para o banco de dados
      await apiClient.post(`/api/projetos/${id}/atividades`, payload);

      // 3. 👇 CHAMA A FUNÇÃO FETCHDATA PARA RECARREGAR TUDO AUTOMATICAMENTE 👇
      fetchData();

      // 4. Limpa os campos da tela
      setTextoNota("");
      setTextoAtividade("");
      setDataTarefa("");
    } catch (err) {
      console.error("Erro da API:", err);
      alert("Erro ao adicionar atividade.");
    } finally {
      setAtividadeLoading(false);
    }
  };

  const handleToggleTask = async (taskId, statusAtual) => {
    setAtividades(
      atividades.map((ativ) =>
        ativ.id === taskId ? { ...ativ, concluida: !statusAtual } : ativ,
      ),
    );
    try {
      await apiClient.patch(`/api/atividades/${taskId}/toggle`);
    } catch (err) {
      alert("Falha ao atualizar a tarefa. Revertendo.");
      setAtividades(
        atividades.map((ativ) =>
          ativ.id === taskId ? { ...ativ, concluida: statusAtual } : ativ,
        ),
      );
    }
  };

  const handleProjectUpdated = () => {
    setShowEditModal(false);
    fetchData();
  };

  const handleMarkAsLost = async () => {
    if (!motivoPerda) {
      alert("Por favor, informe o motivo da perda.");
      return;
    }
    try {
      await apiClient.patch(`/api/projetos/${id}/perder`, {
        motivo_perda: motivoPerda,
      });
      setShowLostModal(false);
      navigate("/crm/projetos");
    } catch (err) {
      alert(err.response?.data?.error || "Ocorreu um erro.");
    }
  };

  const handleSolicitarProposta = async () => {
    if (window.confirm("Tem certeza?")) {
      try {
        console.log("Tentando enviar projeto:", projeto.id); // Adicione esse log
        const response = await apiClient.patch(
          `/api/projetos/${id}/solicitar-proposta`,
        );
        setSuccess(response.data.message);
        fetchData();
        setTimeout(() => setSuccess(""), 4000);
        alert("Enviado com sucesso!");
      } catch (err) {
        alert(err.response?.data?.error || "Ocorreu um erro.");
        console.error("Erro ao enviar:", err);
      }
    }
  };

  const handleEnviarParaRevisao = async () => {
    if (window.confirm("Tem certeza?")) {
      try {
        const response = await apiClient.patch(`/api/projetos/${id}/revisar`);
        setSuccess(response.data.message);
        fetchData();
        setTimeout(() => setSuccess(""), 4000);
      } catch (err) {
        alert(err.response?.data?.error || "Ocorreu um erro.");
      }
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!fileToUpload) return alert("Por favor, selecione um arquivo.");

    const formData = new FormData();
    formData.append("documento", fileToUpload);
    try {
      const response = await apiClient.post(
        `/api/projetos/${id}/upload`,
        formData,
      );
      setSuccess(response.data.message);
      event.target.reset();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao fazer upload.");
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (window.confirm("Tem certeza?")) {
      try {
        await apiClient.delete(`/api/projetos/documentos/${docId}`);
        setSuccess("Documento excluído com sucesso!");
        fetchData();
      } catch (err) {
        alert(err.response?.data?.error || "Erro ao excluir documento.");
      }
    }
  };

  const handleAbrirDocumento = async (docId) => {
    try {
      // Pede o link seguro para a API (o apiClient envia o token automaticamente)
      const response = await apiClient.get(
        `/api/projetos/documentos/${docId}/gerar-link`,
      );

      // Abre a URL segura em uma nova aba
      window.open(response.data.url, "_blank");
    } catch (err) {
      alert(
        "Erro ao acessar o documento. Ele pode não existir mais no servidor.",
      );
      console.error(err);
    }
  };

  const handleVerificarPedido = async () => {
    if (!numeroPedidoErp.trim()) return;
    setImportLoading(true);
    setImportError("");
    try {
      const res = await apiClient.get(`/api/erp/pedido/${numeroPedidoErp}`);
      setPedidoImportado(res.data);
      setShowPedidoModal(true);
    } catch (err) {
      setImportError(
        err.response?.data?.error ||
          `Pedido "${numeroPedidoErp}" não encontrado no ERP.`,
      );
    } finally {
      setImportLoading(false);
    }
  };

  const handleAtrelarPedido = async () => {
    if (!pedidoImportado) return;
    setIsLinking(true);
    try {
      await apiClient.patch(`/api/projetos/${id}/atrelar-pedido`, {
        numero_pedido: pedidoImportado.numero_pedido,
      });
      setShowPedidoModal(false);
      setNumeroPedidoErp("");
      setPedidoImportado(null);
      setSuccess("Pedido vinculado com sucesso!");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao vincular pedido.");
    } finally {
      setIsLinking(false);
    }
  };

  const handleDesvincularPedido = async (pedidoVinculadoId) => {
    if (
      window.confirm(
        "Tem certeza que deseja desvincular este pedido do projeto?",
      )
    ) {
      try {
        await apiClient.delete(`/api/projeto-pedidos/${pedidoVinculadoId}`);
        setSuccess("Pedido desvinculado com sucesso!");
        fetchData();
      } catch (err) {
        alert(err.response?.data?.error || "Erro ao desvincular o pedido.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Não definida";
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const renderAtividadeIcone = (tipo) => {
    switch (tipo) {
      case "Nota":
        return <i className="bi bi-chat-right-text-fill text-primary"></i>;
      case "Tarefa":
        return <i className="bi bi-check2-circle text-warning"></i>;
      case "Ligação":
        return <i className="bi bi-telephone-fill text-info"></i>;
      case "Reunião":
        return <i className="bi bi-people-fill text-success"></i>;
      default:
        return <i className="bi bi-record-circle-fill text-secondary"></i>;
    }
  };

  const getStatusPropostaBadge = (status) => {
    switch (status) {
      case "Pendente":
        return "warning";
      case "Em Elaboração":
        return "info";
      case "Concluída":
        return "success";
      case "Revisão Solicitada":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (loading)
    return (
      <div className="container-main p-4 text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  if (error)
    return (
      <div className="container-main p-4 mt-5">
        <Alert variant="danger" className="shadow-sm border-0">
          {error}
        </Alert>
      </div>
    );
  if (!projeto)
    return (
      <div className="container-main p-4 mt-5">
        <Alert variant="warning" className="shadow-sm border-0">
          Projeto não encontrado.
        </Alert>
      </div>
    );

  return (
    <div className="container-main p-4">
      {/* CABEÇALHO DA PÁGINA PADRONIZADO */}
      <div className="page-header-colored mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 p-4 rounded shadow-sm">
        {/* Título e Subtítulo */}
        <div className="page-header-title-wrapper">
          <h2 className="page-header-title d-flex align-items-center gap-3 mb-1">
            {/* Dica: Usei o ícone do Bootstrap (bi-folder2-open) nativo do seu projeto. 
                Se quiser usar o <FaUsers />, lembre-se de importar do react-icons/fa no topo do arquivo. */}
            <i className="bi bi-folder2-open"></i> {projeto.nome_projeto}
          </h2>
          <p className="page-header-subtitle text-muted mb-0">
            Gerencie os detalhes, atividades e documentos deste projeto.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {projeto.etapa_funil === "25% - Especificação de Projeto" &&
            !projeto.status_proposta_dtc && (
              <Button
                variant="primary"
                onClick={handleSolicitarProposta}
                className="d-flex align-items-center gap-2 shadow-sm"
              >
                <i className="bi bi-file-earmark-text"></i> Solicitar Proposta
                Técnica
              </Button>
            )}
          <Button
            variant="primary"
            onClick={() => setShowEditModal(true)}
            className="d-flex align-items-center gap-2 shadow-sm bg-white"
          >
            <i className="bi bi-pencil"></i> Editar
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowLostModal(true)}
            className="d-flex align-items-center gap-2 shadow-sm "
          >
            <i className="bi bi-x-circle"></i> Marcar como Perdido
          </Button>
        </div>
      </div>

      {/* Alertas de Sucesso */}
      {success && (
        <Alert
          variant="success"
          onClose={() => setSuccess("")}
          dismissible
          className="shadow-sm border-0"
        >
          {success}
        </Alert>
      )}
      {/* CARD PRINCIPAL: DETALHES DO PROJETO */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white border-bottom py-3">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-info-circle-fill text-primary me-2"></i>Detalhes
            do Projeto
          </h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Row>
            {/* Coluna da Esquerda com Detalhes */}
            <Col md={8}>
              <Row className="mb-4">
                <Col md={6} className="mb-3 mb-md-0">
                  <div className="mb-3">
                    <span className="fw-semibold small text-muted text-uppercase">
                      Cliente
                    </span>
                    <div className="fw-bold text-dark">
                      {projeto.nome_cliente}
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="fw-semibold small text-muted text-uppercase">
                      Vendedor
                    </span>
                    <div className="text-dark">{projeto.nome_vendedor}</div>
                  </div>
                  <div>
                    <span className="fw-semibold small text-muted text-uppercase">
                      Tipo de Projeto
                    </span>
                    <div className="text-dark">
                      {projeto.tipo_projeto || "N/A"}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <span className="fw-semibold small text-muted text-uppercase">
                      Valor Estimado
                    </span>
                    <div className="fw-bold text-success">
                      {projeto.valor_estimado
                        ? `R$ ${parseFloat(projeto.valor_estimado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : "Não informado"}
                    </div>
                  </div>
                  <div>
                    <span className="fw-semibold small text-muted text-uppercase">
                      Previsão de Fechamento
                    </span>
                    <div className="text-dark">
                      {formatDate(projeto.data_fechamento_prevista)}
                    </div>
                  </div>
                </Col>
              </Row>

              <h6 className="fw-bold mb-3">
                <i className="bi bi-tags-fill text-secondary me-2"></i>
                Classificação
              </h6>
              <Row className="mb-4">
                <Col md={4} className="mb-3 mb-md-0">
                  <span className="fw-semibold small text-muted text-uppercase">
                    Segmentação
                  </span>
                  <div className="text-dark">
                    {projeto.nome_segmentacao || "N/A"}
                  </div>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                  <span className="fw-semibold small text-muted text-uppercase">
                    Vertical
                  </span>
                  <div className="text-dark">
                    {projeto.nome_vertical || "N/A"}
                  </div>
                </Col>
                <Col md={4}>
                  <span className="fw-semibold small text-muted text-uppercase">
                    Integrador
                  </span>
                  <div className="text-dark">
                    {projeto.nome_integrador || "N/A"}
                  </div>
                </Col>
              </Row>

              <div className="d-flex flex-wrap gap-5">
                <div>
                  <h6 className="fw-bold mb-2">
                    <i className="bi bi-people-fill text-info me-2"></i>
                    Colaboradores
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {projeto.colaboradores &&
                    projeto.colaboradores.length > 0 ? (
                      projeto.colaboradores.map((c) => (
                        <Badge
                          key={c.id}
                          pill
                          bg="light"
                          text="dark"
                          className="border shadow-sm"
                        >
                          {c.nome_completo}
                        </Badge>
                      ))
                    ) : (
                      <small className="text-muted">Nenhum adicionado.</small>
                    )}
                  </div>
                </div>
                <div>
                  <h6 className="fw-bold mb-2">
                    <i className="bi bi-cpu-fill text-secondary me-2"></i>
                    Fabricantes
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {projeto.fabricantes && projeto.fabricantes.length > 0 ? (
                      projeto.fabricantes.map((f) => (
                        <Badge key={f.id} pill bg="dark" className="shadow-sm">
                          {f.name}
                        </Badge>
                      ))
                    ) : (
                      <small className="text-muted">Nenhum adicionado.</small>
                    )}
                  </div>
                </div>
              </div>
            </Col>

            {/* Coluna da Direita com Status */}
            <Col md={4} className="border-start ps-md-4 mt-4 mt-md-0">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                Status Operacional
              </h6>

              <div className="mb-3">
                <span className="fw-semibold small text-muted text-uppercase d-block mb-1">
                  Etapa do Funil
                </span>
                <Badge bg="primary" text="light" className="p-2 shadow-sm">
                  {projeto.etapa_funil}
                </Badge>
              </div>

              <div className="mb-3 p-3 bg-light rounded border border-light shadow-sm">
                <span className="fw-semibold small text-muted text-uppercase d-block mb-2">
                  Registro Fabricante
                </span>
                <div className="d-flex align-items-center">
                  {projeto.numero_registro_fabricante ? (
                    <Badge bg="success" className="p-2 shadow-sm">
                      Registrado
                    </Badge>
                  ) : (
                    <Badge bg="danger" text="light" className="p-2 shadow-sm">
                      Pendente
                    </Badge>
                  )}
                </div>
                {projeto.numero_registro_fabricante && (
                  <div className="text-dark fw-bold mt-2 small">
                    N°: {projeto.numero_registro_fabricante}
                  </div>
                )}
              </div>

              {projeto.status_proposta_dtc && (
                <div className="p-3 bg-light rounded border border-light shadow-sm">
                  <span className="fw-semibold small text-muted text-uppercase d-block mb-2">
                    Status do DTC
                  </span>
                  <div className="d-flex flex-column gap-2 align-items-start">
                    <Badge
                      bg={getStatusPropostaBadge(projeto.status_proposta_dtc)}
                      text="light"
                      className="p-2 shadow-sm"
                    >
                      {projeto.status_proposta_dtc}
                    </Badge>
                    {projeto.status_proposta_dtc === "Concluída" && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleEnviarParaRevisao}
                        className="shadow-sm w-100 mt-2"
                      >
                        <i className="bi bi-arrow-repeat me-1"></i> Enviar para
                        Revisão
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* CARD DO FEED DE ATIVIDADES */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white border-bottom py-0">
          <Tabs
            activeKey={abaAtiva}
            onSelect={(k) => setAbaAtiva(k)}
            id="activity-tabs"
            className="border-0 pt-3 custom-tabs"
          >
            <Tab
              eventKey="nota"
              title={
                <>
                  <i className="bi bi-chat-right-text me-2"></i>Nota
                </>
              }
            ></Tab>
            <Tab
              eventKey="tarefa"
              title={
                <>
                  <i className="bi bi-check2-circle me-2"></i>Tarefa
                </>
              }
            ></Tab>
            <Tab
              eventKey="ligacao"
              title={
                <>
                  <i className="bi bi-telephone me-2"></i>Ligação
                </>
              }
            ></Tab>
            <Tab
              eventKey="reuniao"
              title={
                <>
                  <i className="bi bi-people me-2"></i>Reunião
                </>
              }
            ></Tab>
          </Tabs>
        </Card.Header>
        <Card.Body className="bg-light pb-4 border-bottom">
          {abaAtiva === "nota" && (
            <InputGroup className="shadow-sm rounded">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Adicione uma nota sobre este projeto..."
                value={textoNota}
                onChange={(e) => setTextoNota(e.target.value)}
                className="border-0"
              />
              <Button
                variant="primary"
                onClick={() =>
                  handleAddAtividade("Nota", { descricao: textoNota })
                }
                disabled={atividadeLoading}
                className="px-4"
              >
                {atividadeLoading ? <Spinner size="sm" /> : "Registrar"}
              </Button>
            </InputGroup>
          )}
          {abaAtiva === "tarefa" && (
            <Row className="g-2">
              <Col md={8}>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Descreva a tarefa..."
                  value={textoAtividade}
                  onChange={(e) => setTextoAtividade(e.target.value)}
                  className="shadow-sm border-0"
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  type="datetime-local"
                  value={dataTarefa}
                  onChange={(e) => setDataTarefa(e.target.value)}
                  className="shadow-sm border-0 h-100"
                />
              </Col>
              <Col md={12} className="text-end mt-3">
                <Button
                  variant="primary"
                  onClick={() =>
                    handleAddAtividade("Tarefa", {
                      descricao: textoAtividade,
                      data: dataTarefa,
                    })
                  }
                  disabled={atividadeLoading}
                  className="shadow-sm px-4"
                >
                  {atividadeLoading ? <Spinner size="sm" /> : "Criar Tarefa"}
                </Button>
              </Col>
            </Row>
          )}
          {abaAtiva === "ligacao" && (
            <InputGroup className="shadow-sm rounded">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Descreva o que foi discutido na ligação..."
                value={textoAtividade}
                onChange={(e) => setTextoAtividade(e.target.value)}
                className="border-0"
              />
              <Button
                variant="primary"
                onClick={() =>
                  handleAddAtividade("Ligação", { descricao: textoAtividade })
                }
                disabled={atividadeLoading}
                className="px-4"
              >
                {atividadeLoading ? <Spinner size="sm" /> : "Registrar"}
              </Button>
            </InputGroup>
          )}
          {abaAtiva === "reuniao" && (
            <InputGroup className="shadow-sm rounded">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Descreva a pauta e o que foi decidido na reunião..."
                value={textoAtividade}
                onChange={(e) => setTextoAtividade(e.target.value)}
                className="border-0"
              />
              <Button
                variant="primary"
                onClick={() =>
                  handleAddAtividade("Reunião", { descricao: textoAtividade })
                }
                disabled={atividadeLoading}
                className="px-4"
              >
                {atividadeLoading ? <Spinner size="sm" /> : "Registrar"}
              </Button>
            </InputGroup>
          )}
        </Card.Body>
        <ListGroup
          variant="flush"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          {atividades.map((ativ) => {
            const isTask = ativ.tipo_atividade === "Tarefa";
            const isOverdue =
              isTask &&
              !ativ.concluida &&
              new Date(ativ.data_conclusao_prevista) < new Date();

            return (
              <ListGroup.Item
                key={ativ.id}
                className={`d-flex align-items-start border-bottom px-4 py-3 ${ativ.concluida ? "bg-light opacity-75" : ""}`}
              >
                <div className="d-flex flex-column align-items-center me-3 mt-1">
                  {isTask ? (
                    <FormCheck
                      type="checkbox"
                      checked={!!ativ.concluida}
                      onChange={() =>
                        handleToggleTask(ativ.id, !!ativ.concluida)
                      }
                      className="task-checkbox"
                      style={{ transform: "scale(1.2)" }}
                    />
                  ) : (
                    <div
                      className="icon-circle-sm bg-light shadow-sm d-flex align-items-center justify-content-center rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                    >
                      {renderAtividadeIcone(ativ.tipo_atividade)}
                    </div>
                  )}
                </div>
                <div className="w-100">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div>
                      <strong className="text-dark">
                        {ativ.nome_usuario || "Usuário"}
                      </strong>
                      <small className="text-muted ms-2">
                        adicionou uma {ativ.tipo_atividade.toLowerCase()}
                      </small>
                    </div>
                    <small className="text-muted">
                      {formatDate(ativ.data_criacao)}
                    </small>
                  </div>
                  <p
                    className={`mb-1 ${ativ.concluida ? "text-decoration-line-through text-muted" : "text-dark"}`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {ativ.descricao}
                  </p>
                  {isTask &&
                    !ativ.concluida &&
                    ativ.data_conclusao_prevista && (
                      <Badge
                        bg={isOverdue ? "danger" : "light"}
                        text={isOverdue ? "white" : "dark"}
                        className={`mt-2 ${!isOverdue && "border text-muted"}`}
                      >
                        <i className="bi bi-calendar-event me-1"></i>{" "}
                        Vencimento: {formatDate(ativ.data_conclusao_prevista)}
                        {isOverdue && " (Atrasada)"}
                      </Badge>
                    )}
                </div>
              </ListGroup.Item>
            );
          })}
          {atividades.length === 0 && !loading && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-2 d-block mb-2 text-light"></i>
              Nenhuma atividade registrada ainda.
            </div>
          )}
        </ListGroup>
      </Card>

      {/* NOVA SEÇÃO DE PEDIDOS COM ACCORDION */}
      {[
        "55% - Envio de Proposta - Projeto",
        "35% - POC",
        "75% - Aguardando Aprovação",
        "95% - Pedido Fechado",
        "98% - Parcialmente Entregue",
        "100% - Faturado e Entregue",
        "Ganho",
      ].includes(projeto.etapa_funil) && (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Header className="bg-white border-bottom py-3">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-box-seam text-primary me-2"></i>Gestão de
              Pedidos (ERP)
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            <InputGroup className="mb-4 shadow-sm rounded">
              <Form.Control
                placeholder="Insira o N° do Pedido do ERP para vincular"
                value={numeroPedidoErp}
                onChange={(e) => {
                  setNumeroPedidoErp(e.target.value);
                  setImportError("");
                }}
                className="border-0 bg-light"
              />
              <Button
                variant="success"
                onClick={handleVerificarPedido}
                disabled={!numeroPedidoErp.trim() || importLoading}
                className="px-4"
              >
                {importLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>Verificar e Vincular
                  </>
                )}
              </Button>
            </InputGroup>
            {importError && (
              <Alert variant="danger" className="border-0 shadow-sm">
                {importError}
              </Alert>
            )}

            <h6 className="fw-bold mb-3 text-secondary mt-4">
              Pedidos Vinculados
            </h6>
            {projeto.pedidos && projeto.pedidos.length > 0 ? (
              <Accordion>
                {projeto.pedidos.map((p) => (
                  <PedidoAccordionItem
                    key={p.id}
                    projetoId={projeto.id}
                    pedidoVinculado={p}
                    onDesvincular={handleDesvincularPedido}
                  />
                ))}
              </Accordion>
            ) : (
              <div className="p-4 bg-light rounded text-center text-muted border border-light">
                Nenhum pedido vinculado a este projeto.
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* CARD DE DOCUMENTOS */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white border-bottom py-3">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
            Documentos do Projeto
          </h5>
        </Card.Header>
        <Card.Body className="p-4">
          <ListGroup variant="flush" className="mb-4 border rounded shadow-sm">
            {documentos.length > 0 ? (
              documentos.map((doc, index) => (
                <ListGroup.Item
                  key={doc.id}
                  className={`d-flex justify-content-between align-items-center py-3 ${index !== documentos.length - 1 ? "border-bottom" : "border-0"}`}
                >
                  <div className="d-flex align-items-center">
                    <i
                      className={`bi ${getFileIcon(doc.nome_original)} fs-4 me-3`}
                    ></i>{" "}
                    <button
                      onClick={() => handleAbrirDocumento(doc.id)}
                      className="btn btn-link p-0 text-decoration-none fw-semibold text-primary d-flex align-items-center"
                      style={{ boxShadow: "none" }}
                    >
                      {doc.nome_original}
                    </button>
                  </div>
                  <Button
                    variant="light"
                    size="sm"
                    className="text-danger shadow-sm border"
                    onClick={() => handleDeleteDocument(doc.id)}
                    title="Excluir"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item className="text-muted text-center py-4 border-0 bg-light">
                Nenhum documento anexado a este projeto.
              </ListGroup.Item>
            )}
          </ListGroup>

          <Form
            onSubmit={handleFileUpload}
            className="p-3 bg-light rounded border border-light"
          >
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-muted text-uppercase">
                Anexar Novo Documento
              </Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setFileToUpload(e.target.files[0])}
                className="shadow-sm border-0"
              />
            </Form.Group>
            <Button
              variant="secondary"
              type="submit"
              className="shadow-sm px-4"
            >
              <i className="bi bi-cloud-arrow-up me-2"></i>Enviar Documento
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* MODAIS */}
      {projeto && (
        <ProjetoFormModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          onSuccess={handleProjectUpdated}
          projetoParaEditar={projeto}
        />
      )}

      <Modal
        show={showLostModal}
        onHide={() => setShowLostModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="fw-bold text-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>Marcar
            Projeto como Perdido
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-dark">
            Tem certeza que deseja marcar o projeto{" "}
            <strong>"{projeto?.nome_projeto}"</strong> como perdido?
          </p>
          <Form.Group>
            <Form.Label className="fw-semibold small text-muted">
              Motivo da Perda (obrigatório)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={motivoPerda}
              onChange={(e) => setMotivoPerda(e.target.value)}
              className="shadow-sm"
              placeholder="Descreva brevemente por que o projeto foi perdido..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button
            variant="light"
            onClick={() => setShowLostModal(false)}
            className="shadow-sm border"
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleMarkAsLost}
            className="shadow-sm px-4"
          >
            Confirmar Perda
          </Button>
        </Modal.Footer>
      </Modal>

      <PedidoErpModal
        show={showPedidoModal}
        onHide={() => setShowPedidoModal(false)}
        pedido={pedidoImportado}
        isLinking={isLinking}
        onConfirmar={handleAtrelarPedido}
      />
    </div>
  );
};

export default DetalhesProjeto;
