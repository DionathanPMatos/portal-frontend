import React from 'react';
import { Card, Badge, Row, Col, Button, ButtonGroup } from 'react-bootstrap';

const OportunidadeCard = ({ op, onQualificar, onDescartar }) => {

    const getPriorityVariant = (prioridade) => {
        if (prioridade === 'Alta') return 'danger';
        if (prioridade === 'Media') return 'warning';
        return 'secondary';
    };

    let entidades = [];
    try {
        if (typeof op.entidades_chave === 'string') {
            entidades = JSON.parse(op.entidades_chave);
        } else if (Array.isArray(op.entidades_chave)) {
             entidades = op.entidades_chave;
        }
    } catch(e) { /* falha silenciosa */ }


    const cardStyle = op.is_viewed ? {} : { borderLeft: '5px solid #0d6efd' };
    
    return (
        <Card className="mb-3 opportunity-card" style={cardStyle}>  
            <Card.Body>
                <Row>
                    <Col md={9}>
                        <Card.Title style={{ margin: 0, fontSize: '1.1rem' }}>
                            {!op.is_viewed && <Badge pill bg="primary" className="me-2">Novo</Badge>}
                            <a href={op.url} target="_blank" rel="noopener noreferrer">{op.titulo}</a>
                        </Card.Title>
                        <Card.Subtitle className="text-muted" style={{ fontSize: '0.8rem' }}>
                            {op.fonte} - {new Date(op.data_publicacao || op.data_criacao).toLocaleDateString()}
                        </Card.Subtitle>
                    </Col>
                    <Col md={3} className="text-md-end">
                        <Badge bg={getPriorityVariant(op.prioridade)} className="me-2">
                            {op.prioridade} (Score: {op.score_oportunidade})
                        </Badge>
                        <Badge bg="info" text="dark" className="me-2">{op.tipo}</Badge>
                        <Badge bg="dark" text="dark">{op.vertical}</Badge>
                    </Col>
                </Row>

                <Card.Text style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                    {op.descricao}
                </Card.Text>

                <Card style={{ background: '#f9f9f9' }}>
                    <Card.Body className="p-2">
                        <strong style={{ color: '#0056b3', fontSize: '0.9rem' }}>Insight da IA:</strong>
                        <em style={{ display: 'block', fontSize: '0.9rem' }}>{op.insight_ia}</em>
                    </Card.Body>
                </Card>

                <div style={{  marginTop: '10px' }}>
                    {entidades.length > 0 && entidades.map((ent, idx) => (
                        <Badge pill bg="secondary" key={idx} className="me-1 fw-normal">
                            {ent}
                        </Badge>
                    ))}
                </div>


                {op.status === 'Novo' && (
                    <div className="mt-3 text-end">
                        <ButtonGroup size="sm">
                            <Button 
                                variant="outline-danger" 
                                onClick={() => onDescartar(op.id)} // Chama a função passada por props
                            >
                                Descartar
                            </Button>
                            <Button 
                                variant="outline-success" 
                                onClick={() => onQualificar(op.id)} // Chama a função passada por props
                            >
                                Qualificar
                            </Button>
                        </ButtonGroup>
                    </div>
                 )}
            </Card.Body>
        </Card>
    );
};

export default OportunidadeCard;