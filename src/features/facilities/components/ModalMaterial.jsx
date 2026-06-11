import React, { useState, useEffect } from "react";
import apiClient from "../../../services/api";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";

export default function ModalMaterial({ show, onHide, projetoId, onSave }) {
  const [data, setData] = useState({
    etapa_id: "",
    nome_material: "",
    descricao: "",
    quantidade: 0,
    unidade: "un",
    valor_unitario: 0,
    fornecedor_id: "",
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
    if (!data.nome_material) {
      setValidado(true);
      return;
    }
    try {
      await apiClient.post("/api/obras/materiais", {
        projeto_id: projetoId,
        ...data,
        quantidade: parseFloat(data.quantidade),
        valor_unitario: parseFloat(data.valor_unitario)
      });
      setData({ etapa_id: "", nome_material: "", descricao: "", quantidade: 0, unidade: "un", valor_unitario: 0, fornecedor_id: "", observacoes: "" });
      setValidado(false);
      onSave();
    } catch (error) {
      setErro("Erro ao adicionar material: " + error.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Material</Modal.Title>
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
            <Form.Label>Nome do Material *</Form.Label>
            <Form.Control
              type="text"
              name="nome_material"
              value={data.nome_material}
              onChange={handleChange}
              isInvalid={validado && !data.nome_material}
              placeholder="Ex: Cimento, Areia, Tijolos"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="descricao"
              value={data.descricao}
              onChange={handleChange}
            />
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Quantidade</Form.Label>
                <Form.Control
                  type="number"
                  name="quantidade"
                  value={data.quantidade}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Unidade</Form.Label>
                <Form.Select name="unidade" value={data.unidade} onChange={handleChange}>
                  <option value="un">Unidade</option>
                  <option value="kg">kg</option>
                  <option value="m">Metro</option>
                  <option value="m2">Metro Quadrado</option>
                  <option value="m3">Metro Cúbico</option>
                  <option value="l">Litro</option>
                  <option value="cx">Caixa</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Valor Unitário (R$)</Form.Label>
                <Form.Control
                  type="number"
                  name="valor_unitario"
                  value={data.valor_unitario}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Fornecedor</Form.Label>
            <Form.Select name="fornecedor_id" value={data.fornecedor_id} onChange={handleChange}>
              <option value="">Selecione um fornecedor</option>
              {prestadores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome_fantasia}
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

          <Alert variant="info">
            <strong>Valor Total:</strong> R$ {(data.quantidade * data.valor_unitario).toFixed(2)}
          </Alert>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Adicionar Material
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
