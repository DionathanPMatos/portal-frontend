import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

export default function ModalProjeto({ show, onHide, data, setData, onSave, unidades }) {
  const [validado, setValidado] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData({
      ...data,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.nome_projeto) {
      setValidado(true);
      return;
    }
    onSave();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {data.id ? "Editar Projeto" : "Novo Projeto de Obra"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} noValidate validated={validado}>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Nome do Projeto *</Form.Label>
                <Form.Control
                  type="text"
                  name="nome_projeto"
                  value={data.nome_projeto}
                  onChange={handleChange}
                  isInvalid={validado && !data.nome_projeto}
                />
                <Form.Control.Feedback type="invalid">
                  Nome do projeto é obrigatório
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Filial</Form.Label>
                <Form.Select name="filial_id" value={data.filial_id} onChange={handleChange}>
                  <option value="">Selecione uma filial</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome_unidade}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Prioridade</Form.Label>
                <Form.Select
                  name="prioridade"
                  value={data.prioridade}
                  onChange={handleChange}
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data Início</Form.Label>
                <Form.Control
                  type="date"
                  name="data_inicio"
                  value={data.data_inicio}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data Prevista Conclusão</Form.Label>
                <Form.Control
                  type="date"
                  name="data_prevista_conclusao"
                  value={data.data_prevista_conclusao}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Orçamento Total (R$)</Form.Label>
                <Form.Control
                  type="number"
                  name="orcamento_total"
                  value={data.orcamento_total}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={data.status || "Planejamento"}
                  onChange={handleChange}
                >
                  <option value="Planejamento">Planejamento</option>
                  <option value="Em Execução">Em Execução</option>
                  <option value="Parado">Parado</option>
                  <option value="Concluído">Concluído</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descricao"
              value={data.descricao}
              onChange={handleChange}
              placeholder="Descreva os detalhes do projeto..."
            />
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
          Salvar Projeto
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
