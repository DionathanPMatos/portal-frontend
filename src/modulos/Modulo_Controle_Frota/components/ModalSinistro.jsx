import React from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";

export default function ModalSinistro({ show, onHide, sinistroData, setSinistroData, veiculos, funcionarios, onSave }) {
  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSinistroData({ ...sinistroData, foto_base64: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton><Modal.Title>Registro de Sinistro / Ocorrência</Modal.Title></Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group><Form.Label>Veículo Envolvido</Form.Label>
              <Form.Select value={sinistroData.veiculo_id} onChange={e => setSinistroData({...sinistroData, veiculo_id: e.target.value})}>
                <option value="">Selecione...</option>
                {veiculos.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo} - {v.placa}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Motorista</Form.Label>
              <Form.Select value={sinistroData.motorista_id} onChange={e => setSinistroData({...sinistroData, motorista_id: e.target.value})}>
                <option value="">Selecione...</option>
                {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome_completo}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}><Form.Group><Form.Label>Data do Sinistro</Form.Label><Form.Control type="date" value={sinistroData.data_sinistro} onChange={e => setSinistroData({...sinistroData, data_sinistro: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Nº Boletim de Ocorrência</Form.Label><Form.Control value={sinistroData.numero_bo} onChange={e => setSinistroData({...sinistroData, numero_bo: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Custo Estimado (R$)</Form.Label><Form.Control type="number" step="0.01" value={sinistroData.custo_estimado} onChange={e => setSinistroData({...sinistroData, custo_estimado: e.target.value})} /></Form.Group></Col>
          <Col md={12}><Form.Group><Form.Label>Descrição do Ocorrido</Form.Label><Form.Control as="textarea" rows={3} value={sinistroData.descricao} onChange={e => setSinistroData({...sinistroData, descricao: e.target.value})} /></Form.Group></Col>
          <Col md={12}><Form.Group><Form.Label>Terceiros Envolvidos (Nomes, Placas, Contatos)</Form.Label><Form.Control as="textarea" rows={2} value={sinistroData.terceiros_envolvidos} onChange={e => setSinistroData({...sinistroData, terceiros_envolvidos: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Status do Processo</Form.Label>
            <Form.Select value={sinistroData.status} onChange={e => setSinistroData({...sinistroData, status: e.target.value})}>
              <option>Aberto</option><option>Em Análise</option><option>Oficina</option><option>Concluído</option>
            </Form.Select>
          </Form.Group></Col>
          <Col md={4} className="d-flex align-items-center">
            <Form.Check type="switch" label="Seguradora Acionada?" checked={sinistroData.seguradora_acionada} onChange={e => setSinistroData({...sinistroData, seguradora_acionada: e.target.checked})} />
          </Col>
          <Col md={4}><Form.Group><Form.Label>Foto (Evidência/BO)</Form.Label><Form.Control type="file" accept="image/*" onChange={handleFoto} /></Form.Group></Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="danger" onClick={onSave} disabled={!sinistroData.veiculo_id || !sinistroData.data_sinistro}>Salvar Sinistro</Button>
      </Modal.Footer>
    </Modal>
  );
}