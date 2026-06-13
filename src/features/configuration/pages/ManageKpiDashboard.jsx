import React, { useState, useRef, useEffect } from 'react';
import { Container, Card, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaUpload, FaTrash, FaChartPie, FaBullseye, FaCalendarAlt, FaEdit, FaDownload } from 'react-icons/fa';
import apiClient from '../../../services/api';

function ManageKpiDashboard() {
    const [isUploading, setIsUploading] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [metas, setMetas] = useState({ metaAno: 0, metaMes: 0 });
    const [loadingMetas, setLoadingMetas] = useState(true);
    const fileInputRef = useRef(null);

    const fetchMetas = async () => {
        try {
            setLoadingMetas(true);
            // Usamos o endpoint existente que já traz as metas
            const { data } = await apiClient.get('/api/dashboard-metrics');
            setMetas({
                metaAno: data.cardsSuperiores.metaAno,
                metaMes: data.cardsSuperiores.metaMes
            });
        } catch (error) {
            console.error("Erro ao buscar metas:", error);
            setMessage({ type: 'danger', text: 'Não foi possível carregar as metas atuais.' });
        } finally {
            setLoadingMetas(false);
        }
    };

    useEffect(() => {
        fetchMetas();
    }, []);

    // Função para editar a meta anual
    const handleEditMetaAno = async () => {
        const valorAtual = metas.metaAno;
        const novaMetaStr = window.prompt("Digite o valor da nova meta ANUAL (apenas números. Ex: 1500000):", valorAtual);
        if (novaMetaStr === null) return;
        const novaMeta = parseFloat(novaMetaStr.replace(/\./g, '').replace(',', '.'));
        if (isNaN(novaMeta)) {
            alert('Valor inválido. Digite apenas números.');
            return;
        }
        try {
            await apiClient.post('/api/dashboard-metrics/meta-ano', { meta: novaMeta });
            setMessage({ type: 'success', text: 'Meta anual atualizada com sucesso!' });
            fetchMetas(); // Re-busca as metas para atualizar a tela
        } catch (error) { console.error("Erro ao atualizar meta anual:", error);
            setMessage({ type: 'danger', text: 'Erro ao tentar atualizar a meta anual.' });
        }
    };

    // Função para editar a meta mensal
    const handleEditMeta = async () => {
        const valorAtual = metas.metaMes;
        const novaMetaStr = window.prompt("Digite o valor da nova meta para o MÊS (apenas números. Ex: 150000):", valorAtual);
        if (novaMetaStr === null) return;
        const novaMeta = parseFloat(novaMetaStr.replace(/\./g, '').replace(',', '.'));
        if (isNaN(novaMeta)) {
            alert('Valor inválido. Digite apenas números.');
            return;
        }
        try {
            await apiClient.post('/api/dashboard-metrics/meta', { meta: novaMeta });
            setMessage({ type: 'success', text: 'Meta mensal atualizada com sucesso!' });
            fetchMetas(); // Re-busca as metas para atualizar a tela
        } catch (error) { console.error("Erro ao atualizar meta mensal:", error);
            setMessage({ type: 'danger', text: 'Erro ao tentar atualizar a meta mensal.' });
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    // Função que dispara o upload para o Node.js
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        setMessage({ type: '', text: '' });
        try {
            // A rota /api/upload-csv deve existir no seu backend (provavelmente em imports.routes.js)
            await apiClient.post('/api/upload-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ type: 'success', text: 'Arquivo importado com sucesso! Os dados do dashboard serão atualizados em breve.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000); // Limpa a mensagem após 5s
        } catch (error) {
            console.error("Erro no upload:", error);
            const errorMessage = error.response?.data?.error || 'Erro inesperado ao importar o arquivo.';
            setMessage({ type: 'danger', text: `Falha no upload: ${errorMessage}` });
        } finally {
            event.target.value = null; // Reseta o input
            setIsUploading(false);
        }
    };

    // Função para limpar todos os dados do banco
    const handleClearData = async () => {
        if (window.confirm('ATENÇÃO!\n\nTem certeza que deseja APAGAR TODOS os dados de vendas importados? Essa ação não pode ser desfeita.')) {
            setIsClearing(true);
            setMessage({ type: '', text: '' });
            try {
                await apiClient.delete('/api/dashboard-metrics/clear');
                setMessage({ type: 'success', text: 'Todos os dados de vendas foram apagados com sucesso.' });
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            } catch (error) {
                console.error("Erro ao limpar dados:", error);
                setMessage({ type: 'danger', text: 'Erro ao tentar limpar os dados.' });
            } finally {
                setIsClearing(false);
            }
        }
    };

    return (
        <div className="container-main p-4">
            {isUploading && (
                <div className="upload-overlay">
                    <Spinner animation="border" variant="light" style={{ width: '3rem', height: '3rem' }} />
                    <h3 className="mt-4 text-white">Processando arquivo...</h3>
                    <p className="text-light">Isso pode levar alguns segundos. Por favor, não feche a página.</p>
                </div>
            )}

            <div className="page-header-colored mb-4">
                <div className="page-header-title-wrapper">
                    <h2 className="page-header-title d-flex align-items-center gap-3">
                        <FaChartPie /> Gerenciar Dashboard
                    </h2>
                    <p className="page-header-subtitle">Importe planilhas de faturamento, defina metas e gerencie os dados dos KPIs.</p>
                </div>
            </div>

            {message.text && <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>{message.text}</Alert>}

            <Row className="g-4">
                <Col md={6}>
                    <Card className="shadow-sm h-100">
                        <Card.Body className="d-flex flex-column justify-content-between p-4">
                            <div>
                                <Card.Title as="h5" className="fw-bold d-flex align-items-center gap-2"><FaUpload className="text-primary" /> Importar Faturamento</Card.Title>
                                <Card.Text className="text-muted">Faça o upload do arquivo CSV com os resultados de vendas diários. O sistema irá processar e atualizar os indicadores de performance automaticamente.</Card.Text>
                            </div>
                            <div className="mt-4">
                                <input type="file" accept=".csv" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
                                <Button variant="primary" size="lg" className="w-100" disabled={isUploading} onClick={() => fileInputRef.current.click()}>
                                    {isUploading ? 'Enviando...' : 'Selecionar Arquivo CSV'}
                                </Button>
                                <div className="text-center mt-3">
                                    <a 
                                        href="/template_importacao_vendas.csv" 
                                        download="template_importacao_vendas.csv" 
                                        className="text-primary small fw-bold text-decoration-none"
                                        title="Clique para baixar o arquivo CSV modelo para importação de dados."
                                    >
                                        <FaDownload className="me-1" /> 
                                        Baixar modelo de planilha (.csv)
                                    </a>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow-sm h-100 border-danger">
                        <Card.Body className="d-flex flex-column justify-content-between p-4">
                            <div>
                                <Card.Title as="h5" className="fw-bold d-flex align-items-center gap-2"><FaTrash className="text-danger" /> Limpar Dados (Ação Destrutiva)</Card.Title>
                                <Card.Text className="text-muted">Esta ação irá apagar permanentemente <strong>todos</strong> os registros de vendas importados no banco de dados. Use com extrema cautela.</Card.Text>
                            </div>
                            <div className="mt-4">
                                <Button variant="outline-danger" size="lg" className="w-100" disabled={isClearing} onClick={handleClearData}>
                                    {isClearing ? 'Apagando...' : 'Apagar Todos os Dados'}
                                </Button>
                                <Card.Text className="text-center text-muted small mt-2">Esta ação não pode ser desfeita.</Card.Text>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <hr className="my-4" />

            <h4 className="mb-3 text-dark fw-bold">Definição de Metas</h4>

            <Row className="g-4">
                <Col md={6}>
                    <Card className="shadow-sm h-100">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <Card.Title as="h5" className="fw-bold d-flex align-items-center gap-2"><FaCalendarAlt className="text-primary" /> Meta Global Anual</Card.Title>
                                    <Card.Text className="text-muted">Define o objetivo de faturamento para o ano corrente.</Card.Text>
                                </div>
                                <Button variant="light" size="sm" onClick={handleEditMetaAno} disabled={loadingMetas}><FaEdit className="me-1" /> Editar</Button>
                            </div>
                            <div className="text-center bg-light p-3 rounded mt-3">
                                {loadingMetas ? <Spinner animation="border" size="sm" /> : <h3 className="m-0 fw-bolder text-primary">{formatCurrency(metas.metaAno)}</h3>}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow-sm h-100">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <Card.Title as="h5" className="fw-bold d-flex align-items-center gap-2"><FaBullseye className="text-primary" /> Meta Padrão Mensal</Card.Title>
                                    <Card.Text className="text-muted">Valor de referência para a meta do mês (pode ser ajustado individualmente).</Card.Text>
                                </div>
                                <Button variant="light" size="sm" onClick={handleEditMeta} disabled={loadingMetas}><FaEdit className="me-1" /> Editar</Button>
                            </div>
                            <div className="text-center bg-light p-3 rounded mt-3">
                                {loadingMetas ? <Spinner animation="border" size="sm" /> : <h3 className="m-0 fw-bolder text-primary">{formatCurrency(metas.metaMes)}</h3>}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default ManageKpiDashboard;