import React from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";

export default function ModalReserva({
  show,
  onHide,
  reservaData,
  setReservaData,
  veiculos,
  onSave
}) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Solicitar Reserva</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group><Form.Label>Selecione o Veículo</Form.Label>
              <Form.Select value={reservaData.veiculo_id} onChange={e => setReservaData({...reservaData, veiculo_id: e.target.value})}>
                <option value="">Selecione...</option>
                {veiculos.filter(v => v.status === "Disponível").map(v => (
                  <option key={v.id} value={v.id}>{v.marca} {v.modelo} - Placa: {v.placa}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Data de Saída</Form.Label>
              <Form.Control type="date" value={reservaData.data_inicio} onChange={e => setReservaData({...reservaData, data_inicio: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Hora de Saída</Form.Label>
              <Form.Control type="time" value={reservaData.hora_inicio} onChange={e => setReservaData({...reservaData, hora_inicio: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Data de Retorno</Form.Label>
              <Form.Control type="date" value={reservaData.data_fim} onChange={e => setReservaData({...reservaData, data_fim: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Hora de Retorno</Form.Label>
              <Form.Control type="time" value={reservaData.hora_fim} onChange={e => setReservaData({...reservaData, hora_fim: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Origem</Form.Label>
              <Form.Control value={reservaData.origem} onChange={e => setReservaData({...reservaData, origem: e.target.value})} placeholder="Sede da empresa" />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Destino</Form.Label>
              <Form.Control value={reservaData.destino} onChange={e => setReservaData({...reservaData, destino: e.target.value})} placeholder="Cliente X" />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group><Form.Label>Motivo / Observações</Form.Label>
              <Form.Control as="textarea" rows={2} value={reservaData.motivo} onChange={e => setReservaData({...reservaData, motivo: e.target.value})} />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={onSave} disabled={!reservaData.veiculo_id || !reservaData.data_inicio || !reservaData.data_fim}>Solicitar Reserva</Button>
      </Modal.Footer>
    </Modal>
  );
}