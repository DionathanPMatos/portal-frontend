import React from "react";
import { Modal, Row, Col, Form, Button, Alert } from "react-bootstrap";

export default function ModalInativarEquip({ show, onHide, inativarData, setInativarData, onSave, equipSelecionado }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton><Modal.Title>Inativar / Baixar Equipamento</Modal.Title></Modal.Header>
      <Modal.Body>
        {equipSelecionado && (
          <Alert variant="warning" className="mb-3">
            <strong>Ativo:</strong> {equipSelecionado.nome} <br/>
            <strong>Série:</strong> {equipSelecionado.numero_serie}
          </Alert>
        )}
        <Row className="g-3">
          <Col md={6}>
            <Form.Group><Form.Label>Motivo da Baixa</Form.Label>
              <Form.Select value={inativarData.inativacao_motivo} onChange={e => setInativarData({...inativarData, inativacao_motivo: e.target.value})}>
                <option value="Descarte/Sucata">Descarte / Sucata</option>
                <option value="Venda">Venda</option>
                <option value="Doação">Doação</option>
                <option value="Quebra/Perda">Quebra / Perda Irreparável</option>
                <option value="Outros">Outros</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Data da Inativação</Form.Label>
              <Form.Control type="date" value={inativarData.inativado_em} onChange={e => setInativarData({...inativarData, inativado_em: e.target.value})} />
            </Form.Group>
          </Col>
          
          {inativarData.inativacao_motivo === 'Venda' && (
            <Col md={6}>
              <Form.Group><Form.Label>Valor de Venda (R$)</Form.Label>
                <Form.Control type="number" step="0.01" value={inativarData.inativacao_valor} onChange={e => setInativarData({...inativarData, inativacao_valor: e.target.value})} />
              </Form.Group>
            </Col>
          )}

          <Col md={inativarData.inativacao_motivo === 'Venda' ? 6 : 12}>
            <Form.Group><Form.Label>Destinatário (Para quem?)</Form.Label>
              <Form.Control type="text" value={inativarData.inativacao_destinatario} onChange={e => setInativarData({...inativarData, inativacao_destinatario: e.target.value})} placeholder="Comprador, ONG, Empresa de Sucata..." />
            </Form.Group>
          </Col>
          
          <Col md={12}>
            <Form.Group><Form.Label>Observações adicionais</Form.Label>
              <Form.Control as="textarea" rows={2} value={inativarData.inativacao_observacao} onChange={e => setInativarData({...inativarData, inativacao_observacao: e.target.value})} />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="danger" onClick={onSave} disabled={!inativarData.inativacao_motivo || !inativarData.inativado_em}>Confirmar Baixa</Button>
      </Modal.Footer>
    </Modal>
  );
}