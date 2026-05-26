import React, { useState, useEffect, useRef } from "react";
import { ImExit } from "react-icons/im";
import { FaBell } from "react-icons/fa";
import "../css/Header.css"; 
import { Form, Badge } from 'react-bootstrap'; 
import logo from '../assets/logos/dca-logo.png';
import { useTheme } from '../modulos/Modulo_Configuracao/ThemeContext'; // <-- 1. IMPORTE O HOOK useTheme
import axios from 'axios';
import { useNavigate } from "react-router-dom";


// O componente volta a receber props
function Header({ isLoggedIn, user, onLogout }) {
      const { theme, isDarkMode, toggleDarkMode } = useTheme();
      const [notificacoes, setNotificacoes] = useState([]);
      const [showDropdown, setShowDropdown] = useState(false);
      const dropdownRef = useRef(null);
      const navigate = useNavigate();

      useEffect(() => {
        if (isLoggedIn && user) {
            fetchNotificacoes();
            const interval = setInterval(fetchNotificacoes, 60000); // Procura notificações a cada 1 min
            return () => clearInterval(interval);
        }
      }, [isLoggedIn, user]);

      const fetchNotificacoes = async () => {
          try {
              const { data } = await axios.get('/api/notificacoes');
              setNotificacoes(data);
          } catch (err) { console.error('Erro notificação:', err); }
      };

      useEffect(() => {
        function handleClickOutside(e) {
          if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

      const handleNotificacaoClick = async (notificacao) => {
          if (notificacao.tipo === 'status' || notificacao.tipo === 'retorno' || notificacao.tipo === 'aprovacao_gestor' || notificacao.tipo === 'nova_noticia') {
              try {
                  await axios.patch(`/api/notificacoes/${notificacao.id}/lida`, { tipo: notificacao.tipo });
                  setNotificacoes(prev => prev.filter(n => !(n.id === notificacao.id && n.tipo === notificacao.tipo)));
              } catch (err) {}
          }
          setShowDropdown(false);
          
          if (notificacao.tipo === 'nova_noticia') navigate('/'); 
          else navigate('/crm/visitas');
      };
      
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // Usa o logo do tema se disponível, senão usa o padrão
  const handleLoginClick = () => {
    window.location.href = `${API_URL}/auth/microsoft`;
  };

  return (
    <header className="header">
      <div className="header-area">

        <nav className="nav">
          <a href="https://loja.dca.com.br/home" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ color: "#1d1c1cff" }}>
            Loja Online
          </a>
          
          <div className="card-flag">
            <a href="/" className="flag fi fi-br"></a>
            <a href="/index_us" className="flag fi fi-us"></a>
            <a href="/index_cr" className="flag fi fi-es"></a>
          </div>

          {/* Ícone de Notificações */}
          {isLoggedIn && (
            <div className="notification-container position-relative" ref={dropdownRef} style={{ marginRight: '15px' }}>
              <div onClick={() => setShowDropdown(!showDropdown)} style={{ cursor: 'pointer' }} title="Notificações">
                <FaBell className="notification-bell text-secondary" size={24} />
                {notificacoes.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem', transform: 'translate(-30%, -30%)' }}>
                    {notificacoes.length}
                  </span>
                )}
              </div>

              {showDropdown && (
                <div className="dropdown-menu dropdown-menu-end show shadow" style={{ position: 'absolute', right: 0, top: '45px', width: '330px', maxHeight: '400px', overflowY: 'auto', zIndex: 1050 }}>
                  <h6 className="dropdown-header border-bottom mb-2 fw-bold text-dark">Notificações Pendentes</h6>
                  {notificacoes.length === 0 ? (
                    <div className="dropdown-item text-muted text-center py-3" style={{ whiteSpace: 'normal' }}>Você está em dia com tudo!</div>
                  ) : (
                    notificacoes.map((n, index) => (
                      <div key={index} className="dropdown-item border-bottom py-2 text-wrap" style={{ cursor: 'pointer', whiteSpace: 'normal', fontSize: '0.85rem' }} onClick={() => handleNotificacaoClick(n)}>
                        {n.tipo === 'status' && <span>Sua solicitação de visita em <strong>{n.nome_cliente}</strong> foi <Badge bg={n.status_autorizacao === 'Autorizada' ? 'success' : 'danger'}>{n.status_autorizacao}</Badge>.</span>}
                        {n.tipo === 'feedback' && <span>Ação necessária: Registre o feedback da visita em <strong>{n.nome_cliente}</strong> realizada em {new Date(n.data_visita).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.</span>}
                        {n.tipo === 'retorno' && <span>Lembrete de retorno em <strong>{n.nome_cliente}</strong> marcado para {new Date(n.data_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}. <br/><span className="text-primary mt-1 d-inline-block">Deseja agendar nova visita?</span></span>}
                        {n.tipo === 'aprovacao_gestor' && <span>Aprovação pendente: <strong>{n.vendedor_nome}</strong> solicitou visita em <strong>{n.nome_cliente}</strong>.</span>}
                        {n.tipo === 'nova_noticia' && <span>Nova Publicação: <strong>{n.titulo}</strong> <Badge bg={n.tipo === 'Urgente' ? 'danger' : 'info'}>{n.tipo}</Badge>. Vá até a Home para ler.</span>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bottom">
            {isLoggedIn ? (
              <div className="user-profile">
                <span className="user-name">
                  {/* Exibe o nome da Microsoft ou o nome interno como fallback */}
                  {user ? user.displayName || user.nome_completo || 'Usuário' : ''}
                </span>
                <button onClick={onLogout} className="logout-button">
                  <ImExit />
                </button>
              </div>
            ) : (
              <div className="user-profile">
                <button onClick={handleLoginClick} className="login-button btn btn-outline-primary">
                  Login
                </button>
              </div>
              
              
            )}
          </div>
          <div className="theme-switch-wrapper ms-auto">
                <Form.Check 
                    type="switch"
                    id="dark-mode-switch"
                    label={isDarkMode ? "🌙" : "☀️"}
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                />
            </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;