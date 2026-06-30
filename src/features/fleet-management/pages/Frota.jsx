import React, { useState, useEffect } from "react";
import {
  Container, Card, Row, Col, Button, Table, Badge, Modal, Form, Alert, Spinner, Tabs, Tab, Offcanvas
} from "react-bootstrap";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import ModalVeiculo from "../components/ModalVeiculo";
import ModalReserva from "../components/ModalReserva";
import ModalInspecao from "../components/ModalInspecao";
import ModalManutencao from "../components/ModalManutencao";
import ModalCusto from "../components/ModalCusto";
import ModalMulta from "../components/ModalMulta";
import ModalPneu from "../components/ModalPneu";
import ModalSinistro from "../components/ModalSinistro";
import ModalLavagem from "../components/ModalLavagem";
import ModalDetalhesVeiculo from "../components/ModalDetalhesVeiculo";
import ModalCombustivel from "../components/ModalCombustivel";
import apiClient from "../../../services/api";
import { FaCar } from "react-icons/fa";

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
  data_vencimento_ipva: "", data_vencimento_licenciamento: "", data_vencimento_seguro: "", data_vencimento_vistoria: "",
  numeracao: "", classificacao_1: "", classificacao_2: "", implemento: "", ano_fabricacao: "", ano_modelo: "", motorizacao: "", diagrama_pneus: "Não se aplica", valor_locacao: "", capacidade_transporte: "",
  forma_pagamento_id: ""
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
  fotos: [] // Array to hold File objects
};

const emptyPneu = {
  veiculo_id: "", posicao: "Todos (Conjunto)", marca: "", modelo: "", data_instalacao: "", km_instalacao: "", vida_util_estimada_km: "", custo: "", rodizio_aplicado: false, recapagem_count: 0, status: "Em Uso"
};

