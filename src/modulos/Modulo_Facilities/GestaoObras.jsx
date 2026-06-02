import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Card, Row, Col, Button, Table, Badge, Alert, Spinner, Tabs, Tab, Form, ProgressBar } from "react-bootstrap";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import ModalProjeto from "./components/ModalProjeto";
import ModalEtapa from "./components/ModalEtapa";
import ModalOrcamento from "./components/ModalOrcamento";
import ModalMaterial from "./components/ModalMaterial";
import ModalChecklist from "./components/ModalChecklist";
import ModalComentario from "./components/ModalComentario";
import ModalEtapaDetalhes from "./components/ModalEtapaDetalhes";
import ModalOrcamentoDetalhes from "./components/ModalOrcamentoDetalhes";
import ModalMaterialDetalhes from "./components/ModalMaterialDetalhes";
import ChecklistManager from "./components/ChecklistManager";
import "./css/GestaoObras.css";

const emptyProject = {
  nome_projeto: "",
  descricao: "",
  filial_id: "",
  responsavel_id: "",
  data_inicio: "",
  data_prevista_conclusao: "",
  orcamento_total: 0,
  prioridade: "Normal",
  observacoes: ""
};

export default function GestaoObras() {
  const [loading, setLoading] = useState(true);
  const [projetos, setProjetos] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [evolucao, setEvolucao] = useState([]);
  const [unidades, setUnidades] = useState([]);
  
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPrioridade, setFilterPrioridade] = useState("");
  
  const [showProject, setShowProject] = useState(false);
  const [projectData, setProjectData] = useState(emptyProject);
  
  const [showEtapa, setShowEtapa] = useState(false);
  const [showOrcamento, setShowOrcamento] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showComentario, setShowComentario] = useState(false);
  
  // Modais de edição
  const [showEtapaDetalhes, setShowEtapaDetalhes] = useState(false);
  const [etapaSelecionada, setEtapaSelecionada] = useState(null);
  
  const [showOrcamentoDetalhes, setShowOrcamentoDetalhes] = useState(false);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);
  
  const [showMaterialDetalhes, setShowMaterialDetalhes] = useState(false);
  const [materialSelecionado, setMaterialSelecionado] = useState(null);
  
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  
  const statusColors = {
    "Planejamento": "info",
    "Em Execução": "warning",
    "Parado": "danger",
    "Concluído": "success"
  };
  
  const prioridadeColors = {
    "Baixa": "secondary",
    "Normal": "info",
    "Alta": "warning",
    "Crítica": "danger"
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProj, resUnidades] = await Promise.all([
        axios.get("/api/obras/projetos").catch(() => ({ data: [] })),
        axios.get("/api/unidades").catch(() => ({ data: [] }))
      ]);
      setProjetos(resProj.data || []);
      setUnidades(resUnidades.data || []);
      if (resProj.data && resProj.data.length > 0) {
        await fetchProjectDetails(resProj.data[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErr("Erro ao carregar dados de obras");
    }
    setLoading(false);
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      const [resEtapas, resOrcamentos, resMateriais, resChecklists, resComentarios, resEvolucao] = await Promise.all([
        axios.get(`/api/obras/etapas/${projectId}`).catch(() => ({ data: [] })),
        axios.get(`/api/obras/orcamentos/${projectId}`).catch(() => ({ data: [] })),
        axios.get(`/api/obras/materiais/${projectId}`).catch(() => ({ data: [] })),
        axios.get(`/api/obras/checklists/${projectId}`).catch(() => ({ data: [] })),
        axios.get(`/api/obras/comentarios/${projectId}`).catch(() => ({ data: [] })),
        axios.get(`/api/obras/evolucao/${projectId}`).catch(() => ({ data: [] }))
      ]);
      setEtapas(resEtapas.data || []);
      setOrcamentos(resOrcamentos.data || []);
      setMateriais(resMateriais.data || []);
      setChecklists(resChecklists.data || []);
      setComentarios(resComentarios.data || []);
      setEvolucao(resEvolucao.data || []);
    } catch (error) {
      console.error("Erro ao carregar detalhes do projeto:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectProject = (projeto) => {
    setProjetoSelecionado(projeto);
    fetchProjectDetails(projeto.id);
  };

  const handleSaveProject = async () => {
    try {
      if (projectData.id) {
        await axios.put(`/api/obras/projetos/${projectData.id}`, projectData);
        setSuccess("Projeto atualizado com sucesso!");
      } else {
        const res = await axios.post("/api/obras/projetos", projectData);
        projectData.id = res.data.id;
        setSuccess("Projeto criado com sucesso!");
      }
      await fetchData();
      setShowProject(false);
      setProjectData(emptyProject);
    } catch (error) {
      setErr("Erro ao salvar projeto: " + error.message);
    }
  };

  const filteredProjetos = projetos.filter(p => {
    const matchesSearch = p.nome_projeto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || p.status === filterStatus;
    const matchesPrioridade = !filterPrioridade || p.prioridade === filterPrioridade;
    return matchesSearch && matchesStatus && matchesPrioridade;
  });

  if (loading) return <Spinner animation="border" />;

  return (
    <Container fluid className="px-4 py-4">
        <Card className="mb-4 shadow-sm border-left-0">
            <Card.Header className="bg-white">  
                <Row className="align-items-center"> 
                    <Col>
              <Card.Title as="h4" className="mb-0"> <i className="bi bi-hammer me-2"></i>Gestão de Obras e Reformas</Card.Title>
                    </Col>  
                    </Row>
            </Card.Header>
       

      {err && <Alert variant="danger" onClose={() => setErr("")} dismissible>{err}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}
    <Card.Body>
      <Row className="mb-4">
        <Col md={3}>
          <Form.Control
            placeholder="Buscar projeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="Planejamento">Planejamento</option>
            <option value="Em Execução">Em Execução</option>
            <option value="Parado">Parado</option>
            <option value="Concluído">Concluído</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={filterPrioridade} onChange={(e) => setFilterPrioridade(e.target.value)}>
            <option value="">Todas as prioridades</option>
            <option value="Baixa">Baixa</option>
            <option value="Normal">Normal</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button
            variant="success"
            onClick={() => {
              setProjectData(emptyProject);
              setShowProject(true);
            }}
            className="w-100"
          >
            <i className="bi bi-plus-circle"></i> Novo Projeto
          </Button>
        </Col>
      </Row>

      <Row>
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-dark text-white">
              <h5>Projetos ({filteredProjetos.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredProjetos.length === 0 ? (
                <p className="p-3 text-muted">Nenhum projeto encontrado</p>
              ) : (
                <div className="projeto-list">
                  {filteredProjetos.map((p) => (
                    <div
                      key={p.id}
                      className={`projeto-item p-3 border-bottom cursor-pointer ${
                        projetoSelecionado?.id === p.id ? "bg-light" : ""
                      }`}
                      onClick={() => handleSelectProject(p)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{p.nome_projeto}</h6>
                          <small className="text-muted d-block">{p.filial_nome}</small>
                        </div>
                        <Badge bg={statusColors[p.status]}>{p.status}</Badge>
                      </div>
                      <div className="mt-2">
                        <ProgressBar now={p.percentual_conclusao_calculado} label={`${p.percentual_conclusao_calculado}%`} className="progress-sm" />
                      </div>
                      <div className="mt-2 small">
                        <div>Orçamento: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.orcamento_total || 0)}</strong></div>
                        <div>Gasto: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.custo_atual || 0)}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          {projetoSelecionado ? (
            <Tabs defaultActiveKey="visao" className="mb-3">
              <Tab eventKey="visao" title="Visão Geral">
                <Card className="shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5>{projetoSelecionado.nome_projeto}</h5>
                    <div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setProjectData(projetoSelecionado);
                          setShowProject(true);
                        }}
                        className="me-2"
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p><strong>Status:</strong> <Badge bg={statusColors[projetoSelecionado.status]}>{projetoSelecionado.status}</Badge></p>
                        <p><strong>Prioridade:</strong> <Badge bg={prioridadeColors[projetoSelecionado.prioridade]}>{projetoSelecionado.prioridade}</Badge></p>
                        <p><strong>Filial:</strong> {projetoSelecionado.filial_nome}</p>
                        <p><strong>Data Início:</strong> {projetoSelecionado.data_inicio ? format(new Date(projetoSelecionado.data_inicio), 'dd/MM/yyyy') : '-'}</p>
                      </Col>
                      <Col md={6}>
                        <p><strong>Conclusão Prevista:</strong> {projetoSelecionado.data_prevista_conclusao ? format(new Date(projetoSelecionado.data_prevista_conclusao), 'dd/MM/yyyy') : '-'}</p>
                        <p><strong>Andamento:</strong></p>
                        <ProgressBar now={projetoSelecionado.percentual_conclusao_calculado} label={`${projetoSelecionado.percentual_conclusao_calculado}%`} />
                        <p className="mt-2"><strong>Orçamento Total:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projetoSelecionado.orcamento_total || 0)}</p>
                        <p><strong>Custo Atual:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projetoSelecionado.custo_atual || 0)}</p>
                      </Col>
                    </Row>
                    {projetoSelecionado.descricao && (
                      <>
                        <hr />
                        <p><strong>Descrição:</strong></p>
                        <p>{projetoSelecionado.descricao}</p>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="etapas" title={`Etapas (${etapas.length})`}>
                <Card className="shadow-sm">
                  <Card.Header>
                    <Button variant="success" size="sm" onClick={() => setShowEtapa(true)}>
                      <i className="bi bi-plus"></i> Nova Etapa
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {etapas.length === 0 ? (
                      <p className="text-muted">Nenhuma etapa criada</p>
                    ) : (
                      <Table hover responsive size="sm">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>Nome</th>
                            <th>Status</th>
                            <th>Andamento</th>
                            <th>Período</th>
                            <th>Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {etapas.map((e) => (
                            <tr key={e.id} style={{ cursor: "pointer" }}>
                              <td>{e.numero_etapa}</td>
                              <td>{e.nome_etapa}</td>
                              <td><Badge bg={statusColors[e.status] || "secondary"}>{e.status}</Badge></td>
                              <td>
                                <ProgressBar now={e.percentual_calculado} style={{ height: '20px' }} label={`${e.percentual_calculado}%`} />
                              </td>
                              <td className="small">
                                {e.data_inicio_planejada && format(new Date(e.data_inicio_planejada), 'dd/MM')} - {e.data_fim_planejada && format(new Date(e.data_fim_planejada), 'dd/MM')}
                              </td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => {
                                    setEtapaSelecionada(e);
                                    setShowEtapaDetalhes(true);
                                  }}
                                >
                                  ✎ Editar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="orcamentos" title={`Orçamentos (${orcamentos.length})`}>
                <Card className="shadow-sm">
                  <Card.Header>
                    <Button variant="success" size="sm" onClick={() => setShowOrcamento(true)}>
                      <i className="bi bi-plus"></i> Novo Orçamento
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {orcamentos.length === 0 ? (
                      <p className="text-muted">Nenhum orçamento</p>
                    ) : (
                      <Table hover responsive size="sm">
                        <thead className="table-light">
                          <tr>
                            <th>Descrição</th>
                            <th>Prestador</th>
                            <th>Valor Est.</th>
                            <th>Valor Real</th>
                            <th>Status</th>
                            <th>Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orcamentos.map((o) => (
                            <tr key={o.id}>
                              <td>{o.descricao}</td>
                              <td><small>{o.prestador_nome}</small></td>
                              <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.valor_estimado || 0)}</td>
                              <td>{o.valor_real ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.valor_real) : '-'}</td>
                              <td><Badge bg={o.status === 'Aprovado' ? 'success' : 'warning'}>{o.status}</Badge></td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => {
                                    setOrcamentoSelecionado(o);
                                    setShowOrcamentoDetalhes(true);
                                  }}
                                >
                                  ✎ Editar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="materiais" title={`Materiais (${materiais.length})`}>
                <Card className="shadow-sm">
                  <Card.Header>
                    <Button variant="success" size="sm" onClick={() => setShowMaterial(true)}>
                      <i className="bi bi-plus"></i> Adicionar Material
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {materiais.length === 0 ? (
                      <p className="text-muted">Nenhum material adicionado</p>
                    ) : (
                      <Table hover responsive size="sm">
                        <thead className="table-light">
                          <tr>
                            <th>Material</th>
                            <th>Qty</th>
                            <th>V. Unit.</th>
                            <th>V. Total</th>
                            <th>Fornecedor</th>
                            <th>Status</th>
                            <th>Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materiais.map((m) => (
                            <tr key={m.id}>
                              <td>{m.nome_material}</td>
                              <td>{m.quantidade} {m.unidade}</td>
                              <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.valor_unitario || 0)}</td>
                              <td><strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.valor_total || 0)}</strong></td>
                              <td><small>{m.fornecedor_nome}</small></td>
                              <td><Badge bg={m.status === 'Entregue' ? 'success' : 'warning'}>{m.status}</Badge></td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => {
                                    setMaterialSelecionado(m);
                                    setShowMaterialDetalhes(true);
                                  }}
                                >
                                  ✎ Editar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="checklists" title={`Checklists (${checklists.length})`}>
                <Card className="shadow-sm">
                  <Card.Header>
                    <Button variant="success" size="sm" onClick={() => setShowChecklist(true)}>
                      <i className="bi bi-plus"></i> Novo Checklist
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <ChecklistManager
                      projetoId={projetoSelecionado?.id}
                      etapaId={null}
                      checklists={checklists}
                      onUpdate={() => fetchProjectDetails(projetoSelecionado.id)}
                    />
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="comentarios" title={`Comentários (${comentarios.length})`}>
                <Card className="shadow-sm">
                  <Card.Header>
                    <Button variant="success" size="sm" onClick={() => setShowComentario(true)}>
                      <i className="bi bi-chat-left-quote"></i> Adicionar Comentário
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {comentarios.length === 0 ? (
                      <p className="text-muted">Nenhum comentário</p>
                    ) : (
                      comentarios.map((c) => (
                        <div key={c.id} className="mb-3 p-3 border-left-4">
                          <div className="d-flex justify-content-between">
                            <strong>{c.usuario_nome}</strong>
                            <small className="text-muted">
                              {format(new Date(c.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </small>
                          </div>
                          <p className="mb-1 mt-2">{c.conteudo}</p>
                          <Badge bg="info">{c.tipo}</Badge>
                        </div>
                      ))
                    )}
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          ) : (
            <Card className="shadow-sm text-center">
              <Card.Body className="py-5">
                <p className="text-muted">Selecione um projeto para visualizar os detalhes</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <ModalProjeto
        show={showProject}
        onHide={() => {
          setShowProject(false);
          setProjectData(emptyProject);
        }}
        data={projectData}
        setData={setProjectData}
        onSave={handleSaveProject}
        unidades={unidades}
      />

      <ModalEtapa
        show={showEtapa}
        onHide={() => setShowEtapa(false)}
        projetoId={projetoSelecionado?.id}
        onSave={() => {
          setShowEtapa(false);
          fetchProjectDetails(projetoSelecionado.id);
        }}
      />

      <ModalOrcamento
        show={showOrcamento}
        onHide={() => setShowOrcamento(false)}
        projetoId={projetoSelecionado?.id}
        onSave={() => {
          setShowOrcamento(false);
          fetchProjectDetails(projetoSelecionado.id);
        }}
      />

      <ModalMaterial
        show={showMaterial}
        onHide={() => setShowMaterial(false)}
        projetoId={projetoSelecionado?.id}
        onSave={() => {
          setShowMaterial(false);
          fetchProjectDetails(projetoSelecionado.id);
        }}
      />

      <ModalChecklist
        show={showChecklist}
        onHide={() => setShowChecklist(false)}
        projetoId={projetoSelecionado?.id}
        onSave={() => {
          setShowChecklist(false);
          fetchProjectDetails(projetoSelecionado.id);
        }}
      />

      <ModalComentario
        show={showComentario}
        onHide={() => setShowComentario(false)}
        projetoId={projetoSelecionado?.id}
        onSave={() => {
          setShowComentario(false);
          fetchProjectDetails(projetoSelecionado.id);
        }}
      />

      {/* Modals de Edição/Detalhes */}
      <ModalEtapaDetalhes
        show={showEtapaDetalhes}
        onHide={() => setShowEtapaDetalhes(false)}
        etapa={etapaSelecionada}
        projetoId={projetoSelecionado?.id}
        onUpdate={() => fetchProjectDetails(projetoSelecionado.id)}
      />

      <ModalOrcamentoDetalhes
        show={showOrcamentoDetalhes}
        onHide={() => setShowOrcamentoDetalhes(false)}
        orcamento={orcamentoSelecionado}
        onUpdate={() => fetchProjectDetails(projetoSelecionado.id)}
      />

      <ModalMaterialDetalhes
        show={showMaterialDetalhes}
        onHide={() => setShowMaterialDetalhes(false)}
        material={materialSelecionado}
        onUpdate={() => fetchProjectDetails(projetoSelecionado.id)}
      />

    </Card.Body>
    </Card>
    
    </Container>
  );
}
