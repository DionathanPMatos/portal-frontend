import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Card, Row, Col, Button, Table, Badge, Modal, Form, Alert, Spinner, Tabs, Tab
} from "react-bootstrap";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import ModalVeiculo from "./components/ModalVeiculo";
import ModalReserva from "./components/ModalReserva";
import ModalInspecao from "./components/ModalInspecao";
import ModalManutencao from "./components/ModalManutencao";
import ModalCusto from "./components/ModalCusto";
import ModalMulta from "./components/ModalMulta";
import ModalPneu from "./components/ModalPneu";
import ModalSinistro from "./components/ModalSinistro";
import ModalLavagem from "./components/ModalLavagem";

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const emptyVeiculo = {
  marca: "", modelo: "", ano: "", placa: "", renavam: "", chassi: "", cor: "", unidade_id: "",
  tipo_combustivel: "Flex", quilometragem_atual: 0, capacidade_tanque: "", lotacao_maxima: 5,
  categoria: "Passeio", status: "Disponível", centro_custo: "", data_aquisicao: "", valor_bem: "", apolice_seguro: "",
  data_vencimento_ipva: "", data_vencimento_licenciamento: "", data_vencimento_seguro: "", data_vencimento_vistoria: ""
};

const emptyReserva = {
  veiculo_id: "", data_inicio: "", hora_inicio: "", data_fim: "", hora_fim: "", origem: "", destino: "", motivo: ""
};

const emptyCusto = {
  veiculo_id: "", tipo_custo: "Abastecimento", data_custo: "", valor: "", observacoes: "", litros: "", quilometragem: ""
};

const emptyMulta = {
  veiculo_id: "", motorista_id: "", data_infracao: "", valor: "", local_infracao: "", descricao: "", pontos_cnh: "", status: "Pendente Identificação"
};

const emptyInspecao = {
   tipo: "Saída", quilometragem: "", nivel_combustivel: "Cheio", avarias: "", 
  fotos: {
    frente: { status: 'OK', base64: '' },
    lateral_direita: { status: 'OK', base64: '' },
    lateral_esquerda: { status: 'OK', base64: '' },
    traseira: { status: 'OK', base64: '' },
    interno: { status: 'OK', base64: '' }
  }
};

const emptyPneu = {
  veiculo_id: "", posicao: "Todos (Conjunto)", marca: "", modelo: "", data_instalacao: "", km_instalacao: "", vida_util_estimada_km: "", custo: "", rodizio_aplicado: false, recapagem_count: 0, status: "Em Uso"
};

const emptySinistro = {
  veiculo_id: "", motorista_id: "", data_sinistro: "", descricao: "", terceiros_envolvidos: "", numero_bo: "", seguradora_acionada: false, custo_estimado: "", status: "Aberto", foto_base64: ""
};

const emptyLavagem = {
  veiculo_id: "", data_lavagem: "", tipo_lavagem: "Simples", custo: "", proxima_lavagem_data: "", status: "Realizada"
};

