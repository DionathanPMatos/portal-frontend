import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Spinner,
  Alert,
  Button,
  Breadcrumb,
  Row,
  Col,
  Card,
  Tabs,
  Tab,
  Table,
  Modal,
  Form,
  InputGroup,
  Badge,
} from "react-bootstrap";
import apiClient from "../../../../services/api";

const onlyDigits = (v = "") => String(v ?? "").replace(/\D/g, "");
const formatDateBR = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("pt-BR");
};

const emptyCliente = {
  nome_cliente: "",
  razao_social: "",
  nome_fantasia: "",
  cnpj_cpf: "",
  cnpj_matriz: "",
  inscricao_estadual: "",
  site: "",
  observacoes: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  // caso você já tenha:
  perfil: "",
  segmento: "",
};

const emptyContato = {
  id: null,
  cliente_id: null,
  nome: "",
  cargo: "",
  email: "",
  telefone: "",
  whatsapp: "",
  principal: 0,
  observacoes: "",
};

const emptyFilial = {
  id: null,
  cliente_id: null,
  cnpj_filial: "",
  razao_social: "",
  nome_fantasia: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};

const getStatusVariant = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("bom") || s.includes("aprovado") || s.includes("verde") || s.includes("positivo")) return "success";
  if (s.includes("alerta") || s.includes("amarelo") || s.includes("pendente")) return "warning";
  if (s.includes("ruim") || s.includes("reprovado") || s.includes("vermelho") || s.includes("bloqueado")) return "danger";
  return "secondary";
};

