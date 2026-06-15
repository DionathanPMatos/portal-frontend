import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaHandshake,
  FaProjectDiagram,
  FaMoneyBill,
  FaCogs,
  FaTruck,
  FaPencilAlt,
  FaBlog,
  FaEnvelope,
  FaShoppingCart,
  FaSignOutAlt,
  FaBars,
  FaChevronDown,
  FaChevronRight,
  FaBuilding,
  FaChevronLeft,
} from "react-icons/fa";
/*import { SiMarketo } from "react-icons/si";*/
import { GiHumanPyramid } from "react-icons/gi";
import { AiFillProduct, AiFillVideoCamera } from "react-icons/ai"; // Ícones para Portfólio e Soluções
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. IMPORTE O HOOK useTheme



// Constantes de dados
import "../../styles/sidebar.css"; // Movido para a pasta styles
import { useAuth } from "../../contexts/AuthContext";
const iconSize = 24;

const menuItems = [
  // AQUI É A MUDANÇA: 'Início' agora tem um link para a rota '/'
  {
    name: "Início",
    icon: <FaHome size={iconSize} />,
    link: "/",
    subItems: null,
  },
  {
    name: "Comercial",
    icon: <FaHandshake size={iconSize} />,
    subItems: [
      { name: "CRM - Mannesoft", link: "/crm/projetos" },
      { name: "Clientes", link: "/crm/clientes" },
      { name: "Visitas Comerciais", link: "/crm/visitas" },
      { name: "KPIs Comerciais", link: "/crm/kpi" },
      {
        name: "Email Corporativo",
        link: "https://outlook.office.com/mail/",
        target: "_blank",
      },
      { name: "Campanhas Vigentes", link: "#" },
      { name: "Forecast", link: "#", target: "_blank" }, //A REALIZAR
      { name: "Registro de projetos", link: "/RegisterUser" },
      { name: "Politicas Comerciais", link: "#", target: "_blank" },
    ],
  },
  {
    name: "Frota",
    icon: <FaTruck size={iconSize} />,
    subItems: [
      { name: "Controle de Frota", link: "/frota" },
    
      
    ],
  },
  {
    name: "Facilities",
    icon: <FaBuilding size={iconSize} />,
    subItems: [
      { name: "Gestão de Ativos", link: "/facilities" },
      { name: "Gestão de Obras", link: "/facilities/gestao-obras" },
    ],
  },
  {
    name: "Dep. Técnico",
    icon: <FaProjectDiagram size={iconSize} />,
    subItems: [ 
      {
        name: "Cadastro de Produtos",
        link: "https://deltacable-my.sharepoint.com/personal/miria_machado_dca_com_br/Lists/Cadastro%20de%20Produtos?env=WebViewList",
        target: "_blank",
      },
      { name: "Gerente de Produtos", link: "/OrganogramaTecnico" },
      { name: "Fabricantes", link: "/dtc/fabricantes" },
      { name: "Ferramentas Úteis", link: "/dtc/ferramentas" },
      { name: "Solicitação de Propostas", link: "/crm/dashboard-dtc" },
      { name: "Repositório Técnico", link: "/dtc/repositorio" },
      { name: "Fórum e Dúvidas", link: "/dtc/perguntas" },
      {
        name: "RMA",
        link: "https://rma-dev.dca.com.br/support/home",
        target: "_blank",
      },
    ],
  },
  {
    name: "Financeiro",
    icon: <FaMoneyBill size={iconSize} />,
    subItems: [
      { name: "Central Financeira", link: "/financeiro" },
      { name: "Políticas Financeiras", link: "#" },
    ],
  },
  {
    name: "Logístico",
    icon: <FaTruck size={iconSize} />,
    subItems: [
      { name: "Gestão de Rotas", link: "#" },
      {
        name: "Rastreamento de entregas",
        link: "https://ssw.inf.br/2/rastreamento_dest?pwd=2&id=2",
        target: "_blank",
      },
      { name: "Cotações", link: "#" },
      { name: "Politicas de Logística", link: "#" },
    ],
  },
  {
    name: "Marketing",
    icon: <FaPencilAlt size={iconSize} />,
    subItems: [
      { name: "Painel de Marketing", link: "/marketing" },
      { name: "Solicitar Material", link: "/marketing/solicitacoes" },
      { name: "Reservar Sala/Showroom", link: "/marketing/reservas" },
      { name: "Cases de Sucesso", link: "#" },
      { name: "Politica de Marketing", link: "#" },
    ],
  },
  {
    name: "Compras",
    icon: <FaShoppingCart size={iconSize} />,
    subItems: [
      { name: "Prazos e Importações", link: "#" },
      { name: "Solicitação de Compras", link: "/compras" },
      { name: "Equipe de Compras", link: "#" },
      { name: "Politicas de Compras", link: "#" },
    ],
  },
  {
    name: "RH",
    icon: <GiHumanPyramid size={iconSize} />,
    subItems: [
      { name: "Dashboard RH", link: "/rh/dashboard" },
      {
        name: "Folha de pagamento",
        link: "https://onvio.com.br/portaldoempregado/auth/login",
        target: "_blank",
      },
      {
        name: "Registro de Ponto",
        link: "https://app2.pontomais.com.br/meu-ponto",
        target: "_blank",
      },
      {
        name: "Treinamentos",
        link: "https://dcacademy.woli.com.br/pt-BR/Login/Index?returnUrl=%2Fpt-BR%2FWorkspace%2FIndex%3Fid%3D88%26hash%3DNDEyOTswMTY%3D",
        target: "_blank",
      },
      { name: "Benefícios", link: "/rh/beneficios" },
      {
        name: "Oportunidades",
        link: "https://oportunidades.mindsight.com.br/dca",
        target: "_blank",
      },
      { name: "Ouvidoria", link: "#" },
      { name: "Colaboradores", link: "/funcionarios" },
      { name: "Politicas de RH", link: "#" },
    ],
  },
  {
    name: "Portfólio",
    icon: <AiFillProduct size={iconSize} />,
    subItems: [
      { name: "Gestão de Portfólio", link: "#" },
      { name: "Análise de Portfólio", link: "#" },
      { name: "Relatórios de Portfólio", link: "#" },
    ],
  },
  {
    name: "Soluções",
    icon: <AiFillVideoCamera size={iconSize} />,
    subItems: [
      { name: "Gestão de Projetos", link: "#" },
      { name: "Colaboração", link: "#" },
      { name: "Relatórios de Desempenho", link: "#" },
    ],
  },
  {
    name: "Notícias",
    icon: <FaBlog size={iconSize} />, // Usando FaBlog para notícias, FaRegNewspaper não está importado
    subItems: [
      { name: "Mural de Notícias", link: "/noticias" },
      { name: "Gerenciar Notícias", link: "/admin/noticias", restricted: true },
    ],
  },
  {
    name: "Configurações",
    icon: <FaCogs size={iconSize} />,
    link: "/adminpage",
  },
];

