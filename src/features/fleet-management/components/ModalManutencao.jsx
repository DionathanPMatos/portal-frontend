import React from "react";
import { Modal, Row, Col, Form, Button, Alert, InputGroup } from "react-bootstrap";

export default function ModalManutencao({
  show,
  onHide,
  manutencaoData,
  setManutencaoData,
  onSave,
  veiculoSelecionado
}) {

  const calcOleo = () => {
    if (veiculoSelecionado) {
      const atual = Number(veiculoSelecionado.quilometragem_atual || 0);
      setManutencaoData({ ...manutencaoData, prox_troca_oleo_km: atual + 10000 });
    }
  };

  const calcRevisao = () => {
    const data = new Date();
    data.setMonth(data.getMonth() + 6);
    setManutencaoData({ ...manutencaoData, prox_revisao_data: data.toISOString().split('T')[0] });
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Programar Manutenção Preventiva</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {veiculoSelecionado && (
          <Alert variant="info" className="mb-3">
            <strong>Veículo:</strong> {veiculoSelecionado.marca} {veiculoSelecionado.modelo} - Placa: {veiculoSelecionado.placa}<br/>
            <strong>Odômetro Atual:</strong> {veiculoSelecionado.quilometragem_atual?.toLocaleString("pt-BR")} km
          </Alert>
        )}
        <Row className="g-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Próxima Troca de Óleo (KM Alvo)</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={manutencaoData.prox_troca_oleo_km} onChange={e => setManutencaoData({...manutencaoData, prox_troca_oleo_km: e.target.value})} placeholder="Ex: 50000" />
                <Button variant="outline-secondary" onClick={calcOleo}>+ 10.000 km</Button>
              </InputGroup>
              <Form.Text className="text-muted">Alerta gerado 1.000 km antes de atingir esta meta.</Form.Text>
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>Próxima Revisão (Data)</Form.Label>
              <InputGroup>
                <Form.Control type="date" value={manutencaoData.prox_revisao_data} onChange={e => setManutencaoData({...manutencaoData, prox_revisao_data: e.target.value})} />
                <Button variant="outline-secondary" onClick={calcRevisao}>+ 6 Meses</Button>
              </InputGroup>
              <Form.Text className="text-muted">Alerta gerado 30 dias antes do vencimento.</Form.Text>
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={onSave}>Salvar Programação</Button>
      </Modal.Footer>
    </Modal>
  );
}