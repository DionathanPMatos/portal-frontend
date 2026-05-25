// App.jsx

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';


// Component imports
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Registro from "./Registro";
import AdminPage from "./components/adminpage";
import RegisterUser from "./components/RegisterUser";
import OrganogramaTecnico from "./components/OrganogramaTecnico";
import ManageEmployees from "./components/ManageEmployees";
import Funcionarios from "./components/Funcionarios";
import DashboardCompras from './crm/DashboardCompras';
import AdminTheme from "./components/AdminTheme";
import CalculadoraSolar from "./ferramentas/CalculadoraSolar";   
import PainelProspeccao from "./prospeccao/PainelProspeccao";
import AdminDashboard from './components/AdminDashboard'; 
import GerenciamentoLeads from './prospeccao/GerenciamentoLeads';  
// Imports do CRM
import DashboardProjetos from "./crm/DashboardProjetos";
import DetalhesProjeto from "./crm/DetalhesProjeto";
import ProjetosPerdidos from "./crm/ProjetosPerdidos";
import DashboardDTC from "./crm/DashboardDTC";

import Clientes from "./crm/Clientes";
import ClienteDetalhe from "./crm/ClienteDetalhe";

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
            
            {/* OUTRAS ROTAS */}
            <Route path="/registro" element={<Registro />} />
            <Route path="/adminpage" element={<AdminPage />} />
            <Route path="/admin/theme" element={<AdminTheme />} />
            <Route path="/RegisterUser" element={<RegisterUser />} />
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
    </BrowserRouter>
  );
}

export default App;