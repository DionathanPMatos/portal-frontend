import React, { useState, useEffect } from 'react';
import { Container, Card, Tabs, Tab, Spinner, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaIndustry } from 'react-icons/fa';
import apiClient from '../../../services/api'; // Importa a instância configurada do Axios

const FabricantePerfilPage = () => { // Renomeado
    const { id } = useParams();
    const navigate = useNavigate();
    const [fabricante, setFabricante] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFabricante = async () => {
            try { // Mantido
                const response = await apiClient.get(`/api/fabricantes/${id}`);
                setFabricante(response.data);
            } catch (err) {
                console.error("Erro ao buscar perfil do fabricante", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFabricante();
    }, [id]);

    if (loading) {
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    }

    if (!fabricante) {
        return <div className="text-center mt-5"><h5>Fabricante não encontrado.</h5><Button onClick={() => navigate(-1)}>Voltar</Button></div>;
    }

    const renderContent = (content) => {
        if (!content) return <p className="text-muted fst-italic mt-3">Nenhuma informação disponível nesta seção.</p>;
        return <div className="mt-3 ck-content" dangerouslySetInnerHTML={{ __html: content }} style={{ lineHeight: '1.6' }}></div>;
    };

    return (
        <Container fluid className="px-4 py-4">
            <Button variant="link" className="text-decoration-none text-muted mb-3 px-0 d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Voltar para lista
            </Button>

            <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
                <Card.Body className="d-flex align-items-center gap-4 p-4">
                    {fabricante.logo_base64 ? (
                        <img src={fabricante.logo_base64} alt={`Logo ${fabricante.name}`} className="border rounded p-2 bg-white shadow-sm" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                    ) : (
                        <div className="bg-light rounded d-flex align-items-center justify-content-center shadow-sm" style={{ width: '120px', height: '120px' }}>
                            <FaIndustry size={40} className="text-muted" />
                        </div>
                    )}
                    <div>
                        <h2 className="fw-bold mb-1">{fabricante.name}</h2>
                        <p className="text-muted mb-0">Perfil Oficial do Fabricante</p>
                    </div>
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
                <Card.Body className="p-4">
                    <Tabs defaultActiveKey="resumo" className="mb-4 custom-tabs">
                        <Tab eventKey="resumo" title="Resumo">
                            {renderContent(fabricante.resumo)}
                        </Tab>
                        <Tab eventKey="key_accounts" title="Key Accounts">
                            {renderContent(fabricante.key_accounts)}
                        </Tab>
                        <Tab eventKey="registros" title="Registros de Projetos">
                            {renderContent(fabricante.registros_projetos)}
                        </Tab>
                        <Tab eventKey="garantias" title="Garantias">
                            {renderContent(fabricante.garantias)}
                        </Tab>
                        <Tab eventKey="prazos" title="Prazos e Compras">
                            {renderContent(fabricante.prazos_compras)}
                        </Tab>
                        <Tab eventKey="certificacoes" title="Certificações Exigidas">
                            {renderContent(fabricante.certificacoes_treinamentos)}
                        </Tab>
                        <Tab eventKey="contatos" title="Contatos Oficiais">
                            {renderContent(fabricante.contatos_suporte)}
                        </Tab>
                        <Tab eventKey="links" title="Links e Ferramentas">
                            {renderContent(fabricante.links_uteis)}
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};
export default FabricantePerfilPage; // Exporta o nome atualizado