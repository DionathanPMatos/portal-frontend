import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import apiClient from "../../../services/api";
export default function ModalImportarEquip({ show, onHide, onSave }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleDownloadTemplate = () => {
    window.open("/api/facilities/equipamentos/template", "_blank");
  };

  const handleImport = async () => {
    if (!file) {
      setErro("Selecione um arquivo CSV ou XLSX.");
      return;
    }

    setLoading(true);
    setErro("");
    setSucesso("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiClient.post("/api/facilities/equipamentos/import", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      let msg = res.data.message;
      if (res.data.errors && res.data.errors.length > 0) {
        msg += ` Houve ${res.data.errors.length} erro(s).`;
      }
      setSucesso(msg);
      setTimeout(() => {
        onSave();
      }, 3000);
    } catch (error) {
      setErro(error.response?.data?.error || "Erro ao importar arquivo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Importar Equipamentos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {erro && <Alert variant="danger">{erro}</Alert>}
        {sucesso && <Alert variant="success">{sucesso}</Alert>}

        <p>Para importar os equipamentos em lote, baixe a planilha modelo, preencha as colunas (respeitando o nome correto das filiais para vinculação) e faça o upload do arquivo salvo.</p>

        <div className="mb-4">
          <Button variant="outline-primary" onClick={handleDownloadTemplate}>
            <i className="bi bi-download me-2"></i>Baixar Planilha Modelo
          </Button>
        </div>

        <Form.Group>
          <Form.Label className="fw-bold">Upload da Planilha Preenchida</Form.Label>
          <Form.Control 
            type="file" 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={(e) => setFile(e.target.files[0])} 
          />
          <Form.Text className="text-muted">
            Formatos aceitos: .csv, .xlsx
          </Form.Text>
        </Form.Group>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="success" onClick={handleImport} disabled={loading || !file}>
          {loading ? <Spinner animation="border" size="sm" /> : <><i className="bi bi-upload me-2"></i>Importar</>}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}