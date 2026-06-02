import React from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";

export default function ModalMulta({
  show,
  onHide,
  multaData,
  setMultaData,
  veiculos,
  funcionarios,
  onSave
}) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{multaData.id ? 'Identificar / Atualizar Multa' : 'Registrar Nova Multa'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}><h6 className="border-bottom pb-2 text-danger fw-bold mt-2">Dados da Infração</h6></Col>
          <Col md={6}>
            <Form.Group><Form.Label>Veículo Autuado</Form.Label>
              <Form.Select value={multaData.veiculo_id} onChange={e => setMultaData({...multaData, veiculo_id: e.target.value})} disabled={!!multaData.id}>
                <option value="">Selecione o veículo...</option>
                {veiculos.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo} - Placa: {v.placa}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group><Form.Label>Data e Hora</Form.Label>
              <Form.Control type="datetime-local" value={multaData.data_infracao} onChange={e => setMultaData({...multaData, data_infracao: e.target.value})} disabled={!!multaData.id} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group><Form.Label>Valor (R$)</Form.Label>
              <Form.Control type="number" step="0.01" value={multaData.valor} onChange={e => setMultaData({...multaData, valor: e.target.value})} disabled={!!multaData.id} />
            </Form.Group>
          </Col>
          <Col md={9}>
            <Form.Group><Form.Label>Descrição da Infração (Motivo)</Form.Label>
              <Form.Control type="text" value={multaData.descricao} onChange={e => setMultaData({...multaData, descricao: e.target.value})} disabled={!!multaData.id} placeholder="Ex: Excesso de velocidade > 20%" />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group><Form.Label>Pontos CNH</Form.Label>
              <Form.Control type="number" value={multaData.pontos_cnh} onChange={e => setMultaData({...multaData, pontos_cnh: e.target.value})} disabled={!!multaData.id} />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group><Form.Label>Local da Infração / Órgão Autuador</Form.Label>
              <Form.Control type="text" value={multaData.local_infracao} onChange={e => setMultaData({...multaData, local_infracao: e.target.value})} disabled={!!multaData.id} placeholder="Ex: Rodovia BR-101, Km 45 / PRF" />
            </Form.Group>
          </Col>

          <Col md={12}><h6 className="border-bottom pb-2 text-primary fw-bold mt-4">Identificação de Condutor e Status</h6></Col>
          <Col md={6}>
            <Form.Group><Form.Label>Motorista Infrator</Form.Label>
              <Form.Select value={multaData.motorista_id || ""} onChange={e => setMultaData({...multaData, motorista_id: e.target.value})}>
                <option value="">Ainda não identificado</option>
                {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome_completo}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Status da Multa</Form.Label>
              <Form.Select value={multaData.status} onChange={e => setMultaData({...multaData, status: e.target.value})}>
                <option value="Pendente Identificação">Pendente Identificação</option><option value="Identificado">Condutor Identificado</option><option value="Recorrido">Recorrido / Defesa</option><option value="Pago">Pago / Finalizado</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="danger" onClick={onSave} disabled={!multaData.veiculo_id || !multaData.data_infracao || !multaData.valor}>Salvar Registro</Button>
      </Modal.Footer>
    </Modal>
  );
}