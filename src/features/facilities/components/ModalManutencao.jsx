import React from "react";
import { Modal, Row, Col, Form, Button, Card } from "react-bootstrap";

export default function ModalManutencao({ show, onHide, manutData, setManutData, equipamentos, prestadores, onSave }) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton><Modal.Title>Solicitação de Manutenção & Orçamentos</Modal.Title></Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={8}><Form.Group><Form.Label>Equipamento com Problema</Form.Label>
            <Form.Select value={manutData.equipamento_id} onChange={e => setManutData({...manutData, equipamento_id: e.target.value})}>
              <option value="">Selecione o equipamento...</option>
              {equipamentos.map(eq => <option key={eq.id} value={eq.id}>{eq.nome} ({eq.numero_serie})</option>)}
            </Form.Select>
          </Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Tipo de Intervenção</Form.Label>
            <Form.Select value={manutData.tipo} onChange={e => setManutData({...manutData, tipo: e.target.value})}>
              <option>Preventiva</option><option>Corretiva</option><option>Instalação</option>
            </Form.Select>
          </Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Data da Solicitação</Form.Label><Form.Control type="date" value={manutData.data_solicitacao} onChange={e => setManutData({...manutData, data_solicitacao: e.target.value})} /></Form.Group></Col>
          <Col md={8}><Form.Group><Form.Label>Descrição do Problema</Form.Label><Form.Control type="text" value={manutData.descricao} onChange={e => setManutData({...manutData, descricao: e.target.value})} /></Form.Group></Col>

          <Col md={12}><h6 className="border-bottom pb-2 text-primary fw-bold mt-4">Análise de Orçamentos (Cotações)</h6></Col>
          {[1, 2, 3].map(num => (
            <Col md={4} key={num}>
              <Card className="shadow-sm border-0 bg-light p-2 h-100">
                <Form.Group className="mb-2"><Form.Label className="fw-bold text-muted" style={{fontSize: '0.8rem'}}>Orçamento 0{num} (Prestador)</Form.Label>
                  <Form.Control size="sm" value={manutData[`orcamento_${num}_prestador`]} onChange={e => setManutData({...manutData, [`orcamento_${num}_prestador`]: e.target.value})} placeholder="Nome da empresa" />
                </Form.Group>
                <Form.Group><Form.Label className="text-muted" style={{fontSize: '0.8rem'}}>Valor (R$)</Form.Label>
                  <Form.Control size="sm" type="number" step="0.01" value={manutData[`orcamento_${num}_valor`]} onChange={e => setManutData({...manutData, [`orcamento_${num}_valor`]: e.target.value})} />
                </Form.Group>
              </Card>
            </Col>
          ))}

          <Col md={12}><h6 className="border-bottom pb-2 text-success fw-bold mt-4">Aprovação e Conclusão</h6></Col>
          <Col md={4}><Form.Group><Form.Label>Prestador Escolhido / Aprovado</Form.Label>
            <Form.Select value={manutData.prestador_aprovado_id} onChange={e => setManutData({...manutData, prestador_aprovado_id: e.target.value})}>
              <option value="">Ainda em cotação...</option>
              {prestadores.map(p => <option key={p.id} value={p.id}>{p.nome_fantasia}</option>)}
            </Form.Select>
          </Form.Group></Col>
          <Col md={3}><Form.Group><Form.Label>Custo Final (R$)</Form.Label><Form.Control type="number" step="0.01" value={manutData.custo_final} onChange={e => setManutData({...manutData, custo_final: e.target.value})} /></Form.Group></Col>
          <Col md={3}><Form.Group><Form.Label>Status</Form.Label><Form.Select value={manutData.status} onChange={e => setManutData({...manutData, status: e.target.value})}><option>Aberta</option><option>Em Andamento</option><option>Concluída</option></Form.Select></Form.Group></Col>
          {manutData.status === 'Concluída' && (
            <Col md={2}><Form.Group><Form.Label>Conclusão</Form.Label><Form.Control type="date" value={manutData.data_conclusao} onChange={e => setManutData({...manutData, data_conclusao: e.target.value})} /></Form.Group></Col>
          )}
        </Row>
      </Modal.Body>
      <Modal.Footer><Button variant="secondary" onClick={onHide}>Cancelar</Button><Button variant="success" onClick={onSave} disabled={!manutData.equipamento_id || !manutData.data_solicitacao}>Salvar Solicitação</Button></Modal.Footer>
    </Modal>
  );
}