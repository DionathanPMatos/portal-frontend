import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

// Hook customizado para facilitar o uso do contexto
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState({
        // Valores padrão para evitar erros antes do carregamento
        logo_url: '/src/assets/logo-dca.png', 
        page_title: 'Portal Comercial DCA',
        favicon_url: '/favicon.ico',
        // ...outros valores padrão
    });
    const [isLoadingTheme, setIsLoadingTheme] = useState(true);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Pega a preferência do utilizador do localStorage, ou usa o padrão (false)
        return localStorage.getItem('darkMode') === 'true';
    });


        // NOVA FUNÇÃO para alternar o tema
    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => {
            const newMode = !prevMode;
            // Guarda a nova preferência no localStorage
            localStorage.setItem('darkMode', newMode);
            return newMode;
        });
    };

        // Efeito para aplicar a classe ao body
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);


    useEffect(() => {
        const fetchAndApplyTheme = async () => {
            try {
                // O cache buster que já implementamos
                const response = await axios.get(`/api/settings?_=${new Date().getTime()}`);
                const settings = response.data;
                setTheme(settings); // Armazena as configurações no estado

                // --- APLICAÇÃO DOS DADOS GLOBAIS ---

                // 1. Aplica o Título da Página
                document.title = settings.page_title || 'Portal Comercial DCA';
                
                // 2. Aplica o Favicon
                const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
                favicon.type = 'image/x-icon';
                favicon.rel = 'shortcut icon';
                favicon.href = settings.favicon_url || '/favicon.ico';
                document.getElementsByTagName('head')[0].appendChild(favicon);

                // 3. Aplica as Cores e Fundo via Variáveis CSS
                const root = document.documentElement;
                root.style.setProperty('--system-background', settings.background);
                root.style.setProperty('--sidebar-color', settings.sidebar_color);
                root.style.setProperty('--header-color', settings.header_color);
                root.style.setProperty('--sidebar-icon-color', settings.sidebar_icon_color);
                root.style.setProperty('--sidebar-active-color', settings.sidebar_active_color);
                root.style.setProperty('--dark-mode-background', settings.dark_mode_background);
                root.style.setProperty('--dark-mode-surface', settings.dark_mode_surface);
                root.style.setProperty('--dark-mode-primary-text', settings.dark_mode_primary_text);
                root.style.setProperty('--light-mode-surface', settings.light_mode_surface);
                root.style.setProperty('--dark-mode-secondary-text', settings.dark_mode_secondary_text);
                root.style.setProperty('--card-header-bg', settings.card_header_bg || '#153049');
                root.style.setProperty('--card-header-text', settings.card_header_text || '#ffffff');

            } catch (error) {
                console.error("Erro ao carregar tema, usando valores padrão.", error);
            } finally {
                setIsLoadingTheme(false);
            }
        };

        fetchAndApplyTheme();
    }, []); // O [] garante que rode apenas uma vez

    return (
        <ThemeContext.Provider value={{ theme, isLoadingTheme, isDarkMode, toggleDarkMode }}>
            {!isLoadingTheme && children}
        </ThemeContext.Provider>
    );
};