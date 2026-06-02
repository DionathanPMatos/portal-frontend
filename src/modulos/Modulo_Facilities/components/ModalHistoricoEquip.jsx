import React from "react";
import { Modal, Table, Badge, Button, Alert } from "react-bootstrap";
import { format } from "date-fns";

export default function ModalHistoricoEquip({ show, onHide, equipamento, historico }) {
  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Prontuário e Histórico de Manutenção</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {equipamento && (
          <Alert variant="secondary" className="mb-4 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1 text-dark fw-bold">{equipamento.nome}</h5>
              <span className="text-muted">Série: {equipamento.numero_serie} | Marca: {equipamento.marca} {equipamento.modelo}</span>
            </div>
            <div className="text-end">
              <Badge bg={equipamento.status === 'Ativo' ? 'success' : 'danger'} className="mb-1 d-block">{equipamento.status}</Badge>
              <small className="text-muted">Unidade: {equipamento.filial || 'Sede'}</small>
            </div>
          </Alert>
        )}

        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Histórico de Intervenções e Serviços</h6>
        
        <Table striped bordered hover responsive size="sm">
          <thead className="table-light">
            <tr><th>Data Solicitação</th><th>Data Conclusão</th><th>Tipo</th><th>Descrição do Serviço</th><th>Prestador Executor</th><th>Custo Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {historico.map(h => (
              <tr key={h.id}>
                <td>{h.data_solicitacao ? format(new Date(h.data_solicitacao), "dd/MM/yyyy") : '-'}</td>
                <td>{h.data_conclusao ? format(new Date(h.data_conclusao), "dd/MM/yyyy") : <span className="text-muted">Pendente</span>}</td>
                <td>{h.tipo}</td>
                <td>{h.descricao}</td>
                <td>{h.prestador_aprovado || '-'}</td>
                <td className="text-danger fw-bold">{h.custo_final ? formatCurrency(h.custo_final) : '-'}</td>
                <td><Badge bg={h.status === 'Aberta' ? 'danger' : h.status === 'Em Andamento' ? 'warning' : 'success'}>{h.status}</Badge></td>
              </tr>
            ))}
            {historico.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-muted">Nenhuma manutenção registrada para este equipamento até o momento.</td></tr>}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer><Button variant="secondary" onClick={onHide}>Fechar</Button></Modal.Footer>
    </Modal>
  );
}