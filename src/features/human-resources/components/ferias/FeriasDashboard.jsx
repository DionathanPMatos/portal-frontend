import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Badge,
  ListGroup,
  Button,
  Image,
} from "react-bootstrap";
import {
  FaClipboardList,
  FaUmbrellaBeach,
  FaExclamationTriangle,
  FaSkull,
  FaCheckCircle,
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../../services/api";

const FeriasDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleAprovar = useCallback(async (id) => {
    try {
      await apiClient.put(`/ferias/solicitacoes/${id}/aprovar`);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao aprovar.");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, alertasRes] = await Promise.all([
          apiClient.get("/api/ferias/dashboard"),
          apiClient.get("/api/ferias/alertas-vencimento?dias=60"),
        ]);
        setDashboard(dashRes.data);
        setAlertas(alertasRes.data);
      } catch (err) {
        setError("Erro ao carregar os dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;

  const kpis = [
    {
      label: "Pendentes de Aprovação",
      value: dashboard.pendentes,
      icon: <FaClipboardList />,
      color: "warning",
      tab: "solicitacoes",
    },
    {
      label: "Colaboradores em Gozo",
      value: dashboard.em_gozo_hoje,
      icon: <FaUmbrellaBeach />,
      color: "success",
      tab: "calendario",
    },
    {
      label: "Vencendo em 60 dias",
      value: dashboard.vencendo_em_60d,
      icon: <FaExclamationTriangle />,
      color: "danger",
      tab: "alertas",
    },
    {
      label: "Períodos Vencidos",
      value: dashboard.periodos_vencidos,
      icon: <FaSkull />,
      color: "dark",
      tab: "alertas",
    },
    {
      label: "Aprovadas este Mês",
      value: dashboard.aprovados_este_mes,
      icon: <FaCheckCircle />,
      color: "primary",
      tab: "solicitacoes",
    },
  ];

  return (
    <div className="p-3">
      {/* KPIs */}
      <Row xs={2} md={3} xl={5} className="g-3 mb-4">
        {kpis.map((kpi, i) => (
          <Col key={i}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="d-flex align-items-center gap-3">
                <div className={`kpi-icon-circle kpi-icon-circle-${kpi.color}`}>
                  {kpi.icon}
                </div>
                <div>
                  <div className="text-muted small">{kpi.label}</div>
                  <div className="fs-4 fw-bold">{kpi.value}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Alertas de Vencimento */}
      {alertas.length > 0 && (
        <Card className="shadow-sm border-0 border-start border-4 border-danger mb-4">
          <Card.Header className="fw-bold d-flex align-items-center gap-2 text-danger">
            <FaExclamationTriangle /> Atenção: Períodos Concessivos Vencendo em
            Breve
          </Card.Header>
          <ListGroup variant="flush">
            {alertas.slice(0, 8).map((pa) => {
              const diasRestantes = Math.ceil(
                (new Date(pa.data_fim_pc) - new Date()) / (1000 * 60 * 60 * 24),
              );
              return (
                <ListGroup.Item
                  key={pa.id}
                  className="d-flex justify-content-between align-items-center py-3"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div>
                      <div className="fw-bold">
                        {pa.funcionario.nome_completo}
                      </div>
                      <div className="text-muted small">
                        {pa.funcionario.setor?.nome_setor} · {pa.dias_saldo}{" "}
                        dias de saldo
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    <Badge
                      bg={diasRestantes <= 30 ? "danger" : "warning"}
                      text={diasRestantes <= 30 ? undefined : "dark"}
                    >
                      {diasRestantes <= 0
                        ? "VENCIDO"
                        : `Vence em ${diasRestantes} dias`}
                    </Badge>
                    <div className="text-muted small mt-1">
                      {new Date(pa.data_fim_pc).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
          {alertas.length > 8 && (
            <Card.Footer className="text-center">
              <Button variant="link" size="sm">
                Ver todos os {alertas.length} alertas
              </Button>
            </Card.Footer>
          )}
        </Card>
      )}
    </div>
  );
};

export default FeriasDashboard;
