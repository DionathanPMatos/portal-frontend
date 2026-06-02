import React from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";

export default function ModalPneu({ show, onHide, pneuData, setPneuData, veiculos, onSave }) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton><Modal.Title>Registro de Pneus</Modal.Title></Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group><Form.Label>Veículo</Form.Label>
              <Form.Select value={pneuData.veiculo_id} onChange={e => setPneuData({...pneuData, veiculo_id: e.target.value})}>
                <option value="">Selecione...</option>
                {veiculos.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo} - {v.placa}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Posição do Pneu</Form.Label>
              <Form.Select value={pneuData.posicao} onChange={e => setPneuData({...pneuData, posicao: e.target.value})}>
                <option>Todos (Conjunto)</option>
                <option>Dianteiro Esquerdo</option><option>Dianteiro Direito</option>
                <option>Traseiro Esquerdo</option><option>Traseiro Direito</option><option>Estepe</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}><Form.Group><Form.Label>Marca</Form.Label><Form.Control value={pneuData.marca} onChange={e => setPneuData({...pneuData, marca: e.target.value})} /></Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Modelo</Form.Label><Form.Control value={pneuData.modelo} onChange={e => setPneuData({...pneuData, modelo: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Data Instalação</Form.Label><Form.Control type="date" value={pneuData.data_instalacao} onChange={e => setPneuData({...pneuData, data_instalacao: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>KM de Instalação</Form.Label><Form.Control type="number" value={pneuData.km_instalacao} onChange={e => setPneuData({...pneuData, km_instalacao: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Vida Útil Prevista (KM)</Form.Label><Form.Control type="number" value={pneuData.vida_util_estimada_km} onChange={e => setPneuData({...pneuData, vida_util_estimada_km: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Custo (R$)</Form.Label><Form.Control type="number" step="0.01" value={pneuData.custo} onChange={e => setPneuData({...pneuData, custo: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Recapagens</Form.Label><Form.Control type="number" value={pneuData.recapagem_count} onChange={e => setPneuData({...pneuData, recapagem_count: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Status</Form.Label>
            <Form.Select value={pneuData.status} onChange={e => setPneuData({...pneuData, status: e.target.value})}>
              <option>Em Uso</option><option>Estoque</option><option>Descartado</option>
            </Form.Select>
          </Form.Group></Col>
          <Col md={12}>
            <Form.Check type="switch" label="Rodízio já foi aplicado neste pneu?" checked={pneuData.rodizio_aplicado} onChange={e => setPneuData({...pneuData, rodizio_aplicado: e.target.checked})} />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={onSave} disabled={!pneuData.veiculo_id || !pneuData.data_instalacao}>Salvar Pneu</Button>
      </Modal.Footer>
    </Modal>
  );
}