// App.jsx

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';


// ==========================================
// COMPONENTES GERAIS / CORE
// ==========================================
import Header from "./components/layout/Header"; // Movido para layout
import Sidebar from "./components/layout/Sidebar.jsx";
import DashboardPage from "./pages/DashboardPage.jsx"; // CORREÇÃO: Importa o dashboard principal da pasta pages
import LoginPage from "./pages/Login.jsx"; // Mantido
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import RegisterUserPage from "./pages/RegisterUserPage.jsx"; // Movido para pages

// ==========================================
// MÓDULO COMERCIAL (CRM)
// ==========================================
import CommercialDashboardPage from "./features/commercial/pages/Dashboard.jsx"; // Renomeado para o dashboard de projetos
import ProjectDetailsPage from "./features/commercial/pages/DetalhesProjeto.jsx"; // Renomeado para detalhes do projeto
import LostProjectsPage from "./features/commercial/pages/CRM/ProjetosPerdidos.jsx"; // Movido para pages/
import CommercialRegistrationPage from "./features/commercial/pages/Registro.jsx"; // Registro do CRM
import ClientListPage from "./features/commercial/pages/Clients/Clientes.jsx"; // Renomeado e movido
import ClientDetailPage from "./features/commercial/pages/Clients/ClienteDetalhe.jsx"; // Renomeado e movido
import PurchaseDashboardPage from "./features/commercial/pages/DashboardCompras.jsx"; // Renomeado e movido
import KpiComercialPage from "./features/commercial/pages/KpiComercialPage.jsx"; 
import AdminResultados from "./features/configuration/pages/ManageKpiDashboard.jsx"; // Movido e renomeado

// ==========================================
// MÓDULO DEPARTAMENTO TÉCNICO (DTC)
// ==========================================
import DashboardDTCPage from "./features/technical-department/pages/DashboardDTCPage.jsx"; // Renomeado
import OrganogramaTecnicoPage from "./features/technical-department/pages/OrganogramaTecnicoPage.jsx"; // Renomeado
import RepositorioTecnicoPage from "./features/technical-department/pages/RepositorioTecnico.jsx"; // Renomeado
import FabricantesListPage from "./features/technical-department/pages/FabricantesListPage.jsx"; // Renomeado
import FabricantePerfilPage from "./features/technical-department/pages/FabricantePerfilPage.jsx"; // Renomeado
import GerenciarFabricantesPage from "./features/technical-department/pages/GerenciarFabricantesPage.jsx"; // Renomeado
import FerramentasUteisPage from "./features/technical-department/pages/FerramentasUteisPage.jsx"; // Renomeado
import PerguntasDtcPage from "./features/technical-department/pages/PerguntasDtcPage.jsx";

// ==========================================
// MÓDULO VISITANTES
// ==========================================
import VisitasPage from "./features/visitors/pages/VisitasPage.jsx"; // Renomeado
import AdminDashboard from './features/visitors/pages/AdminDashboardPage.jsx'; // Movido e renomeado

// ==========================================
//MÓDULO DE CONTROLE DE FROTA
// ==========================================
import Frota from "./features/fleet-management/pages/Frota.jsx"; // Ajustado para o nome correto do componente

// ==========================================
// MÓDULO FACILITIES
// ==========================================
import FacilitiesPage from "./features/facilities/pages/Facilities.jsx"; // Movido e renomeado
import GestaoObrasPage from "./features/facilities/pages/GestaoObras.jsx"; // Renomeado

// ==========================================
// MÓDULO MARKETING
// ==========================================
import MarketingPage from "./features/marketing/pages/MarketingPage.jsx";
import ReserveRoomPage from "./features/marketing/pages/ReserveRoomPage.jsx";
import RequestMaterialPage from "./features/marketing/pages/RequestMaterialPage.jsx";
import ManageMarketingProducts from "./features/marketing/pages/ManageMarketingProducts.jsx"; // Renomeado
import ManageMarketingRequests from "./features/marketing/pages/ManageMarketingRequests.jsx"; // Renomeado
import ManageMarketingInterestsPage from "./features/marketing/pages/ManageMarketingInterests.jsx"; // NOVO
import ManageMarketingLocationsPage from "./features/marketing/pages/ManageMarketingLocations.jsx"; // NOVO

