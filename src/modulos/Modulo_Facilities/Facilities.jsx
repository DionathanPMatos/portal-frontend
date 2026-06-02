import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Card, Row, Col, Button, Table, Badge, Alert, Spinner, Tabs, Tab, Form } from "react-bootstrap";
import { format } from "date-fns";
import ModalEquipamento from "./components/ModalEquipamento";
import ModalPrestador from "./components/ModalPrestador";
import ModalManutencao from "./components/ModalManutencao";
import ModalProgManutencaoEquip from "./components/ModalProgManutencaoEquip";
import ModalInativarEquip from "./components/ModalInativarEquip";
import ModalHistoricoEquip from "./components/ModalHistoricoEquip";

const emptyEquip = { nome: "", categoria: "Ar Condicionado", marca: "", modelo: "", numero_serie: "", data_aquisicao: "", valor_aquisicao: "", garantia_meses: "", filial_id: "", centro_custo: "", fornecedor_id: "", fornecedor_nome: "", status: "Ativo", notas: "" };
const emptyPrestador = { nome_fantasia: "", cnpj: "", contato: "", telefone: "", email: "", especialidade: "" };
const emptyManutencao = { equipamento_id: "", data_solicitacao: "", tipo: "Preventiva", descricao: "", orcamento_1_prestador: "", orcamento_1_valor: "", orcamento_1_anexo: "", orcamento_2_prestador: "", orcamento_2_valor: "", orcamento_2_anexo: "", orcamento_3_prestador: "", orcamento_3_valor: "", orcamento_3_anexo: "", prestador_aprovado_id: "", custo_final: "", data_conclusao: "", status: "Aberta" };

