// App.jsx

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Importa o hook useAuth


// ==========================================
// COMPONENTES GERAIS / CORE
// ==========================================
import Header from "./components/layout/Header"; // Movido para layout
import Sidebar from "./components/layout/Sidebar.jsx";
import DashboardPage from "./pages/DashboardPage.jsx"; // CORREÇÃO: Importa o dashboard principal da pasta pages
import LoginPage from "./pages/Login.jsx"; // Mantido
import RegisterUserPage from "./pages/RegisterUserPage.jsx"; // Movido para pages

// ==========================================
// MÓDULO COMERCIAL (CRM)
// ==========================================
import CommercialDashboardPage from "./features/commercial/pages/DashboardProjetos.jsx"; // Renomeado para o dashboard de projetos
import ProjectDetailsPage from "./features/commercial/pages/DetalhesProjeto.jsx"; // Renomeado para detalhes do projeto
import LostProjectsPage from "./features/commercial/pages/CRM/ProjetosPerdidos.jsx"; // Movido para pages/
import CommercialRegistrationPage from "./features/commercial/pages/Registro.jsx"; // Registro do CRM
import ClientListPage from "./features/commercial/pages/Clients/Clientes.jsx"; // Renomeado e movido
import ClientDetailPage from "./features/commercial/pages/Clients/ClienteDetalhe.jsx"; // Renomeado e movido
import PurchaseDashboardPage from "./features/commercial/pages/DashboardCompras.jsx"; // Renomeado e movido
import KpiComercialPage from "./features/commercial/pages/KpiComercialPage.jsx"; 

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
// MÓDULO AGENTE PROSPECÇÃO (IA E LEADS)
// ==========================================
import PainelProspeccaoPage from "./features/prospect-agent/pages/PainelProspeccaoPage.jsx"; // Mantido
import GerenciamentoLeadsPage from './features/prospect-agent/pages/GerenciamentoLeadsPage.jsx'; // Renomeado

// ==========================================
// MÓDULO CONFIGURAÇÃO
// ==========================================
import AdminPage from "./features/configuration/pages/AdminPage.jsx"; // Renomeado
import AdminTheme from "./features/configuration/pages/AdminThemePage.jsx"; // Renomeado
import CategoriasAdmin from './features/configuration/pages/CategoriasAdmin.jsx'; // Ajuste a pasta se guardou noutro lado

// ==========================================
// MÓDULO RH
// ==========================================
import ManageEmployeesPage from "./features/human-resources/pages/ManageEmployees.jsx"; // Renomeado
import FuncionariosPage from "./features/human-resources/pages/Funcionarios.jsx"; // Renomeado
import BeneficiosPage from "./features/human-resources/pages/Beneficios.jsx"; // Renomeado
import ManageBeneficiosPage from "./features/human-resources/pages/ManageBeneficios.jsx"; // Renomeado

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

// ==========================================
// ARQUIVOS DE ESTILOS CSS
// ==========================================
import "./styles/Header.css"; // Movido para styles
import "./styles/sidebar.css"; // Movido para styles
import "./styles/AdminPage.css";
import "./styles/App.css"; // Movido para styles

function App() {
  // Consome o contexto de autenticação
  const { user, isLoggedIn, isLoading, onLogout } = useAuth();
  const handleLogout = onLogout;

   useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
  }, []); // O [] garante que rode só uma vez
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p>Carregando...</p></div>;
  }

  return (
    <BrowserRouter>
      {!isLoggedIn ? (
        <Routes>
          {/* Se o usuário não estiver logado, qualquer rota exibirá o LoginPage */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      ) : (
        /* Estrutura do sistema para usuários autenticados */
      <div className="main-container">
        <div className="header-mobile-wrapper"> {/* Este wrapper pode ser um componente de layout */}
          <Sidebar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
          <Header isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
        </div>
        <div className="content-area">
          <Routes>
            <Route path="/" element={<DashboardPage isLoggedIn={isLoggedIn} />} />
            
            {/* ROTAS DO CRM */}
            <Route path="/crm/projetos" element={<CommercialDashboardPage />} />
            <Route path="/modulo_crm/projetos-perdidos" element={<LostProjectsPage />} />
            <Route path="/crm/kpi" element={<KpiComercialPage />} />
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
            <Route path="/admin/theme" element={<AdminTheme />} />
            <Route path="/RegisterUser" element={<RegisterUserPage />} />
            <Route path="/admin/CategoriasAdmin" element={<CategoriasAdmin />} />
            <Route path="/admin/noticias" element={<NewsManagerPage />} /> {/* Mantido */}
            <Route path="/noticias" element={<NewsPage />} />
            <Route path="/OrganogramaTecnico" element={<OrganogramaTecnicoPage />} />
            <Route path="/dtc/repositorio" element={<RepositorioTecnicoPage />} />
            <Route path="/manage-employees" element={<ManageEmployeesPage isLoggedIn={isLoggedIn} />} />
            <Route path="/funcionarios" element={<FuncionariosPage />} />
            <Route path="/beneficios" element={<BeneficiosPage />} />
            <Route path="/admin/beneficios" element={<ManageBeneficiosPage />} />
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

          </Routes>
        </div>
      </div>
      )}
    </BrowserRouter>
  );
}

export default App;