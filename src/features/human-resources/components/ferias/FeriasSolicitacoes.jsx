import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Badge,
  Button,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
  InputGroup,
} from "react-bootstrap";
import {
  FaCheck,
  FaTimes,
  FaBan,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEye,
  FaClipboardList,
  FaExclamationTriangle,
} from "react-icons/fa";
import apiClient from "../../../../services/api";

// ─── helpers ────────────────────────────────────────────────
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");

const STATUS_META = {
  PENDENTE: { bg: "warning", text: "dark", label: "Pendente" },
  APROVADA: { bg: "success", text: null, label: "Aprovada" },
  RECUSADA: { bg: "danger", text: null, label: "Recusada" },
  CANCELADA: { bg: "secondary", text: null, label: "Cancelada" },
  CONCLUIDA: { bg: "info", text: "dark", label: "Concluída" },
  EM_GOZO: { bg: "primary", text: null, label: "Em gozo" },
};

const MODALIDADE_LABEL = {
  INTEGRAL: "🗓️ Integral",
  FRACIONADO: "✂️ Fracionado",
  COLETIVO: "👥 Coletivo",
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { bg: "light", text: "dark", label: status };
  return (
    <Badge
      bg={m.bg}
      text={m.text ?? undefined}
      className="fw-semibold px-2 py-1"
    >
      {m.label}
    </Badge>
  );
};

const anos = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

