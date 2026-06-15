import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Modal, Spinner, Alert, Button, Badge, Toast, ToastContainer } from 'react-bootstrap';
import { FaGifts, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import apiClient from '../../../services/api';

const Beneficios = () => {
    const [beneficios, setBeneficios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBeneficio, setSelectedBeneficio] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [beneficiosRes, profileRes] = await Promise.all([
                    apiClient.get('/api/beneficios'),
                    apiClient.get('/api/users/me/profile')
                ]);
                setBeneficios(beneficiosRes.data);
                setProfileData(profileRes.data);
            } catch (err) {
                console.error('Erro ao carregar benefícios:', err);
                setError('Não foi possível carregar os benefícios.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleShowModal = (beneficio) => {
        setSelectedBeneficio(beneficio);
        setShowModal(true);
    };

    const handleRequestBeneficio = async (beneficioId) => {
        try {
            await apiClient.post('/api/beneficios/solicitar', { beneficio_id: beneficioId });
            setToastMessage('Benefício solicitado com sucesso! Aguarde a aprovação do RH.');
            setShowToast(true);
            setShowModal(false); // Fecha o modal
            // Recarrega os dados do perfil para atualizar o status
            const profileRes = await apiClient.get('/api/users/me/profile');
            setProfileData(profileRes.data);
        } catch (err) {
            console.error(err);
            setToastMessage(err.response?.data?.error || 'Erro ao solicitar benefício.');
            setShowToast(true);
        }
    };

    return (
        <>
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1055 }}>
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide>
                    <Toast.Header>
                        <strong className="me-auto">Notificação</strong>
                    </Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>

            <div className="mb-4">
                <p className="text-muted">
                    Conheça as vantagens e benefícios oferecidos aos colaboradores. Clique em um benefício para ver os detalhes.
                </p>
            </div>
            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
                    {beneficios.length > 0 ? (
                        beneficios.map(b => (
                            <Col key={b.id}>
                                <Card 
                                    className="h-100 shadow-sm border-0 text-center" 
                                    style={{ cursor: 'pointer', transition: 'transform 0.2s', borderRadius: '12px' }}
                                    onClick={() => handleShowModal(b)}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; }}
                                >
                                    <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                                        {b.logo_url ? (
                                            <img src={b.logo_url} alt={b.nome} style={{ height: '110px', maxWidth: '100%', objectFit: 'contain', marginBottom: '15px' }} />
                                        ) : (
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '110px', height: '110px' }}>
                                                <FaGifts size={48} className="text-secondary" />
                                            </div>
                                        )}
                                        <Card.Title className="fs-6 fw-bold text-dark m-0">{b.nome}</Card.Title>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col xs={12}>
                            <Alert variant="info" className="text-center shadow-sm">Nenhum benefício cadastrado no momento.</Alert>
                        </Col>
                    )}
                </Row>
            )}
            {/* Modal para Visualização do Benefício */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                {selectedBeneficio && profileData && (
                    <>
                        <Modal.Header closeButton className="border-bottom">
                            <Modal.Title className="fw-bold fs-5">{selectedBeneficio.nome}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4">
                            {selectedBeneficio.logo_url && (
                                <div className="text-center mb-4 pb-3 border-bottom">
                                    <img src={selectedBeneficio.logo_url} alt={selectedBeneficio.nome} style={{ height: '120px', objectFit: 'contain' }} />
                                </div>
                            )}
                            {/* Exibe o HTML rico vindo do CKEditor */}
                            <div dangerouslySetInnerHTML={{ __html: selectedBeneficio.descricao || '<p>Informações ainda não disponibilizadas pelo RH.</p>' }} />
                        </Modal.Body>
                        <Modal.Footer className="border-top pt-2">
                            <Button variant="secondary" onClick={() => setShowModal(false)}>Fechar</Button>
                            {(() => {
                                const isAtribuido = profileData.beneficios_atribuidos?.some(b => b.beneficio_id === selectedBeneficio.id);
                                const isPendente = profileData.solicitacoes_beneficios?.some(s => s.beneficio_id === selectedBeneficio.id && s.status === 'Pendente');

                                if (isAtribuido) {
                                    return <Badge bg="success" className="p-2"><FaCheckCircle /> Você já possui este benefício</Badge>;
                                } else if (isPendente) {
                                    return <Badge bg="warning" text="dark" className="p-2"><FaHourglassHalf /> Solicitação Pendente</Badge>;
                                } else {
                                    return <Button variant="primary" onClick={() => handleRequestBeneficio(selectedBeneficio.id)}>Solicitar Benefício</Button>;
                                }
                            })()}
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </>
    );
};

export default Beneficios;