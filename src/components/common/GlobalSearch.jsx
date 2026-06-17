import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaUserCircle, FaIndustry } from 'react-icons/fa';
import apiClient from '../../services/api';
import '../../styles/Header.css'; // Reutiliza os estilos existentes

const GlobalSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchContainerRef = useRef(null);

    // Efeito para busca com atraso (debounce)
    useEffect(() => {
        if (searchTerm.trim().length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const { data } = await apiClient.get(`/api/search?q=${searchTerm}`);
                setResults(data);
                setShowDropdown(true);
            } catch (error) {
                console.error("Erro na busca global:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Efeito para fechar o dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleResultClick = () => {
        setSearchTerm('');
        setShowDropdown(false);
    };

    const getIcon = (type) => {
        switch(type) {
            case 'Colaborador': return <FaUserCircle className="text-muted" size={24} />;
            case 'Fabricante': return <FaIndustry className="text-muted" size={20} />;
            default: return <FaSearch className="text-muted" size={18} />;
        }
    };

    return (
        <div className="header-search-container" ref={searchContainerRef}>
            <FaSearch className="search-icon" />
            <input
                type="text"
                className="search-input"
                placeholder="Pesquisar no sistema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length > 1 && setShowDropdown(true)}
            />
            {showDropdown && (
                <div className="search-results-dropdown">
                    {isLoading ? (
                        <div className="search-result-item-static">Carregando...</div>
                    ) : results.length > 0 ? (
                        results.map((result) => (
                            <Link
                                to={`${result.path}${result.id}`}
                                key={`${result.type}-${result.id}`}
                                className="search-result-item d-flex align-items-center p-2 text-decoration-none border-bottom"
                                onClick={handleResultClick}
                            >
                                <div className="me-3 flex-shrink-0">
                                    {result.image_url ? (
                                        <img src={result.image_url} alt={result.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                                    ) : (
                                        <div className="bg-light d-flex align-items-center justify-content-center rounded-circle" style={{ width: '40px', height: '40px' }}>
                                            {getIcon(result.type)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <span className="result-title d-block fw-bold text-dark text-truncate">{result.title}</span>
                                    <span className="result-type d-block text-muted small mt-1">{result.type}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="search-result-item-static">Nenhum resultado encontrado.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;