const emptySinistro = {
  veiculo_id: "", motorista_id: "", data_sinistro: "", descricao: "", terceiros_envolvidos: "", numero_bo: "", seguradora_acionada: false, custo_estimado: "", status: "Aberto", foto_file: null, foto_url: ""
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

  // Filtros de Veículos
  const [filters, setFilters] = useState({
    unidade_id: "",
    centro_custo: "",
    status: ""
  });
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  const filteredVeiculos = veiculos.filter(v => {
    if (filters.unidade_id && String(v.unidade_id) !== String(filters.unidade_id)) return false;
    if (filters.centro_custo && v.centro_custo !== filters.centro_custo) return false;
    if (filters.status && v.status !== filters.status) return false;
    return true;
  });

  // Modais
  const [showVeiculoModal, setShowVeiculoModal] = useState(false);
  const [veiculoData, setVeiculoData] = useState(emptyVeiculo);

  // Detalhes e Histórico
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVeiculoForDetails, setSelectedVeiculoForDetails] = useState(null);
  const [veiculoHistorico, setVeiculoHistorico] = useState({});
  const [loadingVeiculoHistorico, setLoadingVeiculoHistorico] = useState(false);

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

  const [showCombustivelModal, setShowCombustivelModal] = useState(false);
  const [selectedAbastecimento, setSelectedAbastecimento] = useState(null);
  const [showFuelFilterSidebar, setShowFuelFilterSidebar] = useState(false);
  const [fuelFilters, setFuelFilters] = useState({
    veiculo_id: "",
    motorista_id: "",
    nota_fiscal: "",
    data_inicio: "",
    data_fim: ""
  });

  const [showMultaFilterSidebar, setShowMultaFilterSidebar] = useState(false);
  const [multaFilters, setMultaFilters] = useState({ veiculo_id: "", motorista_id: "", status: "" });

  const [showPneuFilterSidebar, setShowPneuFilterSidebar] = useState(false);
  const [pneuFilters, setPneuFilters] = useState({ veiculo_id: "", status: "" });

  const [showSinistroFilterSidebar, setShowSinistroFilterSidebar] = useState(false);
  const [sinistroFilters, setSinistroFilters] = useState({ veiculo_id: "", status: "" });

  const [showLavagemFilterSidebar, setShowLavagemFilterSidebar] = useState(false);
  const [lavagemFilters, setLavagemFilters] = useState({ veiculo_id: "", tipo_lavagem: "" });

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
        apiClient.get("/user-data").catch(() => ({ data: null })),
        apiClient.get("/api/frota/veiculos"),
        apiClient.get("/api/frota/reservas"),
        apiClient.get("/api/unidades"),
        apiClient.get("/api/frota/dashboard").catch(() => ({ data: null })),
        apiClient.get("/api/frota/multas").catch(() => ({ data: [] })),
        apiClient.get("/api/funcionarios").catch(() => ({ data: [] })),
        apiClient.get("/api/frota/custos").catch(() => ({ data: [] })),
        apiClient.get("/api/frota/pneus").catch(() => ({ data: [] })),
        apiClient.get("/api/frota/sinistros").catch(() => ({ data: [] })),
        apiClient.get("/api/frota/lavagens").catch(() => ({ data: [] }))
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
      if (resDashboard?.data) setDashboard(resDashboard.data);
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
      ...emptyVeiculo,
      ...v,
      data_aquisicao: v.data_aquisicao ? v.data_aquisicao.split('T')[0] : "",
      data_vencimento_ipva: v.data_vencimento_ipva ? v.data_vencimento_ipva.split('T')[0] : "",
      data_vencimento_licenciamento: v.data_vencimento_licenciamento ? v.data_vencimento_licenciamento.split('T')[0] : "",
      data_vencimento_seguro: v.data_vencimento_seguro ? v.data_vencimento_seguro.split('T')[0] : "",
      data_vencimento_vistoria: v.data_vencimento_vistoria ? v.data_vencimento_vistoria.split('T')[0] : ""
    });
    setShowVeiculoModal(true);
  };

  const handleViewDetails = async (v) => {
    setSelectedVeiculoForDetails(v);
    setVeiculoHistorico({});
    setLoadingVeiculoHistorico(true);
    setShowDetailsModal(true);
    try {
      const res = await apiClient.get(`/api/frota/veiculos/${v.id}/historico`);
      setVeiculoHistorico(res.data);
    } catch (e) {
      console.error(e);
      setErr("Erro ao buscar histórico do veículo.");
    } finally {
      setLoadingVeiculoHistorico(false);
    }
  };

  const handleInactivateVeiculo = async (id) => {
    if (!window.confirm("Atenção: Deseja inativar este veículo da frota?")) return;
    try {
      await apiClient.delete(`/api/frota/veiculos/${id}`);
      setSuccess("Veículo inativado.");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
      setErr("Erro ao inativar veículo.");
    }
  };

  const handleSaveVeiculo = async () => {
    setErr("");
    try {
      if (veiculoData.id) {
        await apiClient.put(`/api/frota/veiculos/${veiculoData.id}`, veiculoData);
        setSuccess("Veículo atualizado com sucesso.");
      } else {
        await apiClient.post("/api/frota/veiculos", veiculoData);
        setSuccess("Veículo cadastrado com sucesso.");
      }
      setShowVeiculoModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
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
      await apiClient.patch(`/api/frota/veiculos/${manutencaoData.id}/manutencao`, manutencaoData);
      setSuccess("Manutenção programada com sucesso.");
      setShowManutencaoModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
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

      const res = await apiClient.post("/api/frota/reservas", payload);
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
      await apiClient.patch(`/api/frota/reservas/${id}/status`, { status });
      setSuccess(`Reserva ${status.toLowerCase()} com sucesso.`);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
      setErr("Erro ao atualizar status da reserva.");
    }
  };

  // -----------------------------------------------------
  // LANÇAMENTO DE CUSTOS E DESPESAS
  // -----------------------------------------------------
  const handleSaveCusto = async () => {
    setErr("");
    try {
      await apiClient.post("/api/frota/custos", custoData);
      setSuccess("Custo/Despesa financeira registrada!");
      setShowCustoModal(false);
      fetchData(); // Atualiza Dashboard na hora
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
      setErr("Erro ao registrar custo.");
    }
  };

  const handleSaveCombustivel = async (formData, id) => {
    try {
      if (id) {
        await apiClient.put(`/api/frota/custos/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setSuccess("Lançamento atualizado com sucesso!");
      } else {
        await apiClient.post("/api/frota/custos", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setSuccess("Abastecimento registrado com sucesso!");
      }
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // -----------------------------------------------------
  // GESTÃO DE MULTAS E INFRAÇÕES
  // -----------------------------------------------------
  const handleSaveMulta = async () => {
    setErr("");
    try {
      if (multaData.id) {
        await apiClient.put(`/api/frota/multas/${multaData.id}`, multaData);
        setSuccess("Condutor identificado / Multa atualizada com sucesso.");
      } else {
        await apiClient.post("/api/frota/multas", multaData);
        setSuccess("Registro de infração criado com sucesso.");
      }
      setShowMultaModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
      setErr("Erro ao salvar multa.");
    }
  };

  // MÓDULOS NOVOS
  const handleSavePneu = async () => {
    setErr("");
    try {
      await apiClient.post("/api/frota/pneus", pneuData);
      setSuccess("Pneu cadastrado com sucesso.");
      setShowPneuModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr(e.response?.data?.error || "Erro ao salvar pneu.");
    }
  };

  const handleSaveSinistro = async () => {
    setErr("");
    try {
      const formData = new FormData();
      // Append all scalar fields
      Object.keys(sinistroData).forEach(key => {
        if (key !== 'foto_file' && key !== 'foto_url') {
          formData.append(key, sinistroData[key]);
        }
      });
      // Append the file if it exists
      if (sinistroData.foto_file) {
        formData.append('foto_file', sinistroData.foto_file);
      }

      await apiClient.post("/api/frota/sinistros", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess("Sinistro registrado.");
      setShowSinistroModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error("Erro ao salvar sinistro:", e);
      setErr(e.response?.data?.error || "Erro ao salvar sinistro.");
    }
  };

  const handleSaveLavagem = async () => {
    setErr("");
    try {
      await apiClient.post("/api/frota/lavagens", lavagemData);
      setSuccess("Lavagem registrada.");
      setShowLavagemModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr(e.response?.data?.error || "Erro ao salvar lavagem.");
    }
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
      const formData = new FormData();
      formData.append('reserva_id', reservaSelecionadaId);
      formData.append('tipo', inspecaoData.tipo);
      formData.append('quilometragem', inspecaoData.quilometragem);
      formData.append('nivel_combustivel', inspecaoData.nivel_combustivel);
      formData.append('avarias', inspecaoData.avarias);

      // Append all files from the 'fotos' array
      inspecaoData.fotos.forEach(file => {
        formData.append('fotos_files', file);
      });

      await apiClient.post("/api/frota/inspecoes", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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
    hoje.setHours(0, 0, 0, 0);

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

  const formatFilterDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch {
      return dateStr;
    }
  };

  const filteredAbastecimentos = custos
    .filter(c => c.tipo_custo === "Abastecimento")
    .filter(c => {
      if (fuelFilters.veiculo_id && String(c.veiculo_id) !== String(fuelFilters.veiculo_id)) return false;
      if (fuelFilters.motorista_id && String(c.motorista_id) !== String(fuelFilters.motorista_id)) return false;
      if (fuelFilters.nota_fiscal && (!c.nota_fiscal || !c.nota_fiscal.toLowerCase().includes(fuelFilters.nota_fiscal.toLowerCase()))) return false;
      if (fuelFilters.data_inicio) {
        const cDate = c.data_custo ? c.data_custo.split('T')[0] : "";
        if (cDate < fuelFilters.data_inicio) return false;
      }
      if (fuelFilters.data_fim) {
        const cDate = c.data_custo ? c.data_custo.split('T')[0] : "";
        if (cDate > fuelFilters.data_fim) return false;
      }
      return true;
    });

  const filteredMultas = multas.filter(m => {
    if (multaFilters.veiculo_id && String(m.veiculo_id) !== String(multaFilters.veiculo_id)) return false;
    if (multaFilters.motorista_id && String(m.motorista_id) !== String(multaFilters.motorista_id)) return false;
    if (multaFilters.status && m.status !== multaFilters.status) return false;
    return true;
  });

  const filteredPneusList = pneus.filter(p => {
    if (pneuFilters.veiculo_id && String(p.veiculo_id) !== String(pneuFilters.veiculo_id)) return false;
    if (pneuFilters.status && p.status !== pneuFilters.status) return false;
    return true;
  });

  const filteredSinistrosList = sinistros.filter(s => {
    if (sinistroFilters.veiculo_id && String(s.veiculo_id) !== String(sinistroFilters.veiculo_id)) return false;
    if (sinistroFilters.status && s.status !== sinistroFilters.status) return false;
    return true;
  });

  const filteredLavagensList = lavagens.filter(l => {
    if (lavagemFilters.veiculo_id && String(l.veiculo_id) !== String(lavagemFilters.veiculo_id)) return false;
    if (lavagemFilters.tipo_lavagem && l.tipo_lavagem !== lavagemFilters.tipo_lavagem) return false;
    return true;
  });

  const tiposLavagemUnicos = [...new Set(lavagens.map(l => l.tipo_lavagem).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="dash-grid">
        <div className='container-main'>
          <Container className="mt-5 text-center"><Spinner animation="border" /></Container>
        </div>
      </div>
    );
  }

  return (
    <div className='container-main p-4'>
      {err && <Alert variant="danger" onClose={() => setErr("")} dismissible>{err}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}
      {avisoCnh && <Alert variant="warning" onClose={() => setAvisoCnh("")} dismissible>{avisoCnh}</Alert>}



      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Tabs
            defaultActiveKey="dashboard"
            variant="pills"
            className="mb-4 p-2 bg-light rounded-4 shadow-sm d-flex flex-nowrap overflow-auto"
            style={{ whiteSpace: "nowrap", gap: "0.5rem" }}
          >
            {/*ABAS DE DASHBOARD*/}
            <Tab eventKey="dashboard" title="Dashboard">
              {dashboard ? (
                <div className="mt-3">
                  <Row className="g-3 mb-3">
                    <Col md={3}><Card className="text-center shadow-sm"><Card.Body><h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Disponíveis</h6><h3 className="text-success m-0 fw-bold">{dashboard.kpis?.frota_disponivel || 0}</h3></Card.Body></Card></Col>
                    <Col md={3}><Card className="text-center shadow-sm"><Card.Body><h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Em Uso</h6><h3 className="text-primary m-0 fw-bold">{dashboard.kpis?.frota_em_uso || 0}</h3></Card.Body></Card></Col>
                    <Col md={3}><Card className="text-center shadow-sm"><Card.Body><h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Ocupação Atual</h6><h3 className="text-info m-0 fw-bold">{dashboard.kpis?.taxa_ocupacao || 0}%</h3></Card.Body></Card></Col>
                    <Col md={3}><Card className="text-center shadow-sm bg-light"><Card.Body><h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Odômetro Frota</h6><h3 className="text-dark m-0 fw-bold">{(dashboard.kpis?.total_km || 0).toLocaleString('pt-BR')} km</h3></Card.Body></Card></Col>
                  </Row>
                  <Row className="g-3 mb-4">
                    <Col md={3}><Card className="text-center shadow-sm bg-danger text-white"><Card.Body><h6 className="text-white text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Gastos (Mês)</h6><h3 className="text-white m-0 fw-bold">{formatCurrency(dashboard.kpis?.gastos_mes || 0)}</h3></Card.Body></Card></Col>
                    <Col md={3}><Card className="text-center shadow-sm border border-warning"><Card.Body><h6 className="text-warning text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Em Manutenção</h6><h3 className="text-warning m-0 fw-bold">{dashboard.kpis?.frota_manutencao || 0}</h3></Card.Body></Card></Col>
                    <Col md={3}><Card className="text-center shadow-sm border border-danger"><Card.Body><h6 className="text-danger text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Multas Pendentes</h6><h3 className="text-danger m-0 fw-bold">{dashboard.kpis?.multas_pendentes || 0}</h3></Card.Body></Card></Col>
                    <Col md={3}><Card className="text-center shadow-sm border border-warning"><Card.Body><h6 className="text-warning text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Sinistros Abertos</h6><h3 className="text-warning m-0 fw-bold">{dashboard.kpis?.sinistros_abertos || 0}</h3></Card.Body></Card></Col>
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

            {/*ABAS DE RESERVAS DE VEICULOS*/}
            <Tab eventKey="calendario" title="Calendário de Reservas">
              <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-3 mt-3">
                {currentUser && (currentUser.privilegios?.includes('Admin') || currentUser.privilegios?.includes('Gestor')) && (
                  <Button variant="outline-danger" onClick={() => { setCustoData(emptyCusto); setShowCustoModal(true); }}>
                    <i className="bi bi-currency-dollar me-2"></i> Lançar Despesa
                  </Button>
                )}
                <Button variant="primary" onClick={() => { setReservaData(emptyReserva); setShowReservaModal(true); }}>
                  Nova Reserva
                </Button>
              </div>
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

            {/*ABAS DE VEICULOS*/}
            <Tab eventKey="veiculos" title="Inventário de Veículos">
              <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-3 mt-3">
                <Button variant="outline-secondary" onClick={() => setShowFilterSidebar(true)}>
                  <i className="bi bi-funnel me-1"></i> Filtrar
                  {(filters.unidade_id || filters.centro_custo || filters.status) && (
                    <Badge bg="primary" className="ms-1">
                      {Object.values(filters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
                <Button variant="primary" onClick={() => { setVeiculoData(emptyVeiculo); setShowVeiculoModal(true); }}>
                  + Cadastrar Veículo
                </Button>
              </div>

              {(filters.unidade_id || filters.centro_custo || filters.status) && (
                <div className="d-flex align-items-center flex-wrap gap-2 bg-light p-2 rounded-3 mb-3" style={{ fontSize: "0.85rem" }}>
                  <span className="text-muted fw-semibold ms-1">Filtros ativos:</span>
                  {filters.unidade_id && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Unidade: {unidades.find(u => String(u.id) === String(filters.unidade_id))?.nome_unidade || filters.unidade_id}
                      <span role="button" onClick={() => setFilters(p => ({ ...p, unidade_id: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  {filters.centro_custo && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      C. Custo: {filters.centro_custo}
                      <span role="button" onClick={() => setFilters(p => ({ ...p, centro_custo: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  {filters.status && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Situação: {filters.status}
                      <span role="button" onClick={() => setFilters(p => ({ ...p, status: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  <Button variant="link" size="sm" className="text-danger p-0 ms-auto text-decoration-none fw-semibold" onClick={() => setFilters({ unidade_id: "", centro_custo: "", status: "" })}>
                    Limpar todos
                  </Button>
                </div>
              )}
              <Table striped bordered hover responsive>

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
                  {filteredVeiculos.map(v => (
                    <tr key={v.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {v.imagem_principal_url ? (
                            <img 
                              src={v.imagem_principal_url} 
                              alt={`${v.marca} ${v.modelo}`} 
                              style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px", marginRight: "10px" }}
                            />
                          ) : (
                            <div 
                              className="bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center text-secondary"
                              style={{ width: "40px", height: "40px", borderRadius: "4px", marginRight: "10px" }}
                            >
                              <FaCar size={18} />
                            </div>
                          )}
                          <div>
                            <div>
                              {v.numeracao && (
                                <Badge bg="dark" className="me-2 text-uppercase" style={{ fontSize: "0.75rem" }}>
                                  #{v.numeracao}
                                </Badge>
                              )}
                              <span
                                role="button"
                                className="text-primary fw-bold"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleViewDetails(v)}
                                onMouseOver={e => e.target.style.textDecoration = 'underline'}
                                onMouseOut={e => e.target.style.textDecoration = 'none'}
                              >
                                {v.marca} {v.modelo}
                              </span>
                            </div>
                            {(v.classificacao_1 || v.classificacao_2 || v.implemento) && (
                              <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "2px" }}>
                                {v.classificacao_1 && <span>{v.classificacao_1}</span>}
                                {v.classificacao_2 && <span> • {v.classificacao_2}</span>}
                                {v.implemento && <span className="text-info fw-semibold"> • Implemento: {v.implemento}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td><strong>{v.placa}</strong></td>
                      <td>
                        {v.ano_fabricacao && v.ano_modelo ? (
                          <span>{v.ano_fabricacao}/{v.ano_modelo}</span>
                        ) : (
                          <span>{v.ano || "-"}</span>
                        )}
                      </td>
                      <td>{v.tipo_combustivel}</td>
                      <td>{v.quilometragem_atual.toLocaleString("pt-BR")} km</td>
                      <td>{v.nome_unidade || "-"}</td>
                      <td><Badge bg={getStatusBadge(v.status)}>{v.status}</Badge></td>
                      <td>{renderAlertas(v)}</td>
                      <td>
                        <Button size="sm" variant="btn btn-outline-primary" className="me-2 mb-1" onClick={() => handleOpenManutencao(v)}>Manutenção</Button>
                        <Button size="sm" variant="btn btn-outline-info " className="me-2 mb-1" onClick={() => handleEditVeiculo(v)}>Editar</Button>
                        <Button size="sm" variant="btn btn-outline-danger" className="mb-1" onClick={() => handleInactivateVeiculo(v.id)}>Inativar</Button>
                      </td>
                    </tr>
                  ))}
                  {filteredVeiculos.length === 0 && (
                    <tr><td colSpan={9} className="text-center text-muted py-3">Nenhum veículo encontrado com os filtros ativos.</td></tr>
                  )}
                </tbody>
              </Table>
            </Tab>
            {/*ABA MULTAS*/}
            <Tab eventKey="multas" title="Multas e Infrações">
              <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-3 mt-3">
                <Button variant="outline-secondary" onClick={() => setShowMultaFilterSidebar(true)}>
                  <i className="bi bi-funnel me-1"></i> Filtrar
                  {(multaFilters.veiculo_id || multaFilters.motorista_id || multaFilters.status) && (
                    <Badge bg="primary" className="ms-1">
                      {Object.values(multaFilters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
                <Button variant="btn btn-outline-danger" onClick={() => { setMultaData(emptyMulta); setShowMultaModal(true); }}>
                  <i className="bi bi-exclamation-triangle"></i> Registrar Nova Multa
                </Button>
              </div>

              {(multaFilters.veiculo_id || multaFilters.motorista_id || multaFilters.status) && (
                <div className="d-flex align-items-center flex-wrap gap-2 bg-light p-2 rounded-3 mb-3" style={{ fontSize: "0.85rem" }}>
                  <span className="text-muted fw-semibold ms-1">Filtros ativos:</span>
                  {multaFilters.veiculo_id && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Veículo: {veiculos.find(v => String(v.id) === String(multaFilters.veiculo_id))?.modelo || multaFilters.veiculo_id}
                      <span role="button" onClick={() => setMultaFilters(p => ({ ...p, veiculo_id: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  {multaFilters.motorista_id && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Motorista: {funcionarios.find(f => String(f.id) === String(multaFilters.motorista_id))?.nome_completo || multaFilters.motorista_id}
                      <span role="button" onClick={() => setMultaFilters(p => ({ ...p, motorista_id: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  {multaFilters.status && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Status: {multaFilters.status}
                      <span role="button" onClick={() => setMultaFilters(p => ({ ...p, status: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  <Button variant="link" size="sm" className="text-danger p-0 ms-auto text-decoration-none fw-semibold" onClick={() => setMultaFilters({ veiculo_id: "", motorista_id: "", status: "" })}>
                    Limpar todos
                  </Button>
                </div>
              )}

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
                  {filteredMultas.map(m => (
                    <tr key={m.id}>
                      <td>{format(new Date(m.data_infracao), "dd/MM/yy HH:mm")}</td>
                      <td>{m.modelo} (<strong>{m.placa}</strong>)</td>
                      <td>{m.local_infracao}<br /><small className="text-muted">{m.descricao} ({m.pontos_cnh} pts)</small></td>
                      <td className="text-danger fw-bold">{formatCurrency(m.valor)}</td>
                      <td>{m.motorista_nome ? <strong>{m.motorista_nome}</strong> : <span className="text-danger"><i className="bi bi-question-circle"></i> Pendente</span>}</td>
                      <td><Badge bg={getMultaBadge(m.status)}>{m.status}</Badge></td>
                      <td><Button size="sm" variant="outline-primary" onClick={() => { setMultaData({ ...m, data_infracao: m.data_infracao ? m.data_infracao.slice(0, 16) : "" }); setShowMultaModal(true); }}>Identificar / Editar</Button></td>
                    </tr>
                  ))}
                  {filteredMultas.length === 0 && <tr><td colSpan={7} className="text-center">Nenhuma multa registrada.</td></tr>}
                </tbody>
              </Table>
            </Tab>

            {/*ABAS DE COMBUSTIVEL*/}
            <Tab eventKey="combustivel" title="Combustível (KM/L)">
              <div className="d-flex justify-content-end mt-3 mb-3">
                <Button variant="outline-secondary" className="me-2" onClick={() => setShowFuelFilterSidebar(true)}>
                  <i className="bi bi-funnel me-1"></i> Filtrar
                  {(fuelFilters.veiculo_id || fuelFilters.motorista_id || fuelFilters.nota_fiscal || fuelFilters.data_inicio || fuelFilters.data_fim) && (
                    <Badge bg="primary" className="ms-1">
                      {Object.values(fuelFilters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
                <Button variant="primary" onClick={() => { setSelectedAbastecimento(null); setShowCombustivelModal(true); }}>
                  <i className="bi bi-fuel-pump me-1"></i> Lançar Abastecimento
                </Button>
              </div>

              {(fuelFilters.veiculo_id || fuelFilters.motorista_id || fuelFilters.nota_fiscal || fuelFilters.data_inicio || fuelFilters.data_fim) && (
                <div className="d-flex align-items-center flex-wrap gap-2 bg-light p-2 rounded-3 mb-3" style={{ fontSize: "0.85rem" }}>
                  <span className="text-muted fw-semibold ms-1">Filtros ativos:</span>
                  {fuelFilters.veiculo_id && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Veículo: {veiculos.find(v => String(v.id) === String(fuelFilters.veiculo_id))?.modelo || fuelFilters.veiculo_id}
                      <span role="button" onClick={() => setFuelFilters(p => ({ ...p, veiculo_id: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  {fuelFilters.motorista_id && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Motorista: {funcionarios.find(f => String(f.id) === String(fuelFilters.motorista_id))?.nome_completo || fuelFilters.motorista_id}
                      <span role="button" onClick={() => setFuelFilters(p => ({ ...p, motorista_id: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  {fuelFilters.nota_fiscal && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      NF: {fuelFilters.nota_fiscal}
                      <span role="button" onClick={() => setFuelFilters(p => ({ ...p, nota_fiscal: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  {(fuelFilters.data_inicio || fuelFilters.data_fim) && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Período: {fuelFilters.data_inicio ? formatFilterDate(fuelFilters.data_inicio) : ""} a {fuelFilters.data_fim ? formatFilterDate(fuelFilters.data_fim) : ""}
                      <span role="button" onClick={() => setFuelFilters(p => ({ ...p, data_inicio: "", data_fim: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  <Button variant="link" size="sm" className="text-danger p-0 ms-auto text-decoration-none fw-semibold" onClick={() => setFuelFilters({ veiculo_id: "", motorista_id: "", nota_fiscal: "", data_inicio: "", data_fim: "" })}>
                    Limpar todos
                  </Button>
                </div>
              )}

              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Veículo</th>
                    <th>Odômetro</th>
                    <th>Preço Litro</th>
                    <th>Volume (Litros)</th>
                    <th>Desconto</th>
                    <th>Valor Total</th>
                    <th>Média (KM/L)</th>
                    <th>Fornecedor</th>
                    <th>Motorista</th>
                    <th>NF</th>
                    <th>Anexo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAbastecimentos.map((c, i, arr) => {
                    // Calcula a média comparando com o abastecimento anterior do mesmo veículo
                    const prev = arr.slice(i + 1).find(x => x.veiculo_id === c.veiculo_id);
                    let kml = "-";
                    if (prev && c.quilometragem && prev.quilometragem && c.litros) {
                      kml = ((c.quilometragem - prev.quilometragem) / c.litros).toFixed(2) + " km/l";
                    }
                    return (
                      <tr key={c.id}>
                        <td>{format(new Date(c.data_custo), "dd/MM/yyyy")}</td>
                        <td>{c.modelo} ({c.placa})</td>
                        <td>{c.quilometragem ? `${c.quilometragem.toLocaleString("pt-BR")} km` : '-'}</td>
                        <td>{c.preco_combustivel ? `R$ ${parseFloat(c.preco_combustivel).toFixed(3)}` : "-"}</td>
                        <td>{c.litros ? `${parseFloat(c.litros).toFixed(2)} L` : "-"}</td>
                        <td>{c.desconto ? formatCurrency(parseFloat(c.desconto)) : "-"}</td>
                        <td className="text-danger fw-bold">{formatCurrency(c.valor)}</td>
                        <td><Badge bg="info">{kml}</Badge></td>
                        <td>{c.fornecedor_nome || "-"}</td>
                        <td>{c.motorista_nome || "-"}</td>
                        <td>{c.nota_fiscal || "-"}</td>
                        <td>
                          {c.anexo_url ? (
                            <a href={c.anexo_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-danger py-0 px-1">
                              <i className="bi bi-file-earmark-pdf"></i> NF
                            </a>
                          ) : "-"}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="py-0 px-1"
                            onClick={() => {
                              setSelectedAbastecimento(c);
                              setShowCombustivelModal(true);
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredAbastecimentos.length === 0 && (
                    <tr><td colSpan={13} className="text-center text-muted py-3">Nenhum abastecimento encontrado.</td></tr>
                  )}
                </tbody>
              </Table>
            </Tab>

            {/*ABAS DE PNEUS*/}
            <Tab eventKey="pneus" title="Pneus">
              <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-3 mt-3">
                <Button variant="outline-secondary" onClick={() => setShowPneuFilterSidebar(true)}>
                  <i className="bi bi-funnel me-1"></i> Filtrar
                  {(pneuFilters.veiculo_id || pneuFilters.status) && (
                    <Badge bg="primary" className="ms-1">
                      {Object.values(pneuFilters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
                <Button variant="btn btn-primary" onClick={() => { setPneuData(emptyPneu); setShowPneuModal(true); }}>
                  + Registrar Troca
                </Button>
              </div>

              {(pneuFilters.veiculo_id || pneuFilters.status) && (
                <div className="d-flex align-items-center flex-wrap gap-2 bg-light p-2 rounded-3 mb-3" style={{ fontSize: "0.85rem" }}>
                  <span className="text-muted fw-semibold ms-1">Filtros ativos:</span>
                  {pneuFilters.veiculo_id && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Veículo: {veiculos.find(v => String(v.id) === String(pneuFilters.veiculo_id))?.modelo || pneuFilters.veiculo_id}
                      <span role="button" onClick={() => setPneuFilters(p => ({ ...p, veiculo_id: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  {pneuFilters.status && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Status: {pneuFilters.status}
                      <span role="button" onClick={() => setPneuFilters(p => ({ ...p, status: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  <Button variant="link" size="sm" className="text-danger p-0 ms-auto text-decoration-none fw-semibold" onClick={() => setPneuFilters({ veiculo_id: "", status: "" })}>
                    Limpar todos
                  </Button>
                </div>
              )}

              <Table striped bordered hover responsive>
                <thead><tr><th>Veículo</th><th>Posição</th><th>Marca/Modelo</th><th>KM Instalação</th><th>Rodízio / Recapagem</th><th>Status</th></tr></thead>
                <tbody>
                  {filteredPneusList.map(p => (
                    <tr key={p.id}>
                      <td>{p.modelo} ({p.placa})</td>
                      <td>{p.posicao}</td>
                      <td>{p.marca} {p.modelo}</td>
                      <td>{p.km_instalacao} km</td>
                      <td>{p.rodizio_aplicado ? "Feito" : "Pendente"} / {p.recapagem_count}x</td>
                      <td><Badge bg="secondary">{p.status}</Badge></td>
                    </tr>
                  ))}
                  {filteredPneusList.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-muted py-3">Nenhum pneu encontrado.</td></tr>
                  )}
                </tbody>
              </Table>
            </Tab>

            {/*ABAS DE SINISTROS E AVARIAS*/}
            <Tab eventKey="sinistros" title="Sinistros / Avarias">
              <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-3 mt-3">
                <Button variant="outline-secondary" onClick={() => setShowSinistroFilterSidebar(true)}>
                  <i className="bi bi-funnel me-1"></i> Filtrar
                  {(sinistroFilters.veiculo_id || sinistroFilters.status) && (
                    <Badge bg="primary" className="ms-1">
                      {Object.values(sinistroFilters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
                <Button variant="btn btn-primary" onClick={() => { setSinistroData(emptySinistro); setShowSinistroModal(true); }}>
                  + Reportar Sinistro
                </Button>
              </div>

              {(sinistroFilters.veiculo_id || sinistroFilters.status) && (
                <div className="d-flex align-items-center flex-wrap gap-2 bg-light p-2 rounded-3 mb-3" style={{ fontSize: "0.85rem" }}>
                  <span className="text-muted fw-semibold ms-1">Filtros ativos:</span>
                  {sinistroFilters.veiculo_id && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Veículo: {veiculos.find(v => String(v.id) === String(sinistroFilters.veiculo_id))?.modelo || sinistroFilters.veiculo_id}
                      <span role="button" onClick={() => setSinistroFilters(p => ({ ...p, veiculo_id: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  {sinistroFilters.status && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Status: {sinistroFilters.status}
                      <span role="button" onClick={() => setSinistroFilters(p => ({ ...p, status: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  <Button variant="link" size="sm" className="text-danger p-0 ms-auto text-decoration-none fw-semibold" onClick={() => setSinistroFilters({ veiculo_id: "", status: "" })}>
                    Limpar todos
                  </Button>
                </div>
              )}

              <Table striped bordered hover responsive>
                <thead><tr><th>Data</th><th>Veículo / Motorista</th><th>BO / Seguradora</th><th>Descrição</th><th>Status</th></tr></thead>
                <tbody>
                  {filteredSinistrosList.map(s => (
                    <tr key={s.id}>
                      <td>{format(new Date(s.data_sinistro), "dd/MM/yyyy")}</td>
                      <td>{s.modelo} ({s.placa})<br /><small>{s.motorista || 'Não Identificado'}</small></td>
                      <td>BO: {s.numero_bo || '-'}<br /><small>{s.seguradora_acionada ? 'Seguradora OK' : ''}</small></td>
                      <td>{s.descricao}</td>
                      <td><Badge bg={s.status === 'Aberto' ? 'danger' : 'success'}>{s.status}</Badge></td>
                    </tr>
                  ))}
                  {filteredSinistrosList.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-muted py-3">Nenhum sinistro encontrado.</td></tr>
                  )}
                </tbody>
              </Table>
            </Tab>

            {/*ABAS DE LAVAGENS*/}
            <Tab eventKey="lavagens" title="Lavagens">
              <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-3 mt-3">
                <Button variant="outline-secondary" onClick={() => setShowLavagemFilterSidebar(true)}>
                  <i className="bi bi-funnel me-1"></i> Filtrar
                  {(lavagemFilters.veiculo_id || lavagemFilters.tipo_lavagem) && (
                    <Badge bg="primary" className="ms-1">
                      {Object.values(lavagemFilters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
                <Button variant="btn btn-primary" className="text-white" onClick={() => { setLavagemData(emptyLavagem); setShowLavagemModal(true); }}>
                  + Registrar Lavagem
                </Button>
              </div>

              {(lavagemFilters.veiculo_id || lavagemFilters.tipo_lavagem) && (
                <div className="d-flex align-items-center flex-wrap gap-2 bg-light p-2 rounded-3 mb-3" style={{ fontSize: "0.85rem" }}>
                  <span className="text-muted fw-semibold ms-1">Filtros ativos:</span>
                  {lavagemFilters.veiculo_id && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Veículo: {veiculos.find(v => String(v.id) === String(lavagemFilters.veiculo_id))?.modelo || lavagemFilters.veiculo_id}
                      <span role="button" onClick={() => setLavagemFilters(p => ({ ...p, veiculo_id: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  {lavagemFilters.tipo_lavagem && (
                    <Badge bg="white" text="dark" className="border d-flex align-items-center gap-1 py-1.5 px-2">
                      Tipo: {lavagemFilters.tipo_lavagem}
                      <span role="button" onClick={() => setLavagemFilters(p => ({ ...p, tipo_lavagem: "" }))} className="fw-bold text-danger ms-1" style={{ cursor: "pointer" }}>&times;</span>
                    </Badge>
                  )}
                  <Button variant="link" size="sm" className="text-danger p-0 ms-auto text-decoration-none fw-semibold" onClick={() => setLavagemFilters({ veiculo_id: "", tipo_lavagem: "" })}>
                    Limpar todos
                  </Button>
                </div>
              )}

              <Table striped bordered hover responsive>
                <thead><tr><th>Data</th><th>Veículo</th><th>Tipo</th><th>Custo</th><th>Próxima Sugerida</th></tr></thead>
                <tbody>
                  {filteredLavagensList.map(l => (
                    <tr key={l.id}>
                      <td>{format(new Date(l.data_lavagem), "dd/MM/yyyy")}</td>
                      <td>{l.modelo} ({l.placa})</td>
                      <td>{l.tipo_lavagem}</td>
                      <td className="text-danger">{formatCurrency(l.custo)}</td>
                      <td>{l.proxima_lavagem_data ? format(new Date(l.proxima_lavagem_data), "dd/MM/yyyy") : '-'}</td>
                    </tr>
                  ))}
                  {filteredLavagensList.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-muted py-3">Nenhuma lavagem encontrada.</td></tr>
                  )}
                </tbody>
              </Table>
            </Tab>

            {/*ABAS DE APROVAÇÕES DE RESERVAS*/}
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
                      <td>{format(new Date(r.data_inicio), "dd/MM/yy HH:mm")} a {format(new Date(r.data_fim), "dd/MM/yy HH:mm")}</td>
                      <td>{r.modelo} ({r.placa})</td>
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
        veiculos={veiculos}
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

      {/* Modal de Detalhes do Veículo e Histórico */}
      <ModalDetalhesVeiculo
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        veiculo={selectedVeiculoForDetails}
        historico={veiculoHistorico}
        loadingHistorico={loadingVeiculoHistorico}
        onRefresh={fetchData}
      />

      {/* Modal de Lançamento de Abastecimento */}
      <ModalCombustivel
        show={showCombustivelModal}
        onHide={() => {
          setShowCombustivelModal(false);
          setSelectedAbastecimento(null);
        }}
        veiculos={veiculos}
        funcionarios={funcionarios}
        onSave={handleSaveCombustivel}
        abastecimentoData={selectedAbastecimento}
      />

      {/* Painel de Filtros Lateral (Offcanvas) para Combustível */}
      <Offcanvas show={showFuelFilterSidebar} onHide={() => setShowFuelFilterSidebar(false)} placement="end">
        <Offcanvas.Header closeButton className="bg-light">
          <Offcanvas.Title className="text-primary fw-bold">
            <i className="bi bi-funnel me-2"></i>Filtrar Abastecimentos
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form className="d-flex flex-column h-100">
            <div className="flex-grow-1">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Veículo</Form.Label>
                <Form.Select
                  value={fuelFilters.veiculo_id}
                  onChange={e => setFuelFilters(prev => ({ ...prev, veiculo_id: e.target.value }))}
                >
                  <option value="">Todos os Veículos</option>
                  {veiculos.map(v => (
                    <option key={v.id} value={v.id}>{v.marca} {v.modelo} - Placa: {v.placa}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Motorista</Form.Label>
                <Form.Select
                  value={fuelFilters.motorista_id}
                  onChange={e => setFuelFilters(prev => ({ ...prev, motorista_id: e.target.value }))}
                >
                  <option value="">Todos os Motoristas</option>
                  {funcionarios.map(f => (
                    <option key={f.id} value={f.id}>{f.nome_completo}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Nota Fiscal</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Número da Nota Fiscal"
                  value={fuelFilters.nota_fiscal}
                  onChange={e => setFuelFilters(prev => ({ ...prev, nota_fiscal: e.target.value }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Período - De (Início)</Form.Label>
                <Form.Control
                  type="date"
                  value={fuelFilters.data_inicio}
                  onChange={e => setFuelFilters(prev => ({ ...prev, data_inicio: e.target.value }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Período - Até (Fim)</Form.Label>
                <Form.Control
                  type="date"
                  value={fuelFilters.data_fim}
                  onChange={e => setFuelFilters(prev => ({ ...prev, data_fim: e.target.value }))}
                />
              </Form.Group>
            </div>

            <div className="mt-auto d-flex gap-2 pt-3 border-top">
              <Button
                variant="outline-secondary"
                className="w-50"
                onClick={() => {
                  setFuelFilters({ veiculo_id: "", motorista_id: "", nota_fiscal: "", data_inicio: "", data_fim: "" });
                  setShowFuelFilterSidebar(false);
                }}
              >
                Limpar
              </Button>
              <Button variant="primary" className="w-50" onClick={() => setShowFuelFilterSidebar(false)}>
                Aplicar
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Painel de Filtros Lateral (Offcanvas) */}
      <Offcanvas show={showFilterSidebar} onHide={() => setShowFilterSidebar(false)} placement="end">
        <Offcanvas.Header closeButton className="bg-light">
          <Offcanvas.Title className="text-primary fw-bold">
            <i className="bi bi-funnel me-2"></i>Filtrar Veículos
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form className="d-flex flex-column h-100">
            <div className="flex-grow-1">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Unidade / Filial</Form.Label>
                <Form.Select
                  value={filters.unidade_id}
                  onChange={e => setFilters(prev => ({ ...prev, unidade_id: e.target.value }))}
                >
                  <option value="">Todas as Unidades</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.nome_unidade}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Centro de Custo</Form.Label>
                <Form.Select
                  value={filters.centro_custo}
                  onChange={e => setFilters(prev => ({ ...prev, centro_custo: e.target.value }))}
                >
                  <option value="">Todos os Centros de Custo</option>
                  {Array.from(new Set(veiculos.map(v => v.centro_custo).filter(Boolean))).map(cc => (
                    <option key={cc} value={cc}>{cc}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Situação (Status)</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">Todas as Situações</option>
                  <option value="Disponível">Disponível</option>
                  <option value="Em Uso">Em uso</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Sinistro">Sinistro</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Vendido">Vendido</option>
                  <option value="Venda-proposta">Disponível para venda</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="mt-auto d-flex gap-2 pt-3 border-top">
              <Button
                variant="outline-secondary"
                className="w-50"
                onClick={() => {
                  setFilters({ unidade_id: "", centro_custo: "", status: "" });
                  setShowFilterSidebar(false);
                }}
              >
                Limpar
              </Button>
              <Button variant="primary" className="w-50" onClick={() => setShowFilterSidebar(false)}>
                Aplicar
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

    </div>
  );
}