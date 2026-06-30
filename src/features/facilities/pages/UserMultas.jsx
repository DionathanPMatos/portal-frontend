import React, { useState, useEffect } from "react";
import {
  Container, Card, Row, Col, Button, Table, Badge, Alert, Spinner
} from "react-bootstrap";
import { format } from "date-fns";
import ModalMulta from "../../fleet-management/components/ModalMulta";
import apiClient from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { FaExclamationTriangle, FaFunnelDollar, FaUserCheck, FaEye } from "react-icons/fa";

const emptyMulta = {
  veiculo_id: "", motorista_id: "", data_infracao: "", valor: "", local_infracao: "", descricao: "", pontos_cnh: "", status: "Pendente Identificação"
};

export default function UserMultas() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [multas, setMultas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [showMultaModal, setShowMultaModal] = useState(false);
  const [multaData, setMultaData] = useState(emptyMulta);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resMultas, resVeiculos, resFuncionarios] = await Promise.all([
        apiClient.get("/api/frota/multas").catch(() => ({ data: [] })),
        apiClient.get("/api/frota/veiculos").catch(() => ({ data: [] })),
        apiClient.get("/api/funcionarios").catch(() => ({ data: [] }))
      ]);
      setMultas(resMultas.data || []);
      setVeiculos(resVeiculos.data || []);
      setFuncionarios(resFuncionarios.data || []);
    } catch (e) {
      console.error(e);
      setErr("Erro ao carregar multas e condutores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenMultaModal = (m) => {
    // Alinha o formato do datetime-local
    setMultaData({
      ...m,
      data_infracao: m.data_infracao ? m.data_infracao.slice(0, 16) : ""
    });
    setShowMultaModal(true);
  };

  const handleSaveMulta = async () => {
    setErr("");
    try {
      if (multaData.id) {
        // Envia atualização (principalmente motorista_id e status)
        const payload = {
          ...multaData,
          motorista_id: multaData.motorista_id ? Number(multaData.motorista_id) : null
        };
        await apiClient.put(`/api/frota/multas/${multaData.id}`, payload);
        setSuccess("Condutor identificado / Multa atualizada com sucesso.");
      }
      setShowMultaModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
      setErr("Erro ao salvar multa.");
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const getMultaBadge = (status) => {
    if (status === "Pendente Identificação") return "danger";
    if (status === "Identificado") return "primary";
    if (status === "Recorrido") return "warning";
    if (status === "Pago") return "success";
    return "secondary";
  };

  // Exibe multas do próprio condutor logado OU multas sem identificação (para que ele possa assumir se foi ele)
  const myMultas = multas.filter(m => {
    if (!user) return false;
    const isOwner = String(m.motorista_id) === String(user.id);
    const isUnassignedPending = (!m.motorista_id) && m.status === "Pendente Identificação";
    return isOwner || isUnassignedPending;
  });

  return (
    <div className="container-main p-4">
      <div className="page-header-colored mb-4" >
        <div className="page-header-title-wrapper">
          <h2 className="page-header-title d-flex align-items-center gap-3 m-0">
            <FaExclamationTriangle /> Minhas Multas e Infrações
          </h2>
          <p className="page-header-subtitle m-0 mt-1 opacity-75">Visualize infrações cadastradas em seu nome ou identifique-se como condutor.</p>
        </div>
      </div>

      {err && <Alert variant="danger" onClose={() => setErr("")} dismissible>{err}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Body>
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
                {myMultas.map(m => {
                  const isMyFine = user && String(m.motorista_id) === String(user.id);
                  return (
                    <tr key={m.id}>
                      <td>{format(new Date(m.data_infracao), "dd/MM/yy HH:mm")}</td>
                      <td>{m.modelo} (<strong>{m.placa}</strong>)</td>
                      <td>
                        {m.local_infracao}
                        <br />
                        <small className="text-muted">{m.descricao} ({m.pontos_cnh} pts)</small>
                      </td>
                      <td className="text-danger fw-bold">{formatCurrency(m.valor)}</td>
                      <td>
                        {m.motorista_nome ? (
                          <strong>{m.motorista_nome}</strong>
                        ) : (
                          <span className="text-danger fw-semibold d-flex align-items-center gap-1">
                            <FaUserCheck /> Pendente Identificação
                          </span>
                        )}
                      </td>
                      <td>
                        <Badge bg={getMultaBadge(m.status)}>{m.status}</Badge>
                      </td>
                      <td>
                        {!m.motorista_id ? (
                          <Button size="sm" variant="danger" onClick={() => handleOpenMultaModal(m)}>
                            Identificar Condutor
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline-primary" onClick={() => handleOpenMultaModal(m)}>
                            <FaEye /> Detalhes / Editar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {myMultas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-3">
                      Nenhuma multa ou infração pendente encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <ModalMulta
        show={showMultaModal}
        onHide={() => setShowMultaModal(false)}
        multaData={multaData}
        setMultaData={setMultaData}
        veiculos={veiculos}
        funcionarios={funcionarios}
        onSave={handleSaveMulta}
      />
    </div>
  );
}
