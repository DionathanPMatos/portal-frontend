// Novo arquivo: src/components/ImportModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const ImportModal = ({ show, onHide, onComplete }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setMessage(null);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            setMessage({ type: 'danger', text: 'Por favor, selecione um arquivo CSV.' });
            return;
        }

        setImporting(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('/api/funcionarios/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage({ type: 'success', text: response.data.message });
            onComplete(); // Avisa o componente pai para recarregar a lista
        } catch (err) {
            const errorText = err.response?.data?.error || 'Ocorreu um erro desconhecido.';
            setMessage({ type: 'danger', text: errorText });
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setMessage(null);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Importar Funcionários via CSV</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message && <Alert variant={message.type}>{message.text}</Alert>}
                
                <p>
                    Selecione um arquivo CSV para cadastrar múltiplos funcionários de uma só vez.
                    As colunas devem seguir o modelo padrão.
                </p>
                <p>
                    <a href="/template.csv" download>Clique aqui para baixar o modelo da planilha (template.csv)</a>
                </p>

                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Arquivo CSV</Form.Label>
                    <Form.Control type="file" accept=".csv" onChange={handleFileChange} />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                <Button variant="primary" onClick={handleImport} disabled={importing}>
                    {importing ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Importando...</> : 'Importar'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ImportModal;