import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUpload, FaArrowLeft } from 'react-icons/fa';

const AdminDashboard = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(''); // Mensagem para o usuário
    const [isLoading, setIsLoading] = useState(false);

    // 1. Atualiza o estado quando o usuário seleciona um arquivo
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadStatus(''); // Limpa mensagens anteriores
    };

    // 2. Envia o arquivo para o backend (server.js)
    const handleUploadSubmit = async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário
        if (!selectedFile) {
            setUploadStatus('Erro: Por favor, selecione um arquivo CSV.');
            return;
        }

        setIsLoading(true);
        setUploadStatus('Importando dados, por favor aguarde...');
        const formData = new FormData();
        formData.append('file', selectedFile); // 'file' deve ser o mesmo nome do backend
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        try {
            // A rota que já criamos no server.js
            const response = await fetch(`${API_URL}/api/faturamento/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha no upload.');
            }

            setUploadStatus(data.message); // Ex: "150 registros importados com sucesso!"
            setSelectedFile(null); 
            // Limpa o input do formulário
            event.target.reset(); 

        } catch (error) {
            console.error('Erro no upload:', error);
            setUploadStatus(`Erro: ${error.message}`);
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

                            <Form onSubmit={handleUploadSubmit}>
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

export default AdminDashboard;