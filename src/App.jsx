// App.jsx

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';


// Component imports
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./modulos/Dashboard";
import Login from "./components/Login";
import Registro from "./modulos/Modulo_CRM/Registro";
import AdminPage from "./modulos/Modulo_Configuracao/adminpage";
import RegisterUser from "./components/RegisterUser";
import OrganogramaTecnico from "./modulos/Modulo_Departamento_Tecnico/OrganogramaTecnico";
import ManageEmployees from "./modulos/Modulo_RH/ManageEmployees";
import Funcionarios from "./modulos/Modulo_RH/Funcionarios";
import DashboardCompras from './modulos/modulo_crm/DashboardCompras';
import AdminTheme from "./modulos/Modulo_Configuracao/AdminTheme";
import CalculadoraSolar from "./modulos/Modulo_Ferramentas/CalculadoraSolar";   
import PainelProspeccao from "./modulos/Modulo_Agente_Prospeccao/PainelProspeccao";
import AdminDashboard from './modulos/Modulo_Visitantes/AdminDashboard'; 
import GerenciamentoLeads from './modulos/Modulo_Agente_Prospeccao/GerenciamentoLeads';  
// Imports do CRM
import DashboardProjetos from "./modulos/modulo_crm/DashboardProjetos";
import DetalhesProjeto from "./modulos/modulo_crm/DetalhesProjeto";
import ProjetosPerdidos from "./modulos/modulo_crm/ProjetosPerdidos";
import DashboardDTC from "./modulos/modulo_crm/DashboardDTC";

import Clientes from "./modulos/modulo_crm/Clientes";
import ClienteDetalhe from "./modulos/modulo_crm/ClienteDetalhe";
import Visitas from "./modulos/Modulo_Visitantes/Visitas";
import NewsManager from "./modulos/Modulo_Noticias/NewsManager";
import NewsPage from "./modulos/Modulo_Noticias/NewsPage";

// CSS imports

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
            <Route path="/crm/projetos-perdidos" element={<ProjetosPerdidos />} />
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
            <Route path="/manage-employees" element={<ManageEmployees isLoggedIn={isLoggedIn} />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
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