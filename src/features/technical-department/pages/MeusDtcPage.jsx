import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import apiClient from "../../../services/api"; // Ajuste o caminho se necessário
import { toast } from "react-toastify";

const MeusDtcPage = () => {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMeusProjetos = async () => {
    try {
      setLoading(true);
      // Rota que criamos no backend para buscar os projetos do colaborador logado
      const { data } = await apiClient.get(
        "/api/technical-department/meus-projetos-dtc",
      );
      setProjetos(data);
    } catch (error) {
      toast.error("Erro ao carregar seus projetos DTC.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeusProjetos();
  }, []);

  const handleOpenModal = (projeto) => {
    setProjetoSelecionado(projeto);
    setShowModal(true);
  };

  const handleFinalizarDtc = async () => {
    try {
      setActionLoading(true);
      await apiClient.patch(
        `/api/technical-department/projetos/${projetoSelecionado.id}/dtc-finalizar`,
      );
      toast.success("Projeto finalizado! Vendedor notificado.");
      setShowModal(false);
      fetchMeusProjetos(); // Recarrega a lista
    } catch (error) {
      toast.error("Erro ao finalizar o projeto.");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 border-start border-primary border-4">
            <Card.Body>
              <h6 className="text-muted mb-2">Meus Projetos em Andamento</h6>
              <h3 className="mb-0">{projetos.length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Table responsive hover className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Projeto</th>
                <th>Cliente</th>
                <th>Vendedores</th>
                <th>Fechamento Prev.</th>
                <th>Status DTC</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {projetos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Nenhum projeto atribuído a você no momento.
                  </td>
                </tr>
              ) : (
                projetos.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-semibold">{p.nome_projeto}</td>
                    <td>{p.nome_cliente || "-"}</td>
                    <td>{p.nome_vendedor || "-"}</td>
                    <td>
                      {p.data_fechamento_prevista
                        ? new Date(
                            p.data_fechamento_prevista,
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <Badge bg="warning">{p.status_proposta_dtc}</Badge>
                    </td>
                    <td className="text-end">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleOpenModal(p)}
                      >
                        <i className="bi bi-check-circle me-1"></i> Finalizar
                        Proposta
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de Confirmação */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Finalizar Proposta Técnica</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Você está prestes a finalizar a proposta técnica do projeto{" "}
            <strong>{projetoSelecionado?.nome_projeto}</strong>.
          </p>
          <p className="text-muted small">
            Ao confirmar, o status do projeto avançará para{" "}
            <strong>55% - Envio de Proposta</strong> e o vendedor{" "}
            <strong>{projetoSelecionado?.nome_vendedor}</strong> receberá uma
            notificação automática no sistema.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleFinalizarDtc}
            disabled={actionLoading}
          >
            {actionLoading ? <Spinner size="sm" /> : "Confirmar e Notificar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MeusDtcPage;
