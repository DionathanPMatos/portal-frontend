import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Button, Table, Badge, Alert, Spinner, Tabs, Tab, Form } from "react-bootstrap";
import { format } from "date-fns";
import ModalEquipamento from "../components/ModalEquipamento";
import ModalPrestador from "../components/ModalPrestador";
import ModalManutencao from "../components/ModalManutencao";
import ModalProgManutencaoEquip from "../components/ModalProgManutencaoEquip";
import ModalInativarEquip from "../components/ModalInativarEquip";
import ModalHistoricoEquip from "../components/ModalHistoricoEquip";
import ModalImportarEquip from "../components/ModalImportarEquip";
import ModalImportarPrestador from "../components/ModalImportarPrestador";
import apiClient from "../../../services/api";

const emptyEquip = { nome: "", categoria: "Ar Condicionado", marca: "", modelo: "", numero_serie: "", data_aquisicao: "", valor_aquisicao: "", garantia_meses: "", filial_id: "", centro_custo: "", fornecedor_id: "", fornecedor_nome: "", status: "Ativo", notas: "", exige_manutencao_programada: false };
const emptyPrestador = { 
  nome_fantasia: "", cnpj: "", contato: "", telefone: "", email: "", especialidade: "", classificacao: 0, observacoes: "", ativo: true,
  razao_social: "", cpf_responsavel: "", inscricao_estadual: "", site_empresa: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", subcategoria: "", porte_empresa: "", nome_responsavel: "", whatsapp_comercial: "", contrato_assinado: false, data_vencimento_seguro: "" 
};
const emptyManutencao = { equipamento_id: "", data_solicitacao: "", tipo: "Preventiva", descricao: "", orcamento_1_prestador: "", orcamento_1_valor: "", orcamento_1_anexo: "", orcamento_2_prestador: "", orcamento_2_valor: "", orcamento_2_anexo: "", orcamento_3_prestador: "", orcamento_3_valor: "", orcamento_3_anexo: "", prestador_aprovado_id: "", custo_final: "", data_conclusao: "", status: "Aberta" };

