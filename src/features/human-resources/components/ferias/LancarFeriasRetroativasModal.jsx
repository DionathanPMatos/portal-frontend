import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import apiClient from "../../../../services/api";

const MODALIDADES = [
  { value: "INTEGRAL", label: "🗓️ Férias Integrais (30 dias)" },
  { value: "FRACIONADO", label: "✂️ Fracionamento (até 3 períodos)" },
  { value: "COLETIVO", label: "👥 Férias Coletivas" },
];

const LancarFeriasRetroativasModal = ({
  show,
  onHide,
  funcionarioId,
  onSuccess,
}) => {
  const [periodos, setPeriodos] = useState([]);
  const [form, setForm] = useState({
    periodo_aquisitivo_id: "",
    data_inicio: "",
    data_fim: "",
    tipo_modalidade: "INTEGRAL",
    abono_pecuniario: false,
    dias_abono: 0,
    adiantamento_decimo: false,
    observacoes: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [error, setError] = useState(null);
  const [diasCalculados, setDiasCalculados] = useState(null);

  // Carrega períodos aquisitivos ao abrir
  useEffect(() => {
    if (!show || !funcionarioId) return;
    setLoadingPeriodos(true);
    setError(null);

    // Coloquei /api/ferias/ pois em alguns locais do seu código usa-se o /api explícito
    apiClient
      .get(`/api/ferias/funcionarios/${funcionarioId}/periodos-aquisitivos`)
      .then((res) => {
        console.log("🔍 Dados dos Períodos recebidos da API:", res.data); // O nosso detetive!

        if (Array.isArray(res.data)) {
          setPeriodos(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setPeriodos(res.data.data);
        } else {
          console.warn("⚠️ API não devolveu uma lista válida:", res.data);
          setPeriodos([]);
        }
      })
      .catch((err) => {
        console.error("❌ Erro ao buscar períodos:", err);
        setError("Erro ao carregar períodos aquisitivos.");
      })
      .finally(() => setLoadingPeriodos(false));
  }, [show, funcionarioId]);

  // Calcula dias automaticamente ao alterar datas
  useEffect(() => {
    if (form.data_inicio && form.data_fim) {
      const inicio = new Date(form.data_inicio);
      const fim = new Date(form.data_fim);
      if (fim >= inicio) {
        const diff = Math.round((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;
        setDiasCalculados(diff);
      } else {
        setDiasCalculados(null);
      }
    }
  }, [form.data_inicio, form.data_fim]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      // 🚀 1. Prepara e converte os dados antes de enviar para o backend
      const payload = {
        ...form,
        // Converte o ID do período de String para Inteiro
        periodo_aquisitivo_id: parseInt(form.periodo_aquisitivo_id, 10),
        // Garante que dias de abono seja Inteiro (e zera se o switch estiver desligado)
        dias_abono: form.abono_pecuniario ? parseInt(form.dias_abono, 10) : 0,
      };

      // 🚀 2. Adicionado o /api no início da rota
      await apiClient.post(
        `/api/ferias/funcionarios/${funcionarioId}/lancar-retroativo`,
        payload,
      );

      onSuccess?.();
      onHide();
    } catch (err) {
      // 🚀 3. Coloquei um console.log aqui para, se der erro, sabermos exatamente o motivo
      console.error(
        "❌ Erro ao salvar férias retroativas:",
        err.response || err,
      );
      setError(err.response?.data?.error || "Erro ao lançar férias.");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Garante que é um array
  const safePeriodos = Array.isArray(periodos) ? periodos : [];
  const paSelecionado = safePeriodos.find(
    (p) => p.id === parseInt(form.periodo_aquisitivo_id, 10),
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton className="bg-warning-subtle">
        <Modal.Title>📋 Lançar Férias Retroativas</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Alert variant="info" className="small">
          <strong>Lançamento manual pelo RH.</strong> Use este formulário para
          registrar férias que o colaborador <u>já gozou</u>. O saldo será
          debitado automaticamente do período aquisitivo selecionado e o
          registro entrará direto no histórico como <strong>Concluído</strong>.
        </Alert>

        {loadingPeriodos ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <Row className="g-3">
            {/* Período Aquisitivo */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label>
                  Período Aquisitivo <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="periodo_aquisitivo_id"
                  value={form.periodo_aquisitivo_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione o período...</option>
                  {safePeriodos.map((pa) => (
                    <option key={pa.id} value={pa.id}>
                      {`${new Date(pa.data_inicio_pa).toLocaleDateString("pt-BR")} → ${new Date(pa.data_fim_pa).toLocaleDateString("pt-BR")}`}
                      {` | Saldo: ${pa.dias_saldo} dias | ${pa.status}`}
                    </option>
                  ))}
                </Form.Select>
                {paSelecionado && (
                  <Form.Text className="text-muted">
                    Período concessivo até{" "}
                    <strong>
                      {new Date(paSelecionado.data_fim_pc).toLocaleDateString(
                        "pt-BR",
                      )}
                    </strong>
                    . Saldo disponível:{" "}
                    <strong>{paSelecionado.dias_saldo} dias</strong>.
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            {/* Modalidade */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  Modalidade <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="tipo_modalidade"
                  value={form.tipo_modalidade}
                  onChange={handleChange}
                >
                  {MODALIDADES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  {form.tipo_modalidade === "FRACIONADO" &&
                    "Mín. 5 dias por fração; ao menos 1 fração com ≥ 14 dias."}
                  {form.tipo_modalidade === "COLETIVO" &&
                    "Mín. 10 dias por período; máx. 2 períodos coletivos."}
                  {form.tipo_modalidade === "INTEGRAL" &&
                    "Férias completas de 30 dias de uma única vez."}
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Datas */}
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label>
                  Data de Início <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="data_inicio"
                  value={form.data_inicio}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label>
                  Data de Fim <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="data_fim"
                  value={form.data_fim}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            {/* Dias calculados */}
            {diasCalculados && (
              <Col xs={12}>
                <Alert variant="secondary" className="py-2 mb-0">
                  📅 Período: <strong>{diasCalculados} dias corridos</strong>
                  {form.abono_pecuniario &&
                    parseInt(form.dias_abono) > 0 &&
                    ` + ${form.dias_abono} dias de abono = ${diasCalculados + parseInt(form.dias_abono)} dias debitados do saldo.`}
                </Alert>
              </Col>
            )}

            {/* Abono Pecuniário */}
            <Col xs={12} md={6}>
              <Form.Check
                type="switch"
                id="abono_pecuniario"
                name="abono_pecuniario"
                label="💰 Abono pecuniário (venda de férias)"
                checked={form.abono_pecuniario}
                onChange={handleChange}
              />
              {form.abono_pecuniario && (
                <Form.Group className="mt-2">
                  <Form.Label>Dias vendidos (máx. 10)</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={10}
                    name="dias_abono"
                    value={form.dias_abono}
                    onChange={handleChange}
                  />
                </Form.Group>
              )}
            </Col>

            {/* Adiantamento 13º */}
            <Col xs={12} md={6}>
              <Form.Check
                type="switch"
                id="adiantamento_decimo"
                name="adiantamento_decimo"
                label="🎄 Adiantamento do 13º salário"
                checked={form.adiantamento_decimo}
                onChange={handleChange}
              />
            </Col>

            {/* Observações */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label>
                  Observações / Justificativa do lançamento
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="observacoes"
                  value={form.observacoes}
                  onChange={handleChange}
                  placeholder="Ex: Férias gozadas em 2023 registradas retroativamente conforme recibo assinado."
                />
              </Form.Group>
            </Col>
          </Row>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="warning"
          onClick={handleSubmit}
          disabled={
            loading ||
            !form.periodo_aquisitivo_id ||
            !form.data_inicio ||
            !form.data_fim
          }
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Lançando...
            </>
          ) : (
            "✅ Confirmar Lançamento"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LancarFeriasRetroativasModal;
