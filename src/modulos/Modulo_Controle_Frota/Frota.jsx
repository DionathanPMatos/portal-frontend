import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Card, Row, Col, Button, Table, Badge, Modal, Form, Alert, Spinner, Tabs, Tab
} from "react-bootstrap";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Configura o moment para o calendário ficar em PT-BR
moment.locale("pt-br");
const localizer = momentLocalizer(moment);

const emptyVeiculo = {
  marca: "", modelo: "", ano: "", placa: "", renavam: "", cor: "", unidade_id: "",
  tipo_combustivel: "Flex", quilometragem_atual: 0, capacidade_tanque: "", lotacao_maxima: 5,
  categoria: "Passeio", status: "Disponível", centro_custo: "", data_aquisicao: "", valor_bem: "", apolice_seguro: ""
};

const emptyReserva = {
  veiculo_id: "", data_inicio: "", hora_inicio: "", data_fim: "", hora_fim: "", origem: "", destino: "", motivo: ""
};

const emptyInspecao = {
  tipo: "Saída", quilometragem: "", nivel_combustivel: "Cheio", avarias: "", fotos: []
};

export default function Frota() {
  const [loading, setLoading] = useState(true);
  const [veiculos, setVeiculos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [unidades, setUnidades] = useState([]);
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

  // Controle de Navegação do Calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resVeiculos, resReservas, resUnidades] = await Promise.all([
        axios.get("/api/frota/veiculos"),
        axios.get("/api/frota/reservas"),
        axios.get("/api/unidades")
      ]);
      setVeiculos(resVeiculos.data || []);
      setReservas(resReservas.data || []);
      setUnidades(resUnidades.data || []);
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
      data_aquisicao: v.data_aquisicao ? v.data_aquisicao.split('T')[0] : ""
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

  // -----------------------------------------------------
  // RESERVAS
  // -----------------------------------------------------
  const handleSelectSlot = (slotInfo) => {
    // Pré-preenche as datas baseadas no clique no calendário
    setReservaData({
      ...emptyReserva,
      data_inicio: moment(slotInfo.start).format("YYYY-MM-DD"),
      data_fim: moment(slotInfo.end).format("YYYY-MM-DD"),
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

  // -----------------------------------------------------
  // INSPEÇÕES E VISTORIA
  // -----------------------------------------------------
  const handleOpenInspecao = (reservaId) => {
    setReservaSelecionadaId(reservaId);
    setInspecaoData(emptyInspecao);
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
  const calendarEvents = reservas.map(r => ({
    id: r.id,
    title: `${r.modelo} - ${r.placa} - ${r.solicitante}`,
    start: new Date(r.data_inicio),
    end: new Date(r.data_fim),
    resource: r
  }));

  const getStatusBadge = (status) => {
    if (status === "Disponível" || status === "Concluída") return "success";
    if (status === "Em Uso" || status === "Aprovada") return "primary";
    if (status === "Em Manutenção" || status === "Aguardando Aprovação") return "warning";
    return "secondary";
  };

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
              <Card.Title as="h4" className="mb-0">Gestão de Frota Corporativa</Card.Title>
            </Col>
            <Col className="text-end">
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
          <Tabs defaultActiveKey="calendario" className="mb-4">
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
                      <td>
                        <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => handleEditVeiculo(v)}>Editar</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleInactivateVeiculo(v.id)}>Inativar</Button>
                      </td>
                    </tr>
                  ))}
                  {veiculos.length === 0 && (
                    <tr><td colSpan={8} className="text-center">Nenhum veículo cadastrado.</td></tr>
                  )}
                </tbody>
              </Table>
            </Tab>

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
                      <td>{moment(r.data_inicio).format("DD/MM/YY HH:mm")} a {moment(r.data_fim).format("DD/MM/YY HH:mm")}</td>
                      <td>{r.modelo} ({r.placa})</td>
                      <td>{r.origem} → {r.destino}</td>
                      <td><Badge bg={getStatusBadge(r.status)}>{r.status}</Badge></td>
                      <td>
                        {r.status === "Aprovada" || r.status === "Em Uso" ? (
                          <Button size="sm" variant="outline-info" onClick={() => handleOpenInspecao(r.id)}>Registrar Inspeção</Button>
                        ) : "-"}
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
      <Modal show={showVeiculoModal} onHide={() => setShowVeiculoModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Cadastrar Novo Veículo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group><Form.Label>Marca</Form.Label>
                <Form.Control value={veiculoData.marca} onChange={e => setVeiculoData({...veiculoData, marca: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label>Modelo</Form.Label>
                <Form.Control value={veiculoData.modelo} onChange={e => setVeiculoData({...veiculoData, modelo: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group><Form.Label>Placa</Form.Label>
                <Form.Control value={veiculoData.placa} onChange={e => setVeiculoData({...veiculoData, placa: e.target.value.toUpperCase()})} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group><Form.Label>Ano</Form.Label>
                <Form.Control type="number" value={veiculoData.ano} onChange={e => setVeiculoData({...veiculoData, ano: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group><Form.Label>Unidade / Filial</Form.Label>
                <Form.Select value={veiculoData.unidade_id} onChange={e => setVeiculoData({...veiculoData, unidade_id: e.target.value})}>
                  <option value="">Não Vinculado</option>
                  {unidades.map(u => (<option key={u.id} value={u.id}>{u.nome_unidade}</option>))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group><Form.Label>Renavam</Form.Label>
                <Form.Control value={veiculoData.renavam} onChange={e => setVeiculoData({...veiculoData, renavam: e.target.value})} />
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
            <Col md={4}>
              <Form.Group><Form.Label>Categoria</Form.Label>
                <Form.Select value={veiculoData.categoria} onChange={e => setVeiculoData({...veiculoData, categoria: e.target.value})}>
                  <option>Passeio</option><option>Utilitário</option><option>Carga</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group><Form.Label>Data Aquisição</Form.Label>
                <Form.Control type="date" value={veiculoData.data_aquisicao} onChange={e => setVeiculoData({...veiculoData, data_aquisicao: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group><Form.Label>Valor do Bem</Form.Label>
                <Form.Control type="number" step="0.01" value={veiculoData.valor_bem} onChange={e => setVeiculoData({...veiculoData, valor_bem: e.target.value})} />
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
            <Col md={12}>
              <Form.Group><Form.Label>Apólice de Seguro</Form.Label>
                <Form.Control value={veiculoData.apolice_seguro} onChange={e => setVeiculoData({...veiculoData, apolice_seguro: e.target.value})} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVeiculoModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSaveVeiculo}>Salvar Veículo</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Reserva */}
      <Modal show={showReservaModal} onHide={() => setShowReservaModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Solicitar Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group><Form.Label>Selecione o Veículo</Form.Label>
                <Form.Select value={reservaData.veiculo_id} onChange={e => setReservaData({...reservaData, veiculo_id: e.target.value})}>
                  <option value="">Selecione...</option>
                  {veiculos.filter(v => v.status === "Disponível").map(v => (
                    <option key={v.id} value={v.id}>{v.marca} {v.modelo} - Placa: {v.placa}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label>Data de Saída</Form.Label>
                <Form.Control type="date" value={reservaData.data_inicio} onChange={e => setReservaData({...reservaData, data_inicio: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label>Hora de Saída</Form.Label>
                <Form.Control type="time" value={reservaData.hora_inicio} onChange={e => setReservaData({...reservaData, hora_inicio: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label>Data de Retorno</Form.Label>
                <Form.Control type="date" value={reservaData.data_fim} onChange={e => setReservaData({...reservaData, data_fim: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label>Hora de Retorno</Form.Label>
                <Form.Control type="time" value={reservaData.hora_fim} onChange={e => setReservaData({...reservaData, hora_fim: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label>Origem</Form.Label>
                <Form.Control value={reservaData.origem} onChange={e => setReservaData({...reservaData, origem: e.target.value})} placeholder="Sede da empresa" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label>Destino</Form.Label>
                <Form.Control value={reservaData.destino} onChange={e => setReservaData({...reservaData, destino: e.target.value})} placeholder="Cliente X" />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group><Form.Label>Motivo / Observações</Form.Label>
                <Form.Control as="textarea" rows={2} value={reservaData.motivo} onChange={e => setReservaData({...reservaData, motivo: e.target.value})} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReservaModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSaveReserva}>Solicitar Reserva</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Vistoria */}
      <Modal show={showInspecaoModal} onHide={() => setShowInspecaoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Registro de Vistoria</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            Por favor, confira o estado do carro e anote o odômetro exato antes de sair ou ao retornar.
          </Alert>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group><Form.Label>Tipo de Inspeção</Form.Label>
                <Form.Select value={inspecaoData.tipo} onChange={e => setInspecaoData({...inspecaoData, tipo: e.target.value})}>
                  <option>Saída</option>
                  <option>Retorno</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label>KM Marcado no Painel</Form.Label>
                <Form.Control type="number" value={inspecaoData.quilometragem} onChange={e => setInspecaoData({...inspecaoData, quilometragem: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label>Nível do Combustível</Form.Label>
                <Form.Select value={inspecaoData.nivel_combustivel} onChange={e => setInspecaoData({...inspecaoData, nivel_combustivel: e.target.value})}>
                  <option>Cheio</option><option>3/4</option><option>1/2 (Meio)</option><option>1/4</option><option>Reserva</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group><Form.Label>Avarias Visíveis (Arranhões, luzes acesas, sujeira)</Form.Label>
                <Form.Control as="textarea" rows={3} value={inspecaoData.avarias} onChange={e => setInspecaoData({...inspecaoData, avarias: e.target.value})} placeholder="Descreva se encontrar algo..." />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInspecaoModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleSaveInspecao}>Salvar Vistoria</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}