export default function Frota() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [veiculos, setVeiculos] = useState([]);
  const [multas, setMultas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [custos, setCustos] = useState([]);
  const [pneus, setPneus] = useState([]);
  const [sinistros, setSinistros] = useState([]);
  const [lavagens, setLavagens] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // Modais
  const [showVeiculoModal, setShowVeiculoModal] = useState(false);
  const [veiculoData, setVeiculoData] = useState(emptyVeiculo);
  
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [reservaData, setReservaData] = useState(emptyReserva);
  const [avisoCnh, setAvisoCnh] = useState("");

  const [showInspecaoModal, setShowInspecaoModal] = useState(false);
  const [inspecaoData, setInspecaoData] = useState(emptyInspecao);
  const [reservaSelecionadaId, setReservaSelecionadaId] = useState(null);
  
  const [showManutencaoModal, setShowManutencaoModal] = useState(false);
  const [manutencaoData, setManutencaoData] = useState({ id: "", prox_troca_oleo_km: "", prox_revisao_data: "" });
  const [veiculoManutencao, setVeiculoManutencao] = useState(null);
  
  const [showCustoModal, setShowCustoModal] = useState(false);
  const [custoData, setCustoData] = useState(emptyCusto);

  const [showMultaModal, setShowMultaModal] = useState(false);
  const [multaData, setMultaData] = useState(emptyMulta);

  const [showPneuModal, setShowPneuModal] = useState(false);
  const [pneuData, setPneuData] = useState(emptyPneu);

  const [showSinistroModal, setShowSinistroModal] = useState(false);
  const [sinistroData, setSinistroData] = useState(emptySinistro);

  const [showLavagemModal, setShowLavagemModal] = useState(false);
  const [lavagemData, setLavagemData] = useState(emptyLavagem);

  // Controle de Navegação do Calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUser, resVeiculos, resReservas, resUnidades, resDashboard, resMultas, resFunc, resCustos, resPneus, resSinistros, resLavagens] = await Promise.all([
        axios.get("/user-data").catch(() => ({ data: null })),
        axios.get("/api/frota/veiculos"),
        axios.get("/api/frota/reservas"),
        axios.get("/api/unidades"),
        axios.get("/api/frota/dashboard").catch(() => ({ data: null })),
        axios.get("/api/frota/multas").catch(() => ({ data: [] })),
        axios.get("/api/funcionarios").catch(() => ({ data: [] })),
        axios.get("/api/frota/custos").catch(() => ({ data: [] })),
        axios.get("/api/frota/pneus").catch(() => ({ data: [] })),
        axios.get("/api/frota/sinistros").catch(() => ({ data: [] })),
        axios.get("/api/frota/lavagens").catch(() => ({ data: [] }))
      ]);
      setCurrentUser(resUser.data);
      setVeiculos(resVeiculos.data || []);
      setReservas(resReservas.data || []);
      setUnidades(resUnidades.data || []);
      setMultas(resMultas.data || []);
      setFuncionarios(resFunc.data || []);
      setCustos(resCustos.data || []);
      setPneus(resPneus.data || []);
      setSinistros(resSinistros.data || []);
      setLavagens(resLavagens.data || []);
      if(resDashboard?.data) setDashboard(resDashboard.data);
    } catch (e) {
      console.error(e);
      setErr("Erro ao carregar dados da frota.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -----------------------------------------------------
  // VEÍCULOS
  // -----------------------------------------------------
  const handleEditVeiculo = (v) => {
    setVeiculoData({
      ...v,
      data_aquisicao: v.data_aquisicao ? v.data_aquisicao.split('T')[0] : "",
      data_vencimento_ipva: v.data_vencimento_ipva ? v.data_vencimento_ipva.split('T')[0] : "",
      data_vencimento_licenciamento: v.data_vencimento_licenciamento ? v.data_vencimento_licenciamento.split('T')[0] : "",
      data_vencimento_seguro: v.data_vencimento_seguro ? v.data_vencimento_seguro.split('T')[0] : "",
      data_vencimento_vistoria: v.data_vencimento_vistoria ? v.data_vencimento_vistoria.split('T')[0] : ""
    });
    setShowVeiculoModal(true);
  };

  const handleInactivateVeiculo = async (id) => {
    if(!window.confirm("Atenção: Deseja inativar este veículo da frota?")) return;
    try {
      await axios.delete(`/api/frota/veiculos/${id}`);
      setSuccess("Veículo inativado.");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) { setErr("Erro ao inativar veículo."); }
  };

  const handleSaveVeiculo = async () => {
    setErr("");
    try {
      if (veiculoData.id) {
        await axios.put(`/api/frota/veiculos/${veiculoData.id}`, veiculoData);
        setSuccess("Veículo atualizado com sucesso.");
      } else {
        await axios.post("/api/frota/veiculos", veiculoData);
        setSuccess("Veículo cadastrado com sucesso.");
      }
      setShowVeiculoModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr(e.response?.data?.error || "Erro ao salvar veículo.");
    }
  };

  const handleOpenManutencao = (v) => {
    setVeiculoManutencao(v);
    setManutencaoData({
      id: v.id,
      prox_troca_oleo_km: v.prox_troca_oleo_km || "",
      prox_revisao_data: v.prox_revisao_data ? v.prox_revisao_data.split('T')[0] : ""
    });
    setShowManutencaoModal(true);
  };

  const handleSaveManutencao = async () => {
    setErr("");
    try {
      await axios.patch(`/api/frota/veiculos/${manutencaoData.id}/manutencao`, manutencaoData);
      setSuccess("Manutenção programada com sucesso.");
      setShowManutencaoModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr("Erro ao programar manutenção.");
    }
  };

  // -----------------------------------------------------
  // RESERVAS
  // -----------------------------------------------------
  const handleSelectSlot = (slotInfo) => {
    // Pré-preenche as datas baseadas no clique no calendário
    setReservaData({
      ...emptyReserva,
      data_inicio: format(slotInfo.start, "yyyy-MM-dd"),
      data_fim: format(slotInfo.end, "yyyy-MM-dd"),
    });
    setShowReservaModal(true);
  };

  const handleSaveReserva = async () => {
    setErr("");
    setAvisoCnh("");
    try {
      // Combina data e hora
      const start = `${reservaData.data_inicio}T${reservaData.hora_inicio || "08:00"}:00`;
      const end = `${reservaData.data_fim}T${reservaData.hora_fim || "18:00"}:00`;
      
      const payload = {
        ...reservaData,
        data_inicio: start,
        data_fim: end
      };

      const res = await axios.post("/api/frota/reservas", payload);
      if (res.data.aviso) setAvisoCnh(res.data.aviso);
      else setSuccess("Reserva solicitada com sucesso!");
      
      setShowReservaModal(false);
      fetchData();
      if (!res.data.aviso) setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr(e.response?.data?.error || "Erro ao solicitar reserva.");
    }
  };

  const handleUpdateReservaStatus = async (id, status) => {
    setErr("");
    try {
      await axios.patch(`/api/frota/reservas/${id}/status`, { status });
      setSuccess(`Reserva ${status.toLowerCase()} com sucesso.`);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr("Erro ao atualizar status da reserva.");
    }
  };

  // -----------------------------------------------------
  // LANÇAMENTO DE CUSTOS E DESPESAS
  // -----------------------------------------------------
  const handleSaveCusto = async () => {
    setErr("");
    try {
      await axios.post("/api/frota/custos", custoData);
      setSuccess("Custo/Despesa financeira registrada!");
      setShowCustoModal(false);
      fetchData(); // Atualiza Dashboard na hora
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) { setErr("Erro ao registrar custo."); }
  };

  // -----------------------------------------------------
  // GESTÃO DE MULTAS E INFRAÇÕES
  // -----------------------------------------------------
  const handleSaveMulta = async () => {
    setErr("");
    try {
      if (multaData.id) {
        await axios.put(`/api/frota/multas/${multaData.id}`, multaData);
        setSuccess("Condutor identificado / Multa atualizada com sucesso.");
      } else {
        await axios.post("/api/frota/multas", multaData);
        setSuccess("Registro de infração criado com sucesso.");
      }
      setShowMultaModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) { setErr("Erro ao salvar multa."); }
  };

  // MÓDULOS NOVOS
  const handleSavePneu = async () => {
    setErr("");
    try {
      await axios.post("/api/frota/pneus", pneuData);
      setSuccess("Pneu cadastrado com sucesso.");
      setShowPneuModal(false); fetchData(); setTimeout(() => setSuccess(""), 3000);
    } catch(e){ setErr("Erro ao salvar pneu.")}
  };

  const handleSaveSinistro = async () => {
    setErr("");
    try {
      await axios.post("/api/frota/sinistros", sinistroData);
      setSuccess("Sinistro registrado.");
      setShowSinistroModal(false); fetchData(); setTimeout(() => setSuccess(""), 3000);
    } catch(e){ setErr("Erro ao salvar sinistro.")}
  };

  const handleSaveLavagem = async () => {
    setErr("");
    try {
      await axios.post("/api/frota/lavagens", lavagemData);
      setSuccess("Lavagem registrada.");
      setShowLavagemModal(false); fetchData(); setTimeout(() => setSuccess(""), 3000);
    } catch(e){ setErr("Erro ao salvar lavagem.")}
  };

  // -----------------------------------------------------
  // INSPEÇÕES E VISTORIA
  // -----------------------------------------------------
  const handleOpenInspecao = (reservaId, tipo) => {
    setReservaSelecionadaId(reservaId);
    setInspecaoData({ ...emptyInspecao, tipo });
    setShowInspecaoModal(true);
  };

  const handleSaveInspecao = async () => {
    setErr("");
    try {
      const payload = { ...inspecaoData, reserva_id: reservaSelecionadaId };
      await axios.post("/api/frota/inspecoes", payload);
      setSuccess("Inspeção registrada. Odômetro atualizado.");
      setShowInspecaoModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr(e.response?.data?.error || "Erro ao registrar inspeção.");
    }
  };

  // Mapeamento dos eventos para o formato do Calendário
  const calendarEvents = reservas
    .filter(r => r.status !== 'Rejeitada' && r.status !== 'Cancelada')
    .map(r => ({
      id: r.id,
      title: `${r.modelo} - ${r.placa} - ${r.solicitante}`,
      start: new Date(r.data_inicio),
      end: new Date(r.data_fim),
      resource: r
    }));

  const getStatusBadge = (status) => {
    if (status === "Disponível" || status === "Concluída") return "success";
    if (status === "Em Uso" || status === "Aprovada") return "primary";
    if (status === "Em Manutenção" || status === "Manutenção" || status === "Aguardando Aprovação") return "warning";
    if (status === "Sinistro" || status === "Inativo") return "danger";
    return "secondary";
  };

  const getMultaBadge = (status) => {
    if (status === "Pendente Identificação") return "danger";
    if (status === "Identificado") return "primary";
    if (status === "Recorrido") return "warning";
    if (status === "Pago") return "success";
  };
  
  const renderAlertas = (v) => {
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    
    const alertas = [];
    
    const checkData = (nome, dataStr) => {
        if (!dataStr) return;
        const parts = dataStr.split('T')[0].split('-');
        const dataVenc = new Date(parts[0], parts[1] - 1, parts[2]);
        const diff = dataVenc - hoje;
        const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (dias < 0) alertas.push(<Badge bg="danger" className="me-1 mb-1 d-block" key={nome}>{nome} Vencido</Badge>);
        else if (dias <= 30) alertas.push(<Badge bg="warning" text="dark" className="me-1 mb-1 d-block" key={nome}>{nome} ({dias}d)</Badge>);
    };

    const checkKm = (nome, kmAlvo, kmAtual) => {
        if (!kmAlvo) return;
        const diff = kmAlvo - (kmAtual || 0);
        if (diff <= 0) alertas.push(<Badge bg="danger" className="me-1 mb-1 d-block" key={nome}>{nome} Vencida</Badge>);
        else if (diff <= 1000) alertas.push(<Badge bg="warning" text="dark" className="me-1 mb-1 d-block" key={nome}>{nome} (Falta {diff} km)</Badge>);
    };
    
    checkData('IPVA', v.data_vencimento_ipva);
    checkData('Licenc.', v.data_vencimento_licenciamento);
    checkData('Seguro', v.data_vencimento_seguro);
    checkData('Vistoria doc.', v.data_vencimento_vistoria);
    
    checkData('Revisão', v.prox_revisao_data);
    checkKm('Óleo', v.prox_troca_oleo_km, v.quilometragem_atual);

    return alertas.length > 0 ? alertas : <Badge bg="success" className="mb-1 d-block">Em Dia</Badge>;
  };

  const reservasParaAprovar = reservas.filter(r => 
    r.status === "Aguardando Aprovação" && 
    currentUser && 
    (r.gestor_aprovador_id === currentUser.id || 
    (currentUser.privilegios && currentUser.privilegios.includes('Admin')))
  );

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <Container fluid className="px-4 mt-4">
      {err && <Alert variant="danger" onClose={() => setErr("")} dismissible>{err}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}
      {avisoCnh && <Alert variant="warning" onClose={() => setAvisoCnh("")} dismissible>{avisoCnh}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white">
          <Row className="align-items-center">
            <Col>
              <Card.Title as="h4" className="mb-0"> <i className="bi bi-truck me-2"></i>Gestão de Frota Corporativa</Card.Title>
            </Col>
            <Col className="text-end">
              {currentUser && (currentUser.privilegios?.includes('Admin') || currentUser.privilegios?.includes('Gestor')) && (
                <Button variant="outline-danger" className="me-2" onClick={() => { setCustoData(emptyCusto); setShowCustoModal(true); }}>
                  <i className="bi bi-currency-dollar"></i> Lançar Despesa
                </Button>
              )}
              <Button variant="outline-primary" className="me-2" onClick={() => { setVeiculoData(emptyVeiculo); setShowVeiculoModal(true); }}>
                + Cadastrar Veículo
              </Button>
              <Button variant="primary" onClick={() => { setReservaData(emptyReserva); setShowReservaModal(true); }}>
                Nova Reserva
              </Button>
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body>
          <Tabs 
            defaultActiveKey="dashboard" 
            variant="pills" 
            className="mb-4 p-2 bg-light rounded-4 shadow-sm d-flex flex-nowrap overflow-auto"
            style={{ whiteSpace: "nowrap", gap: "0.5rem" }}
          >
            
            <Tab eventKey="dashboard" title="Dashboard">
              {dashboard ? (
                <div className="mt-3">
                  <Row className="g-3 mb-3">
                    <Col md={3}><Card className="text-center shadow-sm"><Card.Body><h6 className="text-muted text-uppercase mb-1" style={{fontSize:'0.75rem'}}>Disponíveis</h6><h3 className="text-success m-0 fw-bold">{dashboard.kpis.frota_disponivel}</h3></Card.Body></Card></Col>
                    <Col md={3}><Card className="text-center shadow-sm"><Card.Body><h6 className="text-muted text-uppercase mb-1" style={{fontSize:'0.75rem'}}>Em Uso</h6><h3 className="text-primary m-0 fw-bold">{dashboard.kpis.frota_em_uso}</h3></Card.Body></Card></Col>
                    <Col md={3}><Card className="text-center shadow-sm"><Card.Body><h6 className="text-muted text-uppercase mb-1" style={{fontSize:'0.75rem'}}>Ocupação Atual</h6><h3 className="text-info m-0 fw-bold">{dashboard.kpis.taxa_ocupacao}%</h3></Card.Body></Card></Col>
                    <Col md={3}><Card className="text-center shadow-sm bg-light"><Card.Body><h6 className="text-muted text-uppercase mb-1" style={{fontSize:'0.75rem'}}>Odômetro Frota</h6><h3 className="text-dark m-0 fw-bold">{dashboard.kpis.total_km.toLocaleString('pt-BR')} km</h3></Card.Body></Card></Col>
                  </Row>
                  <Row className="g-3 mb-4">
                    <Col md={3}><Card className="text-center shadow-sm bg-danger text-white"><Card.Body><h6 className="text-white text-uppercase mb-1" style={{fontSize:'0.75rem'}}>Gastos (Mês)</h6><h3 className="text-white m-0 fw-bold">{formatCurrency(dashboard.kpis.gastos_mes)}</h3></Card.Body></Card></Col>
                    <Col md={3}><Card className="text-center shadow-sm border border-warning"><Card.Body><h6 className="text-warning text-uppercase mb-1" style={{fontSize:'0.75rem'}}>Em Manutenção</h6><h3 className="text-warning m-0 fw-bold">{dashboard.kpis.frota_manutencao}</h3></Card.Body></Card></Col>
                    <Col md={3}><Card className="text-center shadow-sm border border-danger"><Card.Body><h6 className="text-danger text-uppercase mb-1" style={{fontSize:'0.75rem'}}>Multas Pendentes</h6><h3 className="text-danger m-0 fw-bold">{dashboard.kpis.multas_pendentes}</h3></Card.Body></Card></Col>
                    <Col md={3}><Card className="text-center shadow-sm border border-warning"><Card.Body><h6 className="text-warning text-uppercase mb-1" style={{fontSize:'0.75rem'}}>Sinistros Abertos</h6><h3 className="text-warning m-0 fw-bold">{dashboard.kpis.sinistros_abertos}</h3></Card.Body></Card></Col>
                  </Row>
                  <Row className="g-3">
                    <Col md={6}>
                      <Card className="shadow-sm h-100 border-0">
                        <Card.Body>
                          <h6 className="fw-bold border-bottom pb-2">Despesas por Categoria (Mês Atual)</h6>
                          <Table size="sm" borderless><tbody>{dashboard.custosPorCategoria?.map(c => <tr key={c.categoria}><td>{c.categoria}</td><td className="text-end fw-bold text-danger">{formatCurrency(c.total)}</td></tr>)}{(!dashboard.custosPorCategoria || dashboard.custosPorCategoria.length === 0) && <tr><td className="text-muted">Sem despesas registradas.</td></tr>}</tbody></Table>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="shadow-sm h-100 border-0">
                        <Card.Body>
                          <h6 className="fw-bold border-bottom pb-2">Custos por Veículo</h6>
                          <Table size="sm" borderless><tbody>{dashboard.custosPorVeiculo?.map(v => <tr key={v.placa}><td>{v.modelo} ({v.placa})</td><td className="text-end fw-bold text-danger">{formatCurrency(v.total)}</td></tr>)}{dashboard.custosPorVeiculo?.length === 0 && <tr><td className="text-muted">Sem despesas registradas.</td></tr>}</tbody></Table>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="shadow-sm h-100 border-0">
                        <Card.Body>
                          <h6 className="fw-bold border-bottom pb-2">Custos por Filial / C. de Custo</h6>
                          <Table size="sm" borderless><tbody>{dashboard.custosPorFilial?.map(f => <tr key={f.filial}><td>{f.filial}</td><td className="text-end fw-bold text-danger">{formatCurrency(f.total)}</td></tr>)}{dashboard.custosPorFilial?.length === 0 && <tr><td className="text-muted">Sem despesas registradas.</td></tr>}</tbody></Table>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="shadow-sm h-100 border-0">
                        <Card.Body>
                          <h6 className="fw-bold border-bottom pb-2">Veículos Mais Utilizados (Viagens)</h6>
                          <Table size="sm" borderless><tbody>{dashboard.veiculosMaisUtilizados?.map(v => <tr key={v.placa}><td>{v.modelo} ({v.placa})</td><td className="text-end fw-bold">{v.total_viagens} locações</td></tr>)}{dashboard.veiculosMaisUtilizados?.length === 0 && <tr><td className="text-muted">Nenhuma reserva concluída.</td></tr>}</tbody></Table>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              ) : <div className="text-center py-5"><Spinner animation="border" /></div>}
            </Tab>

            <Tab eventKey="calendario" title="Calendário de Reservas">
              <div style={{ height: "600px", marginTop: "20px" }}>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  selectable
                  onSelectSlot={handleSelectSlot}
                  date={currentDate}
                  onNavigate={(newDate) => setCurrentDate(newDate)}
                  view={currentView}
                  onView={(newView) => setCurrentView(newView)}
                  messages={{
                    next: "Próximo",
                    previous: "Anterior",
                    today: "Hoje",
                    month: "Mês",
                    week: "Semana",
                    day: "Dia",
                    agenda: "Agenda",
                    date: "Data",
                    time: "Hora",
                    event: "Reserva",
                    noEventsInRange: "Não há reservas neste período.",
                  }}
                />
              </div>
            </Tab>

            <Tab eventKey="veiculos" title="Inventário de Veículos">
              <Table striped bordered hover responsive className="mt-3">
                <thead>
                  <tr>
                    <th>Modelo</th>
                    <th>Placa</th>
                    <th>Ano</th>
                    <th>Combustível</th>
                    <th>KM Atual</th>
                    <th>Unidade</th>
                    <th>Status</th>
                    <th>Alertas Doc.</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {veiculos.map(v => (
                    <tr key={v.id}>
                      <td>{v.marca} {v.modelo}</td>
                      <td><strong>{v.placa}</strong></td>
                      <td>{v.ano}</td>
                      <td>{v.tipo_combustivel}</td>
                      <td>{v.quilometragem_atual.toLocaleString("pt-BR")} km</td>
                      <td>{v.nome_unidade || "-"}</td>
                      <td><Badge bg={getStatusBadge(v.status)}>{v.status}</Badge></td>
                      <td>{renderAlertas(v)}</td>
                      <td>
                        <Button size="sm" variant="outline-primary" className="me-2 mb-1" onClick={() => handleOpenManutencao(v)}>Manutenção</Button>
                        <Button size="sm" variant="outline-secondary" className="me-2 mb-1" onClick={() => handleEditVeiculo(v)}>Editar</Button>
                        <Button size="sm" variant="outline-danger" className="mb-1" onClick={() => handleInactivateVeiculo(v.id)}>Inativar</Button>
                      </td>
                    </tr>
                  ))}
                  {veiculos.length === 0 && (
                    <tr><td colSpan={8} className="text-center">Nenhum veículo cadastrado.</td></tr>
                  )}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="multas" title="Multas e Infrações">
              <div className="d-flex justify-content-end mt-3 mb-3">
                <Button variant="danger" onClick={() => { setMultaData(emptyMulta); setShowMultaModal(true); }}>
                  <i className="bi bi-exclamation-triangle"></i> Registrar Nova Multa
                </Button>
              </div>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Veículo</th>
                    <th>Local / Descrição</th>
                    <th>Valor</th>
                    <th>Motorista Infrator</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {multas.map(m => (
                    <tr key={m.id}>
                      <td>{format(new Date(m.data_infracao), "dd/MM/yy HH:mm")}</td>
                      <td>{m.modelo} (<strong>{m.placa}</strong>)</td>
                      <td>{m.local_infracao}<br/><small className="text-muted">{m.descricao} ({m.pontos_cnh} pts)</small></td>
                      <td className="text-danger fw-bold">{formatCurrency(m.valor)}</td>
                      <td>{m.motorista_nome ? <strong>{m.motorista_nome}</strong> : <span className="text-danger"><i className="bi bi-question-circle"></i> Pendente</span>}</td>
                      <td><Badge bg={getMultaBadge(m.status)}>{m.status}</Badge></td>
                      <td><Button size="sm" variant="outline-primary" onClick={() => { setMultaData({...m, data_infracao: m.data_infracao ? m.data_infracao.slice(0, 16) : ""}); setShowMultaModal(true); }}>Identificar / Editar</Button></td>
                    </tr>
                  ))}
                  {multas.length === 0 && <tr><td colSpan={7} className="text-center">Nenhuma multa registrada.</td></tr>}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="combustivel" title="Combustível (KM/L)">
              <Table striped bordered hover responsive className="mt-3">
                <thead>
                  <tr><th>Data</th><th>Veículo</th><th>Odômetro</th><th>Litros</th><th>Valor</th><th>Média (KM/L)</th></tr>
                </thead>
                <tbody>
                  {custos.filter(c => c.tipo_custo === "Abastecimento").map((c, i, arr) => {
                    // Calcula a média comparando com o abastecimento anterior do mesmo veículo
                    const prev = arr.slice(i+1).find(x => x.veiculo_id === c.veiculo_id);
                    let kml = "-";
                    if (prev && c.quilometragem && prev.quilometragem && c.litros) {
                      kml = ((c.quilometragem - prev.quilometragem) / c.litros).toFixed(2) + " km/l";
                    }
                    return (
                      <tr key={c.id}>
                        <td>{format(new Date(c.data_custo), "dd/MM/yyyy")}</td>
                        <td>{c.modelo} ({c.placa})</td>
                        <td>{c.quilometragem ? `${c.quilometragem} km` : '-'}</td>
                        <td>{c.litros} L</td>
                        <td className="text-danger">{formatCurrency(c.valor)}</td>
                        <td><Badge bg="info">{kml}</Badge></td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="pneus" title="Pneus">
              <div className="d-flex justify-content-end mt-3 mb-3">
                <Button variant="dark" onClick={() => { setPneuData(emptyPneu); setShowPneuModal(true); }}>+ Registrar Pneu</Button>
              </div>
              <Table striped bordered hover responsive>
                <thead><tr><th>Veículo</th><th>Posição</th><th>Marca/Modelo</th><th>KM Instalação</th><th>Rodízio / Recapagem</th><th>Status</th></tr></thead>
                <tbody>
                  {pneus.map(p => (
                    <tr key={p.id}>
                      <td>{p.modelo} ({p.placa})</td>
                      <td>{p.posicao}</td>
                      <td>{p.marca} {p.modelo}</td>
                      <td>{p.km_instalacao} km</td>
                      <td>{p.rodizio_aplicado ? "Feito" : "Pendente"} / {p.recapagem_count}x</td>
                      <td><Badge bg="secondary">{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="sinistros" title="Sinistros / Avarias">
              <div className="d-flex justify-content-end mt-3 mb-3">
                <Button variant="warning" onClick={() => { setSinistroData(emptySinistro); setShowSinistroModal(true); }}>+ Reportar Sinistro</Button>
              </div>
              <Table striped bordered hover responsive>
                <thead><tr><th>Data</th><th>Veículo / Motorista</th><th>BO / Seguradora</th><th>Descrição</th><th>Status</th></tr></thead>
                <tbody>
                  {sinistros.map(s => (
                    <tr key={s.id}>
                      <td>{format(new Date(s.data_sinistro), "dd/MM/yyyy")}</td>
                      <td>{s.modelo} ({s.placa})<br/><small>{s.motorista || 'Não Identificado'}</small></td>
                      <td>BO: {s.numero_bo || '-'}<br/><small>{s.seguradora_acionada ? 'Seguradora OK' : ''}</small></td>
                      <td>{s.descricao}</td>
                      <td><Badge bg={s.status === 'Aberto' ? 'danger' : 'success'}>{s.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="lavagens" title="Lavagens">
              <div className="d-flex justify-content-end mt-3 mb-3">
                <Button variant="info" className="text-white" onClick={() => { setLavagemData(emptyLavagem); setShowLavagemModal(true); }}>+ Registrar Lavagem</Button>
              </div>
              <Table striped bordered hover responsive>
                <thead><tr><th>Data</th><th>Veículo</th><th>Tipo</th><th>Custo</th><th>Próxima Sugerida</th></tr></thead>
                <tbody>
                  {lavagens.map(l => (
                    <tr key={l.id}>
                      <td>{format(new Date(l.data_lavagem), "dd/MM/yyyy")}</td>
                      <td>{l.modelo} ({l.placa})</td>
                      <td>{l.tipo_lavagem}</td>
                      <td className="text-danger">{formatCurrency(l.custo)}</td>
                      <td>{l.proxima_lavagem_data ? format(new Date(l.proxima_lavagem_data), "dd/MM/yyyy") : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            {currentUser && (currentUser.privilegios?.includes('Admin') || currentUser.privilegios?.includes('Gestor') || reservasParaAprovar.length > 0) && (
              <Tab eventKey="aprovacoes" title={`Aprovações Pendentes (${reservasParaAprovar.length})`}>
                <Table striped bordered hover responsive className="mt-3">
                  <thead>
                    <tr>
                      <th>Solicitante</th>
                      <th>Veículo</th>
                      <th>Período</th>
                      <th>Origem/Destino</th>
                      <th>Motivo</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservasParaAprovar.map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.solicitante}</strong></td>
                        <td>{r.modelo} ({r.placa})</td>
                        <td>{format(new Date(r.data_inicio), "dd/MM/yy HH:mm")} a {format(new Date(r.data_fim), "dd/MM/yy HH:mm")}</td>
                        <td>{r.origem} → {r.destino}</td>
                        <td>{r.motivo}</td>
                        <td>
                          <Button size="sm" variant="success" className="me-2 mb-1" onClick={() => handleUpdateReservaStatus(r.id, "Aprovada")}>
                            Aprovar
                          </Button>
                          <Button size="sm" variant="danger" className="mb-1" onClick={() => handleUpdateReservaStatus(r.id, "Rejeitada")}>
                            Rejeitar
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {reservasParaAprovar.length === 0 && (
                      <tr><td colSpan={6} className="text-center">Nenhuma reserva aguardando a sua aprovação.</td></tr>
                    )}
                  </tbody>
                </Table>
              </Tab>
            )}

            <Tab eventKey="minhas_reservas" title="Minhas Solicitações">
              <Table striped bordered hover responsive className="mt-3">
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Veículo</th>
                    <th>Origem - Destino</th>
                    <th>Status</th>
                    <th>Vistoria</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map(r => (
                    <tr key={r.id}>
                      <td>{format(new Date(r.data_inicio), "dd/MM/yy HH:mm")} a {format(new Date(r.data_fim), "dd/MM/yy HH:mm")}</td>                      <td>{r.modelo} ({r.placa})</td>
                      <td>{r.origem} → {r.destino}</td>
                      <td><Badge bg={getStatusBadge(r.status)}>{r.status}</Badge></td>
                      <td>
                        {r.status === "Aprovada" && (
                          <Button size="sm" variant="outline-primary" onClick={() => handleOpenInspecao(r.id, 'Saída')}>Retirada (Saída)</Button>
                        )}
                        {r.status === "Em Uso" && (
                          <Button size="sm" variant="outline-success" onClick={() => handleOpenInspecao(r.id, 'Retorno')}>Devolução (Retorno)</Button>
                        )}
                        {r.status !== "Aprovada" && r.status !== "Em Uso" && "-"}
                      </td>
                    </tr>
                  ))}
                  {reservas.length === 0 && (
                    <tr><td colSpan={5} className="text-center">Nenhuma reserva encontrada.</td></tr>
                  )}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Modal Veículo */}
      <ModalVeiculo
        show={showVeiculoModal}
        onHide={() => setShowVeiculoModal(false)}
        veiculoData={veiculoData}
        setVeiculoData={setVeiculoData}
        unidades={unidades}
        onSave={handleSaveVeiculo}
      />

      {/* Modal Reserva */}
      <ModalReserva
        show={showReservaModal}
        onHide={() => setShowReservaModal(false)}
        reservaData={reservaData}
        setReservaData={setReservaData}
        veiculos={veiculos}
        onSave={handleSaveReserva}
      />

      {/* Modal Vistoria */}
      <ModalInspecao
        show={showInspecaoModal}
        onHide={() => setShowInspecaoModal(false)}
        inspecaoData={inspecaoData}
        setInspecaoData={setInspecaoData}
        onSave={handleSaveInspecao}
      />
      
      {/* Modal Manutenção */}
      <ModalManutencao
        show={showManutencaoModal}
        onHide={() => setShowManutencaoModal(false)}
        manutencaoData={manutencaoData}
        setManutencaoData={setManutencaoData}
        onSave={handleSaveManutencao}
        veiculoSelecionado={veiculoManutencao}
      />

      {/* Modal Despesas e Custos */}
      <ModalCusto
        show={showCustoModal}
        onHide={() => setShowCustoModal(false)}
        custoData={custoData}
        setCustoData={setCustoData}
        veiculos={veiculos}
        onSave={handleSaveCusto}
      />

      {/* Modal Multas */}
      <ModalMulta
        show={showMultaModal}
        onHide={() => setShowMultaModal(false)}
        multaData={multaData}
        setMultaData={setMultaData}
        veiculos={veiculos}
        funcionarios={funcionarios}
        onSave={handleSaveMulta}
      />

      <ModalPneu 
        show={showPneuModal} 
        onHide={() => setShowPneuModal(false)} 
        pneuData={pneuData} 
        setPneuData={setPneuData} 
        veiculos={veiculos} 
        onSave={handleSavePneu} 
      />

      <ModalSinistro 
        show={showSinistroModal} 
        onHide={() => setShowSinistroModal(false)} 
        sinistroData={sinistroData} 
        setSinistroData={setSinistroData} 
        veiculos={veiculos} 
        funcionarios={funcionarios} 
        onSave={handleSaveSinistro} 
      />

      <ModalLavagem 
        show={showLavagemModal} 
        onHide={() => setShowLavagemModal(false)} 
        lavagemData={lavagemData} 
        setLavagemData={setLavagemData} 
        veiculos={veiculos} 
        onSave={handleSaveLavagem} 
      />

    </Container>
  );
}