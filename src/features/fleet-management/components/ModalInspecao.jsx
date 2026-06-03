import React from "react";
import { Modal, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";

export default function ModalInspecao({
  show,
  onHide,
  inspecaoData,
  setInspecaoData,
  onSave
}) {
     // Função para converter o arquivo da imagem em texto (Base64) para salvar no banco
  const fileToBase64 = (file) => (
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    })
  );

  const handleFotoChange = async (angulo, file) => {
    const base64 = file ? await fileToBase64(file) : '';
    setInspecaoData({
      ...inspecaoData,
      fotos: {
        ...(inspecaoData.fotos || {}),
        [angulo]: { ...(inspecaoData.fotos?.[angulo] || { status: 'OK' }), base64 }
      }
    });
  };

  const handleStatusChange = (angulo, status) => {
    setInspecaoData({
      ...inspecaoData,
      fotos: {
        ...(inspecaoData.fotos || {}),
        [angulo]: { ...(inspecaoData.fotos?.[angulo] || { base64: '' }), status }
      }
    });
  };

  const angulos = [
    { key: 'frente', label: 'Frente' },
    { key: 'lateral_direita', label: 'Lateral Direita' },
    { key: 'lateral_esquerda', label: 'Lateral Esquerda' },
    { key: 'traseira', label: 'Traseira' },
    { key: 'interno', label: 'Interno' }
  ];

 
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Registro de Vistoria</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="mb-3">
          Por favor, confira o estado do carro e anote o odômetro exato antes de sair ou ao retornar.
        </Alert>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group><Form.Label>Tipo de Inspeção</Form.Label>
              <Form.Select value={inspecaoData.tipo} onChange={e => setInspecaoData({...inspecaoData, tipo: e.target.value})}>
                <option>Saída</option>
                <option>Retorno</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>KM Marcado no Painel</Form.Label>
              <Form.Control type="number" value={inspecaoData.quilometragem} onChange={e => setInspecaoData({...inspecaoData, quilometragem: e.target.value})} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group><Form.Label>Nível do Combustível</Form.Label>
              <Form.Select value={inspecaoData.nivel_combustivel} onChange={e => setInspecaoData({...inspecaoData, nivel_combustivel: e.target.value})}>
                <option>Cheio</option><option>3/4</option><option>1/2 (Meio)</option><option>1/4</option><option>Reserva</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group><Form.Label>Avarias Visíveis (Arranhões, luzes acesas, sujeira)</Form.Label>
              <Form.Control as="textarea" rows={3} value={inspecaoData.avarias} onChange={e => setInspecaoData({...inspecaoData, avarias: e.target.value})} placeholder="Descreva se encontrar algo..." />
            </Form.Group>
          </Col>

          <Col md={12}><h6 className="border-bottom pb-2 text-primary fw-bold mt-4">Checklist Fotográfico</h6></Col>
          {angulos.map((a) => {
            const fotoData = inspecaoData.fotos?.[a.key] || { status: 'OK', base64: '' };
            return (
              <Col md={6} key={a.key}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold">{a.label}</span>
                      <div>
                        <Form.Check inline type="radio" label="OK" name={`status-${a.key}`} checked={fotoData.status === 'OK'} onChange={() => handleStatusChange(a.key, 'OK')} />
                        <Form.Check inline type="radio" label="Avaria" name={`status-${a.key}`} checked={fotoData.status === 'Avaria'} onChange={() => handleStatusChange(a.key, 'Avaria')} className="text-danger" />
                      </div>
                    </div>
                    <Form.Control type="file" size="sm" accept="image/*" onChange={(e) => handleFotoChange(a.key, e.target.files[0])} />
                    {fotoData.base64 && (
                      <div className="mt-2 text-center border rounded p-1 bg-light">
                        <img src={fotoData.base64} alt={`Foto ${a.label}`} style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="success" onClick={onSave} disabled={!inspecaoData.quilometragem}>Salvar Vistoria</Button>
      </Modal.Footer>
    </Modal>
  );
}