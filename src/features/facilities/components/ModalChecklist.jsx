import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import apiClient from "../../../services/api";

export default function ModalChecklist({ show, onHide, projetoId, onSave }) {
  const [data, setData] = useState({
    etapa_id: "",
    titulo: "",
    descricao: ""
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
    if (!data.titulo) {
      setValidado(true);
      return;
    }
    try {
      await apiClient.post("/api/obras/checklists", {
        projeto_id: projetoId,
        ...data
      });
      setData({ etapa_id: "", titulo: "", descricao: "" });
      setValidado(false);
      onSave();
    } catch (error) {
      setErro("Erro ao criar checklist: " + error.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Novo Checklist</Modal.Title>
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
            <Form.Label>Título *</Form.Label>
            <Form.Control
              type="text"
              name="titulo"
              value={data.titulo}
              onChange={handleChange}
              isInvalid={validado && !data.titulo}
              placeholder="Ex: Verificações de Qualidade, Inspeção Final"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descricao"
              value={data.descricao}
              onChange={handleChange}
              placeholder="Descreva o objetivo do checklist"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Criar Checklist
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
