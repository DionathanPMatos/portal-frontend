import React from "react";
import { FaBars, FaCommentDots, FaQuestionCircle, FaDollarSign } from 'react-icons/fa';
import "../../styles/Header.css";
import { useAuth } from "../../contexts/AuthContext";

// Importa os novos componentes refatorados
import GlobalSearch from './../common/GlobalSearch';
import NotificationBell from './../common/NotificationBell';
import UserProfileDropdown from './../common/UserProfileDropdown';


// O componente volta a receber props
function Header({ onToggleSidebar }) {
      const { isLoggedIn } = useAuth();

  return (
    <header className="header">
      <div className="header-area">
        <div className="header-left-section">
          {/* Botão de Toggle da Sidebar */}
          <button onClick={onToggleSidebar} className="sidebar-toggle-btn" title="Recolher/Expandir Menu">
              <FaBars />
          </button>

          {/* Barra de Pesquisa */}
          <GlobalSearch />
        </div>

        <nav className="nav">
          <a href="https://loja.dca.com.br/home" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ color: "#1d1c1cff" }}>
            Loja Online
          </a>
          

          {isLoggedIn && <NotificationBell />}

          {/* Ícone de Chat */}
          {isLoggedIn && (
            <div className="header-icon-btn" title="Chat (Em Breve)">
              <FaCommentDots size={22} />
            </div>
          )}

          {isLoggedIn && (
            <div className="header-icon-btn" title="Dúvidas Frequentes">
              <FaQuestionCircle size={22} />
            </div>
          )}

          <UserProfileDropdown />

        </nav>
      </div>
    </header>
  );
}

export default Header;