// Instalar dependência:
// npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction

import React from 'react';
import { Alert } from 'react-bootstrap';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';

// STATE:
// - eventos: []  ← solicitações aprovadas formatadas para o calendário
// - filtroSetor: ''
// - loading

// FETCH:
// GET /api/ferias/calendario?mesInicio=YYYY-MM&mesFim=YYYY-MM&setorId={filtroSetor}

// TRANSFORMAR DADOS para o FullCalendar:
// eventos = solicitacoes.map(s => ({
//   id: s.id,
//   title: s.funcionario.nome_completo,
//   start: s.data_inicio,
//   end: new Date(new Date(s.data_fim).getTime() + 86400000), // FullCalendar é exclusivo no end
//   backgroundColor: gerarCorPorSetor(s.funcionario.setor?.nome_setor),
//   extendedProps: { ...s }
// }))

const FeriasCalendario = () => <Alert variant="info">Componente de Calendário de Férias em desenvolvimento.</Alert>;

export default FeriasCalendario;