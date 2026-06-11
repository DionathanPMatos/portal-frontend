import React, { useState, useEffect } from "react";
import apiClient from "../../../services/api";
import { Modal, Form, Button, Row, Col, Alert, Table, Badge, ProgressBar } from "react-bootstrap";

export default function ModalEtapaDetalhes({ show, onHide, etapa, projetoId, onUpdate }) {
  const [data, setData] = useState(etapa || {});
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (etapa) {
      setData(etapa);
    }
  }, [etapa, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.put(`/api/obras/etapas/${data.id}`, data);
      setErro("");
      onUpdate();
      onHide();
    } catch (error) {
      setErro("Erro ao atualizar etapa: " + error.message);
    }
    setLoading(false);
  };

  if (!data.id) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Etapa: {data.nome_etapa}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label><strong>Status</strong></Form.Label>
              <Form.Select name="status" value={data.status || ""} onChange={handleChange}>
                <option value="Não Iniciada">Não Iniciada</option>
                <option value="Em Execução">Em Execução</option>
                <option value="Parada">Parada</option>
                <option value="Concluída">Concluída</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label><strong>Progresso Automático (%)</strong></Form.Label>
              <div className="d-flex align-items-center mt-1">
                <ProgressBar now={data.percentual_calculado || 0} className="flex-grow-1" style={{ height: '25px' }} label={`${data.percentual_calculado || 0}%`} />
              </div>
              <Form.Text className="text-muted d-block mt-1" style={{fontSize: '0.75rem'}}>
                Calculado com base nos checklists ou no status desta etapa.
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Data Início Real</Form.Label>
              <Form.Control
                type="date"
                name="data_inicio_real"
                value={data.data_inicio_real || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Data Fim Real</Form.Label>
              <Form.Control
                type="date"
                name="data_fim_real"
                value={data.data_fim_real || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group>
          <Form.Label>Descrição</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="descricao"
            value={data.descricao || ""}
            onChange={handleChange}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
