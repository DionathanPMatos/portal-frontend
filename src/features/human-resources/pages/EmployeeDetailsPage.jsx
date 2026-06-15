import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Tabs, Tab, Card, Row, Col, Spinner, Alert, ListGroup, Badge, Breadcrumb, Image, Button, Table, OverlayTrigger, Tooltip, ProgressBar, Form } from 'react-bootstrap';
import { FaArrowLeft, FaUser, FaSitemap, FaBuilding, FaUserTie, FaCalendarAlt, FaIdCard, FaDollarSign, FaAddressCard, FaEnvelope, FaUsers, FaEdit, FaPlus, FaTrash, FaFileUpload, FaDownload } from 'react-icons/fa';
import apiClient from '../../../services/api';
import EmployeeEditModal from '../components/EmployeeEditModal'; // 🚀 Importa o modal
import DependentsModal from '../components/DependentsModal'; // Importa o modal de dependentes
import ExamePeriodicoModal from '../components/ExamePeriodicoModal'; // Importa o modal de exames
import StartOnboardingModal from '../components/StartOnboardingModal';

const EmployeeDetailsPage = () => {
    const { id: employeeId } = useParams(); // Pega o ID da URL
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDependentsModal, setShowDependentsModal] = useState(false);
    const [editingDependent, setEditingDependent] = useState(null);
    const [showExameModal, setShowExameModal] = useState(false);
    const [showStartOnboardingModal, setShowStartOnboardingModal] = useState(false);
    const [editingExame, setEditingExame] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [currentDocType, setCurrentDocType] = useState('');

    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            if (!employeeId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get(`/api/funcionarios/${employeeId}`);
                setEmployee(response.data);
            } catch (err) {
                console.error('Erro ao buscar detalhes do colaborador:', err);
                setError('Não foi possível carregar os detalhes do colaborador.');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeDetails();
    }, [employeeId, successMessage]); // Recarrega se houver sucesso na edição

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '--';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };
    
    const renderField = (label, value, options = {}) => {
        const { isDate = false, isCurrency = false } = options;
        let displayValue = value || <span className="text-black-50">--</span>;
    
        if (isDate && value) {
            displayValue = new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } else if (isCurrency && (value !== null && value !== undefined)) {
            displayValue = formatCurrency(value);
        }
    
        return (<Col md={4} className="mb-3">
            <div className="text-muted small">{label}</div>
            <div className="fw-semibold">{displayValue}</div>
        </Col>);
    };

    const renderBooleanField = (label, value) => (
        <Col md={4} className="mb-3">
            <div className="text-muted small">{label}</div>
            <div className="fw-semibold">{
                value === true ? <Badge bg="success">Sim</Badge> : (value === false ? <Badge bg="danger">Não</Badge> : <span className="text-black-50">--</span>)
            }</div>
        </Col>
    );

    const handleEditClick = () => { // 🚀 Abre o modal
        setShowEditModal(true);
    };

    const handleSaveSuccess = () => { // 🚀 Callback de sucesso
        setShowEditModal(false);
        setSuccessMessage('Dados do colaborador atualizados com sucesso!');
        // O useEffect vai recarregar os dados
        setTimeout(() => {
            setSuccessMessage(null);
        }, 4000);
    };

    const handleAddDependent = () => {
        setEditingDependent(null);
        setShowDependentsModal(true);
    };

    const handleEditDependent = (dependent) => {
        setEditingDependent(dependent);
        setShowDependentsModal(true);
    };

    const handleDeleteDependent = async (dependentId) => {
        if (window.confirm('Tem certeza que deseja excluir este dependente?')) {
            try {
                await apiClient.delete(`/api/dependentes/${dependentId}`);
                setSuccessMessage('Dependente excluído com sucesso!');
                setTimeout(() => {
                    setSuccessMessage(null); // Isso vai acionar o useEffect para recarregar
                }, 100);
            } catch (err) {
                console.error('Erro ao excluir dependente:', err);
                setError('Não foi possível excluir o dependente.');
            }
        }
    };

    const handleAddExame = () => {
        setEditingExame(null);
        setShowExameModal(true);
    };

    const handleEditExame = (exame) => {
        setEditingExame(exame);
        setShowExameModal(true);
    };

    const handleDeleteExame = async (exameId) => {
        if (window.confirm('Tem certeza que deseja excluir este registro de exame?')) {
            try {
                await apiClient.delete(`/api/exames/${exameId}`);
                setSuccessMessage('Exame excluído com sucesso!');
                setTimeout(() => {
                    setSuccessMessage(null); // Recarrega
                }, 100);
            } catch (err) {
                console.error('Erro ao excluir exame:', err);
                setError('Não foi possível excluir o exame.');
            }
        }
    };

    const handleUploadClick = (docType) => {
        setCurrentDocType(docType);
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('tipo_documento', currentDocType);

        try {
            await apiClient.post(`/api/funcionarios/${employeeId}/documentos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccessMessage('Documento enviado com sucesso!');
            setTimeout(() => setSuccessMessage(null), 100); // Trigger reload
        } catch (err) {
            console.error('Erro no upload:', err);
            setError('Falha ao enviar o documento.');
        } finally {
            setUploading(false);
            event.target.value = null; // Reset file input
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (window.confirm('Tem certeza que deseja excluir este anexo?')) {
            try {
                await apiClient.delete(`/api/documentos/${docId}`);
                setSuccessMessage('Documento excluído com sucesso!');
                setTimeout(() => setSuccessMessage(null), 100); // Trigger reload
            } catch (err) {
                console.error('Erro ao excluir documento:', err);
                setError('Não foi possível excluir o anexo.');
            }
        }
    };

    const handleToggleOnboardingStep = async (etapaId) => {
        try {
            await apiClient.put(`/api/onboarding/etapas/${etapaId}/toggle`);
            setSuccessMessage('Etapa atualizada!');
            setTimeout(() => setSuccessMessage(null), 100); // Recarrega
        } catch (err) {
            setError('Erro ao atualizar etapa.');
        }
    };

    const onboardingProgress = employee?.onboarding ? 
        (employee.onboarding.etapas.filter(e => e.status === 'Concluído').length / employee.onboarding.etapas.length) * 100 
        : 0;

    const renderDocumentsList = (docType) => {
        const docs = employee.documentos?.filter(d => d.tipo_documento === docType) || [];
        if (docs.length === 0) return <ListGroup.Item className="text-muted small">Nenhum anexo.</ListGroup.Item>;
        return docs.map(doc => (
            <ListGroup.Item key={doc.id} className="d-flex justify-content-between align-items-center">
                <a href={doc.url_arquivo} target="_blank" rel="noopener noreferrer">{doc.nome_arquivo}</a>
                <Button variant="light" size="sm" className="text-danger" onClick={() => handleDeleteDocument(doc.id)}><FaTrash /></Button>
            </ListGroup.Item>
        ));
    };

    const renderInfoItem = (icon, label, value, isDate = false) => {
        const displayValue = isDate && value 
            ? new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
            : (value || <span className="text-black-50">--</span>);
    
        return (
            <ListGroup.Item>
                <div className="employee-badge-info-item">
                    <div className="icon">{icon}</div>
                    <div>
                        <div className="label">{label}</div>
                        <div className="value">{displayValue}</div>
                    </div>
                </div>
            </ListGroup.Item>
        );
    };

    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /> Carregando...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!employee) {
        return <Alert variant="warning">Colaborador não encontrado.</Alert>;
    }

    return (
        <div className="container-main p-4">
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} disabled={uploading} />

            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <Breadcrumb>
                <Breadcrumb.Item as={Link} to="/manage-employees">Gestão de Colaboradores</Breadcrumb.Item>
                <Breadcrumb.Item active>{employee.nome_completo}</Breadcrumb.Item>
            </Breadcrumb>

            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaUser /> Detalhes do Colaborador
                    </h2>
                    <p className="page-header-subtitle">Visualize as informações de {employee.nome_completo}.</p>
                </div>
                <div className="page-header-actions-wrapper">
                    <Button variant="primary" className="btn-header-action" onClick={handleEditClick}>
                        <FaEdit className="me-2" />
                        Editar Colaborador
                    </Button>
                    <Link to="/manage-employees" className="btn btn-light">
                        <FaArrowLeft className="me-2" />
                        Voltar para a lista
                    </Link>
                </div>
            </div>

            <Row>
                <Col md={4} lg={3}>
                    <Card className="employee-badge-card mb-4">
                        <Card.Body className="text-center">
                            <Image 
                                src={employee.userpic_url || `https://ui-avatars.com/api/?name=${employee.nome_completo}&background=random`} 
                                roundedCircle 
                                className="mb-3"
                                style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid white', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                            />
                            <h4 className="fw-bold">{employee.nome_completo}</h4>
                            <p className="text-muted">{employee.cargo?.nome_cargo || 'Cargo não definido'}</p>
                        </Card.Body>
                        <ListGroup variant="flush">
                            {renderInfoItem(<FaSitemap />, 'Departamento', employee.setor?.nome_setor)}
                            {renderInfoItem(<FaUsers />, 'Time', employee.time?.nome)}
                            {renderInfoItem(<FaBuilding />, 'Filial', employee.unidade?.nome_unidade)}
                            {renderInfoItem(<FaCalendarAlt />, 'Admissão', employee.data_admissao, true)}
                            {renderInfoItem(<FaIdCard />, 'Matrícula', employee.matricula)}
                            {renderInfoItem(<FaUserTie />, 'Gestor', employee.gestor?.nome_completo)}
                            {renderInfoItem(<FaDollarSign />, 'Centro de Custo', employee.centro_custo?.nome)}
                            {renderInfoItem(<FaAddressCard />, 'CPF', employee.cpf)}
                            {renderInfoItem(<FaEnvelope />, 'E-mail', employee.email)}
                        </ListGroup>
                    </Card>
                </Col>
                <Col md={8} lg={9}>
                    <Tabs defaultActiveKey="pessoal" id="employee-details-tabs" className="mb-3">
                        <Tab eventKey="pessoal" title="Pessoal">
                            <Row>
                                <Col lg={8}>
                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Dados Pessoais</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {renderField('Nome Completo', employee.nome_completo)}
                                                {renderField('Nome Social', employee.nome_social, {})}
                                                {renderField('Data de Nascimento', employee.data_nascimento, { isDate: true })}
                                                {renderField('Nacionalidade', employee.nacionalidade)}
                                                {renderField('UF Natal', employee.uf_natal)}
                                                {renderField('Cidade Natal', employee.cidade_natal)}
                                                {renderField('Cor/Raça', employee.cor_raca)}
                                                {renderField('Gênero', employee.genero, {})}
                                                {renderField('Gênero no Documento', employee.genero_documento)}
                                                {renderField('Estado Civil', employee.estado_civil)}
                                                {renderField('Nome da Mãe', employee.nome_mae)}
                                                {renderField('Nome do Pai', employee.nome_pai)}
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Formação Acadêmica</Card.Header>
                                        <ListGroup variant="flush">
                                            {employee.formacoes && employee.formacoes.length > 0 ? (
                                                employee.formacoes.map(formacao => (
                                                    <ListGroup.Item key={formacao.id}>
                                                        <div className="d-flex justify-content-between">
                                                            <span className="fw-bold">{formacao.titulo_curso || 'Não especificado'}</span>
                                                            <Badge bg="secondary">{formacao.ano_conclusao}</Badge> 
                                                        </div>
                                                        <div>{formacao.instituicao_ensino}</div>
                                                        <div className="text-muted small">{formacao.curso}</div>
                                                    </ListGroup.Item>
                                                ))
                                            ) : (
                                                <ListGroup.Item className="text-muted">Nenhuma formação acadêmica cadastrada.</ListGroup.Item>
                                            )}
                                        </ListGroup>
                                    </Card>

                                    <Card className="mb-4">
                                        <Card.Header className="d-flex justify-content-between align-items-center">
                                            <span className="fw-bold">Dependentes</span>
                                            <Button variant="outline-primary" size="sm" onClick={handleAddDependent}>
                                                <FaPlus className="me-1" /> Adicionar
                                            </Button>
                                        </Card.Header>
                                        <ListGroup variant="flush">
                                            {employee.dependentes && employee.dependentes.length > 0 ? (
                                                employee.dependentes.map(dep => (
                                                    <ListGroup.Item key={dep.id}>
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <div className="fw-bold">{dep.nome_completo}</div>
                                                                <div className="text-muted small">
                                                                    {dep.grau_parentesco} &bull; Nasc: {dep.data_nascimento ? new Date(dep.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'} 
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Button variant="light" size="sm" className="me-2" title="Editar" onClick={() => handleEditDependent(dep)}><FaEdit /></Button>
                                                                <Button variant="light" size="sm" className="text-danger" title="Excluir" onClick={() => handleDeleteDependent(dep.id)}><FaTrash /></Button>
                                                            </div>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))
                                            ) : (<ListGroup.Item className="text-muted">Nenhum dependente cadastrado.</ListGroup.Item>)}
                                        </ListGroup>
                                    </Card>

                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Endereço Residencial</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {renderField('CEP', employee.cep)}
                                                {renderField('Logradouro', employee.logradouro)}
                                                {renderField('Número', employee.numero)}
                                                {renderField('Complemento', employee.complemento)}
                                                {renderField('Bairro', employee.bairro)}
                                                {renderField('Cidade', employee.cidade)}
                                                {renderField('UF', employee.uf)}
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4}>
                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Dados Bancários</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {renderField('Banco', employee.banco)}
                                                {renderField('Tipo de Conta', employee.tipo_conta_bancaria)}
                                                {renderField('Agência', employee.agencia)}
                                                {renderField('Conta', employee.conta)}
                                                {renderField('Tipo de Chave PIX', employee.chave_pix_tipo)}
                                                {renderField('Chave PIX', employee.chave_pix)}
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Pessoa com Deficiência (PCD)</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {renderBooleanField('Possui Deficiência?', employee.pcd)}
                                                {employee.pcd && renderField('Tipo', employee.pcd_tipo)}
                                                {employee.pcd && (
                                                    <Col xs={12}>
                                                        <div className="text-muted small">Observações</div>
                                                        <p>{employee.pcd_observacoes || '--'}</p>
                                                    </Col>
                                                )}
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Benefícios Atribuídos</Card.Header>
                                        <Card.Body>
                                            {employee.beneficios_atribuidos && employee.beneficios_atribuidos.length > 0 ? (
                                                <div className="d-flex flex-wrap gap-2">
                                                    {employee.beneficios_atribuidos.map(item => (
                                                        <OverlayTrigger key={item.beneficio.id} placement="top" overlay={<Tooltip>{item.beneficio.descricao || 'Sem descrição'}</Tooltip>}>
                                                            <Badge bg="primary">{item.beneficio.nome}</Badge>
                                                        </OverlayTrigger>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted small">Nenhum benefício atribuído.</p>
                                            )}
                                        </Card.Body>
                                    </Card>

                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Contato de Emergência</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {renderField('Nome', employee.contato_emergencia_nome)}
                                                {renderField('Parentesco', employee.contato_emergencia_parentesco)}
                                                {renderField('Telefone', employee.contato_emergencia_telefone)}
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="profissional" title="Profissional">
                            <Row>
                                <Col lg={12}>
                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Dados de Admissão e Empresa</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {renderField('Data de Admissão', employee.data_admissao, { isDate: true })}
                                                {renderField('Tipo de Admissão', employee.tipo_admissao)}
                                                {renderField('Matrícula', employee.matricula)}
                                                {renderField('Número do Crachá', employee.numero_cracha)}
                                                {renderBooleanField('Primeiro Emprego', employee.primeiro_emprego)}
                                                {renderField('Data Exame Admissional', employee.data_exame_admissional, { isDate: true })}
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Vínculo, Cargo e Remuneração</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {renderField('Vínculo', employee.vinculo)}
                                                {renderField('Categoria (eSocial)', employee.categoria_trabalhador)}
                                                {renderField('Salário', employee.salario, { isCurrency: true })}
                                                {renderField('Tipo de Salário', employee.tipo_salario)}
                                                {renderField('Forma de Pagamento', employee.forma_pagamento)}
                                                {renderField('Salário Válido a Partir de', employee.salario_valido_a_partir, { isDate: true })}
                                                {renderField('Motivo do Ajuste Salarial', employee.motivo_ajuste_salarial)}
                                                {renderField('Descrição Salarial', employee.descricao_salarial)}
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Jornada de Trabalho</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {renderBooleanField('Possui Registro de Ponto', employee.possui_registro_ponto)}
                                                {renderField('Hora Contratual', employee.hora_contratual)}
                                                {renderField('Jornada de Trabalho', employee.jornada_trabalho)}
                                                {renderField('Tipo de Jornada', employee.tipo_jornada)}
                                                {renderField('Regime de Jornada', employee.regime_jornada)}
                                                {renderField('Tipo de Horário', employee.tipo_horario)}
                                                {renderBooleanField('Adicional Noturno', employee.hora_noturna)}
                                                {renderField('Horas Mensais', employee.horas_mensais)}
                                                {renderField('Descanso Semanal', employee.descanso_semanal_remunerado)}
                                                {renderField('Horário Detalhado', employee.horario_trabalho_detalhado)}
                                                {renderField('Motivo da Jornada', employee.motivo_jornada)}
                                                {renderField('Observação da Jornada', employee.observacao_jornada)}
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    <Card className="mb-4">
                                        <Card.Header className="fw-bold">Informações Legais, Sindicais e eSocial</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {renderField('Sindicato', employee.sindicato)}
                                                {renderBooleanField('Contribuição Sindical', employee.contribuicao_sindical)}
                                                {renderField('Estabilidade', employee.estabilidade)}
                                                {renderBooleanField('Cargo de Confiança', employee.cargo_confianca)}
                                                {renderBooleanField('Recebeu Seguro Desemprego', employee.tem_seguro_desemprego)}
                                                {renderBooleanField('Aposentado', employee.aposentado)}
                                                {renderField('Inscrição Órgão de Classe', employee.inscricao_orgao_classe)}
                                                {renderField('Conselho Profissional', employee.conselho_profissional)}
                                                {renderBooleanField('Membro da CIPA', employee.cipa)}
                                                {renderField('Regime Previdenciário', employee.tipo_regime_previdenciario)}
                                                {renderField('Natureza da Atividade', employee.natureza_atividade)}
                                                {renderField('Indicativo de Admissão', employee.indicativo_admissao)}
                                                {renderBooleanField('Preenche Cota PCD', employee.preenche_cota_pcd)}
                                                {renderField('Agente Nocivo', employee.agente_nocivo)}
                                                {renderBooleanField('Optante FGTS', employee.optante_fgts)}
                                                {renderBooleanField('Possui Imóvel Próprio', employee.possui_imovel_proprio)}
                                                {renderBooleanField('Imóvel Adquirido com FGTS', employee.imovel_adquirido_fgts)}
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="documentos" title="Documentos">
                            <Row>
                                <Col lg={6} className="mb-4">
                                    <Card>
                                        <Card.Header className="fw-bold">CPF</Card.Header>
                                        <Card.Body>{renderField('CPF', employee.cpf)}</Card.Body>
                                        <ListGroup variant="flush">{renderDocumentsList('CPF')}</ListGroup>
                                        <Card.Footer><Button variant="outline-secondary" size="sm" onClick={() => handleUploadClick('CPF')} disabled={uploading && currentDocType === 'CPF'}>{uploading && currentDocType === 'CPF' ? 'Enviando...' : <><FaFileUpload className="me-2" />Anexar CPF</>}</Button></Card.Footer>
                                    </Card>
                                </Col>
                                <Col lg={6} className="mb-4">
                                    <Card>
                                        <Card.Header className="fw-bold">Registro Geral (RG)</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {renderField('Número', employee.rg_numero)}
                                                {renderField('Emissão', employee.rg_data_emissao, { isDate: true })}
                                                {renderField('Órgão Emissor', employee.rg_orgao_emissor)}
                                                {renderField('UF', employee.rg_uf_emissor)}
                                            </Row>
                                        </Card.Body>
                                        <ListGroup variant="flush">{renderDocumentsList('RG')}</ListGroup>
                                        <Card.Footer><Button variant="outline-secondary" size="sm" onClick={() => handleUploadClick('RG')} disabled={uploading && currentDocType === 'RG'}>{uploading && currentDocType === 'RG' ? 'Enviando...' : <><FaFileUpload className="me-2" />Anexar RG</>}</Button></Card.Footer>
                                    </Card>
                                </Col>
                                <Col lg={6} className="mb-4">
                                    <Card>
                                        <Card.Header className="fw-bold">Carteira de Trabalho (CTPS)</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {renderField('Número', employee.numero_ctps)}
                                                {renderField('Série', employee.serie_ctps)}
                                                {renderField('Emissão', employee.data_emissao_ctps, { isDate: true })}
                                                {renderField('UF', employee.uf_emissor_ctps)}
                                                {renderField('PIS/PASEP', employee.pis)}
                                            </Row>
                                        </Card.Body>
                                        <ListGroup variant="flush">{renderDocumentsList('CTPS')}</ListGroup>
                                        <Card.Footer><Button variant="outline-secondary" size="sm" onClick={() => handleUploadClick('CTPS')} disabled={uploading && currentDocType === 'CTPS'}>{uploading && currentDocType === 'CTPS' ? 'Enviando...' : <><FaFileUpload className="me-2" />Anexar CTPS</>}</Button></Card.Footer>
                                    </Card>
                                </Col>
                                <Col lg={6} className="mb-4">
                                    <Card>
                                        <Card.Header className="fw-bold">Carteira de Motorista (CNH)</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {renderField('Número', employee.cnh_numero)}
                                                {renderField('Categoria', employee.cnh_categoria)}
                                                {renderField('Emissão', employee.cnh_data_emissao, { isDate: true })}
                                                {renderField('Validade', employee.cnh_validade, { isDate: true })}
                                            </Row>
                                        </Card.Body>
                                        <ListGroup variant="flush">{renderDocumentsList('CNH')}</ListGroup>
                                        <Card.Footer><Button variant="outline-secondary" size="sm" onClick={() => handleUploadClick('CNH')} disabled={uploading && currentDocType === 'CNH'}>{uploading && currentDocType === 'CNH' ? 'Enviando...' : <><FaFileUpload className="me-2" />Anexar CNH</>}</Button></Card.Footer>
                                    </Card>
                                </Col>
                                <Col lg={6} className="mb-4">
                                    <Card>
                                        <Card.Header className="fw-bold">Título de Eleitor</Card.Header>
                                        <Card.Body><Row>{renderField('Número', employee.titulo_eleitor_numero)}{renderField('Zona', employee.titulo_eleitor_zona)}{renderField('Seção', employee.titulo_eleitor_secao)}</Row></Card.Body>
                                        <ListGroup variant="flush">{renderDocumentsList('TITULO_ELEITOR')}</ListGroup>
                                        <Card.Footer><Button variant="outline-secondary" size="sm" onClick={() => handleUploadClick('TITULO_ELEITOR')} disabled={uploading && currentDocType === 'TITULO_ELEITOR'}>{uploading && currentDocType === 'TITULO_ELEITOR' ? 'Enviando...' : <><FaFileUpload className="me-2" />Anexar Título</>}</Button></Card.Footer>
                                    </Card>
                                </Col>
                                <Col lg={6} className="mb-4">
                                    <Card>
                                        <Card.Header className="fw-bold">Certificado de Reservista</Card.Header>
                                        <Card.Body><Row>{renderField('Número', employee.reservista_numero)}{renderField('RA', employee.reservista_ra)}{renderField('Categoria', employee.reservista_categoria)}</Row></Card.Body>
                                        <ListGroup variant="flush">{renderDocumentsList('RESERVISTA')}</ListGroup>
                                        <Card.Footer><Button variant="outline-secondary" size="sm" onClick={() => handleUploadClick('RESERVISTA')} disabled={uploading && currentDocType === 'RESERVISTA'}>{uploading && currentDocType === 'RESERVISTA' ? 'Enviando...' : <><FaFileUpload className="me-2" />Anexar Reservista</>}</Button></Card.Footer>
                                    </Card>
                                </Col>

                                {/* Novas seções de documentos */}
                                <Col lg={12} className="mb-4">
                                    <Card>
                                        <Card.Header className="d-flex justify-content-between align-items-center fw-bold">
                                            <span>Exames Periódicos</span>
                                            <Button variant="outline-primary" size="sm" onClick={handleAddExame}><FaPlus className="me-1" /> Adicionar Exame</Button>
                                        </Card.Header>
                                        <ListGroup variant="flush">
                                            {employee.exames_periodicos && employee.exames_periodicos.length > 0 ? (
                                                employee.exames_periodicos.map(exame => (
                                                    <ListGroup.Item key={exame.id}>
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <div className="fw-bold">{exame.motivo} - <Badge bg={exame.status === 'Concluído' ? 'success' : (exame.status === 'Atrasado' ? 'danger' : 'warning')}>{exame.status}</Badge></div>
                                                                <div className="text-muted small">Data: {exame.data_exame ? new Date(exame.data_exame).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</div>
                                                                {exame.anexo_url && <a href={exame.anexo_url} target="_blank" rel="noopener noreferrer" className="small">Ver anexo</a>}
                                                            </div>
                                                            <div>
                                                                <Button variant="light" size="sm" className="me-2" title="Editar" onClick={() => handleEditExame(exame)}><FaEdit /></Button>
                                                                <Button variant="light" size="sm" className="text-danger" title="Excluir" onClick={() => handleDeleteExame(exame.id)}><FaTrash /></Button>
                                                            </div>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))
                                            ) : (<ListGroup.Item className="text-muted">Nenhum exame periódico registrado.</ListGroup.Item>)}
                                        </ListGroup>
                                    </Card>
                                </Col>

                                <Col lg={6} className="mb-4">
                                    <Card><Card.Header className="fw-bold">Recibos</Card.Header><ListGroup variant="flush">{renderDocumentsList('RECIBOS')}</ListGroup><Card.Footer><Button variant="outline-secondary" size="sm" onClick={() => handleUploadClick('RECIBOS')} disabled={uploading && currentDocType === 'RECIBOS'}>{uploading && currentDocType === 'RECIBOS' ? 'Enviando...' : <><FaFileUpload className="me-2" />Anexar Recibo</>}</Button></Card.Footer></Card>
                                </Col>
                                <Col lg={6} className="mb-4">
                                    <Card><Card.Header className="fw-bold">Termos e Contratos</Card.Header><ListGroup variant="flush">{renderDocumentsList('TERMOS_CONTRATOS')}</ListGroup><Card.Footer><Button variant="outline-secondary" size="sm" onClick={() => handleUploadClick('TERMOS_CONTRATOS')} disabled={uploading && currentDocType === 'TERMOS_CONTRATOS'}>{uploading && currentDocType === 'TERMOS_CONTRATOS' ? 'Enviando...' : <><FaFileUpload className="me-2" />Anexar Contrato</>}</Button></Card.Footer></Card>
                                </Col>
                                <Col lg={6} className="mb-4">
                                    <Card><Card.Header className="fw-bold">Recessos</Card.Header><ListGroup variant="flush">{renderDocumentsList('RECESSOS')}</ListGroup><Card.Footer><Button variant="outline-secondary" size="sm" onClick={() => handleUploadClick('RECESSOS')} disabled={uploading && currentDocType === 'RECESSOS'}>{uploading && currentDocType === 'RECESSOS' ? 'Enviando...' : <><FaFileUpload className="me-2" />Anexar Recesso</>}</Button></Card.Footer></Card>
                                </Col>
                                <Col lg={6} className="mb-4">
                                    <Card><Card.Header className="fw-bold">Documentos Adicionais</Card.Header><ListGroup variant="flush">{renderDocumentsList('DOCUMENTOS_ADICIONAIS')}</ListGroup><Card.Footer><Button variant="outline-secondary" size="sm" onClick={() => handleUploadClick('DOCUMENTOS_ADICIONAIS')} disabled={uploading && currentDocType === 'DOCUMENTOS_ADICIONAIS'}>{uploading && currentDocType === 'DOCUMENTOS_ADICIONAIS' ? 'Enviando...' : <><FaFileUpload className="me-2" />Anexar Outro</>}</Button></Card.Footer></Card>
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="historico-profissional" title="Histórico Profissional">
                            <Card>
                                <Card.Header>Histórico de Cargos e Salários</Card.Header>
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Data da Alteração</th>
                                            <th>Cargo Anterior</th>
                                            <th>Cargo Novo</th>
                                            <th>Salário Anterior</th>
                                            <th>Salário Novo</th>
                                            <th>Motivo</th>
                                            <th>Alterado Por</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employee.historico_profissional?.length > 0 ? (
                                            employee.historico_profissional.map(h => (
                                                <tr key={h.id}>
                                                    <td>{new Date(h.data_alteracao).toLocaleString('pt-BR')}</td>
                                                    <td>{h.cargo_anterior || '--'}</td>
                                                    <td>{h.cargo_novo || '--'}</td>
                                                    <td>{formatCurrency(h.salario_anterior)}</td>
                                                    <td>{formatCurrency(h.salario_novo)}</td>
                                                    <td>{h.motivo || '--'}</td>
                                                    <td>{h.alterado_por?.nome_completo || 'Sistema'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center text-muted">Nenhum histórico profissional encontrado.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Card>
                        </Tab>
                        <Tab eventKey="log-alteracoes" title="Log de Alterações">
                            <Card>
                                <Card.Header>Registro de Alterações de Dados</Card.Header>
                                <Table striped bordered hover responsive size="sm">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Campo Alterado</th>
                                            <th>Valor Antigo</th>
                                            <th>Valor Novo</th>
                                            <th>Alterado Por</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employee.historico_alteracoes?.length > 0 ? (
                                            employee.historico_alteracoes.map(log => (
                                                <tr key={log.id}>
                                                    <td>{new Date(log.data_alteracao).toLocaleString('pt-BR')}</td>
                                                    <td><strong>{log.campo_alterado}</strong></td>
                                                    <td><span className="text-danger">{log.valor_antigo || 'Vazio'}</span></td>
                                                    <td><span className="text-success">{log.valor_novo || 'Vazio'}</span></td>
                                                    <td>{log.alterado_por?.nome_completo || 'Sistema'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted">Nenhum registro de alteração encontrado.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Card>
                        </Tab>
                        <Tab eventKey="onboarding" title="Onboarding">
                            {employee.onboarding ? (
                                <Card>
                                    <Card.Header>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>Progresso do Onboarding</span>
                                            <span className="fw-bold">{onboardingProgress.toFixed(0)}%</span>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <ProgressBar now={onboardingProgress} label={`${onboardingProgress.toFixed(0)}%`} className="mb-4" />
                                        <ListGroup>
                                            {employee.onboarding.etapas.map(etapa => (
                                                <ListGroup.Item key={etapa.id}>
                                                    <Form.Check 
                                                        type="checkbox"
                                                        id={`etapa-${etapa.id}`}
                                                        label={etapa.etapa_template.titulo}
                                                        checked={etapa.status === 'Concluído'}
                                                        onChange={() => handleToggleOnboardingStep(etapa.id)}
                                                    />
                                                    {etapa.status === 'Concluído' && (
                                                        <div className="text-muted small ps-4">
                                                            Concluído por {etapa.concluido_por?.nome_completo || 'N/A'} em {new Date(etapa.data_conclusao).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            ) : (
                                <Alert variant="info">Nenhum processo de onboarding iniciado para este colaborador. <Button variant="link" onClick={() => setShowStartOnboardingModal(true)}>Iniciar Onboarding</Button></Alert>
                            )}
                        </Tab>
                    </Tabs>
                </Col>
            </Row>

            <EmployeeEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                employeeToEdit={employee}
                onSaveSuccess={handleSaveSuccess}
            />

            <DependentsModal
                show={showDependentsModal}
                onHide={() => setShowDependentsModal(false)}
                onSaveSuccess={() => {
                    setShowDependentsModal(false);
                    setSuccessMessage('Dependente salvo com sucesso!');
                    setTimeout(() => setSuccessMessage(null), 100); // Recarrega os dados
                }}
                employeeId={employeeId}
                dependentToEdit={editingDependent}
            />

            <ExamePeriodicoModal
                show={showExameModal}
                onHide={() => setShowExameModal(false)}
                onSaveSuccess={() => {
                    setShowExameModal(false);
                    setSuccessMessage('Registro de exame salvo com sucesso!');
                    setTimeout(() => setSuccessMessage(null), 100); // Recarrega
                }}
                employeeId={employeeId}
                exameToEdit={editingExame}
            />

            <StartOnboardingModal
                show={showStartOnboardingModal}
                onHide={() => setShowStartOnboardingModal(false)}
                employeeId={employeeId}
                onSuccess={() => {
                    setShowStartOnboardingModal(false);
                    setSuccessMessage('Onboarding iniciado com sucesso!');
                    setTimeout(() => setSuccessMessage(null), 100);
                }}
            />
        </div>
    );
};

export default EmployeeDetailsPage;