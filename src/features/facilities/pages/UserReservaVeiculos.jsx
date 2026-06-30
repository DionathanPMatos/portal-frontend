import React, { useState, useEffect } from "react";
import {
  Container, Card, Row, Col, Button, Table, Badge, Alert, Spinner, Form
} from "react-bootstrap";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import ModalReserva from "../../fleet-management/components/ModalReserva";
import ModalInspecao from "../../fleet-management/components/ModalInspecao";
import apiClient from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { FaBuilding, FaCar, FaCalendarAlt, FaHistory, FaTrash, FaPencilAlt } from "react-icons/fa";

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

const emptyReserva = {
  veiculo_id: "", data_inicio: "", hora_inicio: "", data_fim: "", hora_fim: "", origem: "", destino: "", motivo: ""
};

const emptyInspecao = {
  tipo: "Saída", quilometragem: "", nivel_combustivel: "Cheio", avarias: "",
  fotos: []
};

export default function UserReservaVeiculos() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [veiculos, setVeiculos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [selectedFilial, setSelectedFilial] = useState("");

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [avisoCnh, setAvisoCnh] = useState("");

  const [showReservaModal, setShowReservaModal] = useState(false);
  const [reservaData, setReservaData] = useState(emptyReserva);

  const [showInspecaoModal, setShowInspecaoModal] = useState(false);
  const [inspecaoData, setInspecaoData] = useState(emptyInspecao);
  const [reservaSelecionadaId, setReservaSelecionadaId] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resVeiculos, resReservas, resUnidades, resProfile] = await Promise.all([
        apiClient.get("/api/frota/veiculos"),
        apiClient.get("/api/frota/reservas"),
        apiClient.get("/api/unidades"),
        apiClient.get("/api/users/me/profile").catch(() => ({ data: null }))
      ]);
      setVeiculos(resVeiculos.data || []);
      setReservas(resReservas.data || []);
      setUnidades(resUnidades.data || []);
      if (resProfile && resProfile.data && resProfile.data.unidade_id) {
        setSelectedFilial(String(resProfile.data.unidade_id));
      }
    } catch (e) {
      console.error(e);
      setErr("Erro ao carregar dados de reservas e veículos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectSlot = (slotInfo) => {
    setReservaData({
      ...emptyReserva,
      data_inicio: format(slotInfo.start, "yyyy-MM-dd"),
      data_fim: format(slotInfo.end, "yyyy-MM-dd"),
      hora_inicio: format(slotInfo.start, "HH:mm"),
      hora_fim: format(slotInfo.end, "HH:mm"),
    });
    setShowReservaModal(true);
  };

  const handleSaveReserva = async () => {
    setErr("");
    setAvisoCnh("");
    try {
      const start = `${reservaData.data_inicio}T${reservaData.hora_inicio || "08:00"}:00`;
      const end = `${reservaData.data_fim}T${reservaData.hora_fim || "18:00"}:00`;

      const payload = {
        ...reservaData,
        veiculo_id: Number(reservaData.veiculo_id),
        data_inicio: start,
        data_fim: end
      };

      if (reservaData.id) {
        await apiClient.put(`/api/frota/reservas/${reservaData.id}`, payload);
        setSuccess("Reserva atualizada com sucesso!");
      } else {
        const res = await apiClient.post("/api/frota/reservas", payload);
        if (res.data.aviso) setAvisoCnh(res.data.aviso);
        else setSuccess("Reserva realizada com sucesso!");
      }

      setShowReservaModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr(e.response?.data?.error || "Erro ao salvar reserva.");
    }
  };

  const handleEditReserva = (r) => {
    setReservaData({
      id: r.id,
      veiculo_id: r.veiculo_id,
      data_inicio: r.data_inicio.split("T")[0],
      hora_inicio: r.data_inicio.split("T")[1]?.substring(0, 5) || "08:00",
      data_fim: r.data_fim.split("T")[0],
      hora_fim: r.data_fim.split("T")[1]?.substring(0, 5) || "18:00",
      origem: r.origem,
      destino: r.destino,
      motivo: r.motivo
    });
    setShowReservaModal(true);
  };

  const handleDeleteReserva = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta reserva?")) return;
    setErr("");
    try {
      await apiClient.delete(`/api/frota/reservas/${id}`);
      setSuccess("Reserva excluída com sucesso.");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr(e.response?.data?.error || "Erro ao excluir reserva.");
    }
  };

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

      inspecaoData.fotos.forEach(file => {
        formData.append('fotos_files', file);
      });

      await apiClient.post("/api/frota/inspecoes", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess("Vistoria registrada com sucesso.");
      setShowInspecaoModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr(e.response?.data?.error || "Erro ao registrar vistoria.");
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

  const myReservations = reservas.filter(r => user && String(r.usuario_id) === String(user.id));
  const availableVehicles = veiculos.filter(v => {
    if (v.status !== "Disponível") return false;
    if (selectedFilial && String(v.unidade_id) !== String(selectedFilial)) return false;
    return true;
  });

  return (
    <div className="container-main p-4">
      <div className="page-header-colored mb-4" >
        <div className="page-header-title-wrapper d-flex justify-content-between align-items-center">
          <div>
            <h2 className="page-header-title d-flex align-items-center gap-3 m-0">
              <FaCar /> Reserva de Veículos
            </h2>
            <p className="page-header-subtitle m-0 mt-1 opacity-75">Solicite e acompanhe suas reservas de veículos corporativos.</p>
          </div>
          <Button variant="btn btn-primary" className="fw-semibold" onClick={() => { setReservaData(emptyReserva); setShowReservaModal(true); }}>
            + Reservar Veículo
          </Button>
        </div>
      </div>

      {err && <Alert variant="danger" onClose={() => setErr("")} dismissible>{err}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}
      {avisoCnh && <Alert variant="warning" onClose={() => setAvisoCnh("")} dismissible>{avisoCnh}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Row className="g-4">
          {/* Coluna Lateral: Carros Disponíveis por Filial */}
          <Col lg={3} md={4}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-white py-3 border-0">
                <h6 className="m-0 fw-bold text-secondary d-flex align-items-center gap-2">
                  <FaBuilding /> Filial de Retirada
                </h6>
              </Card.Header>
              <Card.Body className="pt-0">
                <Form.Group className="mb-4">
                  <Form.Select value={selectedFilial} onChange={e => setSelectedFilial(e.target.value)}>
                    <option value="">Todas as Filiais</option>
                    {unidades.map(u => (
                      <option key={u.id} value={u.id}>{u.nome_unidade}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                  Veículos Disponíveis ({availableVehicles.length})
                </h6>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {availableVehicles.length === 0 ? (
                    <p className="text-muted text-center py-3" style={{ fontSize: "0.9rem" }}>Nenhum veículo disponível nesta filial.</p>
                  ) : (
                    availableVehicles.map(v => (
                      <Card key={v.id} className="mb-2 border bg-light shadow-none">
                        <Card.Body className="p-2.5 d-flex align-items-center">
                          {v.imagem_principal_url ? (
                            <img 
                              src={v.imagem_principal_url} 
                              alt={`${v.marca} ${v.modelo}`} 
                              style={{ width: "55px", height: "55px", objectFit: "cover", borderRadius: "6px", marginRight: "12px" }}
                            />
                          ) : (
                            <div 
                              className="bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center text-secondary"
                              style={{ width: "55px", height: "55px", borderRadius: "6px", marginRight: "12px" }}
                            >
                              <FaCar size={24} />
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>{v.marca} {v.modelo}</div>
                            <div className="text-muted" style={{ fontSize: "0.82rem" }}>Placa: <strong className="text-secondary">{v.placa}</strong></div>
                            <div className="text-muted" style={{ fontSize: "0.82rem" }}>Categoria: {v.categoria}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Coluna Central: Calendário de Reservas */}
          <Col lg={9} md={8}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Body>
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                  <FaCalendarAlt /> Agenda Geral da Frota
                </h6>
                <div style={{ height: "550px" }}>
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
              </Card.Body>
            </Card>
          </Col>

          {/* Tabela de Minhas Solicitações */}
          <Col md={12}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white py-3 border-0">
                <h6 className="m-0 fw-bold text-dark d-flex align-items-center gap-2">
                  <FaHistory /> Minhas Solicitações
                </h6>
              </Card.Header>
              <Card.Body className="pt-0">
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Veículo</th>
                      <th>Origem - Destino</th>
                      <th>Status</th>
                      <th>Vistoria</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myReservations.map(r => (
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
                        <td>
                          {(r.status === "Aprovada" || r.status === "Aguardando Aprovação") ? (
                            <div className="d-flex gap-2">
                              <Button size="sm" variant="outline-primary" onClick={() => handleEditReserva(r)}>
                                <FaPencilAlt /> Editar
                              </Button>
                              <Button size="sm" variant="outline-danger" onClick={() => handleDeleteReserva(r.id)}>
                                <FaTrash /> Excluir
                              </Button>
                            </div>
                          ) : "-"}
                        </td>
                      </tr>
                    ))}
                    {myReservations.length === 0 && (
                      <tr><td colSpan={6} className="text-center text-muted py-3">Você não possui nenhuma solicitação registrada.</td></tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <ModalReserva
        show={showReservaModal}
        onHide={() => setShowReservaModal(false)}
        reservaData={reservaData}
        setReservaData={setReservaData}
        veiculos={veiculos}
        onSave={handleSaveReserva}
      />

      <ModalInspecao
        show={showInspecaoModal}
        onHide={() => setShowInspecaoModal(false)}
        inspecaoData={inspecaoData}
        setInspecaoData={setInspecaoData}
        onSave={handleSaveInspecao}
      />
    </div>
  );
}
