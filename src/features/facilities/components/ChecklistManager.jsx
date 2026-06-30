import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../../../services/api";
import { Card, Form, Button, Alert, Spinner, ListGroup, InputGroup, Badge } from "react-bootstrap";
import { useAuth } from "../../../contexts/AuthContext";

export default function ChecklistManager({ 
  projetoId, 
  etapaId, 
  checklists = [], 
  onUpdate, 
  funcionarios = [], 
  projeto = null, 
  stages = [] 
}) {
  const { user } = useAuth();
  const [checklistSelecionado, setChecklistSelecionado] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [novo, setNovo] = useState("");
  const [showNovoChecklistForm, setShowNovoChecklistForm] = useState(false);
  const [novoChecklistTitulo, setNovoChecklistTitulo] = useState("");

  const hasPrivilege = (user, requiredPrivileges) => {
    if (!user || !user.privilegios) return false;
    const userPrivileges = user.privilegios.toLowerCase().split(",");
    return requiredPrivileges.some((p) => userPrivileges.includes(p.toLowerCase()));
  };

  const canEditItem = (item) => {
    if (!user) return false;
    
    // Admins, supervisores e gestores sempre podem alterar tudo
    if (hasPrivilege(user, ["Admin", "Supervisor", "Gestor"])) return true;

    // Responsável pelo projeto sempre pode alterar tudo
    if (projeto && String(projeto.responsavel_id) === String(user.id)) return true;

    // Se o usuário for o responsável específico deste item
    if (item.responsavel_id && String(item.responsavel_id) === String(user.id)) return true;

    // Se o usuário for um dos responsáveis pela etapa
    const stageId = item.etapa_id || etapaId;
    if (stages && stageId) {
      const stage = stages.find(s => s.id === stageId);
      if (stage && stage.responsavel_ids) {
        let ids = [];
        try {
          ids = Array.isArray(stage.responsavel_ids) 
            ? stage.responsavel_ids 
            : JSON.parse(stage.responsavel_ids);
        } catch (e) {
          ids = [];
        }
        if (Array.isArray(ids) && ids.map(String).includes(String(user.id))) return true;
      }
    }

    return false;
  };

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
        concluido: !item.concluido,
        data_conclusao: !item.concluido ? new Date().toISOString() : null
      });
      await fetchItens();
      onUpdate();
    } catch (error) {
      setErro("Erro ao atualizar item: " + error.message);
    }
  };

  const handleUpdateItemResponsible = async (item, responsavelId) => {
    try {
      await apiClient.put(`/api/obras/checklist-itens/${item.id}`, {
        ...item,
        responsavel_id: responsavelId ? Number(responsavelId) : null
      });
      await fetchItens();
      onUpdate();
    } catch (error) {
      setErro("Erro ao atualizar responsável: " + error.message);
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

  const handleCreateChecklist = async () => {
    if (!novoChecklistTitulo.trim() || !projetoId) {
        setErro("O título do checklist é obrigatório.");
        return;
    }
    try {
        await apiClient.post("/api/obras/checklists", {
            projeto_id: projetoId,
            etapa_id: etapaId,
            titulo: novoChecklistTitulo,
            descricao: ""
        });
        setNovoChecklistTitulo("");
        setShowNovoChecklistForm(false);
        onUpdate();
    } catch (error) {
        setErro("Erro ao criar o checklist: " + error.message);
    }
  };

  if (!checklistSelecionado) {
    return (
      <>
        {checklists.length === 0 && !showNovoChecklistForm && <p className="text-muted">Nenhum checklist criado para esta etapa.</p>}
        <ListGroup>
          {checklists.map((c) => {
            const percent = c.total_itens > 0 ? Math.round((c.itens_concluidos / c.total_itens) * 100) : 0;
            return (
              <ListGroup.Item
                key={c.id}
                action
                onClick={() => setChecklistSelecionado(c)}
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
        <div className="mt-3">
          {showNovoChecklistForm ? (
            <InputGroup>
              <Form.Control placeholder="Título do novo checklist..." value={novoChecklistTitulo} onChange={(e) => setNovoChecklistTitulo(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleCreateChecklist()} />
              <Button variant="success" onClick={handleCreateChecklist}>Salvar</Button>
              <Button variant="outline-secondary" onClick={() => setShowNovoChecklistForm(false)}>Cancelar</Button>
            </InputGroup>
          ) : (
            <Button variant="outline-primary" size="sm" onClick={() => setShowNovoChecklistForm(true)}>
              <i className="bi bi-plus-circle me-2"></i>Criar Novo Checklist
            </Button>
          )}
        </div>
      </>
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
              {itens.map((item) => {
                const editable = canEditItem(item);
                return (
                  <ListGroup.Item key={item.id} className="d-flex align-items-center justify-content-between gap-3 py-2">
                    <div className="d-flex align-items-center gap-2 flex-grow-1">
                      <Form.Check
                        type="checkbox"
                        checked={item.concluido || false}
                        onChange={() => handleToggleItem(item)}
                        disabled={!editable}
                        className="mb-0"
                      />
                      <span style={{ textDecoration: item.concluido ? "line-through" : "none", color: item.concluido ? "#999" : "#000" }}>
                        {item.descricao}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {editable ? (
                        <Form.Select
                          size="sm"
                          style={{ width: "160px", fontSize: "0.78rem" }}
                          value={item.responsavel_id || ""}
                          onChange={(e) => handleUpdateItemResponsible(item, e.target.value)}
                        >
                          <option value="">Sem responsável</option>
                          {funcionarios.map(f => (
                            <option key={f.id} value={f.id}>{f.nome_completo}</option>
                          ))}
                        </Form.Select>
                      ) : (
                        item.responsavel_id && (
                          <Badge bg="secondary" style={{ fontSize: "0.72rem" }}>
                            👤 {funcionarios.find(f => f.id === item.responsavel_id)?.nome_completo || "Responsável"}
                          </Badge>
                        )
                      )}
                      {item.concluido && <i className="bi bi-check-circle-fill text-success"></i>}
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>

            <InputGroup>
              <Form.Control
                placeholder="Adicionar novo item..."
                value={novo}
                onChange={(e) => setNovo(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
              />
              <Button variant="success" onClick={handleAddItem} size="sm">
                <i className="bi bi-plus"></i>
              </Button>
            </InputGroup>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
