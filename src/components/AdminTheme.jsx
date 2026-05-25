import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const AdminTheme = () => {
    // 1. ADICIONADOS ESTADOS PARA AS CORES DO MODO ESCURO
    const [settings, setSettings] = useState({
        backgroundType: 'image',
        backgroundColor: '#f0f4f7',
        sidebarColor: '#153049',
        headerColor: '#ffffff',
        pageTitle: '',
        sidebarIconColor: '#ffffff',
        sidebarActiveColor: '#a72323',
        lightModeSurface: 'rgba(255, 255, 255, 0.92)',
        darkModeBackground: '#121212',
        darkModeSurface: '#1E1E1E',
        darkModePrimaryText: '#E1E1E1',
        darkModeSecondaryText: '#BBBBBB'
    });
    const [files, setFiles] = useState({
        backgroundImageFile: null,
        logoFile: null,
        faviconFile: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/settings');
                const loaded = response.data;
                // 2. CARREGA OS DADOS DO MODO ESCURO DA API
                setSettings({
                    backgroundType: loaded.background?.startsWith('url(') ? 'image' : 'color',
                    backgroundColor: loaded.background?.startsWith('url(') ? '#f0f4f7' : loaded.background,
                    sidebarColor: loaded.sidebar_color,
                    headerColor: loaded.header_color,
                    pageTitle: loaded.page_title,
                    sidebarIconColor: loaded.sidebar_icon_color,
                    sidebarActiveColor: loaded.sidebar_active_color,
                    lightModeSurface: loaded.light_mode_surface,
                    darkModeBackground: loaded.dark_mode_background,
                    darkModeSurface: loaded.dark_mode_surface,
                    darkModePrimaryText: loaded.dark_mode_primary_text,
                    darkModeSecondaryText: loaded.dark_mode_secondary_text
                });
            } catch (err) {
                setError('Falha ao carregar configurações atuais.');
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        
        formData.append('backgroundType', settings.backgroundType);
        if (settings.backgroundType === 'color') {
            formData.append('backgroundColor', settings.backgroundColor);
        }
        formData.append('sidebarColor', settings.sidebarColor);
        formData.append('headerColor', settings.headerColor);
        formData.append('pageTitle', settings.pageTitle);
        formData.append('sidebarIconColor', settings.sidebarIconColor);
        formData.append('sidebarActiveColor', settings.sidebarActiveColor);
        formData.append('lightModeSurface', settings.lightModeSurface);
        
        // 3. ADICIONA OS DADOS DO MODO ESCURO AO ENVIO
        formData.append('darkModeBackground', settings.darkModeBackground);
        formData.append('darkModeSurface', settings.darkModeSurface);
        formData.append('darkModePrimaryText', settings.darkModePrimaryText);
        formData.append('darkModeSecondaryText', settings.darkModeSecondaryText);

        if (files.backgroundImageFile) formData.append('backgroundImageFile', files.backgroundImageFile);
        if (files.logoFile) formData.append('logoFile', files.logoFile);
        if (files.faviconFile) formData.append('faviconFile', files.faviconFile);

        try {
            const response = await axios.post('http://localhost:3000/api/settings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(response.data.message + " A página será recarregada para aplicar as mudanças.");
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setError('Erro ao salvar as configurações.');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <Container className="mt-5 text-center"><Spinner/></Container>;

    // O resto do seu JSX continua igual, pois já estava correto.
    return (
        <Container className="my-5 ">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <Card>
                        <Card.Header><h4 style={{ color: '#fff' }}>Configurações de Aparência e Identidade</h4></Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                {/* ... Seção de Identidade Visual ... */}
                                <fieldset className="mb-4 p-3 border rounded">
                                    <legend className="h6">Identidade Visual</legend>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Título da Página (Aba do Navegador)</Form.Label>
                                        <Form.Control type="text" name="pageTitle" value={settings.pageTitle || ''} onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Logo do Cabeçalho</Form.Label>
                                        <Form.Control type="file" name="logoFile" onChange={handleFileChange} />
                                        <Form.Text>Envie um novo arquivo para substituir o logo atual.</Form.Text>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Ícone da Página (Favicon)</Form.Label>
                                        <Form.Control type="file" name="faviconFile" onChange={handleFileChange} />
                                        <Form.Text>Recomendado: .ico ou .png (32x32 pixels).</Form.Text>
                                    </Form.Group>
                                </fieldset>

                                {/* ... Seção de Fundo do Sistema ... */}
                                <fieldset className="mb-4 p-3 border rounded">
                                    <legend className="h6">Fundo do Sistema</legend>
                                    <Form.Check type="radio" name="backgroundType" label="Usar Imagem" value="image" checked={settings.backgroundType === 'image'} onChange={handleInputChange} />
                                    <Form.Check type="radio" name="backgroundType" label="Usar Cor Sólida" value="color" checked={settings.backgroundType === 'color'} onChange={handleInputChange} />

                                    {settings.backgroundType === 'image' && (
                                        <Form.Group className="mt-2">
                                            <Form.Label>Enviar nova imagem de fundo</Form.Label>
                                            <Form.Control type="file" name="backgroundImageFile" onChange={handleFileChange} />
                                        </Form.Group>
                                    )}
                                    {settings.backgroundType === 'color' && (
                                        <Form.Group className="mt-2">
                                            <Form.Label>Escolha a cor de fundo</Form.Label>
                                            <Form.Control type="color" name="backgroundColor" value={settings.backgroundColor} onChange={handleInputChange} />
                                        </Form.Group>
                                    )}
                                </fieldset>

                                {/* ... Seção Cores da Interface ... */}
                                <fieldset className="p-3 border rounded">
                                    <legend className="h6">Cores da Interface (Modo Claro)</legend>
                                    <Form.Group as={Row} className="mb-3 align-items-center">
                                        <Form.Label column sm={4}>Superfícies (Cards)</Form.Label>
                                        <Col sm={8}><Form.Control style={{ height: '40px' }} type="color" name="lightModeSurface" value={settings.lightModeSurface} onChange={handleInputChange} /></Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-3 align-items-center">
                                        <Form.Label column sm={4}>Cor do Cabeçalho</Form.Label>
                                        <Col sm={8}><Form.Control style={{ height: '40px' }} type="color" name="headerColor" value={settings.headerColor} onChange={handleInputChange} /></Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="align-items-center mb-3">
                                        <Form.Label column sm={4}>Cor da Barra Lateral</Form.Label>
                                        <Col sm={8}><Form.Control style={{ height: '40px' }} type="color" name="sidebarColor" value={settings.sidebarColor} onChange={handleInputChange} /></Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3 align-items-center">
                                        <Form.Label column sm={4}>Cor dos Ícones (Sidebar)</Form.Label>
                                        <Col sm={8}><Form.Control style={{ height: '40px' }} type="color" name="sidebarIconColor" value={settings.sidebarIconColor} onChange={handleInputChange} /></Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="align-items-center">
                                        <Form.Label column sm={4}>Cor do Ícone Ativo (Sidebar)</Form.Label>
                                        <Col sm={8}><Form.Control style={{ height: '40px' }} type="color" name="sidebarActiveColor" value={settings.sidebarActiveColor} onChange={handleInputChange} /></Col>
                                    </Form.Group>
                                </fieldset>

                                {/* ... Seção Cores do Modo Escuro ... */}
                                <fieldset className="p-3 border rounded mt-4">
                                    <legend className="h6">Cores do Modo Escuro</legend>
                                    <Form.Group as={Row} className="mb-3 align-items-center">
                                        <Form.Label column sm={4}>Fundo</Form.Label>
                                        <Col sm={8}><Form.Control style={{ height: '40px' }} type="color" name="darkModeBackground" value={settings.darkModeBackground} onChange={handleInputChange} /></Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3 align-items-center">
                                        <Form.Label column sm={4}>Superfícies (Cards)</Form.Label>
                                        <Col sm={8}><Form.Control style={{ height: '40px' }} type="color" name="darkModeSurface" value={settings.darkModeSurface} onChange={handleInputChange} /></Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3 align-items-center">
                                        <Form.Label column sm={4}>Texto Principal</Form.Label>
                                        <Col sm={8}><Form.Control style={{ height: '40px' }} type="color" name="darkModePrimaryText" value={settings.darkModePrimaryText} onChange={handleInputChange} /></Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="align-items-center">
                                        <Form.Label column sm={4}>Texto Secundário</Form.Label>
                                        <Col sm={8}><Form.Control style={{ height: '40px' }} type="color" name="darkModeSecondaryText" value={settings.darkModeSecondaryText} onChange={handleInputChange} /></Col>
                                    </Form.Group>
                                </fieldset>

                                <div className="text-end mt-4">
                                    <Button type="submit" disabled={loading}>
                                        {loading ? <Spinner as="span" size="sm" /> : 'Salvar Alterações'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminTheme;