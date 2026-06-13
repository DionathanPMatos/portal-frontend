import { momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br'; // Importa a localização

// Define o locale para esta instância do moment, garantindo a tradução
moment.locale('pt-br');

// Cria o localizer com o moment já configurado
export const localizer = momentLocalizer(moment);

// Centraliza as mensagens de tradução do calendário
export const calendarMessages = {
  allDay: 'Dia Inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  showMore: total => `+ Ver mais (${total})`
};