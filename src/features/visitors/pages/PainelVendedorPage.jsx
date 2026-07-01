import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Modal, Badge, InputGroup, ListGroup, Offcanvas, Row, Col } from 'react-bootstrap';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaSearch, 
  FaUserPlus, 
  FaFilter, 
  FaPlus, 
  FaCheckCircle, 
  FaHourglassHalf,
  FaTimes,
  FaClipboardList
} from 'react-icons/fa';
import apiClient from '../../../services/api'; // Importa a instância configurada do Axios
import ClienteFormModal from '../../commercial/pages/Clients/ClienteFormModal';

export default function PainelVendedorPage() {
    const [visitas, setVisitas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    
    // Dados da visita
    const [novaVisita, setNovaVisita] = useState({ cliente_id: '', data_visita: '', justificativa_objetivo: '' });
    const [feedbackVisita, setFeedbackVisita] = useState({ id: null, feedback: '', requerRetorno: false, dataRetorno: '' });

    // Pesquisa de clientes para o modal
    const [clienteSearch, setClienteSearch] = useState('');
    const [clienteResults, setClienteResults] = useState([]);
    const [showClienteDropdown, setShowClienteDropdown] = useState(false);
    const [clienteSelecionadoNome, setClienteSelecionadoNome] = useState('');

    // Modal de novo cliente
    const [showNewClienteModal, setShowNewClienteModal] = useState(false);

    // Filtros do Offcanvas
    const [showFilterSidebar, setShowFilterSidebar] = useState(false);
    const [filterSearch, setFilterSearch] = useState('');
    const [filterUf, setFilterUf] = useState('');
    const [filterCidade, setFilterCidade] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos'); // todos, scheduled, completed
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        carregarVisitas();
    }, []);

    // Busca de clientes assíncrona
    useEffect(() => {
        if (clienteSearch.length >= 2) {
            const fetchClientes = async () => {
                try {
                    const res = await apiClient.get(`/api/clientes?search=${encodeURIComponent(clienteSearch)}&limit=10`);
                    setClienteResults(res.data?.data || []);
                    setShowClienteDropdown(true);
                } catch (err) {
                    console.error(err);
                }
            };
            const delay = setTimeout(fetchClientes, 400);
            return () => clearTimeout(delay);
        } else {
            setClienteResults([]);
            setShowClienteDropdown(false);
        }
    }, [clienteSearch]);

    const carregarVisitas = async () => {
        try {
            const { data } = await apiClient.get('/api/visitas');
            setVisitas(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAgendarVisita = async (e) => {
        e.preventDefault();
        if (!novaVisita.cliente_id) {
            alert('Por favor, selecione um cliente.');
            return;
        }
        try {
            await apiClient.post('/api/visitas', novaVisita);
            setShowModal(false);
            setNovaVisita({ cliente_id: '', data_visita: '', justificativa_objetivo: '' });
            setClienteSearch('');
            setClienteSelecionadoNome('');
            carregarVisitas();
        } catch (error) {
            console.error(error);
            alert('Erro ao agendar visita.');
        }
    };

    const handleSalvarFeedback = async (e) => {
        e.preventDefault();
        try {
            await apiClient.patch(`/api/visitas/${feedbackVisita.id}/feedback`, {
                feedback_vendedor: feedbackVisita.feedback,
                requer_retorno: feedbackVisita.requerRetorno,
                data_retorno: feedbackVisita.dataRetorno
            });
            setShowFeedbackModal(false);
            setFeedbackVisita({ id: null, feedback: '', requerRetorno: false, dataRetorno: '' });
            carregarVisitas();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar feedback.');
        }
    };

    const handleClienteSalvo = (savedClient) => {
        if (savedClient?.id) {
            setNovaVisita(prev => ({ ...prev, cliente_id: savedClient.id }));
            setClienteSelecionadoNome(savedClient.nome_cliente || 'Cliente Novo');
            setShowNewClienteModal(false);
            setClienteSearch('');
        }
    };

    // Filtros aplicados em memória
    const filteredVisitas = visitas.filter(v => {
        if (filterSearch && 
            !v.nome_cliente.toLowerCase().includes(filterSearch.toLowerCase()) && 
            !v.justificativa_objetivo.toLowerCase().includes(filterSearch.toLowerCase())) {
            return false;
        }
        if (filterUf && v.cliente_uf !== filterUf) {
            return false;
        }
        if (filterCidade && (!v.cliente_cidade || !v.cliente_cidade.toLowerCase().includes(filterCidade.toLowerCase()))) {
            return false;
        }
        if (filterStatus === 'scheduled' && v.feedback_vendedor) {
            return false;
        }
        if (filterStatus === 'completed' && !v.feedback_vendedor) {
            return false;
        }
        if (filterStartDate) {
            const sd = new Date(filterStartDate);
            sd.setHours(0,0,0,0);
            if (new Date(v.data_visita) < sd) return false;
        }
        if (filterEndDate) {
            const ed = new Date(filterEndDate);
            ed.setHours(23,59,59,999);
            if (new Date(v.data_visita) > ed) return false;
        }
        return true;
    });

    const getStatusBadge = (v) => {
        if (v.feedback_vendedor) {
            return <Badge bg="success" className="px-2 py-1"><FaCheckCircle className="me-1" /> Realizada</Badge>;
        }
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataVisita = new Date(v.data_visita);
        if (dataVisita >= hoje) {
            return <Badge bg="primary" className="px-2 py-1"><FaCalendarAlt className="me-1" /> Agendada</Badge>;
        }
        return <Badge bg="warning" text="dark" className="px-2 py-1"><FaHourglassHalf className="me-1" /> Pendente Feedback</Badge>;
    };

    // Extrair os próximos 4 agendamentos (data >= hoje e sem feedback)
    const hojeParaAgendamentos = new Date();
    hojeParaAgendamentos.setHours(0, 0, 0, 0);
    const proximosAgendamentos = visitas
        .filter(v => !v.feedback_vendedor && new Date(v.data_visita) >= hojeParaAgendamentos)
        .sort((a, b) => new Date(a.data_visita) - new Date(b.data_visita))
        .slice(0, 4);

    const UFS = [
        "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
        "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
    ];

    return (
        <div>
            {/* Próximos Agendamentos */}
            <div className="mb-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                    <FaCalendarAlt className="text-primary" /> Próximos Agendamentos
                </h5>
                <Row className="g-3">
                    {proximosAgendamentos.map(v => (
                        <Col key={v.id} md={3}>
                            <Card className="h-100 border-0 shadow-sm card-hover-effect" style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                borderTop: '4px solid #0d6efd'
                            }}>
                                <Card.Body className="d-flex flex-column justify-content-between p-3">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="text-primary fw-bold small">
                                                {new Date(v.data_visita).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </span>
                                            <Badge bg="primary" size="sm">Agendada</Badge>
                                        </div>
                                        <h6 className="fw-bold text-dark mb-1 text-truncate" title={v.nome_cliente}>
                                            {v.nome_cliente}
                                        </h6>
                                        <p className="text-muted small mb-2 d-flex align-items-center gap-1">
                                            <FaMapMarkerAlt className="text-danger" size={12} />
                                            {v.cliente_cidade && v.cliente_uf ? `${v.cliente_cidade}/${v.cliente_uf}` : 'Sem localidade'}
                                        </p>
                                        <p className="text-secondary small mb-3 text-truncate-2" title={v.justificativa_objetivo}>
                                            {v.justificativa_objetivo}
                                        </p>
                                    </div>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                        className="w-100 mt-auto d-flex align-items-center justify-content-center gap-1"
                                        onClick={() => { 
                                            setFeedbackVisita({ id: v.id, feedback: '', requerRetorno: false, dataRetorno: '' }); 
                                            setShowFeedbackModal(true); 
                                        }}
                                    >
                                        <FaClipboardList size={12} /> Registrar Visita
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                    {proximosAgendamentos.length === 0 && (
                        <Col md={12}>
                            <Card className="border-0 shadow-sm bg-light">
                                <Card.Body className="text-center py-4 text-muted">
                                    Nenhum agendamento futuro pendente. Agende novas visitas abaixo.
                                </Card.Body>
                            </Card>
                        </Col>
                    )}
                </Row>
            </div>

            {/* Controle da Lista */}
            <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                <h5 className="fw-bold text-dark mb-0">Todas as Visitas</h5>
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" className="d-flex align-items-center gap-1" onClick={() => setShowFilterSidebar(true)}>
                        <FaFilter size={14} /> Filtrar
                    </Button>
                    <Button variant="primary" className="d-flex align-items-center gap-1" onClick={() => setShowModal(true)}>
                        <FaPlus size={12} /> Novo Agendamento
                    </Button>
                </div>
            </div>

            {/* Tabela de Visitas */}
            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3">Data</th>
                                <th className="py-3">Cliente</th>
                                <th className="py-3">Localidade</th>
                                <th className="py-3">Objetivo</th>
                                <th className="py-3">Status</th>
                                <th className="py-3">Retorno Previsto</th>
                                <th className="px-4 py-3 text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVisitas.map(v => (
                                <tr key={v.id}>
                                    <td className="px-4 py-3 fw-semibold text-secondary">
                                        {new Date(v.data_visita).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </td>
                                    <td className="py-3 fw-bold text-dark">{v.nome_cliente}</td>
                                    <td className="py-3 text-secondary">
                                        {v.cliente_cidade && v.cliente_uf ? (
                                            <span className="d-inline-flex align-items-center gap-1">
                                                <FaMapMarkerAlt className="text-muted" size={12} />
                                                {v.cliente_cidade}/{v.cliente_uf}
                                            </span>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </td>
                                    <td className="py-3 text-secondary" style={{ maxWidth: '250px' }}>
                                        <div className="text-truncate" title={v.justificativa_objetivo}>
                                            {v.justificativa_objetivo}
                                        </div>
                                    </td>
                                    <td className="py-3">{getStatusBadge(v)}</td>
                                    <td className="py-3 text-secondary">
                                        {v.data_retorno ? new Date(v.data_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : (v.feedback_vendedor && !v.requer_retorno ? 'Não' : '-')}
                                    </td>
                                    <td className="px-4 py-3 text-end">
                                        {!v.feedback_vendedor && (
                                            <Button size="sm" variant="outline-info" onClick={() => { setFeedbackVisita({ id: v.id, feedback: '', requerRetorno: false, dataRetorno: '' }); setShowFeedbackModal(true); }}>
                                                Registrar Visita
                                            </Button>
                                        )}
                                        {v.feedback_vendedor && <Badge bg="secondary" className="px-2 py-1">Concluída</Badge>}
                                    </td>
                                </tr>
                            ))}
                            {filteredVisitas.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        Nenhuma visita cadastrada ou encontrada com os filtros atuais.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Offcanvas Filtros */}
            <Offcanvas show={showFilterSidebar} onHide={() => setShowFilterSidebar(false)} placement="end">
                <Offcanvas.Header closeButton className="bg-light">
                    <Offcanvas.Title className="fw-bold text-primary d-flex align-items-center gap-2">
                        <FaFilter /> Filtros Avançados
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className="d-flex flex-column gap-3">
                        <Form.Group>
                            <Form.Label className="fw-semibold">Buscar por Cliente/Objetivo</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Digite para buscar..." 
                                value={filterSearch} 
                                onChange={e => setFilterSearch(e.target.value)} 
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="fw-semibold">Cidade</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Filtrar por cidade..." 
                                value={filterCidade} 
                                onChange={e => setFilterCidade(e.target.value)} 
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="fw-semibold">Estado (UF)</Form.Label>
                            <Form.Select value={filterUf} onChange={e => setFilterUf(e.target.value)}>
                                <option value="">Todos os Estados</option>
                                {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="fw-semibold">Status</Form.Label>
                            <Form.Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="todos">Todos</option>
                                <option value="scheduled">Agendadas</option>
                                <option value="completed">Realizadas</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="fw-semibold">Período (De)</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={filterStartDate} 
                                onChange={e => setFilterStartDate(e.target.value)} 
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="fw-semibold">Período (Até)</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={filterEndDate} 
                                onChange={e => setFilterEndDate(e.target.value)} 
                            />
                        </Form.Group>

                        <hr />

                        <div className="d-flex gap-2">
                            <Button 
                                variant="outline-secondary" 
                                className="w-100" 
                                onClick={() => {
                                    setFilterSearch('');
                                    setFilterCidade('');
                                    setFilterUf('');
                                    setFilterStatus('todos');
                                    setFilterStartDate('');
                                    setFilterEndDate('');
                                }}
                            >
                                Limpar Filtros
                            </Button>
                            <Button variant="primary" className="w-100" onClick={() => setShowFilterSidebar(false)}>
                                Aplicar
                            </Button>
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Modal Agendar Visita */}
            <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" dialogClassName="modal-lg">
                <Form onSubmit={handleAgendarVisita}>
                    <Modal.Header closeButton>
                        <Modal.Title className="fw-bold">Agendar Nova Visita</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3" style={{ position: 'relative' }}>
                            <Form.Label className="fw-semibold">Cliente</Form.Label>
                            {novaVisita.cliente_id ? (
                                <div className="d-flex align-items-center gap-2 bg-light p-2 rounded border">
                                    <span className="fw-bold text-dark flex-grow-1">{clienteSelecionadoNome}</span>
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        className="d-flex align-items-center justify-content-center p-1"
                                        onClick={() => {
                                            setNovaVisita(prev => ({ ...prev, cliente_id: '' }));
                                            setClienteSelecionadoNome('');
                                            setClienteSearch('');
                                        }}
                                    >
                                        <FaTimes size={12} />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            placeholder="Buscar por nome, CNPJ..."
                                            value={clienteSearch}
                                            onChange={(e) => setClienteSearch(e.target.value)}
                                            onFocus={() => {
                                                if (clienteSearch.length >= 2) setShowClienteDropdown(true);
                                            }}
                                            onBlur={() => setTimeout(() => setShowClienteDropdown(false), 200)}
                                        />
                                        <Button
                                            variant="outline-success"
                                            onClick={() => setShowNewClienteModal(true)}
                                            title="Cadastrar Novo Cliente"
                                            className="d-flex align-items-center gap-1"
                                        >
                                            <FaUserPlus /> + Novo
                                        </Button>
                                    </InputGroup>
                                    {showClienteDropdown && (
                                        <ListGroup style={{
                                            position: 'absolute',
                                            zIndex: 1050,
                                            width: '100%',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                                        }}>
                                            {clienteResults.length > 0 ? (
                                                clienteResults.map(c => (
                                                    <ListGroup.Item
                                                        action
                                                        key={c.id}
                                                        onMouseDown={() => {
                                                            setNovaVisita(prev => ({ ...prev, cliente_id: c.id }));
                                                            setClienteSelecionadoNome(c.nome_cliente);
                                                            setShowClienteDropdown(false);
                                                        }}
                                                        className="d-flex justify-content-between align-items-center"
                                                    >
                                                        <span>{c.nome_cliente}</span>
                                                        <small className="text-muted">
                                                            {c.cnpj_cpf ? `CNPJ/CPF: ${c.cnpj_cpf}` : ''}
                                                            {c.cidade && c.uf ? ` • ${c.cidade}/${c.uf}` : ''}
                                                        </small>
                                                    </ListGroup.Item>
                                                ))
                                            ) : (
                                                <ListGroup.Item className="text-muted">
                                                    Nenhum cliente encontrado.
                                                </ListGroup.Item>
                                            )}
                                        </ListGroup>
                                    )}
                                </>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Data da Visita</Form.Label>
                            <Form.Control type="date" required value={novaVisita.data_visita} onChange={(e) => setNovaVisita({ ...novaVisita, data_visita: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Objetivo da Visita</Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="Justifique o objetivo da visita..." required value={novaVisita.justificativa_objetivo} onChange={(e) => setNovaVisita({ ...novaVisita, justificativa_objetivo: e.target.value })} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {
                            setShowModal(false);
                            setNovaVisita({ cliente_id: '', data_visita: '', justificativa_objetivo: '' });
                            setClienteSearch('');
                            setClienteSelecionadoNome('');
                        }}>Cancelar</Button>
                        <Button variant="primary" type="submit">Agendar Visita</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Registro de Visita (Feedback) */}
            <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)} backdrop="static">
                <Form onSubmit={handleSalvarFeedback}>
                    <Modal.Header closeButton>
                        <Modal.Title className="fw-bold">Relatório e Feedback da Visita</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Feedback/Relato da Visita</Form.Label>
                            <Form.Control as="textarea" rows={4} placeholder="O que foi conversado ou definido nesta visita?" required value={feedbackVisita.feedback} onChange={(e) => setFeedbackVisita({ ...feedbackVisita, feedback: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check 
                                type="switch"
                                id="switch-retorno"
                                label="É necessário agendar um retorno neste cliente?"
                                checked={feedbackVisita.requerRetorno}
                                onChange={(e) => setFeedbackVisita({ ...feedbackVisita, requerRetorno: e.target.checked })}
                                className="fw-semibold"
                            />
                        </Form.Group>
                        {feedbackVisita.requerRetorno && (
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Data Sugerida para Retorno</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    required={feedbackVisita.requerRetorno}
                                    value={feedbackVisita.dataRetorno} 
                                    onChange={(e) => setFeedbackVisita({ ...feedbackVisita, dataRetorno: e.target.value })} 
                                />
                            </Form.Group>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit">Salvar Relatório</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Cadastro Rápido de Cliente */}
            <ClienteFormModal
                show={showNewClienteModal}
                onHide={() => setShowNewClienteModal(false)}
                onSaved={handleClienteSalvo}
            />
        </div>
    );
}