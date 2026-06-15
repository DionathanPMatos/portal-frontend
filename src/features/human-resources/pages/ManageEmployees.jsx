import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // 🚀 Importa o useNavigate
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import { FaEdit, FaTrash, FaUserPlus, FaFileImport, FaBriefcase, FaSitemap, FaSearch, FaUserTimes, FaCog, FaFilter, FaBuilding, FaUsers, FaDollarSign, FaClipboardList } from 'react-icons/fa';
import CargosModal from './CargosModal';
import SetoresModal from './SetoresModal';
import UnidadesModal from './UnidadesModal.jsx';
import TimesModal from '../components/TimesModal.jsx';
import CentroCustoModal from '../components/CentroCustoModal.jsx';
import OnboardingTemplateModal from '../components/OnboardingTemplateModal.jsx';
import apiClient from '../../../services/api';
import EmployeeEditModal from '../components/EmployeeEditModal.jsx';
import ImportModal from '../components/ImportModal';
import { useAuth } from '../../../contexts/AuthContext';
import "../../../styles/index.css";


// A importação de '../../../App.jsx' foi removida.
// Estilos globais devem ser importados no arquivo de entrada principal da sua aplicação (ex: main.jsx ou index.js).
const ManageEmployees = () => {
    const { isLoggedIn } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [setores, setSetores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isCargosModalOpen, setIsCargosModalOpen] = useState(false);
    const [isSetoresModalOpen, setIsSetoresModalOpen] = useState(false);
    const [isUnidadesModalOpen, setIsUnidadesModalOpen] = useState(false);
    const [isOnboardingTemplateModalOpen, setIsOnboardingTemplateModalOpen] = useState(false);
    const [isCentroCustoModalOpen, setIsCentroCustoModalOpen] = useState(false);
    const [isTimesModalOpen, setIsTimesModalOpen] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false); 
    const [filtroCargo, setFiltroCargo] = useState(''); 
    const [filtroSetor, setFiltroSetor] = useState('');
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');

    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [showAddEditModal, setShowAddEditModal] = useState(false);

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

    useEffect(() => {
        if (isLoggedIn) {
            setLoading(true);
            fetchEmployees();
            if (cargos.length === 0) fetchCargos();
            if (setores.length === 0) fetchSetores();
        } else {
            setEmployees([]);
            setLoading(false);
        }
    }, [isLoggedIn, filtroCargo, filtroSetor]);

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setShowAddEditModal(true);
    };

    const handleAddClick = () => {
        setEditingEmployee(null);
        setShowAddEditModal(true);
    };

    const handleCloseAndResetModal = () => {
        setShowAddEditModal(false);
        setEditingEmployee(null);
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

    const handleViewDetails = (employeeId) => { // 🚀 Função para navegar para a página de detalhes
        navigate(`/rh/colaboradores/${employeeId}`);
    };

    return (
        <div className='container-main p-4'>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {error && <Alert variant="danger btn-sm">{error}</Alert>}
            
            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaBriefcase /> Gestão de Colaboradores
                    </h2>
                    <p className="page-header-subtitle">Cadastre, edite e gerencie permissões da equipe no portal.</p>
                </div>
                <div className="page-header-actions-wrapper">
                    <Button variant="primary" className="btn-header-action" onClick={handleAddClick}>
                        <FaUserPlus className="me-2" /> Iniciar Novo Cadastro
                    </Button>
                    <Dropdown>
                        <Dropdown.Toggle variant="light" id="dropdown-settings">
                            <FaCog />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => setShowImportModal(true)}><FaFileImport className="me-2" />Importar CSV</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => setIsCargosModalOpen(true)}><FaBriefcase className="me-2" />Gerenciar Cargos</Dropdown.Item>
                            <Dropdown.Item onClick={() => setIsSetoresModalOpen(true)}><FaSitemap className="me-2" />Gerenciar Setores</Dropdown.Item>
                            <Dropdown.Item onClick={() => setIsCentroCustoModalOpen(true)}><FaDollarSign className="me-2" />Gerenciar Centros de Custo</Dropdown.Item>
                            <Dropdown.Item onClick={() => setIsTimesModalOpen(true)}><FaUsers className="me-2" />Gerenciar Times</Dropdown.Item>
                            <Dropdown.Item onClick={() => setIsOnboardingTemplateModalOpen(true)}><FaClipboardList className="me-2" />Gerenciar Modelos de Onboarding</Dropdown.Item>
                            <Dropdown.Item onClick={() => setIsUnidadesModalOpen(true)}><FaBuilding className="me-2" />Gerenciar Filiais</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row className="g-3 align-items-center">
                        <Col lg={6}>
                            <div className="header-search-container">
                                <FaSearch className="search-icon" />
                                <Form.Control
                                    type="text"
                                    className="search-input"
                                    placeholder="Buscar por nome ou e-mail..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col lg={3} md={6}>
                            <Form.Select value={filtroCargo} onChange={(e) => setFiltroCargo(e.target.value)}><option value="">Filtrar por Cargo</option>{cargos.map(c => (<option key={c.id} value={c.id}>{c.nome_cargo}</option>))}</Form.Select>
                        </Col>
                        <Col lg={3} md={6}>
                            <Form.Select value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)}><option value="">Filtrar por Setor</option>{setores.map(s => (<option key={s.id} value={s.id}>{s.nome_setor}</option>))}</Form.Select>
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
                                                            <div 
                                                                className="fw-bold text-dark"
                                                                onClick={() => handleViewDetails(employee.id)}
                                                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                                title="Ver detalhes"
                                                            >
                                                                {formatarNome(employee.nome_completo)}
                                                            </div>
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

            
            <CargosModal show={isCargosModalOpen} onHide={() => setIsCargosModalOpen(false)} onCargosUpdate={fetchCargos} />
            <SetoresModal show={isSetoresModalOpen} onHide={() => setIsSetoresModalOpen(false)} onSetoresUpdate={fetchSetores} /> 
            <CentroCustoModal show={isCentroCustoModalOpen} onHide={() => setIsCentroCustoModalOpen(false)} />
            <OnboardingTemplateModal show={isOnboardingTemplateModalOpen} onHide={() => setIsOnboardingTemplateModalOpen(false)} />
            <TimesModal show={isTimesModalOpen} onHide={() => setIsTimesModalOpen(false)} />
            <UnidadesModal show={isUnidadesModalOpen} onHide={() => setIsUnidadesModalOpen(false)} onUnidadesUpdate={() => {}} />
            
            <ImportModal 
                show={showImportModal} 
                onHide={() => setShowImportModal(false)}
                onComplete={fetchEmployees}
            />

            <EmployeeEditModal
                show={showAddEditModal}
                onHide={handleCloseAndResetModal}
                employeeToEdit={editingEmployee}
                onSaveSuccess={() => {
                    setSuccessMessage("Operação realizada com sucesso!");
                    fetchEmployees();
                    setTimeout(() => setSuccessMessage(null), 3000);
                }}
            />
            
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