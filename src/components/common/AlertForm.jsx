import React, { useState } from 'react';
import '../../styles/AlertForm.css'; // Caminho ajustado para a nova pasta de estilos

const AlertForm = ({ onAddAlert }) => {
  const [alertText, setAlertText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (alertText.trim()) {
      // Cria um novo objeto de alerta
      const newAlert = {
        id: Date.now(), // ID único para o alerta
        text: alertText,
        timestamp: new Date().toISOString(), // Data e hora atual
      };
      // Chama a função passada como prop para adicionar o alerta
      onAddAlert(newAlert);
      setAlertText(''); // Limpa o campo de texto
    }
  };

  return (
    <form className="alert-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Adicionar novo alerta..."
        value={alertText}
        onChange={(e) => setAlertText(e.target.value)}
        className="alert-input"
      />
      <button type="submit" className="alert-button">
        Adicionar Alerta
      </button>
    </form>
  );
};

export default AlertForm;