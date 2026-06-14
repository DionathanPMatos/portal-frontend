import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import { FaEdit, FaTrash, FaUserPlus, FaFileImport, FaBriefcase, FaSitemap, FaSearch, FaUserTimes, FaCog, FaFilter } from 'react-icons/fa';
import { Tabs, Tab } from 'react-bootstrap';
import { IMaskInput } from 'react-imask';
import CargosModal from './CargosModal';
import SetoresModal from './SetoresModal';
import UnidadesModal from './UnidadesModal.jsx';
import apiClient from '../../../services/api';
import ImportModal from '../components/ImportModal';

// A importação de '../../../App.jsx' foi removida.
// Estilos globais devem ser importados no arquivo de entrada principal da sua aplicação (ex: main.jsx ou index.js).

const ManageEmployees = ({ isLoggedIn }) => {
    const [employees, setEmployees] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [setores, setSetores] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [fabricantes, setFabricantes] = useState([]);
    const [verticais, setVerticais] = useState([]); // 🚀 Lista de Verticais
    const [subgrupos, setSubgrupos] = useState([]); // 🚀 Lista de Subgrupos FAQ
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isCargosModalOpen, setIsCargosModalOpen] = useState(false);
    const [isSetoresModalOpen, setIsSetoresModalOpen] = useState(false);
    const [isUnidadesModalOpen, setIsUnidadesModalOpen] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false); 
    const [filtroCargo, setFiltroCargo] = useState(''); 
    const [filtroSetor, setFiltroSetor] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados do formulário
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [cargoId, setCargoId] = useState('');
    const [setorId, setSetorId] = useState('');
    const [gestorId, setGestorId] = useState('');
    const [unidadeId, setUnidadeId] = useState('');
    const [permissions, setPermissions] = useState(['dashboard']);
    const [selectedFabricantes, setSelectedFabricantes] = useState([]);
    const [selectedVerticais, setSelectedVerticais] = useState([]); // 🚀 Selecionados
    const [selectedSubgrupos, setSelectedSubgrupos] = useState([]); // 🚀 Subgrupos selecionados
    
    // Estados para a Imagem
    const [userpicFile, setUserpicFile] = useState(null);
    const [existingUserpicUrl, setExistingUserpicUrl] = useState('');
    const [userpicPreview, setUserpicPreview] = useState(''); // Novo estado para a pré-visualização

    const [cnhNumero, setCnhNumero] = useState('');
    const [cnhValidade, setCnhValidade] = useState('');

    // Novos campos da Ficha de Admissão
    const [nomeSocial, setNomeSocial] = useState('');
    const [emailPessoal, setEmailPessoal] = useState('');
    const [time, setTime] = useState('');
    const [centroCusto, setCentroCusto] = useState('');
    const [batePonto, setBatePonto] = useState(false);
    const [vinculo, setVinculo] = useState('');
    const [salario, setSalario] = useState('');
    const [dataAdmissao, setDataAdmissao] = useState('');
    const [categoriaTrabalhador, setCategoriaTrabalhador] = useState('');
    const [periodoExperiencia, setPeriodoExperiencia] = useState('');
    const [jornadaTrabalho, setJornadaTrabalho] = useState('');
    const [horasMensais, setHorasMensais] = useState('');
    const [primeiroEmprego, setPrimeiroEmprego] = useState(false);
    const [processoAdmissao, setProcessoAdmissao] = useState('preencher');

    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [showAddEditModal, setShowAddEditModal] = useState(false);

    // Estados para a barra de pesquisa de subgrupos
    const [searchSubgrupo, setSearchSubgrupo] = useState('');
    const [showSubgrupoDropdown, setShowSubgrupoDropdown] = useState(false);
    
    const AVAILABLE_PERMISSIONS = [
        { id: 'admin', label: 'Administrador (Acesso Total)' },
        { id: 'dashboard', label: 'Visualizar Dashboard e Vendas' },
        { id: 'metas', label: 'Gerenciar Metas' },
        { id: 'leads', label: 'Gerenciar Leads e Oportunidades' },
        { id: 'dtc', label: 'Acesso Módulo DTC' },
        { id: 'rh', label: 'Recursos Humanos' }
    ];

    const formatarNome = (nome) => {
        if (!nome) return '';
        const palavras = nome.toLowerCase().split(' ');
        const nomeFormatado = palavras.map(palavra => {
            if (['de', 'da', 'do', 'dos'].includes(palavra)) {
                return palavra;
            }
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        }).join(' ');
        return nomeFormatado;
    };

    const fetchEmployees = async () => {
        try {
            setError(null);
            const response = await apiClient.get('/api/funcionarios', {
                params: { 
                    cargoId: filtroCargo,
                    setorId: filtroSetor
                }
            });
            setEmployees(response.data);
        } catch (err) {
            console.error('Erro ao buscar funcionários:', err);
            setError('Erro ao buscar funcionários.');
        } finally {
            setLoading(false);
        }
    };
    
    const fetchCargos = async () => {
        try {
            const response = await apiClient.get('/api/cargos');
            setCargos(response.data);
        } catch (err) { console.error('Erro ao buscar cargos:', err); }
    };

    const fetchSetores = async () => {
        try {
            const response = await apiClient.get('/api/setores');
            setSetores(response.data);
        } catch (err) { console.error('Erro ao buscar setores:', err); }
    };

    const fetchUnidades = async () => {
        try {
            const response = await apiClient.get('/api/unidades');
            setUnidades(response.data);
        } catch (err) { console.error('Erro ao buscar unidades:', err); }
    };

    const fetchFabricantes = async () => {
        try {
            const response = await apiClient.get('/api/fabricantes');
            setFabricantes(response.data);
        } catch (err) { console.error('Erro ao buscar fabricantes:', err); }
    };

    const fetchVerticais = async () => {
        try {
            const response = await apiClient.get('/api/verticais');
            setVerticais(response.data);
        } catch (err) { console.error('Erro ao buscar verticais:', err); }
    };

    const fetchSubgrupos = async () => {
        try {
            const response = await apiClient.get('/api/faq/subgrupos');
            setSubgrupos(response.data);
        } catch (err) { console.error('Erro ao buscar subgrupos:', err); }
    };

    useEffect(() => {
        if (isLoggedIn) {
            setLoading(true);
            fetchEmployees();
            if (cargos.length === 0) fetchCargos();
            if (setores.length === 0) fetchSetores();
            if (unidades.length === 0) fetchUnidades();
            if (fabricantes.length === 0) fetchFabricantes();
            if (verticais.length === 0) fetchVerticais(); // 🚀 Busca Verticais
            if (subgrupos.length === 0) fetchSubgrupos(); // 🚀 Busca Subgrupos
        } else {
            setEmployees([]);
            setLoading(false);
        }
    }, [isLoggedIn, filtroCargo, filtroSetor]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUserpicFile(file);
            // Cria uma URL temporária para a pré-visualização
            setUserpicPreview(URL.createObjectURL(file));
        }
    };


    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setSuccessMessage(null);
        setError(null);
        
        if (!name || !email || !setorId) {
            setError("Nome, e-mail e setor são obrigatórios.");
            return;
        }

        try {
            // 1. Instanciar o FormData em vez de um objeto JSON
            const formData = new FormData();
            
            // 2. Fazer o append dos campos de texto
            formData.append('nome_completo', name);
            formData.append('email', email);
            formData.append('nome_social', nomeSocial);
            formData.append('email_pessoal', emailPessoal);
            formData.append('time', time);
            formData.append('centro_custo', centroCusto);
            formData.append('bate_ponto', batePonto);
            formData.append('vinculo', vinculo);
            formData.append('salario', salario);
            formData.append('data_admissao', dataAdmissao);
            formData.append('categoria_trabalhador', categoriaTrabalhador);
            formData.append('periodo_experiencia', periodoExperiencia);
            formData.append('jornada_trabalho', jornadaTrabalho);
            formData.append('horas_mensais', horasMensais);
            formData.append('primeiro_emprego', primeiroEmprego);
            
            // Lógica de admissão
            formData.append('processo_admissao', processoAdmissao);

            if (contact) formData.append('contato', contact.replace(/\D/g, '')); // Salva apenas os números
            if (setorId) formData.append('setor_id', setorId);
            if (cargoId) formData.append('cargo_id', cargoId);
            formData.append('privilegios', permissions.join(',') || 'usuario');
            if (gestorId) formData.append('gestor_id', gestorId);
            if (unidadeId) formData.append('unidade_id', unidadeId);
            if (cnhNumero) formData.append('cnh_numero', cnhNumero);
            if (cnhValidade) formData.append('cnh_validade', cnhValidade);

            // Arrays precisam ser enviados como String no FormData
            if (selectedFabricantes && selectedFabricantes.length > 0) {
                formData.append('fabricantes_ids', JSON.stringify(selectedFabricantes));
            }
            
            if (selectedVerticais && selectedVerticais.length > 0) {
                formData.append('verticais_ids', JSON.stringify(selectedVerticais)); // 🚀 Anexa Verticais
            }

            if (selectedSubgrupos && selectedSubgrupos.length > 0) {
                formData.append('subgrupos_ids', JSON.stringify(selectedSubgrupos)); // 🚀 Anexa Subgrupos
            }

            // 3. Fazer o append do ficheiro físico (Imagem)
            if (userpicFile) {
                formData.append('userpic_file', userpicFile);
            } else if (editingEmployee && existingUserpicUrl) {
                // 🚀 Mantém a imagem atual no FormData se nenhuma nova for enviada
                formData.append('userpic_url', existingUserpicUrl);
            }

            // 4. Configurar os headers para multipart
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (editingEmployee) {
                await apiClient.put(`/api/funcionarios/${editingEmployee.id}`, formData, config);
                setSuccessMessage("Funcionário editado com sucesso!");
            } else {
                await apiClient.post('/api/funcionarios', formData, config);
                setSuccessMessage("Funcionário adicionado com sucesso!");
            }

            handleCloseAndResetModal();
            await fetchEmployees();

            setTimeout(() => { setSuccessMessage(null); }, 3000);
        } catch (err) {
            console.error('Erro ao salvar funcionário:', err);
            if (err.response && err.response.status === 409) {
                setError(err.response.data.error);
            } else {
                setError('Ocorreu um erro inesperado ao salvar.');
            }
        }
    };

    const handleEdit = (employee) => {
        setSuccessMessage(null);
        setError(null);
        setEditingEmployee(employee);
        setName(employee.nome_completo || '');
        setEmail(employee.email || '');
        setContact(employee.contato || '');
        setCargoId(employee.cargo_id || '');
        setSetorId(employee.setor_id || '');
        setGestorId(employee.gestor_id || '');
        setUnidadeId(employee.unidade_id || '');
        setPermissions(employee.privilegios ? employee.privilegios.split(',') : ['dashboard']);
        setSelectedFabricantes(employee.fabricantes_ids || []);
        setSelectedVerticais(employee.verticais_ids || []); // 🚀 Restaura seleções
        setSelectedSubgrupos(employee.subgrupos_ids || []); // 🚀 Restaura subgrupos
        setCnhNumero(employee.cnh_numero || '');
        setCnhValidade(employee.cnh_validade ? employee.cnh_validade.split('T')[0] : '');

        // Preenche os novos campos
        setNomeSocial(employee.nome_social || '');
        setEmailPessoal(employee.email_pessoal || '');
        setTime(employee.time || '');
        setCentroCusto(employee.centro_custo || '');
        setBatePonto(employee.bate_ponto || false);
        setVinculo(employee.vinculo || '');
        setSalario(employee.salario || '');
        setDataAdmissao(employee.data_admissao ? employee.data_admissao.split('T')[0] : '');
        setCategoriaTrabalhador(employee.categoria_trabalhador || '');
        setPeriodoExperiencia(employee.periodo_experiencia || '');
        setJornadaTrabalho(employee.jornada_trabalho || '');
        setHorasMensais(employee.horas_mensais || '');
        setPrimeiroEmprego(employee.primeiro_emprego || false);
        
        // Limpar ficheiro selecionado e definir a URL da imagem atual
        setUserpicFile(null);
        setUserpicPreview('');
        setExistingUserpicUrl(employee.userpic_url || ''); 
        
        setShowAddEditModal(true);
    };

    const resetForm = () => {
        setEditingEmployee(null);
        setName(''); setEmail(''); setContact('');
        setCargoId(''); setSetorId(''); setUnidadeId('');
        setGestorId(''); setPermissions(['dashboard']); setSelectedFabricantes([]); setSelectedVerticais([]); setSelectedSubgrupos([]);
        setCnhNumero(''); setCnhValidade('');
        setUserpicFile(null); 
        setUserpicPreview('');

        // Limpa os novos campos
        setNomeSocial(''); setEmailPessoal(''); setTime(''); setCentroCusto('');
        setBatePonto(false); setVinculo(''); setSalario(''); setDataAdmissao('');
        setCategoriaTrabalhador(''); setPeriodoExperiencia('');
        setJornadaTrabalho(''); setHorasMensais(''); setPrimeiroEmprego(false);
        setProcessoAdmissao('preencher');

        setExistingUserpicUrl('');
        setError(null);
        setSearchSubgrupo('');
        setShowSubgrupoDropdown(false);
    };

    const handleAddClick = () => {
        resetForm();
        setShowAddEditModal(true);
    };

    const handleCloseAndResetModal = () => {
        setShowAddEditModal(false);
        resetForm();
    };

    const handleDeleteClick = (employee) => {
        setSuccessMessage(null);
        setEmployeeToDelete(employee);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await apiClient.delete(`/api/funcionarios/${employeeToDelete.id}`);
            await fetchEmployees();
            setShowDeleteModal(false);
            setEmployeeToDelete(null);
            setSuccessMessage("Colaborador inativado com sucesso!");
            setTimeout(() => { setSuccessMessage(null); }, 3000);
        } catch (err) {
            console.error('Erro ao inativar o colaborador:', err);
            setError('Erro ao inativar o colaborador.');
            setShowDeleteModal(false);
            setEmployeeToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setEmployeeToDelete(null);
    };

    if (loading) {
        return (
            <div className="dash-grid">
                <div className='container-main'>
                    <Container className="mt-5 text-center"><Spinner animation="border" /></Container>
                </div>
            </div>
        );
    }

    const filteredEmployees = employees.filter(emp => {
        const searchLower = searchTerm.toLowerCase();
        return (
            emp.nome_completo?.toLowerCase().includes(searchLower) ||
            emp.email?.toLowerCase().includes(searchLower)
        );
    });

    const renderPrivileges = (privString) => {
        if (!privString || privString === 'usuario') return <Badge bg="info">USUÁRIO</Badge>;
        if (privString.includes('admin')) return <Badge bg="danger">ADMINISTRADOR</Badge>;
        const privArray = privString.split(',');
        if (privArray.length > 2) return <Badge bg="primary">PERSONALIZADO ({privArray.length})</Badge>;
        return privArray.map(p => <Badge bg="secondary" className="me-1 text-uppercase" key={p}>{p}</Badge>);
    };

    const getStatusBadge = (ativo) => {
        if (ativo) {
            return <Badge bg="success">Ativo</Badge>;
        }
        return <Badge bg="danger">Inativo</Badge>;
    };


