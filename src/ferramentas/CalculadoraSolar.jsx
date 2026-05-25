import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import './CalculadoraSolar.css'; // Vamos criar este arquivo a seguir

const CalculadoraSolar = () => {
    const [inputs, setInputs] = useState({
        potenciaCamera: '',
        potenciaAdicionais: 0,
        potenciaPainel: '',
        hsp: '',
        tipoBateria: 'litio',
        tensaoBateria: 12,
        capacidadeBateria: '',
    });

    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { id, value } = e.target;
        setInputs(prev => ({ ...prev, [id]: value }));
    };

    const handleCalcular = () => {
        const { potenciaCamera, potenciaAdicionais, potenciaPainel, hsp, tipoBateria, tensaoBateria, capacidadeBateria } = inputs;

        // Validação
        if (!potenciaCamera || !potenciaPainel || !hsp || !capacidadeBateria) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            setResultado(null);
            return;
        }
        setError('');

        // Converte para números
        const numPotenciaCamera = parseFloat(potenciaCamera);
        const numPotenciaAdicionais = parseFloat(potenciaAdicionais) || 0;
        const numPotenciaPainel = parseFloat(potenciaPainel);
        const numHsp = parseFloat(hsp);
        const numTensaoBateria = parseFloat(tensaoBateria);
        const numCapacidadeBateria = parseFloat(capacidadeBateria);

        // --- LÓGICA DE CÁLCULO ---
        const consumoTotalW = numPotenciaCamera + numPotenciaAdicionais;
        const consumoDiarioWh = consumoTotalW * 24;
        const geracaoDiariaWh = numPotenciaPainel * numHsp * 0.8; // 80% de eficiência
        const dod = tipoBateria === 'litio' ? 0.9 : 0.5;
        const capacidadeUtilWh = numTensaoBateria * numCapacidadeBateria * dod;
        const autonomiaHoras = capacidadeUtilWh / consumoTotalW;
        const autonomiaDias = Math.floor(autonomiaHoras / 24);
        const balancoEnergetico = geracaoDiariaWh - consumoDiarioWh;

        setResultado({
            autonomiaHoras: autonomiaHoras.toFixed(1),
            autonomiaDias,
            consumoDiarioWh: consumoDiarioWh.toFixed(0),
            geracaoDiariaWh: geracaoDiariaWh.toFixed(0),
            balancoEnergetico: balancoEnergetico.toFixed(0),
            isSustentavel: balancoEnergetico > 0,
        });
    };

    return (
        <Container fluid className="calculadora-container">
            <h2 className="text-center mb-4">Calculadora de Autonomia Solar para CFTV</h2>
            <Row>
                {/* Coluna de Entradas */}
                <Col md={6}>
                    <Card className="input-card">
                        <Card.Header as="h5">Dados de Entrada</Card.Header>
                        <Card.Body>
                            <Form>
                                <fieldset className="mb-4">
                                    <legend className="form-legend">🔋 Consumo do Sistema</legend>
                                    <Form.Group className="mb-3" controlId="potenciaCamera">
                                        <Form.Label>Potência da Câmera (W)</Form.Label>
                                        <Form.Control type="number" value={inputs.potenciaCamera} onChange={handleChange} placeholder="Ex: 18" />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="potenciaAdicionais">
                                        <Form.Label>Equipamentos Adicionais (W)</Form.Label>
                                        <Form.Control type="number" value={inputs.potenciaAdicionais} onChange={handleChange} />
                                    </Form.Group>
                                </fieldset>

                                <fieldset className="mb-4">
                                    <legend className="form-legend">☀️ Geração de Energia</legend>
                                    <Form.Group className="mb-3" controlId="potenciaPainel">
                                        <Form.Label>Potência do Painel Solar (Wp)</Form.Label>
                                        <Form.Control type="number" value={inputs.potenciaPainel} onChange={handleChange} placeholder="Ex: 80" />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="hsp">
                                        <Form.Label>Horas de Sol Pico (HSP)</Form.Label>
                                        <Form.Control type="number" value={inputs.hsp} onChange={handleChange} placeholder="Ex: 4.5" />
                                    </Form.Group>
                                </fieldset>

                                <fieldset>
                                    <legend className="form-legend">📦 Armazenamento</legend>
                                    <Form.Group className="mb-3" controlId="tipoBateria">
                                        <Form.Label>Tipo de Bateria</Form.Label>
                                        <Form.Select value={inputs.tipoBateria} onChange={handleChange}>
                                            <option value="litio">Lítio (LiFePO4)</option>
                                            <option value="chumbo">Chumbo-Ácido</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="capacidadeBateria">
                                        <Form.Label>Capacidade da Bateria (Ah)</Form.Label>
                                        <Form.Control type="number" value={inputs.capacidadeBateria} onChange={handleChange} placeholder="Ex: 40" />
                                    </Form.Group>
                                </fieldset>

                                <Button variant="primary" className="w-100 mt-3" onClick={handleCalcular}>
                                    Calcular
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Coluna de Resultados */}
                <Col md={6}>
                     {error && <Alert variant="danger">{error}</Alert>}
                     {resultado && (
                        <Card className="resultado-card">
                            <Card.Header as="h5">Relatório de Autonomia</Card.Header>
                            <Card.Body>
                                <div className="resultado-item">
                                    <span className="label">Autonomia (sem sol)</span>
                                    <span className="valor-principal">{resultado.autonomiaHoras} horas</span>
                                    <span className="sub-valor">Aproximadamente {resultado.autonomiaDias} dia(s) completos</span>
                                </div>
                                <hr />
                                <div className="resultado-item">
                                    <span className="label">Balanço Energético Diário</span>
                                    <div className="balanco-detalhes">
                                        <span>Geração: {resultado.geracaoDiariaWh} Wh</span>
                                        <span>Consumo: {resultado.consumoDiarioWh} Wh</span>
                                    </div>
                                    <span className={`valor-balanco ${resultado.isSustentavel ? 'positivo' : 'negativo'}`}>
                                        {resultado.isSustentavel ? 'Superávit' : 'Déficit'} de {Math.abs(resultado.balancoEnergetico)} Wh
                                    </span>
                                </div>
                                <hr />
                                <Alert variant={resultado.isSustentavel ? 'success' : 'warning'} className="mt-3">
                                    <Alert.Heading>{resultado.isSustentavel ? 'Sistema Sustentável' : 'Atenção: Sistema em Déficit'}</Alert.Heading>
                                    <p>
                                        {resultado.isSustentavel
                                            ? 'O painel solar gera energia suficiente para alimentar o sistema e recarregar a bateria.'
                                            : 'O painel solar não é potente o suficiente para suprir o consumo diário. Considere um painel maior ou reduzir o consumo.'
                                        }
                                    </p>
                                </Alert>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default CalculadoraSolar;