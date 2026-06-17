import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RiLogoutBoxRLine } from "react-icons/ri";
import { FaUserCircle, FaChevronDown } from 'react-icons/fa';
import { useAuth } from "../../contexts/AuthContext";
import apiClient from '../../services/api';
import '../../styles/Header.css';

const UserProfileDropdown = () => {
    const { isLoggedIn, user, onLogout } = useAuth();
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const userDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLoginClick = () => {
        window.location.href = `${apiClient.defaults.baseURL}/auth/microsoft`;
    };

    if (!isLoggedIn) {
        return (<div className="user-profile"><button onClick={handleLoginClick} className="login-button btn btn-outline-primary">Login</button></div>);
    }

    return (
        <div className="user-profile" ref={userDropdownRef}>
            <div className={`user-profile-trigger ${showUserDropdown ? 'open' : ''}`} onClick={() => setShowUserDropdown(!showUserDropdown)}>
                {user?.userpic_url && (<img src={user.userpic_url} alt="Foto do usuário" className="user-profile-pic" />)}
                <div className="user-info">
                    <span className="user-name">{user?.nome_completo || 'Usuário'}</span>
                    <span className="user-role">{user?.cargo?.nome_cargo || 'Colaborador'}</span>
                </div>
                <FaChevronDown size={12} className="user-dropdown-chevron" />
            </div>

            {showUserDropdown && (
                <div className="dropdown-menu dropdown-menu-end show shadow user-dropdown-menu">
                    <Link to="/perfil" className="dropdown-item" onClick={() => setShowUserDropdown(false)}><FaUserCircle className="me-2" /> Meu Perfil</Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={() => { onLogout(); setShowUserDropdown(false); }} className="dropdown-item text-danger"><RiLogoutBoxRLine className="me-2" /> Sair</button>
                </div>
            )}
        </div>
    );
};

export default UserProfileDropdown;