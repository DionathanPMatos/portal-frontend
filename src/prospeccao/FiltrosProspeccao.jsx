import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const FiltrosProspeccao = ({ filtros, onChange }) => {
    return (
        <div className="p-3" style={{ background: '#f4f4f4', borderRadius: '8px' }}>
            <Row className="g-3">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Select name="status" value={filtros.status} onChange={onChange}>
                            <option value="">Todos Status</option>
                            <option value="Novo">Novos</option>
                            <option value="Em Analise">Em Análise</option>
                            <option value="Qualificado">Qualificado</option>
                            <option value="Perdido">Perdido</option>
                            <option value="Ganho">Ganho</option>
                            <option value="Descartado">Descartados</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                     <Form.Group>
                        <Form.Label>Prioridade</Form.Label>
                        <Form.Select name="prioridade" value={filtros.prioridade} onChange={onChange}>
                            <option value="">Toda Prioridade</option>
                            <option value="Alta">Alta</option>
                            <option value="Media">Média</option>
                            <option value="Baixa">Baixa</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                     <Form.Group>
                        <Form.Label>Vertical</Form.Label>
                        <Form.Select name="vertical" value={filtros.vertical} onChange={onChange}>
                            <option value="">Toda Vertical</option>
                            <option value="Data Center">Data Center</option>
                            <option value="Construcao Civil">Construção Civil</option>
                            <option value="Industria">Indústria</option>
                            <option value="Governo">Governo</option>
                            <option value="Varejo">Varejo</option>
                            <option value="Logistica">Logística</option>
                            <option value="Outro">Outro</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                     <Form.Group>
                        <Form.Label>Tipo</Form.Label>
                        <Form.Select name="tipo" value={filtros.tipo} onChange={onChange}>
                            <option value="">Todo Tipo</option>
                            <option value="Publico">Público</option>
                            <option value="Privado">Privado</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );
};

export default FiltrosProspeccao;