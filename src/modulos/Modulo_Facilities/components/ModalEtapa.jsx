import React, { useState } from "react";
import axios from "axios";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";

export default function ModalEtapa({ show, onHide, projetoId, onSave }) {
  const [data, setData] = useState({
    numero_etapa: 1,
    nome_etapa: "",
    descricao: "",
    data_inicio_planejada: "",
    data_fim_planejada: "",
    ordem_execucao: 1
  });
  const [erro, setErro] = useState("");
  const [validado, setValidado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.nome_etapa) {
      setValidado(true);
      return;
    }
    try {
      await axios.post("/api/obras/etapas", {
        projeto_id: projetoId,
        ...data
      });
      setData({ numero_etapa: 1, nome_etapa: "", descricao: "", data_inicio_planejada: "", data_fim_planejada: "", ordem_execucao: 1 });
      setValidado(false);
      onSave();
    } catch (error) {
      setErro("Erro ao criar etapa: " + error.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Nova Etapa de Obra</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {erro && <Alert variant="danger" onClose={() => setErro("")} dismissible>{erro}</Alert>}
        <Form onSubmit={handleSubmit} noValidate validated={validado}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Número Etapa</Form.Label>
                <Form.Control
                  type="number"
                  name="numero_etapa"
                  value={data.numero_etapa}
                  onChange={handleChange}
                  min="1"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ordem Execução</Form.Label>
                <Form.Control
                  type="number"
                  name="ordem_execucao"
                  value={data.ordem_execucao}
                  onChange={handleChange}
                  min="1"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Nome da Etapa *</Form.Label>
            <Form.Control
              type="text"
              name="nome_etapa"
              value={data.nome_etapa}
              onChange={handleChange}
              isInvalid={validado && !data.nome_etapa}
              placeholder="Ex: Fundações, Alvenaria, etc"
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
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data Início Planejada</Form.Label>
                <Form.Control
                  type="date"
                  name="data_inicio_planejada"
                  value={data.data_inicio_planejada}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data Fim Planejada</Form.Label>
                <Form.Control
                  type="date"
                  name="data_fim_planejada"
                  value={data.data_fim_planejada}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Criar Etapa
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
