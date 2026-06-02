import React from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";

export default function ModalPrestador({ show, onHide, prestadorData, setPrestadorData, onSave }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton><Modal.Title>Novo Prestador de Serviços</Modal.Title></Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}><Form.Group><Form.Label>Razão Social / Nome Fantasia</Form.Label><Form.Control value={prestadorData.nome_fantasia} onChange={e => setPrestadorData({...prestadorData, nome_fantasia: e.target.value})} /></Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>CNPJ</Form.Label><Form.Control value={prestadorData.cnpj} onChange={e => setPrestadorData({...prestadorData, cnpj: e.target.value})} /></Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Especialidade</Form.Label><Form.Control value={prestadorData.especialidade} onChange={e => setPrestadorData({...prestadorData, especialidade: e.target.value})} placeholder="Ex: Climatização" /></Form.Group></Col>
          
          <Col md={12}><h6 className="border-bottom pb-2 text-primary fw-bold mt-4">Contatos</h6></Col>
          <Col md={12}><Form.Group><Form.Label>Nome do Contato</Form.Label><Form.Control value={prestadorData.contato} onChange={e => setPrestadorData({...prestadorData, contato: e.target.value})} /></Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Telefone / WhatsApp</Form.Label><Form.Control value={prestadorData.telefone} onChange={e => setPrestadorData({...prestadorData, telefone: e.target.value})} /></Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>E-mail</Form.Label><Form.Control type="email" value={prestadorData.email} onChange={e => setPrestadorData({...prestadorData, email: e.target.value})} /></Form.Group></Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={onSave} disabled={!prestadorData.nome_fantasia}>Salvar Prestador</Button>
      </Modal.Footer>
    </Modal>
  );
}