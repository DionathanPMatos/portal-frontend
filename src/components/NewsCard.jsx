import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';

// Dados de exemplo, futuramente virão de uma API
const newsItems = [
    { id: 1, title: 'Nova parceria com Fabricante X', category: 'Mercado', date: '20/10' },
    { id: 2, title: 'Mannes é destaque em revista de tecnologia', category: 'Imprensa', date: '19/10' },
    { id: 3, title: 'Lançamento da nova linha de produtos', category: 'Produtos', date: '18/10' },
];

const NewsCard = () => {
    return (
        <Card className="h-100">
            <Card.Header>Últimas Notícias</Card.Header>
            <Card.Body>
                <ListGroup variant="flush">
                    {newsItems.map(item => (
                        <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">{item.title}</div>
                                <span className="text-muted small">{item.date}</span>
                            </div>
                            <Badge bg="info" pill>
                                {item.category}
                            </Badge>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card.Body>
        </Card>
    );
};

export default NewsCard;