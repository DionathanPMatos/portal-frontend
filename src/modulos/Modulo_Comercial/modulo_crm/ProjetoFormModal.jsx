import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button, Form, Spinner, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';
import axios from 'axios';

// A lista de etapas foi mantida
// Lista completa de etapas selecionáveis no formulário
const ETAPAS_DO_FUNIL_COMPLETA = [
    'Prospeccao',
    'Dtc',
    'Poc',
    'Negociacao',
    'Aprovação',
    'Fechado',
    'Perdido',
    'Ganho' // Mantendo 'Ganho' por segurança
];

const TIPOS_PROJETO = ['Público', 'Privado'];

const ProjetoFormModal = ({ show, onHide, onSuccess, projetoParaEditar, defaultStage }) => {
    // 1. Estado inicial expandido para incluir os novos campos
    const initialState = {
        nome_projeto: '', cliente_id: '', vendedor_id: '', valor_estimado: '',
        data_fechamento_prevista: '', etapa_funil: defaultStage || ETAPAS_DO_FUNIL_COMPLETA[0],
        // --- NOVOS CAMPOS ---
        tipo_projeto: 'Privado',
        segmentacao_id: '',
        vertical_id: '',
        integrador_id: '',
        colaboradores_ids: [], // Para multi-seleção
        fabricantes_ids: [],   // Para multi-seleção
        numero_registro_fabricante: '',
    };

    const [formData, setFormData] = useState(initialState);

    const [temRegistro, setTemRegistro] = useState('Nao');

    // 2. Novos estados para armazenar as listas de opções
    const [clientes, setClientes] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [segmentacoes, setSegmentacoes] = useState([]);
    const [verticais, setVerticais] = useState([]);
    const [fabricantes, setFabricantes] = useState([]);
    const [integradores, setIntegradores] = useState([]);

    const [showNewSegInput, setShowNewSegInput] = useState(false);
    const [newSegText, setNewSegText] = useState('');
    const [showNewVertInput, setShowNewVertInput] = useState(false);
    const [newVertText, setNewVertText] = useState('');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const isEditMode = !!projetoParaEditar;

    // 3. useEffect atualizado para buscar todos os dados necessários em paralelo
    useEffect(() => {
        if (show) {
            setError(null);
            
            // Bloqueia a tela APENAS se os dados ainda não foram carregados na sessão
            if (clientes.length === 0) {
                setLoading(true);
            }

            const endpoints = [
                axios.get('/api/clientes'),
                axios.get('/api/vendedores'),
                axios.get('/api/funcionarios'),
                axios.get('/api/segmentacoes'),
                axios.get('/api/verticais'),
                axios.get('/api/fabricantes'),
                axios.get('/api/integradores')
            ];

            Promise.allSettled(endpoints)
                .then((results) => {
                    setClientes(results[0].status === 'fulfilled' ? results[0].value.data : []);
                    setVendedores(results[1].status === 'fulfilled' ? results[1].value.data : []);
                    setFuncionarios(results[2].status === 'fulfilled' ? results[2].value.data : []);
                    setSegmentacoes(results[3].status === 'fulfilled' ? results[3].value.data : []);
                    setVerticais(results[4].status === 'fulfilled' ? results[4].value.data : []);
                    setFabricantes(results[5].status === 'fulfilled' ? results[5].value.data : []);
                    setIntegradores(results[6].status === 'fulfilled' ? results[6].value.data : []);
                    
                    if (results.some(r => r.status === 'rejected')) {
                        console.warn("Aviso: Algumas listas de apoio não puderam ser carregadas do servidor.");
                    }
                })
                .catch(() => setError('Erro ao carregar dados de apoio.'))
                .finally(() => setLoading(false));

            if (isEditMode) {
                // Prepara os dados para edição, garantindo que os campos de array existam
                setFormData({
                    ...initialState, // Garante que todos os campos existam
                    ...projetoParaEditar,
                    colaboradores_ids: projetoParaEditar.colaboradores?.map(c => c.id) || [],
                    fabricantes_ids: projetoParaEditar.fabricantes?.map(f => f.id) || [],
                    data_fechamento_prevista: projetoParaEditar.data_fechamento_prevista ? projetoParaEditar.data_fechamento_prevista.split('T')[0] : '',
                    numero_registro_fabricante: projetoParaEditar.numero_registro_fabricante || '',

                });
            } else {
                setFormData({ ...initialState, etapa_funil: defaultStage || ETAPAS_DO_FUNIL_COMPLETA[0] });
            }
        }
    }, [show, projetoParaEditar, defaultStage]);

    // --- EFEITO PARA LIMPAR O CAMPO CASO O USUÁRIO MUDE PARA 'NÃO' ---
    useEffect(() => {
        if (temRegistro === 'Nao') {
            setFormData(prev => ({ ...prev, numero_registro_fabricante: '' }));
        }
    }, [temRegistro]);


    const handleAddNewSegmentacao = async () => {
        if (!newSegText.trim()) return;
        try {
            const res = await axios.post('/api/segmentacoes', { nome: newSegText.trim() });
            setSegmentacoes([...segmentacoes, res.data]);
            setFormData(prev => ({ ...prev, segmentacao_id: res.data.id }));
            setShowNewSegInput(false);
            setNewSegText('');
        } catch (err) { alert('Erro ao criar segmentação. Verifique se ela já existe.'); }
    };

    const handleAddNewVertical = async () => {
        if (!newVertText.trim()) return;
        try {
            const res = await axios.post('/api/verticais', { nome: newVertText.trim() });
            setVerticais([...verticais, res.data]);
            setFormData(prev => ({ ...prev, vertical_id: res.data.id }));
            setShowNewVertInput(false);
            setNewVertText('');
        } catch (err) { alert('Erro ao criar vertical. Verifique se ela já existe.'); }
    };

    // 4. HandleChange atualizado para lidar com campos de multi-seleção
    const handleChange = (e) => {
        const { name, value, options } = e.target;

        if (name === 'segmentacao_id' && value === 'CREATE_NEW') {
            setShowNewSegInput(true);
            setFormData(prev => ({ ...prev, segmentacao_id: '' }));
            return;
        }
        if (name === 'vertical_id' && value === 'CREATE_NEW') {
            setShowNewVertInput(true);
            setFormData(prev => ({ ...prev, vertical_id: '' }));
            return;
        }

        if (e.target.multiple) {
            const selectedValues = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);
            setFormData(prev => ({ ...prev, [name]: selectedValues }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            if (isEditMode) {
                await axios.put(`/api/projetos/${projetoParaEditar.id}`, formData);
            } else {
                await axios.post('/api/projetos', formData);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar o projeto.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        // Aumentei o tamanho do modal para 'lg' (large) para comportar os novos campos
    
        <Modal show={show} onHide={onHide} size="xl">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Editar Projeto' : 'Criar Novo Projeto'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {loading ? <div className="text-center"><Spinner /></div> : (
                        <>
                            {/* 5. Novos campos adicionados ao formulário */}
                            <Form.Group className="mb-3">
                                <Form.Label>Nome do Projeto</Form.Label>
                                <Form.Control type="text" name="nome_projeto" value={formData.nome_projeto || ''} onChange={handleChange} required />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cliente</Form.Label>
                                        <Form.Select name="cliente_id" value={formData.cliente_id || ''} onChange={handleChange} required>
                                            <option value="">Selecione...</option>
                                            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome_cliente}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Vendedor Responsável</Form.Label>
                                        <Form.Select name="vendedor_id" value={formData.vendedor_id || ''} onChange={handleChange} required>
                                            <option value="">Selecione...</option>
                                            {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome_completo}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Colaboradores</Form.Label>
                                <Form.Select name="colaboradores_ids" value={formData.colaboradores_ids} onChange={handleChange} multiple>
                                    {/* Idealmente, aqui viria uma biblioteca de multi-select mais amigável, mas o padrão já funciona */}
                                    {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome_completo}</option>)}
                                </Form.Select>
                            </Form.Group>

                            <hr />
                            {/* --- SEÇÃO DO REGISTRO DE PROJETO --- */}
                            <h5>Registro de Projeto (Fabricante)</h5>
                            <Form.Group as={Row} className="mb-3 align-items-center">
                                <Form.Label column sm={3}>Possui registro?</Form.Label>
                                <Col sm={9}>
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Sim"
                                        name="temRegistroRadio"
                                        id="temRegistroSim"
                                        checked={temRegistro === 'Sim'}
                                        onChange={() => setTemRegistro('Sim')}
                                    />
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Não"
                                        name="temRegistroRadio"
                                        id="temRegistroNao"
                                        checked={temRegistro === 'Nao'}
                                        onChange={() => setTemRegistro('Nao')}
                                    />
                                </Col>
                            </Form.Group>

                            {/* Campo de N° de Registro (aparece se 'Sim' for selecionado) */}
                            {temRegistro === 'Sim' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>N° de Registro do Projeto</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="numero_registro_fabricante"
                                        placeholder="Insira o código fornecido pelo fabricante"
                                        value={formData.numero_registro_fabricante}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            )}

                            {/* Botão para página de registro (aparece se 'Não' for selecionado) */}
                            {temRegistro === 'Nao' && (
                                <Alert variant="info">
                                    É recomendado registrar o projeto junto ao fabricante.
                                    <div className="mt-2">
                                        <Button as={Link} to="/crm/register-user" target="_blank" variant="outline-primary">
                                            Ir para a Página de Registro
                                        </Button>
                                    </div>
                                </Alert>
                            )}
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Valor Estimado (R$)</Form.Label>
                                        <Form.Control type="number" step="0.01" name="valor_estimado" placeholder="Ex: 15000.00" value={formData.valor_estimado || ''} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Previsão de Faturamento</Form.Label>
                                        <Form.Control type="date" name="data_fechamento_prevista" value={formData.data_fechamento_prevista || ''} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Etapa do Funil</Form.Label>
                                        <Form.Select name="etapa_funil" value={formData.etapa_funil || ''} onChange={handleChange} required>
                                            {ETAPAS_DO_FUNIL_COMPLETA.map(etapa => <option key={etapa} value={etapa}>{etapa}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tipo do Projeto</Form.Label>
                                        <Form.Select name="tipo_projeto" value={formData.tipo_projeto || ''} onChange={handleChange} required>
                                            {TIPOS_PROJETO.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}><Form.Group className="mb-3">
                                    <Form.Label>Segmentação</Form.Label>
                                    {!showNewSegInput ? (
                                        <Form.Select name="segmentacao_id" value={formData.segmentacao_id || ''} onChange={handleChange}>
                                            <option value="">Nenhuma</option>
                                            {segmentacoes.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                            <option value="CREATE_NEW" className="fw-bold text-primary">[+] Criar Nova Segmentação</option>
                                        </Form.Select>
                                    ) : (
                                        <InputGroup>
                                            <Form.Control type="text" placeholder="Nova segmentação" value={newSegText} onChange={(e) => setNewSegText(e.target.value)} autoFocus />
                                            <Button variant="success" onClick={handleAddNewSegmentacao}><FaCheck /></Button>
                                            <Button variant="outline-secondary" onClick={() => setShowNewSegInput(false)}>X</Button>
                                        </InputGroup>
                                    )}
                                </Form.Group></Col>
                                <Col md={6}><Form.Group className="mb-3">
                                    <Form.Label>Vertical</Form.Label>
                                    {!showNewVertInput ? (
                                        <Form.Select name="vertical_id" value={formData.vertical_id || ''} onChange={handleChange}>
                                            <option value="">Nenhuma</option>
                                            {verticais.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                                            <option value="CREATE_NEW" className="fw-bold text-primary">[+] Criar Nova Vertical</option>
                                        </Form.Select>
                                    ) : (
                                        <InputGroup>
                                            <Form.Control type="text" placeholder="Nova vertical" value={newVertText} onChange={(e) => setNewVertText(e.target.value)} autoFocus />
                                            <Button variant="success" onClick={handleAddNewVertical}><FaCheck /></Button>
                                            <Button variant="outline-secondary" onClick={() => setShowNewVertInput(false)}>X</Button>
                                        </InputGroup>
                                    )}
                                </Form.Group></Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Fabricantes</Form.Label>
                                <Form.Select name="fabricantes_ids" value={formData.fabricantes_ids} onChange={handleChange} multiple>
                                    {/* CORREÇÃO: Trocado f.nome por f.name */}
                                    {fabricantes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Integrador</Form.Label>
                                <Form.Select name="integrador_id" value={formData.integrador_id || ''} onChange={handleChange}>
                                    <option value="">Nenhum</option>
                                    {integradores.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={submitting || loading}>{submitting ? 'Salvando...' : 'Salvar'}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
export default ProjetoFormModal;
