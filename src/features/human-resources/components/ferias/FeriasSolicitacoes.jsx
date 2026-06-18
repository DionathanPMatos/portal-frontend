import React from 'react';
import { Alert } from 'react-bootstrap';

// Este componente lista TODAS as solicitações para o RH, com ações de aprovar/recusar.
// Implementar com:

// STATE:
// - solicitacoes: []
// - loading, error, successMessage
// - filtroStatus: '' | 'PENDENTE' | 'APROVADA' | 'RECUSADA' | 'CANCELADA'
// - filtroAno: new Date().getFullYear()
// - showAprovarModal: false
// - showRecusarModal: false
// - showSolicitarModal: false  ← Para RH criar férias em nome de colaborador
// - solicitacaoSelecionada: null

// FETCH:
// GET /api/ferias/solicitacoes?status={filtroStatus}&ano={filtroAno}

// RENDERIZAÇÃO:
// - Barra de filtros (status + ano)
// - Botão "Nova Solicitação" (RH pode criar para qualquer colaborador)
// - Tabela com colunas: Colaborador | Período | Dias | Abono | Status | Aprovador | Ações
// - Ações por status:
//   PENDENTE  → [Aprovar] [Recusar]
//   APROVADA  → [Cancelar]
//   outros    → sem ações

const FeriasSolicitacoes = () => <Alert variant="info">Componente de Solicitações de Férias em desenvolvimento.</Alert>;

export default FeriasSolicitacoes;