function Sidebar({ isHidden }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const sidebarRef = useRef(null);
  const { theme } = useTheme(); // <-- Extraindo o theme do contexto
  const { user } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveAccordion(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleAccordionClick = (itemName) => {
    setActiveAccordion(activeAccordion === itemName ? null : itemName);
  };

  const logoUrl = theme?.logo_url || "/logo.png"; // <-- Alterado para string para evitar ReferenceError
  return (
    <>
      {!isOpen && (
        <div className="mobile-toggle" onClick={toggleSidebar}>
          <FaBars />
        </div>
      )}

      <div className={`sidebar ${isOpen ? "open" : ""} ${isHidden ? "hidden" : ""}`} ref={sidebarRef}>
        <div className="top">
          {/* 🚀 Bloco da Logomarca na Sidebar */}
          <div className="sidebar-logo">
            <img
              src={logoUrl} 
              alt="Logo do Sistema" 
              style={{ height: '40px' }}
            />
          </div>
        </div>

        <ul className="main-menu">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={item.name === "Início" ? "active" : ""}
            >
              {item.subItems ? (
                // Lógica para itens com submenu
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleAccordionClick(item.name); }} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="icon-wrapper">{item.icon}</span>
                    <span className="item-name">{item.name}</span>
                  </div>
                  <span className="item-name pe-3">
                    {activeAccordion === item.name ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                  </span>
                </a>
              ) : (
                // Lógica para itens sem submenu
                <Link to={item.link}>
                  <span className="icon-wrapper">{item.icon}</span>
                  <span className="item-name">{item.name}</span>
                </Link>
              )}
              {item.subItems && (
                <ul
                  className={`subitems ${activeAccordion === item.name ? "subitems-open" : ""}`}
                  style={{ display: activeAccordion === item.name ? 'block' : 'none' }}
                >
                  {item.subItems.map((subItem) => {
                    if (subItem.restricted && (!user?.privilegios || (!user.privilegios.includes('Admin') && !user.privilegios.includes('Gestor') && !user.privilegios.includes('rh')))) {
                        return null;
                    }
                    return (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.link}
                          {...(subItem.target ? { target: subItem.target } : {})}
                          rel="noopener noreferrer"
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <p>&copy; {new Date().getFullYear()} DCA. Todos os direitos reservados.</p>
        </div>
        </div>
    </>
      
      

    
  );
}

export default Sidebar;
