import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import Select from 'react-select';
import apiClient from '../../../services/api';

const BookingFormModal = ({ show, onHide, onSuccess, initialData }) => {
    const [formData, setFormData] = useState({
        titulo: '',
        nome_cliente: '',
        local_id: '',
        data_inicio_visita: '',
        data_fim_visita: '',
        visitantes: '',
        observacoes: '',
        filial_id: '',
        interesses: [],
        participantes: [],
    });
    const [filiais, setFiliais] = useState([]);
    const [interesses, setInteresses] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [categoriasReserva, setCategoriasReserva] = useState([]);
    const [approvedEvents, setApprovedEvents] = useState([]);
    const [conflict, setConflict] = useState(null);
    const [justificativaConflito, setJustificativaConflito] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show) {
            // Função para formatar a data para o input datetime-local
            const formatForInput = (date) => {
                if (!date) return '';
                const d = new Date(date);
                // Previne erro com datas inválidas
                if (isNaN(d.getTime())) return '';
                const year = d.getFullYear();
                const month = (`0${d.getMonth() + 1}`).slice(-2);
                const day = (`0${d.getDate()}`).slice(-2);
                const hours = (`0${d.getHours()}`).slice(-2);
                const minutes = (`0${d.getMinutes()}`).slice(-2);
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };
            const fetchData = async () => {
                try {
                    const [locaisRes, filiaisRes, interessesRes, funcionariosRes, categoriasRes, approvedEventsRes] = await Promise.all([
                        apiClient.get('/api/marketing/locais'), // Locais de reserva
                        apiClient.get('/api/marketing/unidades'), // Filiais/Unidades
                        apiClient.get('/api/marketing/interesses'), // Novas áreas de interesse
                        apiClient.get('/api/funcionarios'), // Para a lista de participantes
                        apiClient.get('/api/marketing/reservas/categorias'), // Novas categorias de reserva
                        apiClient.get('/api/marketing/reservas/calendario') // Eventos aprovados para checagem de conflito
                    ]);

                    const locaisData = locaisRes.data;
                    if (locaisData && locaisData.length > 0) {
                        // Define o ID do primeiro e único local de reserva disponível
                        setFormData(prev => ({ ...prev, local_id: locaisData[0].id }));
                    } else {
                        // Se não houver locais, impede o envio e mostra um erro
                        setError('Nenhum local de reserva foi configurado. Por favor, contate um administrador.');
                    }

                    setFiliais(filiaisRes.data);
                    setInteresses(interessesRes.data);
                    setFuncionarios(funcionariosRes.data);
                    setCategoriasReserva(categoriasRes.data);
                    setApprovedEvents(approvedEventsRes.data);
                } catch (err) {
                    console.error(err);
                    setError('Falha ao carregar dados para o formulário.');
                }
            };
            fetchData();

            // Se houver dados iniciais (do clique no calendário), aplica-os
            if (initialData) {
                setFormData(prev => ({
                    ...prev,
                    data_inicio_visita: formatForInput(initialData.data_inicio_visita),
                    data_fim_visita: formatForInput(initialData.data_fim_visita),
                }));
            }
        }
    }, [show, initialData]);

    // Efeito para detectar conflitos de horário
    useEffect(() => {
        if (!formData.data_inicio_visita || !formData.data_fim_visita || approvedEvents.length === 0) {
            setConflict(null);
            return;
        }

        const newStart = new Date(formData.data_inicio_visita);
        const newEnd = new Date(formData.data_fim_visita);

        if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) return;

        const conflictingEvent = approvedEvents.find(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            return (newStart < eventEnd) && (newEnd > eventStart);
        });

        if (conflictingEvent) {
            setConflict(conflictingEvent);
        } else {
            setConflict(null);
            setJustificativaConflito(''); // Limpa a justificativa se não houver mais conflito
        }
    }, [formData.data_inicio_visita, formData.data_fim_visita, approvedEvents]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e) => {
        const { name, value, checked } = e.target;
        const id = parseInt(value);
        setFormData(prev => {
            const currentValues = prev[name] || [];
            if (checked) {
                // Adiciona o ID se não estiver presente
                return { ...prev, [name]: [...currentValues, id] };
            } else {
                // Remove o ID
                return { ...prev, [name]: currentValues.filter(item => item !== id) };
            }
        });
    };

    const handleParticipantesChange = (selectedOptions) => {
        const participanteIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setFormData(prev => ({ ...prev, participantes: participanteIds }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validação simples
        if (new Date(formData.data_fim_visita) <= new Date(formData.data_inicio_visita)) {
            setError('A data final deve ser posterior à data inicial.');
            setLoading(false);
            return;
        }

        // Validação para garantir que um local foi definido
        if (!formData.local_id) {
            setError('Nenhum local de reserva configurado. Contate o administrador.');
            setLoading(false);
            return;
        }

        // Validação da justificativa em caso de conflito
        if (conflict && !justificativaConflito.trim()) {
            setError('É necessário fornecer uma justificativa para solicitar um horário em conflito.');
            setLoading(false);
            return;
        }

        try {
            // Adiciona a justificativa às observações se houver um conflito
            const finalObservacoes = conflict
                ? `[JUSTIFICATIVA DE CONFLITO]: ${justificativaConflito}\n\n${formData.observacoes || ''}`
                : formData.observacoes;

            // Garante que os campos de múltipla seleção sejam arrays
            const payload = {
                ...formData,
                observacoes: finalObservacoes,
                interesses: formData.interesses || [],
                participantes: formData.participantes || [],
            };
            await apiClient.post('/api/marketing/reservas', payload);
            onSuccess(); // Chama a função de sucesso do componente pai
            handleClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Ocorreu um erro ao criar a reserva.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            titulo: '', nome_cliente: '', local_id: '',
            data_inicio_visita: '', data_fim_visita: '', visitantes: '', observacoes: '', filial_id: '',
            interesses: [], participantes: []
        });
        setError(null);
        setConflict(null);
        setJustificativaConflito('');
        onHide();
    };

    // Formata as opções para o react-select
    const funcionarioOptions = funcionarios.map(f => ({
        value: f.id,
        label: f.nome_completo
    }));

    // Filtra as opções selecionadas para passar como valor para o react-select
    const selectedParticipantes = funcionarioOptions.filter(option => formData.participantes.includes(option.value));

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Solicitar Reserva de Sala/Showroom</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <h5 className="fw-bold text-primary">Informações Gerais</h5>
                    <hr className="mt-1 mb-3" />
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Categoria do Compromisso</Form.Label>
                                <Form.Select name="titulo" value={formData.titulo} onChange={handleChange} required>
                                    <option value="">Selecione uma categoria...</option>
                                    {categoriasReserva.map(cat => <option key={cat.id} value={cat.nome}>{cat.nome}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Nome do Cliente</Form.Label>
                                <Form.Control type="text" name="nome_cliente" value={formData.nome_cliente} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Filial Solicitante</Form.Label>
                                <Form.Select name="filial_id" value={formData.filial_id} onChange={handleChange}>
                                    <option value="">Selecione a filial...</option>
                                    {filiais.map(f => <option key={f.id} value={f.id}>{f.nome_unidade}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <h5 className="fw-bold text-primary mt-4">Período da Reserva</h5>
                    <hr className="mt-1 mb-3" />
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Início da Visita</Form.Label>
                                <Form.Control type="datetime-local" name="data_inicio_visita" value={formData.data_inicio_visita} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Fim da Visita</Form.Label>
                                <Form.Control type="datetime-local" name="data_fim_visita" value={formData.data_fim_visita} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                    </Row>
                    
                     {/* Alerta de Conflito */}
                    {conflict && (
                        <Alert variant="warning">
                            <strong>Atenção:</strong> O período selecionado conflita com a reserva existente: <strong>"{conflict.title}"</strong>.
                            <br />
                            Para prosseguir, por favor, forneça uma justificativa abaixo. Sua solicitação será enviada para análise.
                        </Alert>
                    )}

                    {/* Campo de Justificativa (condicional) */}
                    {conflict && (
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-danger">Justificativa para Conflito</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        required
                                        value={justificativaConflito}
                                        onChange={e => setJustificativaConflito(e.target.value)}
                                        placeholder="Descreva por que é necessário agendar neste horário específico, mesmo com a sobreposição."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                    
                    <h5 className="fw-bold text-primary mt-4">Detalhes da Visita</h5>
                    <hr className="mt-1 mb-3" />
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Áreas de Interesse do Cliente</Form.Label>
                                <div className="p-3 border rounded bg-light">
                                    <div className="d-flex flex-wrap gap-3">
                                        {interesses.map(interesse => (
                                            <Form.Check
                                                key={interesse.id} type="checkbox" id={`interesse-${interesse.id}`}
                                                name="interesses" label={interesse.nome} value={interesse.id}
                                                checked={formData.interesses.includes(interesse.id)}
                                                onChange={handleMultiSelectChange}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Nomes dos Visitantes (separados por vírgula)</Form.Label>
                                <Form.Control as="textarea" rows={2} name="visitantes" value={formData.visitantes} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Outros Participantes (Colaboradores Internos)</Form.Label>
                                <Select
                                    isMulti
                                    name="participantes"
                                    options={funcionarioOptions}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    placeholder="Pesquise e adicione participantes..."
                                    onChange={handleParticipantesChange}
                                    value={selectedParticipantes}
                                    noOptionsMessage={() => 'Nenhum colaborador encontrado'}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Observações Adicionais</Form.Label>
                                <Form.Control as="textarea" rows={2} name="observacoes" value={formData.observacoes} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Enviar Solicitação'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default BookingFormModal;
