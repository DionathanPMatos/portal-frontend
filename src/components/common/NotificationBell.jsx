import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaBullhorn, FaUserClock, FaCheckCircle, FaTimesCircle, FaCommentDots, FaCalendarCheck, FaQuestionCircle, FaLightbulb, FaCalendarAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import { Badge, Toast, ToastContainer } from 'react-bootstrap';
import apiClient from '../../services/api';
import '../../styles/Header.css';

const NotificationBell = () => {
    const [notificacoes, setNotificacoes] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastInfo, setToastInfo] = useState({ message: '', variant: 'success' });
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotificacoes = async () => {
        try {
            const { data } = await apiClient.get('/api/notificacoes');
            setNotificacoes(data);
        } catch (err) {
            console.error('Erro ao buscar notificações:', err);
        }
    };

    useEffect(() => {
        fetchNotificacoes();
        const interval = setInterval(fetchNotificacoes, 60000); // Atualiza a cada minuto
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificacaoClick = async (notificacao) => {
        try {
            await apiClient.patch(`/api/notificacoes/${notificacao.id}/lida`, { tipo: notificacao.tipo });
            setNotificacoes(prev => prev.filter(n => !(n.id === notificacao.id && n.tipo === notificacao.tipo)));
        } catch (err) {
            console.error("Erro ao marcar notificação como lida:", err);
        }
        
        setShowDropdown(false);
        
        const routes = {
            'nova_noticia': '/', 'status': '/crm/visitas', 'feedback': '/crm/visitas',
            'retorno': '/crm/visitas', 'aprovacao_gestor': '/crm/visitas', 'nova_pergunta_faq': '/dtc/perguntas',
            'resposta_faq': '/dtc/perguntas', 'reserva_sala_status': '/marketing/reservas',
            'reserva_sala_atribuicao': '/marketing/reservas', 'aprovacao_financeiro': '/financeiro',
            'status_financeiro': '/financeiro',
        };
        navigate(routes[notificacao.tipo] || '/');
    };

    const handleMarkAllAsRead = async () => {
        if (notificacoes.length === 0) return;
        try {
            await apiClient.post('/api/notificacoes/marcar-todas-lidas');
            fetchNotificacoes();
            setToastInfo({ message: 'Notificações informativas marcadas como lidas!', variant: 'success' });
            setShowToast(true);
        } catch (err) {
            console.error("Erro ao marcar todas como lidas:", err);
            setToastInfo({ message: 'Ocorreu um erro.', variant: 'danger' });
            setShowToast(true);
        }
    };

    const getNotificationIcon = (notificacao) => {
        const iconMap = {
            'nova_noticia': <FaBullhorn className="text-info" />, 'status': notificacao.status_autorizacao === 'Recusada' ? <FaTimesCircle className="text-danger" /> : <FaCheckCircle className="text-success" />,
            'feedback': <FaCommentDots className="text-primary" />, 'retorno': <FaCalendarCheck className="text-warning" />, 'aprovacao_gestor': <FaUserClock className="text-warning" />,
            'nova_pergunta_faq': <FaQuestionCircle className="text-primary" />, 'resposta_faq': <FaLightbulb className="text-success" />, 'reserva_sala_status': <FaCalendarAlt className="text-info" />,
            'reserva_sala_atribuicao': <FaCalendarAlt className="text-primary" />, 'aprovacao_financeiro': <FaFileInvoiceDollar className="text-warning" />, 'status_financeiro': <FaFileInvoiceDollar className="text-info" />,
        };
        return iconMap[notificacao.tipo] || <FaBell />;
    };

    return (
        <>
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1100 }}>
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide bg={toastInfo.variant}>
                    <Toast.Header><strong className="me-auto">Notificação</strong></Toast.Header>
                    <Toast.Body className={toastInfo.variant === 'light' || toastInfo.variant === 'warning' ? '' : 'text-white'}>{toastInfo.message}</Toast.Body>
                </Toast>
            </ToastContainer>

            <div className="position-relative" ref={dropdownRef}>
                <div onClick={() => setShowDropdown(!showDropdown)} className="header-icon-btn" title="Notificações">
                    <FaBell size={22} />
                    {notificacoes.length > 0 && (<span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem', transform: 'translate(-50%, -20%)' }}>{notificacoes.length}</span>)}
                </div>

                {showDropdown && (
                    <div className="dropdown-menu dropdown-menu-end show shadow notification-dropdown">
                        <h6 className="dropdown-header">Notificações Pendentes</h6>
                        {notificacoes.length === 0 ? (<div className="notification-item-empty">Você está em dia com tudo!</div>) : (
                            <div className="notification-list">
                                {notificacoes.map((n, index) => (
                                    <div key={index} className="notification-item" onClick={() => handleNotificacaoClick(n)}>
                                        <div className="notification-icon">{getNotificationIcon(n)}</div>
                                        <div className="notification-content"><span className="notification-text">{/* ... Lógica de texto ... */}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="dropdown-footer">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleMarkAllAsRead(); }} className="mark-all-read-link">Marcar todas como lidas</a>
                            <Link to="/notificacoes/todas">Ver todas</Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationBell;