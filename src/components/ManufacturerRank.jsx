import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { FaIndustry } from 'react-icons/fa'; // Ícone de indústria/fabricante

// Formata o valor para Reais (R$)
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const ManufacturerRank = ({ manufacturers }) => {
    if (!manufacturers || manufacturers.length === 0) {
        return <p className="text-center text-muted">Nenhum dado de fabricante disponível.</p>;
    }

    return (
        <ListGroup variant="flush">
            {manufacturers.map((manufacturer, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <span className="fw-bold me-2">{index + 1}.</span>
                        <FaIndustry className="me-2 text-primary" />
                        <span>{manufacturer.name}</span>
                    </div>
                    <span className="text-success fw-bold">{formatCurrency(manufacturer.value)}</span>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default ManufacturerRank;