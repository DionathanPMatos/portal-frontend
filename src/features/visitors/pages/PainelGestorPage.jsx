import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Offcanvas, InputGroup } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaHourglassHalf, FaFilter, FaSearch, FaClipboardList } from 'react-icons/fa';
import apiClient from '../../../services/api'; // Importa a instância configurada do Axios

export default function PainelGestorPage() {
    const [visitas, setVisitas] = useState([]);
    const [feedbackAtual, setFeedbackAtual] = useState(null);

    // Filtros
    const [showFilterSidebar, setShowFilterSidebar] = useState(false);
    const [filterSearch, setFilterSearch] = useState('');
    const [filterVendedor, setFilterVendedor] = useState('');
    const [filterCidade, setFilterCidade] = useState('');
    const [filterUf, setFilterUf] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos'); // todos, scheduled, completed
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        carregarVisitas();
    }, []);

    const carregarVisitas = async () => {
        try {
            const { data } = await apiClient.get('/api/visitas');
            setVisitas(data);
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusBadge = (v) => {
        if (v.feedback_vendedor) {
            return <Badge bg="success" className="px-2 py-1"><FaCheckCircle className="me-1" /> Realizada</Badge>;
        }
        if (v.status_autorizacao === 'Recusada') {
            return <Badge bg="danger" className="px-2 py-1">Recusada</Badge>;
        }
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataVisita = new Date(v.data_visita);
        if (dataVisita >= hoje) {
            return <Badge bg="primary" className="px-2 py-1"><FaCalendarAlt className="me-1" /> Agendada</Badge>;
        }
        return <Badge bg="warning" text="dark" className="px-2 py-1"><FaHourglassHalf className="me-1" /> Pendente Feedback</Badge>;
    };

    // Filtros aplicados em memória
    const filteredVisitas = visitas.filter(v => {
        if (filterSearch && 
            !v.nome_cliente.toLowerCase().includes(filterSearch.toLowerCase()) && 
            !v.justificativa_objetivo.toLowerCase().includes(filterSearch.toLowerCase())) {
            return false;
        }
        if (filterVendedor && !v.vendedor_nome.toLowerCase().includes(filterVendedor.toLowerCase())) {
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

    const UFS = [
        "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
        "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Gestão de Visitas da Equipe</h5>
                <Button variant="outline-secondary" className="d-flex align-items-center gap-1" onClick={() => setShowFilterSidebar(true)}>
                    <FaFilter size={14} /> Filtrar
                </Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3">Vendedor</th>
                                <th className="py-3">Cliente</th>
                                <th className="py-3">Localidade</th>
                                <th className="py-3">Data</th>
                                <th className="py-3">Objetivo</th>
                                <th className="py-3">Status</th>
                                <th className="px-4 py-3 text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVisitas.map(v => (
                                <tr key={v.id}>
                                    <td className="px-4 py-3 fw-semibold text-dark">{v.vendedor_nome}</td>
                                    <td className="py-3 fw-bold text-secondary">{v.nome_cliente}</td>
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
                                    <td className="py-3 text-secondary">
                                        {new Date(v.data_visita).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </td>
                                    <td className="py-3 text-secondary" style={{ maxWidth: '200px' }}>
                                        <div className="text-truncate" title={v.justificativa_objetivo}>
                                            {v.justificativa_objetivo}
                                        </div>
                                    </td>
                                    <td className="py-3">{getStatusBadge(v)}</td>
                                    <td className="px-4 py-3 text-end">
                                        {v.feedback_vendedor ? (
                                            <Button size="sm" variant="outline-info" onClick={() => setFeedbackAtual(v.feedback_vendedor)}>
                                                Ler Feedback
                                            </Button>
                                        ) : (
                                            <span className="text-muted small">Sem feedback</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredVisitas.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        Nenhuma visita encontrada para os filtros atuais.
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
                            <Form.Label className="fw-semibold">Vendedor</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Filtrar por vendedor..." 
                                value={filterVendedor} 
                                onChange={e => setFilterVendedor(e.target.value)} 
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
                                    setFilterVendedor('');
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

            {/* Modal para visualizar feedback */}
            <Modal show={!!feedbackAtual} onHide={() => setFeedbackAtual(null)}>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Feedback do Vendedor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ whiteSpace: 'pre-wrap' }} className="text-secondary">{feedbackAtual}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setFeedbackAtual(null)}>Fechar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}