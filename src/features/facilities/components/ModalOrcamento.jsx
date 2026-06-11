import React, { useState, useEffect } from "react";
import apiClient from "../../../services/api";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";

export default function ModalOrcamento({ show, onHide, projetoId, onSave }) {
  const [data, setData] = useState({
    etapa_id: "",
    descricao: "",
    valor_estimado: 0,
    prestador_id: "",
    observacoes: ""
  });
  const [prestadores, setPrestadores] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [erro, setErro] = useState("");
  const [validado, setValidado] = useState(false);

  useEffect(() => {
    if (show && projetoId) {
      fetchPrestadores();
      fetchEtapas();
    }
  }, [show, projetoId]);

  const fetchPrestadores = async () => {
    try {
      const res = await apiClient.get("/api/facilities/prestadores");
      setPrestadores(res.data || []);
    } catch (error) {
      console.error("Erro ao buscar prestadores:", error);
    }
  };

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
    if (!data.descricao) {
      setValidado(true);
      return;
    }
    try {
      await apiClient.post("/api/obras/orcamentos", {
        projeto_id: projetoId,
        ...data,
        valor_estimado: parseFloat(data.valor_estimado)
      });
      setData({ etapa_id: "", descricao: "", valor_estimado: 0, prestador_id: "", observacoes: "" });
      setValidado(false);
      onSave();
    } catch (error) {
      setErro("Erro ao criar orçamento: " + error.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Novo Orçamento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {erro && <Alert variant="danger" onClose={() => setErro("")} dismissible>{erro}</Alert>}
        <Form onSubmit={handleSubmit} noValidate validated={validado}>
          <Form.Group className="mb-3">
            <Form.Label>Etapa (Opcional)</Form.Label>
            <Form.Select name="etapa_id" value={data.etapa_id} onChange={handleChange}>
              <option value="">Não associar</option>
              {etapas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.numero_etapa} - {e.nome_etapa}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrição *</Form.Label>
            <Form.Control
              type="text"
              name="descricao"
              value={data.descricao}
              onChange={handleChange}
              isInvalid={validado && !data.descricao}
              placeholder="Ex: Alvenaria, Pintura, etc"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Valor Estimado (R$)</Form.Label>
            <Form.Control
              type="number"
              name="valor_estimado"
              value={data.valor_estimado}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Prestador</Form.Label>
            <Form.Select name="prestador_id" value={data.prestador_id} onChange={handleChange}>
              <option value="">Selecione um prestador</option>
              {prestadores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome_fantasia} - {p.especialidade}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Observações</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="observacoes"
              value={data.observacoes}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Criar Orçamento
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
