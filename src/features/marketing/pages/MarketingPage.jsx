import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaBoxOpen, FaTasks, FaCogs } from 'react-icons/fa';

const MarketingPage = ({ user }) => {
    // Assumindo que o objeto 'user' tem uma propriedade como 'isAdmin' ou um 'role'
    // para controlar o acesso. Ajuste a condição conforme a estrutura do seu objeto de usuário.
    const isAdmin = user && user.isAdmin;

    const features = [
        {
            title: 'Reserva de Salas',
            description: 'Agende reuniões e eventos nas salas da empresa.',
            link: '/marketing/reservas',
            icon: <FaCalendarAlt size={30} />,
            adminOnly: false,
        },
        {
            title: 'Minhas Solicitações',
            description: 'Peça e acompanhe seus pedidos de material de marketing.',
            link: '/marketing/solicitacoes', // Sugestão de nova rota
            icon: <FaBoxOpen size={30} />,
            adminOnly: false,
        },
        {
            title: 'Gerenciar Produtos',
            description: 'Adicione ou edite os itens de marketing disponíveis.',
            link: '/admin/gerenciar-produtos-marketing',
            icon: <FaCogs size={30} />,
            adminOnly: true,
        },
        {
            title: 'Gerenciar Pedidos de Material',
            description: 'Aprove ou recuse os pedidos de materiais de marketing.',
            link: '/admin/gerenciar-solicitacoes-marketing',
            icon: <FaTasks size={30} />,
            adminOnly: true,
        },
    ];

    const accessibleFeatures = features.filter(feature => !feature.adminOnly || isAdmin);

    return (
        <div className="dash-grid">
            <Container fluid className="p-4">
                <div className="mb-4 pb-3 border-bottom">
                    <h2 className="fw-bold mb-1 text-dark">Módulo de Marketing</h2>
                    <p className="text-muted mb-0">Central de ferramentas e solicitações de marketing.</p>
                </div>

                <Row xs={1} md={2} lg={3} className="g-4">
                    {accessibleFeatures.map((feature, index) => (
                        <Col key={index}>
                            <Link to={feature.link} className="text-decoration-none">
                                <Card as="div" className="h-100 shadow-sm border-0 text-center py-4 px-3" style={{ transition: 'all .2s ease-in-out' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                                    <div className="text-primary mb-3">{feature.icon}</div>
                                    <h5 className="fw-bold text-dark">{feature.title}</h5>
                                    <p className="text-muted small mb-0">{feature.description}</p>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default MarketingPage;