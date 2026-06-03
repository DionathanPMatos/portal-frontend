import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Spinner, Alert, Button, Table, Breadcrumb } from 'react-bootstrap';
import apiClient from '../../../../services/api';

const ProjetosPerdidos = () => {
    const [projetos, setProjetos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');

    const fetchProjetosPerdidos = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/projetos/perdidos');
            setProjetos(response.data);
        } catch (err) {
            setError('Erro ao buscar projetos perdidos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjetosPerdidos();
    }, []);

    const handleRestore = async (id) => {
        if (window.confirm('Tem certeza que deseja restaurar este projeto?')) {
            try {
                await apiClient.patch(`/api/projetos/${id}/restaurar`);
                setSuccess('Projeto restaurado com sucesso!');
                fetchProjetosPerdidos();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                alert('Erro ao restaurar o projeto.');
            }
        }
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <div className="dash-grid">
            <div className='container-main'>
                <Container className="mt-4">
                    <Breadcrumb>
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/crm/projetos" }}>Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Projetos Perdidos</Breadcrumb.Item>
                    </Breadcrumb>
                    <h2 className="mb-4">Projetos Perdidos</h2>
                    {success && <Alert variant="success">{success}</Alert>}
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Cliente</th>
                                <th>Motivo da Perda</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projetos.length > 0 ? (
                                projetos.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.nome_projeto}</td>
                                        <td>{p.nome_cliente}</td>
                                        <td>{p.motivo_perda}</td>
                                        <td><Button variant="success" size="sm" onClick={() => handleRestore(p.id)}>Restaurar</Button></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">Nenhum projeto perdido encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Container>
            </div>
        </div>
    );
};

export default ProjetosPerdidos;