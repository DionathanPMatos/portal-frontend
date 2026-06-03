import React from 'react';
import '../../styles/Dashboard.css';
 
const KpiCard = ({ title, value, children }) => {
  return (
    <div className="kpi-card">
      {children}
      <div>{title}</div>
      <div className="kpi-text">{value}</div>
    </div>
  );
};

export default KpiCard;