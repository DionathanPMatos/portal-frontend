import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Form,
  InputGroup,
  Alert,
  Table,
} from "react-bootstrap";
import { FaPlus, FaTrash } from "react-icons/fa";
import apiClient from "../../../../services/api";

const onlyDigits = (v = "") => String(v || "").replace(/\D/g, "");

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

export default function ClienteFormModal({ show, onHide, initialValue, onSaved }) {
  const isEdit = Boolean(initialValue?.id);

  const [saving, setSaving] = useState(false);
  const [busyLookup, setBusyLookup] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(emptyCliente);

  // Segmentações cadastradas no banco
  const [segmentacoes, setSegmentacoes] = useState([]);

  // Lista de novos contatos a serem criados
  const [contatosList, setContatosList] = useState([]);
  const [novoContato, setNovoContato] = useState({ nome: "", contato: "", cargo: "", email: "" });

  useEffect(() => {
    setErr("");
    setNovoContato({ nome: "", contato: "", cargo: "", email: "" });

    if (show && initialValue?.id) {
      setBusyLookup(true);
      apiClient.get(`/api/clientes/${initialValue.id}`)
        .then((res) => {
          setData({ ...emptyCliente, ...(res.data?.cliente || res.data || {}) });
        })
        .catch((e) => {
          console.error("Erro ao buscar dados do cliente para edição:", e);
          setErr("Falha ao carregar os dados do cliente.");
          setData({ ...emptyCliente, ...initialValue });
        })
        .finally(() => {
          setBusyLookup(false);
        });
    } else {
      setData({ ...emptyCliente, ...(initialValue || {}) });
      setContatosList([]);
    }
  }, [initialValue, show]);

  // Carrega segmentos
  useEffect(() => {
    if (show) {
      apiClient.get("/api/segmentacoes")
        .then((res) => {
          setSegmentacoes(res.data || []);
        })
        .catch((err) => {
          console.error("Erro ao buscar segmentações:", err);
        });
    }
  }, [show]);

  const setField = (k, v) => setData((prev) => ({ ...prev, [k]: v }));

  const handleAddContato = () => {
    if (!novoContato.nome.trim()) {
      alert("O nome do contato é obrigatório.");
      return;
    }
    setContatosList((prev) => [...prev, { ...novoContato, tempId: Date.now() }]);
    setNovoContato({ nome: "", contato: "", cargo: "", email: "" });
  };

  const handleRemoveContato = (tempId) => {
    setContatosList((prev) => prev.filter((c) => c.tempId !== tempId));
  };

  const importarCNPJ = async () => {
    setErr("");
    const cnpj = onlyDigits(data.cnpj_cpf);
    if (cnpj.length !== 14) {
      setErr("CNPJ inválido (precisa ter 14 dígitos).");
      return;
    }

    setBusyLookup(true);
    try {
      const r = await apiClient.get(`/api/utils/cnpj/${cnpj}`);
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
      const r = await apiClient.get(`/api/utils/cep/${cep}`);
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
      // 1. O Nome do cliente que irá aparecer na lista é o nome fantasia, e sua Razão Social
      const nomeFinal = (data.nome_fantasia || data.razao_social || "").trim();

      const payload = {
        ...data,
        nome_cliente: nomeFinal,
        cnpj_cpf: onlyDigits(data.cnpj_cpf),
        cnpj_matriz: onlyDigits(data.cnpj_matriz),
        cep: onlyDigits(data.cep),
        uf: String(data.uf || "").toUpperCase().slice(0, 2),
      };

      if (!payload.nome_cliente) {
        setErr("O preenchimento do Nome Fantasia ou Razão Social é obrigatório.");
        setSaving(false);
        return;
      }

      let savedClient = null;
      if (isEdit) {
        await apiClient.put(`/api/clientes/${initialValue.id}`, payload);
        savedClient = { ...initialValue, ...payload };
      } else {
        const response = await apiClient.post(`/api/clientes`, payload);
        const newClientId = response.data?.id;
        savedClient = { ...payload, id: newClientId };

        // 3. Cadastrar contatos criados no modal
        if (newClientId && contatosList.length > 0) {
          for (let i = 0; i < contatosList.length; i++) {
            const contact = contatosList[i];
            await apiClient.post("/api/contatos", {
              cliente_id: newClientId,
              nome: contact.nome,
              telefone: contact.contato,
              whatsapp: contact.contato,
              cargo: contact.cargo,
              email: contact.email,
              principal: i === 0 ? 1 : 0,
            });
          }
        }
      }

      onSaved?.(savedClient);
      onHide?.();
    } catch (e) {
      console.error(e);
      setErr("Falha ao salvar cliente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" style={{ zIndex: 1060 }}>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar Cliente" : "Novo Cliente"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}

        <Row className="g-3">
          {/* CNPJ */}
          <Col md={12}>
            <Form.Group>
              <Form.Label className="fw-semibold">CNPJ</Form.Label>
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
                  {busyLookup ? "Importando..." : "Importar CNPJ"}
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>

          {/* Nome Fantasia & Razão Social */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">Nome Fantasia</Form.Label>
              <Form.Control
                value={data.nome_fantasia || ""}
                onChange={(e) => setField("nome_fantasia", e.target.value)}
                placeholder="Nome Fantasia do cliente"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">Razão Social</Form.Label>
              <Form.Control
                value={data.razao_social || ""}
                onChange={(e) => setField("razao_social", e.target.value)}
                placeholder="Razão Social do cliente"
              />
            </Form.Group>
          </Col>

          {/* Segmento & Perfil */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">Segmento</Form.Label>
              <Form.Select
                value={data.segmento || ""}
                onChange={(e) => setField("segmento", e.target.value)}
              >
                <option value="">Selecione um segmento...</option>
                {segmentacoes.map((seg) => (
                  <option key={seg.id} value={seg.nome}>
                    {seg.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">Perfil</Form.Label>
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

          {/* CEP & Endereço */}
          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-semibold">CEP</Form.Label>
              <InputGroup>
                <Form.Control
                  value={data.cep || ""}
                  onChange={(e) => setField("cep", e.target.value)}
                  placeholder="Apenas números"
                />
                <Button variant="outline-primary" onClick={buscarCEP} disabled={busyLookup}>
                  {busyLookup ? "..." : "Buscar"}
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">Logradouro</Form.Label>
              <Form.Control
                value={data.logradouro || ""}
                onChange={(e) => setField("logradouro", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label className="fw-semibold">Nº</Form.Label>
              <Form.Control
                value={data.numero || ""}
                onChange={(e) => setField("numero", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-semibold">Complemento</Form.Label>
              <Form.Control
                value={data.complemento || ""}
                onChange={(e) => setField("complemento", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={5}>
            <Form.Group>
              <Form.Label className="fw-semibold">Bairro</Form.Label>
              <Form.Control
                value={data.bairro || ""}
                onChange={(e) => setField("bairro", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={5}>
            <Form.Group>
              <Form.Label className="fw-semibold">Cidade</Form.Label>
              <Form.Control
                value={data.cidade || ""}
                onChange={(e) => setField("cidade", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label className="fw-semibold">UF</Form.Label>
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
              <Form.Label className="fw-semibold">Site</Form.Label>
              <Form.Control
                value={data.site || ""}
                onChange={(e) => setField("site", e.target.value)}
                placeholder="https://"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">Inscrição Estadual</Form.Label>
              <Form.Control
                value={data.inscricao_estadual || ""}
                onChange={(e) => setField("inscricao_estadual", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group>
              <Form.Label className="fw-semibold">Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={data.observacoes || ""}
                onChange={(e) => setField("observacoes", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        {!isEdit && (
          <>
            <hr className="my-4" />
            <h5 className="fw-bold mb-3 text-secondary">Contatos do Cliente</h5>
            <Row className="g-2 mb-3 align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Nome</Form.Label>
                  <Form.Control
                    size="sm"
                    value={novoContato.nome}
                    onChange={(e) => setNovoContato({ ...novoContato, nome: e.target.value })}
                    placeholder="Nome do contato"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Contato (Tel/Cel)</Form.Label>
                  <Form.Control
                    size="sm"
                    value={novoContato.contato}
                    onChange={(e) => setNovoContato({ ...novoContato, contato: e.target.value })}
                    placeholder="Telefone/WhatsApp"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Cargo</Form.Label>
                  <Form.Control
                    size="sm"
                    value={novoContato.cargo}
                    onChange={(e) => setNovoContato({ ...novoContato, cargo: e.target.value })}
                    placeholder="Cargo do contato"
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">E-mail</Form.Label>
                  <Form.Control
                    size="sm"
                    type="email"
                    value={novoContato.email}
                    onChange={(e) => setNovoContato({ ...novoContato, email: e.target.value })}
                    placeholder="E-mail"
                  />
                </Form.Group>
              </Col>
              <Col md={1} className="text-end">
                <Button variant="outline-success" size="sm" onClick={handleAddContato}>
                  <FaPlus />
                </Button>
              </Col>
            </Row>

            {contatosList.length > 0 && (
              <Table size="sm" striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Contato</th>
                    <th>Cargo</th>
                    <th>E-mail</th>
                    <th style={{ width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {contatosList.map((c) => (
                    <tr key={c.tempId}>
                      <td>{c.nome}</td>
                      <td>{c.contato || "-"}</td>
                      <td>{c.cargo || "-"}</td>
                      <td>{c.email || "-"}</td>
                      <td className="text-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="p-1"
                          onClick={() => handleRemoveContato(c.tempId)}
                        >
                          <FaTrash size={12} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
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
