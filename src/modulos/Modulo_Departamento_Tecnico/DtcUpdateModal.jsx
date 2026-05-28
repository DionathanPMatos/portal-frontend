import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert, ListGroup } from 'react-bootstrap';
import axios from 'axios';

const DtcUpdateModal = ({ show, onHide, onSuccess, projeto, tecnicos }) => {
    const [status, setStatus] = useState('');
    const [responsavelId, setResponsavelId] = useState('');
    const [documentos, setDocumentos] = useState([]);
    const [fileToUpload, setFileToUpload] = useState(null);
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const fetchDocuments = async () => {
        if (!projeto) return;
        try {
            const response = await axios.get(`/api/projetos/${projeto.id}/documentos`);
            setDocumentos(response.data);
        } catch (err) {
            console.error("Erro ao buscar documentos", err);
            setError("Não foi possível carregar os documentos.");
        }
    };

    useEffect(() => {
        if (show && projeto) {
            setStatus(projeto.status_proposta_dtc || 'Pendente');
            setResponsavelId(projeto.dtc_responsavel_id || '');
            fetchDocuments();
            setError(null);
            setSuccess('');
        }
    }, [show, projeto]);

    const handleStatusSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await axios.patch(`/api/projetos/${projeto.id}/dtc-status`, {
                status_proposta_dtc: status,
                dtc_responsavel_id: responsavelId
            });
            setSuccess('Status atualizado com sucesso!');
            onSuccess(); // Recarrega o dashboard
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao atualizar o status.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async () => {
        if (!fileToUpload) return alert('Selecione um arquivo.');
        const formData = new FormData();
        formData.append('documento', fileToUpload);
        setLoading(true);
        try {
            await axios.post(`/api/projetos/${projeto.id}/upload`, formData);
            setSuccess('Arquivo enviado com sucesso! A proposta foi marcada como "Concluída".');
            setFileToUpload(null);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao enviar arquivo.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm('Tem certeza?')) return;
        try {
            await axios.delete(`/api/documentos/${docId}`);
            setSuccess('Documento excluído com sucesso!');
            fetchDocuments(); // Apenas recarrega a lista de documentos
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao excluir documento.');
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Gerenciar Proposta Técnica</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <p><strong>Projeto:</strong> {projeto?.nome_projeto}</p>
                <hr />

                {/* Seção de Status */}
                <h5>Status e Responsável</h5>
                <Form id="status-form" onSubmit={handleStatusSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Status da Proposta</Form.Label>
                        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="Pendente">Pendente</option>
                            <option value="Em Elaboração">Em Elaboração</option>
                            <option value="Concluída">Concluída</option>
                            <option value="Revisão Solicitada">Revisão Solicitada</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Responsável Técnico</Form.Label>
                        <Form.Select value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)} required>
                            <option value="">Selecione um responsável</option>
                            {tecnicos.map(tec => (
                                <option key={tec.id} value={tec.id}>{tec.nome_completo}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Form>
                <hr />

                {/* Seção de Documentos */}
                <h5>Documentos</h5>
                <ListGroup variant="flush" className="mb-3">
                    {documentos.map(doc => (
                        <ListGroup.Item key={doc.id} className="d-flex justify-content-between align-items-center">
                            <a href={`http://localhost:3000/${doc.caminho_arquivo}`} target="_blank" rel="noopener noreferrer">{doc.nome_original}</a>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteDocument(doc.id)}><i className="bi bi-trash"></i></Button>
                        </ListGroup.Item>
                    ))}
                    {documentos.length === 0 && <p className="text-muted">Nenhum documento anexado.</p>}
                </ListGroup>
                
                <Form.Group>
                    <Form.Label>Anexar Proposta (marcará como "Concluída")</Form.Label>
                    <Form.Control type="file" onChange={(e) => setFileToUpload(e.target.files[0])} />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Fechar</Button>
                <Button variant="info" onClick={handleFileUpload} disabled={!fileToUpload || loading}>Enviar Arquivo</Button>
                <Button variant="primary" type="submit" form="status-form" disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Salvar Status'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DtcUpdateModal;