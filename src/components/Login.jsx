import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { useTheme } from '../modulos/Modulo_Configuracao/ThemeContext';
import axios from 'axios';
import { FaMicrosoft } from 'react-icons/fa';
import '../css/Login.css';

function Login() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Define o URL Base
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Aplica classe no body para ocultar o chat da IA apenas na tela de login
  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  // Função de Login com Email e Senha (Local)
  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // A rota '/auth/local' precisará ser tratada no seu Backend
      const response = await axios.post('/auth/local', { email, password });
      if (response.status === 200) {
          // Redireciona para o root após autenticação com sucesso
          window.location.href = '/'; 
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  // Função de Login via Microsoft (Mesmo fluxo usado no Header)
  const handleMicrosoftLogin = () => {
    window.location.href = `${API_URL}/auth/microsoft`;
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
        {/* Alinha ao centro no mobile e à direita (end) nas telas maiores */}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formBasicPassword">
                    <Form.Label className="text-dark fw-semibold">Senha</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="Sua senha de acesso" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

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
    </div>
  );
}

export default Login;