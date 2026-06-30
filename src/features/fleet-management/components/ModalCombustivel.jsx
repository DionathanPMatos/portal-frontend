import React, { useState, useEffect } from "react";
import { Modal, Form, Row, Col, Button, InputGroup, Alert, Spinner, Dropdown } from "react-bootstrap";
import apiClient from "../../../services/api";
import ModalPrestador from "../../facilities/components/ModalPrestador";

const initialForm = {
  veiculo_id: "",
  data_custo: new Date().toISOString().split('T')[0],
  motorista_id: "",
  local: "",
  fornecedor_id: "",
  forma_pagamento_id: "",
  plano_conta_id: "",
  preco_combustivel: "",
  litros: "",
  desconto: "0",
  valor: "0",
  quilometragem: "",
  centro_custo: "",
  nota_fiscal: "",
  anexo: null
};

export default function ModalCombustivel({
  show,
  onHide,
  veiculos = [],
  funcionarios = [],
  onSave,
  abastecimentoData
}) {
  const [formData, setFormData] = useState(initialForm);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [planosConta, setPlanosConta] = useState([]);
  const [prestadores, setPrestadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modais de Criação Rápida
  const [showQuickFornecedor, setShowQuickFornecedor] = useState(false);
  const [prestadorData, setPrestadorData] = useState({
    nome_fantasia: "", cnpj: "", contato: "", telefone: "", email: "", especialidade: "", classificacao: 0, observacoes: "", ativo: true,
    razao_social: "", cpf_responsavel: "", inscricao_estadual: "", site_empresa: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", subcategoria: "", porte_empresa: "", nome_responsavel: "", whatsapp_comercial: "", contrato_assinado: false, data_vencimento_seguro: ""
  });
  const emptyPrestador = {
    nome_fantasia: "", cnpj: "", contato: "", telefone: "", email: "", especialidade: "", classificacao: 0, observacoes: "", ativo: true,
    razao_social: "", cpf_responsavel: "", inscricao_estadual: "", site_empresa: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", subcategoria: "", porte_empresa: "", nome_responsavel: "", whatsapp_comercial: "", contrato_assinado: false, data_vencimento_seguro: ""
  };

  const [showQuickFormaPg, setShowQuickFormaPg] = useState(false);
  const [newFormaPgName, setNewFormaPgName] = useState("");
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardBrand, setNewCardBrand] = useState("");

  const [showQuickPlano, setShowQuickPlano] = useState(false);
  const [newPlanoName, setNewPlanoName] = useState("");

  const [fornecedorSearch, setFornecedorSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredFornecedores = prestadores.filter(p => {
    const query = fornecedorSearch.toLowerCase();
    return (
      (p.nome_fantasia && p.nome_fantasia.toLowerCase().includes(query)) ||
      (p.razao_social && p.razao_social.toLowerCase().includes(query)) ||
      (p.cnpj && p.cnpj.replace(/\D/g, '').includes(query.replace(/\D/g, '')))
    );
  });

  // Carrega opções do banco ao abrir
  useEffect(() => {
    if (show) {
      if (abastecimentoData) {
        setFormData({
          id: abastecimentoData.id,
          veiculo_id: abastecimentoData.veiculo_id || "",
          data_custo: abastecimentoData.data_custo ? new Date(abastecimentoData.data_custo).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          motorista_id: abastecimentoData.motorista_id || "",
          local: abastecimentoData.local || "",
          fornecedor_id: abastecimentoData.fornecedor_id || "",
          forma_pagamento_id: abastecimentoData.forma_pagamento_id || "",
          plano_conta_id: abastecimentoData.plano_conta_id || "",
          preco_combustivel: abastecimentoData.preco_combustivel || "",
          litros: abastecimentoData.litros || "",
          desconto: abastecimentoData.desconto || "0",
          valor: abastecimentoData.valor || "0",
          quilometragem: abastecimentoData.quilometragem || "",
          centro_custo: abastecimentoData.centro_custo || "",
          nota_fiscal: abastecimentoData.nota_fiscal || "",
          anexo: null
        });
      } else {
        setFormData(initialForm);
      }
      setErrorMsg("");
      loadMetadata();
    }
  }, [show, abastecimentoData]);

  // Recalcula o Valor Total automaticamente
  useEffect(() => {
    const preco = parseFloat(formData.preco_combustivel) || 0;
    const litros = parseFloat(formData.litros) || 0;
    const desconto = parseFloat(formData.desconto) || 0;
    const total = Math.max(0, (preco * litros) - desconto);
    setFormData(prev => ({ ...prev, valor: total.toFixed(2) }));
  }, [formData.preco_combustivel, formData.litros, formData.desconto]);

  const loadMetadata = async () => {
    setLoading(true);
    try {
      const [resPg, resPlano, resPrest] = await Promise.all([
        apiClient.get("/api/frota/combustivel/formas-pagamento"),
        apiClient.get("/api/frota/combustivel/planos-conta"),
        apiClient.get("/api/facilities/prestadores").catch(() => ({ data: [] })) // Fallback se falhar
      ]);
      setFormasPagamento(resPg.data || []);
      setPlanosConta(resPlano.data || []);
      setPrestadores((resPrest.data || []).filter(p => p.ativo !== false));
    } catch (e) {
      console.error(e);
      setErrorMsg("Erro ao carregar dados auxiliares.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFullPrestador = async () => {
    try {
      const res = await apiClient.post("/api/facilities/prestadores", prestadorData);
      const newPrestadorId = res.data.id;
      
      // Atualiza a lista local de fornecedores
      const updatedPrestList = await apiClient.get("/api/facilities/prestadores");
      setPrestadores((updatedPrestList.data || []).filter(p => p.ativo !== false));
      
      // Seleciona o novo fornecedor criado
      setFormData(prev => ({ ...prev, fornecedor_id: newPrestadorId }));
      setShowQuickFornecedor(false);
      setPrestadorData(emptyPrestador);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || "Erro ao salvar fornecedor.");
    }
  };

  const handleCreateFormaPg = async () => {
    if (!newFormaPgName.trim()) return;
    try {
      const res = await apiClient.post("/api/frota/combustivel/formas-pagamento", {
        nome: newFormaPgName,
        numero_cartao: newCardNumber,
        bandeira: newCardBrand
      });
      setFormasPagamento(prev => [...prev, res.data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setFormData(prev => ({ ...prev, forma_pagamento_id: res.data.id }));
      setShowQuickFormaPg(false);
      setNewFormaPgName("");
      setNewCardNumber("");
      setNewCardBrand("");
    } catch (e) {
      alert("Erro ao cadastrar forma de pagamento.");
    }
  };

  const handleCreatePlano = async () => {
    if (!newPlanoName.trim()) return;
    try {
      const res = await apiClient.post("/api/frota/combustivel/planos-conta", { nome: newPlanoName });
      setPlanosConta(prev => [...prev, res.data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setFormData(prev => ({ ...prev, plano_conta_id: res.data.id }));
      setShowQuickPlano(false);
      setNewPlanoName("");
    } catch (e) {
      alert("Erro ao cadastrar plano de conta.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, anexo: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.veiculo_id) return setErrorMsg("Selecione o veículo.");
    if (!formData.data_custo) return setErrorMsg("Selecione a data.");
    if (!formData.valor || parseFloat(formData.valor) <= 0) return setErrorMsg("Informe valores válidos.");

    setSaving(true);
    setErrorMsg("");

    const dataToSend = new FormData();
    dataToSend.append("veiculo_id", formData.veiculo_id);
    dataToSend.append("tipo_custo", "Abastecimento");
    dataToSend.append("data_custo", formData.data_custo);
    dataToSend.append("motorista_id", formData.motorista_id);
    dataToSend.append("local", formData.local);
    dataToSend.append("fornecedor_id", formData.fornecedor_id);
    dataToSend.append("forma_pagamento_id", formData.forma_pagamento_id);
    dataToSend.append("plano_conta_id", formData.plano_conta_id);
    dataToSend.append("preco_combustivel", formData.preco_combustivel);
    dataToSend.append("litros", formData.litros);
    dataToSend.append("desconto", formData.desconto);
    dataToSend.append("valor", formData.valor);
    dataToSend.append("quilometragem", formData.quilometragem);
    dataToSend.append("centro_custo", formData.centro_custo);
    dataToSend.append("nota_fiscal", formData.nota_fiscal);
    if (formData.anexo) {
      dataToSend.append("anexo_file", formData.anexo);
    }

    try {
      await onSave(dataToSend, formData.id);
      onHide();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Erro ao salvar abastecimento.");
    } finally {
      setSaving(false);
    }
  };

  // Preenche automaticamente o Centro de Custo e a Forma de Pagamento se o veículo selecionado já possuir
  useEffect(() => {
    if (formData.veiculo_id) {
      const selected = veiculos.find(v => String(v.id) === String(formData.veiculo_id));
      setFormData(prev => {
        const update = {};
        if (selected?.centro_custo && !prev.centro_custo) {
          update.centro_custo = selected.centro_custo;
        }
        if (!abastecimentoData && selected?.forma_pagamento_id && !prev.forma_pagamento_id) {
          update.forma_pagamento_id = selected.forma_pagamento_id;
        }
        return Object.keys(update).length > 0 ? { ...prev, ...update } : prev;
      });
    }
  }, [formData.veiculo_id, veiculos, abastecimentoData]);

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" backdrop="static">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-primary fw-bold">
            <i className="bi bi-fuel-pump me-2"></i>
            {abastecimentoData ? "Editar Lançamento de Combustível" : "Lançar Abastecimento"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
            {loading ? (
              <div className="text-center py-4"><Spinner animation="border" /></div>
            ) : (
              <Row className="g-3">
                
                {/* VEÍCULO & DATA */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Veículo <span className="text-danger">*</span></Form.Label>
                    <Form.Select 
                      name="veiculo_id" 
                      value={formData.veiculo_id} 
                      onChange={handleChange} 
                      required
                    >
                      <option value="">Selecione o veículo...</option>
                      {veiculos.map(v => (
                        <option key={v.id} value={v.id}>{v.marca} {v.modelo} - Placa: {v.placa} {v.numeracao ? `(#${v.numeracao})` : ''}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Data <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="date" 
                      name="data_custo" 
                      value={formData.data_custo} 
                      onChange={handleChange} 
                      required 
                    />
                  </Form.Group>
                </Col>

                {/* MOTORISTA & LOCAL */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Motorista / Colaborador</Form.Label>
                    <Form.Select 
                      name="motorista_id" 
                      value={formData.motorista_id} 
                      onChange={handleChange}
                    >
                      <option value="">Selecione o colaborador...</option>
                      {funcionarios.map(f => (
                        <option key={f.id} value={f.id}>{f.nome_completo}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Local / Posto</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="local" 
                      placeholder="Ex: Auto Posto Shell Centro" 
                      value={formData.local} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>

                {/* FORNECEDOR COM CADASTRO inline */}
                <Col md={6}>
                  <Form.Group className="position-relative">
                    <Form.Label className="fw-semibold">Fornecedor</Form.Label>
                    <InputGroup>
                      <Dropdown className="w-100 flex-grow-1" show={showDropdown} onToggle={(isOpen) => setShowDropdown(isOpen)}>
                        <Dropdown.Toggle 
                          variant="outline-secondary" 
                          className="w-100 text-start d-flex justify-content-between align-items-center"
                          style={{ borderColor: '#ced4da', color: '#495057', borderRadius: '0.375rem 0 0 0.375rem', height: '100%', minHeight: '38px' }}
                        >
                          {(() => {
                            const selected = prestadores.find(p => String(p.id) === String(formData.fornecedor_id));
                            return selected ? selected.nome_fantasia : "Selecione o fornecedor...";
                          })()}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100 shadow" style={{ maxHeight: '300px', overflowY: 'auto', zIndex: 1050 }}>
                          <div className="px-3 py-2 border-bottom sticky-top bg-white">
                            <Form.Control
                              type="text"
                              placeholder="Pesquisar por nome ou CNPJ..."
                              value={fornecedorSearch}
                              onChange={(e) => setFornecedorSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()} // Impede o fechar do dropdown
                            />
                          </div>
                          {filteredFornecedores.length === 0 ? (
                            <Dropdown.Item disabled className="text-muted text-center py-3">Nenhum fornecedor encontrado</Dropdown.Item>
                          ) : (
                            filteredFornecedores.map(p => (
                              <Dropdown.Item 
                                key={p.id} 
                                active={String(formData.fornecedor_id) === String(p.id)}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, fornecedor_id: p.id }));
                                  setFornecedorSearch("");
                                  setShowDropdown(false);
                                }}
                              >
                                <div><strong>{p.nome_fantasia}</strong></div>
                                {p.cnpj && <div className="text-muted small" style={{ fontSize: '0.75rem' }}>CNPJ: {p.cnpj}</div>}
                              </Dropdown.Item>
                            ))
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                      <Button variant="outline-primary" onClick={() => setShowQuickFornecedor(true)} style={{ zIndex: 5 }}>+</Button>
                    </InputGroup>
                  </Form.Group>
                </Col>

                {/* FORMA DE PAGAMENTO COM CADASTRO inline */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Forma de Pagamento</Form.Label>
                    <InputGroup>
                      <Form.Select 
                        name="forma_pagamento_id" 
                        value={formData.forma_pagamento_id} 
                        onChange={handleChange}
                      >
                        <option value="">Selecione a forma de pagamento...</option>
                        {formasPagamento.map(fp => (
                          <option key={fp.id} value={fp.id}>
                            {fp.nome} {fp.bandeira ? `(${fp.bandeira})` : ""} {fp.numero_cartao ? `- ${fp.numero_cartao}` : ""}
                          </option>
                        ))}
                      </Form.Select>
                      <Button variant="outline-primary" onClick={() => setShowQuickFormaPg(true)}>+</Button>
                    </InputGroup>
                  </Form.Group>
                </Col>

                {/* PLANO DE CONTA COM CADASTRO inline */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Plano de Contas</Form.Label>
                    <InputGroup>
                      <Form.Select 
                        name="plano_conta_id" 
                        value={formData.plano_conta_id} 
                        onChange={handleChange}
                      >
                        <option value="">Selecione o plano de contas...</option>
                        {planosConta.map(pc => (
                          <option key={pc.id} value={pc.id}>{pc.nome}</option>
                        ))}
                      </Form.Select>
                      <Button variant="outline-primary" onClick={() => setShowQuickPlano(true)}>+</Button>
                    </InputGroup>
                  </Form.Group>
                </Col>

                {/* NOTA FISCAL & KM */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Nota Fiscal</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nota_fiscal" 
                      placeholder="Nº da NF" 
                      value={formData.nota_fiscal} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">KM / Odômetro</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="quilometragem" 
                      placeholder="Odômetro atual" 
                      value={formData.quilometragem} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>

                {/* VALORES E MEDIDAS */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Preço Litro</Form.Label>
                    <Form.Control 
                      type="number" 
                      step="0.001" 
                      name="preco_combustivel" 
                      placeholder="R$ 0,000" 
                      value={formData.preco_combustivel} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Litros (Volume)</Form.Label>
                    <Form.Control 
                      type="number" 
                      step="0.01" 
                      name="litros" 
                      placeholder="Volume" 
                      value={formData.litros} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Desconto (R$)</Form.Label>
                    <Form.Control 
                      type="number" 
                      step="0.01" 
                      name="desconto" 
                      placeholder="Desconto" 
                      value={formData.desconto} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-primary">Valor Total (R$)</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="valor" 
                      value={formData.valor} 
                      readOnly 
                      className="bg-light text-primary fw-bold"
                    />
                  </Form.Group>
                </Col>

                {/* CENTRO DE CUSTO & ANEXO */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Centro de Custo</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="centro_custo" 
                      placeholder="Centro de custo do lançamento" 
                      value={formData.centro_custo} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Anexar Nota Fiscal / Cupom</Form.Label>
                    <Form.Control 
                      type="file" 
                      onChange={handleFileChange} 
                    />
                  </Form.Group>
                </Col>

              </Row>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              {abastecimentoData ? "Salvar Alterações" : "Registrar Abastecimento"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL COMPLETO DE CADASTRO DE FORNECEDOR */}
      <ModalPrestador 
        show={showQuickFornecedor} 
        onHide={() => setShowQuickFornecedor(false)} 
        prestadorData={prestadorData} 
        setPrestadorData={setPrestadorData} 
        onSave={handleSaveFullPrestador} 
      />

      {/* QUICK MODAL: FORMA PG */}
      <Modal show={showQuickFormaPg} onHide={() => setShowQuickFormaPg(false)} centered size="sm">
        <Modal.Header closeButton><Modal.Title className="h6 fw-bold">Novo Cartão / Forma Pg.</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Descrição / Nome</Form.Label>
            <Form.Control 
              type="text" 
              value={newFormaPgName} 
              onChange={e => setNewFormaPgName(e.target.value)} 
              placeholder="Ex: Cartão Combustível"
              required
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Bandeira (Opcional)</Form.Label>
            <Form.Control 
              type="text" 
              value={newCardBrand} 
              onChange={e => setNewCardBrand(e.target.value)} 
              placeholder="Ex: Visa, MasterCard"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Número do Cartão (Opcional)</Form.Label>
            <Form.Control 
              type="text" 
              value={newCardNumber} 
              onChange={e => setNewCardNumber(e.target.value)} 
              placeholder="Ex: Final 4321"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowQuickFormaPg(false)}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleCreateFormaPg}>Adicionar</Button>
        </Modal.Footer>
      </Modal>

      {/* QUICK MODAL: PLANO */}
      <Modal show={showQuickPlano} onHide={() => setShowQuickPlano(false)} centered size="sm">
        <Modal.Header closeButton><Modal.Title className="h6 fw-bold">Novo Plano de Conta</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nome do Plano</Form.Label>
            <Form.Control 
              type="text" 
              value={newPlanoName} 
              onChange={e => setNewPlanoName(e.target.value)} 
              placeholder="Ex: 2.1.3 - Abastecimentos"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowQuickPlano(false)}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleCreatePlano}>Adicionar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
