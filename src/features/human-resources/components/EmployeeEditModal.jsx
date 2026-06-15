import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, Spinner, Badge, Tabs, Tab, Alert } from 'react-bootstrap';
import { IMaskInput } from 'react-imask';
import apiClient from '../../../services/api';

const EmployeeEditModal = ({ show, onHide, employeeToEdit, onSaveSuccess }) => {
    // State for dropdown data
    const [cargos, setCargos] = useState([]);
    const [setores, setSetores] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [fabricantes, setFabricantes] = useState([]);
    const [verticais, setVerticais] = useState([]);
    const [centrosCusto, setCentrosCusto] = useState([]);
    const [beneficiosList, setBeneficiosList] = useState([]); // 🚀 Lista de todos os benefícios
    const [timesList, setTimesList] = useState([]); // 🚀 Para o novo dropdown de times
    const [subgrupos, setSubgrupos] = useState([]);
    const [employees, setEmployees] = useState([]); // For manager dropdown

    // Form fields state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [cargoId, setCargoId] = useState('');
    const [setorId, setSetorId] = useState('');
    const [gestorId, setGestorId] = useState('');
    const [unidadeId, setUnidadeId] = useState('');
    const [permissions, setPermissions] = useState(['dashboard']);
    const [selectedBeneficios, setSelectedBeneficios] = useState([]); // 🚀 Benefícios selecionados
    const [selectedFabricantes, setSelectedFabricantes] = useState([]);
    const [selectedVerticais, setSelectedVerticais] = useState([]);
    const [selectedSubgrupos, setSelectedSubgrupos] = useState([]);
    
    const [userpicFile, setUserpicFile] = useState(null);
    const [existingUserpicUrl, setExistingUserpicUrl] = useState('');
    const [userpicPreview, setUserpicPreview] = useState('');

    const [cnhNumero, setCnhNumero] = useState('');
    const [cnhValidade, setCnhValidade] = useState('');

    const [nomeSocial, setNomeSocial] = useState('');
    const [emailPessoal, setEmailPessoal] = useState('');
    const [timeId, setTimeId] = useState(''); // 🚀 Substitui o campo de texto 'time'
    const [centroCustoId, setCentroCustoId] = useState('');
    const [batePonto, setBatePonto] = useState(false);
    const [vinculo, setVinculo] = useState('');
    const [salario, setSalario] = useState('');
    const [dataAdmissao, setDataAdmissao] = useState('');
    const [categoriaTrabalhador, setCategoriaTrabalhador] = useState('');
    const [periodoExperiencia, setPeriodoExperiencia] = useState('');
    const [jornadaTrabalho, setJornadaTrabalho] = useState('');
    const [horasMensais, setHorasMensais] = useState('');
    const [primeiroEmprego, setPrimeiroEmprego] = useState(false);

    // Novos campos da aba Profissional
    const [matricula, setMatricula] = useState('');
    const [numeroCracha, setNumeroCracha] = useState('');
    const [tipoAdmissao, setTipoAdmissao] = useState('');
    const [dataExameAdmissional, setDataExameAdmissional] = useState('');
    const [tipoSalario, setTipoSalario] = useState('');
    const [formaPagamento, setFormaPagamento] = useState('');
    const [salarioValidoAPartir, setSalarioValidoAPartir] = useState('');
    const [motivoAjusteSalarial, setMotivoAjusteSalarial] = useState('');
    const [descricaoSalarial, setDescricaoSalarial] = useState('');
    const [possuiRegistroPonto, setPossuiRegistroPonto] = useState(true);
    const [horaContratual, setHoraContratual] = useState('');
    const [tipoJornada, setTipoJornada] = useState('');
    const [regimeJornada, setRegimeJornada] = useState('');
    const [tipoHorario, setTipoHorario] = useState('');
    const [horaNoturna, setHoraNoturna] = useState(false);
    const [horarioTrabalhoDetalhado, setHorarioTrabalhoDetalhado] = useState('');
    const [descansoSemanalRemunerado, setDescansoSemanalRemunerado] = useState('');
    const [motivoJornada, setMotivoJornada] = useState('');
    const [observacaoJornada, setObservacaoJornada] = useState('');
    const [sindicato, setSindicato] = useState('');
    const [contribuicaoSindical, setContribuicaoSindical] = useState(false);
    const [estabilidade, setEstabilidade] = useState('');
    const [cargoConfianca, setCargoConfianca] = useState(false);
    const [temSeguroDesemprego, setTemSeguroDesemprego] = useState(false);
    const [aposentado, setAposentado] = useState(false);
    const [terminoExperiencia, setTerminoExperiencia] = useState('');
    const [inscricaoOrgaoClasse, setInscricaoOrgaoClasse] = useState('');
    const [conselhoProfissional, setConselhoProfissional] = useState('');
    const [cipa, setCipa] = useState(false);
    const [tipoRegimePrevidenciario, setTipoRegimePrevidenciario] = useState('');
    const [naturezaAtividade, setNaturezaAtividade] = useState('');
    const [indicativoAdmissao, setIndicativoAdmissao] = useState('');
    const [preencheCotaPcd, setPreencheCotaPcd] = useState(false);
    const [agenteNocivo, setAgenteNocivo] = useState('');
    const [optanteFgts, setOptanteFgts] = useState(true);
    const [possuiImovelProprio, setPossuiImovelProprio] = useState(false);
    const [imovelAdquiridoFgts, setImovelAdquiridoFgts] = useState(false);

    // Dados Pessoais Adicionais
    const [cpf, setCpf] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [nacionalidade, setNacionalidade] = useState('');
    const [ufNatal, setUfNatal] = useState('');
    const [cidadeNatal, setCidadeNatal] = useState('');
    const [corRaca, setCorRaca] = useState('');
    const [genero, setGenero] = useState('');
    const [generoDocumento, setGeneroDocumento] = useState('');
    const [estadoCivil, setEstadoCivil] = useState('');
    const [nomeMae, setNomeMae] = useState('');
    const [nomePai, setNomePai] = useState('');
    const [tamanhoCalcado, setTamanhoCalcado] = useState('');
    const [tamanhoCamiseta, setTamanhoCamiseta] = useState('');
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');
    const [banco, setBanco] = useState('');
    const [tipoContaBancaria, setTipoContaBancaria] = useState('');
    const [agencia, setAgencia] = useState('');
    const [conta, setConta] = useState('');
    const [chavePixTipo, setChavePixTipo] = useState('');
    const [chavePix, setChavePix] = useState('');
    const [contatoEmergenciaNome, setContatoEmergenciaNome] = useState('');
    const [contatoEmergenciaParentesco, setContatoEmergenciaParentesco] = useState('');
    const [contatoEmergenciaTelefone, setContatoEmergenciaTelefone] = useState('');
    const [pcd, setPcd] = useState(false);
    const [pcdTipo, setPcdTipo] = useState('');
    const [pcdObservacoes, setPcdObservacoes] = useState('');

    // Documentos
    const [numero_ctps, setNumeroCtps] = useState('');
    const [serie_ctps, setSerieCtps] = useState('');
    const [data_emissao_ctps, setDataEmissaoCtps] = useState('');
    const [uf_emissor_ctps, setUfEmissorCtps] = useState('');
    const [pis, setPis] = useState('');
    const [rg_numero, setRgNumero] = useState('');
    const [rg_data_emissao, setRgDataEmissao] = useState('');
    const [rg_orgao_emissor, setRgOrgaoEmissor] = useState('');
    const [rg_uf_emissor, setRgUfEmissor] = useState('');
    const [reservista_numero, setReservistaNumero] = useState('');
    const [reservista_ra, setReservistaRa] = useState('');
    const [reservista_categoria, setReservistaCategoria] = useState('');
    const [cnh_data_emissao, setCnhDataEmissao] = useState('');
    const [cnh_categoria, setCnhCategoria] = useState('');
    const [titulo_eleitor_numero, setTituloEleitorNumero] = useState('');
    const [titulo_eleitor_zona, setTituloEleitorZona] = useState('');
    const [titulo_eleitor_secao, setTituloEleitorSecao] = useState('');

    const [processoAdmissao, setProcessoAdmissao] = useState('preencher');

    const [searchSubgrupo, setSearchSubgrupo] = useState('');
    const [showSubgrupoDropdown, setShowSubgrupoDropdown] = useState(false);

    const [error, setError] = useState(null);

    const AVAILABLE_PERMISSIONS = [
        { id: 'admin', label: 'Administrador (Acesso Total)' },
        { id: 'dashboard', label: 'Visualizar Dashboard e Vendas' },
        { id: 'metas', label: 'Gerenciar Metas' },
        { id: 'leads', label: 'Gerenciar Leads e Oportunidades' },
        { id: 'dtc', label: 'Acesso Módulo DTC' },
        { id: 'rh', label: 'Recursos Humanos' }
    ];

    // Fetch all necessary data for dropdowns when modal is shown
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cargosRes, setoresRes, unidadesRes, fabricantesRes, verticaisRes, subgruposRes, employeesRes, timesRes, beneficiosRes, centrosCustoRes] = await Promise.all([
                    apiClient.get('/api/cargos'),
                    apiClient.get('/api/setores'),
                    apiClient.get('/api/unidades'),
                    apiClient.get('/api/fabricantes'),
                    apiClient.get('/api/verticais'),
                    apiClient.get('/api/faq/subgrupos'),
                    apiClient.get('/api/funcionarios'),
                    apiClient.get('/api/times'),
                    apiClient.get('/api/beneficios'), // Benefícios já estavam sendo buscados
                    apiClient.get('/api/centro-custos')
                ]);
                setCargos(cargosRes.data);
                setSetores(setoresRes.data);
                setUnidades(unidadesRes.data);
                setFabricantes(fabricantesRes.data);
                setVerticais(verticaisRes.data);
                setSubgrupos(subgruposRes.data);
                setEmployees(employeesRes.data);
                setCentrosCusto(centrosCustoRes.data);
                setBeneficiosList(beneficiosRes.data); // <-- CORREÇÃO AQUI
                setTimesList(timesRes.data); // 🚀 Salva os times no estado
            } catch (err) {
                console.error("Error fetching modal data", err);
                console.error("Erro ao buscar dados para o formulário:", err.response?.data || err.message);
                setError("Não foi possível carregar os dados para o formulário.");
            }
        };

        if (show) {
            fetchData();
        }
    }, [show]);

    // Populate form when employeeToEdit is provided
    useEffect(() => {
        if (show) {
            if (employeeToEdit) {
                setName(employeeToEdit.nome_completo || '');
                setEmail(employeeToEdit.email || '');
                setContact(employeeToEdit.contato || '');
                setCargoId(employeeToEdit.cargo_id || '');
                setSetorId(employeeToEdit.setor_id || '');
                setGestorId(employeeToEdit.gestor_id || '');
                setUnidadeId(employeeToEdit.unidade_id || '');
                setPermissions(employeeToEdit.privilegios ? employeeToEdit.privilegios.split(',') : ['dashboard']);
                setSelectedBeneficios(employeeToEdit.beneficios_atribuidos?.map(b => b.beneficio_id) || []); // 🚀 Popula benefícios
                setSelectedFabricantes(employeeToEdit.fabricantes_ids || []);
                setSelectedVerticais(employeeToEdit.verticais_ids || []);
                setSelectedSubgrupos(employeeToEdit.subgrupos_ids || []);
                setCnhNumero(employeeToEdit.cnh_numero || '');
                setCnhValidade(employeeToEdit.cnh_validade ? employeeToEdit.cnh_validade.split('T')[0] : '');
                setNomeSocial(employeeToEdit.nome_social || '');
                setEmailPessoal(employeeToEdit.email_pessoal || '');
                setTimeId(employeeToEdit.time_id || '');
                setCentroCustoId(employeeToEdit.centro_custo_id || '');
                setBatePonto(employeeToEdit.bate_ponto || false);
                setVinculo(employeeToEdit.vinculo || '');
                setSalario(employeeToEdit.salario || '');
                setDataAdmissao(employeeToEdit.data_admissao ? employeeToEdit.data_admissao.split('T')[0] : '');
                setCategoriaTrabalhador(employeeToEdit.categoria_trabalhador || '');
                setPeriodoExperiencia(employeeToEdit.periodo_experiencia || '');
                setJornadaTrabalho(employeeToEdit.jornada_trabalho || '');
                setHorasMensais(employeeToEdit.horas_mensais || '');
                setPrimeiroEmprego(employeeToEdit.primeiro_emprego || false);

                // Campos profissionais
                setMatricula(employeeToEdit.matricula || '');
                setNumeroCracha(employeeToEdit.numero_cracha || '');
                setTipoAdmissao(employeeToEdit.tipo_admissao || '');
                setDataExameAdmissional(employeeToEdit.data_exame_admissional ? employeeToEdit.data_exame_admissional.split('T')[0] : '');
                setTipoSalario(employeeToEdit.tipo_salario || '');
                setFormaPagamento(employeeToEdit.forma_pagamento || '');
                setSalarioValidoAPartir(employeeToEdit.salario_valido_a_partir ? employeeToEdit.salario_valido_a_partir.split('T')[0] : '');
                setMotivoAjusteSalarial(employeeToEdit.motivo_ajuste_salarial || '');
                setDescricaoSalarial(employeeToEdit.descricao_salarial || '');
                setPossuiRegistroPonto(employeeToEdit.possui_registro_ponto ?? true);
                setHoraContratual(employeeToEdit.hora_contratual || '');
                setTipoJornada(employeeToEdit.tipo_jornada || '');
                setRegimeJornada(employeeToEdit.regime_jornada || '');
                setTipoHorario(employeeToEdit.tipo_horario || '');
                setHoraNoturna(employeeToEdit.hora_noturna || false);
                setSindicato(employeeToEdit.sindicato || '');
                setContribuicaoSindical(employeeToEdit.contribuicao_sindical || false);
                setEstabilidade(employeeToEdit.estabilidade || '');
                setCargoConfianca(employeeToEdit.cargo_confianca || false);
                setTemSeguroDesemprego(employeeToEdit.tem_seguro_desemprego || false);
                setAposentado(employeeToEdit.aposentado || false);
                setTerminoExperiencia(employeeToEdit.termino_experiencia ? employeeToEdit.termino_experiencia.split('T')[0] : '');
                setInscricaoOrgaoClasse(employeeToEdit.inscricao_orgao_classe || '');
                setConselhoProfissional(employeeToEdit.conselho_profissional || '');
                setCipa(employeeToEdit.cipa || false);
                setTipoRegimePrevidenciario(employeeToEdit.tipo_regime_previdenciario || '');
                setNaturezaAtividade(employeeToEdit.natureza_atividade || '');
                setIndicativoAdmissao(employeeToEdit.indicativo_admissao || '');
                setPreencheCotaPcd(employeeToEdit.preenche_cota_pcd || false);
                setAgenteNocivo(employeeToEdit.agente_nocivo || '');
                setOptanteFgts(employeeToEdit.optante_fgts ?? true);
                setPossuiImovelProprio(employeeToEdit.possui_imovel_proprio || false);
                setImovelAdquiridoFgts(employeeToEdit.imovel_adquirido_fgts || false);

                // Dados Pessoais
                setCpf(employeeToEdit.cpf || '');
                setDataNascimento(employeeToEdit.data_nascimento ? employeeToEdit.data_nascimento.split('T')[0] : '');
                setNacionalidade(employeeToEdit.nacionalidade || '');
                setUfNatal(employeeToEdit.uf_natal || '');
                setCidadeNatal(employeeToEdit.cidade_natal || '');
                setCorRaca(employeeToEdit.cor_raca || '');
                setGenero(employeeToEdit.genero || '');
                setGeneroDocumento(employeeToEdit.genero_documento || '');
                setEstadoCivil(employeeToEdit.estado_civil || '');
                setNomeMae(employeeToEdit.nome_mae || '');
                setNomePai(employeeToEdit.nome_pai || '');
                setTamanhoCalcado(employeeToEdit.tamanho_calcado || '');
                setTamanhoCamiseta(employeeToEdit.tamanho_camiseta || '');
                setCep(employeeToEdit.cep || '');
                setLogradouro(employeeToEdit.logradouro || '');
                setNumero(employeeToEdit.numero || '');
                setComplemento(employeeToEdit.complemento || '');
                setBairro(employeeToEdit.bairro || '');
                setCidade(employeeToEdit.cidade || '');
                setUf(employeeToEdit.uf || '');
                setBanco(employeeToEdit.banco || '');
                setTipoContaBancaria(employeeToEdit.tipo_conta_bancaria || '');
                setAgencia(employeeToEdit.agencia || '');
                setConta(employeeToEdit.conta || '');
                setChavePixTipo(employeeToEdit.chave_pix_tipo || '');
                setChavePix(employeeToEdit.chave_pix || '');
                setContatoEmergenciaNome(employeeToEdit.contato_emergencia_nome || '');
                setContatoEmergenciaParentesco(employeeToEdit.contato_emergencia_parentesco || '');
                setContatoEmergenciaTelefone(employeeToEdit.contato_emergencia_telefone || '');
                setPcd(employeeToEdit.pcd || false);
                setPcdTipo(employeeToEdit.pcd_tipo || '');
                setPcdObservacoes(employeeToEdit.pcd_observacoes || '');

                // Documentos
                setNumeroCtps(employeeToEdit.numero_ctps || '');
                setSerieCtps(employeeToEdit.serie_ctps || '');
                setDataEmissaoCtps(employeeToEdit.data_emissao_ctps ? employeeToEdit.data_emissao_ctps.split('T')[0] : '');
                setUfEmissorCtps(employeeToEdit.uf_emissor_ctps || '');
                setPis(employeeToEdit.pis || '');
                setRgNumero(employeeToEdit.rg_numero || '');
                setRgDataEmissao(employeeToEdit.rg_data_emissao ? employeeToEdit.rg_data_emissao.split('T')[0] : '');
                setRgOrgaoEmissor(employeeToEdit.rg_orgao_emissor || '');
                setRgUfEmissor(employeeToEdit.rg_uf_emissor || '');
                setReservistaNumero(employeeToEdit.reservista_numero || '');
                setReservistaRa(employeeToEdit.reservista_ra || '');
                setReservistaCategoria(employeeToEdit.reservista_categoria || '');
                setCnhDataEmissao(employeeToEdit.cnh_data_emissao ? employeeToEdit.cnh_data_emissao.split('T')[0] : '');
                setCnhCategoria(employeeToEdit.cnh_categoria || '');
                setTituloEleitorNumero(employeeToEdit.titulo_eleitor_numero || '');
                setTituloEleitorZona(employeeToEdit.titulo_eleitor_zona || '');
                setTituloEleitorSecao(employeeToEdit.titulo_eleitor_secao || '');

                setUserpicFile(null);
                setUserpicPreview('');
                setExistingUserpicUrl(employeeToEdit.userpic_url || '');
            } else {
                // Reset form for new employee
                resetForm();
            }
        }
    }, [employeeToEdit, show]);

    const resetForm = () => {
        setName(''); setEmail(''); setContact('');
        setCargoId(''); setSetorId(''); setUnidadeId('');
        setGestorId(''); setPermissions(['dashboard']); setSelectedFabricantes([]); setSelectedVerticais([]); setSelectedSubgrupos([]);
        setCnhNumero(''); setCnhValidade('');
        setSelectedBeneficios([]); // 🚀 Limpa benefícios
        setUserpicFile(null); setUserpicPreview(''); 
        setNomeSocial(''); setEmailPessoal(''); setTimeId(''); setCentroCustoId('');
        setBatePonto(false); setVinculo(''); setSalario(''); setDataAdmissao('');
        setCategoriaTrabalhador(''); setPeriodoExperiencia('');
        setJornadaTrabalho(''); setHorasMensais(''); setPrimeiroEmprego(false);
        setProcessoAdmissao('preencher');

        // Reset campos profissionais
        setMatricula(''); setNumeroCracha(''); setTipoAdmissao(''); setDataExameAdmissional('');
        setTipoSalario(''); setFormaPagamento(''); setSalarioValidoAPartir('');
        setMotivoAjusteSalarial(''); setDescricaoSalarial('');
        setPossuiRegistroPonto(true); setHoraContratual(''); setTipoJornada('');
        setRegimeJornada(''); setTipoHorario(''); setHoraNoturna(false);
        setSindicato(''); setContribuicaoSindical(false); setEstabilidade('');
        setCargoConfianca(false); setTemSeguroDesemprego(false); setAposentado(false);
        setTerminoExperiencia('');
        setHorarioTrabalhoDetalhado(''); setDescansoSemanalRemunerado('');
        setInscricaoOrgaoClasse(''); setConselhoProfissional(''); setCipa(false);
        setTipoRegimePrevidenciario(''); setNaturezaAtividade(''); setIndicativoAdmissao('');
        setPreencheCotaPcd(false); setAgenteNocivo(''); setOptanteFgts(true);
        setPossuiImovelProprio(false); setImovelAdquiridoFgts(false);

        // Reset Dados Pessoais
        setCpf(''); setDataNascimento(''); setNacionalidade(''); setUfNatal(''); setCidadeNatal('');
        setCorRaca(''); setGenero(''); setGeneroDocumento(''); setEstadoCivil(''); setNomeMae(''); setNomePai('');
        setTamanhoCalcado(''); setTamanhoCamiseta('');
        setCep(''); setLogradouro(''); setNumero(''); setComplemento(''); setBairro(''); setCidade(''); setUf('');
        setBanco(''); setTipoContaBancaria(''); setAgencia(''); setConta(''); setChavePixTipo(''); setChavePix('');
        setContatoEmergenciaNome(''); setContatoEmergenciaParentesco(''); setContatoEmergenciaTelefone('');
        setPcd(false); setPcdTipo(''); setPcdObservacoes('');

        // Reset Documentos
        setNumeroCtps(''); setSerieCtps(''); setDataEmissaoCtps(''); setUfEmissorCtps(''); setPis('');
        setRgNumero(''); setRgDataEmissao(''); setRgOrgaoEmissor(''); setRgUfEmissor('');
        setReservistaNumero(''); setReservistaRa(''); setReservistaCategoria('');
        setCnhDataEmissao(''); setCnhCategoria('');
        setTituloEleitorNumero(''); setTituloEleitorZona(''); setTituloEleitorSecao('');

        setMotivoJornada(''); setObservacaoJornada('');

        setExistingUserpicUrl('');
        setError(null);
        setSearchSubgrupo('');
        setShowSubgrupoDropdown(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUserpicFile(file);
            setUserpicPreview(URL.createObjectURL(file));
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (!name || !email || !setorId) {
            setError("Nome, e-mail e setor são obrigatórios.");
            return;
        }

        const formData = new FormData();
        formData.append('nome_completo', name);
        formData.append('email', email);
        formData.append('nome_social', nomeSocial);
        formData.append('email_pessoal', emailPessoal);
        if (timeId) formData.append('time_id', timeId);
        if (centroCustoId) formData.append('centro_custo_id', centroCustoId);
        formData.append('bate_ponto', batePonto);
        formData.append('vinculo', vinculo);
        formData.append('salario', salario);
        formData.append('data_admissao', dataAdmissao);
        formData.append('categoria_trabalhador', categoriaTrabalhador);
        formData.append('periodo_experiencia', periodoExperiencia);
        formData.append('jornada_trabalho', jornadaTrabalho);
        formData.append('horas_mensais', horasMensais);
        formData.append('primeiro_emprego', primeiroEmprego);
        formData.append('processo_admissao', processoAdmissao);

        // Append campos profissionais
        formData.append('matricula', matricula);
        formData.append('numero_cracha', numeroCracha);
        formData.append('tipo_admissao', tipoAdmissao);
        formData.append('data_exame_admissional', dataExameAdmissional);
        formData.append('tipo_salario', tipoSalario);
        formData.append('forma_pagamento', formaPagamento);
        formData.append('salario_valido_a_partir', salarioValidoAPartir);
        formData.append('motivo_ajuste_salarial', motivoAjusteSalarial);
        formData.append('descricao_salarial', descricaoSalarial);
        formData.append('possui_registro_ponto', possuiRegistroPonto);
        formData.append('hora_contratual', horaContratual);
        formData.append('tipo_jornada', tipoJornada);
        formData.append('regime_jornada', regimeJornada);
        formData.append('tipo_horario', tipoHorario);
        formData.append('hora_noturna', horaNoturna);
        formData.append('sindicato', sindicato);
        formData.append('contribuicao_sindical', contribuicaoSindical);
        formData.append('estabilidade', estabilidade);
        formData.append('cargo_confianca', cargoConfianca);
        formData.append('tem_seguro_desemprego', temSeguroDesemprego);
        formData.append('aposentado', aposentado);
        formData.append('termino_experiencia', terminoExperiencia);
        formData.append('inscricao_orgao_classe', inscricaoOrgaoClasse);
        formData.append('conselho_profissional', conselhoProfissional);
        formData.append('cipa', cipa);
        formData.append('tipo_regime_previdenciario', tipoRegimePrevidenciario);
        formData.append('natureza_atividade', naturezaAtividade);
        formData.append('indicativo_admissao', indicativoAdmissao);
        formData.append('preenche_cota_pcd', preencheCotaPcd);
        formData.append('agente_nocivo', agenteNocivo);
        formData.append('optante_fgts', optanteFgts);
        formData.append('possui_imovel_proprio', possuiImovelProprio);
        formData.append('imovel_adquirido_fgts', imovelAdquiridoFgts);

        // Dados Pessoais
        formData.append('cpf', cpf);
        formData.append('data_nascimento', dataNascimento);
        formData.append('nacionalidade', nacionalidade);
        formData.append('uf_natal', ufNatal);
        formData.append('cidade_natal', cidadeNatal);
        formData.append('cor_raca', corRaca);
        formData.append('genero', genero);
        formData.append('genero_documento', generoDocumento);
        formData.append('estado_civil', estadoCivil);
        formData.append('nome_mae', nomeMae);
        formData.append('nome_pai', nomePai);
        formData.append('tamanho_calcado', tamanhoCalcado);
        formData.append('tamanho_camiseta', tamanhoCamiseta);
        formData.append('cep', cep);
        formData.append('logradouro', logradouro);
        formData.append('numero', numero);
        formData.append('complemento', complemento);
        formData.append('bairro', bairro);
        formData.append('cidade', cidade);
        formData.append('uf', uf);
        formData.append('banco', banco);
        formData.append('tipo_conta_bancaria', tipoContaBancaria);
        formData.append('agencia', agencia);
        formData.append('conta', conta);
        formData.append('chave_pix_tipo', chavePixTipo);
        formData.append('chave_pix', chavePix);
        formData.append('contato_emergencia_nome', contatoEmergenciaNome);
        formData.append('contato_emergencia_parentesco', contatoEmergenciaParentesco);
        formData.append('contato_emergencia_telefone', contatoEmergenciaTelefone);
        formData.append('pcd', pcd);
        formData.append('pcd_tipo', pcdTipo);
        formData.append('pcd_observacoes', pcdObservacoes);

        // Documentos
        formData.append('numero_ctps', numero_ctps);
        formData.append('serie_ctps', serie_ctps);
        formData.append('data_emissao_ctps', data_emissao_ctps);
        formData.append('uf_emissor_ctps', uf_emissor_ctps);
        formData.append('pis', pis);
        formData.append('rg_numero', rg_numero);
        formData.append('rg_data_emissao', rg_data_emissao);
        formData.append('rg_orgao_emissor', rg_orgao_emissor);
        formData.append('rg_uf_emissor', rg_uf_emissor);
        formData.append('reservista_numero', reservista_numero);
        formData.append('reservista_ra', reservista_ra);
        formData.append('reservista_categoria', reservista_categoria);
        formData.append('cnh_data_emissao', cnh_data_emissao);
        formData.append('cnh_categoria', cnh_categoria);
        formData.append('titulo_eleitor_numero', titulo_eleitor_numero);
        formData.append('titulo_eleitor_zona', titulo_eleitor_zona);
        formData.append('titulo_eleitor_secao', titulo_eleitor_secao);

        if (contact) formData.append('contato', contact.replace(/\D/g, ''));
        if (setorId) formData.append('setor_id', setorId);
        if (cargoId) formData.append('cargo_id', cargoId);
        formData.append('privilegios', permissions.join(',') || 'usuario');
        if (gestorId) formData.append('gestor_id', gestorId);
        if (unidadeId) formData.append('unidade_id', unidadeId);
        if (cnhNumero) formData.append('cnh_numero', cnhNumero);
        if (cnhValidade) formData.append('cnh_validade', cnhValidade);

        if (selectedFabricantes?.length > 0) formData.append('fabricantes_ids', JSON.stringify(selectedFabricantes));
        if (selectedVerticais?.length > 0) formData.append('verticais_ids', JSON.stringify(selectedVerticais));
        if (selectedBeneficios?.length > 0) formData.append('beneficios_ids', JSON.stringify(selectedBeneficios)); // 🚀 Envia benefícios
        if (selectedSubgrupos?.length > 0) formData.append('subgrupos_ids', JSON.stringify(selectedSubgrupos));

        if (userpicFile) {
            formData.append('userpic_file', userpicFile);
        } else if (employeeToEdit && existingUserpicUrl) {
            formData.append('userpic_url', existingUserpicUrl);
        }

        const config = { headers: { 'Content-Type': 'multipart/form-data' } };

        try {
            if (employeeToEdit) {
                await apiClient.put(`/api/funcionarios/${employeeToEdit.id}`, formData, config);
            } else {
                await apiClient.post('/api/funcionarios', formData, config);
            }
            onSaveSuccess();
            handleClose();
        } catch (err) {
            console.error('Erro ao salvar funcionário:', err);
            setError(err.response?.data?.error || 'Ocorreu um erro inesperado ao salvar.');
        }
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    const availableSubgrupos = subgrupos.filter(sub => {
        if (!setorId) return true;
        return String(sub.setor_id) === String(setorId);
    });

    return (
        <Modal show={show} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>{employeeToEdit ? 'Editar Colaborador' : 'Adicionar Novo Colaborador'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleFormSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Tabs defaultActiveKey="pessoal" className="mb-4 custom-tabs">
                        <Tab eventKey="pessoal" title="Ficha de Admissão">
                            <div className="pt-3">
                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Dados Pessoais</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Nome Completo*</Form.Label><Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Nome Social</Form.Label><Form.Control type="text" value={nomeSocial} onChange={(e) => setNomeSocial(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>E-mail Pessoal*</Form.Label><Form.Control type="email" value={emailPessoal} onChange={(e) => setEmailPessoal(e.target.value)} required /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Celular</Form.Label>
                                                <IMaskInput mask="(00) 00000-0000" value={contact} onAccept={(value) => setContact(value)} className="form-control" placeholder="(99) 99999-9999" />
                                            </Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>CPF</Form.Label><IMaskInput mask="000.000.000-00" value={cpf} onAccept={(value) => setCpf(value)} className="form-control" /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Data de Nascimento</Form.Label><Form.Control type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Estado Civil</Form.Label><Form.Control type="text" value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Nacionalidade</Form.Label><Form.Control type="text" value={nacionalidade} onChange={(e) => setNacionalidade(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Cidade Natal</Form.Label><Form.Control type="text" value={cidadeNatal} onChange={(e) => setCidadeNatal(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>UF Natal</Form.Label><Form.Control type="text" maxLength="2" value={ufNatal} onChange={(e) => setUfNatal(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Gênero</Form.Label><Form.Control type="text" value={genero} onChange={(e) => setGenero(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Cor/Raça</Form.Label><Form.Control type="text" value={corRaca} onChange={(e) => setCorRaca(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Gênero (Documento)</Form.Label><Form.Control type="text" value={generoDocumento} onChange={(e) => setGeneroDocumento(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Nome da Mãe</Form.Label><Form.Control type="text" value={nomeMae} onChange={(e) => setNomeMae(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Nome do Pai</Form.Label><Form.Control type="text" value={nomePai} onChange={(e) => setNomePai(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Celular</Form.Label>
                                                <IMaskInput mask="(00) 00000-0000" value={contact} onAccept={(value) => setContact(value)} className="form-control" placeholder="(99) 99999-9999" />
                                            </Form.Group></Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3"><Form.Label>Foto do Perfil</Form.Label><Form.Control type="file" accept="image/*" onChange={handleImageChange} /></Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                {(userpicPreview || existingUserpicUrl) && (
                                                    <div className="mt-2 text-center">
                                                        <p className="text-muted small mb-1">Pré-visualização:</p>
                                                        <img src={userpicPreview || existingUserpicUrl} alt="Preview" className="rounded-circle shadow-sm" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                                    </div>
                                                )}
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Dados Corporativos</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>E-mail Profissional</Form.Label><Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Filial</Form.Label><Form.Select value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)}><option value="">Selecione</option>{unidades.map(u => (<option key={u.id} value={u.id}>{u.nome_unidade}</option>))}</Form.Select></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Pessoa Gestora</Form.Label><Form.Select value={gestorId} onChange={(e) => setGestorId(e.target.value)}><option value="">Ninguém</option>{employees.filter(emp => !employeeToEdit || emp.id !== employeeToEdit.id).map(emp => (<option key={emp.id} value={emp.id}>{emp.nome_completo}</option>))}</Form.Select></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Departamento*</Form.Label><Form.Select value={setorId} onChange={(e) => setSetorId(e.target.value)} required><option value="">Selecione</option>{setores.map(s => (<option key={s.id} value={s.id}>{s.nome_setor}</option>))}</Form.Select></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Time</Form.Label><Form.Select value={timeId} onChange={(e) => setTimeId(e.target.value)}><option value="">Nenhum</option>{timesList.map(t => (<option key={t.id} value={t.id}>{t.nome}</option>))}</Form.Select></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Cargo*</Form.Label><Form.Select value={cargoId} onChange={(e) => setCargoId(e.target.value)} required><option value="">Selecione</option>{cargos.map(c => (<option key={c.id} value={c.id}>{c.nome_cargo}</option>))}</Form.Select></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Centro de Custo*</Form.Label><Form.Select value={centroCustoId} onChange={(e) => setCentroCustoId(e.target.value)} required><option value="">Selecione</option>{centrosCusto.map(cc => (<option key={cc.id} value={cc.id}>{cc.nome}</option>))}</Form.Select></Form.Group></Col>
                                            <Col md={6}><Form.Check type="switch" id="bate-ponto-switch" label="Colaborador bate ponto?" checked={batePonto} onChange={(e) => setBatePonto(e.target.checked)} className="mt-4"/></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                <Card>
                                    <Card.Header className="fw-bold">Contrato e Remuneração</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Vínculo*</Form.Label><Form.Select value={vinculo} onChange={(e) => setVinculo(e.target.value)} required><option value="">Selecione</option><option>CLT</option><option>Sócio</option><option>Diretor Estatutário</option><option>Estágio</option><option>Aprendiz</option><option>Pessoa Jurídica</option></Form.Select></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Salário (R$)*</Form.Label><Form.Control type="number" step="0.01" value={salario} onChange={(e) => setSalario(e.target.value)} required /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Data de Admissão*</Form.Label><Form.Control type="date" value={dataAdmissao} onChange={(e) => setDataAdmissao(e.target.value)} required /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Período de Experiência</Form.Label><Form.Select value={periodoExperiencia} onChange={(e) => setPeriodoExperiencia(e.target.value)}><option value="">Selecione</option><option>Sem período de experiência</option><option>1 x 45 dias</option><option>2 x 45 dias</option></Form.Select></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Jornada de Trabalho</Form.Label><Form.Select value={jornadaTrabalho} onChange={(e) => setJornadaTrabalho(e.target.value)}><option value="">Nenhum</option><option>44 horas semanais</option></Form.Select></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Horas Mensais</Form.Label><Form.Control type="number" value={horasMensais} onChange={(e) => setHorasMensais(e.target.value)} /></Form.Group></Col>
                                            <Col md={12}><Form.Check type="switch" id="primeiro-emprego-switch" label="Primeiro emprego?" checked={primeiroEmprego} onChange={(e) => setPrimeiroEmprego(e.target.checked)} /></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Endereço</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>CEP</Form.Label><IMaskInput mask="00000-000" value={cep} onAccept={(value) => setCep(value)} className="form-control" /></Form.Group></Col>
                                            <Col md={8}><Form.Group className="mb-3"><Form.Label>Logradouro</Form.Label><Form.Control type="text" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Número</Form.Label><Form.Control type="text" value={numero} onChange={(e) => setNumero(e.target.value)} /></Form.Group></Col>
                                            <Col md={8}><Form.Group className="mb-3"><Form.Label>Complemento</Form.Label><Form.Control type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} /></Form.Group></Col>
                                            <Col md={5}><Form.Group className="mb-3"><Form.Label>Bairro</Form.Label><Form.Control type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} /></Form.Group></Col>
                                            <Col md={5}><Form.Group className="mb-3"><Form.Label>Cidade</Form.Label><Form.Control type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} /></Form.Group></Col>
                                            <Col md={2}><Form.Group className="mb-3"><Form.Label>UF</Form.Label><Form.Control type="text" maxLength="2" value={uf} onChange={(e) => setUf(e.target.value)} /></Form.Group></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Dados Bancários</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Banco</Form.Label><Form.Control type="text" value={banco} onChange={(e) => setBanco(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Tipo de Conta</Form.Label><Form.Control type="text" value={tipoContaBancaria} onChange={(e) => setTipoContaBancaria(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Agência</Form.Label><Form.Control type="text" value={agencia} onChange={(e) => setAgencia(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Conta</Form.Label><Form.Control type="text" value={conta} onChange={(e) => setConta(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Tipo Chave PIX</Form.Label><Form.Control type="text" value={chavePixTipo} onChange={(e) => setChavePixTipo(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Chave PIX</Form.Label><Form.Control type="text" value={chavePix} onChange={(e) => setChavePix(e.target.value)} /></Form.Group></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Outros</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Contato de Emergência (Nome)</Form.Label><Form.Control type="text" value={contatoEmergenciaNome} onChange={(e) => setContatoEmergenciaNome(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Contato de Emergência (Telefone)</Form.Label><IMaskInput mask="(00) 00000-0000" value={contatoEmergenciaTelefone} onAccept={(value) => setContatoEmergenciaTelefone(value)} className="form-control" /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Tamanho da Camiseta</Form.Label><Form.Control type="text" value={tamanhoCamiseta} onChange={(e) => setTamanhoCamiseta(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Tamanho do Calçado</Form.Label><Form.Control type="text" value={tamanhoCalcado} onChange={(e) => setTamanhoCalcado(e.target.value)} /></Form.Group></Col>
                                        </Row>
                                        <hr/>
                                        <Row>
                                            <Col md={12}><Form.Check type="switch" label="Pessoa com Deficiência (PCD)" checked={pcd} onChange={(e) => setPcd(e.target.checked)} /></Col>
                                            {pcd && <>
                                                <Col md={6}><Form.Group className="mt-3"><Form.Label>Tipo de Deficiência</Form.Label><Form.Control type="text" value={pcdTipo} onChange={(e) => setPcdTipo(e.target.value)} /></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mt-3"><Form.Label>Observações PCD</Form.Label><Form.Control as="textarea" rows={1} value={pcdObservacoes} onChange={(e) => setPcdObservacoes(e.target.value)} /></Form.Group></Col>
                                            </>}
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </div>
                        </Tab>

                        <Tab eventKey="profissional" title="Profissional">
                            <div className="pt-3">
                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Admissão e Empresa</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Matrícula</Form.Label><Form.Control type="text" value={matricula} onChange={(e) => setMatricula(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Nº Crachá</Form.Label><Form.Control type="text" value={numeroCracha} onChange={(e) => setNumeroCracha(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Tipo de Admissão</Form.Label><Form.Control type="text" value={tipoAdmissao} onChange={(e) => setTipoAdmissao(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Data Exame Admissional</Form.Label><Form.Control type="date" value={dataExameAdmissional} onChange={(e) => setDataExameAdmissional(e.target.value)} /></Form.Group></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Remuneração</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Tipo de Salário</Form.Label><Form.Control type="text" value={tipoSalario} onChange={(e) => setTipoSalario(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Forma de Pagamento</Form.Label><Form.Control type="text" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Salário Válido a Partir de</Form.Label><Form.Control type="date" value={salarioValidoAPartir} onChange={(e) => setSalarioValidoAPartir(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Motivo do Ajuste Salarial</Form.Label><Form.Control as="textarea" rows={2} value={motivoAjusteSalarial} onChange={(e) => setMotivoAjusteSalarial(e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Descrição Salarial</Form.Label><Form.Control as="textarea" rows={2} value={descricaoSalarial} onChange={(e) => setDescricaoSalarial(e.target.value)} /></Form.Group></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Jornada e Informações Legais</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Sindicato</Form.Label><Form.Control type="text" value={sindicato} onChange={(e) => setSindicato(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Estabilidade</Form.Label><Form.Control type="text" value={estabilidade} onChange={(e) => setEstabilidade(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Término da Experiência</Form.Label><Form.Control type="date" value={terminoExperiencia} onChange={(e) => setTerminoExperiencia(e.target.value)} /></Form.Group></Col>
                                            <Col md={3}><Form.Check type="switch" label="Ponto Eletrônico" checked={possuiRegistroPonto} onChange={(e) => setPossuiRegistroPonto(e.target.checked)} className="mt-4"/></Col>
                                            <Col md={3}><Form.Check type="switch" label="Adic. Noturno" checked={horaNoturna} onChange={(e) => setHoraNoturna(e.target.checked)} className="mt-4"/></Col>
                                            <Col md={3}><Form.Check type="switch" label="Contrib. Sindical" checked={contribuicaoSindical} onChange={(e) => setContribuicaoSindical(e.target.checked)} className="mt-4"/></Col>
                                            <Col md={3}><Form.Check type="switch" label="Cargo de Confiança" checked={cargoConfianca} onChange={(e) => setCargoConfianca(e.target.checked)} className="mt-4"/></Col>
                                            <Col md={3}><Form.Check type="switch" label="Recebeu Seg. Desemprego" checked={temSeguroDesemprego} onChange={(e) => setTemSeguroDesemprego(e.target.checked)} className="mt-4"/></Col>
                                            <Col md={3}><Form.Check type="switch" label="Aposentado" checked={aposentado} onChange={(e) => setAposentado(e.target.checked)} className="mt-4"/></Col>
                                            <Col md={3}><Form.Check type="switch" label="Membro CIPA" checked={cipa} onChange={(e) => setCipa(e.target.checked)} className="mt-4"/></Col>
                                            <Col md={3}><Form.Check type="switch" label="Preenche Cota PCD" checked={preencheCotaPcd} onChange={(e) => setPreencheCotaPcd(e.target.checked)} className="mt-4"/></Col>
                                            <Col md={3}><Form.Check type="switch" label="Optante FGTS" checked={optanteFgts} onChange={(e) => setOptanteFgts(e.target.checked)} className="mt-4"/></Col>
                                            <Col md={3}><Form.Check type="switch" label="Possui Imóvel Próprio" checked={possuiImovelProprio} onChange={(e) => setPossuiImovelProprio(e.target.checked)} className="mt-4"/></Col>
                                            <Col md={3}><Form.Check type="switch" label="Imóvel Adquirido (FGTS)" checked={imovelAdquiridoFgts} onChange={(e) => setImovelAdquiridoFgts(e.target.checked)} className="mt-4"/></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </div>
                        </Tab>

                        <Tab eventKey="documentos" title="Documentos">
                            <div className="pt-3">
                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Carteira de Trabalho (CTPS)</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Número</Form.Label><Form.Control type="text" value={numero_ctps} onChange={(e) => setNumeroCtps(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Série</Form.Label><Form.Control type="text" value={serie_ctps} onChange={(e) => setSerieCtps(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Data de Emissão</Form.Label><Form.Control type="date" value={data_emissao_ctps} onChange={(e) => setDataEmissaoCtps(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>UF Emissor</Form.Label><Form.Control type="text" maxLength="2" value={uf_emissor_ctps} onChange={(e) => setUfEmissorCtps(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>PIS/PASEP</Form.Label><Form.Control type="text" value={pis} onChange={(e) => setPis(e.target.value)} /></Form.Group></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Registro Geral (RG)</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Número</Form.Label><Form.Control type="text" value={rg_numero} onChange={(e) => setRgNumero(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Data de Emissão</Form.Label><Form.Control type="date" value={rg_data_emissao} onChange={(e) => setRgDataEmissao(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Órgão Emissor</Form.Label><Form.Control type="text" value={rg_orgao_emissor} onChange={(e) => setRgOrgaoEmissor(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>UF Emissor</Form.Label><Form.Control type="text" maxLength="2" value={rg_uf_emissor} onChange={(e) => setRgUfEmissor(e.target.value)} /></Form.Group></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Título de Eleitor</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Número</Form.Label><Form.Control type="text" value={titulo_eleitor_numero} onChange={(e) => setTituloEleitorNumero(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Zona</Form.Label><Form.Control type="text" value={titulo_eleitor_zona} onChange={(e) => setTituloEleitorZona(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Seção</Form.Label><Form.Control type="text" value={titulo_eleitor_secao} onChange={(e) => setTituloEleitorSecao(e.target.value)} /></Form.Group></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Certificado de Reservista</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Número</Form.Label><Form.Control type="text" value={reservista_numero} onChange={(e) => setReservistaNumero(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>RA</Form.Label><Form.Control type="text" value={reservista_ra} onChange={(e) => setReservistaRa(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Categoria</Form.Label><Form.Control type="text" value={reservista_categoria} onChange={(e) => setReservistaCategoria(e.target.value)} /></Form.Group></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Card className="mb-4">
                                    <Card.Header className="fw-bold">Carteira de Motorista (CNH)</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Número</Form.Label><Form.Control type="text" value={cnhNumero} onChange={(e) => setCnhNumero(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Categoria</Form.Label><Form.Control type="text" value={cnh_categoria} onChange={(e) => setCnhCategoria(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Data de Emissão</Form.Label><Form.Control type="date" value={cnh_data_emissao} onChange={(e) => setCnhDataEmissao(e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group className="mb-3"><Form.Label>Validade</Form.Label><Form.Control type="date" value={cnhValidade} onChange={(e) => setCnhValidade(e.target.value)} /></Form.Group></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </div>
                        </Tab>
                        
                        <Tab eventKey="acessos" title="Acessos e Responsabilidades">
                            <div className="pt-3">
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Permissões de Acesso ao Sistema</Form.Label>
                                    <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                                        {AVAILABLE_PERMISSIONS.map(perm => (
                                            <Form.Check key={perm.id} type="checkbox" id={`perm-${perm.id}`} label={perm.label} checked={permissions.includes(perm.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) { setPermissions([...permissions, perm.id]); } 
                                                    else { setPermissions(permissions.filter(p => p !== perm.id)); }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Marcas Representadas (DTC)</Form.Label>
                                    <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                                        {fabricantes.map(fab => (
                                            <Form.Check key={fab.id} type="checkbox" id={`fab-${fab.id}`} label={fab.name} checked={selectedFabricantes.includes(fab.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) { setSelectedFabricantes([...selectedFabricantes, fab.id]); } 
                                                    else { setSelectedFabricantes(selectedFabricantes.filter(id => id !== fab.id)); }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Verticais DTC Representadas</Form.Label>
                                    <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                                        {verticais.map(vert => (
                                            <Form.Check key={vert.id} type="checkbox" id={`vert-${vert.id}`} label={vert.nome} checked={selectedVerticais.includes(vert.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) { setSelectedVerticais([...selectedVerticais, vert.id]); } 
                                                    else { setSelectedVerticais(selectedVerticais.filter(id => id !== vert.id)); }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>
                                
                                <Form.Group className="mb-4 position-relative">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Responsabilidade FAQ (Subgrupos)</Form.Label>
                                    <div className="mb-2 d-flex flex-wrap gap-2">
                                        {selectedSubgrupos.length === 0 && <span className="text-muted small fst-italic">Nenhum subgrupo atribuído.</span>}
                                        {selectedSubgrupos.map(id => {
                                            const sub = subgrupos.find(s => s.id === id);
                                            if (!sub) return null;
                                            return (
                                                <Badge bg="primary" key={id} className="d-flex align-items-center p-2 shadow-sm" style={{ fontSize: '0.85rem' }}>
                                                    {sub.nome}
                                                    <span className="ms-2 ps-2 border-start border-light" style={{ cursor: 'pointer' }} title="Remover"
                                                        onClick={() => setSelectedSubgrupos(selectedSubgrupos.filter(sId => sId !== id))}>
                                                        &times;
                                                    </span>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                    <Form.Control type="text" className="shadow-sm" placeholder="🔍 Digite para buscar uma categoria..." value={searchSubgrupo}
                                        onChange={(e) => setSearchSubgrupo(e.target.value)}
                                        onFocus={() => setShowSubgrupoDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowSubgrupoDropdown(false), 200)} // Delay to allow click
                                    />
                                    {showSubgrupoDropdown && (
                                        <div className="dropdown-menu show shadow w-100" style={{ maxHeight: '200px', overflowY: 'auto', position: 'absolute', zIndex: 1050 }}>
                                            {availableSubgrupos.filter(sub => !selectedSubgrupos.includes(sub.id) && sub.nome.toLowerCase().includes(searchSubgrupo.toLowerCase())).length > 0 ? (
                                                availableSubgrupos.filter(sub => !selectedSubgrupos.includes(sub.id) && sub.nome.toLowerCase().includes(searchSubgrupo.toLowerCase())).map(sub => (
                                                    <button key={`opt-${sub.id}`} type="button" className="dropdown-item py-2"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            setSelectedSubgrupos([...selectedSubgrupos, sub.id]);
                                                            setSearchSubgrupo('');
                                                            setShowSubgrupoDropdown(false);
                                                        }}>
                                                        {sub.nome}
                                                    </button>
                                                ))
                                            ) : (
                                                <span className="dropdown-item text-muted disabled">Nenhuma categoria encontrada.</span>
                                            )}
                                        </div>
                                    )}
                                    {availableSubgrupos.length === 0 && setorId && <Form.Text className="text-warning">Nenhuma categoria cadastrada para o setor deste colaborador.</Form.Text>}
                                </Form.Group>
                            </div>
                        </Tab>
                    </Tabs>
                    <hr />
                    <Form.Group className="mt-4">
                        <Form.Label className="fw-bold">Como deseja prosseguir com o processo?</Form.Label>
                        <div>
                            <Form.Check inline label="Preencher manualmente e admitir agora" name="processoAdmissao" type="radio" id="radio-preencher" value="preencher" checked={processoAdmissao === 'preencher'} onChange={(e) => setProcessoAdmissao(e.target.value)} />
                            <Form.Check inline label="Enviar para o colaborador preencher" name="processoAdmissao" type="radio" id="radio-enviar" value="enviar" checked={processoAdmissao === 'enviar'} onChange={(e) => setProcessoAdmissao(e.target.value)} />
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary btn-sm" onClick={handleClose}>Cancelar</Button>
                    <Button variant="success btn-sm" type="submit">{employeeToEdit ? 'Salvar Alterações' : 'Adicionar Colaborador'}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EmployeeEditModal;