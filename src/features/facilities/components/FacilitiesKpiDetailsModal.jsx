import React from 'react';
import { Modal, ListGroup, Image, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const FacilitiesKpiDetailsModal = ({ show, onHide, title, items, loading }) => {
    const renderItem = (item, index) => {
        switch (title) {
            case 'Equipamentos Ativos':
                return (
                    <ListGroup.Item key={index} className="d-flex align-items-center gap-3">
                        <div>
                            <div className="fw-bold">{item.nome}</div>
                            <div className="text-muted small">{item.categoria} - {item.numero_serie}</div>
                            {item.filial && <Badge bg="light" text="dark" className="mt-1">{item.filial}</Badge>}
                        </div>
                    </ListGroup.Item>
                );
            case 'Veículos da Frota (Ativos)':
                return (
                    <ListGroup.Item key={index} className="d-flex align-items-center gap-3">
                        <div>
                            <div className="fw-bold">{item.modelo}</div>
                            <div className="text-muted small">Placa: {item.placa} - Status: {item.status}</div>
                            {item.filial && <Badge bg="light" text="dark" className="mt-1">{item.filial}</Badge>}
                        </div>
                    </ListGroup.Item>
                );
            case 'Obras e Projetos em Andamento':
                return (
                    <ListGroup.Item key={index} className="d-flex align-items-center gap-3">
                        <div>
                            <div className="fw-bold">{item.nome}</div>
                            <div className="text-muted small">Local: {item.local} - Status: {item.status}</div>
                            {item.prazo && <Badge bg="info" className="mt-1">Prazo: {new Date(item.prazo).toLocaleDateString()}</Badge>}
                        </div>
                    </ListGroup.Item>
                );
            case 'Ordens de Serviço Abertas':
                return (
                    <ListGroup.Item key={index} className="d-flex align-items-center gap-3">
                        <div>
                            <div className="fw-bold">OS #{item.id} - {item.categoria}</div>
                            <div className="text-muted small">Solicitante: {item.solicitante} - {item.descricao}</div>
                            <Badge bg="danger" className="mt-1">{item.status}</Badge>
                        </div>
                    </ListGroup.Item>
                );
            case 'Contratos Ativos':
                return (
                    <ListGroup.Item key={index} className="d-flex align-items-center gap-3">
                        <div>
                            <div className="fw-bold">{item.nome}</div>
                            <div className="text-muted small">Fornecedor: {item.fornecedor} - Vencimento: {new Date(item.vencimento).toLocaleDateString()}</div>
                            <Badge bg="success" className="mt-1">{item.status}</Badge>
                        </div>
                    </ListGroup.Item>
                );
            default:
                return <ListGroup.Item key={index}>{JSON.stringify(item)}</ListGroup.Item>;
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center p-5"><Spinner animation="border" /></div>
                ) : !items || items.length === 0 ? (
                    <Alert variant="info">Nenhum item encontrado para este critério.</Alert>
                ) : (
                    <ListGroup variant="flush">
                        {items.map(renderItem)}
                    </ListGroup>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default FacilitiesKpiDetailsModal;