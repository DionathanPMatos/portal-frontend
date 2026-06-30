import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Table, Badge, Tabs, Tab, Button, Form, Card, Spinner } from "react-bootstrap";
import { format } from "date-fns";
import { FaStar, FaRegStar, FaTrash, FaUpload, FaTruck, FaInfoCircle, FaSlidersH, FaWallet, FaShieldAlt } from "react-icons/fa";
import apiClient from "../../../services/api";

export default function ModalDetalhesVeiculo({
  show,
  onHide,
  veiculo,
  historico = {},
  loadingHistorico,
  onRefresh
}) {
  if (!veiculo) return null;

  const [localVeiculo, setLocalVeiculo] = useState(veiculo);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    setLocalVeiculo(veiculo);
    setSelectedFiles([]);
  }, [veiculo, show]);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch {
      return dateStr.split("T")[0].split("-").reverse().join("/");
    }
  };

  const formatDateWithTime = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm");
    } catch {
      return dateStr;
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadPhotos = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of selectedFiles) {
        formData.append("fotos_files", file);
      }
      const res = await apiClient.post(`/api/frota/veiculos/${localVeiculo.id}/fotos`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setLocalVeiculo(prev => ({
        ...prev,
        fotos_galeria_decoded: res.data.fotos_galeria,
        imagem_principal_url: res.data.imagem_principal_url
      }));
      setSelectedFiles([]);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar fotos.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (key) => {
    if (!window.confirm("Deseja realmente excluir esta foto?")) return;
    try {
      const res = await apiClient.delete(`/api/frota/veiculos/${localVeiculo.id}/fotos`, { data: { key } });
      setLocalVeiculo(prev => ({
        ...prev,
        fotos_galeria_decoded: res.data.fotos_galeria,
        imagem_principal_url: res.data.imagem_principal_url
      }));
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir foto.");
    }
  };

  const handleSetPrincipal = async (key) => {
    try {
      const res = await apiClient.put(`/api/frota/veiculos/${localVeiculo.id}/fotos/principal`, { key });
      setLocalVeiculo(prev => ({
        ...prev,
        imagem_principal_url: res.data.imagem_principal_url
      }));
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      alert("Erro ao definir imagem principal.");
    }
  };

  // Consolida todos os históricos em uma única linha do tempo ordenada
  const alteracoesList = (historico.alteracoes || []).map(item => ({ ...item, icon: "bi-pencil-square", color: "secondary", label: "Alteração de Dados" }));
  const reservasList = (historico.reservas || []).map(item => ({ ...item, icon: "bi-calendar-check", color: "primary", label: "Utilização (Reserva)" }));
  const lavagensList = (historico.lavagens || []).map(item => ({ ...item, icon: "bi-droplet", color: "info", label: "Lavagem" }));
  const custosList = (historico.custos || []).map(item => {
    const isManutencao = item.acao === "Manutenção" || item.acao === "Oficina" || item.acao === "Revisão";
    return {
      ...item,
      icon: isManutencao ? "bi-tools" : "bi-fuel-pump",
      color: isManutencao ? "warning" : "orange",
      label: isManutencao ? "Manutenção" : "Abastecimento"
    };
  });
  const sinistrosList = (historico.sinistros || []).map(item => ({ ...item, icon: "bi-exclamation-triangle", color: "danger", label: "Sinistro / Avaria" }));

  const timeline = [
    ...alteracoesList,
    ...reservasList,
    ...lavagensList,
    ...custosList,
    ...sinistrosList
  ].sort((a, b) => new Date(b.data) - new Date(a.data));

  const photosList = localVeiculo.fotos_galeria_decoded || [];

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="d-flex align-items-center">
          <FaTruck className="text-primary me-2" style={{ fontSize: "1.5rem" }} />
          <div>
            <span className="fw-bold">{localVeiculo.marca} {localVeiculo.modelo}</span>
            {localVeiculo.numeracao && <Badge bg="dark" className="ms-2">#{localVeiculo.numeracao}</Badge>}
            <small className="text-muted d-block" style={{ fontSize: "0.85rem" }}>Placa: <strong className="text-dark">{localVeiculo.placa}</strong> | Categoria: {localVeiculo.categoria}</small>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
        <Tabs defaultActiveKey="resumo" className="mb-4 bg-light p-1 rounded-3">
          
          {/* ABA 1: RESUMO DO VEÍCULO */}
          <Tab eventKey="resumo" title="Ficha Técnica">
            <Row className="g-3">
              <Col md={4}>
                <div className="border p-3 rounded h-100 bg-light">
                  <h6 className="text-primary fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2"><FaInfoCircle /> Informações Básicas</h6>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2"><strong>Placa:</strong> {localVeiculo.placa}</li>
                    <li className="mb-2"><strong>Numeração Frota:</strong> {localVeiculo.numeracao || "-"}</li>
                    <li className="mb-2"><strong>Marca:</strong> {localVeiculo.marca}</li>
                    <li className="mb-2"><strong>Modelo:</strong> {localVeiculo.modelo}</li>
                    <li className="mb-2"><strong>Motorização:</strong> {localVeiculo.motorizacao || "-"}</li>
                    <li className="mb-2"><strong>Combustível:</strong> {localVeiculo.tipo_combustivel}</li>
                    <li className="mb-2"><strong>Ano Fab/Modelo:</strong> {localVeiculo.ano_fabricacao && localVeiculo.ano_modelo ? `${localVeiculo.ano_fabricacao}/${localVeiculo.ano_modelo}` : localVeiculo.ano || "-"}</li>
                    <li className="mb-2"><strong>Cor:</strong> {localVeiculo.cor || "-"}</li>
                  </ul>
                </div>
              </Col>
              
              <Col md={4}>
                <div className="border p-3 rounded h-100 bg-light">
                  <h6 className="text-primary fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2"><FaSlidersH /> Classificações & Parâmetros</h6>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2"><strong>Classificação 1:</strong> {localVeiculo.classificacao_1 || "-"}</li>
                    <li className="mb-2"><strong>Classificação 2:</strong> {localVeiculo.classificacao_2 || "-"}</li>
                    <li className="mb-2"><strong>Implemento:</strong> {localVeiculo.implemento || "Nenhum / Não se aplica"}</li>
                    <li className="mb-2"><strong>Diagrama de Pneus:</strong> {localVeiculo.diagrama_pneus || "Não se aplica"}</li>
                    <li className="mb-2"><strong>Lotação Passageiros:</strong> {localVeiculo.lotacao_maxima || "5"}</li>
                    <li className="mb-2"><strong>Capacidade Carga:</strong> {localVeiculo.capacidade_transporte || "-"}</li>
                    <li className="mb-2"><strong>Tanque de Combustível:</strong> {localVeiculo.capacidade_tanque ? `${localVeiculo.capacidade_tanque} Litros` : "-"}</li>
                    <li className="mb-2"><strong>Quilometragem Atual:</strong> {localVeiculo.quilometragem_atual?.toLocaleString("pt-BR")} km</li>
                  </ul>
                </div>
              </Col>

              <Col md={4}>
                <div className="border p-3 rounded h-100 bg-light">
                  <h6 className="text-primary fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2"><FaWallet /> Gestão & Valores</h6>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2"><strong>Unidade / Filial:</strong> {localVeiculo.nome_unidade || "-"}</li>
                    <li className="mb-2"><strong>Centro de Custo:</strong> {localVeiculo.centro_custo || "-"}</li>
                    <li className="mb-2"><strong>Data de Aquisição:</strong> {formatDate(localVeiculo.data_aquisicao)}</li>
                    <li className="mb-2"><strong>Valor do Bem:</strong> {formatCurrency(localVeiculo.valor_bem)}</li>
                    <li className="mb-2"><strong>Valor de Locação:</strong> {formatCurrency(localVeiculo.valor_locacao)}</li>
                    <li className="mb-2">
                      <strong>Status: </strong>
                      <Badge bg={
                        localVeiculo.status === "Disponível" ? "success" :
                        localVeiculo.status === "Em Uso" ? "primary" :
                        localVeiculo.status === "Manutenção" ? "warning" : "danger"
                      }>
                        {localVeiculo.status}
                      </Badge>
                    </li>
                  </ul>
                </div>
              </Col>

              <Col md={12}>
                <div className="border p-3 rounded bg-light mt-2">
                  <h6 className="text-primary fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2"><FaShieldAlt /> Documentos e Vencimentos</h6>
                  <Row>
                    <Col md={3}><strong>Renavam:</strong> {localVeiculo.renavam || "-"}</Col>
                    <Col md={3}><strong>Chassi:</strong> {localVeiculo.chassi || "-"}</Col>
                    <Col md={6}><strong>Seguro (Apólice):</strong> {localVeiculo.apolice_seguro || "-"}</Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={3}><strong>Venc. Seguro:</strong> {formatDate(localVeiculo.data_vencimento_seguro)}</Col>
                    <Col md={3}><strong>Venc. IPVA:</strong> {formatDate(localVeiculo.data_vencimento_ipva)}</Col>
                    <Col md={3}><strong>Venc. Licenciamento:</strong> {formatDate(localVeiculo.data_vencimento_licenciamento)}</Col>
                    <Col md={3}><strong>Próxima Vistoria:</strong> {formatDate(localVeiculo.data_vencimento_vistoria)}</Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Tab>

          {/* NOVA ABA: INVENTÁRIO / FOTOS */}
          <Tab eventKey="fotos" title="Inventário / Fotos">
            <Card className="border-0 shadow-none">
              <Card.Body className="p-0">
                <Form.Group className="mb-4 p-3 border rounded bg-light">
                  <Form.Label className="fw-semibold">Adicionar Fotos ao Veículo</Form.Label>
                  <div className="d-flex gap-3 align-items-center">
                    <Form.Control 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileChange}
                      disabled={uploading} 
                    />
                    <Button 
                      variant="primary" 
                      onClick={handleUploadPhotos} 
                      disabled={uploading || selectedFiles.length === 0}
                      className="d-flex align-items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Spinner size="sm" animation="border" /> Carregando...
                        </>
                      ) : (
                        <>
                          <FaUpload /> Fazer Upload ({selectedFiles.length})
                        </>
                      )}
                    </Button>
                  </div>
                  <Form.Text className="text-muted">Você pode carregar várias fotos de uma vez. Formatos suportados: JPG, PNG, WEBP.</Form.Text>
                </Form.Group>

                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Galeria de Imagens ({photosList.length})</h6>
                
                {photosList.length === 0 ? (
                  <p className="text-muted text-center py-4">Nenhuma imagem cadastrada para este veículo.</p>
                ) : (
                  <Row className="row-cols-2 row-cols-md-4 g-3">
                    {photosList.map((photo) => {
                      const isMain = localVeiculo.imagem_principal_url_raw === photo.key || localVeiculo.imagem_principal_url === photo.key;
                      return (
                        <Col key={photo.key}>
                          <Card className={`h-100 border ${isMain ? "border-primary border-2" : "border-light shadow-sm"}`}>
                            <div className="position-relative">
                              <Card.Img 
                                variant="top" 
                                src={photo.url} 
                                style={{ height: "160px", objectFit: "cover" }} 
                              />
                              {isMain && (
                                <Badge bg="primary" className="position-absolute top-2 start-2 d-flex align-items-center gap-1">
                                  <FaStar /> Destaque
                                </Badge>
                              )}
                            </div>
                            <Card.Body className="p-2 d-flex justify-content-between align-items-center bg-light">
                              <Button 
                                size="sm" 
                                variant={isMain ? "warning" : "outline-secondary"} 
                                onClick={() => handleSetPrincipal(photo.key)}
                                title={isMain ? "Imagem principal atual" : "Definir como principal"}
                              >
                                {isMain ? <FaStar className="text-white" /> : <FaRegStar />}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="danger" 
                                onClick={() => handleDeletePhoto(photo.key)}
                                title="Excluir foto"
                              >
                                <FaTrash />
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Tab>

          {/* ABA: LINHA DO TEMPO */}
          <Tab eventKey="timeline" title="Linha do Tempo">
            {loadingHistorico ? (
              <div className="text-center py-4"><i className="bi bi-arrow-repeat spin me-2"></i>Carregando histórico...</div>
            ) : timeline.length === 0 ? (
              <div className="text-center text-muted py-4">Sem eventos históricos registrados para este veículo.</div>
            ) : (
              <div className="position-relative py-3" style={{ maxHeight: "450px", overflowY: "auto" }}>
                <div className="position-absolute h-100 bg-light-dark" style={{ width: "2px", left: "20px", top: "0" }}></div>
                {timeline.map((item, idx) => (
                  <div key={idx} className="d-flex mb-4 position-relative align-items-start" style={{ paddingLeft: "45px" }}>
                    <div 
                      className={`position-absolute rounded-circle bg-${item.color === 'orange' ? 'warning' : item.color} text-white d-flex align-items-center justify-content-center`}
                      style={{ 
                        width: "30px", 
                        height: "30px", 
                        left: "6px", 
                        top: "0", 
                        zIndex: 1,
                        fontSize: "0.85rem"
                      }}
                    >
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <div>
                      <div className="d-flex align-items-center flex-wrap gap-2">
                        <strong className="text-dark">{item.label}</strong>
                        <span className="text-muted small">• {formatDateWithTime(item.data)}</span>
                        {item.status && <Badge bg="light" text="dark" className="border">{item.status}</Badge>}
                      </div>
                      <p className="mb-0 mt-1 text-secondary small">{item.detalhes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tab>

          {/* ABA: UTILIZAÇÕES */}
          <Tab eventKey="utilizacoes" title="Utilizações">
            {loadingHistorico ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (historico.reservas || []).length === 0 ? (
              <div className="text-center text-muted py-4">Nenhuma reserva ou utilização encontrada.</div>
            ) : (
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Detalhes (Origem/Destino)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(historico.reservas || []).map(r => (
                    <tr key={r.id}>
                      <td>{formatDateWithTime(r.data)}</td>
                      <td>{r.detalhes}</td>
                      <td><Badge bg={r.status === 'Concluída' ? 'success' : 'primary'}>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>

          {/* ABA: MANUTENÇÕES */}
          <Tab eventKey="manutencoes" title="Manutenções">
            {loadingHistorico ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (historico.custos || []).filter(c => c.acao === "Manutenção" || c.acao === "Oficina" || c.acao === "Revisão").length === 0 ? (
              <div className="text-center text-muted py-4">Nenhuma ordem de manutenção registrada.</div>
            ) : (
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Serviço</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {(historico.custos || [])
                    .filter(c => c.acao === "Manutenção" || c.acao === "Oficina" || c.acao === "Revisão")
                    .map(m => (
                      <tr key={m.id}>
                        <td>{formatDate(m.data)}</td>
                        <td><Badge bg="warning" text="dark">{m.acao}</Badge></td>
                        <td>{m.detalhes}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            )}
          </Tab>

          {/* ABA: ABASTECIMENTOS */}
          <Tab eventKey="combustivel" title="Abastecimentos">
            {loadingHistorico ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (historico.custos || []).filter(c => c.acao === "Abastecimento").length === 0 ? (
              <div className="text-center text-muted py-4">Nenhum registro de abastecimento.</div>
            ) : (
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {(historico.custos || [])
                    .filter(c => c.acao === "Abastecimento")
                    .map(comb => (
                      <tr key={comb.id}>
                        <td>{formatDate(comb.data)}</td>
                        <td>{comb.detalhes}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            )}
          </Tab>

          {/* ABA: LAVAGENS */}
          <Tab eventKey="lavagens" title="Lavagens">
            {loadingHistorico ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (historico.lavagens || []).length === 0 ? (
              <div className="text-center text-muted py-4">Nenhuma lavagem registrada.</div>
            ) : (
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {(historico.lavagens || []).map(l => (
                    <tr key={l.id}>
                      <td>{formatDate(l.data)}</td>
                      <td>{l.detalhes}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>

          {/* ABA: HISTÓRICO CADASTRAL */}
          <Tab eventKey="alteracoes" title="Histórico Cadastral">
            {loadingHistorico ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (historico.alteracoes || []).length === 0 ? (
              <div className="text-center text-muted py-4">Nenhuma alteração cadastral registrada.</div>
            ) : (
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Ação</th>
                    <th>Modificações</th>
                  </tr>
                </thead>
                <tbody>
                  {(historico.alteracoes || []).map(alt => (
                    <tr key={alt.id}>
                      <td>{formatDateWithTime(alt.data)}</td>
                      <td><Badge bg="secondary">{alt.acao}</Badge></td>
                      <td>{alt.detalhes}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>

        </Tabs>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>Fechar Detalhes</Button>
      </Modal.Footer>
    </Modal>
  );
}
