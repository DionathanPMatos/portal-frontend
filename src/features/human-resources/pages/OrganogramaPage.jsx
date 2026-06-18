import React, { useState, useEffect } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { Card, Spinner, Alert, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import apiClient from '../../../services/api';

// Estilização do nó do organograma
const StyledNode = styled.div`
  padding: 10px;
  border-radius: 8px;
  display: inline-block;
  border: 1px solid #dee2e6;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  text-align: center;
  width: 200px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }
`;

const EmployeeCard = ({ employee }) => (
    <StyledNode>
        <Link to={`/rh/colaboradores/${employee.id}`} className="text-decoration-none text-dark">
            <Image
                src={employee.userpic_url || `https://ui-avatars.com/api/?name=${employee.nome_completo}&background=random`}
                roundedCircle
                style={{ width: '60px', height: '60px', objectFit: 'cover', marginBottom: '10px', border: '2px solid #eee' }}
            />
            <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{employee.nome_completo}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{employee.cargo?.nome_cargo || 'Cargo não definido'}</div>
        </Link>
    </StyledNode>
);

// Componente recursivo para renderizar a árvore
const renderTree = (nodes) => {
    if (!nodes || nodes.length === 0) {
        return null;
    }

    return nodes.map(node => (
        <TreeNode key={node.id} label={<EmployeeCard employee={node} />}>
            {renderTree(node.subordinados)}
        </TreeNode>
    ));
};

const OrganogramaPage = () => {
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrganogramaData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/api/rh/organograma');
                setTreeData(response.data);
            } catch (err) {
                console.error("Erro ao carregar o organograma:", err);
                setError("Não foi possível carregar os dados do organograma.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrganogramaData();
    }, []);

    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /> Carregando organograma...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (treeData.length === 0) {
        return <Alert variant="info">Nenhum colaborador encontrado para montar o organograma.</Alert>;
    }

    return (
        <div className="p-3" style={{ overflowX: 'auto', minWidth: '100%' }}>
            <Tree
                lineWidth={'2px'}
                lineColor={'#dee2e6'}
                lineBorderRadius={'10px'}
                label={<div className="fw-bold fs-4 text-center mb-4">Organograma da Empresa</div>}
            >
                {renderTree(treeData)}
            </Tree>
        </div>
    );
};

export default OrganogramaPage;