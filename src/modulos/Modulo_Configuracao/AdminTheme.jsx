import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useTheme } from './ThemeContext';

function AdminTheme() {
  const { refreshTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State for form fields
  const [pageTitle, setPageTitle] = useState('');
  const [sidebarColor, setSidebarColor] = useState('#153049');
  const [headerColor, setHeaderColor] = useState('#ffffff');
  const [sidebarIconColor, setSidebarIconColor] = useState('#ffffff');
  const [sidebarActiveColor, setSidebarActiveColor] = useState('#a72323');
  const [cardHeaderBg, setCardHeaderBg] = useState('#153049');
  const [cardHeaderText, setCardHeaderText] = useState('#ffffff');
  
  // New login theme states
  const [login_bg_color, setLoginBgColor] = useState('#e9ecef');
  const [loginBgImageFile, setLoginBgImageFile] = useState(null);
  const [loginBgImageUrl, setLoginBgImageUrl] = useState('');
  const [loginLogoFile, setLoginLogoFile] = useState(null);
  const [loginLogoUrl, setLoginLogoUrl] = useState('');

  // Other existing states
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  
  useEffect(() => {
    axios.get('/api/settings')
      .then(response => {
        const data = response.data;
        setPageTitle(data.page_title || 'Portal DCA');
        setSidebarColor(data.sidebar_color || '#153049');
        setHeaderColor(data.header_color || '#ffffff');
        setSidebarIconColor(data.sidebar_icon_color || '#ffffff');
        setSidebarActiveColor(data.sidebar_active_color || '#a72323');
        setCardHeaderBg(data.card_header_bg || '#153049');
        setCardHeaderText(data.card_header_text || '#ffffff');
        setLogoUrl(data.logo_url || '');
        
        // Set new login theme values
        setLoginBgColor(data.login_bg_color || '#e9ecef');
        setLoginBgImageUrl(data.login_bg_image || '');
        setLoginLogoUrl(data.login_logo_url || '');

        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar configurações:", error);
        setMessage({ type: 'danger', text: 'Não foi possível carregar as configurações atuais.' });
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('pageTitle', pageTitle);
    formData.append('sidebarColor', sidebarColor);
    formData.append('headerColor', headerColor);
    formData.append('sidebarIconColor', sidebarIconColor);
    formData.append('sidebarActiveColor', sidebarActiveColor);
    formData.append('card_header_bg', cardHeaderBg);
    formData.append('card_header_text', cardHeaderText);
    
    // Append new login theme data
    formData.append('login_bg_color', login_bg_color);
    if (loginBgImageFile) {
      formData.append('loginBgImageFile', loginBgImageFile);
    }
    if (loginLogoFile) {
      formData.append('loginLogoFile', loginLogoFile);
    }

    if (logoFile) {
      formData.append('logoFile', logoFile);
    }

    try {
      await axios.post('/api/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Tema atualizado com sucesso! A página será recarregada.' });
      
      setTimeout(() => {
        refreshTheme(); // This should trigger a fetch in ThemeContext
        window.location.reload(); // Force reload to see all changes
      }, 2000);

    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setMessage({ type: 'danger', text: 'Erro ao salvar as configurações.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    
    <Container fluid className="p-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h4">Personalização do Tema</Card.Title>
            </Card.Header>
            <Card.Body>
              {message.text && <Alert variant={message.type}>{message.text}</Alert>}
              {loading ? <div className="text-center"><Spinner animation="border" /></div> : (
                <Form onSubmit={handleSave}>
                  <Row>
                    {/* General Settings Column */}
                    <Col md={6} className="border-end">
                      <h5>Geral e Cores do Sistema</h5>
                      <hr/>
                      <Form.Group className="mb-3">
                        <Form.Label>Título da Página</Form.Label>
                        <Form.Control type="text" value={pageTitle} onChange={e => setPageTitle(e.target.value)} />
                      </Form.Group>
                      
                      <Form.Group className="mb-4">
                        <Form.Label>Logo do Sistema (Topo do Menu)</Form.Label>
                        {logoUrl && <img src={logoUrl} alt="Logo atual" style={{ display: 'block', height: '40px', marginBottom: '10px', background: '#ccc', padding: '5px', borderRadius: '4px' }} />}
                        <Form.Control type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={e => setLogoFile(e.target.files[0])} />
                      </Form.Group>
                      
                      <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column sm="4">Cor do Menu Lateral</Form.Label>
                        <Col sm="8">
                          <Form.Control type="color" value={sidebarColor} onChange={e => setSidebarColor(e.target.value)} style={{height: '40px'}} />
                        </Col>
                      </Form.Group>
                      <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column sm="4">Cor do Cabeçalho</Form.Label>
                        <Col sm="8">
                          <Form.Control type="color" value={headerColor} onChange={e => setHeaderColor(e.target.value)} style={{height: '40px'}} />
                        </Col>
                      </Form.Group>
                      <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column sm="4">Cor dos Ícones do Menu</Form.Label>
                        <Col sm="8">
                          <Form.Control type="color" value={sidebarIconColor} onChange={e => setSidebarIconColor(e.target.value)} style={{height: '40px'}} />
                        </Col>
                      </Form.Group>
                      <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column sm="4">Cor do Item Ativo no Menu</Form.Label>
                        <Col sm="8">
                          <Form.Control type="color" value={sidebarActiveColor} onChange={e => setSidebarActiveColor(e.target.value)} style={{height: '40px'}} />
                        </Col>
                      </Form.Group>
                      
                      <h5 className="mt-4">Cabeçalho dos Cards (Padrão)</h5>
                      <hr/>
                      <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column sm="4">Cor de Fundo</Form.Label>
                        <Col sm="8">
                          <Form.Control type="color" value={cardHeaderBg} onChange={e => setCardHeaderBg(e.target.value)} style={{height: '40px'}} />
                        </Col>
                      </Form.Group>
                      <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column sm="4">Cor do Texto</Form.Label>
                        <Col sm="8">
                          <Form.Control type="color" value={cardHeaderText} onChange={e => setCardHeaderText(e.target.value)} style={{height: '40px'}} />
                        </Col>
                      </Form.Group>
                    </Col>

                    {/* Login Screen Settings Column */}
                    <Col md={6}>
                      <h5>Tela de Login</h5>
                      <hr/>
                      <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column sm="4">Cor de Fundo (atrás da imagem)</Form.Label>
                        <Col sm="8">
                          <Form.Control type="color" value={login_bg_color} onChange={e => setLoginBgColor(e.target.value)} style={{height: '40px'}} />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Imagem de Fundo (1920x800 recomendado)</Form.Label>
                        {loginBgImageUrl && <img src={loginBgImageUrl} alt="Fundo atual" style={{ display: 'block', width: '100%', marginBottom: '10px', objectFit: 'cover', height: '100px', borderRadius: '4px', border: '1px solid #ddd' }} />}
                        <Form.Control type="file" accept="image/*" onChange={e => setLoginBgImageFile(e.target.files[0])} />
                        <Form.Text className="text-muted">
                          Esta imagem aparecerá como uma faixa horizontal na tela de login.
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Logo da Tela de Login (Opcional)</Form.Label>
                        {loginLogoUrl && <img src={loginLogoUrl} alt="Logo Login atual" style={{ display: 'block', height: '40px', marginBottom: '10px', background: '#ccc', padding: '5px', borderRadius: '4px' }} />}
                        <Form.Control type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={e => setLoginLogoFile(e.target.files[0])} />
                        <Form.Text className="text-muted">
                          Se não for enviada, a logo do sistema será usada como padrão.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end mt-4">
                    <Button variant="primary" type="submit" disabled={saving} size="lg">
                      {saving ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Salvando...</> : 'Salvar Alterações'}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminTheme;