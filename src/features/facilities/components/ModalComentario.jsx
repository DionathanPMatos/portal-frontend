import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import apiClient from "../../../services/api";
export default function ModalComentario({ show, onHide, projetoId, onSave }) {
  const [data, setData] = useState({
    etapa_id: "",
    conteudo: "",
    tipo: "Observação"
  });
  const [etapas, setEtapas] = useState([]);
  const [erro, setErro] = useState("");
  const [validado, setValidado] = useState(false);

  useEffect(() => {
    if (show && projetoId) {
      fetchEtapas();
    }
  }, [show, projetoId]);

  const fetchEtapas = async () => {
    try {
      const res = await apiClient.get(`/api/obras/etapas/${projetoId}`);
      setEtapas(res.data || []);
    } catch (error) {
      console.error("Erro ao buscar etapas:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.conteudo) {
      setValidado(true);
      return;
    }
    try {
      await apiClient.post("/api/obras/comentarios", {
        projeto_id: projetoId,
        etapa_id: data.etapa_id || null,
        conteudo: data.conteudo,
        tipo: data.tipo
      });
      setData({ etapa_id: "", conteudo: "", tipo: "Observação" });
      setValidado(false);
      setErro("");
      onSave();
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error.response?.data || error.message);
      setErro("Erro ao adicionar comentário: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Novo Comentário</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {erro && <Alert variant="danger" onClose={() => setErro("")} dismissible>{erro}</Alert>}
        <Form onSubmit={handleSubmit} noValidate validated={validado}>
          <Form.Group className="mb-3">
            <Form.Label>Etapa (Opcional)</Form.Label>
            <Form.Select name="etapa_id" value={data.etapa_id} onChange={handleChange}>
              <option value="">Comentário Geral</option>
              {etapas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.numero_etapa} - {e.nome_etapa}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select name="tipo" value={data.tipo} onChange={handleChange}>
              <option value="Observação">Observação</option>
              <option value="Alerta">Alerta</option>
              <option value="Problema">Problema</option>
              <option value="Sugestão">Sugestão</option>
              <option value="Nota Importante">Nota Importante</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Comentário *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="conteudo"
              value={data.conteudo}
              onChange={handleChange}
              isInvalid={validado && !data.conteudo}
              placeholder="Digite seu comentário ou observação..."
            />
            <Form.Control.Feedback type="invalid">
              Comentário é obrigatório
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Adicionar Comentário
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
