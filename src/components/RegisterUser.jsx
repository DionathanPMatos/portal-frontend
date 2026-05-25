import React, { useState, useEffect } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import '../css/Registro.css';
import '../css/Dashboard.css';

const RegisterUser = () => {
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Função para buscar os fabricantes e seus documentos
    const fetchManufacturers = async () => {
        try {
            const response = await axios.get('/api/fabricantes');
            setManufacturers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Erro ao buscar fabricantes.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManufacturers();
    }, []);

    if (loading) {
        return (
            <div className="dash-grid">
                <div className='container-main'>
                    <Container className="mt-5 text-center">
                        <Spinner animation="border" role="status" className="me-2" />
                        <span>Carregando fabricantes...</span>
                    </Container>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dash-grid">
                <div className='container-main'>
                    <Container className="mt-5">
                        <Alert variant="danger">
                            Ocorreu um erro: {error}
                            
                        </Alert>
                        
                    </Container>
                </div>
            </div>
        );
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return (
        <div className="dash-grid">
            <div className='container-main'>
                <Container className="mt-4">
                    <h3 className="mb-4" style={{ textAlign: 'center' }}>Registro de Fabricantes</h3>
<Accordion>
    {Array.isArray(manufacturers) && manufacturers.length > 0 ? (
        manufacturers.map((manufacturer) => (
            <Accordion.Item eventKey={String(manufacturer.id)} key={manufacturer.id}>
                <Accordion.Header>
                    <div className="d-flex align-items-center">
                        <img
                            src={manufacturer.logo_base64}
                            alt={`${manufacturer.name} Logo`}
                            className="me-3"
                            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                        />
                        <h6>{manufacturer.name}</h6>
                    </div>
                </Accordion.Header>
                <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: manufacturer.info }} />
                    {manufacturer.documentos && manufacturer.documentos.length > 0 && (
                        <div className="mt-3">
                            <h6>Documentos Anexados:</h6>
                            {manufacturer.documentos.map(doc => (
                                <Button 
                                    key={doc.id}
                                    variant="outline-primary"
                                    href={`${API_URL}/${doc.caminho_arquivo}`}
                                    target="_blank"
                                    className="me-2 mt-2"
                                >
                                    Baixar: {doc.nome_original}
                                </Button>
                            ))}
                        </div>
                    )}
                </Accordion.Body>
            </Accordion.Item>
        ))
    ) : (
        <Alert variant="info">Nenhum fabricante encontrado.</Alert>
    )}
</Accordion>
                </Container>
            </div>
        </div>
    );
};

export default RegisterUser;
