import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

// PROPS:
// - show, onHide, onSuccess
// - funcionarioId (se chamado da página de detalhes do colaborador)
// - isRh (boolean — define se pode escolher o colaborador)

// FLUXO DO MODAL (3 passos):
// PASSO 1: Selecionar colaborador (apenas se isRh=true) e período aquisitivo
//   - Busca: GET /api/funcionarios (para o select de colaborador)
//   - Ao selecionar colaborador: GET /api/ferias/funcionarios/:id/periodos-aquisitivos
//   - Exibe os PAs disponíveis com saldo restante e data de vencimento
//   - Destaca PAs vencendo ou vencidos com badge de alerta

// PASSO 2: Definir o período de gozo
//   - Campos: data_inicio (DatePicker), data_fim (DatePicker)
//   - Cálculo automático de dias solicitados (exibido em tempo real)
//   - Exibe validações em tempo real:
//     ✓ Saldo suficiente?
//     ✓ Mínimo de 5 dias?
//     ✓ Maior fração tem 14 dias?
//     ✓ Não excede 3 frações?

// PASSO 3: Opções e confirmação
//   - Switch: "Solicitar Abono Pecuniário" (vender dias)
//     → Se ativo: campo numérico para quantos dias (máx 10)
//   - Switch: "Solicitar Adiantamento do 13º Salário"
//   - Textarea: Observações
//   - Resumo visual do que será solicitado:
//     • Período de gozo: dd/mm/aaaa a dd/mm/aaaa (X dias)
//     • Abono: X dias (se solicitado)
//     • Total descontado do saldo: X dias
//     • Saldo após aprovação: X dias

// SUBMIT: POST /api/ferias/solicitacoes

const SolicitarFeriasModal = ({ show, onHide }) => (
    <Modal show={show} onHide={onHide}><Modal.Header closeButton><Modal.Title>Solicitar Férias</Modal.Title></Modal.Header><Modal.Body><Alert variant="info">Componente em desenvolvimento.</Alert></Modal.Body><Modal.Footer><Button variant="secondary" onClick={onHide}>Fechar</Button></Modal.Footer></Modal>
);

export default SolicitarFeriasModal;