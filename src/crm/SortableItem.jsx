import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value || 0);
};

// O componente volta a receber 'containerId' (o nome da etapa/coluna)
const SortableItem = ({ projeto, containerId }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
        id: projeto.id,
        // Informação crucial que foi perdida: diz ao dnd-kit que este item
        // é do tipo 'card' e pertence à coluna 'containerId'
        data: {
            type: 'card',
            parent: containerId
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'none',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div className="kanban-card">
                <div className="kanban-card-title">
                    <Link to={`/crm/projetos/${projeto.id}`}>{projeto.nome_projeto}</Link>
                </div>
                <div className="kanban-card-client">
                    {projeto.nome_cliente || 'Cliente não definido'}
                </div>
                <div className="kanban-card-value">
                    {formatCurrency(projeto.valor_estimado)}
                </div>
            </div>
        </div>
    );
};

export default SortableItem;