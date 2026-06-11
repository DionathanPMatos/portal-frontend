import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUpload, FaArrowLeft } from 'react-icons/fa';
import apiClient from '../../../services/api'; // Importa a instância configurada do Axios

const AdminDashboardPage = () => { // Renomeado
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(''); // Mensagem para o usuário
    const [isLoading, setIsLoading] = useState(false);

    // 1. Atualiza o estado quando o usuário seleciona um arquivo
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadStatus(''); // Limpa mensagens anteriores
    };

    // 2. Envia o arquivo para o backend (server.js)
    const handleUpload = async (event) => {
    // Evita o reload da página se isso estiver atrelado a um form onSubmit
    event.preventDefault(); 

    setIsLoading(true);
    setUploadStatus('Importando dados, por favor aguarde...');
    
    const formData = new FormData();
    formData.append('file', selectedFile); 

    try {
        // No Axios, passamos a rota, o payload (formData) e as configurações
        const response = await apiClient.post('/api/faturamento/upload', formData, {
            headers: {
                // Boa prática: informar explicitamente ao backend que é um envio de arquivo
                'Content-Type': 'multipart/form-data', 
            }
        });

        // O Axios já converte a resposta para JSON e coloca dentro de "response.data"
        setUploadStatus(response.data.message || 'Arquivo importado com sucesso!'); 
        setSelectedFile(null); 
        
        // Limpa o input do formulário
        event.target.reset(); 

    } catch (error) {
        console.error('Erro no upload:', error);
        
        // Ele busca a mensagem enviada pelo backend, ou cai para a mensagem genérica
        const errorMessage = error.response?.data?.error || error.message || 'Falha no upload.';
        setUploadStatus(`Erro: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
};

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    {/* Link para voltar ao Painel de Admin */}
                    <Link to="/admin" className="btn btn-outline-secondary mb-3">
                        <FaArrowLeft className="me-2" />
                        Voltar ao Painel
                    </Link>

                    <Card className="shadow-sm border-0">
                        <Card.Header as="h5">Gerenciamento do Dashboard (Home)</Card.Header>
                        <Card.Body>
                            <h5 className="card-title">Importar Faturamento (Notas Fiscais)</h5>
                            <Card.Text className="text-muted">
                                Envie a planilha de faturamento (.csv) para atualizar o banco de dados `erp_mannes`. 
                                Isso irá atualizar os KPIs e o Ranking de Vendedores na Home.
                            </Card.Text>
                            
                            <hr />

                            <Form onSubmit={handleUpload}>
                                <Form.Group controlId="csvFileInput" className="mb-3">
                                    <Form.Label>Selecione a planilha (.csv):</Form.Label>
                                    <Form.Control 
                                        type="file" 
                                        accept=".csv"
                                        onChange={handleFileChange}
                                    />
                                </Form.Group>
                                
                                <Button 
                                    variant="primary" 
                                    type="submit" 
                                    disabled={!selectedFile || isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <FaUpload className="me-2" />
                                            Importar Dados
                                        </>
                                    )}
                                </Button>
                                
                                {/* Exibe mensagens de status (sucesso ou erro) */}
                                {uploadStatus && (
                                    <Alert 
                                        variant={uploadStatus.startsWith('Erro:') ? 'danger' : 'success'} 
                                        className="mt-4"
                                    >
                                        {uploadStatus}
                                    </Alert>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Futuramente, outros cards de gerenciamento (ex: Avisos) podem vir aqui */}
                    {/* <Card className="shadow-sm border-0 mt-4">
                         <Card.Header as="h5">Gerenciar Avisos da Gerência</Card.Header>
                         <Card.Body>
                            ... (Formulário de Avisos) ...
                         </Card.Body>
                    </Card>
                    */}

                </Col>
            </Row>
        </Container>
    );
};

export default AdminDashboardPage; // Exporta o nome atualizado