function ClienteEditModal({ show, onHide, value, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(emptyCliente);

  useEffect(() => {
    setErr("");
    setData({ ...emptyCliente, ...(value || {}) });
  }, [value, show]);

  const setField = (k, v) => setData((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setErr("");
    setSaving(true);
    try {
      const payload = {
        ...data,
        cnpj_cpf: onlyDigits(data.cnpj_cpf),
        cnpj_matriz: onlyDigits(data.cnpj_matriz),
        cep: onlyDigits(data.cep),
        uf: String(data.uf || "").toUpperCase().slice(0, 2),
      };

      if (!payload.nome_cliente?.trim()) {
        setErr("O campo 'Nome do Cliente' é obrigatório.");
        setSaving(false);
        return;
      }

      await apiClient.put(`/api/clientes/${value.id}`, payload);
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
        <Modal.Title>Editar Cliente</Modal.Title>
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
              <Form.Label>CNPJ/CPF</Form.Label>
              <Form.Control
                value={data.cnpj_cpf || ""}
                onChange={(e) => setField("cnpj_cpf", e.target.value)}
              />
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
                placeholder="Ex: Energia, Data Center, Indústria..."
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
                <option value="Cliente Final">Cliente Final</option>
                <option value="Distribuidor">Distribuidor</option>
                <option value="Integrador">Integrador</option>
                <option value="Revenda">Revenda</option>
                <option value="Fabricante">Fabricante</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Site</Form.Label>
              <Form.Control
                value={data.site || ""}
                onChange={(e) => setField("site", e.target.value)}
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

function ContatoModal({ show, onHide, value, clienteId, onSaved }) {
  const isEdit = Boolean(value?.id);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(emptyContato);

  useEffect(() => {
    setErr("");
    setData({ ...emptyContato, ...(value || {}), cliente_id: clienteId });
  }, [value, show, clienteId]);

  const setField = (k, v) => setData((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setErr("");
    setSaving(true);
    try {
      const payload = {
        ...data,
        cliente_id: clienteId,
        principal: data.principal ? 1 : 0,
      };

      if (!payload.nome?.trim()) {
        setErr("Nome do contato é obrigatório.");
        setSaving(false);
        return;
      }

      if (isEdit) {
        await apiClient.put(`/api/contatos/${value.id}`, payload);
      } else {
        await apiClient.post(`/api/contatos`, payload);
      }

      onSaved?.();
      onHide?.();
    } catch (e) {
      console.error(e);
      setErr("Falha ao salvar contato.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar Contato" : "Novo Contato"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}
        <Row className="g-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Nome</Form.Label>
              <Form.Control
                value={data.nome || ""}
                onChange={(e) => setField("nome", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group>
              <Form.Label>Cargo</Form.Label>
              <Form.Control
                value={data.cargo || ""}
                onChange={(e) => setField("cargo", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={data.email || ""}
                onChange={(e) => setField("email", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                value={data.telefone || ""}
                onChange={(e) => setField("telefone", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>WhatsApp</Form.Label>
              <Form.Control
                value={data.whatsapp || ""}
                onChange={(e) => setField("whatsapp", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Check
              type="checkbox"
              label="Contato principal"
              checked={Boolean(data.principal)}
              onChange={(e) => setField("principal", e.target.checked ? 1 : 0)}
            />
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

function FilialModal({ show, onHide, value, clienteId, onSaved }) {
  const isEdit = Boolean(value?.id);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [data, setData] = useState(emptyFilial);

  useEffect(() => {
    setErr("");
    setSuccess("");
    setData({ ...emptyFilial, ...(value || {}), cliente_id: clienteId });
  }, [value, show, clienteId]);

  const setField = (k, v) => setData((s) => ({ ...s, [k]: v }));

  const importarCNPJFilial = async () => {
    setErr("");
    setSuccess("");
    try {
      const cnpj = onlyDigits(data.cnpj_filial);
      if (cnpj.length !== 14) {
        setErr("CNPJ inválido (precisa ter 14 dígitos).");
        return;
      }
      const r = await apiClient.get(`/api/utils/cnpj/${cnpj}`);
      const d = r.data || {};
      setData((s) => ({
        ...s,
        cnpj_filial: d.cnpj || cnpj,
        razao_social: d.razao_social || s.razao_social || "",
        nome_fantasia: d.nome_fantasia || s.nome_fantasia || "",
        cep: d.cep || s.cep || "",
        logradouro: d.logradouro || s.logradouro || "",
        numero: d.numero || s.numero || "",
        complemento: d.complemento || s.complemento || "",
        bairro: d.bairro || s.bairro || "",
        cidade: d.cidade || s.cidade || "",
        uf: d.uf || s.uf || "",
      }));
      setSuccess("Dados importados pelo CNPJ da filial.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (e) {
      console.error(e);
      setErr("Falha ao consultar CNPJ da filial.");
    }
  };

  const buscarCEPFilial = async () => {
    setErr("");
    setSuccess("");
    try {
      const cep = onlyDigits(data.cep);
      if (cep.length !== 8) {
        setErr("CEP inválido (precisa ter 8 dígitos).");
        return;
      }
      const r = await apiClient.get(`/api/utils/cep/${cep}`);
      const d = r.data || {};
      setData((s) => ({
        ...s,
        cep: d.cep || cep,
        logradouro: d.logradouro || "",
        bairro: d.bairro || "",
        cidade: d.cidade || "",
        uf: d.uf || "",
      }));
      setSuccess("Endereço da filial atualizado pelo CEP.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (e) {
      console.error(e);
      setErr("Falha ao consultar CEP da filial.");
    }
  };

  const handleSave = async () => {
    setErr("");
    setSaving(true);
    try {
      const payload = {
        ...data,
        cliente_id: clienteId,
        cnpj_filial: onlyDigits(data.cnpj_filial),
        cep: onlyDigits(data.cep),
        uf: String(data.uf || "").toUpperCase().slice(0, 2),
      };

      if (!payload.cnpj_filial || payload.cnpj_filial.length !== 14) {
        setErr("CNPJ da filial é obrigatório (14 dígitos).");
        setSaving(false);
        return;
      }

      // Backend sugerido: POST /api/clientes/:id/filiais (upsert)
      await apiClient.post(`/api/clientes/${clienteId}/filiais`, payload);

      onSaved?.();
      onHide?.();
    } catch (e) {
      console.error(e);
      setErr("Falha ao salvar filial.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar Filial" : "Nova Filial"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>CNPJ da Filial</Form.Label>
              <InputGroup>
                <Form.Control
                  value={data.cnpj_filial || ""}
                  onChange={(e) => setField("cnpj_filial", e.target.value)}
                />
                <Button variant="outline-primary" onClick={importarCNPJFilial}>
                  Importar
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>CEP</Form.Label>
              <InputGroup>
                <Form.Control
                  value={data.cep || ""}
                  onChange={(e) => setField("cep", e.target.value)}
                />
                <Button variant="outline-primary" onClick={buscarCEPFilial}>
                  Buscar
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

          <Col md={4}>
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

          <Col md={3}>
            <Form.Group>
              <Form.Label>UF</Form.Label>
              <Form.Control
                value={data.uf || ""}
                onChange={(e) => setField("uf", e.target.value)}
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

export default function ClientDetailPage() { // Renomeado
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [cliente, setCliente] = useState(null);
  const [contatos, setContatos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [interacoes, setInteracoes] = useState([]);

  const [showEdit, setShowEdit] = useState(false);

  const [showContato, setShowContato] = useState(false);
  const [editingContato, setEditingContato] = useState(null);

  // ===== FILIAIS =====
  const [filiais, setFiliais] = useState([]);
  const [showFilialModal, setShowFilialModal] = useState(false);
  const [editingFilial, setEditingFilial] = useState(null);

  const fetchAll = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/clientes/${id}`);
      setCliente(res.data?.cliente || null);
      setContatos(res.data?.contatos || []);
      setProjetos(res.data?.projetos || []);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401) {
        navigate("/");
        return;
      }
      setErr("Erro ao carregar cliente.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFiliais = async () => {
    try {
      const r = await apiClient.get(`/api/clientes/${id}/filiais`);
      setFiliais(r.data || []);
    } catch (e) {
      // não quebra a tela se backend ainda não tiver filial
      console.warn("Filiais indisponível (rota não implementada ainda?)", e);
      setFiliais([]);
    }
  };

  const fetchInteracoes = async () => {
    try {
      const res = await apiClient.get(`/api/clientes/${id}/interacoes`);
      setInteracoes(res.data || []);
    } catch (e) {
      console.error("Erro ao buscar interações", e);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchFiliais();
    fetchInteracoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const headerTitle = useMemo(() => {
    const nome = cliente?.nome_cliente || "Cliente";
    const cnpj = cliente?.cnpj_cpf ? ` • ${cliente.cnpj_cpf}` : "";
    return `${nome}${cnpj}`;
  }, [cliente]);

  const handleInativar = async () => {
    if (!window.confirm("Inativar este cliente?")) return;
    setErr("");
    setSuccess("");
    try {
      await apiClient.delete(`/api/clientes/${id}`);
      setSuccess("Cliente inativado.");
      setTimeout(() => navigate("/crm/clientes"), 700);
    } catch (e) {
      console.error(e);
      setErr("Falha ao inativar cliente.");
    }
  };

  const handleDeleteContato = async (contatoId) => {
    if (!window.confirm("Excluir este contato?")) return;
    setErr("");
    setSuccess("");
    try {
      await apiClient.delete(`/api/contatos/${contatoId}`);
      setSuccess("Contato removido.");
      fetchAll();
      setTimeout(() => setSuccess(""), 2000);
    } catch (e) {
      console.error(e);
      setErr("Falha ao remover contato.");
    }
  };

  const handleDeleteFilial = async (filialId) => {
    if (!window.confirm("Excluir esta filial?")) return;
    setErr("");
    setSuccess("");
    try {
      await apiClient.delete(`/api/clientes/filiais/${filialId}`);
      setSuccess("Filial removida.");
      fetchFiliais();
      setTimeout(() => setSuccess(""), 2000);
    } catch (e) {
      console.error(e);
      setErr("Falha ao remover filial.");
    }
  };

  const buscarCEP = async () => {
    setErr("");
    setSuccess("");
    try {
      const cep = onlyDigits(cliente?.cep);
      if (cep.length !== 8) {
        setErr("CEP inválido (precisa ter 8 dígitos).");
        return;
      }
      const r = await apiClient.get(`/api/utils/cep/${cep}`);
      const d = r.data || {};
      const updated = {
        ...cliente,
        cep: d.cep || cep,
        logradouro: d.logradouro || "",
        bairro: d.bairro || "",
        cidade: d.cidade || "",
        uf: d.uf || "",
      };
      setCliente(updated);

      await apiClient.put(`/api/clientes/${id}`, {
        ...updated,
        cnpj_cpf: onlyDigits(updated.cnpj_cpf),
        cnpj_matriz: onlyDigits(updated.cnpj_matriz),
        cep: onlyDigits(updated.cep),
        uf: String(updated.uf || "").toUpperCase().slice(0, 2),
      });

      setSuccess("Endereço atualizado pelo CEP.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (e) {
      console.error(e);
      setErr("Falha ao consultar CEP.");
    }
  };

  const importarCNPJ = async () => {
    setErr("");
    setSuccess("");
    try {
      const cnpj = onlyDigits(cliente?.cnpj_cpf);
      if (cnpj.length !== 14) {
        setErr("CNPJ inválido (precisa ter 14 dígitos).");
        return;
      }
      const r = await apiClient.get(`/api/utils/cnpj/${cnpj}`);
      const d = r.data || {};
      const updated = {
        ...cliente,
        cnpj_cpf: d.cnpj || cnpj,
        razao_social: d.razao_social || cliente?.razao_social || "",
        nome_fantasia: d.nome_fantasia || cliente?.nome_fantasia || "",
        cep: d.cep || cliente?.cep || "",
        logradouro: d.logradouro || cliente?.logradouro || "",
        numero: d.numero || cliente?.numero || "",
        complemento: d.complemento || cliente?.complemento || "",
        bairro: d.bairro || cliente?.bairro || "",
        cidade: d.cidade || cliente?.cidade || "",
        uf: d.uf || cliente?.uf || "",
      };
      setCliente(updated);

      await apiClient.put(`/api/clientes/${id}`, {
        ...updated,
        cnpj_cpf: onlyDigits(updated.cnpj_cpf),
        cnpj_matriz: onlyDigits(updated.cnpj_matriz),
        cep: onlyDigits(updated.cep),
        uf: String(updated.uf || "").toUpperCase().slice(0, 2),
      });

      setSuccess("Dados importados pelo CNPJ.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (e) {
      console.error(e);
      setErr("Falha ao consultar CNPJ.");
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!cliente) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{err || "Cliente não encontrado."}</Alert>
        <Button variant="secondary" onClick={() => navigate("/crm/clientes")}>
          Voltar
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/crm" }}>
          CRM
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/crm/clientes" }}>
          Clientes
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{cliente?.nome_cliente || "Detalhes"}</Breadcrumb.Item>
      </Breadcrumb>

      {err && <Alert variant="danger">{err}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="align-items-center mb-3">
        <Col>
          <h4 className="mb-0">
            {headerTitle}
            {cliente.tier_estrategico && (
              <Badge bg="info" className="ms-2">{cliente.tier_estrategico}</Badge>
            )}
            {cliente.status_credito && (
              <Badge bg={getStatusVariant(cliente.status_credito)} className="ms-2">{cliente.status_credito}</Badge>
            )}
          </h4>
          <div className="text-muted">
            Criado em: {formatDateBR(cliente.created_at)} • Atualizado:{" "}
            {formatDateBR(cliente.updated_at)}
          </div>
        </Col>
        <Col className="text-end">
          <Button variant="outline-secondary" className="me-2" onClick={() => navigate("/crm/clientes")}>
            Voltar
          </Button>
          <Button variant="outline-primary" className="me-2" onClick={() => setShowEdit(true)}>
            Editar Cliente
          </Button>
          <Button variant="outline-danger" onClick={handleInativar}>
            Inativar
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Tabs defaultActiveKey="dados" className="mb-3" mountOnEnter unmountOnExit>
            <Tab eventKey="dados" title="Dados">
              <Row className="g-3">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Razão Social:</strong> {cliente.razao_social || "-"}
                      </div>
                      <div className="mb-2">
                        <strong>Nome Fantasia:</strong> {cliente.nome_fantasia || "-"}
                      </div>
                      <div className="mb-2">
                        <strong>CNPJ/CPF:</strong> {cliente.cnpj_cpf || "-"}
                      </div>
                      <div className="mb-2">
                        <strong>Segmento:</strong> {cliente.segmento || "-"}
                      </div>
                      <div className="mb-2">
                        <strong>Perfil:</strong> {cliente.perfil || "-"}
                      </div>
                      <div className="mb-2">
                        <strong>Site:</strong>{" "}
                        {cliente.site ? (
                          <a href={cliente.site} target="_blank" rel="noreferrer">
                            {cliente.site}
                          </a>
                        ) : (
                          "-"
                        )}
                      </div>
                      <div>
                        <strong>Observações:</strong>
                        <div className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
                          {cliente.observacoes || "-"}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Endereço:</strong>
                      </div>
                      <div className="text-muted">
                        {cliente.logradouro || "-"}
                        {cliente.numero ? `, ${cliente.numero}` : ""}
                        {cliente.bairro ? ` • ${cliente.bairro}` : ""}
                        <br />
                        {cliente.cidade || "-"}
                        {cliente.uf ? `/${cliente.uf}` : ""}{" "}
                        {cliente.cep ? ` • CEP: ${cliente.cep}` : ""}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="contatos" title={`Contatos (${contatos.length})`}>
              <div className="d-flex justify-content-end mb-3">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingContato({ ...emptyContato, cliente_id: cliente.id });
                    setShowContato(true);
                  }}
                >
                  + Novo Contato
                </Button>
              </div>

              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cargo</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>WhatsApp</th>
                    <th>Principal</th>
                    <th style={{ width: 160 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contatos.length > 0 ? (
                    contatos.map((c) => (
                      <tr key={c.id}>
                        <td>{c.nome}</td>
                        <td>{c.cargo || "-"}</td>
                        <td>{c.email || "-"}</td>
                        <td>{c.telefone || "-"}</td>
                        <td>{c.whatsapp || "-"}</td>
                        <td>{c.principal ? <Badge bg="success">Sim</Badge> : "-"}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="me-2"
                            onClick={() => {
                              setEditingContato({ ...c, cliente_id: cliente.id });
                              setShowContato(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteContato(c.id)}
                          >
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center">
                        Nenhum contato cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="endereco" title="Endereço">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>CNPJ (para importar)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        value={cliente.cnpj_cpf || ""}
                        onChange={(e) =>
                          setCliente((s) => ({ ...s, cnpj_cpf: e.target.value }))
                        }
                      />
                      <Button variant="outline-primary" onClick={importarCNPJ}>
                        Importar
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>CEP (para buscar)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        value={cliente.cep || ""}
                        onChange={(e) =>
                          setCliente((s) => ({ ...s, cep: e.target.value }))
                        }
                      />
                      <Button variant="outline-primary" onClick={buscarCEP}>
                        Buscar
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Logradouro</Form.Label>
                    <Form.Control
                      value={cliente.logradouro || ""}
                      onChange={(e) =>
                        setCliente((s) => ({ ...s, logradouro: e.target.value }))
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Nº</Form.Label>
                    <Form.Control
                      value={cliente.numero || ""}
                      onChange={(e) =>
                        setCliente((s) => ({ ...s, numero: e.target.value }))
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Complemento</Form.Label>
                    <Form.Control
                      value={cliente.complemento || ""}
                      onChange={(e) =>
                        setCliente((s) => ({ ...s, complemento: e.target.value }))
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Bairro</Form.Label>
                    <Form.Control
                      value={cliente.bairro || ""}
                      onChange={(e) =>
                        setCliente((s) => ({ ...s, bairro: e.target.value }))
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Cidade</Form.Label>
                    <Form.Control
                      value={cliente.cidade || ""}
                      onChange={(e) =>
                        setCliente((s) => ({ ...s, cidade: e.target.value }))
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>UF</Form.Label>
                    <Form.Control
                      value={cliente.uf || ""}
                      onChange={(e) =>
                        setCliente((s) => ({ ...s, uf: e.target.value }))
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={12} className="text-end">
                  <Button
                    variant="primary"
                    onClick={async () => {
                      setErr("");
                      setSuccess("");
                      try {
                        const updated = {
                          ...cliente,
                          cnpj_cpf: onlyDigits(cliente.cnpj_cpf),
                          cnpj_matriz: onlyDigits(cliente.cnpj_matriz),
                          cep: onlyDigits(cliente.cep),
                          uf: String(cliente.uf || "").toUpperCase().slice(0, 2),
                        };
                        await apiClient.put(`/api/clientes/${id}`, updated);
                        setSuccess("Endereço salvo.");
                        setTimeout(() => setSuccess(""), 2500);
                        fetchAll();
                      } catch (e) {
                        console.error(e);
                        setErr("Falha ao salvar endereço.");
                      }
                    }}
                  >
                    Salvar Endereço
                  </Button>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="filiais" title={`Filiais (${filiais.length})`}>
              <div className="d-flex justify-content-end mb-3">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingFilial(null);
                    setShowFilialModal(true);
                  }}
                >
                  + Nova Filial
                </Button>
              </div>

              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>CNPJ</th>
                    <th>Nome Fantasia</th>
                    <th>Cidade</th>
                    <th>UF</th>
                    <th style={{ width: 180 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filiais.length > 0 ? (
                    filiais.map((f) => (
                      <tr key={f.id}>
                        <td>{f.cnpj_filial || "-"}</td>
                        <td>{f.nome_fantasia || "-"}</td>
                        <td>{f.cidade || "-"}</td>
                        <td>{f.uf || "-"}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="me-2"
                            onClick={() => {
                              setEditingFilial(f);
                              setShowFilialModal(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteFilial(f.id)}
                          >
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Nenhuma filial cadastrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="projetos" title={`Projetos (${projetos.length})`}>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Projeto</th>
                    <th>Etapa</th>
                    <th>Valor</th>
                    <th>Atualizado</th>
                    <th style={{ width: 120 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {projetos.length > 0 ? (
                    projetos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nome_projeto}</td>
                        <td>{p.etapa_funil || "-"}</td>
                        <td>
                          {p.valor_estimado != null
                            ? `${p.moeda || "R$"} ${Number(p.valor_estimado).toLocaleString(
                                "pt-BR"
                              )}`
                            : "-"}
                        </td>
                        <td>{formatDateBR(p.updated_at)}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => navigate(`/crm/projetos/${p.id}`)}
                          >
                            Abrir
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Nenhum projeto vinculado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="interacoes" title={`Interações (${interacoes.length})`}>
              <div className="mt-3">
                {interacoes.length > 0 ? (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Descrição</th>
                        <th>Responsável</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interacoes.map((int, idx) => (
                        <tr key={idx}>
                          <td>{formatDateBR(int.data)}</td>
                          <td>
                            <Badge bg={int.tipo?.includes('Visita') ? 'primary' : 'secondary'}>
                              {int.tipo}
                            </Badge>
                          </td>
                          <td>{int.descricao || "-"}</td>
                          <td>{int.responsavel || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="secondary" className="text-center">
                    Nenhuma interacción registrada para este cliente.
                  </Alert>
                )}
              </div>
            </Tab>

            <Tab eventKey="pedidos" title="Pedidos">
              <Alert variant="secondary">
                UI pronta. A parte de vínculo com ERP/pedidos a gente pluga depois.
              </Alert>
            </Tab>

            <Tab eventKey="documentos" title="Documentos">
              <Alert variant="secondary">
                UI pronta. Depois ligamos upload/listagem e permissões.
              </Alert>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      <ClienteEditModal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        value={cliente}
        onSaved={() => {
          setSuccess("Cliente atualizado.");
          fetchAll();
          setTimeout(() => setSuccess(""), 2500);
        }}
      />

      <ContatoModal
        show={showContato}
        onHide={() => setShowContato(false)}
        value={editingContato}
        clienteId={cliente.id}
        onSaved={() => {
          setSuccess("Contato salvo.");
          fetchAll();
          setTimeout(() => setSuccess(""), 2500);
        }}
      />

      <FilialModal
        show={showFilialModal}
        onHide={() => setShowFilialModal(false)}
        value={editingFilial}
        clienteId={cliente.id}
        onSaved={() => {
          setSuccess("Filial salva.");
          fetchFiliais();
          setTimeout(() => setSuccess(""), 2500);
        }}
      />
    </Container>
  );
}
