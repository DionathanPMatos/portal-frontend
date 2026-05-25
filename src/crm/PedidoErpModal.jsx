import React from 'react';
import { Modal, Button, Table, Badge } from 'react-bootstrap';

const PedidoErpModal = ({ show, onHide, pedido, onConfirmar, isLinking }) => {
    if (!pedido) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <Modal show={show} onHide={onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Detalhes do Pedido do ERP: {pedido.numero_pedido}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Dados do Pedido</h5>
                <p><strong>Cliente:</strong> {pedido.nome_cliente_erp}</p>
                <p><strong>CNPJ:</strong> {pedido.cnpj_cliente_erp}</p>
                <p><strong>Data do Pedido:</strong> {formatDate(pedido.data_pedido)}</p>
                <p><strong>Valor Total:</strong> 
                    <Badge bg="success" className="ms-2 fs-6">
                        {parseFloat(pedido.valor_total_pedido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Badge>
                </p>

                <hr />

                <h5>Itens do Pedido</h5>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Descrição</th>
                            <th>Quantidade</th>
                            <th>Valor Unitário</th>
                            <th>Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedido.itens && pedido.itens.map(item => (
                            <tr key={item.id}>
                                <td>{item.codigo_produto}</td>
                                <td>{item.descricao_produto}</td>
                                <td>{item.quantidade}</td>
                                <td>{parseFloat(item.valor_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td>{parseFloat(item.quantidade * item.valor_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Fechar
                </Button>
                {/* --- ADIÇÃO IMPORTANTE ABAIXO --- */}
                {/* Este botão só aparece se a função 'onConfirmar' for passada para o modal */}
                {onConfirmar && (
                    <Button variant="primary" onClick={onConfirmar} disabled={isLinking}>
                        {isLinking ? 'Salvando...' : 'Confirmar e Atrelar ao Projeto'}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default PedidoErpModal;