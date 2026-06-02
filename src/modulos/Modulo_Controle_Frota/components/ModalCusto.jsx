import React from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";

export default function ModalCusto({ show, onHide, custoData, setCustoData, veiculos, onSave }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Registrar Despesa / Custo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group><Form.Label>Veículo Selecionado</Form.Label>
              <Form.Select value={custoData.veiculo_id} onChange={e => setCustoData({...custoData, veiculo_id: e.target.value})}>
                <option value="">Selecione um veículo...</option>
                {veiculos.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo} - Placa: {v.placa}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Tipo de Custo</Form.Label>
              <Form.Select value={custoData.tipo_custo} onChange={e => setCustoData({...custoData, tipo_custo: e.target.value})}>
                <option value="Abastecimento">Abastecimento</option><option value="Pedágio">Pedágio</option>
                <option value="Estacionamento">Estacionamento</option><option value="Multa">Multa</option>
                <option value="Manutenção">Manutenção</option><option value="Outros">Outros</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Data da Despesa</Form.Label>
              <Form.Control type="date" value={custoData.data_custo} onChange={e => setCustoData({...custoData, data_custo: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group><Form.Label>Valor Total (R$)</Form.Label>
              <Form.Control type="number" step="0.01" value={custoData.valor} onChange={e => setCustoData({...custoData, valor: e.target.value})} />
            </Form.Group>
          </Col>
          {custoData.tipo_custo === "Abastecimento" && (
            <>
              <Col md={6}>
                <Form.Group><Form.Label>Odômetro no Abastecimento</Form.Label><Form.Control type="number" value={custoData.quilometragem} onChange={e => setCustoData({...custoData, quilometragem: e.target.value})} /></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label>Litros Abastecidos</Form.Label><Form.Control type="number" step="0.01" value={custoData.litros} onChange={e => setCustoData({...custoData, litros: e.target.value})} /></Form.Group>
              </Col>
            </>
          )}
          <Col md={12}>
            <Form.Group><Form.Label>Observações ou Comprovante</Form.Label>
              <Form.Control as="textarea" rows={2} value={custoData.observacoes} onChange={e => setCustoData({...custoData, observacoes: e.target.value})} placeholder="Ex: Posto Ipiranga, Nfe 12345" />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="danger" onClick={onSave} disabled={!custoData.veiculo_id || !custoData.valor || !custoData.data_custo}>Lançar Despesa</Button>
      </Modal.Footer>
    </Modal>
  );
}