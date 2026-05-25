import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Card } from 'react-bootstrap';
import axios from 'axios';

const Funcionarios = () => {
    // Estado para guardar os funcionários já agrupados pelo backend
    const [groupedEmployees, setGroupedEmployees] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Função para formatar os nomes, como fizemos antes
    const formatarNome = (nome) => {
        if (!nome) return '';
        return nome.toLowerCase().split(' ').map(palavra => 
            palavra.charAt(0).toUpperCase() + palavra.slice(1)
        ).join(' ');
    };

    useEffect(() => {
        const fetchGroupedEmployees = async () => {
            try {
                // Chama a nova rota que criamos no backend
                const response = await axios.get('http://localhost:3000/api/funcionarios/agrupados');
                setGroupedEmployees(response.data);
            } catch (err) {
                setError('Não foi possível carregar a lista de funcionários.');
            } finally {
                setLoading(false);
            }
        };

        fetchGroupedEmployees();
    }, []); // Executa apenas uma vez, quando o componente é montado

    if (loading) {
        return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    return (
        <div className="dash-grid">
            <div className='container-main'>
                <Container className="mt-4">
                    <h2 className="mb-4">Nossa Equipe</h2>
                    
                    {/* Percorre as chaves do objeto (os nomes dos setores) */}
                    {Object.keys(groupedEmployees).map(setor => (
                        <div key={setor} className="mb-5">
                            <h3 className="mb-3" style={{ borderBottom: '2px solid #0d6efd', paddingBottom: '5px' }}>{setor}</h3>
                            <div className="d-flex flex-wrap gap-3">
                                {/* Para cada setor, percorre o array de funcionários */}
                                {groupedEmployees[setor].map(employee => (
                                    <Card key={employee.id} style={{ width: '18rem' }}>
                                        <Card.Body>
                                            <div className="d-flex align-items-center mb-3">
                                                <img 
                                                    src={employee.userpic_base64 || 'default-avatar.png'} 
                                                    alt={formatarNome(employee.nome_completo)}
                                                    className="me-3"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%' }}
                                                />
                                                <div>
                                                    <Card.Title>{formatarNome(employee.nome_completo)}</Card.Title>
                                                    <Card.Subtitle className="mb-2 text-muted">{employee.nome_cargo || 'Cargo não definido'}</Card.Subtitle>
                                                </div>
                                            </div>
                                            <Card.Text>
                                                <strong>Email:</strong> {employee.email}<br />
                                                <strong>Contato:</strong> {employee.contato || 'Não informado'}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </Container>
            </div>
        </div>
    );
};

export default Funcionarios;