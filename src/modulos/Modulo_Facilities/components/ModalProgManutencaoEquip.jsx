import React from "react";
import { Modal, Row, Col, Form, Button, Alert, InputGroup } from "react-bootstrap";

export default function ModalProgManutencaoEquip({ show, onHide, progManutData, setProgManutData, onSave, equipSelecionado }) {
  const calcRevisao = (meses) => {
    const data = new Date();
    data.setMonth(data.getMonth() + meses);
    setProgManutData({ ...progManutData, proxima_manutencao_data: data.toISOString().split('T')[0] });
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton><Modal.Title>Programar Manutenção Preventiva</Modal.Title></Modal.Header>
      <Modal.Body>
        {equipSelecionado && (
          <Alert variant="info" className="mb-3">
            <strong>Ativo:</strong> {equipSelecionado.nome} <br/>
            <strong>Série:</strong> {equipSelecionado.numero_serie}
          </Alert>
        )}
        <Row className="g-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Próxima Manutenção (Data Sugerida)</Form.Label>
              <InputGroup>
                <Form.Control type="date" value={progManutData.proxima_manutencao_data} onChange={e => setProgManutData({...progManutData, proxima_manutencao_data: e.target.value})} />
              </InputGroup>
            <div className="mt-2 d-flex gap-2">
              <Button size="sm" variant="outline-primary" onClick={() => calcRevisao(3)}>+ 3 Meses</Button>
              <Button size="sm" variant="outline-primary" onClick={() => calcRevisao(6)}>+ 6 Meses</Button>
              <Button size="sm" variant="outline-primary" onClick={() => calcRevisao(12)}>+ 1 Ano</Button>
            </div>
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={onSave} disabled={!progManutData.proxima_manutencao_data}>Salvar Programação</Button>
      </Modal.Footer>
    </Modal>
  );
}