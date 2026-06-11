import React, { useState } from "react";
import { Modal, Row, Col, Form, Button, Tabs, Tab, InputGroup, Spinner } from "react-bootstrap";
import apiClient from "../../../services/api";


export default function ModalPrestador({ show, onHide, prestadorData, setPrestadorData, onSave }) {
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const handleBuscarCNPJ = async () => {
    const cnpjLimpo = prestadorData.cnpj?.replace(/\D/g, '');
    if (!cnpjLimpo || cnpjLimpo.length !== 14) return;
    
    setLoadingCnpj(true);
    try {
      const res = await apiClient.get(`/api/utils/cnpj/${cnpjLimpo}`);
      setPrestadorData({
        ...prestadorData,
        ...res.data
      });
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
    } finally {
      setLoadingCnpj(false);
    }
  };

  const handleBuscarCEP = async () => {
    const cepLimpo = prestadorData.cep?.replace(/\D/g, '');
    if (!cepLimpo || cepLimpo.length !== 8) return;

    setLoadingCep(true);
    try {
      const res = await apiClient.get(`/api/utils/cep/${cepLimpo}`);
      setPrestadorData({
        ...prestadorData,
        ...res.data
      });
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton><Modal.Title>{prestadorData.id ? 'Editar Prestador de Serviços' : 'Novo Prestador de Serviços'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey="identificacao" className="mb-3">
          <Tab eventKey="identificacao" title="Identificação & Local">
            <Row className="g-3">
              <Col md={4}><Form.Group><Form.Label>CNPJ</Form.Label>
                <InputGroup>
                  <Form.Control value={prestadorData.cnpj || ''} onChange={e => setPrestadorData({...prestadorData, cnpj: e.target.value})} onBlur={handleBuscarCNPJ} placeholder="Apenas números" />
                  <Button variant="outline-secondary" onClick={handleBuscarCNPJ} disabled={loadingCnpj}>
                    {loadingCnpj ? <Spinner as="span" animation="border" size="sm" /> : <i className="bi bi-search"></i>}
                  </Button>
                </InputGroup>
              </Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Razão Social <span className="text-danger">*</span></Form.Label><Form.Control value={prestadorData.razao_social || ''} onChange={e => setPrestadorData({...prestadorData, razao_social: e.target.value})} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Nome Fantasia <span className="text-danger">*</span></Form.Label><Form.Control value={prestadorData.nome_fantasia || ''} onChange={e => setPrestadorData({...prestadorData, nome_fantasia: e.target.value})} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>CPF Responsável (MEI/PF)</Form.Label><Form.Control value={prestadorData.cpf_responsavel || ''} onChange={e => setPrestadorData({...prestadorData, cpf_responsavel: e.target.value})} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Inscrição Estadual</Form.Label><Form.Control value={prestadorData.inscricao_estadual || ''} onChange={e => setPrestadorData({...prestadorData, inscricao_estadual: e.target.value})} /></Form.Group></Col>
              
              <Col md={12}><h6 className="border-bottom pb-2 text-primary fw-bold mt-2">Localização</h6></Col>
              <Col md={3}><Form.Group><Form.Label>CEP</Form.Label>
                <InputGroup>
                  <Form.Control value={prestadorData.cep || ''} onChange={e => setPrestadorData({...prestadorData, cep: e.target.value})} onBlur={handleBuscarCEP} />
                  <Button variant="outline-secondary" onClick={handleBuscarCEP} disabled={loadingCep}>
                    {loadingCep ? <Spinner as="span" animation="border" size="sm" /> : <i className="bi bi-search"></i>}
                  </Button>
                </InputGroup>
              </Form.Group></Col>
              <Col md={7}><Form.Group><Form.Label>Logradouro (Rua, Av...)</Form.Label><Form.Control value={prestadorData.logradouro || ''} onChange={e => setPrestadorData({...prestadorData, logradouro: e.target.value})} /></Form.Group></Col>
              <Col md={2}><Form.Group><Form.Label>Número</Form.Label><Form.Control value={prestadorData.numero || ''} onChange={e => setPrestadorData({...prestadorData, numero: e.target.value})} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Complemento</Form.Label><Form.Control value={prestadorData.complemento || ''} onChange={e => setPrestadorData({...prestadorData, complemento: e.target.value})} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Bairro</Form.Label><Form.Control value={prestadorData.bairro || ''} onChange={e => setPrestadorData({...prestadorData, bairro: e.target.value})} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Cidade</Form.Label><Form.Control value={prestadorData.cidade || ''} onChange={e => setPrestadorData({...prestadorData, cidade: e.target.value})} /></Form.Group></Col>
              <Col md={1}><Form.Group><Form.Label>UF</Form.Label><Form.Control value={prestadorData.uf || ''} onChange={e => setPrestadorData({...prestadorData, uf: e.target.value})} /></Form.Group></Col>
            </Row>
          </Tab>
          
          <Tab eventKey="contatos" title="Contatos & Especialidade">
            <Row className="g-3">
              <Col md={4}><Form.Group><Form.Label>Especialidade</Form.Label><Form.Control value={prestadorData.especialidade || ''} onChange={e => setPrestadorData({...prestadorData, especialidade: e.target.value})} placeholder="Ex: Climatização" /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Subcategoria</Form.Label><Form.Control value={prestadorData.subcategoria || ''} onChange={e => setPrestadorData({...prestadorData, subcategoria: e.target.value})} placeholder="Ex: Limpeza de dutos" /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Porte da Empresa</Form.Label>
                <Form.Select value={prestadorData.porte_empresa || ''} onChange={e => setPrestadorData({...prestadorData, porte_empresa: e.target.value})}>
                  <option value="">Selecione...</option><option value="MEI">MEI</option><option value="Microempresa (ME)">Microempresa (ME)</option><option value="Pequeno Porte (EPP)">Pequeno Porte (EPP)</option><option value="Médio/Grande">Médio/Grande</option>
                </Form.Select>
              </Form.Group></Col>

              <Col md={12}><h6 className="border-bottom pb-2 text-primary fw-bold mt-2">Contatos Comerciais</h6></Col>
              <Col md={4}><Form.Group><Form.Label>Nome do Contato Principal</Form.Label><Form.Control value={prestadorData.contato || ''} onChange={e => setPrestadorData({...prestadorData, contato: e.target.value})} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Telefone Fixo</Form.Label><Form.Control value={prestadorData.telefone || ''} onChange={e => setPrestadorData({...prestadorData, telefone: e.target.value})} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>E-mail Padrão</Form.Label><Form.Control type="email" value={prestadorData.email || ''} onChange={e => setPrestadorData({...prestadorData, email: e.target.value})} /></Form.Group></Col>
              
              <Col md={4}><Form.Group><Form.Label>Gerente / Responsável</Form.Label><Form.Control value={prestadorData.nome_responsavel || ''} onChange={e => setPrestadorData({...prestadorData, nome_responsavel: e.target.value})} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>WhatsApp Comercial</Form.Label><Form.Control value={prestadorData.whatsapp_comercial || ''} onChange={e => setPrestadorData({...prestadorData, whatsapp_comercial: e.target.value})} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Site da Empresa</Form.Label><Form.Control value={prestadorData.site_empresa || ''} onChange={e => setPrestadorData({...prestadorData, site_empresa: e.target.value})} /></Form.Group></Col>
            </Row>
          </Tab>

          <Tab eventKey="compliance" title="Compliance & Avaliação">
            <Row className="g-3">
              <Col md={4}><Form.Group><Form.Label>Possui Contrato Assinado?</Form.Label>
                <Form.Check type="switch" checked={prestadorData.contrato_assinado || false} onChange={e => setPrestadorData({...prestadorData, contrato_assinado: e.target.checked})} label={prestadorData.contrato_assinado ? "Sim" : "Não"} className="mt-2" />
              </Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Vencimento Seguro Respon. Civil</Form.Label><Form.Control type="date" value={prestadorData.data_vencimento_seguro || ''} onChange={e => setPrestadorData({...prestadorData, data_vencimento_seguro: e.target.value})} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Classificação Interna (Estrelas)</Form.Label>
                <Form.Select value={prestadorData.classificacao || 0} onChange={e => setPrestadorData({...prestadorData, classificacao: parseInt(e.target.value)})}>
                  <option value={0}>Sem avaliação</option><option value={1}>1 - Ruim</option><option value={2}>2 - Regular</option><option value={3}>3 - Bom</option><option value={4}>4 - Muito Bom</option><option value={5}>5 - Excelente</option>
                </Form.Select>
              </Form.Group></Col>
              <Col md={12}><Form.Group><Form.Label>Observações de Conformidade e Auditoria</Form.Label><Form.Control as="textarea" rows={3} value={prestadorData.observacoes || ""} onChange={e => setPrestadorData({...prestadorData, observacoes: e.target.value})} placeholder="Comportamento, advertências, restrições..."/></Form.Group></Col>
            </Row>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={onSave} disabled={!prestadorData.nome_fantasia || !prestadorData.razao_social}>Salvar Prestador</Button>
      </Modal.Footer>
    </Modal>
  );
}