import React, { useState } from "react";
import { ImExit } from "react-icons/im";
import { FaBell } from "react-icons/fa";
import "../css/Header.css"; 
import { Form } from 'react-bootstrap'; // <-- ADICIONE ESTA LINHA
import logo from '../assets/logos/dca-logo.png';
import { useTheme } from '../ThemeContext'; // <-- 1. IMPORTE O HOOK useTheme


// O componente volta a receber props
function Header({ isLoggedIn, user, onLogout }) {
      const { theme, isDarkMode, toggleDarkMode } = useTheme();
      const [hasNotifications, setHasNotifications] = useState(true); // Exemplo inicial para mostrar a bolinha
      
  // Usa o logo do tema se disponível, senão usa o padrão
  const handleLoginClick = () => {
    window.location.href = 'http://localhost:3000/auth/microsoft';
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
            <div className="notification-container" onClick={() => setHasNotifications(false)} title="Notificações">
              <FaBell className="notification-bell" />
              {hasNotifications && <span className="notification-badge"></span>}
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