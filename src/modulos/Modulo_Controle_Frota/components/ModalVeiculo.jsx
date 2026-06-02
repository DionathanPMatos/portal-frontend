import React from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";

export default function ModalVeiculo({
  show,
  onHide,
  veiculoData,
  setVeiculoData,
  unidades,
  onSave
}) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Cadastrar Novo Veículo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}><h6 className="border-bottom pb-2 text-primary fw-bold mt-2">Dados Principais</h6></Col>
          <Col md={4}>
            <Form.Group><Form.Label>Marca</Form.Label>
              <Form.Control value={veiculoData.marca} onChange={e => setVeiculoData({...veiculoData, marca: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group><Form.Label>Modelo</Form.Label>
              <Form.Control value={veiculoData.modelo} onChange={e => setVeiculoData({...veiculoData, modelo: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group><Form.Label>Ano</Form.Label>
              <Form.Control type="number" value={veiculoData.ano} onChange={e => setVeiculoData({...veiculoData, ano: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group><Form.Label>Placa</Form.Label>
              <Form.Control value={veiculoData.placa} onChange={e => setVeiculoData({...veiculoData, placa: e.target.value.toUpperCase()})} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group><Form.Label>Combustível</Form.Label>
              <Form.Select value={veiculoData.tipo_combustivel} onChange={e => setVeiculoData({...veiculoData, tipo_combustivel: e.target.value})}>
                <option>Flex</option><option>Gasolina</option><option>Etanol</option><option>Diesel</option><option>Elétrico</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group><Form.Label>Odômetro Inicial (KM)</Form.Label>
              <Form.Control type="number" value={veiculoData.quilometragem_atual} onChange={e => setVeiculoData({...veiculoData, quilometragem_atual: e.target.value})} />
            </Form.Group>
          </Col>
          
          <Col md={12}><h6 className="border-bottom pb-2 text-primary fw-bold mt-4">Atribuição e Gestão</h6></Col>
          <Col md={4}>
            <Form.Group><Form.Label>Unidade / Filial</Form.Label>
              <Form.Select value={veiculoData.unidade_id} onChange={e => setVeiculoData({...veiculoData, unidade_id: e.target.value})}>
                <option value="">Não Vinculado</option>
                {unidades.map(u => (<option key={u.id} value={u.id}>{u.nome_unidade}</option>))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group><Form.Label>Centro de Custo</Form.Label>
              <Form.Select value={veiculoData.centro_custo} onChange={e => setVeiculoData({...veiculoData, centro_custo: e.target.value})}>
                <option value="">Selecione...</option>
                {unidades.map(u => (
                  <option key={u.id} value={u.nome_unidade}>{u.nome_unidade}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group><Form.Label>Status Atual</Form.Label>
              <Form.Select value={veiculoData.status || 'Disponível'} onChange={e => setVeiculoData({...veiculoData, status: e.target.value})}>
                <option value="Disponível">Disponível</option>
                <option value="Em Uso">Em uso</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Sinistro">Sinistro</option>
                <option value="Inativo">Inativo</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group><Form.Label>Categoria</Form.Label>
              <Form.Select value={veiculoData.categoria} onChange={e => setVeiculoData({...veiculoData, categoria: e.target.value})}>
                <option>Passeio</option><option>Utilitário</option><option>Carga</option><option>Motocicleta</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group><Form.Label>Data Aquisição</Form.Label>
              <Form.Control type="date" value={veiculoData.data_aquisicao} onChange={e => setVeiculoData({...veiculoData, data_aquisicao: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group><Form.Label>Valor do Bem (R$)</Form.Label>
              <Form.Control type="number" step="0.01" value={veiculoData.valor_bem} onChange={e => setVeiculoData({...veiculoData, valor_bem: e.target.value})} />
            </Form.Group>
          </Col>

          <Col md={12}><h6 className="border-bottom pb-2 text-primary fw-bold mt-4">Controle de Documentação e Alertas</h6></Col>
          <Col md={6}>
            <Form.Group><Form.Label>Renavam</Form.Label>
              <Form.Control value={veiculoData.renavam || ''} onChange={e => setVeiculoData({...veiculoData, renavam: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Chassi</Form.Label>
              <Form.Control value={veiculoData.chassi || ''} onChange={e => setVeiculoData({...veiculoData, chassi: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group><Form.Label>Apólice de Seguro</Form.Label>
              <Form.Control value={veiculoData.apolice_seguro || ''} onChange={e => setVeiculoData({...veiculoData, apolice_seguro: e.target.value})} placeholder="Número ou Referência da Apólice" />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group><Form.Label>Vencimento Seguro</Form.Label>
              <Form.Control type="date" value={veiculoData.data_vencimento_seguro || ''} onChange={e => setVeiculoData({...veiculoData, data_vencimento_seguro: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group><Form.Label>Vencimento IPVA</Form.Label>
              <Form.Control type="date" value={veiculoData.data_vencimento_ipva || ''} onChange={e => setVeiculoData({...veiculoData, data_vencimento_ipva: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group><Form.Label>Venc. Licenciamento</Form.Label>
              <Form.Control type="date" value={veiculoData.data_vencimento_licenciamento || ''} onChange={e => setVeiculoData({...veiculoData, data_vencimento_licenciamento: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group><Form.Label>Próxima Vistoria</Form.Label>
              <Form.Control type="date" value={veiculoData.data_vencimento_vistoria || ''} onChange={e => setVeiculoData({...veiculoData, data_vencimento_vistoria: e.target.value})} />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button 
          variant="primary" 
          onClick={onSave}
          disabled={!veiculoData.placa || !veiculoData.modelo}
        >
          Salvar Veículo
        </Button>
      </Modal.Footer>
    </Modal>
  );
}