import React from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";

export default function ModalLavagem({ show, onHide, lavagemData, setLavagemData, veiculos, onSave }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton><Modal.Title>Registro de Lavagem</Modal.Title></Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group><Form.Label>Veículo</Form.Label>
              <Form.Select value={lavagemData.veiculo_id} onChange={e => setLavagemData({...lavagemData, veiculo_id: e.target.value})}>
                <option value="">Selecione...</option>
                {veiculos.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo} - {v.placa}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}><Form.Group><Form.Label>Data da Lavagem</Form.Label><Form.Control type="date" value={lavagemData.data_lavagem} onChange={e => setLavagemData({...lavagemData, data_lavagem: e.target.value})} /></Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Tipo</Form.Label>
            <Form.Select value={lavagemData.tipo_lavagem} onChange={e => setLavagemData({...lavagemData, tipo_lavagem: e.target.value})}>
              <option>Simples</option><option>Completa</option><option>Polimento</option>
            </Form.Select>
          </Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Custo (R$)</Form.Label><Form.Control type="number" step="0.01" value={lavagemData.custo} onChange={e => setLavagemData({...lavagemData, custo: e.target.value})} /></Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Próxima Lavagem Sugerida</Form.Label><Form.Control type="date" value={lavagemData.proxima_lavagem_data} onChange={e => setLavagemData({...lavagemData, proxima_lavagem_data: e.target.value})} /></Form.Group></Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={onSave} disabled={!lavagemData.veiculo_id || !lavagemData.data_lavagem}>Salvar Lavagem</Button>
      </Modal.Footer>
    </Modal>
  );
}