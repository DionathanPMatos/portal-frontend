import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaIndustry, FaUsers, FaChevronRight, FaSitemap, FaImages, FaCogs } from 'react-icons/fa';
import { MdOutlineAttachMoney, MdCardGiftcard } from "react-icons/md";
import { AiFillSafetyCertificate, AiFillAlert } from "react-icons/ai";
import { SiHomeassistantcommunitystore } from "react-icons/si";
import { GiFloorHatch, GiKeyCard } from "react-icons/gi";
import { RiTeamFill, RiProjectorFill } from "react-icons/ri";
import { IoColorPalette } from "react-icons/io5"; // Novo ícone
import { FaChartPie, FaRegNewspaper, FaBoxOpen } from "react-icons/fa"; 
import { FaSearchDollar } from "react-icons/fa";

// Estrutura de dados organizada por seções
const dashboardSections = [
    {
        title: 'Comercial',
        cards: [
            {
                title: 'Gerenciar Campanhas',
                text: 'Ajuste as configurações das campanhas de vendas.',
                icon: <MdOutlineAttachMoney size={24} />,
                link: '/admin/campanhas',
            },
            {
                title: 'Avisos e Alertas',
                text: 'Crie um novo alerta para os usuários do sistema.',
                icon: <AiFillAlert size={24} />,
                link: '/admin/campanhas',
            },
            {
                title: 'Registro de Projetos',
                text: 'Edite a seção de registro de projetos no sistema.',
                icon: <RiProjectorFill size={24} />,
                link: '/registro',
            },
            {
                title: 'Gerenciar Dashboard',
                text: 'Importar faturamento, limpar dados e definir metas.',
                icon: <FaChartPie size={24} />,
                link: '/admin/resultados',
            },
        ]
    },
    {
        title: 'Agentes (Prospecção)',
        cards: [
            {
                title: 'Gerenciar Leads',
                text: 'Gerenciar leads de empresas sugeridos pelo agente.',
                icon: <FaSearchDollar size={24} />,
                link: '/admin/gerenciar-leads',
            },
        ],
    },
    {
        title: 'DTC',
        cards: [
            {
                title: 'Gerenciar Fabricantes',
                text: 'Adicione, edite e remova fabricantes do sistema.',
                icon: <FaIndustry size={24} />,
                link: '/admin/fabricantes',
            },
            {
                title: 'Garantias',
                text: 'Edite a seção de garantias de fabricantes do DTC.',
                icon: <AiFillSafetyCertificate size={24} />,
                link: '/admin/monitoramento',
            },
            {
                title: 'Gerentes de Produtos',
                text: 'Edite os gerentes de produtos do DTC.',
                icon: <FaUsers size={24} />,
                link: '/admin/relatorios',
            },
        ],
    },
    {
        title: 'Recursos Humanos (RH)',
        cards: [
            {
                title: 'Gerenciar Usuários',
                text: 'Crie e gerencie contas de usuários com permissões.',
                icon: <FaUserPlus size={24} />,
                link: '/manage-employees',
            },
            {
                title: 'Benefícios',
                text: 'Gerencie os benefícios oferecidos pela empresa.',
                icon: <GiFloorHatch size={24} />,
                link: '/admin/beneficios',
            },
        ],
    },
    {
        title: 'Compras',
        cards: [
            {
                title: 'Prazos e Importações',
                text: 'Edite os prazos e importações.',
                icon: <SiHomeassistantcommunitystore size={24} />,
                link: '/admin/relatorios',
            },
            {
                title: 'Equipe de Compras',
                text: 'Edite a equipe de compras.',
                icon: <RiTeamFill size={24} />,
                link: '/admin/relatorios',
            },
        ],
    },
    {
        title: 'Marketing',
        cards: [
            {
                title: 'Gerenciar Produtos',
                text: 'Cadastre e edite materiais de marketing (brindes, etc).',
                icon: <FaBoxOpen size={24} />,
                link: '/admin/marketing/produtos',
            },
            {
                title: 'Gerenciar Pedidos de Material',
                text: 'Aprove ou recuse as solicitações de materiais de marketing.',
                icon: <MdCardGiftcard size={24} />,
                link: '/admin/gerenciar-solicitacoes-marketing',
            },
            {
                title: 'Gerenciar Locais de Reserva',
                text: 'Cadastre e gerencie os locais para reserva (Ex: Showroom).',
                icon: <GiKeyCard size={24} />,
                link: '/admin/marketing/locais',
            },
        ]
    },
    {
        title: 'Sistema',
        cards: [
            {
                title: 'Aparência (Tema)',
                text: 'Customize as cores e o fundo do sistema.',
                icon: <IoColorPalette size={24} />,
                link: '/admin/theme',
            },
            {
                title: 'Categorias e Subgrupos',
                text: 'Gerencie as categorias e vínculos de FAQ.',
                icon: <FaRegNewspaper size={24} />,
                link: '/admin/CategoriasAdmin',
            },
            {
                title: 'Mural de Avisos (News)',
                text: 'Gerencie notícias e comunicados para a equipe.',
                icon: <FaRegNewspaper size={24} />,
                link: '/admin/noticias',
            },
            {
                title: 'Gerenciar Tela Inicial',
                text: 'Gerencie o carrossel de imagens e outros elementos da página inicial.',
                icon: <FaImages size={24} />,
                link: '/admin/homepage',
            },
        ],
    },
];

const Dashboard = () => {
    return (
        <div className='dash-grid'>
            <div className="container-main p-4">
                <Container fluid className="px-0">
                    <div className="page-header-colored mb-4">
                        <div className="page-header-title-wrapper">
                            <h2 className="page-header-title d-flex align-items-center gap-3">
                                <FaCogs /> Painel de Administração
                            </h2>
                            <p className="page-header-subtitle">Gerencie módulos, configurações e acessos do Portal DCA.</p>
                        </div>
                    </div>

                    {/* Listagem de Seções */}
                    {dashboardSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-5">
                            <h5 className="fw-semibold text-secondary mb-3 text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>
                                {section.title}
                            </h5>
                            <Row xs={1} md={2} lg={3} xl={4} className="g-3">
                                {section.cards.map((card, cardIndex) => (
                                    <Col key={cardIndex}>
                                        <Card 
                                            as={Link} 
                                            to={card.link} 
                                                className="h-100 shadow-sm border-0 text-decoration-none" // Mantido
                                            style={{ transition: 'transform 0.2s, box-shadow 0.2s', backgroundColor: '#fff', borderRadius: '10px' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; }}
                                        >
                                            <Card.Body className="d-flex align-items-start p-3">
                                                <div className="bg-light text-primary rounded d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{ width: '48px', height: '48px' }}>
                                                    {card.icon}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>{card.title}</h6>
                                                    <p className="text-muted mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                                        {card.text}
                                                    </p>
                                                </div>
                                                <div className="ms-2 align-self-center text-muted opacity-50">
                                                    <FaChevronRight size={14} />
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ))}
                </Container>
            </div>
        </div>
    );
};

export default Dashboard;