import React from 'react';
import { Modal, ListGroup, Image, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const KpiDetailsModal = ({ show, onHide, title, employees, loading }) => {
    return (
        <Modal show={show} onHide={onHide} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center p-5"><Spinner animation="border" /></div>
                ) : !employees || employees.length === 0 ? (
                    <Alert variant="info">Nenhum colaborador encontrado para este critério.</Alert>
                ) : (
                    <ListGroup variant="flush">
                        {employees.map(emp => (
                            <ListGroup.Item
                                key={emp.id}
                                as={Link}
                                to={`/rh/colaboradores/${emp.id}`}
                                action
                                className="d-flex align-items-center gap-3 text-decoration-none text-dark"
                                onClick={onHide}
                            >
                                <Image src={emp.userpic_url || `https://ui-avatars.com/api/?name=${emp.nome_completo}&background=random`} roundedCircle style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                                <div>
                                    <div className="fw-bold">{emp.nome_completo}</div>
                                    <div className="text-muted small">{emp.cargo?.nome_cargo || 'Cargo não definido'}</div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default KpiDetailsModal;