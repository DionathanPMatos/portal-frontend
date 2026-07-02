import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Row, Col, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { FaMapMarkerAlt, FaFilter, FaRedo, FaUser } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import apiClient from '../../../services/api';

export default function MapaClientesPage({ user }) {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filtros do Mapa
    const privilegios = user?.privilegios?.toLowerCase() || '';
    const isManager = privilegios.includes('admin') || privilegios.includes('gestor');
    
    // Inicia com apenas os dele se for vendedor, se for gestor inicia mostrando todos
    const [filterMeusClientes, setFilterMeusClientes] = useState(!isManager);
    const [filterProjetos, setFilterProjetos] = useState('todos'); // todos, com-projetos, sem-projetos
    const [filterVisitas, setFilterVisitas] = useState('todos'); // todos, sem-visita-30, sem-visita-60, sem-visitas

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerLayerRef = useRef(null);

    useEffect(() => {
        carregarDadosMapa();
    }, []);

    const carregarDadosMapa = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await apiClient.get('/api/visitas/mapa-clientes');
            setClientes(data || []);
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar dados do mapa de clientes.');
        } finally {
            setLoading(false);
        }
    };

    // Inicialização do Mapa Leaflet
    useEffect(() => {
        if (!mapRef.current) return;

        // Se já existir uma instância do mapa, remove ela primeiro para evitar conflitos de contêiner já inicializado
        if (mapInstanceRef.current) {
            try {
                mapInstanceRef.current.remove();
            } catch (e) {
                console.warn("Erro ao remover mapa anterior:", e);
            }
            mapInstanceRef.current = null;
        }

        // Se o contêiner DOM por algum motivo ainda tiver o ID do Leaflet setado (ex. hot-reload), limpa a propriedade
        if (mapRef.current._leaflet_id) {
            delete mapRef.current._leaflet_id;
        }

        // Centrado aproximadamente no centro geográfico do Brasil
        const map = L.map(mapRef.current).setView([-15.7797, -47.9297], 4);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        markerLayerRef.current = L.markerClusterGroup().addTo(map);

        return () => {
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (e) {
                    console.warn("Erro ao desmontar o mapa:", e);
                }
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Filtros aplicados em memória (envolvido em useMemo para evitar loops de renderização infinitos)
    const filteredClientes = useMemo(() => {
        return clientes.filter(c => {
            // Filtro "Meus Clientes"
            if (filterMeusClientes && String(c.vendedor_id) !== String(user?.id)) {
                return false;
            }

            // Filtro de Projetos
            if (filterProjetos === 'com-projetos' && c.projetos_ativos_count === 0) {
                return false;
            }
            if (filterProjetos === 'sem-projetos' && c.projetos_ativos_count > 0) {
                return false;
            }

            // Filtro de Visitas (Recência)
            if (filterVisitas === 'sem-visita-30') {
                if (c.dias_sem_visita === null || c.dias_sem_visita <= 30) return false;
            }
            if (filterVisitas === 'sem-visita-60') {
                if (c.dias_sem_visita === null || c.dias_sem_visita <= 60) return false;
            }
            if (filterVisitas === 'sem-visita-180') {
                if (c.dias_sem_visita === null || c.dias_sem_visita <= 180) return false;
            }
            if (filterVisitas === 'sem-visitas') {
                if (c.dias_sem_visita !== null) return false; // Nunca visitados
            }

            return true;
        });
    }, [clientes, filterMeusClientes, filterProjetos, filterVisitas, user?.id]);

    // Atualização dos Marcadores no Mapa quando a lista filtrada muda
    useEffect(() => {
        if (!mapInstanceRef.current || !markerLayerRef.current) return;

        // Limpa os antigos
        markerLayerRef.current.clearLayers();

        if (filteredClientes.length === 0) return;

        const markersArray = [];

        // Adiciona novos marcadores
        filteredClientes.forEach(c => {
            // Regra de cores
            // 1. Verde para clientes com projetos ativos
            // 2. Laranja para sem visitas > 30 dias
            // 3. Vermelho para sem visitas > 60 dias ou nunca visitado
            // 4. Azul para visitas em dia e sem projetos ativos
            let color = '#0d6efd'; // azul
            let statusLabel = 'Em dia';

            if (c.projetos_ativos_count > 0) {
                color = '#198754'; // verde
                statusLabel = 'Projeto Ativo';
            } else if (c.dias_sem_visita === null) {
                color = '#dc3545'; // vermelho (Nunca visitado)
                statusLabel = 'Sem Visitas';
            } else if (c.dias_sem_visita > 180) {
                color = '#6f42c1'; // roxo (>180 dias)
                statusLabel = 'Sem visita > 180d';
            } else if (c.dias_sem_visita > 60) {
                color = '#b02a37'; // vermelho escuro (>60 dias)
                statusLabel = 'Sem visita > 60d';
            } else if (c.dias_sem_visita > 30) {
                color = '#fd7e14'; // laranja (>30 dias)
                statusLabel = 'Sem visita > 30d';
            }

            const icon = L.divIcon({
                html: `<div style="
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    width: 32px; 
                    height: 32px; 
                    border-radius: 50% 50% 50% 0; 
                    background: ${color}; 
                    transform: rotate(-45deg); 
                    border: 2px solid white; 
                    box-shadow: 0 3px 6px rgba(0,0,0,0.35);
                ">
                    <span style="
                        transform: rotate(45deg); 
                        color: white; 
                        font-size: 11px; 
                        font-weight: bold;
                    ">🏢</span>
                </div>`,
                className: 'custom-pin-icon',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });

            const popupContent = `
                <div style="font-family: 'Inter', sans-serif; min-width: 220px; padding: 4px;">
                    <h6 style="margin: 0 0 6px 0; font-weight: 700; color: #1e293b; font-size: 14px;">${c.nome_cliente}</h6>
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 4px;">
                        📍 ${c.bairro ? c.bairro + ', ' : ''}${c.cidade}/${c.uf}
                    </p>
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px; font-size: 12px; display: flex; flex-direction: column; gap: 6px;">
                        <div>
                            <span style="color: #64748b;">Projetos Ativos:</span>
                            <span style="
                                float: right;
                                background: ${c.projetos_ativos_count > 0 ? '#dcfce7' : '#f1f5f9'}; 
                                color: ${c.projetos_ativos_count > 0 ? '#15803d' : '#475569'}; 
                                padding: 1px 6px; 
                                border-radius: 4px; 
                                font-weight: 700;
                            ">${c.projetos_ativos_count}</span>
                        </div>
                        <div>
                            <span style="color: #64748b;">Última Visita:</span>
                            <span style="float: right; font-weight: 600; color: #334155;">
                                ${c.data_ultima_visita ? new Date(c.data_ultima_visita).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Nenhuma'}
                            </span>
                        </div>
                        ${c.dias_sem_visita !== null ? `
                        <div>
                            <span style="color: #64748b;">Inatividade:</span>
                            <span style="float: right; font-weight: 700; color: ${c.dias_sem_visita > 30 ? '#ea580c' : '#334155'};">
                                ${c.dias_sem_visita} dias
                            </span>
                        </div>` : ''}
                        <div style="margin-top: 4px; font-size: 11px; color: #475569; background: #f8fafc; padding: 4px 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                            👤 Vendedor: <strong>${c.vendedor_nome || 'Nenhum'}</strong>
                        </div>
                    </div>
                </div>
            `;

            const marker = L.marker([c.latitude, c.longitude], { icon })
                .bindPopup(popupContent);
            markersArray.push(marker);
        });

        markerLayerRef.current.addLayers(markersArray);

        // Ajustar zoom do mapa para englobar os marcadores
        try {
            const bounds = L.featureGroup(markerLayerRef.current.getLayers()).getBounds();
            if (bounds.isValid()) {
                mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
            }
        } catch (e) {
            console.error("Erro ao ajustar zoom para os marcadores:", e);
        }

    }, [filteredClientes]);

    return (
        <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
                <Row className="mb-3 g-2 align-items-center">
                    <Col md={3}>
                        <div className="d-flex align-items-center gap-2">
                            <FaMapMarkerAlt className="text-primary" />
                            <h6 className="fw-bold text-dark mb-0">Filtros do Mapa</h6>
                        </div>
                    </Col>
                    <Col md={9} className="text-end">
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={carregarDadosMapa} 
                            disabled={loading}
                            className="d-inline-flex align-items-center gap-1"
                        >
                            <FaRedo size={12} className={loading ? 'spin-animation' : ''} /> Atualizar Mapa
                        </Button>
                    </Col>
                </Row>

                <Row className="g-3 mb-4">
                    {/* Filtro Meus Clientes (Visível apenas para Gestor/Admin) */}
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold small text-muted">Vendedor</Form.Label>
                            {isManager ? (
                                <Form.Check 
                                    type="switch"
                                    id="switch-meus-clientes"
                                    label="Apenas meus clientes"
                                    checked={filterMeusClientes}
                                    onChange={(e) => setFilterMeusClientes(e.target.checked)}
                                    className="mt-2 fw-semibold"
                                />
                            ) : (
                                <div className="mt-2 bg-light p-2 rounded border small text-secondary d-flex align-items-center gap-2">
                                    <FaUser size={12} className="text-primary" />
                                    <span>Exibindo apenas seus clientes</span>
                                </div>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Filtro Projetos Ativos */}
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="fw-semibold small text-muted">Projetos Ativos</Form.Label>
                            <Form.Select 
                                size="sm" 
                                value={filterProjetos} 
                                onChange={(e) => setFilterProjetos(e.target.value)}
                            >
                                <option value="todos">Todos os Clientes</option>
                                <option value="com-projetos">Com Projetos Ativos (Verde)</option>
                                <option value="sem-projetos">Sem Projetos Ativos</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Filtro Recência de Visitas */}
                    <Col md={5}>
                        <Form.Group>
                            <Form.Label className="fw-semibold small text-muted">Recência de Visitas</Form.Label>
                            <Form.Select 
                                size="sm" 
                                value={filterVisitas} 
                                onChange={(e) => setFilterVisitas(e.target.value)}
                            >
                                <option value="todos">Qualquer tempo de inatividade</option>
                                <option value="sem-visita-30">Sem visitas há mais de 30 dias (Laranja)</option>
                                <option value="sem-visita-60">Sem visitas há mais de 60 dias (Vermelho)</option>
                                <option value="sem-visita-180">Sem visitas há mais de 180 dias (Roxo)</option>
                                <option value="sem-visitas">Nunca Visitados (Vermelho)</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                {error && (
                    <div className="alert alert-danger py-2 px-3 small mb-3">{error}</div>
                )}

                {/* Container do Mapa */}
                <div style={{ position: 'relative' }}>
                    {loading && (
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(255,255,255,0.7)',
                            zIndex: 1000,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Spinner animation="border" variant="primary" />
                        </div>
                    )}
                    <div 
                        ref={mapRef} 
                        style={{ 
                            height: '550px', 
                            width: '100%', 
                            borderRadius: '8px', 
                            border: '1px solid #dee2e6',
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                        }} 
                    />
                </div>

                {/* Legenda do Mapa */}
                <Card className="bg-light border-0 mt-3">
                    <Card.Body className="p-2 px-3">
                        <Row className="gy-2 align-items-center text-center text-md-start">
                            <Col md={3}>
                                <span className="small text-muted fw-bold">LEGENDA DO MAPA:</span>
                            </Col>
                            <Col md={9} className="d-flex flex-wrap justify-content-center justify-content-md-start gap-4">
                                <div className="d-flex align-items-center gap-2 small">
                                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#198754' }}></span>
                                    <span>Com Projetos Ativos</span>
                                </div>
                                <div className="d-flex align-items-center gap-2 small">
                                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#0d6efd' }}></span>
                                    <span>Em dia (Visita recente)</span>
                                </div>
                                <div className="d-flex align-items-center gap-2 small">
                                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#fd7e14' }}></span>
                                    <span>Sem visitas &gt; 30 dias</span>
                                </div>
                                <div className="d-flex align-items-center gap-2 small">
                                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#6f42c1' }}></span>
                                    <span>Sem visitas &gt; 180 dias</span>
                                </div>
                                <div className="d-flex align-items-center gap-2 small">
                                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#dc3545' }}></span>
                                    <span>Sem visitas &gt; 60 dias ou Nunca visitados</span>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Card.Body>
        </Card>
    );
}
