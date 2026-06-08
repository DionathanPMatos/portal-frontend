import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import { FaEdit, FaTrash, FaUserPlus, FaFileImport, FaBriefcase, FaSitemap, FaSearch, FaUserTimes } from 'react-icons/fa';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isCargosModalOpen, setIsCargosModalOpen] = useState(false);
    const [isSetoresModalOpen, setIsSetoresModalOpen] = useState(false);
    const [isUnidadesModalOpen, setIsUnidadesModalOpen] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false); 
    const [filtroCargo, setFiltroCargo] = useState(''); 
    const [filtroSetor, setFiltroSetor] = useState('');
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
    
    // Estados para a Imagem
    const [userpicFile, setUserpicFile] = useState(null);
    const [existingUserpicUrl, setExistingUserpicUrl] = useState('');

    const [cnhNumero, setCnhNumero] = useState('');
    const [cnhValidade, setCnhValidade] = useState('');

    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    
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

    useEffect(() => {
        if (isLoggedIn) {
            setLoading(true);
            fetchEmployees();
            if (cargos.length === 0) fetchCargos();
            if (setores.length === 0) fetchSetores();
            if (unidades.length === 0) fetchUnidades();
            if (fabricantes.length === 0) fetchFabricantes();
        } else {
            setEmployees([]);
            setLoading(false);
        }
    }, [isLoggedIn, filtroCargo, filtroSetor]);

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
            if (contact) formData.append('contato', contact);
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

            // 3. Fazer o append do ficheiro físico (Imagem)
            if (userpicFile) {
                formData.append('userpic_file', userpicFile);
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
        setCnhNumero(employee.cnh_numero || '');
        setCnhValidade(employee.cnh_validade ? employee.cnh_validade.split('T')[0] : '');
        
        // Limpar ficheiro selecionado e definir a URL da imagem atual
        setUserpicFile(null);
        setExistingUserpicUrl(employee.userpic_url || ''); 
        
        setShowAddEditModal(true);
    };

    const resetForm = () => {
        setEditingEmployee(null);
        setName(''); setEmail(''); setContact('');
        setCargoId(''); setSetorId(''); setUnidadeId('');
        setGestorId(''); setPermissions(['dashboard']); setSelectedFabricantes([]); 
        setCnhNumero(''); setCnhValidade('');
        setUserpicFile(null); 
        setExistingUserpicUrl('');
        setError(null);
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

                    <Card className="shadow-sm border-0 mb-4 bg-light">
                        <Card.Body className="p-3">
                            <Row className="align-items-end g-3 mb-3">
                                <Col md={12} lg={4}>
                                    <Form.Group>
                                        <Form.Label className="text-muted small fw-bold mb-1 text-uppercase">Pesquisar Colaborador</Form.Label>
                                        <InputGroup className="shadow-sm">
                                            <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                            <Form.Control placeholder="Nome ou E-mail..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border-start-0 ps-0 shadow-none" />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={6} lg={4}>
                                    <Form.Group>
                                        <Form.Label className="text-muted small fw-bold mb-1 text-uppercase">Filtrar por Cargo</Form.Label>
                                        <Form.Select value={filtroCargo} onChange={(e) => setFiltroCargo(e.target.value)} className="shadow-none">
                                            <option value="">Todos os Cargos</option>
                                            {cargos.map(cargo => (
                                                <option key={cargo.id} value={cargo.id}>{cargo.nome_cargo}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6} lg={4}>
                                    <Form.Group>
                                        <Form.Label className="text-muted small fw-bold mb-1 text-uppercase">Filtrar por Setor</Form.Label>
                                        <Form.Select value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)} className="shadow-none">
                                            <option value="">Todos os Setores</option>
                                            {setores.map(setor => (
                                                <option key={setor.id} value={setor.id}>{setor.nome_setor}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="d-flex justify-content-start flex-wrap gap-2 pt-2 border-top">
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
                                        <th className="py-3 fw-bold border-0">Setor / Cargo</th>
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
            
            <Modal show={showAddEditModal} onHide={handleCloseAndResetModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingEmployee ? 'Editar Colaborador' : 'Adicionar Novo Colaborador'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleFormSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3"><Form.Label>Nome Completo</Form.Label><Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>E-mail</Form.Label><Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Contato</Form.Label><Form.Control type="text" value={contact} onChange={(e) => setContact(e.target.value)} /></Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Setor</Form.Label>
                            <Form.Select value={setorId} onChange={(e) => setSetorId(e.target.value)} required>
                                <option value="">Selecione o Setor</option>
                                {setores.map(s => (<option key={s.id} value={s.id}>{s.nome_setor}</option>))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cargo</Form.Label>
                            <Form.Select value={cargoId} onChange={(e) => setCargoId(e.target.value)}>
                                <option value="">Selecione o Cargo</option>
                                {cargos.map(cargo => (<option key={cargo.id} value={cargo.id}>{cargo.nome_cargo}</option>))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Unidade / Filial</Form.Label>
                            <Form.Select value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)}>
                                <option value="">Não Vinculado</option>
                                {unidades.map(u => (<option key={u.id} value={u.id}>{u.nome_unidade}</option>))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Reporta a (Gestor/Supervisor)</Form.Label>
                            <Form.Select value={gestorId} onChange={(e) => setGestorId(e.target.value)}>
                                <option value="">Nenhum (Responde à Diretoria)</option>
                                {employees
                                    .filter(emp => !editingEmployee || emp.id !== editingEmployee.id)
                                    .map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.nome_completo}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3"><Form.Label>Nº CNH (Frota)</Form.Label><Form.Control type="text" value={cnhNumero} onChange={(e) => setCnhNumero(e.target.value)} placeholder="Opcional" /></Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3"><Form.Label>Validade CNH</Form.Label><Form.Control type="date" value={cnhValidade} onChange={(e) => setCnhValidade(e.target.value)} /></Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Permissões de Acesso</Form.Label>
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
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Marcas Representadas (Organograma)</Form.Label>
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
                                )) : <span className="text-muted small">Nenhuma marca cadastrada. Vá até Admin {'>'} Gerenciar Fabricantes para cadastrá-las.</span>}
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Foto do colaborador</Form.Label>
                            {/* O input agora captura e guarda o File bruto, sem conversões */}
                            <Form.Control type="file" onChange={(e) => setUserpicFile(e.target.files[0])}/>
                            
                            {/* Mostra a foto atual baseada na URL pública (se existir) */}
                            {editingEmployee && existingUserpicUrl && (
                                <div className="mt-2">
                                    <small className="text-muted mb-1 d-block">Foto atual:</small>
                                    <img src={existingUserpicUrl} alt="Foto atual" className="border rounded bg-light" style={{ width: '60px', height: '60px', objectFit: 'contain' }}/>
                                </div>
                            )}
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