// ==========================================
// MÓDULO AGENTE PROSPECÇÃO (IA E LEADS)
// ==========================================
import PainelProspeccaoPage from "./features/prospect-agent/pages/PainelProspeccaoPage.jsx"; // Mantido
import GerenciamentoLeadsPage from './features/prospect-agent/pages/GerenciamentoLeadsPage.jsx'; // Renomeado

// ==========================================
// MÓDULO CONFIGURAÇÃO
// ==========================================
import AdminPage from "./features/configuration/pages/AdminPage.jsx"; // Renomeado
import AdminTheme from "./features/configuration/pages/AdminThemePage.jsx"; // Renomeado
import ManageHomePage from "./features/configuration/pages/ManageHomePage.jsx";
import CategoriasAdmin from './features/configuration/pages/CategoriasAdmin.jsx'; // Ajuste a pasta se guardou noutro lado

// ==========================================
// MÓDULO RH
// ==========================================
import ManageEmployeesPage from "./features/human-resources/pages/ManageEmployees.jsx"; // Renomeado
import HRDashboardPage from "./features/human-resources/pages/HRDashboardPage.jsx"; // NOVO
import UserProfilePage from "./features/human-resources/pages/UserProfilePage.jsx"; // NOVO
import EmployeeDetailsPage from "./features/human-resources/pages/EmployeeDetailsPage.jsx"; // 🚀 NOVA PÁGINA
import FuncionariosPage from "./features/human-resources/pages/Funcionarios.jsx"; // Renomeado
import BeneficiosHubPage from "./features/human-resources/pages/BeneficiosHubPage.jsx";
import HRHubPage from "./features/human-resources/pages/HRHubPage.jsx";

// ==========================================
// MÓDULO FINANCEIRO
// ==========================================
import FinanceiroPage from "./features/financial/pages/FinanceiroPage.jsx";

// ==========================================
// MÓDULO FERRAMENTAS
// ==========================================
import CalculadoraSolarPage from "./features/tools/pages/CalculadoraSolar.jsx"; // Renomeado

// ==========================================
// MÓDULO NOTÍCIAS
// ==========================================
import NewsManagerPage from "./features/news/pages/NewsManager.jsx"; // Renomeado
import NewsPage from "./features/news/pages/NewsPage.jsx"; // Mantido
import NewsConfirmationReportPage from "./features/news/pages/NewsConfirmationReportPage.jsx"; // NOVO

// ==========================================
// MÓDULO NOTIFICAÇÕES
// ==========================================
import AllNotificationsPage from "./components/common/AllNotificationsPage.jsx"; // Renomeado e movido para common

// ==========================================
// ARQUIVOS DE ESTILOS CSS
// ==========================================
import "./styles/Header.css"; // Movido para styles
import "./styles/sidebar.css"; // Movido para styles
import "./styles/AdminPage.css";
import "./styles/App.css"; // Movido para styles

