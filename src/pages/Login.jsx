import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 🚀 NOVO IMPORT AQUI
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { useTheme } from '../contexts/ThemeContext';
import apiClient from '../services/api';  // Importa a instância configurada do Axios
import { FaMicrosoft } from 'react-icons/fa';
import ForgotPasswordModal from '../features/human-resources/pages/ForgotPasswordModal';
import '../styles/Login.css';

function Login() {
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate(); // 🚀 NOVO
  const location = useLocation(); // 🚀 NOVO

  // Aplica classe no body para ocultar o chat da IA apenas na tela de login
  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  // 🚀 NOVO: useEffect PARA CAPTURAR A VOLTA DA MICROSOFT
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get('token');
    const errorFromUrl = searchParams.get('login_error');

    // Este efeito é para o callback do login da Microsoft, que envia um token JWT.
    // Verificamos se o token parece um JWT (tem 3 partes separadas por '.') antes de processar.
    if (tokenFromUrl && tokenFromUrl.split('.').length === 3) {
      try {
        console.log("Token recebido da Microsoft, processando...");
        
        // 1. Decodifica o Token JWT para pegar os dados do usuário embutidos nele
        const base64Url = tokenFromUrl.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const user = JSON.parse(jsonPayload);

        // 2. Salva EXATAMENTE como o seu login local salva!
        localStorage.setItem('@portal_token', tokenFromUrl);
        localStorage.setItem('@portal_user', JSON.stringify(user));
        
        // 3. Joga para a tela inicial
        window.location.href = '/'; 
      } catch (e) {
        console.error("Erro ao decodificar o token:", e);
        setError("Ocorreu um erro ao ler a resposta da Microsoft.");
      }
    }

    if (errorFromUrl) {
      setError(`Erro no login da Microsoft: ${errorFromUrl}`);
      navigate('/', { replace: true }); // Limpa a URL
    }
  }, [location, navigate]);

  // Função de Login com Email e Senha (Local)
  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Fazendo a requisição para a rota correta do nosso backend
      const response = await apiClient.post('/api/auth/login', { email: e.target.formBasicEmail.value, password: e.target.formBasicPassword.value });
      if (response.status === 200) {
        // SALVA O CRACHÁ!
        localStorage.setItem('@portal_token', response.data.token);
        localStorage.setItem('@portal_user', JSON.stringify(response.data.user));
        
        window.location.href = '/'; 
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // Função de Login via Microsoft (Mesmo fluxo usado no Header)
  const handleMicrosoftLogin = () => {
    window.location.href = `${apiClient.defaults.baseURL}/api/auth/microsoft`;
  };

  // Propriedades do tema, caso estejam ausentes usa valores padrão
  const bgColor = theme?.login_bg_color || theme?.primary_color || '#e9ecef';
  
  // Imagem de fundo personalizável. Substitua pela URL padrão que preferir
  const bgImage = theme?.login_bg_image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80';
  
  const logoUrl = theme?.login_logo_url || theme?.logo_url || '/src/assets/logos/dca-logo.png';

  return (
    <div className="login-container" style={{ backgroundColor: bgColor }}>
      <div 
        className="login-background-image" 
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>
      
      <Container fluid className="login-content h-100">
        <Row className="h-100 align-items-center justify-content-center justify-content-lg-end">
          <Col xs={11} sm={8} md={6} lg={4} className="login-card-wrapper">
            <Card className="login-card shadow-lg border-0 rounded-4">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <img src={logoUrl} alt="Logo" style={{ height: '60px', objectFit: 'contain' }} />
                  <h4 className="mt-4 fw-bold text-dark">Bem-vindo(a)</h4>
                  <p className="text-muted">Faça login para acessar o sistema</p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleLocalLogin}>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className="text-dark fw-semibold">Email corporativo</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="seu.nome@empresa.com.br"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formBasicPassword">
                    <Form.Label className="text-dark fw-semibold">Senha</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="Sua senha de acesso"
                      required
                    />
                  </Form.Group>

                  <div className="text-end mb-3">
                    <Button variant="link" size="sm" onClick={() => setShowForgotModal(true)} className="p-0">
                      Esqueci minha senha
                    </Button>
                  </div>

                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg" 
                      disabled={loading} 
                      style={{ 
                        backgroundColor: theme?.primary_color || '#0d6efd', 
                        borderColor: theme?.primary_color || '#0d6efd' 
                      }}
                    >
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </div>
                </Form>

                <div className="text-center my-4 position-relative">
                  <hr className="text-muted" />
                  <span className="text-muted position-absolute top-50 start-50 translate-middle bg-white px-2" style={{ fontSize: '0.9rem' }}>
                    OU
                  </span>
                </div>

                <div className="d-grid gap-2">
                  <Button 
                    variant="outline-dark" 
                    size="lg" 
                    onClick={handleMicrosoftLogin}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <FaMicrosoft className="me-2 text-primary" /> Entrar com a Microsoft
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <ForgotPasswordModal show={showForgotModal} onHide={() => setShowForgotModal(false)} />
    </div>
  );
}

export default Login;