// 🚀 Lógica Simplificada (Achatamento): 
    // Filtra os Subgrupos APENAS com base no Setor do colaborador.
    const availableSubgrupos = subgrupos.filter(sub => {
        // Se o RH ainda não selecionou um setor para o colaborador, mostra todos.
        if (!setorId) return true; 
        
        // Se já selecionou, mostra apenas os subgrupos (ex: DAHUA-CAMERAS) que pertencem àquele setor.
        return String(sub.setor_id) === String(setorId);
    });

    return (
        <div className="dash-grid">
            <div className='container-main p-4' >
                <Container fluid className="px-0">
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}
                    {error && <Alert variant="danger btn-sm">{error}</Alert>}
                    
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h2 className="fw-bold mb-1 text-dark">Gestão de Colaboradores</h2>
                            <p className="text-muted mb-0">Cadastre, edite e gerencie permissões da equipe no portal.</p>
                        </div>
                    </div>

                    <Row className="mb-4 align-items-center">
                        <Col xs="auto">
                            <Button variant="outline-secondary" onClick={() => setShowFilters(!showFilters)}>
                                <FaFilter /> Filtros
                            </Button>
                        </Col>
                        <Col>
                            <InputGroup>
                                <InputGroup.Text><FaSearch /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Buscar por nome, departamento ou cargo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col xs="auto" className="d-flex gap-2">
                            <Button variant="primary" onClick={handleAddClick}>
                                <FaUserPlus /> Novo
                            </Button>
                            <Dropdown>
                                <Dropdown.Toggle variant="outline-secondary" id="dropdown-settings">
                                    <FaCog />
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end">
                                    <Dropdown.Item onClick={() => setShowImportModal(true)}><FaFileImport className="me-2" />Importar CSV</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={() => setIsCargosModalOpen(true)}><FaBriefcase className="me-2" />Gerenciar Cargos</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setIsSetoresModalOpen(true)}><FaSitemap className="me-2" />Gerenciar Setores</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setIsUnidadesModalOpen(true)}><FaSitemap className="me-2" />Gerenciar Filiais</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>

                    {showFilters && (
                        <Card className="shadow-sm border-0 mb-4 bg-light">
                            <Card.Body className="p-3">
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Select value={filtroCargo} onChange={(e) => setFiltroCargo(e.target.value)}><option value="">Todos os Cargos</option>{cargos.map(c => (<option key={c.id} value={c.id}>{c.nome_cargo}</option>))}</Form.Select>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Select value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)}><option value="">Todos os Setores</option>{setores.map(s => (<option key={s.id} value={s.id}>{s.nome_setor}</option>))}</Form.Select>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}

                    <Card className="shadow-sm border-0">
                        <div className="table-responsive">
                            <Table hover className="align-middle mb-0">
                                <thead className="table-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="px-4 py-3 fw-bold border-0">Colaborador</th>
                                        <th className="py-3 fw-bold border-0">Status</th>
                                        <th className="py-3 fw-bold border-0">Departamento / Cargo</th>
                                        <th className="py-3 fw-bold border-0">Acesso</th>
                                        <th className="text-end px-4 py-3 fw-bold border-0">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.length > 0 ? (
                                        filteredEmployees.map((employee) => (
                                            <tr key={employee.id}>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center">
                                                        <img src={employee.userpic_url || 'default-avatar.png'} alt="Foto" className="rounded-circle me-3 border bg-light" style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                                                        <div>
                                                            <div className="fw-bold text-dark">{formatarNome(employee.nome_completo)}</div>
                                                            <div className="text-muted small">{employee.email}</div>
                                                            {employee.nome_unidade && <Badge bg="light" text="dark" className="border mt-1">{employee.nome_unidade}</Badge>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3">{getStatusBadge(employee.ativo)}</td>
                                                <td className="py-3">
                                                    <div className="fw-semibold text-dark">{employee.nome_setor || '-'}</div>
                                                    <div className="text-muted small">{employee.nome_cargo || '-'}</div>
                                                </td>
                                                <td className="py-3">
                                                    {renderPrivileges(employee.privilegios)}
                                                </td>
                                                <td className="text-end px-4 py-3">
                                                    <Button variant="light" size="sm" className="me-2 shadow-sm text-primary" onClick={() => handleEdit(employee)} title="Editar"><FaEdit /></Button>
                                                    <Button variant="light" size="sm" className="shadow-sm text-danger" onClick={() => handleDeleteClick(employee)} title="Inativar"><FaUserTimes /></Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">
                                                {isLoggedIn ? "Nenhum colaborador encontrado para o filtro selecionado." : "Efetue login para visualizar."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </Container>
            </div>
            
            <CargosModal show={isCargosModalOpen} onHide={() => setIsCargosModalOpen(false)} onCargosUpdate={fetchCargos} />
            <SetoresModal show={isSetoresModalOpen} onHide={() => setIsSetoresModalOpen(false)} onSetoresUpdate={fetchSetores} />
            <UnidadesModal show={isUnidadesModalOpen} onHide={() => setIsUnidadesModalOpen(false)} onUnidadesUpdate={fetchUnidades} />
            
            <ImportModal 
                show={showImportModal} 
                onHide={() => setShowImportModal(false)}
                onComplete={fetchEmployees}
            />
            
            <Modal show={showAddEditModal} onHide={handleCloseAndResetModal} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>{editingEmployee ? 'Editar Colaborador' : 'Adicionar Novo Colaborador'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleFormSubmit}>
                    <Modal.Body>
                        <Tabs defaultActiveKey="pessoal" className="mb-4 custom-tabs">
                            {/* ABA 1: DADOS PESSOAIS E RH */}
                            <Tab eventKey="pessoal" title="Ficha de Admissão">
                                <div className="pt-3">
                                    {/* Layout verticalizado */}
                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Dados Pessoais</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Nome Completo*</Form.Label><Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required /></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Nome Social</Form.Label><Form.Control type="text" value={nomeSocial} onChange={(e) => setNomeSocial(e.target.value)} /></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>E-mail Pessoal*</Form.Label><Form.Control type="email" value={emailPessoal} onChange={(e) => setEmailPessoal(e.target.value)} required /></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Celular</Form.Label>
                                                    <IMaskInput
                                                        mask="(00) 00000-0000"
                                                        value={contact}
                                                        onAccept={(value) => setContact(value)}
                                                        className="form-control"
                                                        placeholder="(99) 99999-9999"
                                                    />
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
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Pessoa Gestora</Form.Label><Form.Select value={gestorId} onChange={(e) => setGestorId(e.target.value)}><option value="">Ninguém</option>{employees.filter(emp => !editingEmployee || emp.id !== editingEmployee.id).map(emp => (<option key={emp.id} value={emp.id}>{emp.nome_completo}</option>))}</Form.Select></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Departamento*</Form.Label><Form.Select value={setorId} onChange={(e) => setSetorId(e.target.value)} required><option value="">Selecione</option>{setores.map(s => (<option key={s.id} value={s.id}>{s.nome_setor}</option>))}</Form.Select></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Time</Form.Label><Form.Control type="text" value={time} onChange={(e) => setTime(e.target.value)} /></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Cargo*</Form.Label><Form.Select value={cargoId} onChange={(e) => setCargoId(e.target.value)} required><option value="">Selecione</option>{cargos.map(c => (<option key={c.id} value={c.id}>{c.nome_cargo}</option>))}</Form.Select></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Centro de Custo*</Form.Label><Form.Select value={centroCusto} onChange={(e) => setCentroCusto(e.target.value)} required><option value="">Selecione</option><option>001-Design</option><option>002-Produto</option><option>003-Tecnologia</option><option>004-RH</option></Form.Select></Form.Group></Col>
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
                                </div>
                            </Tab>
                            
                            {/* ABA 2: ACESSOS E RESPONSABILIDADES */}
                            <Tab eventKey="acessos" title="Acessos e Responsabilidades">
                                <div className="pt-3">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold text-muted small text-uppercase">Permissões de Acesso ao Sistema</Form.Label>
                                        <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                                            {AVAILABLE_PERMISSIONS.map(perm => (
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
                                                            setPermissions(permissions.filter(p => p !== perm.id));
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <Form.Text className="text-muted">Atenção: Permissões de administrador dão acesso total às configurações do portal.</Form.Text>
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold text-muted small text-uppercase">Marcas Representadas (Departamento Técnico e Compras)</Form.Label>
                                        <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                                            {fabricantes.length > 0 ? fabricantes.map(fab => (
                                                <Form.Check 
                                                    key={fab.id}
                                                    type="checkbox"
                                                    id={`fab-${fab.id}`}
                                                    label={fab.name}
                                                    checked={selectedFabricantes.includes(fab.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedFabricantes([...selectedFabricantes, fab.id]);
                                                        } else {
                                                            setSelectedFabricantes(selectedFabricantes.filter(id => id !== fab.id));
                                                        }
                                                    }}
                                                />
                                            )) : <span className="text-muted small">Nenhuma marca cadastrada. Vá até Admin {'>'} Gerenciar Fabricantes.</span>}
                                        </div>
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted small text-uppercase">Verticais DTC Representadas</Form.Label>
                                        <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                                            {verticais.length > 0 ? verticais.map(vert => (
                                                <Form.Check 
                                                    key={vert.id}
                                                    type="checkbox"
                                                    id={`vert-${vert.id}`}
                                                    label={vert.nome}
                                                    checked={selectedVerticais.includes(vert.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedVerticais([...selectedVerticais, vert.id]);
                                                        } else {
                                                            setSelectedVerticais(selectedVerticais.filter(id => id !== vert.id));
                                                        }
                                                    }}
                                                />
                                            )) : <span className="text-muted small">Nenhuma vertical cadastrada.</span>}
                                        </div>
                                    </Form.Group>
                                    
<Form.Group className="mb-4 position-relative">
                                        <Form.Label className="fw-bold text-muted small text-uppercase">Responsabilidade FAQ (Subgrupos)</Form.Label>
                                        
                                        {/* 1. Área das Etiquetas (Pills) selecionadas */}
                                        <div className="mb-2 d-flex flex-wrap gap-2">
                                            {selectedSubgrupos.length === 0 && (
                                                <span className="text-muted small fst-italic">Nenhum subgrupo atribuído.</span>
                                            )}
                                            {selectedSubgrupos.map(id => {
                                                const sub = subgrupos.find(s => s.id === id);
                                                if (!sub) return null;
                                                return (
                                                    <Badge 
                                                        bg="primary" 
                                                        key={id} 
                                                        className="d-flex align-items-center p-2 shadow-sm" 
                                                        style={{ fontSize: '0.85rem' }}
                                                    >
                                                        {sub.nome}
                                                        <span 
                                                            className="ms-2 ps-2 border-start border-light cursor-pointer" 
                                                            style={{ cursor: 'pointer' }}
                                                            title="Remover"
                                                            onClick={() => setSelectedSubgrupos(selectedSubgrupos.filter(sId => sId !== id))}
                                                        >
                                                            &times;
                                                        </span>
                                                    </Badge>
                                                );
                                            })}
                                        </div>

                                        {/* 2. Campo de Busca (Autocomplete Inteligente) */}
                                        <Form.Control 
                                            type="text"
                                            className="shadow-sm"
                                            placeholder="🔍 Digite para buscar uma categoria..."
                                            value={searchSubgrupo}
                                            onChange={(e) => setSearchSubgrupo(e.target.value)}
                                            onFocus={() => setShowSubgrupoDropdown(true)}
                                            onBlur={() => setShowSubgrupoDropdown(false)}
                                        />

                                        {/* 3. Lista Flutuante de Resultados */}
                                        {showSubgrupoDropdown && (
                                            <div 
                                                className="dropdown-menu show shadow w-100" 
                                                style={{ maxHeight: '200px', overflowY: 'auto', position: 'absolute', zIndex: 1050 }}
                                            >
                                                {availableSubgrupos
                                                    .filter(sub => !selectedSubgrupos.includes(sub.id) && sub.nome.toLowerCase().includes(searchSubgrupo.toLowerCase()))
                                                    .length > 0 ? (
                                                        
                                                    availableSubgrupos
                                                        .filter(sub => !selectedSubgrupos.includes(sub.id) && sub.nome.toLowerCase().includes(searchSubgrupo.toLowerCase()))
                                                        .map(sub => (
                                                            <button
                                                                key={`opt-${sub.id}`}
                                                                type="button"
                                                                className="dropdown-item py-2"
                                                                onMouseDown={(e) => {
                                                                    // onMouseDown aciona antes do onBlur do input
                                                                    e.preventDefault(); 
                                                                    setSelectedSubgrupos([...selectedSubgrupos, sub.id]);
                                                                    setSearchSubgrupo('');
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
                                                Nenhuma categoria cadastrada para o setor deste colaborador.
                                            </Form.Text>
                                        )}
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
                        <Button variant="secondary btn-sm" onClick={handleCloseAndResetModal}>Cancelar</Button>
                        <Button variant="success btn-sm" type="submit">{editingEmployee ? 'Salvar Alterações' : 'Adicionar Colaborador'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            
            <Modal show={showDeleteModal} onHide={cancelDelete}>
                <Modal.Header closeButton><Modal.Title>Confirmar Inativação</Modal.Title></Modal.Header>
                <Modal.Body>Tem certeza que deseja inativar o acesso de <strong>{formatarNome(employeeToDelete?.nome_completo)}</strong>? Ele não poderá mais logar, mas o histórico de projetos será mantido.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary btn-sm" onClick={cancelDelete}>Cancelar</Button>
                    <Button variant="danger btn-sm" onClick={confirmDelete}>Inativar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManageEmployees; 
                                    <Button variant="primary" className="d-flex align-items-center gap-2 shadow-sm" onClick={handleAddClick}>
                                        <FaUserPlus /> Novo
                                    </Button>
                                    <Button variant="success" className="d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowImportModal(true)}>
                                        <FaFileImport /> Importar
                                    </Button>
                                    <Button variant="outline-secondary" className="d-flex align-items-center gap-2 shadow-sm bg-white" onClick={() => setIsCargosModalOpen(true)}>
                                        <FaBriefcase /> Cargos
                                    </Button>
                                    <Button variant="outline-secondary" className="d-flex align-items-center gap-2 shadow-sm bg-white" onClick={() => setIsSetoresModalOpen(true)}>
                                        <FaSitemap /> Setores
                                    </Button>
                                    <Button variant="outline-secondary" className="d-flex align-items-center gap-2 shadow-sm bg-white" onClick={() => setIsUnidadesModalOpen(true)}>
                                        <FaSitemap /> Filiais / Unidades
                                    </Button>
                                </Col>
                                
                            </Row>
                            
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0">
                        <div className="table-responsive">
                            <Table hover className="align-middle mb-0">
                                <thead className="table-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="px-4 py-3 fw-bold border-0">Colaborador</th>
                                        <th className="py-3 fw-bold border-0">Contato</th>
                                        <th className="py-3 fw-bold border-0">Departamento / Cargo</th>
                                        <th className="py-3 fw-bold border-0">Acesso</th>
                                        <th className="text-end px-4 py-3 fw-bold border-0">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.length > 0 ? (
                                        filteredEmployees.map((employee) => (
                                            <tr key={employee.id}>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center">
                                                        {/* Lendo da nova URL pública em vez de Base64 */}
                                                        <img src={employee.userpic_url || 'default-avatar.png'} alt="Foto" className="rounded-circle me-3 border bg-light" style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                                                        <div>
                                                            <div className="fw-bold text-dark">{formatarNome(employee.nome_completo)}</div>
                                                            <div className="text-muted small">{employee.email}</div>
                                                            {employee.nome_unidade && <Badge bg="light" text="dark" className="border mt-1">{employee.nome_unidade}</Badge>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-muted">{employee.contato || '-'}</td>
                                                <td className="py-3">
                                                    <div className="fw-semibold text-dark">{employee.nome_setor || '-'}</div>
                                                    <div className="text-muted small">{employee.nome_cargo || '-'}</div>
                                                </td>
                                                <td className="py-3">
                                                    {renderPrivileges(employee.privilegios)}
                                                </td>
                                                <td className="text-end px-4 py-3">
                                                    <Button variant="light" size="sm" className="me-2 shadow-sm text-primary" onClick={() => handleEdit(employee)} title="Editar"><FaEdit /></Button>
                                                    <Button variant="light" size="sm" className="shadow-sm text-danger" onClick={() => handleDeleteClick(employee)} title="Inativar"><FaUserTimes /></Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">
                                                {isLoggedIn ? "Nenhum colaborador encontrado para o filtro selecionado." : "Efetue login para visualizar."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </Container>
            </div>
            
            <CargosModal show={isCargosModalOpen} onHide={() => setIsCargosModalOpen(false)} onCargosUpdate={fetchCargos} />
            <SetoresModal show={isSetoresModalOpen} onHide={() => setIsSetoresModalOpen(false)} onSetoresUpdate={fetchSetores} />
            <UnidadesModal show={isUnidadesModalOpen} onHide={() => setIsUnidadesModalOpen(false)} onUnidadesUpdate={fetchUnidades} />
            
            <ImportModal 
                show={showImportModal} 
                onHide={() => setShowImportModal(false)}
                onComplete={fetchEmployees}
            />
            
            <Modal show={showAddEditModal} onHide={handleCloseAndResetModal} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>{editingEmployee ? 'Editar Colaborador' : 'Adicionar Novo Colaborador'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleFormSubmit}>
                    <Modal.Body>
                        <Tabs defaultActiveKey="pessoal" className="mb-4 custom-tabs">
                            {/* ABA 1: DADOS PESSOAIS E RH */}
                            <Tab eventKey="pessoal" title="Ficha de Admissão">
                                <div className="pt-3">
                                    {/* Layout verticalizado */}
                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Dados Pessoais</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Nome Completo*</Form.Label><Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required /></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Nome Social</Form.Label><Form.Control type="text" value={nomeSocial} onChange={(e) => setNomeSocial(e.target.value)} /></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>E-mail Pessoal*</Form.Label><Form.Control type="email" value={emailPessoal} onChange={(e) => setEmailPessoal(e.target.value)} required /></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Celular</Form.Label><Form.Control type="text" value={contact} onChange={(e) => setContact(e.target.value)} /></Form.Group></Col>
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
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Pessoa Gestora</Form.Label><Form.Select value={gestorId} onChange={(e) => setGestorId(e.target.value)}><option value="">Ninguém</option>{employees.filter(emp => !editingEmployee || emp.id !== editingEmployee.id).map(emp => (<option key={emp.id} value={emp.id}>{emp.nome_completo}</option>))}</Form.Select></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Departamento*</Form.Label><Form.Select value={setorId} onChange={(e) => setSetorId(e.target.value)} required><option value="">Selecione</option>{setores.map(s => (<option key={s.id} value={s.id}>{s.nome_setor}</option>))}</Form.Select></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Time</Form.Label><Form.Control type="text" value={time} onChange={(e) => setTime(e.target.value)} /></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Cargo*</Form.Label><Form.Select value={cargoId} onChange={(e) => setCargoId(e.target.value)} required><option value="">Selecione</option>{cargos.map(c => (<option key={c.id} value={c.id}>{c.nome_cargo}</option>))}</Form.Select></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Centro de Custo*</Form.Label><Form.Select value={centroCusto} onChange={(e) => setCentroCusto(e.target.value)} required><option value="">Selecione</option><option>001-Design</option><option>002-Produto</option><option>003-Tecnologia</option><option>004-RH</option></Form.Select></Form.Group></Col>
                                                <Col md={12}><Form.Check type="switch" id="bate-ponto-switch" label="Colaborador bate ponto?" checked={batePonto} onChange={(e) => setBatePonto(e.target.checked)} /></Col>
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
                                </div>
                            </Tab>
                            
                            {/* ABA 2: ACESSOS E RESPONSABILIDADES */}
                            <Tab eventKey="acessos" title="Acessos e Responsabilidades">
                                <div className="pt-3">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold text-muted small text-uppercase">Permissões de Acesso ao Sistema</Form.Label>
                                        <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                                            {AVAILABLE_PERMISSIONS.map(perm => (
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
                                                            setPermissions(permissions.filter(p => p !== perm.id));
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <Form.Text className="text-muted">Atenção: Permissões de administrador dão acesso total às configurações do portal.</Form.Text>
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold text-muted small text-uppercase">Marcas Representadas (Departamento Técnico e Compras)</Form.Label>
                                        <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                                            {fabricantes.length > 0 ? fabricantes.map(fab => (
                                                <Form.Check 
                                                    key={fab.id}
                                                    type="checkbox"
                                                    id={`fab-${fab.id}`}
                                                    label={fab.name}
                                                    checked={selectedFabricantes.includes(fab.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedFabricantes([...selectedFabricantes, fab.id]);
                                                        } else {
                                                            setSelectedFabricantes(selectedFabricantes.filter(id => id !== fab.id));
                                                        }
                                                    }}
                                                />
                                            )) : <span className="text-muted small">Nenhuma marca cadastrada. Vá até Admin {'>'} Gerenciar Fabricantes.</span>}
                                        </div>
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted small text-uppercase">Verticais DTC Representadas</Form.Label>
                                        <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                                            {verticais.length > 0 ? verticais.map(vert => (
                                                <Form.Check 
                                                    key={vert.id}
                                                    type="checkbox"
                                                    id={`vert-${vert.id}`}
                                                    label={vert.nome}
                                                    checked={selectedVerticais.includes(vert.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedVerticais([...selectedVerticais, vert.id]);
                                                        } else {
                                                            setSelectedVerticais(selectedVerticais.filter(id => id !== vert.id));
                                                        }
                                                    }}
                                                />
                                            )) : <span className="text-muted small">Nenhuma vertical cadastrada.</span>}
                                        </div>
                                    </Form.Group>
                                    
<Form.Group className="mb-4 position-relative">
                                        <Form.Label className="fw-bold text-muted small text-uppercase">Responsabilidade FAQ (Subgrupos)</Form.Label>
                                        
                                        {/* 1. Área das Etiquetas (Pills) selecionadas */}
                                        <div className="mb-2 d-flex flex-wrap gap-2">
                                            {selectedSubgrupos.length === 0 && (
                                                <span className="text-muted small fst-italic">Nenhum subgrupo atribuído.</span>
                                            )}
                                            {selectedSubgrupos.map(id => {
                                                const sub = subgrupos.find(s => s.id === id);
                                                if (!sub) return null;
                                                return (
                                                    <Badge 
                                                        bg="primary" 
                                                        key={id} 
                                                        className="d-flex align-items-center p-2 shadow-sm" 
                                                        style={{ fontSize: '0.85rem' }}
                                                    >
                                                        {sub.nome}
                                                        <span 
                                                            className="ms-2 ps-2 border-start border-light cursor-pointer" 
                                                            style={{ cursor: 'pointer' }}
                                                            title="Remover"
                                                            onClick={() => setSelectedSubgrupos(selectedSubgrupos.filter(sId => sId !== id))}
                                                        >
                                                            &times;
                                                        </span>
                                                    </Badge>
                                                );
                                            })}
                                        </div>

                                        {/* 2. Campo de Busca (Autocomplete Inteligente) */}
                                        <Form.Control 
                                            type="text"
                                            className="shadow-sm"
                                            placeholder="🔍 Digite para buscar uma categoria..."
                                            value={searchSubgrupo}
                                            onChange={(e) => setSearchSubgrupo(e.target.value)}
                                            onFocus={() => setShowSubgrupoDropdown(true)}
                                            onBlur={() => setShowSubgrupoDropdown(false)}
                                        />

                                        {/* 3. Lista Flutuante de Resultados */}
                                        {showSubgrupoDropdown && (
                                            <div 
                                                className="dropdown-menu show shadow w-100" 
                                                style={{ maxHeight: '200px', overflowY: 'auto', position: 'absolute', zIndex: 1050 }}
                                            >
                                                {availableSubgrupos
                                                    .filter(sub => !selectedSubgrupos.includes(sub.id) && sub.nome.toLowerCase().includes(searchSubgrupo.toLowerCase()))
                                                    .length > 0 ? (
                                                        
                                                    availableSubgrupos
                                                        .filter(sub => !selectedSubgrupos.includes(sub.id) && sub.nome.toLowerCase().includes(searchSubgrupo.toLowerCase()))
                                                        .map(sub => (
                                                            <button
                                                                key={`opt-${sub.id}`}
                                                                type="button"
                                                                className="dropdown-item py-2"
                                                                onMouseDown={(e) => {
                                                                    // onMouseDown aciona antes do onBlur do input
                                                                    e.preventDefault(); 
                                                                    setSelectedSubgrupos([...selectedSubgrupos, sub.id]);
                                                                    setSearchSubgrupo('');
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
                                                Nenhuma categoria cadastrada para o setor deste colaborador.
                                            </Form.Text>
                                        )}
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
                        <Button variant="secondary btn-sm" onClick={handleCloseAndResetModal}>Cancelar</Button>
                        <Button variant="success btn-sm" type="submit">{editingEmployee ? 'Salvar Alterações' : 'Adicionar Colaborador'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            
            <Modal show={showDeleteModal} onHide={cancelDelete}>
                <Modal.Header closeButton><Modal.Title>Confirmar Inativação</Modal.Title></Modal.Header>
                <Modal.Body>Tem certeza que deseja inativar o acesso de <strong>{formatarNome(employeeToDelete?.nome_completo)}</strong>? Ele não poderá mais logar, mas o histórico de projetos será mantido.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary btn-sm" onClick={cancelDelete}>Cancelar</Button>
                    <Button variant="danger btn-sm" onClick={confirmDelete}>Inativar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManageEmployees; 