export default function Facilities() {
  const [loading, setLoading] = useState(true);
  const [equipamentos, setEquipamentos] = useState([]);
  const [prestadores, setPrestadores] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [searchTermEquip, setSearchTermEquip] = useState("");
  const [filterFilial, setFilterFilial] = useState("");
  const [searchTermPrestador, setSearchTermPrestador] = useState("");
  const [filterEspecialidade, setFilterEspecialidade] = useState("");
  const [filterStatusPrestador, setFilterStatusPrestador] = useState("true");
  const [filterLocalidade, setFilterLocalidade] = useState("");
  const [filterClassificacao, setFilterClassificacao] = useState("");
  const [dashFilial, setDashFilial] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const [showEquip, setShowEquip] = useState(false);
  const [equipData, setEquipData] = useState(emptyEquip);

  const [showImportar, setShowImportar] = useState(false);
  const [showImportarPrestador, setShowImportarPrestador] = useState(false);

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

  const calcularStatusGarantia = (dataAquisicao, garantiaMeses) => {
    if (!dataAquisicao || !garantiaMeses) return { texto: 'Sem garantia', variant: 'muted' };
    const fimGarantia = new Date(dataAquisicao);
    fimGarantia.setMonth(fimGarantia.getMonth() + parseInt(garantiaMeses, 10));
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    fimGarantia.setHours(0, 0, 0, 0);

    if (fimGarantia < hoje) {
      return { texto: 'Fora da garantia', variant: 'danger' };
    }

    const diffTime = Math.abs(fimGarantia - hoje);
    const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDias > 30) {
      const diffMeses = Math.floor(diffDias / 30);
      return { texto: `Garantia: resta(m) ${diffMeses} mês(es)`, variant: 'success' };
    } else {
      return { texto: `Garantia: resta(m) ${diffDias} dia(s)`, variant: 'warning' };
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(<i key={i} className={`bi bi-star${i <= rating ? '-fill text-warning' : ' text-secondary'}`}></i>);
    }
    return <span>{stars}</span>;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resEquip, resPrestadores, resManut, resUnidades] = await Promise.all([
        apiClient.get("/api/facilities/equipamentos").catch(() => ({ data: [] })),
        apiClient.get("/api/facilities/prestadores").catch(() => ({ data: [] })),
        apiClient.get("/api/facilities/manutencoes").catch(() => ({ data: [] })),
        apiClient.get("/api/unidades").catch(() => ({ data: [] }))
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
        await apiClient.put(`/api/facilities/equipamentos/${equipData.id}`, equipData);
        setSuccess("Equipamento atualizado com sucesso!");
      } else {
        await apiClient.post("/api/facilities/equipamentos", equipData);
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
      if (prestadorData.id) {
        await apiClient.put(`/api/facilities/prestadores/${prestadorData.id}`, prestadorData);
        setSuccess("Prestador de Serviços atualizado!");
      } else {
        await apiClient.post("/api/facilities/prestadores", prestadorData);
        setSuccess("Prestador de Serviços cadastrado!");
      }
      setShowPrestador(false); fetchData(); setTimeout(() => setSuccess(""), 3000);
    } catch (e) { 
      console.error(e); 
      setErr(e.response?.data?.error || "Erro ao salvar prestador."); 
    }
  };

  const handleEditPrestador = (p) => {
    setPrestadorData({
      ...p,
      data_vencimento_seguro: p.data_vencimento_seguro ? p.data_vencimento_seguro.split('T')[0] : ""
    });
    setShowPrestador(true);
  };

  const handleToggleAtivoPrestador = async (p) => {
    try {
      await apiClient.put(`/api/facilities/prestadores/${p.id}`, { ...p, ativo: !p.ativo });
      fetchData();
      setSuccess(p.ativo ? "Prestador inativado!" : "Prestador ativado!");
      setTimeout(() => setSuccess(""), 3000);
    } catch(e) {
      setErr("Erro ao alterar status do prestador.");
    }
  };

  const handleSaveManut = async () => {
    try {
      if (manutData.id) {
        await apiClient.put(`/api/facilities/manutencoes/${manutData.id}`, manutData);
        setSuccess("Manutenção/Orçamento atualizado!");
      } else {
        await apiClient.post("/api/facilities/manutencoes", manutData);
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
      await apiClient.patch(`/api/facilities/equipamentos/${progManutData.id}/manutencao`, progManutData);
      setSuccess("Manutenção programada!");
      setShowProgManut(false); fetchData(); setTimeout(() => setSuccess(""), 3000);
    } catch (e) { setErr("Erro ao programar manutenção."); }
  };

  const handleSaveInativar = async () => {
    try {
      await apiClient.patch(`/api/facilities/equipamentos/${inativarData.id}/inativar`, inativarData);
      setSuccess("Equipamento baixado com sucesso!");
      setShowInativarModal(false); fetchData(); setTimeout(() => setSuccess(""), 3000);
    } catch (e) { setErr("Erro ao inativar equipamento."); }
  };

  const handleOpenHistorico = async (equip) => {
    setHistoricoEquip(equip);
    setHistoricoData([]); // Limpa o histórico anterior
    setShowHistoricoModal(true);
    try {
      const res = await apiClient.get(`/api/facilities/equipamentos/${equip.id}/historico`);
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

  const especialidadesUnicas = [...new Set(prestadores.map(p => p.especialidade).filter(Boolean))].sort();
  const localidadesUnicas = [...new Set(prestadores.filter(p => p.cidade && p.uf).map(p => `${p.cidade}/${p.uf}`))].sort();

  const filteredPrestadores = prestadores.filter(p => {
    const matchesSearch = !searchTermPrestador || (
      (p.nome_fantasia && p.nome_fantasia.toLowerCase().includes(searchTermPrestador.toLowerCase())) ||
      (p.razao_social && p.razao_social.toLowerCase().includes(searchTermPrestador.toLowerCase())) ||
      (p.cnpj && p.cnpj.includes(searchTermPrestador)) ||
      (p.especialidade && p.especialidade.toLowerCase().includes(searchTermPrestador.toLowerCase())) ||
      (p.subcategoria && p.subcategoria.toLowerCase().includes(searchTermPrestador.toLowerCase()))
    );
    const matchesEspecialidade = !filterEspecialidade || p.especialidade === filterEspecialidade;
    const matchesStatus = filterStatusPrestador === "" || String(p.ativo) === filterStatusPrestador;
    
    const prestadorLocal = p.cidade && p.uf ? `${p.cidade}/${p.uf}` : "";
    const matchesLocalidade = !filterLocalidade || prestadorLocal === filterLocalidade;
    const matchesClassificacao = !filterClassificacao || String(p.classificacao || 0) === filterClassificacao;
    
    return matchesSearch && matchesEspecialidade && matchesStatus && matchesLocalidade && matchesClassificacao;
  });

  // --- DADOS PARA O DASHBOARD ---
  const totalAtivos = ativosAtivos.length;
  const manutencoesPendentes = manutencoes.filter(m => m.status !== 'Concluída').length;
  const progPendentes = ativosAtivos.filter(e => e.exige_manutencao_programada && !e.proxima_manutencao_data).length;
  
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const custoManutencoesMes = manutencoes
    .filter(m => {
      if (!m.data_conclusao || m.status !== 'Concluída') return false;
      const [year, month] = m.data_conclusao.split('T')[0].split('-');
      return parseInt(month, 10) - 1 === mesAtual && parseInt(year, 10) === anoAtual;
    })
    .reduce((acc, m) => acc + (parseFloat(m.custo_final) || 0), 0);

  const foraDaGarantia = ativosAtivos.filter(e => calcularStatusGarantia(e.data_aquisicao, e.garantia_meses).texto === 'Fora da garantia').length;

  const filterByDashFilial = (filial_id) => {
    if (!dashFilial) return true;
    if (dashFilial === "sede") return !filial_id;
    return String(filial_id) === String(dashFilial);
  };

  const manutencoesComFilial = manutencoes.map(m => {
    const eq = equipamentos.find(e => e.id === m.equipamento_id);
    return { ...m, filial: eq ? eq.filial : 'Sede / Base', filial_id: eq ? eq.filial_id : null };
  });

  const ultimasManutencoesDash = manutencoesComFilial.filter(m => filterByDashFilial(m.filial_id)).slice(0, 6);

  const proximasManutencoesDash = ativosAtivos.filter(e => e.proxima_manutencao_data).filter(e => filterByDashFilial(e.filial_id)).sort((a, b) => new Date(a.proxima_manutencao_data) - new Date(b.proxima_manutencao_data)).slice(0, 6);

  const resumoPorFilial = unidades.map(u => {
    const bens = ativosAtivos.filter(e => e.filial_id === u.id);
    const valorBens = bens.reduce((acc, e) => acc + (parseFloat(e.valor_aquisicao) || 0), 0);
    const custos = manutencoesComFilial.filter(m => m.filial_id === u.id && m.status === 'Concluída');
    const valorCustos = custos.reduce((acc, m) => acc + (parseFloat(m.custo_final) || 0), 0);
    return { filial: u.nome_unidade, valorBens, valorCustos };
  });
  const bensSede = ativosAtivos.filter(e => !e.filial_id);
  const custosSede = manutencoesComFilial.filter(m => !m.filial_id && m.status === 'Concluída');
  resumoPorFilial.push({ filial: 'Sede / Base', valorBens: bensSede.reduce((acc, e) => acc + (parseFloat(e.valor_aquisicao) || 0), 0), valorCustos: custosSede.reduce((acc, m) => acc + (parseFloat(m.custo_final) || 0), 0) });

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <Container fluid className="px-4 mt-4">
      <style>
        {`
          @keyframes blink-badge {
            0% { opacity: 1; }
            50% { opacity: 0.2; }
            100% { opacity: 1; }
          }
          .badge-piscante { animation: blink-badge 1.2s infinite; }
        `}
      </style>
      {err && <Alert variant="danger" onClose={() => setErr("")} dismissible>{err}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white">
          <Row className="align-items-center">
            <Col>
              <Card.Title as="h5" className="mb-0"> <i className="bi bi-building me-2"></i>Gestão de Facilities & Ativos</Card.Title>
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body>
          <Tabs 
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            variant="pills" 
            className="mb-4 p-2 bg-light rounded-4 shadow-sm d-flex flex-nowrap overflow-auto"
            style={{ whiteSpace: "nowrap", gap: "0.5rem" }}
          >
            <Tab eventKey="dashboard" title="Dashboard">
              <Row className="mt-3 g-3">
                <Col md={3}>
                  <Card className="bg-primary text-white shadow-sm border-0 h-100">
                    <Card.Body>
                      <h6>Total de Ativos (Ativos)</h6>
                      <h3>{totalAtivos}</h3>
                      <small>{foraDaGarantia} fora da garantia</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-warning text-dark shadow-sm border-0 h-100">
                    <Card.Body>
                      <h6>Manutenções Pendentes</h6>
                      <h3>{manutencoesPendentes}</h3>
                      <small>Em aberto ou andamento</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-danger text-white shadow-sm border-0 h-100">
                    <Card.Body>
                      <h6>Prog. Manutenção Pendente</h6>
                      <h3>{progPendentes}</h3>
                      <small>Equipamentos exigindo atenção</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-success text-white shadow-sm border-0 h-100">
                    <Card.Body>
                      <h6>Custo Manutenções (Mês)</h6>
                      <h3>{formatCurrency(custoManutencoesMes)}</h3>
                      <small>Manutenções concluídas neste mês</small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-3 mt-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-secondary">Filtro de Localidade do Dashboard</Form.Label>
                    <Form.Select value={dashFilial} onChange={e => setDashFilial(e.target.value)}>
                      <option value="">Geral (Todas as Filiais)</option>
                      <option value="sede">Sede / Base</option>
                      {unidades.map(u => <option key={u.id} value={u.id}>{u.nome_unidade}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Header as="h5" className="mb-0">Últimas Manutenções Solicitadas</Card.Header>
                    <Table responsive hover size="sm" className="mb-0">
                      <thead>
                        <tr><th>Data</th><th>Equipamento</th><th>Filial</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {ultimasManutencoesDash.map(m => (
                          <tr key={m.id}>
                            <td>{format(new Date(m.data_solicitacao), "dd/MM/yyyy")}</td>
                            <td>{m.equipamento}</td>
                            <td>{m.filial || 'Sede / Base'}</td>
                            <td><Badge bg={m.status === 'Aberta' ? 'danger' : m.status === 'Em Andamento' ? 'warning' : 'success'}>{m.status}</Badge></td>
                          </tr>
                        ))}
                        {ultimasManutencoesDash.length === 0 && <tr><td colSpan={4} className="text-center">Nenhuma manutenção encontrada</td></tr>}
                      </tbody>
                    </Table>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Header as="h5" className="mb-0">Próximas Manutenções Programadas</Card.Header>
                    <Table responsive hover size="sm" className="mb-0">
                      <thead>
                        <tr><th>Data Prog.</th><th>Equipamento</th><th>Filial</th></tr>
                      </thead>
                      <tbody>
                        {proximasManutencoesDash.map(e => (
                          <tr key={e.id}>
                            <td className="fw-bold text-primary">{format(new Date(e.proxima_manutencao_data), "dd/MM/yyyy")}</td>
                            <td>{e.nome} <br/><small className="text-muted">{e.numero_serie}</small></td>
                            <td>{e.filial || 'Sede / Base'}</td>
                          </tr>
                        ))}
                        {proximasManutencoesDash.length === 0 && <tr><td colSpan={3} className="text-center">Nenhuma programação encontrada</td></tr>}
                      </tbody>
                    </Table>
                  </Card>
                </Col>
              </Row>

              <Row className="g-3">
                <Col md={6}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Header as="h5" className="mb-0">Valor de Bens por Filial (Ativos)</Card.Header>
                    <Table responsive hover size="sm" className="mb-0">
                      <thead>
                        <tr><th>Filial</th><th className="text-end">Valor Total (R$)</th></tr>
                      </thead>
                      <tbody>
                        {[...resumoPorFilial].sort((a, b) => b.valorBens - a.valorBens).map(r => (
                          <tr key={'bens' + r.filial}>
                            <td>{r.filial}</td>
                            <td className="text-end fw-bold">{formatCurrency(r.valorBens)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Header as="h5" className="mb-0">Custo de Manutenção por Filial (Concluídas)</Card.Header>
                    <Table responsive hover size="sm" className="mb-0">
                      <thead>
                        <tr><th>Filial</th><th className="text-end">Custo Total (R$)</th></tr>
                      </thead>
                      <tbody>
                        {[...resumoPorFilial].sort((a, b) => b.valorCustos - a.valorCustos).map(r => (
                          <tr key={'custo' + r.filial}>
                            <td>{r.filial}</td>
                            <td className="text-end fw-bold text-danger">{formatCurrency(r.valorCustos)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card>
                </Col>
              </Row>
            </Tab>

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
              <div className="d-flex gap-2">
                <Button variant="success" onClick={() => setShowImportar(true)}>
                  <i className="bi bi-file-earmark-spreadsheet me-1"></i> Importar
                </Button>
                <Button variant="primary" onClick={() => { setEquipData(emptyEquip); setShowEquip(true); }}>
                  + Cadastrar Equipamento
                </Button>
              </div>
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
                        
                        <small className={`text-${calcularStatusGarantia(e.data_aquisicao, e.garantia_meses).variant} fw-bold`}>
                          {calcularStatusGarantia(e.data_aquisicao, e.garantia_meses).texto}
                        </small>

                        {e.proxima_manutencao_data ? (
                          <div className="mt-1"><Badge bg="info">Prog: {format(new Date(e.proxima_manutencao_data), "dd/MM/yy")}</Badge></div>
                        ) : (
                          e.exige_manutencao_programada && (
                            <div className="mt-1"><Badge bg="danger" className="badge-piscante"><i className="bi bi-exclamation-triangle"></i> Prog. Pendente</Badge></div>
                          )
                        )}
                        
                      </td>
                      <td><Badge bg={e.status === 'Ativo' ? 'success' : 'danger'}>{e.status}</Badge></td>
                      <td>
                        <Button size="sm" variant="warning" onClick={() => { setManutData({...emptyManutencao, equipamento_id: e.id}); setShowManut(true); }}>Solicitar Manutenção</Button>
                        <Button size="sm" variant="outline-info" className="me-1 mb-1" onClick={() => { setEquipSelecionado(e); setProgManutData({ id: e.id, proxima_manutencao_data: e.proxima_manutencao_data ? e.proxima_manutencao_data.split('T')[0] : "" }); setShowProgManut(true); }}>Programar</Button>
                        <Button size="sm" variant="outline-secondary" className="me-1 mb-1" onClick={() => handleOpenHistorico(e)}>Histórico</Button>
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
                      <td><Badge bg={m.status === 'Aberta' ? 'danger' : m.status === 'Em Andamento' ? 'warning' : 'success'}>{m.status}</Badge></td>
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
              <div className="d-flex justify-content-between align-items-center mt-3 mb-3 flex-wrap gap-2">
                <div className="d-flex gap-2 flex-wrap flex-grow-1">
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nome, CNPJ ou especialidade..."
                    value={searchTermPrestador}
                    onChange={(e) => setSearchTermPrestador(e.target.value)}
                    style={{ minWidth: '220px', flex: 1 }}
                  />
                  <Form.Select value={filterEspecialidade} onChange={e => setFilterEspecialidade(e.target.value)} style={{ width: 'auto' }}>
                    <option value="">Todas Especialidades</option>
                    {especialidadesUnicas.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                  </Form.Select>
                  <Form.Select value={filterLocalidade} onChange={e => setFilterLocalidade(e.target.value)} style={{ width: 'auto' }}>
                    <option value="">Todas Localidades</option>
                    {localidadesUnicas.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </Form.Select>
                  <Form.Select value={filterClassificacao} onChange={e => setFilterClassificacao(e.target.value)} style={{ width: 'auto' }}>
                    <option value="">Qualquer Avaliação</option>
                    <option value="5">5 Estrelas</option>
                    <option value="4">4 Estrelas</option>
                    <option value="3">3 Estrelas</option>
                    <option value="2">2 Estrelas</option>
                    <option value="1">1 Estrela</option>
                    <option value="0">Sem avaliação</option>
                  </Form.Select>
                  <Form.Select value={filterStatusPrestador} onChange={e => setFilterStatusPrestador(e.target.value)} style={{ width: 'auto' }}>
                    <option value="">Todos os Status</option>
                    <option value="true">Ativos</option>
                    <option value="false">Inativos</option>
                  </Form.Select>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="success" onClick={() => setShowImportarPrestador(true)}>
                    <i className="bi bi-file-earmark-spreadsheet me-1"></i> Importar
                  </Button>
                  <Button variant="primary" onClick={() => { setPrestadorData(emptyPrestador); setShowPrestador(true); }}>
                    + Novo Prestador
                  </Button>
                </div>
              </div>
              <Table striped bordered hover responsive>
                <thead>
                  <tr><th>Nome Fantasia / Avaliação</th><th>CNPJ</th><th>Contato / Especialidade</th><th>Status</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {filteredPrestadores.map(p => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.nome_fantasia}</strong><br/>
                        {renderStars(p.classificacao)}
                      </td>
                      <td>{p.cnpj}</td>
                      <td>{p.contato} - {p.telefone}<br/><small className="text-muted">{p.especialidade} {p.cidade && p.uf ? `(${p.cidade}/${p.uf})` : ''}</small>{p.observacoes && <><br/><small className="text-muted fst-italic">Obs: {p.observacoes}</small></>}</td>
                      <td><Badge bg={p.ativo ? 'primary' : 'secondary'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge></td>
                      <td>
                        <Button size="sm" variant="outline-primary" className="me-1 mb-1" onClick={() => handleEditPrestador(p)}>Editar</Button>
                        <Button size="sm" variant={p.ativo ? "outline-danger" : "outline-success"} className="mb-1" onClick={() => handleToggleAtivoPrestador(p)}>{p.ativo ? "Inativar" : "Ativar"}</Button>
                      </td>
                    </tr>
                  ))}
                  {filteredPrestadores.length === 0 && <tr><td colSpan={5} className="text-center">Nenhum prestador encontrado.</td></tr>}
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
        unidades={unidades} prestadores={prestadores.filter(p => p.ativo)} onSave={handleSaveEquip} 
      />

      <ModalImportarEquip 
        show={showImportar} 
        onHide={() => setShowImportar(false)} 
        onSave={() => {
          setShowImportar(false);
          fetchData();
        }} 
      />

      <ModalImportarPrestador 
        show={showImportarPrestador} 
        onHide={() => setShowImportarPrestador(false)} 
        onSave={() => {
          setShowImportarPrestador(false);
          fetchData();
        }} 
      />

      <ModalPrestador 
        show={showPrestador} onHide={() => setShowPrestador(false)} 
        prestadorData={prestadorData} setPrestadorData={setPrestadorData} 
        onSave={handleSavePrestador} 
      />

      <ModalManutencao 
        show={showManut} onHide={() => setShowManut(false)} 
        manutData={manutData} setManutData={setManutData} 
        equipamentos={equipamentos} prestadores={prestadores.filter(p => p.ativo)} onSave={handleSaveManut} 
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