function App() {
  // Consome o contexto de autenticação
  const { theme } = useTheme();
  const { user, isLoggedIn, isLoading, onLogout } = useAuth();
  const [isSidebarHidden, setIsSidebarHidden] = React.useState(false);
  const handleLogout = onLogout;

   useEffect(() => {
    // Aplica a cor de fundo do tema diretamente no body para garantir que seja a base de todo o layout.
    if (theme && theme.background_color) {
      document.body.style.backgroundColor = theme.background_color;
    } else {
      document.body.style.backgroundColor = '#f4f7f9'; // Cor padrão de fallback
    }
  }, [theme]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p>Carregando...</p></div>;
  }

  return (
    <BrowserRouter>
      {!isLoggedIn ? (
        <Routes>
          {/* Se o usuário não estiver logado, qualquer rota exibirá o LoginPage */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      ) : (
        /* Estrutura do sistema para usuários autenticados */
      <div className={`main-container ${isSidebarHidden ? "sidebar-hidden" : ""}`}>
        <div className="header-mobile-wrapper"> {/* Este wrapper pode ser um componente de layout */}
          <Sidebar 
            isLoggedIn={isLoggedIn} 
            user={user} 
            onLogout={handleLogout} 
            isHidden={isSidebarHidden} 
          />
          <Header 
            isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} 
            onToggleSidebar={() => setIsSidebarHidden(!isSidebarHidden)}
          />
        </div>
        <div className="content-area">
          <Routes>
            <Route path="/" element={<DashboardPage isLoggedIn={isLoggedIn} />} />
            
            {/* ROTAS DO CRM */}
            <Route path="/crm/projetos" element={<CommercialDashboardPage />} />
            <Route path="/modulo_crm/projetos-perdidos" element={<LostProjectsPage />} />
            <Route path="/crm/kpi" element={<KpiComercialPage />} />
            <Route path="/admin/resultados" element={<AdminResultados />} />

            {/* --- ALTERAÇÃO AQUI: Passando o 'user' como prop --- */}
            <Route path="/crm/projetos/:id" element={<ProjectDetailsPage user={user} />} />
            
            <Route path="/crm/visitas" element={<VisitasPage user={user} />} />

            <Route path="/dtc/fabricantes" element={<FabricantesListPage />} />
            <Route path="/dtc/fabricantes/:id" element={<FabricantePerfilPage />} />
            <Route path="/admin/fabricantes" element={<GerenciarFabricantesPage />} />
            <Route path="/dtc/ferramentas" element={<FerramentasUteisPage />} />
            <Route path="/dtc/perguntas" element={<PerguntasDtcPage user={user} />} />

            {/* OUTRAS ROTAS (Ajuste a rota de registro se necessário) */}
            <Route path="/registro" element={<CommercialRegistrationPage />} />
            <Route path="/adminpage" element={<AdminPage />} />
            <Route path="/admin/homepage" element={<ManageHomePage />} />
            <Route path="/admin/theme" element={<AdminTheme />} />
            <Route path="/RegisterUser" element={<RegisterUserPage />} />
            <Route path="/admin/CategoriasAdmin" element={<CategoriasAdmin />} />
            <Route path="/admin/noticias/:newsId/report" element={<NewsConfirmationReportPage />} /> {/* NOVO */}
            <Route path="/admin/noticias" element={<NewsManagerPage />} /> {/* Mantido */}
            <Route path="/noticias" element={<NewsPage />} />
            <Route path="/OrganogramaTecnico" element={<OrganogramaTecnicoPage />} />
            <Route path="/dtc/repositorio" element={<RepositorioTecnicoPage />} />

            {/* ROTAS DO RH */}
            <Route path="/rh" element={<HRHubPage />} />
            <Route path="/rh/colaboradores/:id" element={<EmployeeDetailsPage />} />
            <Route path="/funcionarios" element={<FuncionariosPage />} />
            <Route path="/perfil" element={<UserProfilePage />} />

            <Route path="/crm/dashboard-dtc" element={<DashboardDTCPage />} />
            <Route path="/compras" element={<PurchaseDashboardPage />} />
            <Route path="/ferramentas/calculadora-solar" element={<CalculadoraSolarPage />} /> {/* A rota para a calculadora solar */}
            <Route path="/crm/prospeccao" element={<PainelProspeccaoPage />} /> {/* Usa o PainelProspeccaoPage */}
            <Route path="/admin/gerenciar-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/gerenciar-leads" element={<GerenciamentoLeadsPage />} />
            <Route path="/crm/clientes" element={<ClientListPage />} />
            <Route path="/crm/clientes/:id" element={<ClientDetailPage user={user} />} />

            {/* MÓDULO FINANCEIRO */}
            <Route path="/financeiro" element={<FinanceiroPage user={user} />} />

            {/* NOVA ROTA PARA O MÓDULO DE CONTROLE DE FROTA */}
            <Route path="/frota" element={<Frota />} />
            
            {/* ROTAS FACILITIES */}
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/facilities/gestao-obras" element={<GestaoObrasPage />} />

            {/* ROTAS MARKETING */}
            <Route path="/marketing" element={<MarketingPage user={user} />} />
            <Route path="/marketing/reservas" element={<ReserveRoomPage />} />
            <Route path="/marketing/solicitacoes" element={<RequestMaterialPage />} />
            <Route path="/admin/gerenciar-produtos-marketing" element={<ManageMarketingProducts />} />
            <Route path="/admin/gerenciar-solicitacoes-marketing" element={<ManageMarketingRequests />} />
            <Route path="/admin/marketing/interesses" element={<ManageMarketingInterestsPage />} />
            <Route path="/admin/marketing/locais" element={<ManageMarketingLocationsPage />} />

            {/* ROTA PARA PÁGINA DE NOTIFICAÇÕES */}
            <Route path="/notificacoes/todas" element={<AllNotificationsPage />} />

          </Routes>
        </div>
      </div>
      )}
    </BrowserRouter>
  );
}

export default App;