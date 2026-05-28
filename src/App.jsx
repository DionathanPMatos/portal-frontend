// App.jsx

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';


// ==========================================
// COMPONENTES GERAIS / CORE
// ==========================================
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./modulos/Dashboard";
import Login from "./components/Login"; //
import RegisterUser from "./components/RegisterUser"; 

// ==========================================
// MÓDULO COMERCIAL (CRM)
// ==========================================
import DashboardProjetos from "./modulos/Modulo_Comercial/DashboardProjetos";
import DetalhesProjeto from "./modulos/Modulo_Comercial/DetalhesProjeto.jsx";
import ProjetosPerdidos from "./modulos/Modulo_Comercial/modulo_crm/ProjetosPerdidos";
import Registro from "./modulos/Modulo_Comercial/Registro.jsx";
import Clientes from "./modulos/Modulo_Comercial/modulo_clientes/Clientes.jsx";
import ClienteDetalhe from "./modulos/Modulo_Comercial/modulo_clientes/ClienteDetalhe";
import DashboardCompras from "./modulos/Modulo_Comercial/DashboardCompras";

// ==========================================
// MÓDULO DEPARTAMENTO TÉCNICO (DTC)
// ==========================================
import DashboardDTC from "./modulos/Modulo_Departamento_Tecnico/DashboardDTC";
import OrganogramaTecnico from "./modulos/Modulo_Departamento_Tecnico/OrganogramaTecnico";
import RepositorioTecnico from "./modulos/Modulo_Departamento_Tecnico/RepositorioTecnico";

// ==========================================
// MÓDULO VISITANTES
// ==========================================
import Visitas from "./modulos/Modulo_Visitantes/Visitas";
import AdminDashboard from './modulos/Modulo_Visitantes/AdminDashboard'; 

// ==========================================
// MÓDULO AGENTE PROSPECÇÃO (IA E LEADS)
// ==========================================
import PainelProspeccao from "./modulos/Modulo_Agente_Prospeccao/PainelProspeccao";
import GerenciamentoLeads from './modulos/Modulo_Agente_Prospeccao/GerenciamentoLeads';  

// ==========================================
// MÓDULO CONFIGURAÇÃO
// ==========================================
import AdminPage from "./modulos/Modulo_Configuracao/adminpage";
import AdminTheme from "./modulos/Modulo_Configuracao/AdminTheme";

// ==========================================
// MÓDULO RH
// ==========================================
import ManageEmployees from "./modulos/Modulo_RH/ManageEmployees";
import Funcionarios from "./modulos/Modulo_RH/Funcionarios";
import Beneficios from "./modulos/Modulo_RH/Beneficios";
import ManageBeneficios from "./modulos/Modulo_RH/ManageBeneficios";

// ==========================================
// MÓDULO FERRAMENTAS
// ==========================================
import CalculadoraSolar from "./modulos/Modulo_Ferramentas/CalculadoraSolar";   

// ==========================================
// MÓDULO NOTÍCIAS
// ==========================================
import NewsManager from "./modulos/Modulo_Noticias/NewsManager";
import NewsPage from "./modulos/Modulo_Noticias/NewsPage";

// ==========================================
// ARQUIVOS DE ESTILOS CSS
// ==========================================
import "./css/Header.css";
import "./css/sidebar.css";
import "./css/Dashboard.css";
import "./css/Home.css";
import "./css/AdminPage.css";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
  }, []); // O [] garante que rode só uma vez
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/user-data', {
          withCredentials: true
        });
        setUser(response.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    window.location.href = `${API_URL}/auth/microsoft/logout`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p>Carregando...</p></div>;
  }

  return (
    <BrowserRouter>
      {!isLoggedIn ? (
        <Routes>
          {/* Se o usuário não estiver logado, qualquer rota exibirá o Login */}
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        /* Estrutura do sistema para usuários autenticados */
      <div className="main-container">
        <div className="header-mobile-wrapper">
          <Sidebar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
          <Header isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
        </div>
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Dashboard isLoggedIn={isLoggedIn} />} />
            
            {/* ROTAS DO CRM */}
            <Route path="/crm/projetos" element={<DashboardProjetos />} />
            <Route path="/modulo_crm/projetos-perdidos" element={<ProjetosPerdidos />} />
            {/* --- ALTERAÇÃO AQUI: Passando o 'user' como prop --- */}
            <Route path="/crm/projetos/:id" element={<DetalhesProjeto user={user} />} />
            
            <Route path="/crm/visitas" element={<Visitas user={user} />} />

            {/* OUTRAS ROTAS */}
            <Route path="/registro" element={<Registro />} />
            <Route path="/adminpage" element={<AdminPage />} />
            <Route path="/admin/theme" element={<AdminTheme />} />
            <Route path="/RegisterUser" element={<RegisterUser />} />
            <Route path="/admin/noticias" element={<NewsManager />} />
            <Route path="/noticias" element={<NewsPage />} />
            <Route path="/OrganogramaTecnico" element={<OrganogramaTecnico />} />
            <Route path="/dtc/repositorio" element={<RepositorioTecnico />} />
            <Route path="/manage-employees" element={<ManageEmployees isLoggedIn={isLoggedIn} />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/beneficios" element={<Beneficios />} />
            <Route path="/admin/beneficios" element={<ManageBeneficios />} />
            <Route path="/crm/dashboard-dtc" element={<DashboardDTC />} />
            <Route path="/compras" element={<DashboardCompras />} />
            <Route path="/ferramentas/calculadora-solar" element={<CalculadoraSolar />} />
            <Route path="/crm/prospeccao" element={<PainelProspeccao />} />
            <Route path="/admin/gerenciar-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/gerenciar-leads" element={<GerenciamentoLeads />} />
            <Route path="/crm/clientes" element={<Clientes />} />
            <Route path="/crm/clientes/:id" element={<ClienteDetalhe user={user} />} />

          </Routes>
        </div>
      </div>
      )}
    </BrowserRouter>
  );
}

export default App;