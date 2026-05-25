import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';

// A lista de etapas foi mantida
// Lista completa de etapas selecionáveis no formulário
const ETAPAS_DO_FUNIL_COMPLETA = [
    '05% - Prospecção',
    '25% - Especificação de Projeto',
    '35% - POC',
    '55% - Envio de Proposta - Projeto',
    '75% - Aguardando Aprovação',
    '95% - Pedido Fechado',
    '98% - Parcialmente Entregue',
    '100% - Faturado e Entregue',
    '0% - Projeto Perdido', // "Perdido" agora é uma opção
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

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const isEditMode = !!projetoParaEditar;

    // 3. useEffect atualizado para buscar todos os dados necessários em paralelo
    useEffect(() => {
        if (show) {
            setLoading(true);
            setError(null);

            const endpoints = [
                axios.get('/api/clientes'),
                axios.get('/api/vendedores'),
                axios.get('/api/funcionarios'),
                axios.get('/api/segmentacoes'),
                axios.get('/api/verticais'),
                axios.get('/api/fabricantes'),
                axios.get('/api/integradores')
            ];

            Promise.all(endpoints)
                .then(axios.spread((...responses) => {
                    setClientes(responses[0].data || []);
                    setVendedores(responses[1].data || []);
                    setFuncionarios(responses[2].data || []);
                    setSegmentacoes(responses[3].data || []);
                    setVerticais(responses[4].data || []);
                    setFabricantes(responses[5].data || []);
                    setIntegradores(responses[6].data || []);
                }))
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


    // 4. HandleChange atualizado para lidar com campos de multi-seleção
    const handleChange = (e) => {
        const { name, value, options } = e.target;
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
            setError(err.response?.data?.message || 'Erro ao salvar o projeto.');
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
                                    <Form.Select name="segmentacao_id" value={formData.segmentacao_id || ''} onChange={handleChange}>
                                        <option value="">Nenhuma</option>
                                        {segmentacoes.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                    </Form.Select>
                                </Form.Group></Col>
                                <Col md={6}><Form.Group className="mb-3">
                                    <Form.Label>Vertical</Form.Label>
                                    <Form.Select name="vertical_id" value={formData.vertical_id || ''} onChange={handleChange}>
                                        <option value="">Nenhuma</option>
                                        {verticais.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                                    </Form.Select>
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
