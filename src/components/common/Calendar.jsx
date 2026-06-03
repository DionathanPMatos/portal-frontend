import React, { useState, useEffect } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import moment from 'moment';
import apiClient from '../../services/api'; // Importa a instância configurada do Axios
import '../../styles/Calendar.css';

function Calendar({ isLoggedIn }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      const fetchCalendarEvents = async () => {
        try { // Usa apiClient
          const response = await apiClient.get('/calendar', { // Já estava usando apiClient, ótimo!
            withCredentials: true
          });

          if (response.status !== 200) {
            const textError = response.statusText || 'Erro desconhecido';
            throw new Error(`Erro do servidor: ${textError}`);
          }

          const upcomingEvents = response.data.filter(event => 
            moment(event.end.dateTime).isAfter(moment())
          );

          const sortedEvents = upcomingEvents.sort((a, b) => 
            moment(a.start.dateTime) - moment(b.start.dateTime)
          );

          setEvents(sortedEvents);
          setError(null);
        } catch (err) {
          console.error("Falha ao carregar o calendário:", err);
          setError("Erro ao carregar o calendário. Tente novamente mais tarde.");
        } finally {
          setLoading(false);
        }
      };

      fetchCalendarEvents();
    }
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="calendar-container">
        <p>Carregando eventos do calendário...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-container">
        <p className="error-message">{error}</p>
        <p>Verifique se você está logado no Microsoft Graph e tente novamente.</p>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <h3>
        <FaCalendarAlt />
        &nbsp;Próximos Eventos
      </h3>
      {events.length === 0 ? (
        <p>Nenhum evento futuro encontrado.</p>
      ) : (
        <ul className="event-list">
          {events.map((event) => (
            // AQUI ESTÁ A MUDANÇA: O card é agora um link
            <a 
              href={event.webLink} 
              target="_blank" 
              rel="noopener noreferrer"
              key={event.id} // Mover a key para o <a>
              className="event-item-link"
            >
              <li className="event-item">
                <h4 className="event-subject">{event.subject.toUpperCase()}</h4>
                <p className="event-details">
                  Início: {moment(event.start.dateTime).format('DD/MM/YYYY [às] HH:mm')}
                </p>
                <p className="event-details">
                  Fim: {moment(event.end.dateTime).format('DD/MM/YYYY [às] HH:mm')}
                </p>
                {event.location && event.location.displayName && (
                  <p className="event-location">Local: {event.location.displayName}</p>
                )}
              </li>
            </a>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Calendar;