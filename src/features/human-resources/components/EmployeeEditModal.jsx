import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Card,
  Spinner,
  Badge,
  Tabs,
  Tab,
  Alert,
} from "react-bootstrap";
import { IMaskInput } from "react-imask";
import apiClient from "../../../services/api";

const EmployeeEditModal = ({
  show,
  onHide,
  employeeToEdit,
  onSaveSuccess,
  cargos,
  setores,
  unidades,
  fabricantes,
  verticais,
  subgrupos,
  timesList,
  beneficiosList,
  employees,
  centrosCusto,
}) => {
  // Form fields state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [cargoId, setCargoId] = useState("");
  const [setorId, setSetorId] = useState("");
  const [gestorId, setGestorId] = useState("");
  const [unidadeId, setUnidadeId] = useState("");
  const [permissions, setPermissions] = useState(["dashboard"]);
  const [selectedBeneficios, setSelectedBeneficios] = useState([]); // 🚀 Benefícios selecionados
  const [selectedFabricantes, setSelectedFabricantes] = useState([]);
  const [selectedVerticais, setSelectedVerticais] = useState([]);
  const [selectedSubgrupos, setSelectedSubgrupos] = useState([]);

  const [userpicFile, setUserpicFile] = useState(null);
  const [existingUserpicUrl, setExistingUserpicUrl] = useState("");
  const [userpicPreview, setUserpicPreview] = useState("");

  const [cnhNumero, setCnhNumero] = useState("");
  const [cnhValidade, setCnhValidade] = useState("");

  const [nomeSocial, setNomeSocial] = useState("");
  const [emailPessoal, setEmailPessoal] = useState("");
  const [timeId, setTimeId] = useState(""); // 🚀 Substitui o campo de texto 'time'
  const [centroCustoId, setCentroCustoId] = useState("");
  const [vinculo, setVinculo] = useState("");
  const [salario, setSalario] = useState("");
  const [dataAdmissao, setDataAdmissao] = useState("");
  const [categoriaTrabalhador, setCategoriaTrabalhador] = useState("");
  const [periodoExperiencia, setPeriodoExperiencia] = useState("");
  const [jornadaTrabalho, setJornadaTrabalho] = useState("");
  const [horasMensais, setHorasMensais] = useState("");
  const [primeiroEmprego, setPrimeiroEmprego] = useState(false);
  const [senha, setSenha] = useState("");

  // Novos campos da aba Profissional
  const [matricula, setMatricula] = useState("");
  const [numeroCracha, setNumeroCracha] = useState("");
  const [tipoAdmissao, setTipoAdmissao] = useState("");
  const [dataExameAdmissional, setDataExameAdmissional] = useState("");
  const [tipoSalario, setTipoSalario] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [salarioValidoAPartir, setSalarioValidoAPartir] = useState("");
  const [motivoAjusteSalarial, setMotivoAjusteSalarial] = useState("");
  const [descricaoSalarial, setDescricaoSalarial] = useState("");
  const [possuiRegistroPonto, setPossuiRegistroPonto] = useState(true);
  const [horaContratual, setHoraContratual] = useState("");
  const [tipoJornada, setTipoJornada] = useState("");
  const [regimeJornada, setRegimeJornada] = useState("");
  const [tipoHorario, setTipoHorario] = useState("");
  const [horaNoturna, setHoraNoturna] = useState(false);
  const [horarioTrabalhoDetalhado, setHorarioTrabalhoDetalhado] = useState("");
  const [descansoSemanalRemunerado, setDescansoSemanalRemunerado] =
    useState("");
  const [motivoJornada, setMotivoJornada] = useState("");
  const [observacaoJornada, setObservacaoJornada] = useState("");
  const [sindicato, setSindicato] = useState("");
  const [contribuicaoSindical, setContribuicaoSindical] = useState(false);
  const [estabilidade, setEstabilidade] = useState("");
  const [cargoConfianca, setCargoConfianca] = useState(false);
  const [temSeguroDesemprego, setTemSeguroDesemprego] = useState(false);
  const [aposentado, setAposentado] = useState(false);
  const [terminoExperiencia, setTerminoExperiencia] = useState("");
  const [inscricaoOrgaoClasse, setInscricaoOrgaoClasse] = useState("");
  const [conselhoProfissional, setConselhoProfissional] = useState("");
  const [cipa, setCipa] = useState(false);
  const [tipoRegimePrevidenciario, setTipoRegimePrevidenciario] = useState("");
  const [naturezaAtividade, setNaturezaAtividade] = useState("");
  const [indicativoAdmissao, setIndicativoAdmissao] = useState("");
  const [preencheCotaPcd, setPreencheCotaPcd] = useState(false);
  const [agenteNocivo, setAgenteNocivo] = useState("");
  const [optanteFgts, setOptanteFgts] = useState(true);
  const [possuiImovelProprio, setPossuiImovelProprio] = useState(false);
  const [imovelAdquiridoFgts, setImovelAdquiridoFgts] = useState(false);

  // Dados Pessoais Adicionais
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [nacionalidade, setNacionalidade] = useState("");
  const [cidadeNatal, setCidadeNatal] = useState("");
  const [corRaca, setCorRaca] = useState("");
  const [genero, setGenero] = useState("");
  const [generoDocumento, setGeneroDocumento] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [nomeMae, setNomeMae] = useState("");
  const [nomePai, setNomePai] = useState("");
  const [tamanhoCalcado, setTamanhoCalcado] = useState("");
  const [tamanhoCamiseta, setTamanhoCamiseta] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [banco, setBanco] = useState("");
  const [tipoContaBancaria, setTipoContaBancaria] = useState("");
  const [agencia, setAgencia] = useState("");
  const [conta, setConta] = useState("");
  const [chavePixTipo, setChavePixTipo] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [contatoEmergenciaNome, setContatoEmergenciaNome] = useState("");
  const [contatoEmergenciaParentesco, setContatoEmergenciaParentesco] =
    useState("");
  const [contatoEmergenciaTelefone, setContatoEmergenciaTelefone] =
    useState("");
  const [pcd, setPcd] = useState(false);
  const [pcdTipo, setPcdTipo] = useState("");
  const [pcdObservacoes, setPcdObservacoes] = useState("");
  const [ufs, setUfs] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [ufNatal, setUfNatal] = useState("");

  // Documentos
  const [numero_ctps, setNumeroCtps] = useState("");
  const [serie_ctps, setSerieCtps] = useState("");
  const [data_emissao_ctps, setDataEmissaoCtps] = useState("");
  const [uf_emissor_ctps, setUfEmissorCtps] = useState("");
  const [pis, setPis] = useState("");
  const [rg_numero, setRgNumero] = useState("");
  const [rg_data_emissao, setRgDataEmissao] = useState("");
  const [rg_orgao_emissor, setRgOrgaoEmissor] = useState("");
  const [rg_uf_emissor, setRgUfEmissor] = useState("");
  const [reservista_numero, setReservistaNumero] = useState("");
  const [reservista_ra, setReservistaRa] = useState("");
  const [reservista_categoria, setReservistaCategoria] = useState("");
  const [cnh_data_emissao, setCnhDataEmissao] = useState("");
  const [cnh_categoria, setCnhCategoria] = useState("");
  const [titulo_eleitor_numero, setTituloEleitorNumero] = useState("");
  const [titulo_eleitor_zona, setTituloEleitorZona] = useState("");
  const [titulo_eleitor_secao, setTituloEleitorSecao] = useState("");

  const [processoAdmissao, setProcessoAdmissao] = useState("preencher");

  const [searchSubgrupo, setSearchSubgrupo] = useState("");
  const [showSubgrupoDropdown, setShowSubgrupoDropdown] = useState(false);

  const [error, setError] = useState(null);

  // 🚀 Busca automática de CEP
  const handleCepChange = async (novoCep) => {
    setCep(novoCep); // Atualiza o estado para a máscara funcionar na tela

    // Limpa a string para ter apenas números
    const cepLimpo = novoCep.replace(/\D/g, "");

    // Só faz a busca se o CEP estiver completo (8 dígitos)
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`,
        );
        const data = await response.json();

        // Se a API não retornar erro, preenche os campos automaticamente
        if (!data.erro) {
          setLogradouro(data.logradouro || "");
          setBairro(data.bairro || "");
          setCidade(data.localidade || "");
          setUf(data.uf || "");

          // Opcional: Você pode colocar o foco no campo "Número" automaticamente aqui se quiser,
          // mas só o preenchimento já adianta muito!
        }
      } catch (err) {
        console.error("Erro ao buscar o CEP:", err);
      }
    }
  };

  // 2. Aplique no map das suas opçõe

  const AVAILABLE_PERMISSIONS = [
    { id: "admin", label: "Administrador (Acesso Total)" },
    { id: "dashboard", label: "Visualizar Dashboard e Vendas" },
    { id: "metas", label: "Gerenciar Metas" },
    { id: "leads", label: "Gerenciar Leads e Oportunidades" },
    { id: "dtc", label: "Acesso Módulo DTC" },
    { id: "rh", label: "Recursos Humanos" },
  ];

  useEffect(() => {
    if (show) {
      setError(null);
    }
  }, [show]);

  // 1. Busca as UFs ao carregar o componente
  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome",
    )
      .then((response) => response.json())
      .then((data) => setUfs(data))
      .catch((err) => console.error("Erro ao buscar UFs:", err));
  }, []);

  // 2. Busca as Cidades sempre que a UF selecionada mudar
  useEffect(() => {
    if (!ufNatal) {
      setCidades([]); // Limpa a lista de cidades se a UF ficar vazia
      return;
    }

    // Busca apenas os municípios daquela UF
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufNatal}/municipios?orderBy=nome`,
    )
      .then((response) => response.json())
      .then((data) => setCidades(data))
      .catch((err) => console.error("Erro ao buscar cidades:", err));
  }, [ufNatal]);

  // Populate form when employeeToEdit is provided
  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.nome_completo || "");
      setEmail(employeeToEdit.email || "");
      setContact(employeeToEdit.contato || "");
      setCargoId(employeeToEdit.cargo_id || "");
      setSetorId(employeeToEdit.setor_id || "");
      setGestorId(employeeToEdit.gestor_id || "");
      setUnidadeId(employeeToEdit.unidade_id || "");
      setPermissions(
        employeeToEdit.privilegios
          ? employeeToEdit.privilegios.split(",")
          : ["dashboard"],
      );
      setSelectedBeneficios(
        employeeToEdit.beneficios_atribuidos?.map((b) => b.beneficio_id) || [],
      ); // 🚀 Popula benefícios
      setSelectedFabricantes(employeeToEdit.fabricantes_ids || []);
      setSelectedVerticais(employeeToEdit.verticais_ids || []);
      setSelectedSubgrupos(employeeToEdit.subgrupos_ids || []);
      setCnhNumero(employeeToEdit.cnh_numero || "");
      setCnhValidade(
        employeeToEdit.cnh_validade
          ? employeeToEdit.cnh_validade.split("T")[0]
          : "",
      );
      setNomeSocial(employeeToEdit.nome_social || "");
      setEmailPessoal(employeeToEdit.email_pessoal || "");
      setTimeId(employeeToEdit.time_id || "");
      setCentroCustoId(employeeToEdit.centro_custo_id || "");
      setVinculo(employeeToEdit.vinculo || "");
      setSalario(employeeToEdit.salario || "");
      setDataAdmissao(
        employeeToEdit.data_admissao
          ? employeeToEdit.data_admissao.split("T")[0]
          : "",
      );
      setCategoriaTrabalhador(employeeToEdit.categoria_trabalhador || "");
      setPeriodoExperiencia(employeeToEdit.periodo_experiencia || "");
      setJornadaTrabalho(employeeToEdit.jornada_trabalho || "");
      setHorasMensais(employeeToEdit.horas_mensais || "");
      setPrimeiroEmprego(employeeToEdit.primeiro_emprego || false);

      // Campos profissionais
      setMatricula(employeeToEdit.matricula || "");
      setNumeroCracha(employeeToEdit.numero_cracha || "");
      setTipoAdmissao(employeeToEdit.tipo_admissao || "");
      setDataExameAdmissional(
        employeeToEdit.data_exame_admissional
          ? employeeToEdit.data_exame_admissional.split("T")[0]
          : "",
      );
      setTipoSalario(employeeToEdit.tipo_salario || "");
      setFormaPagamento(employeeToEdit.forma_pagamento || "");
      setSalarioValidoAPartir(
        employeeToEdit.salario_valido_a_partir
          ? employeeToEdit.salario_valido_a_partir.split("T")[0]
          : "",
      );
      setMotivoAjusteSalarial(employeeToEdit.motivo_ajuste_salarial || "");
      setDescricaoSalarial(employeeToEdit.descricao_salarial || "");
      setPossuiRegistroPonto(employeeToEdit.possui_registro_ponto ?? true);
      setHoraContratual(employeeToEdit.hora_contratual || "");
      setTipoJornada(employeeToEdit.tipo_jornada || "");
      setRegimeJornada(employeeToEdit.regime_jornada || "");
      setTipoHorario(employeeToEdit.tipo_horario || "");
      setHoraNoturna(employeeToEdit.hora_noturna || false);
      setSindicato(employeeToEdit.sindicato || "");
      setContribuicaoSindical(employeeToEdit.contribuicao_sindical || false);
      setEstabilidade(employeeToEdit.estabilidade || "");
      setCargoConfianca(employeeToEdit.cargo_confianca || false);
      setTemSeguroDesemprego(employeeToEdit.tem_seguro_desemprego || false);
      setAposentado(employeeToEdit.aposentado || false);
      setTerminoExperiencia(
        employeeToEdit.termino_experiencia
          ? employeeToEdit.termino_experiencia.split("T")[0]
          : "",
      );
      setInscricaoOrgaoClasse(employeeToEdit.inscricao_orgao_classe || "");
      setConselhoProfissional(employeeToEdit.conselho_profissional || "");
      setCipa(employeeToEdit.cipa || false);
      setTipoRegimePrevidenciario(
        employeeToEdit.tipo_regime_previdenciario || "",
      );
      setNaturezaAtividade(employeeToEdit.natureza_atividade || "");
      setIndicativoAdmissao(employeeToEdit.indicativo_admissao || "");
      setPreencheCotaPcd(employeeToEdit.preenche_cota_pcd || false);
      setAgenteNocivo(employeeToEdit.agente_nocivo || "");
      setOptanteFgts(employeeToEdit.optante_fgts ?? true);
      setPossuiImovelProprio(employeeToEdit.possui_imovel_proprio || false);
      setImovelAdquiridoFgts(employeeToEdit.imovel_adquirido_fgts || false);

      // Dados Pessoais
      setCpf(employeeToEdit.cpf || "");
      setDataNascimento(
        employeeToEdit.data_nascimento
          ? employeeToEdit.data_nascimento.split("T")[0]
          : "",
      );
      setNacionalidade(employeeToEdit.nacionalidade || "");
      setUfNatal(employeeToEdit.uf_natal || "");
      setCidadeNatal(employeeToEdit.cidade_natal || "");
      setCorRaca(employeeToEdit.cor_raca || "");
      setGenero(employeeToEdit.genero || "");
      setGeneroDocumento(employeeToEdit.genero_documento || "");
      setEstadoCivil(employeeToEdit.estado_civil || "");
      setNomeMae(employeeToEdit.nome_mae || "");
      setNomePai(employeeToEdit.nome_pai || "");
      setTamanhoCalcado(employeeToEdit.tamanho_calcado || "");
      setTamanhoCamiseta(employeeToEdit.tamanho_camiseta || "");
      setCep(employeeToEdit.cep || "");
      setLogradouro(employeeToEdit.logradouro || "");
      setNumero(employeeToEdit.numero || "");
      setComplemento(employeeToEdit.complemento || "");
      setBairro(employeeToEdit.bairro || "");
      setCidade(employeeToEdit.cidade || "");
      setUf(employeeToEdit.uf || "");
      setBanco(employeeToEdit.banco || "");
      setTipoContaBancaria(employeeToEdit.tipo_conta_bancaria || "");
      setAgencia(employeeToEdit.agencia || "");
      setConta(employeeToEdit.conta || "");
      setChavePixTipo(employeeToEdit.chave_pix_tipo || "");
      setChavePix(employeeToEdit.chave_pix || "");
      setContatoEmergenciaNome(employeeToEdit.contato_emergencia_nome || "");
      setContatoEmergenciaParentesco(
        employeeToEdit.contato_emergencia_parentesco || "",
      );
      setContatoEmergenciaTelefone(
        employeeToEdit.contato_emergencia_telefone || "",
      );
      setPcd(employeeToEdit.pcd || false);
      setPcdTipo(employeeToEdit.pcd_tipo || "");
      setPcdObservacoes(employeeToEdit.pcd_observacoes || "");

      // Documentos
      setNumeroCtps(employeeToEdit.numero_ctps || "");
      setSerieCtps(employeeToEdit.serie_ctps || "");
      setDataEmissaoCtps(
        employeeToEdit.data_emissao_ctps
          ? employeeToEdit.data_emissao_ctps.split("T")[0]
          : "",
      );
      setUfEmissorCtps(employeeToEdit.uf_emissor_ctps || "");
      setPis(employeeToEdit.pis || "");
      setRgNumero(employeeToEdit.rg_numero || "");
      setRgDataEmissao(
        employeeToEdit.rg_data_emissao
          ? employeeToEdit.rg_data_emissao.split("T")[0]
          : "",
      );
      setRgOrgaoEmissor(employeeToEdit.rg_orgao_emissor || "");
      setRgUfEmissor(employeeToEdit.rg_uf_emissor || "");
      setReservistaNumero(employeeToEdit.reservista_numero || "");
      setReservistaRa(employeeToEdit.reservista_ra || "");
      setReservistaCategoria(employeeToEdit.reservista_categoria || "");
      setCnhDataEmissao(
        employeeToEdit.cnh_data_emissao
          ? employeeToEdit.cnh_data_emissao.split("T")[0]
          : "",
      );
      setCnhCategoria(employeeToEdit.cnh_categoria || "");
      setTituloEleitorNumero(employeeToEdit.titulo_eleitor_numero || "");
      setTituloEleitorZona(employeeToEdit.titulo_eleitor_zona || "");
      setTituloEleitorSecao(employeeToEdit.titulo_eleitor_secao || "");

      setUserpicFile(null);
      setUserpicPreview("");
      setExistingUserpicUrl(employeeToEdit.userpic_url || "");
    } else {
      // Reset form for new employee
      resetForm();
    }
  }, [employeeToEdit]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setContact("");
    setCargoId("");
    setSetorId("");
    setUnidadeId("");
    setGestorId("");
    setPermissions(["dashboard"]);
    setSelectedFabricantes([]);
    setSelectedVerticais([]);
    setSelectedSubgrupos([]);
    setCnhNumero("");
    setCnhValidade("");
    setSelectedBeneficios([]); // 🚀 Limpa benefícios
    setUserpicFile(null);
    setUserpicPreview("");
    setNomeSocial("");
    setEmailPessoal("");
    setTimeId("");
    setCentroCustoId("");
    setVinculo("");
    setSalario("");
    setDataAdmissao("");
    setCategoriaTrabalhador("");
    setPeriodoExperiencia("");
    setJornadaTrabalho("");
    setHorasMensais("");
    setPrimeiroEmprego(false);
    setProcessoAdmissao("preencher");
    setSenha("");

    // Reset campos profissionais
    setMatricula("");
    setNumeroCracha("");
    setTipoAdmissao("");
    setDataExameAdmissional("");
    setTipoSalario("");
    setFormaPagamento("");
    setSalarioValidoAPartir("");
    setMotivoAjusteSalarial("");
    setDescricaoSalarial("");
    setPossuiRegistroPonto(true);
    setHoraContratual("");
    setTipoJornada("");
    setRegimeJornada("");
    setTipoHorario("");
    setHoraNoturna(false);
    setSindicato("");
    setContribuicaoSindical(false);
    setEstabilidade("");
    setCargoConfianca(false);
    setTemSeguroDesemprego(false);
    setAposentado(false);
    setTerminoExperiencia("");
    setHorarioTrabalhoDetalhado("");
    setDescansoSemanalRemunerado("");
    setInscricaoOrgaoClasse("");
    setConselhoProfissional("");
    setCipa(false);
    setTipoRegimePrevidenciario("");
    setNaturezaAtividade("");
    setIndicativoAdmissao("");
    setPreencheCotaPcd(false);
    setAgenteNocivo("");
    setOptanteFgts(true);
    setPossuiImovelProprio(false);
    setImovelAdquiridoFgts(false);

    // Reset Dados Pessoais
    setCpf("");
    setDataNascimento("");
    setNacionalidade("");
    setUfNatal("");
    setCidadeNatal("");
    setCorRaca("");
    setGenero("");
    setGeneroDocumento("");
    setEstadoCivil("");
    setNomeMae("");
    setNomePai("");
    setTamanhoCalcado("");
    setTamanhoCamiseta("");
    setCep("");
    setLogradouro("");
    setNumero("");
    setComplemento("");
    setBairro("");
    setCidade("");
    setUf("");
    setBanco("");
    setTipoContaBancaria("");
    setAgencia("");
    setConta("");
    setChavePixTipo("");
    setChavePix("");
    setContatoEmergenciaNome("");
    setContatoEmergenciaParentesco("");
    setContatoEmergenciaTelefone("");
    setPcd(false);
    setPcdTipo("");
    setPcdObservacoes("");

    // Reset Documentos
    setNumeroCtps("");
    setSerieCtps("");
    setDataEmissaoCtps("");
    setUfEmissorCtps("");
    setPis("");
    setRgNumero("");
    setRgDataEmissao("");
    setRgOrgaoEmissor("");
    setRgUfEmissor("");
    setReservistaNumero("");
    setReservistaRa("");
    setReservistaCategoria("");
    setCnhDataEmissao("");
    setCnhCategoria("");
    setTituloEleitorNumero("");
    setTituloEleitorZona("");
    setTituloEleitorSecao("");

    setMotivoJornada("");
    setObservacaoJornada("");

    setExistingUserpicUrl("");
    setError(null);
    setSearchSubgrupo("");
    setShowSubgrupoDropdown(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserpicFile(file);
      setUserpicPreview(URL.createObjectURL(file));
    }
  };
  const formatarParaNomeProprio = (texto) => {
    if (!texto) return "";
    return texto
      .toLowerCase() // Transforma tudo em minúsculo primeiro
      .split(" ") // Divide o texto em um array de palavras
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Maiúscula na primeira letra
      .join(" "); // Junta de volta em uma string
  };

  const formatarParaCapitalizado = (texto) => {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!name || !email || !setorId) {
      setError("Nome, e-mail e setor são obrigatórios.");
      return;
    }

    const nomeFormatado = formatarParaNomeProprio(name);
    const nomeMaeFormatado = formatarParaNomeProprio(nomeMae);
    const nomePaiFormatado = formatarParaNomeProprio(nomePai);

    const emailFormatado = formatarParaCapitalizado(email);
    const nomeSocialFormatado = formatarParaCapitalizado(nomeSocial);
    const emailPessoalFormatado = formatarParaCapitalizado(emailPessoal);
    const vinculoFormatado = formatarParaCapitalizado(vinculo);
    const salarioFormatado = formatarParaCapitalizado(salario);
    const dataAdmissaoFormatada = formatarParaCapitalizado(dataAdmissao);
    const categoriaTrabalhadorFormatada =
      formatarParaCapitalizado(categoriaTrabalhador);
    const periodoExperienciaFormatado =
      formatarParaCapitalizado(periodoExperiencia);
    const jornadaTrabalhoFormatada = formatarParaCapitalizado(jornadaTrabalho);
    const horasMensaisFormatada = formatarParaCapitalizado(horasMensais);
    const primeiroEmpregoFormatado = formatarParaCapitalizado(primeiroEmprego);
    const processoAdmissaoFormatado =
      formatarParaCapitalizado(processoAdmissao);

    const formData = new FormData();
    formData.append("nome_completo", name);
    formData.append("email", email);
    formData.append("nome_social", nomeSocial);
    formData.append("email_pessoal", emailPessoal);
    if (timeId) formData.append("time_id", timeId);
    if (centroCustoId) formData.append("centro_custo_id", centroCustoId);
    formData.append("vinculo", vinculo);
    formData.append("salario", salario);
    formData.append("data_admissao", dataAdmissao);
    formData.append("categoria_trabalhador", categoriaTrabalhador);
    formData.append("periodo_experiencia", periodoExperiencia);
    formData.append("jornada_trabalho", jornadaTrabalho);
    formData.append("horas_mensais", horasMensais);
    formData.append("primeiro_emprego", primeiroEmprego);
    formData.append("processo_admissao", processoAdmissao);

    // Append campos profissionais
    formData.append("matricula", matricula);
    formData.append("numero_cracha", numeroCracha);
    formData.append("tipo_admissao", tipoAdmissao);
    formData.append("data_exame_admissional", dataExameAdmissional);
    formData.append("tipo_salario", tipoSalario);
    formData.append("forma_pagamento", formaPagamento);
    formData.append("salario_valido_a_partir", salarioValidoAPartir);
    formData.append("motivo_ajuste_salarial", motivoAjusteSalarial);
    formData.append("descricao_salarial", descricaoSalarial);
    formData.append("possui_registro_ponto", possuiRegistroPonto);
    formData.append("hora_contratual", horaContratual);
    formData.append("tipo_jornada", tipoJornada);
    formData.append("regime_jornada", regimeJornada);
    formData.append("tipo_horario", tipoHorario);
    formData.append("hora_noturna", horaNoturna);
    formData.append("sindicato", sindicato);
    formData.append("contribuicao_sindical", contribuicaoSindical);
    formData.append("estabilidade", estabilidade);
    formData.append("cargo_confianca", cargoConfianca);
    formData.append("tem_seguro_desemprego", temSeguroDesemprego);
    formData.append("aposentado", aposentado);
    formData.append("termino_experiencia", terminoExperiencia);
    formData.append("inscricao_orgao_classe", inscricaoOrgaoClasse);
    formData.append("conselho_profissional", conselhoProfissional);
    formData.append("cipa", cipa);
    formData.append("tipo_regime_previdenciario", tipoRegimePrevidenciario);
    formData.append("natureza_atividade", naturezaAtividade);
    formData.append("indicativo_admissao", indicativoAdmissao);
    formData.append("preenche_cota_pcd", preencheCotaPcd);
    formData.append("agente_nocivo", agenteNocivo);
    formData.append("optante_fgts", optanteFgts);
    formData.append("possui_imovel_proprio", possuiImovelProprio);
    formData.append("imovel_adquirido_fgts", imovelAdquiridoFgts);
    if (senha) formData.append("senha", senha);

    // Dados Pessoais
    formData.append("cpf", cpf);
    formData.append("data_nascimento", dataNascimento);
    formData.append("nacionalidade", nacionalidade);
    formData.append("uf_natal", ufNatal);
    formData.append("cidade_natal", cidadeNatal);
    formData.append("cor_raca", corRaca);
    formData.append("genero", genero);
    formData.append("genero_documento", generoDocumento);
    formData.append("estado_civil", estadoCivil);
    formData.append("nome_mae", nomeMae);
    formData.append("nome_pai", nomePai);
    formData.append("tamanho_calcado", tamanhoCalcado);
    formData.append("tamanho_camiseta", tamanhoCamiseta);
    formData.append("cep", cep);
    formData.append("logradouro", logradouro);
    formData.append("numero", numero);
    formData.append("complemento", complemento);
    formData.append("bairro", bairro);
    formData.append("cidade", cidade);
    formData.append("uf", uf);
    formData.append("banco", banco);
    formData.append("tipo_conta_bancaria", tipoContaBancaria);
    formData.append("agencia", agencia);
    formData.append("conta", conta);
    formData.append("chave_pix_tipo", chavePixTipo);
    formData.append("chave_pix", chavePix);
    formData.append("contato_emergencia_nome", contatoEmergenciaNome);
    formData.append(
      "contato_emergencia_parentesco",
      contatoEmergenciaParentesco,
    );
    formData.append("contato_emergencia_telefone", contatoEmergenciaTelefone);
    formData.append("pcd", pcd);
    formData.append("pcd_tipo", pcdTipo);
    formData.append("pcd_observacoes", pcdObservacoes);

    // Documentos
    formData.append("numero_ctps", numero_ctps);
    formData.append("serie_ctps", serie_ctps);
    formData.append("data_emissao_ctps", data_emissao_ctps);
    formData.append("uf_emissor_ctps", uf_emissor_ctps);
    formData.append("pis", pis);
    formData.append("rg_numero", rg_numero);
    formData.append("rg_data_emissao", rg_data_emissao);
    formData.append("rg_orgao_emissor", rg_orgao_emissor);
    formData.append("rg_uf_emissor", rg_uf_emissor);
    formData.append("reservista_numero", reservista_numero);
    formData.append("reservista_ra", reservista_ra);
    formData.append("reservista_categoria", reservista_categoria);
    formData.append("cnh_data_emissao", cnh_data_emissao);
    formData.append("cnh_categoria", cnh_categoria);
    formData.append("titulo_eleitor_numero", titulo_eleitor_numero);
    formData.append("titulo_eleitor_zona", titulo_eleitor_zona);
    formData.append("titulo_eleitor_secao", titulo_eleitor_secao);

    if (contact) formData.append("contato", contact.replace(/\D/g, ""));
    if (setorId) formData.append("setor_id", setorId);
    if (cargoId) formData.append("cargo_id", cargoId);
    formData.append("privilegios", permissions.join(",") || "usuario");
    if (gestorId) formData.append("gestor_id", gestorId);
    if (unidadeId) formData.append("unidade_id", unidadeId);
    if (cnhNumero) formData.append("cnh_numero", cnhNumero);
    if (cnhValidade) formData.append("cnh_validade", cnhValidade);

    if (selectedFabricantes?.length > 0)
      formData.append("fabricantes_ids", JSON.stringify(selectedFabricantes));
    if (selectedVerticais?.length > 0)
      formData.append("verticais_ids", JSON.stringify(selectedVerticais));
    if (selectedBeneficios?.length > 0)
      formData.append("beneficios_ids", JSON.stringify(selectedBeneficios)); // 🚀 Envia benefícios
    if (selectedSubgrupos?.length > 0)
      formData.append("subgrupos_ids", JSON.stringify(selectedSubgrupos));

    if (userpicFile) {
      formData.append("userpic_file", userpicFile);
    } else if (employeeToEdit && !existingUserpicUrl) {
      // Se a foto existente foi removida (existingUserpicUrl está vazia),
      // enviamos um valor vazio para o backend saber que deve apagar a referência.
      // Se a foto não foi tocada, não enviamos nada e o backend manterá a atual.
      formData.append("userpic_url", "");
    }

    const config = { headers: { "Content-Type": "multipart/form-data" } };

    try {
      if (employeeToEdit) {
        await apiClient.put(
          `/api/funcionarios/${employeeToEdit.id}`,
          formData,
          config,
        );
      } else {
        await apiClient.post("/api/funcionarios", formData, config);
      }
      onSaveSuccess();
      handleClose();
    } catch (err) {
      console.error("Erro ao salvar funcionário:", err);
      setError(
        err.response?.data?.error || "Ocorreu um erro inesperado ao salvar.",
      );
    }
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const availableSubgrupos = (subgrupos || []).filter((sub) => {
    if (!setorId) return true;
    return String(sub.setor_id) === String(setorId);
  });

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          {employeeToEdit ? "Editar Colaborador" : "Adicionar Novo Colaborador"}
        </Modal.Title>
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
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nome Completo*</Form.Label>
                          <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nome Social</Form.Label>
                          <Form.Control
                            type="text"
                            value={nomeSocial}
                            onChange={(e) => setNomeSocial(e.target.value)}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>E-mail Pessoal*</Form.Label>
                          <Form.Control
                            type="email"
                            value={emailPessoal}
                            onChange={(e) => setEmailPessoal(e.target.value)}
                            required
                            autoComplete="off"
                            data-lpignore="true"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Celular</Form.Label>
                          <IMaskInput
                            mask="(00) 00000-0000"
                            value={contact}
                            onAccept={(value) => setContact(value)}
                            className="form-control"
                            placeholder="(99) 99999-9999"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>CPF</Form.Label>
                          <IMaskInput
                            mask="000.000.000-00"
                            value={cpf}
                            onAccept={(value) => setCpf(value)}
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Data de Nascimento</Form.Label>
                          <Form.Control
                            type="date"
                            value={dataNascimento}
                            onChange={(e) => setDataNascimento(e.target.value)}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Estado Civil</Form.Label>
                          <Form.Select
                            type="text"
                            value={estadoCivil}
                            onChange={(e) => setEstadoCivil(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="Solteiro(a)">Solteiro(a)</option>
                            <option value="Casado">Casado(a)</option>
                            <option value="Divorciado">Divorciado(a)</option>
                            <option value="Viuvo">Viuvo(a)</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nacionalidade</Form.Label>
                          <Form.Select
                            type="text"
                            value={nacionalidade}
                            onChange={(e) => setNacionalidade(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="Brasileiro">Brasileiro(a)</option>
                            <option value="Estrangeiro">Estrangeiro(a)</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>UF Natal</Form.Label>
                          <Form.Select
                            value={ufNatal}
                            onChange={(e) => {
                              setUfNatal(e.target.value);
                              setCidadeNatal("");
                            }} // Reseta a cidade sempre que o Estado mudar
                          >
                            {" "}
                            <option value="">Selecione a UF...</option>
                            {ufs.map((uf) => (
                              <option key={uf.id} value={uf.sigla}>
                                {uf.sigla} - {uf.nome}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Cidade Natal</Form.Label>
                          <Form.Select
                            value={cidadeNatal}
                            onChange={(e) => setCidadeNatal(e.target.value)}
                            disabled={!ufNatal || cidades.length === 0} // Trava se não houver UF
                          >
                            <option value="">Selecione a Cidade...</option>
                            {cidades.map((cidade) => (
                              <option key={cidade.id} value={cidade.nome}>
                                {cidade.nome}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      {/* Campo 1: Identidade de Gênero (Inclusivo) */}
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Gênero (Identidade)</Form.Label>
                          <Form.Select
                            value={genero}
                            onChange={(e) => setGenero(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="Mulher">Mulher</option>
                            <option value="Homem">Homem</option>
                            <option value="Nao-binario">Não-binário</option>
                            <option value="Nao informado">
                              Prefiro não informar
                            </option>
                            <option value="Outro">Outro</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      {/* Campo 2: Gênero no Documento (Obrigatório para e-Social) */}
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Sexo (Documento / e-Social)</Form.Label>
                          <Form.Select
                            value={generoDocumento}
                            onChange={(e) => setGeneroDocumento(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                          </Form.Select>
                          {/* Uma pequena ajuda visual para quem está preenchendo entender o porquê deste campo existir */}
                          <Form.Text
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Necessário para fins legais e e-Social.
                          </Form.Text>
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Cor/Raça</Form.Label>
                          <Form.Select
                            value={corRaca}
                            onChange={(e) => setCorRaca(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="Branca">Branca</option>
                            <option value="Preta">Preta</option>
                            <option value="Parda">Parda</option>
                            <option value="Amarela">Amarela</option>
                            <option value="Indigena">Indigena</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nome da Mãe</Form.Label>
                          <Form.Control
                            type="text"
                            value={nomeMae}
                            onChange={(e) => setNomeMae(e.target.value)}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nome do Pai</Form.Label>
                          <Form.Control
                            type="text"
                            value={nomePai}
                            onChange={(e) => setNomePai(e.target.value)}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Foto do Perfil</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        {(userpicPreview || existingUserpicUrl) && (
                          <div className="mt-2 text-center">
                            <img
                              src={userpicPreview || existingUserpicUrl}
                              alt="Preview"
                              className="rounded-circle shadow-sm"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                              }}
                            />
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setUserpicFile(null);
                                setUserpicPreview("");
                                setExistingUserpicUrl("");
                              }}
                            >
                              Remover Foto
                            </Button>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Header className="fw-bold">
                    Dados Corporativos
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>E-mail Profissional*</Form.Label>
                          <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Filial*</Form.Label>
                          <Form.Select
                            value={unidadeId}
                            onChange={(e) => setUnidadeId(e.target.value)}
                          >
                            <option value="">Selecione</option>
                            {(unidades || []).map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.nome_unidade}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Pessoa Gestora*</Form.Label>
                          <Form.Select
                            value={gestorId}
                            onChange={(e) => setGestorId(e.target.value)}
                          >
                            <option value="">Ninguém</option>
                            {(employees || [])
                              .filter(
                                (emp) =>
                                  !employeeToEdit ||
                                  emp.id !== employeeToEdit.id,
                              )
                              .map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {formatarParaNomeProprio(emp.nome_completo)}
                                </option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Departamento*</Form.Label>
                          <Form.Select
                            value={setorId}
                            onChange={(e) => setSetorId(e.target.value)}
                            required
                          >
                            <option value="">Selecione</option>
                            {(setores || []).map((s) => (
                              <option key={s.id} value={s.id}>
                                {formatarParaNomeProprio(s.nome_setor)}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Time*</Form.Label>
                          <Form.Select
                            className="w-full md:w-14rem text-transform: capitalize;"
                            value={timeId}
                            onChange={(e) =>
                              setTimeId(formatarParaNomeProprio(e.target.value))
                            }
                          >
                            <option value="">Nenhum</option>
                            {(timesList || []).map((t) => (
                              <option key={t.id} value={t.id}>
                                {formatarParaNomeProprio(t.nome)}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Cargo*</Form.Label>
                          <Form.Select
                            value={cargoId}
                            onChange={(e) => setCargoId(e.target.value)}
                            required
                          >
                            <option value="">Selecione</option>
                            {(cargos || []).map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.nome_cargo}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Centro de Custo*</Form.Label>
                          <Form.Select
                            value={centroCustoId}
                            onChange={(e) => setCentroCustoId(e.target.value)}
                            required
                          >
                            <option value="">Selecione</option>
                            {(centrosCusto || []).map((cc) => (
                              <option key={cc.id} value={cc.id}>
                                {cc.nome}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Label>Senha de Acesso Local</Form.Label>
                        <Form.Control
                          type="password"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          placeholder={
                            employeeToEdit
                              ? "Preencha apenas se quiser alterar a senha atual"
                              : "Padrão: 123456"
                          }
                        />
                        <Form.Text className="text-muted">
                          A senha será criptografada automaticamente ao salvar.
                        </Form.Text>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Header className="fw-bold">
                    Contrato e Remuneração
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Vínculo</Form.Label>
                          <Form.Select
                            value={vinculo}
                            onChange={(e) => setVinculo(e.target.value)}
                          >
                            <option value="">Selecione</option>
                            <option>CLT</option>
                            <option>Sócio</option>
                            <option>Diretor Estatutário</option>
                            <option>Estágio</option>
                            <option>Aprendiz</option>
                            <option>Pessoa Jurídica</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Salário (R$)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={salario}
                            onChange={(e) => setSalario(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Data de Admissão</Form.Label>
                          <Form.Control
                            type="date"
                            value={dataAdmissao}
                            onChange={(e) => setDataAdmissao(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Período de Experiência</Form.Label>
                          <Form.Select
                            value={periodoExperiencia}
                            onChange={(e) =>
                              setPeriodoExperiencia(e.target.value)
                            }
                          >
                            <option value="">Selecione</option>
                            <option>Sem período de experiência</option>
                            <option>1 x 45 dias</option>
                            <option>2 x 45 dias</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Jornada de Trabalho</Form.Label>
                          <Form.Select
                            value={jornadaTrabalho}
                            onChange={(e) => setJornadaTrabalho(e.target.value)}
                          >
                            <option value="">Nenhum</option>
                            <option>44 horas semanais</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Horas Mensais</Form.Label>
                          <Form.Control
                            type="number"
                            value={horasMensais}
                            onChange={(e) => setHorasMensais(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Check
                          type="switch"
                          id="primeiro-emprego-switch"
                          label="Primeiro emprego?"
                          checked={primeiroEmprego}
                          onChange={(e) => setPrimeiroEmprego(e.target.checked)}
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Header className="fw-bold">Endereço</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>CEP</Form.Label>
                          <IMaskInput
                            mask="00000-000"
                            value={cep}
                            onAccept={handleCepChange}
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={8}>
                        <Form.Group className="mb-3">
                          <Form.Label>Logradouro</Form.Label>
                          <Form.Control
                            type="text"
                            value={logradouro}
                            onChange={(e) => setLogradouro(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Número</Form.Label>
                          <Form.Control
                            type="text"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={8}>
                        <Form.Group className="mb-3">
                          <Form.Label>Complemento</Form.Label>
                          <Form.Control
                            type="text"
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group className="mb-3">
                          <Form.Label>Bairro</Form.Label>
                          <Form.Control
                            type="text"
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group className="mb-3">
                          <Form.Label>Cidade</Form.Label>
                          <Form.Control
                            type="text"
                            value={cidade}
                            onChange={(e) => setCidade(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>UF</Form.Label>
                          <Form.Control
                            type="text"
                            maxLength="2"
                            value={uf}
                            onChange={(e) => setUf(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Header className="fw-bold">Dados Bancários</Card.Header>
                  <Card.Body>
                    <Row>
                      {/* 1. Banco Padronizado */}
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Banco</Form.Label>
                          <Form.Select
                            value={banco}
                            onChange={(e) => setBanco(e.target.value)}
                          >
                            <option value="">Selecione o Banco...</option>
                            <option value="001 - Banco do Brasil">
                              001 - Banco do Brasil
                            </option>
                            <option value="104 - Caixa Econômica Federal">
                              104 - Caixa Econômica Federal
                            </option>
                            <option value="341 - Itaú Unibanco">
                              341 - Itaú Unibanco
                            </option>
                            <option value="237 - Bradesco">
                              237 - Bradesco
                            </option>
                            <option value="033 - Santander">
                              033 - Santander
                            </option>
                            <option value="260 - Nubank">260 - Nubank</option>
                            <option value="077 - Banco Inter">
                              077 - Banco Inter
                            </option>
                            <option value="336 - C6 Bank">336 - C6 Bank</option>
                            <option value="074 - Banco Safra">
                              074 - Banco Safra
                            </option>
                            <option value="748 - Sicredi">748 - Sicredi</option>
                            <option value="756 - Sicoob">756 - Sicoob</option>
                            <option value="Outro">Outro</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      {/* 2. Tipo de Conta Padronizado */}
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tipo de Conta</Form.Label>
                          <Form.Select
                            value={tipoContaBancaria}
                            onChange={(e) =>
                              setTipoContaBancaria(e.target.value)
                            }
                          >
                            <option value="">Selecione...</option>
                            <option value="Conta Corrente">
                              Conta Corrente
                            </option>
                            <option value="Conta Poupança">
                              Conta Poupança
                            </option>
                            <option value="Conta Salario">Conta Salário</option>
                            <option value="Conta de Pagamento">
                              Conta de Pagamento
                            </option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      {/* Agência e Conta continuam como texto, pois variam muito (ex: 1234-X) */}
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Agência</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Ex: 0001"
                            value={agencia}
                            onChange={(e) => setAgencia(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Conta (com dígito)</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Ex: 12345-6"
                            value={conta}
                            onChange={(e) => setConta(e.target.value)}
                          />
                        </Form.Group>
                      </Col>

                      {/* 3. Tipo Chave PIX Padronizado */}
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tipo Chave PIX</Form.Label>
                          <Form.Select
                            value={chavePixTipo}
                            onChange={(e) => setChavePixTipo(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="CPF">CPF</option>
                            <option value="CNPJ">CNPJ</option>
                            <option value="Celular">Celular</option>
                            <option value="E-mail">E-mail</option>
                            <option value="Chave Aleatoria">
                              Chave Aleatória
                            </option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      {/* A Chave PIX em si continua como texto para o usuário digitar */}
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Chave PIX</Form.Label>
                          <Form.Control
                            type="text"
                            value={chavePix}
                            onChange={(e) => setChavePix(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Header className="fw-bold">Outros</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Contato de Emergência (Nome)</Form.Label>
                          <Form.Control
                            type="text"
                            value={contatoEmergenciaNome}
                            onChange={(e) =>
                              setContatoEmergenciaNome(e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Contato de Emergência (Telefone)
                          </Form.Label>
                          <IMaskInput
                            mask="(00) 00000-0000"
                            value={contatoEmergenciaTelefone}
                            onAccept={(value) =>
                              setContatoEmergenciaTelefone(value)
                            }
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tamanho da Camiseta</Form.Label>
                          <Form.Select
                            value={tamanhoCamiseta}
                            onChange={(e) => setTamanhoCamiseta(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="PP">PP</option>
                            <option value="P">P</option>
                            <option value="M">M</option>
                            <option value="G">G</option>
                            <option value="GG">GG</option>
                            <option value="XG">XG</option>
                            <option value="XXG">XXG</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tamanho do Calçado</Form.Label>
                          <Form.Select
                            value={tamanhoCalcado}
                            onChange={(e) => setTamanhoCalcado(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="33">33</option>
                            <option value="34">34</option>
                            <option value="35">35</option>
                            <option value="36">36</option>
                            <option value="37">37</option>
                            <option value="38">38</option>
                            <option value="39">39</option>
                            <option value="40">40</option>
                            <option value="41">41</option>
                            <option value="42">42</option>
                            <option value="43">43</option>
                            <option value="44">44</option>
                            <option value="45">45</option>
                            <option value="46">46</option>
                            <option value="47">47</option>
                            <option value="48">48</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <hr />
                    <Row>
                      <Col md={12}>
                        <Form.Check
                          type="switch"
                          label="Pessoa com Deficiência (PCD)"
                          checked={pcd}
                          onChange={(e) => setPcd(e.target.checked)}
                        />
                      </Col>
                      {pcd && (
                        <>
                          <Col md={6}>
                            <Form.Group className="mt-3">
                              <Form.Label>Tipo de Deficiência</Form.Label>
                              <Form.Control
                                type="text"
                                value={pcdTipo}
                                onChange={(e) => setPcdTipo(e.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mt-3">
                              <Form.Label>Observações PCD</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={1}
                                value={pcdObservacoes}
                                onChange={(e) =>
                                  setPcdObservacoes(e.target.value)
                                }
                              />
                            </Form.Group>
                          </Col>
                        </>
                      )}
                    </Row>
                  </Card.Body>
                </Card>
              </div>
            </Tab>

            <Tab eventKey="profissional" title="Profissional">
              <div className="pt-3">
                <Card className="mb-4">
                  <Card.Header className="fw-bold">
                    Admissão e Empresa
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Matrícula</Form.Label>
                          <Form.Control
                            type="text"
                            value={matricula}
                            onChange={(e) => setMatricula(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nº Crachá</Form.Label>
                          <Form.Control
                            type="text"
                            value={numeroCracha}
                            onChange={(e) => setNumeroCracha(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tipo de Admissão</Form.Label>
                          <Form.Select
                            value={tipoAdmissao}
                            onChange={(e) => setTipoAdmissao(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="Admissão Normal">
                              Admissão Normal (Nova Contratação)
                            </option>
                            <option value="Transferência">
                              Transferência (Mesmo Grupo Econômico)
                            </option>
                            <option value="Reintegração">
                              Reintegração (Ordem Judicial/Outros)
                            </option>
                            <option value="Sucessão/Incorporação">
                              Sucessão ou Incorporação (Fusão de Empresas)
                            </option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Data Exame Admissional</Form.Label>
                          <Form.Control
                            type="date"
                            value={dataExameAdmissional}
                            onChange={(e) =>
                              setDataExameAdmissional(e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                <Card className="mb-4">
                  <Card.Header className="fw-bold">Remuneração</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tipo de Salário</Form.Label>
                          <Form.Select
                            value={tipoSalario}
                            onChange={(e) => setTipoSalario(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="Mensalista">Mensalista</option>
                            <option value="Horista">Horista</option>
                            <option value="Diarista">Diarista</option>
                            <option value="Semanalista">Semanalista</option>
                            <option value="Quinzenalista">Quinzenalista</option>
                            <option value="Tarefeiro">Tarefeiro</option>
                            <option value="Comissionista">Comissionista</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Forma de Pagamento</Form.Label>
                          <Form.Select
                            value={formaPagamento}
                            onChange={(e) => setFormaPagamento(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="Deposito Bancario">
                              Depósito Bancário (Conta)
                            </option>
                            <option value="Pix">Pix</option>
                            <option value="Dinheiro">Dinheiro</option>
                            <option value="Cheque">Cheque</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Salário Válido a Partir de</Form.Label>
                          <Form.Control
                            type="date"
                            value={salarioValidoAPartir}
                            onChange={(e) =>
                              setSalarioValidoAPartir(e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Motivo do Ajuste Salarial</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={motivoAjusteSalarial}
                            onChange={(e) =>
                              setMotivoAjusteSalarial(e.target.value)
                            }
                            placeholder="Ex: Promoção, Dissídio coletivo, Contratação inicial..."
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Descrição Salarial</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={descricaoSalarial}
                            onChange={(e) =>
                              setDescricaoSalarial(e.target.value)
                            }
                            placeholder="Ex: Salário base + 30% de periculosidade..."
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                <Card className="mb-4">
                  <Card.Header className="fw-bold">
                    Jornada e Informações Legais
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Sindicato</Form.Label>
                          <Form.Control
                            type="text"
                            value={sindicato}
                            onChange={(e) => setSindicato(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Estabilidade</Form.Label>
                          <Form.Control
                            type="text"
                            value={estabilidade}
                            onChange={(e) => setEstabilidade(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Término da Experiência</Form.Label>
                          <Form.Control
                            type="date"
                            value={terminoExperiencia}
                            onChange={(e) =>
                              setTerminoExperiencia(e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Check
                          type="switch"
                          label="Ponto Eletrônico"
                          checked={possuiRegistroPonto}
                          onChange={(e) =>
                            setPossuiRegistroPonto(e.target.checked)
                          }
                          className="mt-4"
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Check
                          type="switch"
                          label="Adic. Noturno"
                          checked={horaNoturna}
                          onChange={(e) => setHoraNoturna(e.target.checked)}
                          className="mt-4"
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Check
                          type="switch"
                          label="Contrib. Sindical"
                          checked={contribuicaoSindical}
                          onChange={(e) =>
                            setContribuicaoSindical(e.target.checked)
                          }
                          className="mt-4"
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Check
                          type="switch"
                          label="Cargo de Confiança"
                          checked={cargoConfianca}
                          onChange={(e) => setCargoConfianca(e.target.checked)}
                          className="mt-4"
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Check
                          type="switch"
                          label="Recebeu Seg. Desemprego"
                          checked={temSeguroDesemprego}
                          onChange={(e) =>
                            setTemSeguroDesemprego(e.target.checked)
                          }
                          className="mt-4"
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Check
                          type="switch"
                          label="Aposentado"
                          checked={aposentado}
                          onChange={(e) => setAposentado(e.target.checked)}
                          className="mt-4"
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Check
                          type="switch"
                          label="Membro CIPA"
                          checked={cipa}
                          onChange={(e) => setCipa(e.target.checked)}
                          className="mt-4"
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Check
                          type="switch"
                          label="Preenche Cota PCD"
                          checked={preencheCotaPcd}
                          onChange={(e) => setPreencheCotaPcd(e.target.checked)}
                          className="mt-4"
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Check
                          type="switch"
                          label="Optante FGTS"
                          checked={optanteFgts}
                          onChange={(e) => setOptanteFgts(e.target.checked)}
                          className="mt-4"
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Check
                          type="switch"
                          label="Possui Imóvel Próprio"
                          checked={possuiImovelProprio}
                          onChange={(e) =>
                            setPossuiImovelProprio(e.target.checked)
                          }
                          className="mt-4"
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Check
                          type="switch"
                          label="Imóvel Adquirido (FGTS)"
                          checked={imovelAdquiridoFgts}
                          onChange={(e) =>
                            setImovelAdquiridoFgts(e.target.checked)
                          }
                          className="mt-4"
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </div>
            </Tab>

            <Tab eventKey="documentos" title="Documentos">
              <div className="pt-3">
                <Card className="mb-4">
                  <Card.Header className="fw-bold">
                    Carteira de Trabalho (CTPS)
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Número</Form.Label>
                          <Form.Control
                            type="text"
                            value={numero_ctps}
                            onChange={(e) => setNumeroCtps(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Série</Form.Label>
                          <Form.Control
                            type="text"
                            value={serie_ctps}
                            onChange={(e) => setSerieCtps(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Data de Emissão</Form.Label>
                          <Form.Control
                            type="date"
                            value={data_emissao_ctps}
                            onChange={(e) => setDataEmissaoCtps(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>UF Emissor</Form.Label>
                          <Form.Control
                            type="text"
                            maxLength="2"
                            value={uf_emissor_ctps}
                            onChange={(e) =>
                              setUfEmissorCtps(e.target.value.toUpperCase())
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>PIS/PASEP</Form.Label>
                          <IMaskInput
                            mask="000.00000.00-0"
                            value={pis}
                            onAccept={(value) => setPis(value)}
                            className="form-control"
                            placeholder="000.00000.00-0"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                <Card className="mb-4">
                  <Card.Header className="fw-bold">
                    Registro Geral (RG)
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Número</Form.Label>
                          <Form.Control
                            type="text"
                            value={rg_numero}
                            onChange={(e) => setRgNumero(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Data de Emissão</Form.Label>
                          <Form.Control
                            type="date"
                            value={rg_data_emissao}
                            onChange={(e) => setRgDataEmissao(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Órgão Emissor</Form.Label>
                          <Form.Control
                            type="text"
                            value={rg_orgao_emissor}
                            onChange={(e) => setRgOrgaoEmissor(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                <Card className="mb-4">
                  <Card.Header className="fw-bold">
                    Título de Eleitor
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Número</Form.Label>
                          <IMaskInput
                            mask="0000.0000.0000"
                            value={titulo_eleitor_numero}
                            onAccept={(value) => setTituloEleitorNumero(value)}
                            className="form-control"
                            placeholder="0000.0000.0000"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Zona</Form.Label>
                          <Form.Control
                            type="text"
                            value={titulo_eleitor_zona}
                            onChange={(e) =>
                              setTituloEleitorZona(e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Seção</Form.Label>
                          <Form.Control
                            type="text"
                            value={titulo_eleitor_secao}
                            onChange={(e) =>
                              setTituloEleitorSecao(e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                <Card className="mb-4">
                  <Card.Header className="fw-bold">
                    Certificado de Reservista
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Número</Form.Label>
                          <Form.Control
                            type="text"
                            value={reservista_numero}
                            onChange={(e) =>
                              setReservistaNumero(e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>RA</Form.Label>
                          <Form.Control
                            type="text"
                            value={reservista_ra}
                            onChange={(e) => setReservistaRa(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Categoria</Form.Label>
                          <Form.Control
                            type="text"
                            value={reservista_categoria}
                            onChange={(e) =>
                              setReservistaCategoria(e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                <Card className="mb-4">
                  <Card.Header className="fw-bold">
                    Carteira de Motorista (CNH)
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Número</Form.Label>
                          <IMaskInput
                            mask="00000000000"
                            value={cnhNumero}
                            onAccept={(value) => setCnhNumero(value)}
                            className="form-control"
                            placeholder="00000000000"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Categoria</Form.Label>
                          <Form.Control
                            type="text"
                            value={cnh_categoria}
                            onChange={(e) => setCnhCategoria(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Data de Emissão</Form.Label>
                          <Form.Control
                            type="date"
                            value={cnh_data_emissao}
                            onChange={(e) => setCnhDataEmissao(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Validade</Form.Label>
                          <Form.Control
                            type="date"
                            value={cnhValidade}
                            onChange={(e) => setCnhValidade(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </div>
            </Tab>

            <Tab eventKey="acessos" title="Acessos e Responsabilidades">
              <div className="pt-3">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-muted small text-uppercase">
                    Permissões de Acesso ao Sistema
                  </Form.Label>
                  <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <Form.Check
                        key={perm.id}
                        type="checkbox"
                        id={`perm-${perm.id}`}
                        label={perm.label}
                        checked={permissions.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPermissions([...permissions, perm.id]);
                          } else {
                            setPermissions(
                              permissions.filter((p) => p !== perm.id),
                            );
                          }
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-muted small text-uppercase">
                    Marcas Representadas (DTC)
                  </Form.Label>
                  <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                    {(fabricantes || []).map((fab) => (
                      <Form.Check
                        key={fab.id}
                        type="checkbox"
                        id={`fab-${fab.id}`}
                        label={fab.name}
                        checked={selectedFabricantes.includes(fab.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFabricantes([
                              ...selectedFabricantes,
                              fab.id,
                            ]);
                          } else {
                            setSelectedFabricantes(
                              selectedFabricantes.filter((id) => id !== fab.id),
                            );
                          }
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-muted small text-uppercase">
                    Verticais DTC Representadas
                  </Form.Label>
                  <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                    {(verticais || []).map((vert) => (
                      <Form.Check
                        key={vert.id}
                        type="checkbox"
                        id={`vert-${vert.id}`}
                        label={vert.nome}
                        checked={selectedVerticais.includes(vert.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVerticais([
                              ...selectedVerticais,
                              vert.id,
                            ]);
                          } else {
                            setSelectedVerticais(
                              selectedVerticais.filter((id) => id !== vert.id),
                            );
                          }
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-4 position-relative">
                  <Form.Label className="fw-bold text-muted small text-uppercase">
                    Responsabilidade FAQ (Subgrupos)
                  </Form.Label>
                  <div className="mb-2 d-flex flex-wrap gap-2">
                    {selectedSubgrupos.length === 0 && (
                      <span className="text-muted small fst-italic">
                        Nenhum subgrupo atribuído.
                      </span>
                    )}
                    {selectedSubgrupos.map((id) => {
                      const sub = subgrupos.find((s) => s.id === id);
                      if (!sub) return null;
                      return (
                        <Badge
                          bg="primary"
                          key={id}
                          className="d-flex align-items-center p-2 shadow-sm"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {sub.nome}
                          <span
                            className="ms-2 ps-2 border-start border-light"
                            style={{ cursor: "pointer" }}
                            title="Remover"
                            onClick={() =>
                              setSelectedSubgrupos(
                                selectedSubgrupos.filter((sId) => sId !== id),
                              )
                            }
                          >
                            &times;
                          </span>
                        </Badge>
                      );
                    })}
                  </div>
                  <Form.Control
                    type="text"
                    className="shadow-sm"
                    placeholder="🔍 Digite para buscar uma categoria..."
                    value={searchSubgrupo}
                    onChange={(e) => setSearchSubgrupo(e.target.value)}
                    onFocus={() => setShowSubgrupoDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSubgrupoDropdown(false), 200)
                    } // Delay to allow click
                  />
                  {showSubgrupoDropdown && (
                    <div
                      className="dropdown-menu show shadow w-100"
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        position: "absolute",
                        zIndex: 1050,
                      }}
                    >
                      {availableSubgrupos.filter(
                        (sub) =>
                          !selectedSubgrupos.includes(sub.id) &&
                          sub.nome
                            .toLowerCase()
                            .includes(searchSubgrupo.toLowerCase()),
                      ).length > 0 ? (
                        availableSubgrupos
                          .filter(
                            (sub) =>
                              !selectedSubgrupos.includes(sub.id) &&
                              sub.nome
                                .toLowerCase()
                                .includes(searchSubgrupo.toLowerCase()),
                          )
                          .map((sub) => (
                            <button
                              key={`opt-${sub.id}`}
                              type="button"
                              className="dropdown-item py-2"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSelectedSubgrupos([
                                  ...selectedSubgrupos,
                                  sub.id,
                                ]);
                                setSearchSubgrupo("");
                                setShowSubgrupoDropdown(false);
                              }}
                            >
                              {sub.nome}
                            </button>
                          ))
                      ) : (
                        <span className="dropdown-item text-muted disabled">
                          Nenhuma categoria encontrada.
                        </span>
                      )}
                    </div>
                  )}
                  {availableSubgrupos.length === 0 && setorId && (
                    <Form.Text className="text-warning">
                      Nenhuma categoria cadastrada para o setor deste
                      colaborador.
                    </Form.Text>
                  )}
                </Form.Group>
              </div>
            </Tab>
          </Tabs>
          <hr />
          <Form.Group className="mt-4">
            <Form.Label className="fw-bold">
              Como deseja prosseguir com o processo?
            </Form.Label>
            <div>
              <Form.Check
                inline
                label="Preencher manualmente e admitir agora"
                name="processoAdmissao"
                type="radio"
                id="radio-preencher"
                value="preencher"
                checked={processoAdmissao === "preencher"}
                onChange={(e) => setProcessoAdmissao(e.target.value)}
              />
              <Form.Check
                inline
                label="Enviar para o colaborador preencher"
                name="processoAdmissao"
                type="radio"
                id="radio-enviar"
                value="enviar"
                checked={processoAdmissao === "enviar"}
                onChange={(e) => setProcessoAdmissao(e.target.value)}
              />
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary btn-sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="success btn-sm" type="submit">
            {employeeToEdit ? "Salvar Alterações" : "Adicionar Colaborador"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EmployeeEditModal;
