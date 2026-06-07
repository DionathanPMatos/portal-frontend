import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Modal, InputGroup, Spinner } from 'react-bootstrap';
import { FaSearch, FaCommentDots, FaCheckCircle, FaClock, FaPlus, FaReply } from 'react-icons/fa';
import apiClient from '../../../services/api';

const CATEGORIAS_MOCK = ["Segurança Eletrônica", "Pon Lan", "Networking", "Data Center", "Áudio e Vídeo IP", "Ferramentas e Testes"];

export default function PerguntasDtcPage({ user }) {
    const [perguntas, setPerguntas] = useState([]);
    const [verticaisNomes, setVerticaisNomes] = useState([]);
    const [verticaisObjs, setVerticaisObjs] = useState([]);
    const [fabricantes, setFabricantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDtc, setIsDtc] = useState(false);

    // Filtros
    const [search, setSearch] = useState('');
    const [filtroVertical, setFiltroVertical] = useState('');
    const [filtroFabricante, setFiltroFabricante] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');

    // Modais
    const [showNovaModal, setShowNovaModal] = useState(false);
    const [novaPergunta, setNovaPergunta] = useState({ pergunta: '', vertical_nome: '', fabricante_id: '' });

    const [showResponderModal, setShowResponderModal] = useState(false);
    const [perguntaAtual, setPerguntaAtual] = useState(null);
    const [respostaTexto, setRespostaTexto] = useState('');

    useEffect(() => {
        carregarFiltros();
        verificarPermissaoDtc();
    }, [user]);

    useEffect(() => {
        carregarPerguntas();
    }, [search, filtroVertical, filtroFabricante, filtroStatus]);

    const verificarPermissaoDtc = async () => {
        try {
            if (user?.privilegios?.toLowerCase().includes('admin') || user?.privilegios?.toLowerCase().includes('gestor')) {
                setIsDtc(true);
                return;
            }
            const { data } = await apiClient.get('/api/setores');
            const dtcSector = data.find(s => s.nome_setor.toLowerCase().includes('técnico') || s.nome_setor.toLowerCase().includes('dtc'));
            if (dtcSector && user?.setor_id === dtcSector.id) {
                setIsDtc(true);
            }
        } catch (error) {
            console.error("Erro ao verificar setor:", error);
        }
    };

    const carregarFiltros = async () => {
        try {
            const [resVerticais, resFabricantes, resRepositorio] = await Promise.all([
                apiClient.get('/api/verticais'),
                apiClient.get('/api/fabricantes'),
                apiClient.get('/api/repositorio')
            ]);
            
            setVerticaisObjs(resVerticais.data);
            setFabricantes(resFabricantes.data);

            const dbCategorias = resRepositorio.data.map(doc => doc.categoria);
            const verticaisDBNomes = resVerticais.data.map(v => v.nome);
            const allCategorias = Array.from(new Set([...CATEGORIAS_MOCK, ...dbCategorias, ...verticaisDBNomes])).sort();
            setVerticaisNomes(allCategorias);
        } catch (error) {
            console.error("Erro ao carregar filtros:", error);
        }
    };

    const carregarPerguntas = async () => {
        setLoading(true);
        try {
            let passedVerticalId = undefined;
            if (filtroVertical) {
                const foundObj = verticaisObjs.find(v => v.nome === filtroVertical);
                passedVerticalId = foundObj ? foundObj.id : -1;
            }

            const { data } = await apiClient.get('/api/dtc/perguntas', {
                params: {
                    search: search || undefined,
                    vertical_id: passedVerticalId,
                    fabricante_id: filtroFabricante || undefined,
                    status: filtroStatus || undefined
                }
            });
            setPerguntas(data);
        } catch (error) {
            console.error("Erro ao carregar perguntas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNovaPergunta = async (e) => {
        e.preventDefault();
        try {
            let finalVerticalId = null;
            if (novaPergunta.vertical_nome) {
                const foundObj = verticaisObjs.find(v => String(v.nome).trim().toLowerCase() === String(novaPergunta.vertical_nome).trim().toLowerCase());
                if (foundObj) {
                    finalVerticalId = foundObj.id;
                } else {
                    const newVert = await apiClient.post('/api/verticais', { nome: novaPergunta.vertical_nome });
                    finalVerticalId = newVert.data.id;
                    setVerticaisObjs(prev => [...prev, newVert.data]);
                }
            }

            await apiClient.post('/api/dtc/perguntas', {
                pergunta: novaPergunta.pergunta,
                vertical_id: finalVerticalId || null,
                fabricante_id: novaPergunta.fabricante_id ? parseInt(novaPergunta.fabricante_id) : null
            });
            setShowNovaModal(false);
            setNovaPergunta({ pergunta: '', vertical_nome: '', fabricante_id: '' });
            carregarPerguntas();
        } catch (error) {
            console.error("Erro ao enviar pergunta:", error);
            alert(error.response?.data?.error || 'Erro ao enviar pergunta. Verifique o terminal do backend para detalhes.');
        }
    };

    const handleResponder = async (e) => {
        e.preventDefault();
        try {
            await apiClient.patch(`/api/dtc/perguntas/${perguntaAtual.id}/responder`, { resposta: respostaTexto });
            setShowResponderModal(false);
            setRespostaTexto('');
            carregarPerguntas();
        } catch (error) {
            console.error("Erro ao enviar resposta:", error);
            alert('Erro ao enviar resposta.');
        }
    };

    const abrirModalResponder = (pergunta) => {
        setPerguntaAtual(pergunta);
        setRespostaTexto('');
        setShowResponderModal(true);
    };

    return (
        <Container fluid className="px-4 pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1 d-flex align-items-center gap-2 text-dark">
                        <FaCommentDots className="text-primary" /> Central de Dúvidas DTC
                    </h4>
                    <p className="text-muted mb-0">Pesquise por dúvidas anteriores ou faça uma nova pergunta técnica.</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => setShowNovaModal(true)}>
                    <FaPlus /> Nova Pergunta
                </Button>
            </div>

            {/* Filtros */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text className="bg-light"><FaSearch /></InputGroup.Text>
                                <Form.Control placeholder="Pesquisar em perguntas ou respostas..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Select value={filtroVertical} onChange={(e) => setFiltroVertical(e.target.value)}>
                                <option value="">Todas as Verticais</option>
                                {verticaisNomes.map(nome => <option key={nome} value={nome}>{nome}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Select value={filtroFabricante} onChange={(e) => setFiltroFabricante(e.target.value)}>
                                <option value="">Todos os Fabricantes</option>
                                {fabricantes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                                <option value="">Todos os Status</option>
                                <option value="Pendente">Pendentes</option>
                                <option value="Respondida">Respondidas</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Lista de Perguntas */}
            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : perguntas.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <FaCommentDots size={40} className="mb-3 opacity-50" />
                    <h5>Nenhuma dúvida encontrada</h5>
                    <p>Tente ajustar os filtros ou seja o primeiro a fazer uma pergunta!</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {perguntas.map(p => (
                        <Card key={p.id} className="shadow-sm border-0">
                            <Card.Body>
                                <div className="d-flex justify-content-between mb-2">
                                    <div className="d-flex gap-2 align-items-center">
                                        <strong className="text-dark">{p.autor_nome || 'Usuário Removido'}</strong>
                                        <small className="text-muted">• {new Date(p.created_at).toLocaleDateString('pt-BR')}</small>
                                    </div>
                                    <Badge bg={p.status === 'Respondida' ? 'success' : 'warning'} text={p.status === 'Respondida' ? 'light' : 'dark'} className="d-flex align-items-center gap-1">
                                        {p.status === 'Respondida' ? <FaCheckCircle /> : <FaClock />} {p.status}
                                    </Badge>
                                </div>
                                <h5 className="mb-3" style={{ lineHeight: '1.5' }}>{p.pergunta}</h5>
                                <div className="d-flex gap-2 mb-3">
                                    {p.vertical_nome && <Badge bg="light" text="dark" className="border">Vertical: {p.vertical_nome}</Badge>}
                                    {p.fabricante_nome && <Badge bg="light" text="dark" className="border">Fabricante: {p.fabricante_nome}</Badge>}
                                </div>
                                
                                {p.status === 'Respondida' ? (
                                    <div className="bg-light p-3 rounded border-start border-4 border-success mt-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <strong className="text-success d-flex align-items-center gap-2"><FaReply /> Respondido por: {p.respondido_por_nome || 'DTC'}</strong>
                                            <small className="text-muted">{new Date(p.updated_at).toLocaleDateString('pt-BR')}</small>
                                        </div>
                                        <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>{p.resposta}</p>
                                    </div>
                                ) : (
                                    isDtc && (
                                        <div className="text-end border-top pt-3 mt-3">
                                            <Button variant="outline-primary" size="sm" onClick={() => abrirModalResponder(p)}>
                                                <FaReply /> Responder Dúvida
                                            </Button>
                                        </div>
                                    )
                                )}
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal Nova Pergunta */}
            <Modal show={showNovaModal} onHide={() => setShowNovaModal(false)} centered>
                <Form onSubmit={handleNovaPergunta}>
                    <Modal.Header closeButton><Modal.Title>Enviar Nova Dúvida</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3"><Form.Label>Vertical / Segmento</Form.Label><Form.Select required value={novaPergunta.vertical_nome} onChange={(e) => setNovaPergunta({...novaPergunta, vertical_nome: e.target.value})}><option value="">Selecione...</option>{verticaisNomes.map(nome => <option key={nome} value={nome}>{nome}</option>)}</Form.Select></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Fabricante / Solução</Form.Label><Form.Select value={novaPergunta.fabricante_id} onChange={(e) => setNovaPergunta({...novaPergunta, fabricante_id: e.target.value})}><option value="">Selecione (Opcional)...</option>{fabricantes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</Form.Select></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Sua Pergunta</Form.Label><Form.Control as="textarea" rows={4} required placeholder="Descreva sua dúvida técnica de forma clara..." value={novaPergunta.pergunta} onChange={(e) => setNovaPergunta({...novaPergunta, pergunta: e.target.value})} /></Form.Group>
                    </Modal.Body>
                    <Modal.Footer><Button variant="secondary" onClick={() => setShowNovaModal(false)}>Cancelar</Button><Button variant="primary" type="submit">Enviar Pergunta</Button></Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Responder */}
            <Modal show={showResponderModal} onHide={() => setShowResponderModal(false)} size="lg" centered>
                <Form onSubmit={handleResponder}>
                    <Modal.Header closeButton><Modal.Title>Responder Pergunta Técnica</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <div className="bg-light p-3 rounded mb-3 border"><p className="mb-1 text-muted small">Pergunta de {perguntaAtual?.autor_nome}:</p><strong>{perguntaAtual?.pergunta}</strong></div>
                        <Form.Group><Form.Label>Sua Resposta</Form.Label><Form.Control as="textarea" rows={6} required placeholder="Digite a solução para a dúvida apresentada..." value={respostaTexto} onChange={(e) => setRespostaTexto(e.target.value)} /></Form.Group>
                    </Modal.Body>
                    <Modal.Footer><Button variant="secondary" onClick={() => setShowResponderModal(false)}>Cancelar</Button><Button variant="success" type="submit">Publicar Resposta</Button></Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}