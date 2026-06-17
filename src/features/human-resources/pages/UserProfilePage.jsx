import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Image, Tabs, Tab, Spinner, Alert, Badge, ListGroup, Form, ProgressBar, Button, Toast, ToastContainer } from 'react-bootstrap';
import { FaUser, FaSitemap, FaBuilding, FaUserTie, FaClock, FaMoneyBillWave, FaCar, FaChartLine, FaCog, FaFileInvoiceDollar, FaBook, FaAddressCard, FaShieldAlt, FaGift, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import { IMaskInput } from 'react-imask';
import apiClient from '../../../services/api';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';

const UserProfilePage = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allBeneficios, setAllBeneficios] = useState([]);
    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    // State para o formulário "Meus Dados"
    const [myDataForm, setMyDataForm] = useState({});

    const fetchProfileData = async () => {
        try {
            const [profileRes, beneficiosRes] = await Promise.all([
                apiClient.get('/api/users/me/profile'),
                apiClient.get('/api/beneficios')
            ]);
            setProfileData(profileRes.data);
            setAllBeneficios(beneficiosRes.data);
            setMyDataForm(profileRes.data);
        } catch (err) {
            setError('Não foi possível carregar os dados do perfil.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleMyDataChange = (e) => {
        const { name, value } = e.target;
        setMyDataForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            return;
        }
        try {
            const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            if (!data.erro) {
                setMyDataForm(prev => ({
                    ...prev,
                    logradouro: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                    uf: data.uf,
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await apiClient.put('/api/users/me/profile', myDataForm);
            let message = "Seus dados foram salvos com sucesso!";
            if (response.data.dadosParaAprovacao) {
                message += " Dados sensíveis foram enviados para aprovação do RH.";
            }
            setToastMessage(message);
            setShowToast(true);
        } catch (err) { 
            console.error(err);
            setError('Erro ao salvar as alterações.');
        } finally {
            setSaving(false);
        }
    };

    const handleRequestBeneficio = async (beneficioId) => {
        try {
            await apiClient.post('/api/beneficios/solicitar', { beneficio_id: beneficioId });
            setToastMessage('Benefício solicitado com sucesso! Aguarde a aprovação do RH.');
            setShowToast(true);
            // Recarrega os dados para atualizar o status
            fetchProfileData();
        } catch (err) {
            console.error(err);
            setToastMessage(err.response?.data?.error || 'Erro ao solicitar benefício.');
            setShowToast(true);
        }
    };

    const calculateTenure = (startDate) => {
        if (!startDate) return 'N/A';
        const start = new Date(startDate);
        const now = new Date();
        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();

        if (months < 0) {
            years--;
            months += 12;
        }

        const parts = [];
        if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`);
        if (months > 0) parts.push(`${months} m${months > 1 ? 'eses' : 'ês'}`);
        if (parts.length === 0) return 'Menos de um mês';

        return parts.join(' e ');
    };

    const getStatusBadge = (status) => {
        const variants = {
            'Pendente': 'warning',
            'Pendente Gestor': 'warning',
            'Aprovado': 'success',
            'Recusado': 'danger',
            'Em Andamento': 'primary',
            'Finalizada': 'secondary',
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /> Carregando perfil...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!profileData) {
        return <Alert variant="warning">Não foi possível encontrar os dados do perfil. Tente fazer login novamente.</Alert>;
    }

    if (!profileData) {
        return <Alert variant="warning">Não foi possível encontrar os dados do perfil. Tente fazer login novamente.</Alert>;
    }

    return (
        <div className="container-main p-4">
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1055 }}>
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide>
                    <Toast.Header>
                        <strong className="me-auto">Sucesso</strong>
                    </Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>

            <Container fluid className="px-0">
                <div className="page-header-colored mb-4">
                    <div className="page-header-title-wrapper">
                        <h2 className="page-header-title d-flex align-items-center gap-3">
                            <FaUser /> Meu Perfil
                        </h2>
                        <p className="page-header-subtitle">Gerencie suas informações, solicitações e preferências em um só lugar.</p>
                    </div>
                </div>

                {/* Crachá Digital */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col xs={12} md={2} className="text-center mb-3 mb-md-0">
                                <Image src={profileData.userpic_url || `https://ui-avatars.com/api/?name=${user.nome_completo}&background=random`} roundedCircle style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid #eee' }} />
                            </Col>
                            <Col xs={12} md={10}>
                                <h2 className="fw-bold text-dark mb-1">{profileData.nome_completo}</h2>
                                <div className="d-flex flex-wrap gap-3 text-muted">
                                    <span className="d-flex align-items-center gap-2"><FaUser /> {profileData.cargo?.nome_cargo || 'N/A'}</span>
                                    <span className="d-flex align-items-center gap-2"><FaSitemap /> {profileData.setor?.nome_setor || 'N/A'}</span>
                                    <span className="d-flex align-items-center gap-2"><FaBuilding /> {profileData.unidade?.nome_unidade || 'N/A'}</span>
                                </div>
                                <hr />
                                <div className="d-flex flex-wrap gap-3 text-muted small">
                                    <span className="d-flex align-items-center gap-2"><FaUserTie /> <strong>Gestor:</strong> {profileData.gestor?.nome_completo || 'N/A'}</span>
                                    <span className="d-flex align-items-center gap-2"><FaClock /> <strong>Tempo de Casa:</strong> {calculateTenure(profileData.created_at)}</span>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                
                {/* Abas de Conteúdo */}
                <Tabs defaultActiveKey="meus-dados" id="profile-tabs" className="mb-3 custom-tabs" justify>
                    <Tab eventKey ="meus-dados" title={<><FaAddressCard className="me-2" />Informações Pessoais</>}>
                        <Alert variant="info" className="mt-3">
                            <FaShieldAlt className="me-2" />
                            Alterações em contatos e medidas são atualizadas imediatamente. Alterações de endereço e dados bancários serão enviadas para aprovação do RH.
                        </Alert>
                        <Form onSubmit={handleUpdateProfile}>
                            <Row>
                                <Col md={6}>
                                    <Card className="shadow-sm border-0 mb-4">
                                        <Card.Header className="fw-bold">Contatos Pessoais</Card.Header>
                                        <Card.Body>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Celular (WhatsApp)</Form.Label>
                                                <IMaskInput
                                                    mask="(00) 00000-0000"
                                                    value={myDataForm.contato || ''}
                                                    name="contato"
                                                    onAccept={(value) => handleMyDataChange({ target: { name: 'contato', value } })}
                                                    className="form-control"
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>E-mail Pessoal</Form.Label>
                                            <Form.Control 
                                                type="email" 
                                                name="email_pessoal" value={myDataForm.email_pessoal || ''} onChange={handleMyDataChange} 
                                            />
                                            </Form.Group>
                                            <hr />
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nome do Contato de Emergência</Form.Label>
                                                <Form.Control type="text" name="contato_emergencia_nome" value={myDataForm.contato_emergencia_nome || ''} onChange={handleMyDataChange} />
                                            </Form.Group>
                                            <Row>
                                            <Col><Form.Group className="mb-3"><Form.Label>Parentesco</Form.Label><Form.Control type="text" name="contato_emergencia_parentesco" value={myDataForm.contato_emergencia_parentesco || ''} onChange={handleMyDataChange} /></Form.Group></Col>
                                                <Col><Form.Group className="mb-3"><Form.Label>Telefone</Form.Label>
                                                    <IMaskInput
                                                        mask="(00) 00000-0000"
                                                        value={myDataForm.contato_emergencia_telefone || ''}
                                                        name="contato_emergencia_telefone"
                                                        onAccept={(value) => handleMyDataChange({ target: { name: 'contato_emergencia_telefone', value } })}
                                                        className="form-control"
                                                    />
                                                </Form.Group></Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    <Card className="shadow-sm border-0 mb-4">
                                        <Card.Header className="fw-bold">Medidas (Marketing/RH)</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                <Col><Form.Group className="mb-3"><Form.Label>Tamanho da Camiseta</Form.Label><Form.Select name="tamanho_camiseta" value={myDataForm.tamanho_camiseta || ''} onChange={handleMyDataChange}><option value="">Selecione</option><option>P</option><option>M</option><option>G</option><option>GG</option><option>XG</option></Form.Select></Form.Group></Col>
                                                <Col><Form.Group className="mb-3"><Form.Label>Tamanho do Calçado</Form.Label><Form.Control type="number" name="tamanho_calcado" value={myDataForm.tamanho_calcado || ''} onChange={handleMyDataChange} /></Form.Group></Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="shadow-sm border-0 mb-4">
                                        <Card.Header className="fw-bold">Endereço Residencial</Card.Header>
                                        <Card.Body>
                                            <Row><Col md={5}><Form.Group className="mb-3"><Form.Label>CEP</Form.Label>
                                                <IMaskInput
                                                    mask="00000-000"
                                                    value={myDataForm.cep || ''}
                                                    name="cep"
                                                    onAccept={(value) => handleMyDataChange({ target: { name: 'cep', value } })}
                                                    onBlur={handleCepBlur}
                                                    className="form-control"
                                                />
                                            </Form.Group></Col></Row>
                                            <Form.Group className="mb-3"><Form.Label>Rua / Logradouro</Form.Label><Form.Control type="text" name="logradouro" value={myDataForm.logradouro || ''} onChange={handleMyDataChange} /></Form.Group>
                                            <Row>
                                                <Col><Form.Group className="mb-3"><Form.Label>Número</Form.Label><Form.Control type="text" name="numero" value={myDataForm.numero || ''} onChange={handleMyDataChange} /></Form.Group></Col>
                                                <Col><Form.Group className="mb-3"><Form.Label>Complemento</Form.Label><Form.Control type="text" name="complemento" value={myDataForm.complemento || ''} onChange={handleMyDataChange} /></Form.Group></Col>
                                            </Row>
                                            <Form.Group className="mb-3"><Form.Label>Bairro</Form.Label><Form.Control type="text" name="bairro" value={myDataForm.bairro || ''} onChange={handleMyDataChange} /></Form.Group>
                                            <Row>
                                                <Col><Form.Group className="mb-3"><Form.Label>Cidade</Form.Label><Form.Control type="text" name="cidade" value={myDataForm.cidade || ''} onChange={handleMyDataChange} /></Form.Group></Col>
                                                <Col md={4}><Form.Group className="mb-3"><Form.Label>Estado</Form.Label><Form.Control type="text" name="uf" value={myDataForm.uf || ''} onChange={handleMyDataChange} maxLength="2" /></Form.Group></Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    <Card className="shadow-sm border-0 mb-4">
                                        <Card.Header className="fw-bold">Dados Bancários (Pagamentos)</Card.Header>
                                        <Card.Body>
                                            <Form.Group className="mb-3"><Form.Label>Banco</Form.Label><Form.Control type="text" name="banco" value={myDataForm.banco || ''} onChange={handleMyDataChange} /></Form.Group>
                                            <Row>
                                                <Col><Form.Group className="mb-3"><Form.Label>Agência</Form.Label><Form.Control type="text" name="agencia" value={myDataForm.agencia || ''} onChange={handleMyDataChange} /></Form.Group></Col>
                                                <Col><Form.Group className="mb-3"><Form.Label>Conta Corrente</Form.Label><Form.Control type="text" name="conta" value={myDataForm.conta || ''} onChange={handleMyDataChange} /></Form.Group></Col>
                                            </Row>
                                            <Row>
                                                <Col md={5}><Form.Group className="mb-3"><Form.Label>Tipo de Chave</Form.Label><Form.Select name="chave_pix_tipo" value={myDataForm.chave_pix_tipo || ''} onChange={handleMyDataChange}><option value="">Selecione</option><option value="CPF">CPF</option><option value="CNPJ">CNPJ</option><option value="Email">E-mail</option><option value="Celular">Celular</option><option value="Aleatoria">Aleatória</option></Form.Select></Form.Group></Col>
                                                <Col md={7}><Form.Group className="mb-3"><Form.Label>Chave PIX</Form.Label><Form.Control type="text" name="chave_pix" value={myDataForm.chave_pix || ''} onChange={handleMyDataChange} /></Form.Group></Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <div className="text-end mt-3">
                                <Button type="submit" variant="primary" size="lg" disabled={saving}>
                                    {saving ? <><Spinner as="span" size="sm" /> Salvando...</> : 'Salvar Alterações'}
                                </Button>
                            </div>
                        </Form>
                    </Tab>

                    <Tab eventKey="beneficios" title={<><FaGift className="me-2" />Meus Benefícios</>}>
                        <Row className="g-4 mt-2">
                            <Col md={12}>
                                <Card className="shadow-sm border-0">
                                    <Card.Header className="fw-bold">Benefícios Ativos</Card.Header>
                                    <ListGroup variant="flush">
                                        {profileData.beneficios_atribuidos?.length > 0 ? (
                                            profileData.beneficios_atribuidos.map(item => (
                                                <ListGroup.Item key={item.beneficio.id} className="d-flex align-items-center p-3">
                                                    {item.beneficio.logo_url ? (
                                                        <Image src={item.beneficio.logo_url} style={{ height: '40px', width: '60px', objectFit: 'contain', marginRight: '1rem' }} />
                                                    ) : (
                                                        <FaGift className="me-3 text-primary" size={24} />
                                                    )}
                                                    <div>
                                                        <h6 className="mb-0 fw-bold">{item.beneficio.nome}</h6>
                                                        <div className="text-muted small" dangerouslySetInnerHTML={{ __html: item.beneficio.descricao?.substring(0, 120) + '...' }} />
                                                    </div>
                                                </ListGroup.Item>
                                            ))
                                        ) : (
                                            <ListGroup.Item className="text-muted p-4 text-center">Você ainda não possui benefícios ativos.</ListGroup.Item>
                                        )}
                                    </ListGroup>
                                </Card>
                            </Col>
                            <Col md={12}>
                                <Card className="shadow-sm border-0">
                                    <Card.Header className="fw-bold">Minhas Solicitações</Card.Header>
                                    <ListGroup variant="flush">
                                        {profileData.solicitacoes_beneficios?.filter(s => s.status === 'Pendente').length > 0 ? (
                                            profileData.solicitacoes_beneficios.filter(s => s.status === 'Pendente').map(solicitacao => (
                                                <ListGroup.Item key={solicitacao.id} className="d-flex justify-content-between align-items-center">
                                                    <span>Benefício <strong>{allBeneficios.find(b => b.id === solicitacao.beneficio_id)?.nome}</strong> solicitado em {new Date(solicitacao.data_solicitacao).toLocaleDateString()}.</span>
                                                    <Badge bg="warning" text="dark"><FaHourglassHalf /> Pendente</Badge>
                                                </ListGroup.Item>
                                            ))
                                        ) : (
                                            <ListGroup.Item className="text-muted text-center p-4">Nenhuma solicitação de benefício pendente.</ListGroup.Item>
                                        )}
                                    </ListGroup>
                                     <Card.Footer className="text-center"><Link to="/rh/beneficios"><Button variant="outline-primary">Ver todos os benefícios e solicitar novos</Button></Link></Card.Footer>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>

                    <Tab eventKey="requests" title={<><FaMoneyBillWave className="me-2" />Meu Hub de Solicitações</>}>
                        <Row>
                            <Col lg={6}>
                                <h5 className="fw-bold mb-3">Minhas Despesas e Adiantamentos</h5>
                                <ListGroup>
                                    {profileData.solicitacoes_financeiras.length > 0 ? profileData.solicitacoes_financeiras.map(req => (
                                        <ListGroup.Item key={req.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="fw-bold">{req.tipo}</span> - {formatCurrency(req.total_solicitado)}
                                                <div className="text-muted small">{new Date(req.created_at).toLocaleDateString()}</div>
                                            </div>
                                            {getStatusBadge(req.status)}
                                        </ListGroup.Item>
                                    )) : <p className="text-muted">Nenhuma solicitação financeira recente.</p>}
                                </ListGroup>
                            </Col>
                            <Col lg={6} className="mt-4 mt-lg-0">
                                <h5 className="fw-bold mb-3">Minhas Reservas de Frota</h5>
                                <ListGroup>
                                    {profileData.frota_reservas_usuario.length > 0 ? profileData.frota_reservas_usuario.map(res => (
                                        <ListGroup.Item key={res.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="fw-bold">{res.veiculo.modelo} ({res.veiculo.placa})</span>
                                                <div className="text-muted small">{new Date(res.data_inicio).toLocaleDateString()} - {new Date(res.data_fim).toLocaleDateString()}</div>
                                            </div>
                                            {getStatusBadge(res.status)}
                                        </ListGroup.Item>
                                    )) : <p className="text-muted">Nenhuma reserva de frota recente.</p>}
                                </ListGroup>
                            </Col>
                        </Row>
                    </Tab>

                    {profileData.performance && (
                        <Tab eventKey="performance" title={<><FaChartLine className="me-2" />Performance</>}>
                            <Card className="shadow-sm border-0">
                                <Card.Header className="fw-bold">Desempenho de Vendas (Mês Atual)</Card.Header>
                                <Card.Body>
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <div>
                                                <p className="text-muted mb-1">Meta do Mês</p>
                                                <h3 className="fw-bolder text-primary">{formatCurrency(profileData.performance.meta)}</h3>
                                            </div>
                                            <div className="mt-3">
                                                <p className="text-muted mb-1">Realizado até Agora</p>
                                                <h3 className="fw-bolder text-success">{formatCurrency(profileData.performance.realizado)}</h3>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <p className="text-center">Progresso da Meta</p>
                                            <ProgressBar 
                                                now={(profileData.performance.realizado / profileData.performance.meta) * 100} 
                                                label={`${((profileData.performance.realizado / profileData.performance.meta) * 100).toFixed(1)}%`} 
                                                style={{ height: '25px', fontSize: '1rem' }}
                                            />
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Tab>
                    )}

                    <Tab eventKey="preferences" title={<><FaCog className="me-2" />Preferências</>}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="fw-bold">Configurações da Conta</Card.Header>
                            <Card.Body>
                                <Form>
                                    <Form.Check 
                                        type="switch"
                                        id="email-notifications-switch"
                                        label="Receber notificações por e-mail"
                                        className="mb-3"
                                        defaultChecked
                                    />
                                    <Form.Check 
                                        type="switch"
                                        id="dark-theme-switch"
                                        label="Ativar tema escuro (Em breve)"
                                        disabled
                                    />
                                    <hr />
                                    <Button variant="outline-primary" onClick={() => setShowChangePasswordModal(true)}>
                                        Alterar Senha de Acesso
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Tab>

                    <Tab eventKey="overview" title={<><FaBook className="me-2" />Visão Geral</>}>
                        <Row className="g-4">
                            <Col md={12}>
                                <Card className="shadow-sm border-0 h-100">
                                    <Card.Header className="fw-bold">Documentos e Holerites</Card.Header>
                                    <Card.Body>
                                        <p className="text-muted">Acesse seu holerite e outros documentos importantes.</p>
                                        <ListGroup>
                                            <ListGroup.Item action disabled>Holerite - {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} (Em breve)</ListGroup.Item>
                                            <ListGroup.Item action disabled>Contrato de Trabalho (Em breve)</ListGroup.Item>
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>
                    
                    
                </Tabs>
            </Container>

            <ChangePasswordModal 
                show={showChangePasswordModal}
                onHide={() => setShowChangePasswordModal(false)}
                onSuccess={(message) => {
                    setToastMessage(message);
                    setShowToast(true);
                }}
            />
        </div>
    );
};

export default UserProfilePage;