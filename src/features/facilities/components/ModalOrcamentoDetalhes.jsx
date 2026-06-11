import React, { useState, useEffect } from "react";
import apiClient from '../../../services/api';
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";

export default function ModalOrcamentoDetalhes({ show, onHide, orcamento, onUpdate }) {
  const [data, setData] = useState(orcamento || {});
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orcamento) {
      setData(orcamento);
    }
  }, [orcamento, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.put(`/api/obras/orcamentos/${data.id}`, data);
      setErro("");
      onUpdate();
      onHide();
    } catch (error) {
      setErro("Erro ao atualizar orçamento: " + error.message);
    }
    setLoading(false);
  };

  const handleAprovar = async () => {
    setLoading(true);
    try {
      await apiClient.put(`/api/obras/orcamentos/${data.id}`, { ...data, status: "Aprovado" });
      setErro("");
      onUpdate();
      onHide();
    } catch (error) {
      setErro("Erro ao aprovar: " + error.message);
    }
    setLoading(false);
  };

  const handleReprovar = async () => {
    setLoading(true);
    try {
      await apiClient.put(`/api/obras/orcamentos/${data.id}`, { ...data, status: "Rejeitado" });
      setErro("");
      onUpdate();
      onHide();
    } catch (error) {
      setErro("Erro ao rejeitar: " + error.message);
    }
    setLoading(false);
  };

  if (!data.id) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Orçamento: {data.descricao}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label><strong>Valor Estimado (R$)</strong></Form.Label>
              <Form.Control
                type="number"
                name="valor_estimado"
                value={data.valor_estimado || 0}
                onChange={handleChange}
                step="0.01"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label><strong>Valor Real (R$)</strong></Form.Label>
              <Form.Control
                type="number"
                name="valor_real"
                value={data.valor_real || 0}
                onChange={handleChange}
                step="0.01"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label><strong>Status</strong></Form.Label>
              <Form.Select name="status" value={data.status || ""} onChange={handleChange}>
                <option value="Orçado">Orçado</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Rejeitado">Rejeitado</option>
                <option value="Em Execução">Em Execução</option>
                <option value="Concluído">Concluído</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Data Aprovação</Form.Label>
              <Form.Control
                type="date"
                name="data_aprovacao"
                value={data.data_aprovacao || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group>
          <Form.Label>Observações</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="observacoes"
            value={data.observacoes || ""}
            onChange={handleChange}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleReprovar} disabled={loading}>
          ✗ Rejeitar
        </Button>
        <Button variant="success" onClick={handleAprovar} disabled={loading}>
          ✓ Aprovar
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