export default function Facilities() {
  const [loading, setLoading] = useState(true);
  const [equipamentos, setEquipamentos] = useState([]);
  const [prestadores, setPrestadores] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [searchTermEquip, setSearchTermEquip] = useState("");
  const [filterFilial, setFilterFilial] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [showEquip, setShowEquip] = useState(false);
  const [equipData, setEquipData] = useState(emptyEquip);

  const [showPrestador, setShowPrestador] = useState(false);
  const [prestadorData, setPrestadorData] = useState(emptyPrestador);

  const [showManut, setShowManut] = useState(false);
  const [manutData, setManutData] = useState(emptyManutencao);

  const [showProgManut, setShowProgManut] = useState(false);
  const [progManutData, setProgManutData] = useState({ id: "", proxima_manutencao_data: "" });
  const [equipSelecionado, setEquipSelecionado] = useState(null);

  const [showInativarModal, setShowInativarModal] = useState(false);
  const [inativarData, setInativarData] = useState({ id: "", inativacao_motivo: "Descarte/Sucata", inativacao_valor: "", inativacao_destinatario: "", inativacao_observacao: "", inativado_em: new Date().toISOString().split('T')[0] });

  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [historicoEquip, setHistoricoEquip] = useState(null);
  const [historicoData, setHistoricoData] = useState([]);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resEquip, resPrestadores, resManut, resUnidades] = await Promise.all([
        axios.get("/api/facilities/equipamentos").catch(() => ({ data: [] })),
        axios.get("/api/facilities/prestadores").catch(() => ({ data: [] })),
        axios.get("/api/facilities/manutencoes").catch(() => ({ data: [] })),
        axios.get("/api/unidades").catch(() => ({ data: [] }))
      ]);
      setEquipamentos(resEquip.data || []);
      setPrestadores(resPrestadores.data || []);
      setManutencoes(resManut.data || []);
      setUnidades(resUnidades.data || []);
    } catch (e) { console.error(e); setErr("Erro ao carregar dados de Facilities."); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveEquip = async () => {
    try {
      if (equipData.id) {
        await axios.put(`/api/facilities/equipamentos/${equipData.id}`, equipData);
        setSuccess("Equipamento atualizado com sucesso!");
      } else {
        await axios.post("/api/facilities/equipamentos", equipData);
        setSuccess("Equipamento cadastrado com sucesso!");
      }
      setShowEquip(false); fetchData(); setTimeout(() => setSuccess(""), 3000);
    } catch (e) { 
      console.error(e); 
      setErr(e.response?.data?.error || "Erro ao salvar equipamento."); 
    }
  };

  const handleEditEquip = (e) => {
    setEquipData({
      ...e,
      data_aquisicao: e.data_aquisicao ? e.data_aquisicao.split('T')[0] : "",
      fornecedor_nome: e.fornecedor || ""
    });
    setShowEquip(true);
  };

  const handleSavePrestador = async () => {
    try {
      await axios.post("/api/facilities/prestadores", prestadorData);
      setSuccess("Prestador de Serviços cadastrado!");
      setShowPrestador(false); fetchData(); setTimeout(() => setSuccess(""), 3000);
    } catch (e) { 
      console.error(e); 
      setErr(e.response?.data?.error || "Erro ao salvar prestador."); 
    }
  };

  const handleSaveManut = async () => {
    try {
      if (manutData.id) {
        await axios.put(`/api/facilities/manutencoes/${manutData.id}`, manutData);
        setSuccess("Manutenção/Orçamento atualizado!");
      } else {
        await axios.post("/api/facilities/manutencoes", manutData);
        setSuccess("Manutenção/Orçamento registrado!");
      }
      setShowManut(false); fetchData(); setTimeout(() => setSuccess(""), 3000);
    } catch (e) { 
      console.error(e); 
      setErr(e.response?.data?.error || "Erro ao salvar manutenção."); 
    }
  };

  const handleEditManut = (m) => {
    setManutData({
      ...m,
      data_solicitacao: m.data_solicitacao ? m.data_solicitacao.split('T')[0] : "",
      data_conclusao: m.data_conclusao ? m.data_conclusao.split('T')[0] : "",
    });
    setShowManut(true);
  };

  const handleSaveProgManut = async () => {
    try {
      await axios.patch(`/api/facilities/equipamentos/${progManutData.id}/manutencao`, progManutData);
      setSuccess("Manutenção programada!");
      setShowProgManut(false); fetchData(); setTimeout(() => setSuccess(""), 3000);
    } catch (e) { setErr("Erro ao programar manutenção."); }
  };

  const handleSaveInativar = async () => {
    try {
      await axios.patch(`/api/facilities/equipamentos/${inativarData.id}/inativar`, inativarData);
      setSuccess("Equipamento baixado com sucesso!");
      setShowInativarModal(false); fetchData(); setTimeout(() => setSuccess(""), 3000);
    } catch (e) { setErr("Erro ao inativar equipamento."); }
  };

  const handleOpenHistorico = async (equip) => {
    setHistoricoEquip(equip);
    setHistoricoData([]); // Limpa o histórico anterior
    setShowHistoricoModal(true);
    try {
      const res = await axios.get(`/api/facilities/equipamentos/${equip.id}/historico`);
      setHistoricoData(res.data);
    } catch (e) { console.error("Erro ao buscar histórico", e); }
  };

  const filteredEquipamentos = equipamentos.filter(e => {
    const matchesSearch = !searchTermEquip || (
      (e.nome && e.nome.toLowerCase().includes(searchTermEquip.toLowerCase())) ||
      (e.numero_serie && e.numero_serie.toLowerCase().includes(searchTermEquip.toLowerCase())) ||
      (e.marca && e.marca.toLowerCase().includes(searchTermEquip.toLowerCase())) ||
      (e.categoria && e.categoria.toLowerCase().includes(searchTermEquip.toLowerCase()))
    );
    // Se tem filtro de filial, força ser da filial (e considera null/sede se o ID da filial bater)
    const matchesFilial = !filterFilial || String(e.filial_id) === String(filterFilial);
    return matchesSearch && matchesFilial;
  });

  const ativosAtivos = filteredEquipamentos.filter(e => e.status !== 'Inativo');
  const ativosInativos = filteredEquipamentos.filter(e => e.status === 'Inativo');

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <Container fluid className="px-4 mt-4">
      {err && <Alert variant="danger" onClose={() => setErr("")} dismissible>{err}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white">
          <Row className="align-items-center">
            <Col>
              <Card.Title as="h4" className="mb-0"> <i className="bi bi-building me-2"></i>Gestão de Facilities & Ativos</Card.Title>
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body>
          <Tabs 
            defaultActiveKey="ativos" 
            variant="pills" 
            className="mb-4 p-2 bg-light rounded-4 shadow-sm d-flex flex-nowrap overflow-auto"
            style={{ whiteSpace: "nowrap", gap: "0.5rem" }}
          >
            <Tab eventKey="ativos" title="Inventário de Ativos">
            <div className="d-flex justify-content-between align-items-center mt-3 mb-3 flex-wrap gap-2">
              <div className="d-flex gap-2 w-100" style={{ maxWidth: '600px' }}>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nome, marca, série ou categoria..."
                  value={searchTermEquip}
                  onChange={(e) => setSearchTermEquip(e.target.value)}
                />
                <Form.Select value={filterFilial} onChange={e => setFilterFilial(e.target.value)} style={{ minWidth: '180px' }}>
                  <option value="">Todas as Filiais</option>
                  {unidades.map(u => <option key={u.id} value={u.id}>{u.nome_unidade}</option>)}
                </Form.Select>
              </div>
              <Button variant="primary" onClick={() => { setEquipData(emptyEquip); setShowEquip(true); }}>
                + Cadastrar Equipamento
              </Button>
            </div>
            <Table striped bordered hover responsive>
                <thead>
                  <tr><th>Equipamento</th><th>Nº Série</th><th>Filial / C.C.</th><th>Aquisição / Garantia</th><th>Status</th><th>Ações</th></tr>
                </thead>
                <tbody>
                 
                  {ativosAtivos.map(e => (  
                    <tr key={e.id}>
                      <td><strong>{e.nome}</strong><br/><small className="text-muted">{e.categoria} - {e.marca} {e.modelo}</small></td>
                      <td>{e.numero_serie}</td>
                      <td>{e.filial || 'Sede'}<br/><small className="text-muted">C.C: {e.centro_custo}</small></td>
                      <td>
                        {e.data_aquisicao ? format(new Date(e.data_aquisicao), "dd/MM/yyyy") : '-'}<br/>
                        <small>{e.garantia_meses ? `${e.garantia_meses} meses` : 'Sem garantia'}</small>
                        {e.proxima_manutencao_data && (
                          <div className="mt-1"><Badge bg="info">Prog: {format(new Date(e.proxima_manutencao_data), "dd/MM/yy")}</Badge></div>
                        )}
                        
                      </td>
                      <td><Badge bg={e.status === 'Ativo' ? 'success' : 'danger'}>{e.status}</Badge></td>
                      <td>
                        <Button size="sm" variant="warning" onClick={() => { setManutData({...emptyManutencao, equipamento_id: e.id}); setShowManut(true); }}>Solicitar Manutenção</Button>
                        <Button size="sm" variant="outline-info" className="me-1 mb-1" onClick={() => { setEquipSelecionado(e); setProgManutData({ id: e.id, proxima_manutencao_data: e.proxima_manutencao_data ? e.proxima_manutencao_data.split('T')[0] : "" }); setShowProgManut(true); }}>Programar</Button>
                        <Button size="sm" variant="outline-primary" className="me-1 mb-1" onClick={() => handleEditEquip(e)}>Editar</Button>
                        <Button size="sm" variant="outline-danger" className="mb-1" onClick={() => { setEquipSelecionado(e); setInativarData({ id: e.id, inativacao_motivo: "Descarte/Sucata", inativacao_valor: "", inativacao_destinatario: "", inativacao_observacao: "", inativado_em: new Date().toISOString().split('T')[0] }); setShowInativarModal(true); }}>Baixar</Button>
                      </td>
                    </tr>
                  ))}
                 {ativosAtivos.length === 0 && <tr><td colSpan={6} className="text-center">Nenhum ativo encontrado.</td></tr>}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="baixados" title="Ativos Baixados / Inativos">
              <Table striped bordered hover responsive className="mt-3">
                <thead>
                  <tr><th>Equipamento / Série</th><th>Data Baixa</th><th>Motivo</th><th>Destinatário / Valor</th><th>Observações</th></tr>
                </thead>
                <tbody>
                  {ativosInativos.map(e => (
                    <tr key={e.id}>
                      <td><strong>{e.nome}</strong><br/><small className="text-muted">Série: {e.numero_serie}</small></td>
                      <td>{e.inativado_em ? format(new Date(e.inativado_em), "dd/MM/yyyy") : '-'}</td>
                      <td><Badge bg="secondary">{e.inativacao_motivo}</Badge></td>
                      <td>{e.inativacao_destinatario || '-'}<br/><small className="text-danger">{e.inativacao_valor ? formatCurrency(e.inativacao_valor) : ''}</small></td>
                      <td>{e.inativacao_observacao || '-'}</td>
                    </tr>
                  ))}
                  {ativosInativos.length === 0 && <tr><td colSpan={5} className="text-center">Nenhum ativo baixado.</td></tr>}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="manutencoes" title="Manutenções & Orçamentos">
              <Table striped bordered hover responsive className="mt-3">
                <thead>
                  <tr><th>Data Solicitação</th><th>Equipamento</th><th>Tipo / Descrição</th><th>Status</th><th>Custo / Prestador Final</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {manutencoes.map(m => (
                    <tr key={m.id}>
                      <td>{format(new Date(m.data_solicitacao), "dd/MM/yyyy")}</td>
                      <td><strong>{m.equipamento}</strong><br/><small>{m.numero_serie}</small></td>
                      <td>{m.tipo}<br/><small className="text-muted">{m.descricao}</small></td>
                      <td><Badge bg={m.status === 'Aberta' ? 'warning' : 'success'}>{m.status}</Badge></td>
                      <td>{m.custo_final ? formatCurrency(m.custo_final) : 'Pendente'}<br/><small>{m.prestador_aprovado || ''}</small></td>
                      <td>
                        <Button size="sm" variant="outline-primary" onClick={() => handleEditManut(m)}>Editar</Button>
                      </td>
                    </tr>
                  ))}
                  {manutencoes.length === 0 && <tr><td colSpan={6} className="text-center">Nenhuma manutenção registrada.</td></tr>}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="prestadores" title="Prestadores de Serviços">
              <div className="d-flex justify-content-end mt-3 mb-3">
                <Button variant="primary" onClick={() => { setPrestadorData(emptyPrestador); setShowPrestador(true); }}>
                  + Novo Prestador
                </Button>
              </div>
              <Table striped bordered hover responsive>
                <thead>
                  <tr><th>Nome Fantasia / Razão</th><th>CNPJ</th><th>Contato / Especialidade</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {prestadores.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.nome_fantasia}</strong></td>
                      <td>{p.cnpj}</td>
                      <td>{p.contato} - {p.telefone}<br/><small className="text-muted">{p.especialidade}</small></td>
                      <td><Badge bg={p.ativo ? 'primary' : 'secondary'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge></td>
                    </tr>
                  ))}
                  {prestadores.length === 0 && <tr><td colSpan={4} className="text-center">Nenhum prestador cadastrado.</td></tr>}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* MODAIS DO MÓDULO DE FACILITIES */}
      <ModalEquipamento 
        show={showEquip} onHide={() => setShowEquip(false)} 
        equipData={equipData} setEquipData={setEquipData} 
        unidades={unidades} prestadores={prestadores} onSave={handleSaveEquip} 
      />

      <ModalPrestador 
        show={showPrestador} onHide={() => setShowPrestador(false)} 
        prestadorData={prestadorData} setPrestadorData={setPrestadorData} 
        onSave={handleSavePrestador} 
      />

      <ModalManutencao 
        show={showManut} onHide={() => setShowManut(false)} 
        manutData={manutData} setManutData={setManutData} 
        equipamentos={equipamentos} prestadores={prestadores} onSave={handleSaveManut} 
      />
      
      <ModalProgManutencaoEquip
        show={showProgManut}
        onHide={() => setShowProgManut(false)}
        progManutData={progManutData}
        setProgManutData={setProgManutData}
        equipSelecionado={equipSelecionado}
        onSave={handleSaveProgManut}
      />

      <ModalInativarEquip
        show={showInativarModal}
        onHide={() => setShowInativarModal(false)}
        inativarData={inativarData}
        setInativarData={setInativarData}
        equipSelecionado={equipSelecionado}
        onSave={handleSaveInativar}
      />

      <ModalHistoricoEquip
        show={showHistoricoModal}
        onHide={() => setShowHistoricoModal(false)}
        equipamento={historicoEquip}
        historico={historicoData}
      />

    </Container>
  );
}