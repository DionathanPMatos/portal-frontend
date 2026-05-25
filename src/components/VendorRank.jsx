import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import '../css/VendorRank.css';

const VendorRank = ({ vendors }) => {
  if (!vendors || !Array.isArray(vendors) || vendors.length === 0) {
    return <div className="p-3 text-center text-muted">Nenhum vendedor encontrado.</div>;
  }

  return (
    <div className="list-group">
      {vendors.map((vendor) => (
        <li
          key={vendor.id}
          className="list-group-item d-flex justify-content-between align-items-center vendor-rank-item"
        >
          <div className="vendor-details d-flex align-items-center">

            {/* Nova lógica para a foto */}
            <div className="photo-container position-relative">
              {vendor.photo_url ? (
                <img
                  src={vendor.photo_url}
                  alt={vendor.name}
                  className="vendor-photo-image"
                />
              ) : (
                <FaUserCircle className="vendor-photo-placeholder" />
              )}
              {/* Badge de rank com posicionamento absoluto */}
              <span className="rank-badge badge bg-primary rounded-pill">{vendor.rank}</span>
            </div>

            {/* Nome do vendedor */}
            <span className="vendor-name ms-3">{vendor.name}&nbsp;</span>
          </div>

          {/* Faturamento */}
          <span className="text-muted vendor-sales">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(vendor.sales)}
          </span>
        </li>
      ))}
    </div>
  );
};

export default VendorRank;