// ─── Modal Detalhe ───────────────────────────────────────────
const DetalheModal = ({ show, onHide, solicitacao }) => {
  if (!solicitacao) return null;
  const s = solicitacao;
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEye className="me-2 text-secondary" />
          Detalhe da Solicitação #{s.id}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={6}>
            <small className="text-muted d-block">Colaborador</small>
            <strong>{s.funcionario?.nome_completo}</strong>
            <div className="text-muted small">
              {s.funcionario?.cargo?.nome_cargo} —{" "}
              {s.funcionario?.setor?.nome_setor}
            </div>
          </Col>
          <Col md={3}>
            <small className="text-muted d-block">Status</small>
            <StatusBadge status={s.status} />
            {s.lancamento_manual && (
              <Badge bg="warning" text="dark" className="ms-1 small">
                Manual RH
              </Badge>
            )}
          </Col>
          <Col md={3}>
            <small className="text-muted d-block">Modalidade</small>
            <span>
              {MODALIDADE_LABEL[s.tipo_modalidade] ?? s.tipo_modalidade ?? "—"}
            </span>
          </Col>
          <Col md={4}>
            <small className="text-muted d-block">Início</small>
            <strong>{fmtDate(s.data_inicio)}</strong>
          </Col>
          <Col md={4}>
            <small className="text-muted d-block">Fim</small>
            <strong>{fmtDate(s.data_fim)}</strong>
          </Col>
          <Col md={4}>
            <small className="text-muted d-block">Dias de gozo</small>
            <strong>{s.dias_solicitados} dias</strong>
          </Col>
          {s.abono_pecuniario && (
            <Col md={4}>
              <small className="text-muted d-block">Abono pecuniário</small>
              <span>{s.dias_abono} dias</span>
            </Col>
          )}
          {s.adiantamento_decimo && (
            <Col md={4}>
              <small className="text-muted d-block">Adiantamento 13º</small>
              <span>Sim</span>
            </Col>
          )}
          {s.periodo_aquisitivo && (
            <Col md={12}>
              <small className="text-muted d-block">Período Aquisitivo</small>
              <span>
                {fmtDate(s.periodo_aquisitivo.data_inicio_pa)} →{" "}
                {fmtDate(s.periodo_aquisitivo.data_fim_pa)} (PC até{" "}
                {fmtDate(s.periodo_aquisitivo.data_fim_pc)})
              </span>
            </Col>
          )}
          {s.aprovador && (
            <Col md={6}>
              <small className="text-muted d-block">Aprovado por</small>
              <span>{s.aprovador.nome_completo}</span>
            </Col>
          )}
          {s.motivo_recusa && (
            <Col md={12}>
              <Alert variant="danger" className="py-2 mb-0 small">
                <strong>Motivo da recusa:</strong> {s.motivo_recusa}
              </Alert>
            </Col>
          )}
          {s.observacoes_rh && (
            <Col md={12}>
              <small className="text-muted d-block">Observações RH</small>
              <span className="small">{s.observacoes_rh}</span>
            </Col>
          )}
          {s.observacoes && (
            <Col md={12}>
              <small className="text-muted d-block">
                Observações do colaborador
              </small>
              <span className="small">{s.observacoes}</span>
            </Col>
          )}
          <Col md={6}>
            <small className="text-muted d-block">Criado em</small>
            <span className="small">{fmtDate(s.created_at)}</span>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Modal Aprovar ────────────────────────────────────────────
const AprovarModal = ({ show, onHide, solicitacao, onSuccess }) => {
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAprovar = async () => {
    setError(null);
    setLoading(true);
    try {
      await apiClient.put(`/ferias/solicitacoes/${solicitacao.id}/aprovar`, {
        observacoes_rh: obs,
      });
      onSuccess("Férias aprovadas com sucesso.");
      onHide();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao aprovar.");
    } finally {
      setLoading(false);
    }
  };

  if (!solicitacao) return null;
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-success-subtle">
        <Modal.Title>
          <FaCheck className="me-2" />
          Aprovar Férias
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p className="mb-1">
          Aprovar as férias de{" "}
          <strong>{solicitacao.funcionario?.nome_completo}</strong> de{" "}
          <strong>{fmtDate(solicitacao.data_inicio)}</strong> a{" "}
          <strong>{fmtDate(solicitacao.data_fim)}</strong> (
          {solicitacao.dias_solicitados} dias)?
        </p>
        <Form.Group className="mt-3">
          <Form.Label className="small">Observações (opcional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Alguma observação para o colaborador..."
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="success" onClick={handleAprovar} disabled={loading}>
          {loading ? (
            <Spinner size="sm" className="me-1" />
          ) : (
            <FaCheck className="me-1" />
          )}
          Confirmar Aprovação
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Modal Recusar ────────────────────────────────────────────
const RecusarModal = ({ show, onHide, solicitacao, onSuccess }) => {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRecusar = async () => {
    if (!motivo.trim()) {
      setError("O motivo da recusa é obrigatório.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await apiClient.put(`/ferias/solicitacoes/${solicitacao.id}/recusar`, {
        motivo_recusa: motivo,
      });
      onSuccess("Solicitação recusada.");
      onHide();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao recusar.");
    } finally {
      setLoading(false);
    }
  };

  if (!solicitacao) return null;
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-danger-subtle">
        <Modal.Title>
          <FaTimes className="me-2" />
          Recusar Solicitação
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p className="mb-1">
          Recusar as férias de{" "}
          <strong>{solicitacao.funcionario?.nome_completo}</strong>?
        </p>
        <Form.Group className="mt-2">
          <Form.Label className="small">
            Motivo da recusa <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Descreva o motivo para o colaborador..."
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Voltar
        </Button>
        <Button variant="danger" onClick={handleRecusar} disabled={loading}>
          {loading ? (
            <Spinner size="sm" className="me-1" />
          ) : (
            <FaTimes className="me-1" />
          )}
          Recusar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Modal Cancelar ───────────────────────────────────────────
const CancelarModal = ({ show, onHide, solicitacao, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancelar = async () => {
    setError(null);
    setLoading(true);
    try {
      await apiClient.put(`/ferias/solicitacoes/${solicitacao.id}/cancelar`);
      onSuccess("Solicitação cancelada e saldo estornado.");
      onHide();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao cancelar.");
    } finally {
      setLoading(false);
    }
  };

  if (!solicitacao) return null;
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-secondary-subtle">
        <Modal.Title>
          <FaBan className="me-2" />
          Cancelar Férias
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Alert variant="warning" className="small">
          <FaExclamationTriangle className="me-1" />
          Se estas férias já foram <strong>aprovadas</strong>, o saldo será
          automaticamente <strong>estornado</strong> ao período aquisitivo.
        </Alert>
        <p>
          Cancelar as férias de{" "}
          <strong>{solicitacao.funcionario?.nome_completo}</strong> (
          {fmtDate(solicitacao.data_inicio)} → {fmtDate(solicitacao.data_fim)})?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Voltar
        </Button>
        <Button
          variant="outline-danger"
          onClick={handleCancelar}
          disabled={loading}
        >
          {loading ? (
            <Spinner size="sm" className="me-1" />
          ) : (
            <FaBan className="me-1" />
          )}
          Cancelar férias
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Componente principal ────────────────────────────────────
const FeriasSolicitacoes = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [busca, setBusca] = useState("");

  // Modais
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [showDetalhe, setShowDetalhe] = useState(false);
  const [showAprovar, setShowAprovar] = useState(false);
  const [showRecusar, setShowRecusar] = useState(false);
  const [showCancelar, setShowCancelar] = useState(false);

  const fetchSolicitacoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtroStatus) params.set("status", filtroStatus);
      if (filtroAno) params.set("ano", filtroAno);
      const { data } = await apiClient.get(`/ferias/solicitacoes?${params}`);

      // 🚀 INÍCIO DA PROTEÇÃO
      if (Array.isArray(data)) {
        setSolicitacoes(data);
      } else if (data && Array.isArray(data.data)) {
        setSolicitacoes(data.data);
      } else {
        console.warn(
          "Aviso: A API não retornou uma lista de solicitações:",
          data,
        );
        setSolicitacoes([]);
      }
      // 🚀 FIM DA PROTEÇÃO
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao carregar solicitações.");
    } finally {
      setLoading(false);
    }
  }, [filtroStatus, filtroAno]);

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  const abrirModal = (modal, sol) => {
    setSolicitacaoSelecionada(sol);
    if (modal === "detalhe") setShowDetalhe(true);
    if (modal === "aprovar") setShowAprovar(true);
    if (modal === "recusar") setShowRecusar(true);
    if (modal === "cancelar") setShowCancelar(true);
  };

  const handleSuccess = (msg) => {
    setSuccessMessage(msg);
    fetchSolicitacoes();
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Filtro de busca local (por nome do colaborador)
  // 🚀 Cria uma variável segura garantindo que seja um array
  const safeSolicitacoes = Array.isArray(solicitacoes) ? solicitacoes : [];

  // Filtro de busca local (por nome do colaborador)
  const lista = busca.trim()
    ? safeSolicitacoes.filter((s) =>
        s.funcionario?.nome_completo
          ?.toLowerCase()
          .includes(busca.toLowerCase()),
      )
    : safeSolicitacoes;

  const pendentes = safeSolicitacoes.filter(
    (s) => s.status === "PENDENTE",
  ).length;

  return (
    <div>
      {/* ── Cabeçalho ── */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-0 fw-semibold">
            <FaClipboardList className="me-2 text-primary" />
            Solicitações de Férias
          </h5>
          {pendentes > 0 && (
            <small className="text-warning fw-semibold">
              ⚠️ {pendentes} solicitação{pendentes > 1 ? "ões" : ""} aguardando
              aprovação
            </small>
          )}
        </div>
      </div>

      {/* ── Feedback ── */}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ── Filtros ── */}
      <Row className="g-2 mb-3 align-items-end">
        <Col xs={12} md={4}>
          <InputGroup size="sm">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar colaborador..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs={6} md={3}>
          <Form.Select
            size="sm"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={6} md={2}>
          <Form.Select
            size="sm"
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
          >
            {anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md={3} className="text-md-end">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={fetchSolicitacoes}
            className="me-2"
          >
            <FaFilter className="me-1" />
            Atualizar
          </Button>
        </Col>
      </Row>

      {/* ── Tabela ── */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2 small">Carregando solicitações...</p>
        </div>
      ) : lista.length === 0 ? (
        <Alert variant="light" className="text-center py-4 border">
          <FaClipboardList className="text-muted mb-2" size={28} />
          <p className="mb-0 text-muted">
            Nenhuma solicitação encontrada para os filtros selecionados.
          </p>
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Colaborador</th>
                <th>Período</th>
                <th className="text-center">Dias</th>
                <th>Modalidade</th>
                <th className="text-center">Abono</th>
                <th>Status</th>
                <th>Aprovador</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((s) => (
                <tr
                  key={s.id}
                  className={s.status === "PENDENTE" ? "table-warning" : ""}
                >
                  <td className="text-muted">{s.id}</td>
                  <td>
                    <div className="fw-semibold">
                      {s.funcionario?.nome_completo}
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {s.funcionario?.cargo?.nome_cargo}
                    </div>
                  </td>
                  <td>
                    <span className="text-nowrap">
                      {fmtDate(s.data_inicio)} → {fmtDate(s.data_fim)}
                    </span>
                  </td>
                  <td className="text-center fw-semibold">
                    {s.dias_solicitados}
                  </td>
                  <td>
                    <span className="text-nowrap">
                      {MODALIDADE_LABEL[s.tipo_modalidade] ?? "—"}
                    </span>
                    {s.lancamento_manual && (
                      <Badge
                        bg="warning"
                        text="dark"
                        className="ms-1"
                        style={{ fontSize: "0.65rem" }}
                      >
                        Manual
                      </Badge>
                    )}
                  </td>
                  <td className="text-center">
                    {s.abono_pecuniario ? (
                      <Badge bg="info" text="dark">
                        {s.dias_abono}d
                      </Badge>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="text-muted">
                    {s.aprovador?.nome_completo ?? "—"}
                  </td>
                  <td className="text-end text-nowrap">
                    {/* Detalhe sempre disponível */}
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-1"
                      title="Ver detalhes"
                      onClick={() => abrirModal("detalhe", s)}
                    >
                      <FaEye />
                    </Button>

                    {/* Aprovar / Recusar — apenas PENDENTE */}
                    {s.status === "PENDENTE" && (
                      <>
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="me-1"
                          title="Aprovar"
                          onClick={() => abrirModal("aprovar", s)}
                        >
                          <FaCheck />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          title="Recusar"
                          onClick={() => abrirModal("recusar", s)}
                        >
                          <FaTimes />
                        </Button>
                      </>
                    )}

                    {/* Cancelar — PENDENTE ou APROVADA */}
                    {["PENDENTE", "APROVADA"].includes(s.status) && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="ms-1"
                        title="Cancelar"
                        onClick={() => abrirModal("cancelar", s)}
                      >
                        <FaBan />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="text-muted small mt-2 ps-1">
            {lista.length} solicitaç{lista.length === 1 ? "ão" : "ões"}{" "}
            encontrada{lista.length === 1 ? "" : "s"}
          </div>
        </div>
      )}

      {/* ── Modais ── */}
      <DetalheModal
        show={showDetalhe}
        onHide={() => setShowDetalhe(false)}
        solicitacao={solicitacaoSelecionada}
      />
      <AprovarModal
        show={showAprovar}
        onHide={() => setShowAprovar(false)}
        solicitacao={solicitacaoSelecionada}
        onSuccess={handleSuccess}
      />
      <RecusarModal
        show={showRecusar}
        onHide={() => setShowRecusar(false)}
        solicitacao={solicitacaoSelecionada}
        onSuccess={handleSuccess}
      />
      <CancelarModal
        show={showCancelar}
        onHide={() => setShowCancelar(false)}
        solicitacao={solicitacaoSelecionada}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default FeriasSolicitacoes;
