import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Table, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import apiClient from '../../../services/api';

export default function NewsConfirmationReportPage() {
    const { newsId } = useParams();
    const [reportData, setReportData] = useState([]);
    const [newsTitle, setNewsTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                // Fetch report and news details in parallel
                const [reportRes, newsRes] = await Promise.all([
                    apiClient.get(`/api/noticias/${newsId}/report`),
                    apiClient.get(`/api/noticias`) // Fetching all to find the one, not ideal but works
                ]);

                const currentNews = newsRes.data.find(n => String(n.id) === String(newsId));
                if (currentNews) {
                    setNewsTitle(currentNews.titulo);
                }

                setReportData(reportRes.data);
            } catch (err) {
                console.error("Erro ao buscar relatório:", err);
                setError("Não foi possível carregar o relatório de confirmação.");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [newsId]);

    return (
        <div className="dash-grid">
            <div className="container-main p-4">
                <Button as={Link} to="/admin/noticias" variant="light" className="mb-4">
                    <FaArrowLeft className="me-2" /> Voltar para o Gerenciador
                </Button>
                <h2 className="fw-bold text-dark">Relatório de Confirmação de Leitura</h2>
                <p className="text-muted">Notícia: "{newsTitle || `ID ${newsId}`}"</p>

                <Card className="shadow-sm border-0 mt-4">
                    <Table responsive hover className="align-middle mb-0">
                        <thead className="table-light text-uppercase small text-muted">
                            <tr>
                                <th>Colaborador</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Data da Confirmação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center p-5"><Spinner animation="border" /></td></tr>
                            ) : error ? (
                                <tr><td colSpan="4"><Alert variant="danger">{error}</Alert></td></tr>
                            ) : reportData.map(user => (
                                <tr key={user.id}>
                                    <td className="fw-bold">{user.nome_completo}</td>
                                    <td>{user.email}</td>
                                    <td><Badge bg={user.confirmado ? 'success' : 'danger'} pill><div className="d-flex align-items-center gap-1">{user.confirmado ? <><FaCheckCircle/> Confirmado</> : <><FaTimesCircle/> Pendente</>}</div></Badge></td>
                                    <td>{user.data_confirmacao || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}