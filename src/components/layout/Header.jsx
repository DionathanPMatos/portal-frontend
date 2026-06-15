import React, { useState, useEffect, useRef } from "react";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { 
    FaBell, FaBars, FaSearch, FaBullhorn, FaUserClock, FaCheckCircle, 
    FaTimesCircle, FaCommentDots, FaCalendarCheck, FaQuestionCircle, FaDollarSign,
    FaLightbulb, FaCalendarAlt, FaFileInvoiceDollar, FaUserCircle, FaChevronDown
} from 'react-icons/fa';
import "../../styles/Header.css";
import { Form, Badge } from 'react-bootstrap';
import apiClient from '../../services/api';
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";


// O componente volta a receber props
function Header({ onToggleSidebar }) {
      const { isLoggedIn, user, onLogout } = useAuth();
      const [notificacoes, setNotificacoes] = useState([]);
      const [dollarRate, setDollarRate] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [searchResults, setSearchResults] = useState([]);
      const [isSearchLoading, setIsSearchLoading] = useState(false);
      const [showResultsDropdown, setShowResultsDropdown] = useState(false);
      const searchContainerRef = useRef(null);
      const [showUserDropdown, setShowUserDropdown] = useState(false);
      const userDropdownRef = useRef(null);
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

      useEffect(() => {
        const handleRefresh = () => fetchNotificacoes();
        window.addEventListener('notificacoes-atualizadas', handleRefresh);
        return () => window.removeEventListener('notificacoes-atualizadas', handleRefresh);
      }, []);

      useEffect(() => {
        const fetchDollarRate = async () => {
            try {
                const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
                if (!response.ok) throw new Error('Falha na resposta da API de cotação');
                const data = await response.json();
                // Pega o valor de compra (bid) e formata para o padrão brasileiro
                const rate = parseFloat(data.USDBRL.bid).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                setDollarRate(rate);
            } catch (error) {
                console.error("Erro ao buscar cotação do dólar:", error);
                setDollarRate(null); // Reseta em caso de erro
            }
        };

        fetchDollarRate();
        const intervalId = setInterval(fetchDollarRate, 300000); // Atualiza a cada 5 minutos
        return () => clearInterval(intervalId);
      }, []);

      const fetchNotificacoes = async () => {
          try {
              const { data } = await apiClient.get('/api/notificacoes');
              setNotificacoes(data);
          } catch (err) { console.error('Erro notificação:', err); }
      };

      // Efeito para buscar com debounce
      useEffect(() => {
        if (searchTerm.trim().length < 2) {
            setSearchResults([]);
            setShowResultsDropdown(false);
            return;
        }

        setIsSearchLoading(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const { data } = await apiClient.get(`/api/search?q=${searchTerm}`);
                setSearchResults(data);
            } catch (error) {
                console.error("Erro ao buscar:", error);
                setSearchResults([]);
            } finally {
                setIsSearchLoading(false);
                setShowResultsDropdown(true);
            }
        }, 500); // Atraso de 500ms

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

      useEffect(() => {
        function handleClickOutside(e) {
            // Fecha dropdown de notificações
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
            // Fecha dropdown de pesquisa
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setShowResultsDropdown(false);
            }
            // Fecha dropdown do usuário
            if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
                setShowUserDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, [dropdownRef, searchContainerRef, userDropdownRef]);

      const handleResultClick = () => {
        // Limpa a busca e fecha o dropdown ao clicar em um resultado
        setSearchTerm('');
        setShowResultsDropdown(false);
      };

      const getNotificationIcon = (notificacao) => {
        const iconMap = {
            'nova_noticia': <FaBullhorn className="text-info" />,
            'status': notificacao.status_autorizacao === 'Recusada' ? <FaTimesCircle className="text-danger" /> : <FaCheckCircle className="text-success" />,
            'feedback': <FaCommentDots className="text-primary" />,
            'retorno': <FaCalendarCheck className="text-warning" />,
            'aprovacao_gestor': <FaUserClock className="text-warning" />,
            'nova_pergunta_faq': <FaQuestionCircle className="text-primary" />,
            'resposta_faq': <FaLightbulb className="text-success" />,
            'reserva_sala_status': <FaCalendarAlt className="text-info" />,
            'reserva_sala_atribuicao': <FaCalendarAlt className="text-primary" />,
            'aprovacao_financeiro': <FaFileInvoiceDollar className="text-warning" />,
            'status_financeiro': <FaFileInvoiceDollar className="text-info" />,
        };
        return iconMap[notificacao.tipo] || <FaBell />;
      };
      
      const handleNotificacaoClick = async (notificacao) => {
          // Marca a notificação como lida no backend
          try {
              await apiClient.patch(`/api/notificacoes/${notificacao.id}/lida`, { tipo: notificacao.tipo });
              // Remove do estado local para a UI atualizar instantaneamente
              setNotificacoes(prev => prev.filter(n => !(n.id === notificacao.id && n.tipo === notificacao.tipo)));
          } catch (err) {
              console.error("Erro ao marcar notificação como lida:", err);
          }
          
          // Fecha o dropdown
          setShowDropdown(false);
          
          // Navega para a página correta com base no tipo de notificação
          switch (notificacao.tipo) {
              case 'nova_noticia':
                  navigate('/');
                  break;
              case 'status':
              case 'feedback':
              case 'retorno':
              case 'aprovacao_gestor':
                  navigate('/crm/visitas');
                  break;
              case 'nova_pergunta_faq':
              case 'resposta_faq':
                  navigate('/dtc/perguntas');
                  break;
              case 'reserva_sala_status':
              case 'reserva_sala_atribuicao':
                  navigate('/marketing/reservas');
                  break;
              case 'aprovacao_financeiro':
              case 'status_financeiro':
                  navigate('/financeiro');
                  break;
              default:
                  navigate('/'); // Rota padrão caso o tipo não seja reconhecido
                  break;
          }
      };
      
  const handleLoginClick = () => {
    window.location.href = `${apiClient.defaults.baseURL}/auth/microsoft`;
  };

  return (
    <header className="header">
      <div className="header-area">
        <div className="header-left-section">
          {/* Botão de Toggle da Sidebar */}
          <button onClick={onToggleSidebar} className="sidebar-toggle-btn" title="Recolher/Expandir Menu">
              <FaBars />
          </button>

          {/* Barra de Pesquisa */}
          <div className="header-search-container" ref={searchContainerRef}>
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Pesquisar no sistema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {showResultsDropdown && (
                <div className="search-results-dropdown">
                    {isSearchLoading ? (
                        <div className="search-result-item-static">Carregando...</div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map(result => (
                            <Link 
                                to={`${result.path}${result.id}`} 
                                key={`${result.type}-${result.id}`} 
                                className="search-result-item"
                                onClick={handleResultClick}
                            >
                                <span className="result-title">{result.title}</span>
                                <span className="result-type">{result.type}</span>
                            </Link>
                        ))
                    ) : (
                        <div className="search-result-item-static">Nenhum resultado encontrado.</div>
                    )}
                </div>
            )}
          </div>
        </div>

        <nav className="nav">
          <a href="https://loja.dca.com.br/home" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ color: "#1d1c1cff" }}>
            Loja Online
          </a>
          
          {/* COTAÇÃO DO DÓLAR */}
          {dollarRate && (
            <a href="https://www.google.com/finance/quote/USD-BRL" target="_blank" rel="noopener noreferrer" className="dollar-rate-container" title="Cotação do Dólar Comercial (compra)">
                <FaDollarSign className="dollar-icon" />
                <span className="dollar-rate">{dollarRate}</span>
            </a>
          )}

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
                <div className="dropdown-menu dropdown-menu-end show shadow notification-dropdown">
                  <h6 className="dropdown-header">Notificações Pendentes</h6>
                  {notificacoes.length === 0 ? (
                    <div className="notification-item-empty">Você está em dia com tudo!</div>
                  ) : (
                    <div className="notification-list">
                      {notificacoes.map((n, index) => (
                        <div key={index} className="notification-item" onClick={() => handleNotificacaoClick(n)}>
                          <div className="notification-icon">{getNotificationIcon(n)}</div>
                          <div className="notification-content">
                            <span className="notification-text">
                              {/* Módulo de Visitas */}
                              {n.tipo === 'status' && <>Sua solicitação de visita em <strong>{n.nome_cliente}</strong> foi <Badge bg={n.status_autorizacao === 'Autorizada' ? 'success' : 'danger'}>{n.status_autorizacao}</Badge>.</>}
                              {n.tipo === 'feedback' && <>Ação necessária: Registre o feedback da visita em <strong>{n.nome_cliente}</strong>.</>}
                              {n.tipo === 'retorno' && <>Lembrete de retorno para <strong>{n.nome_cliente}</strong> agendado.</>}
                              {n.tipo === 'aprovacao_gestor' && <>Aprovação de visita pendente para <strong>{n.vendedor_nome}</strong> no cliente <strong>{n.nome_cliente}</strong>.</>}
                              
                              {/* Módulo de Notícias */}
                              {n.tipo === 'nova_noticia' && <>Nova Publicação: <strong>{n.titulo}</strong>.</>}

                              {/* Módulo de FAQ Técnico */}
                              {n.tipo === 'nova_pergunta_faq' && <>Nova dúvida técnica: <strong>"{n.titulo}"</strong> foi atribuída a você.</>}
                              {n.tipo === 'resposta_faq' && <>Sua pergunta <strong>"{n.titulo}"</strong> foi respondida.</>}

                              {/* Módulo de Marketing */}
                              {n.tipo === 'reserva_sala_status' && <>Sua reserva <strong>"{n.titulo}"</strong> foi <Badge bg={n.status === 'Aprovado' ? 'success' : (n.status === 'Recusado' ? 'danger' : 'warning')}>{n.status}</Badge>.</>}
                              {n.tipo === 'reserva_sala_atribuicao' && <>Você foi definido como apresentador para a reserva <strong>"{n.titulo}"</strong>.</>}

                              {/* Módulo Financeiro */}
                              {n.tipo === 'aprovacao_financeiro' && <>Aprovação financeira pendente para <strong>{n.nome_cliente}</strong>.</>}
                              {n.tipo === 'status_financeiro' && <>Sua solicitação de <strong>{n.nome_cliente}</strong> foi atualizada.</>}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="dropdown-footer">
                    <Link to="/notificacoes/todas">Ver todas as notificações</Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoggedIn ? (
            <div className="user-profile" ref={userDropdownRef}>
                <div className={`user-profile-trigger ${showUserDropdown ? 'open' : ''}`} onClick={() => setShowUserDropdown(!showUserDropdown)}>
                    <span className="user-name">
                        {user ? user.displayName || user.nome_completo || 'Usuário' : ''}
                    </span>
                    {user?.userpic_url && (
                        <img src={user.userpic_url} alt="Foto do usuário" className="user-profile-pic" />
                    )}
                    <FaChevronDown size={12} className="user-dropdown-chevron" />
                </div>

                {showUserDropdown && (
                    <div className="dropdown-menu dropdown-menu-end show shadow user-dropdown-menu">
                        <Link to="/perfil" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                            <FaUserCircle className="me-2" /> Meu Perfil
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button onClick={() => { onLogout(); setShowUserDropdown(false); }} className="dropdown-item text-danger">
                            <RiLogoutBoxRLine className="me-2" /> Sair
                        </button>
                    </div>
                )}
            </div>
          ) : (
            <div className="user-profile">
              <button onClick={handleLoginClick} className="login-button btn btn-outline-primary">
                Login
              </button>
            </div>
          )}

        </nav>
      </div>
    </header>
  );
}

export default Header;