import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import apiClient from "../../../services/api";
export default function ModalMaterialDetalhes({ show, onHide, material, onUpdate }) {
  const [data, setData] = useState(material || {});
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (material) {
      setData(material);
    }
  }, [material, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.put(`/api/obras/materiais/${data.id}`, data);
      setErro("");
      onUpdate();
      onHide();
    } catch (error) {
      setErro("Erro ao atualizar material: " + error.message);
    }
    setLoading(false);
  };

  if (!data.id) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Material: {data.nome_material}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}
        
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label><strong>Quantidade</strong></Form.Label>
              <Form.Control
                type="number"
                name="quantidade"
                value={data.quantidade || 0}
                onChange={handleChange}
                step="0.01"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label><strong>Unidade</strong></Form.Label>
              <Form.Control
                type="text"
                name="unidade"
                value={data.unidade || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label><strong>V. Unitário (R$)</strong></Form.Label>
              <Form.Control
                type="number"
                name="valor_unitario"
                value={data.valor_unitario || 0}
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
                <option value="Pendente">Pendente</option>
                <option value="Solicitado">Solicitado</option>
                <option value="Em Transporte">Em Transporte</option>
                <option value="Entregue">Entregue</option>
                <option value="Rejeitado">Rejeitado</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Data Entrega</Form.Label>
              <Form.Control
                type="date"
                name="data_entrega"
                value={data.data_entrega || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group>
          <Form.Label>Observações</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="observacoes"
            value={data.observacoes || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Alert variant="info" className="mt-3">
          <strong>Valor Total:</strong> R$ {(data.quantidade * data.valor_unitario).toFixed(2)}
        </Alert>
      </Modal.Body>
      <Modal.Footer>
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
