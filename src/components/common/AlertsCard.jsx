import React from 'react';
import '../../styles/AlertsCard.css';
import { FaExclamation } from "react-icons/fa";

const AlertsCard = ({ alerts }) => {
  return (



    <div className="card">
  <h5 className="card-header">Alertas</h5>
  <div className="card-body">
    <ul className="alerts-list">
        {alerts.map((alert) => (
          <li key={alert.id} className="alert-item">
            <FaExclamation className="alert-icon" />
            <span className="alert-text">{alert.text}</span>
            <span className="alert-divider">|</span>
            <span className='alert-time'>{new Date(alert.timestamp).toLocaleTimeString()}</span>
            <span className="alert-date">
              {new Date(alert.timestamp).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
  </div>
</div>


    
  );
};

export default AlertsCard;