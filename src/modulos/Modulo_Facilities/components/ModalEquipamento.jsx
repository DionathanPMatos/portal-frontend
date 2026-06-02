import React from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";

export default function ModalEquipamento({ show, onHide, equipData, setEquipData, unidades, prestadores, onSave }) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton><Modal.Title>Cadastrar Novo Ativo / Equipamento</Modal.Title></Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={8}><Form.Group><Form.Label>Nome do Equipamento</Form.Label><Form.Control value={equipData.nome} onChange={e => setEquipData({...equipData, nome: e.target.value})} placeholder="Ex: Ar Condicionado Split 12000 BTUs" /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Categoria</Form.Label>
            <Form.Select value={equipData.categoria} onChange={e => setEquipData({...equipData, categoria: e.target.value})}>
              <option>Ar Condicionado</option><option>Gerador</option><option>Painel Elétrico</option><option>Informática (TI)</option><option>Mobiliário</option><option>Outros</option>
            </Form.Select>
          </Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Marca</Form.Label><Form.Control value={equipData.marca} onChange={e => setEquipData({...equipData, marca: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Modelo</Form.Label><Form.Control value={equipData.modelo} onChange={e => setEquipData({...equipData, modelo: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Número de Série</Form.Label><Form.Control value={equipData.numero_serie} onChange={e => setEquipData({...equipData, numero_serie: e.target.value})} /></Form.Group></Col>
          
          <Col md={12}><h6 className="border-bottom pb-2 text-primary fw-bold mt-4">Localização & Custos</h6></Col>
          <Col md={6}><Form.Group><Form.Label>Filial de Destino</Form.Label>
            <Form.Select value={equipData.filial_id} onChange={e => setEquipData({...equipData, filial_id: e.target.value})}>
              <option value="">Selecione a Filial...</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome_unidade}</option>)}
            </Form.Select>
          </Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Centro de Custo</Form.Label>
            <Form.Select value={equipData.centro_custo} onChange={e => setEquipData({...equipData, centro_custo: e.target.value})}>
              <option value="">Selecione...</option>
              {unidades.map(u => <option key={u.id} value={u.nome_unidade}>{u.nome_unidade}</option>)}
            </Form.Select>
          </Form.Group></Col>

          <Col md={4}><Form.Group><Form.Label>Data de Aquisição</Form.Label><Form.Control type="date" value={equipData.data_aquisicao} onChange={e => setEquipData({...equipData, data_aquisicao: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Valor de Aquisição (R$)</Form.Label><Form.Control type="number" step="0.01" value={equipData.valor_aquisicao} onChange={e => setEquipData({...equipData, valor_aquisicao: e.target.value})} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Garantia (Meses)</Form.Label><Form.Control type="number" value={equipData.garantia_meses} onChange={e => setEquipData({...equipData, garantia_meses: e.target.value})} /></Form.Group></Col>
          
          <Col md={6}><Form.Group><Form.Label>Fornecedor (Opcional)</Form.Label>
            <Form.Control 
              list="prestadores-list" 
              placeholder="Digite para buscar fornecedor..."
              value={equipData.fornecedor_nome || ''}
              onChange={e => {
                const val = e.target.value;
                const found = prestadores.find(p => p.nome_fantasia === val);
                setEquipData({...equipData, fornecedor_nome: val, fornecedor_id: found ? found.id : ""});
              }}
            />
            <datalist id="prestadores-list">
              {prestadores.map(p => <option key={p.id} value={p.nome_fantasia} />)}
            </datalist>
          </Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Status Inicial</Form.Label>
            <Form.Select value={equipData.status} onChange={e => setEquipData({...equipData, status: e.target.value})}>
              <option>Ativo</option><option>Em Manutenção</option><option>Baixado</option>
            </Form.Select>
          </Form.Group></Col>
          <Col md={12}><Form.Group><Form.Label>Notas / Especificações Técnicas</Form.Label><Form.Control as="textarea" rows={2} value={equipData.notas} onChange={e => setEquipData({...equipData, notas: e.target.value})} /></Form.Group></Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={onSave} disabled={!equipData.nome || !equipData.categoria}>Salvar Equipamento</Button>
      </Modal.Footer>
    </Modal>
  );
}