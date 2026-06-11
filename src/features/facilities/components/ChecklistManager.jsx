import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../../../services/api";
import { Card, Form, Button, Alert, Spinner, ListGroup } from "react-bootstrap";

export default function ChecklistManager({ projetoId , etapaId, checklists = [], onUpdate }) {
  const [checklistSelecionado, setChecklistSelecionado] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [novo, setNovo] = useState("");

  const fetchItens = useCallback(async () => {
    if (!checklistSelecionado) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/obras/checklist-itens/${checklistSelecionado.id}`);
      setItens(res.data || []);
    } catch (error) {
      setErro("Erro ao carregar itens: " + error.message);
    }
    setLoading(false);
  }, [checklistSelecionado]);

  useEffect(() => {
    if (checklistSelecionado) {
      fetchItens();
    }
  }, [checklistSelecionado, fetchItens]);

  const handleToggleItem = async (item) => {
    try {
      await apiClient.put(`/api/obras/checklist-itens/${item.id}`, {
        ...item,
        concluido: !item.concluido
      });
      await fetchItens();
      onUpdate();
    } catch (error) {
      setErro("Erro ao atualizar item: " + error.message);
    }
  };

  const handleAddItem = async () => {
    if (!novo.trim()) return;
    try {
      await apiClient.post("/api/obras/checklist-itens", {
        checklist_id: checklistSelecionado.id,
        descricao: novo,
        responsavel_id: null,
        observacoes: ""
      });
      setNovo("");
      await fetchItens();
      onUpdate();
    } catch (error) {
      setErro("Erro ao adicionar item: " + error.message);
    }
  };

  if (!checklistSelecionado && checklists.length === 0) {
    return <p className="text-muted">Nenhum checklist criado</p>;
  }

  if (!checklistSelecionado) {
    return (
      <ListGroup>
        {checklists.map((c) => {
          const percent = c.total_itens > 0 ? Math.round((c.itens_concluidos / c.total_itens) * 100) : 0;
          return (
            <ListGroup.Item
              key={c.id}
              onClick={() => setChecklistSelecionado(c)}
              style={{ cursor: "pointer" }}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <h6 className="mb-1">{c.titulo}</h6>
                <small className="text-muted">{c.descricao}</small>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="text-end">
                  <small className="text-muted" style={{fontSize: '0.75rem'}}>{c.itens_concluidos}/{c.total_itens} concluídos</small>
                  <div className="mt-1" style={{ height: "4px", backgroundColor: "#e9ecef", borderRadius: "2px", width: "80px" }}>
                    <div style={{ height: "100%", backgroundColor: percent === 100 ? "#28a745" : "#ffc107", width: `${percent}%` }}></div>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-muted"></i>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    );
  }

  const totalItens = itens.length;
  const concluidos = itens.filter((i) => i.concluido).length;
  const percentual = totalItens > 0 ? Math.round((concluidos / totalItens) * 100) : 0;

  return (
    <Card className="shadow-sm">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-2">{checklistSelecionado.titulo}</h6>
            <small className="text-muted">{concluidos}/{totalItens} itens concluídos ({percentual}%)</small>
            <div className="mt-2" style={{ height: "6px", backgroundColor: "#e9ecef", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  backgroundColor: percentual === 100 ? "#28a745" : "#ffc107",
                  width: `${percentual}%`,
                  transition: "all 0.3s"
                }}
              ></div>
            </div>
          </div>
          <Button size="sm" variant="link" onClick={() => setChecklistSelecionado(null)}>
            ← Voltar
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}

        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <>
            <ListGroup className="mb-3">
              {itens.map((item) => (
                <ListGroup.Item key={item.id} className="d-flex align-items-center gap-2">
                  <Form.Check
                    type="checkbox"
                    checked={item.concluido || false}
                    onChange={() => handleToggleItem(item)}
                    className="mb-0"
                  />
                  <span style={{ textDecoration: item.concluido ? "line-through" : "none", color: item.concluido ? "#999" : "#000" }}>
                    {item.descricao}
                  </span>
                  {item.concluido && <i className="bi bi-check-circle-fill text-success ms-auto"></i>}
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="input-group">
              <Form.Control
                placeholder="Adicionar novo item..."
                value={novo}
                onChange={(e) => setNovo(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
              />
              <Button variant="success" onClick={handleAddItem} size="sm">
                <i className="bi bi-plus"></i>
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
