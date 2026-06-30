import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import apiClient from "../../../services/api";

const MARCAS_SUGERIDAS = [
  "Fiat", "Chevrolet", "Volkswagen", "Ford", "Toyota", "Hyundai", "Renault", "Honda", "Nissan", "Jeep", "Mercedes-Benz", "Volvo", "Scania", "Iveco", "MAN", "DAF", "Caoa Chery", "BYD", "Peugeot", "Citroën"
];

const MODELOS_POR_MARCA = {
  Fiat: [
    { nome: "Mobi", motor: "1.0 Fire" },
    { nome: "Argo", motor: "1.0 Firefly" },
    { nome: "Argo", motor: "1.3 Firefly" },
    { nome: "Cronos", motor: "1.3 Firefly" },
    { nome: "Pulse", motor: "1.3 Firefly" },
    { nome: "Pulse", motor: "1.0 Turbo 200" },
    { nome: "Fastback", motor: "1.0 Turbo 200" },
    { nome: "Fastback", motor: "1.3 Turbo 270" },
    { nome: "Toro", motor: "1.3 Turbo 270" },
    { nome: "Toro", motor: "2.0 Turbodiesel" },
    { nome: "Strada", motor: "1.3 Firefly" },
    { nome: "Strada", motor: "1.0 Turbo 200" },
    { nome: "Fiorino", motor: "1.4 Fire" },
    { nome: "Ducato", motor: "2.2 Turbodiesel" }
  ],
  Chevrolet: [
    { nome: "Onix", motor: "1.0 Aspirado" },
    { nome: "Onix", motor: "1.0 Turbo" },
    { nome: "Onix Plus", motor: "1.0 Turbo" },
    { nome: "Tracker", motor: "1.0 Turbo" },
    { nome: "Tracker", motor: "1.2 Turbo" },
    { nome: "Spin", motor: "1.8 Flex" },
    { nome: "Montana", motor: "1.2 Turbo" },
    { nome: "S10", motor: "2.8 Turbodiesel" },
    { nome: "Equinox", motor: "1.5 Turbo" },
    { nome: "Bolt", motor: "Elétrico" }
  ],
  Volkswagen: [
    { nome: "Gol", motor: "1.0 MPI" },
    { nome: "Polo", motor: "1.0 MPI" },
    { nome: "Polo", motor: "1.0 TSI" },
    { nome: "Polo", motor: "1.4 TSI (GTS)" },
    { nome: "Virtus", motor: "1.0 TSI" },
    { nome: "Virtus", motor: "1.4 TSI" },
    { nome: "T-Cross", motor: "1.0 TSI" },
    { nome: "T-Cross", motor: "1.4 TSI" },
    { nome: "Nivus", motor: "1.0 TSI" },
    { nome: "Taos", motor: "1.4 TSI" },
    { nome: "Amarok", motor: "3.0 V6 Turbodiesel" },
    { nome: "Saveiro", motor: "1.6 MSI" }
  ],
  Ford: [
    { nome: "Ka", motor: "1.0 TiVCT" },
    { nome: "Ka", motor: "1.5 Dragon" },
    { nome: "Ranger", motor: "2.0 Turbodiesel" },
    { nome: "Ranger", motor: "3.0 V6 Turbodiesel" },
    { nome: "Maverick", motor: "2.0 EcoBoost" },
    { nome: "Maverick", motor: "2.5 Hybrid" },
    { nome: "Transit", motor: "2.0 Turbodiesel" }
  ],
  Toyota: [
    { nome: "Yaris", motor: "1.5 Dual VVT-i" },
    { nome: "Corolla", motor: "2.0 Dynamic Force" },
    { nome: "Corolla", motor: "1.8 Hybrid" },
    { nome: "Corolla Cross", motor: "2.0 Dynamic Force" },
    { nome: "Corolla Cross", motor: "1.8 Hybrid" },
    { nome: "Hilux", motor: "2.8 Turbodiesel" },
    { nome: "SW4", motor: "2.8 Turbodiesel" }
  ],
  Hyundai: [
    { nome: "HB20", motor: "1.0 Aspirado" },
    { nome: "HB20", motor: "1.0 Turbo" },
    { nome: "Creta", motor: "1.0 Turbo" },
    { nome: "Creta", motor: "2.0 Smartstream" },
    { nome: "Tucson", motor: "1.6 Turbo" },
    { nome: "HR", motor: "2.5 Turbodiesel" }
  ],
  Renault: [
    { nome: "Kwid", motor: "1.0 SCe" },
    { nome: "Sandero", motor: "1.0 SCe" },
    { nome: "Sandero", motor: "1.6 SCe" },
    { nome: "Duster", motor: "1.6 SCe" },
    { nome: "Duster", motor: "1.3 Turbo TCe" },
    { nome: "Oroch", motor: "1.6 SCe" },
    { nome: "Oroch", motor: "1.3 Turbo TCe" },
    { nome: "Master", motor: "2.3 Turbodiesel" }
  ],
  Honda: [
    { nome: "City", motor: "1.5 DOHC i-VTEC" },
    { nome: "HR-V", motor: "1.5 i-VTEC" },
    { nome: "HR-V", motor: "1.5 Turbo" },
    { nome: "Civic", motor: "2.0 Hybrid" }
  ],
  Nissan: [
    { nome: "Versa", motor: "1.6 16V" },
    { nome: "Kicks", motor: "1.6 16V" },
    { nome: "Frontier", motor: "2.3 Bi-Turbodiesel" }
  ],
  Jeep: [
    { nome: "Renegade", motor: "1.3 Turbo T270" },
    { nome: "Compass", motor: "1.3 Turbo T270" },
    { nome: "Compass", motor: "2.0 Turbodiesel TD350" },
    { nome: "Commander", motor: "1.3 Turbo T270" },
    { nome: "Commander", motor: "2.0 Turbodiesel TD350" }
  ],
  "Mercedes-Benz": [
    { nome: "Sprinter", motor: "2.2 Turbodiesel" },
    { nome: "Accelo 1016", motor: "3.0 Turbodiesel" },
    { nome: "Atego 1719", motor: "7.2 Turbodiesel" },
    { nome: "Actros 2651", motor: "12.8 Turbodiesel" }
  ],
  Volvo: [
    { nome: "XC40", motor: "Elétrico" },
    { nome: "XC60", motor: "2.0 T8 Plug-in Hybrid" },
    { nome: "FH 460", motor: "12.8 Diesel" },
    { nome: "FH 540", motor: "12.8 Diesel" },
    { nome: "VM 270", motor: "7.2 Diesel" }
  ],
  Scania: [
    { nome: "R 450", motor: "13.0 Diesel" },
    { nome: "R 540", motor: "13.0 Diesel" },
    { nome: "G 410", motor: "13.0 Diesel" }
  ],
  Iveco: [
    { nome: "Daily", motor: "3.0 Turbodiesel" },
    { nome: "Tector", motor: "5.9 Diesel" },
    { nome: "S-Way", motor: "13.0 Diesel" }
  ]
};

const OPCOES_IMPLEMENTO = [
  "Espargidor", "Melosa", "Baú de Alumínio", "Lonado/Sider", "Carga seca", "Graneleira",
  "Transp. de bebidas", "Transp. de botijões", "Ambulância", "Tanque térmico", "Tanque de gás",
  "Basculante", "Betoneira", "Isotérmico", "Frigorificado", "Compactador", "Munck", "Gaiola"
];

const OPCOES_PNEUS = [
  "Carro", "Moto", "Toco", "Truck", "Traçado", "Bi-truck",
  "Toco + Semi-reboque 2 eixos", "Toco + Semi-reboque 3 eixos",
  "Truck + Semi-reboque 2 eixos", "Truck + Semi-reboque 3 eixos", "Truck + Semi-reboque 4 eixos",
  "Bitrem 9 eixos", "Carreta 1 eixo", "Carreta 2 eixos", "Carreta 3 eixos", "Carreta 4 eixos",
  "Bitrem 7 eixos", "Rodotrem 6 eixos"
];

export default function ModalVeiculo({
  show,
  onHide,
  veiculoData,
  setVeiculoData,
  unidades,
  veiculos = [],
  onSave
}) {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrand, setCustomBrand] = useState("");

  const [selectedModel, setSelectedModel] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModel, setCustomModel] = useState("");

  const [selectedClass1, setSelectedClass1] = useState("");
  const [isCustomClass1, setIsCustomClass1] = useState(false);
  const [customClass1, setCustomClass1] = useState("");

  const [selectedClass2, setSelectedClass2] = useState("");
  const [isCustomClass2, setIsCustomClass2] = useState(false);
  const [customClass2, setCustomClass2] = useState("");

  const [formasPagamento, setFormasPagamento] = useState([]);
  const [showQuickFormaPg, setShowQuickFormaPg] = useState(false);
  const [newFormaPgName, setNewFormaPgName] = useState("");
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardBrand, setNewCardBrand] = useState("");

  // Coleta classificações únicas do inventário
  const uniqueClassificacao1 = Array.from(new Set(veiculos.map(v => v.classificacao_1).filter(Boolean)));
  const uniqueClassificacao2 = Array.from(new Set(veiculos.map(v => v.classificacao_2).filter(Boolean)));

  const loadFormasPagamento = async () => {
    try {
      const res = await apiClient.get("/api/frota/combustivel/formas-pagamento");
      setFormasPagamento(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFormaPg = async () => {
    if (!newFormaPgName.trim()) return;
    try {
      const res = await apiClient.post("/api/frota/combustivel/formas-pagamento", {
        nome: newFormaPgName,
        numero_cartao: newCardNumber,
        bandeira: newCardBrand
      });
      setFormasPagamento(prev => [...prev, res.data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setVeiculoData(prev => ({ ...prev, forma_pagamento_id: res.data.id }));
      setShowQuickFormaPg(false);
      setNewFormaPgName("");
      setNewCardNumber("");
      setNewCardBrand("");
    } catch (e) {
      alert("Erro ao cadastrar forma de pagamento.");
    }
  };

  useEffect(() => {
    if (show) {
      loadFormasPagamento();
      // BRAND SETUP
      const marcaVal = veiculoData.marca || "";
      if (marcaVal === "") {
        setSelectedBrand("");
        setIsCustomBrand(false);
        setCustomBrand("");
      } else if (MARCAS_SUGERIDAS.includes(marcaVal)) {
        setSelectedBrand(marcaVal);
        setIsCustomBrand(false);
        setCustomBrand("");
      } else {
        setSelectedBrand("custom");
        setIsCustomBrand(true);
        setCustomBrand(marcaVal);
      }

      // MODEL SETUP
      const modeloVal = veiculoData.modelo || "";
      if (modeloVal === "") {
        setSelectedModel("");
        setIsCustomModel(false);
        setCustomModel("");
      } else {
        const brandModels = MODELOS_POR_MARCA[marcaVal] || [];
        const found = brandModels.find(m => m.nome === modeloVal);
        if (found) {
          setSelectedModel(modeloVal);
          setIsCustomModel(false);
          setCustomModel("");
        } else {
          setSelectedModel("custom");
          setIsCustomModel(true);
          setCustomModel(modeloVal);
        }
      }

      // CLASSIFICATION 1 SETUP
      const class1Val = veiculoData.classificacao_1 || "";
      if (class1Val === "") {
        setSelectedClass1("");
        setIsCustomClass1(false);
        setCustomClass1("");
      } else if (uniqueClassificacao1.includes(class1Val)) {
        setSelectedClass1(class1Val);
        setIsCustomClass1(false);
        setCustomClass1("");
      } else {
        setSelectedClass1("custom");
        setIsCustomClass1(true);
        setCustomClass1(class1Val);
      }

      // CLASSIFICATION 2 SETUP
      const class2Val = veiculoData.classificacao_2 || "";
      if (class2Val === "") {
        setSelectedClass2("");
        setIsCustomClass2(false);
        setCustomClass2("");
      } else if (uniqueClassificacao2.includes(class2Val)) {
        setSelectedClass2(class2Val);
        setIsCustomClass2(false);
        setCustomClass2("");
      } else {
        setSelectedClass2("custom");
        setIsCustomClass2(true);
        setCustomClass2(class2Val);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    if (brand === "custom") {
      setIsCustomBrand(true);
      setVeiculoData(prev => ({ ...prev, marca: customBrand, modelo: "", motorizacao: "" }));
      setSelectedModel("");
      setIsCustomModel(false);
    } else {
      setIsCustomBrand(false);
      setVeiculoData(prev => ({ ...prev, marca: brand, modelo: "", motorizacao: "" }));
      setSelectedModel("");
      setIsCustomModel(false);
    }
  };

  const handleCustomBrandChange = (val) => {
    setCustomBrand(val);
    setVeiculoData(prev => ({ ...prev, marca: val }));
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    if (model === "custom") {
      setIsCustomModel(true);
      setVeiculoData(prev => ({ ...prev, modelo: customModel, motorizacao: "" }));
    } else {
      setIsCustomModel(false);
      const brandModels = MODELOS_POR_MARCA[selectedBrand] || [];
      const found = brandModels.find(m => m.nome === model);
      setVeiculoData(prev => ({
        ...prev,
        modelo: model,
        motorizacao: found ? found.motor : ""
      }));
    }
  };

  const handleCustomModelChange = (val) => {
    setCustomModel(val);
    setVeiculoData(prev => ({ ...prev, modelo: val }));
  };

  const handleClass1Change = (val) => {
    setSelectedClass1(val);
    if (val === "custom") {
      setIsCustomClass1(true);
      setVeiculoData(prev => ({ ...prev, classificacao_1: customClass1 }));
    } else {
      setIsCustomClass1(false);
      setVeiculoData(prev => ({ ...prev, classificacao_1: val }));
    }
  };

  const handleCustomClass1Change = (val) => {
    setCustomClass1(val);
    setVeiculoData(prev => ({ ...prev, classificacao_1: val }));
  };

  const handleClass2Change = (val) => {
    setSelectedClass2(val);
    if (val === "custom") {
      setIsCustomClass2(true);
      setVeiculoData(prev => ({ ...prev, classificacao_2: customClass2 }));
    } else {
      setIsCustomClass2(false);
      setVeiculoData(prev => ({ ...prev, classificacao_2: val }));
    }
  };

  const handleCustomClass2Change = (val) => {
    setCustomClass2(val);
    setVeiculoData(prev => ({ ...prev, classificacao_2: val }));
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" backdrop="static">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-primary fw-bold">
            {veiculoData.id ? "Editar Veículo" : "Cadastrar Novo Veículo"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
          <Row className="g-3">

            {/* SECTION 1: DADOS PRINCIPAIS */}
            <Col md={12}>
              <h6 className="border-bottom pb-2 text-primary fw-bold mt-2 d-flex align-items-center">
                <span className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center me-2" style={{ width: "24px", height: "24px", fontSize: "0.85rem" }}>1</span>
                Dados Principais e Identificação
              </h6>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Nº de Frota (Numeração)</Form.Label>
                <Form.Control
                  placeholder="Ex: FT-09"
                  value={veiculoData.numeracao || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, numeracao: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Placa <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  placeholder="Ex: ABC1D23"
                  value={veiculoData.placa || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, placa: e.target.value.toUpperCase() })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Marca <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={selectedBrand}
                  onChange={e => handleBrandChange(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {MARCAS_SUGERIDAS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="custom">Outra (Digitar manual)...</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {isCustomBrand && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-info">Digitar Marca</Form.Label>
                  <Form.Control
                    value={customBrand}
                    placeholder="Nome da marca"
                    onChange={e => handleCustomBrandChange(e.target.value)}
                  />
                </Form.Group>
              </Col>
            )}

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Modelo <span className="text-danger">*</span></Form.Label>
                {selectedBrand && selectedBrand !== "custom" ? (
                  <Form.Select
                    value={selectedModel}
                    onChange={e => handleModelChange(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {(MODELOS_POR_MARCA[selectedBrand] || []).map(m => (
                      <option key={m.nome + m.motor} value={m.nome}>{m.nome}</option>
                    ))}
                    <option value="custom">Outro modelo (Digitar manual)...</option>
                  </Form.Select>
                ) : (
                  <Form.Control
                    value={veiculoData.modelo || ""}
                    placeholder="Modelo do veículo"
                    onChange={e => setVeiculoData({ ...veiculoData, modelo: e.target.value })}
                  />
                )}
              </Form.Group>
            </Col>

            {isCustomModel && selectedBrand && selectedBrand !== "custom" && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-info">Digitar Modelo</Form.Label>
                  <Form.Control
                    value={customModel}
                    placeholder="Nome do modelo"
                    onChange={e => handleCustomModelChange(e.target.value)}
                  />
                </Form.Group>
              </Col>
            )}

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Motorização</Form.Label>
                <Form.Control
                  placeholder="Ex: 2.0 Turbodiesel"
                  value={veiculoData.motorizacao || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, motorizacao: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Ano de Fabricação</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ex: 2022"
                  value={veiculoData.ano_fabricacao || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, ano_fabricacao: e.target.value, ano: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Ano Modelo</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ex: 2023"
                  value={veiculoData.ano_modelo || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, ano_modelo: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Combustível</Form.Label>
                <Form.Select value={veiculoData.tipo_combustivel} onChange={e => setVeiculoData({ ...veiculoData, tipo_combustivel: e.target.value })}>
                  <option>Flex</option>
                  <option>Gasolina</option>
                  <option>Etanol</option>
                  <option>Diesel</option>
                  <option>Elétrico</option>
                  <option>Híbrido</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Cor</Form.Label>
                <Form.Control
                  placeholder="Ex: Branco"
                  value={veiculoData.cor || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, cor: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Odômetro Atual (KM)</Form.Label>
                <Form.Control
                  type="number"
                  value={veiculoData.quilometragem_atual || 0}
                  onChange={e => setVeiculoData({ ...veiculoData, quilometragem_atual: e.target.value })}
                />
              </Form.Group>
            </Col>

            {/* SECTION 2: CLASSIFICAÇÃO E IMPLEMENTOS */}
            <Col md={12}>
              <h6 className="border-bottom pb-2 text-primary fw-bold mt-4 d-flex align-items-center">
                <span className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center me-2" style={{ width: "24px", height: "24px", fontSize: "0.85rem" }}>2</span>
                Classificações, Categorias e Implementos
              </h6>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Classificação 1</Form.Label>
                <Form.Select
                  value={selectedClass1}
                  onChange={e => handleClass1Change(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {uniqueClassificacao1.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="custom">Criar nova...</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {isCustomClass1 && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-info">Nova Classificação 1</Form.Label>
                  <Form.Control
                    value={customClass1}
                    placeholder="Escreva a classificação"
                    onChange={e => handleCustomClass1Change(e.target.value)}
                  />
                </Form.Group>
              </Col>
            )}

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Classificação 2</Form.Label>
                <Form.Select
                  value={selectedClass2}
                  onChange={e => handleClass2Change(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {uniqueClassificacao2.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="custom">Criar nova...</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {isCustomClass2 && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-info">Nova Classificação 2</Form.Label>
                  <Form.Control
                    value={customClass2}
                    placeholder="Escreva a classificação"
                    onChange={e => handleCustomClass2Change(e.target.value)}
                  />
                </Form.Group>
              </Col>
            )}

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Categoria (Tipo)</Form.Label>
                <Form.Select value={veiculoData.categoria || "Passeio"} onChange={e => setVeiculoData({ ...veiculoData, categoria: e.target.value })}>
                  <option>Passeio</option>
                  <option>Utilitário</option>
                  <option>Carga</option>
                  <option>Motocicleta</option>
                  <option>Empilhadeira Elétrica</option>
                  <option>Paleteira Elétrica</option>
                  <option>Paleteira Manual</option>
                  <option>Triciclo</option>
                  <option>Carro</option>
                  <option>Cavalo mecânico</option>
                  <option>Moto</option>
                  <option>Caminhonete</option>
                  <option>Caminhão</option>
                  <option>Guincho</option>
                  <option>VUC</option>
                  <option>Van</option>
                  <option>Ônibus</option>
                  <option>Micro-ônibus</option>
                  <option>Trator</option>
                  <option>Carreta</option>
                  <option>Carretinha</option>
                  <option>Empilhadeira</option>
                  <option>Escavadeira</option>
                  <option>Manipulador Telescópico</option>
                  <option>Máquina de guia</option>
                  <option>Moto niveladora</option>
                  <option>Pá carregadeira</option>
                  <option>Retro-escavadeira</option>
                  <option>Rolo compactador</option>
                  <option>Carregadeira de Pneus</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Implemento</Form.Label>
                <Form.Select value={veiculoData.implemento || ""} onChange={e => setVeiculoData({ ...veiculoData, implemento: e.target.value })}>
                  <option value="">Não se aplica / Nenhum</option>
                  {OPCOES_IMPLEMENTO.map(imp => (
                    <option key={imp} value={imp}>{imp}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Diagrama de Pneus</Form.Label>
                <Form.Select value={veiculoData.diagrama_pneus || "Não se aplica"} onChange={e => setVeiculoData({ ...veiculoData, diagrama_pneus: e.target.value })}>
                  <option value="Não se aplica">Não se aplica / Nenhum</option>
                  {OPCOES_PNEUS.map(diag => (
                    <option key={diag} value={diag}>{diag}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* SECTION 3: CAPACIDADES E OPERAÇÕES */}
            <Col md={12}>
              <h6 className="border-bottom pb-2 text-primary fw-bold mt-4 d-flex align-items-center">
                <span className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center me-2" style={{ width: "24px", height: "24px", fontSize: "0.85rem" }}>3</span>
                Capacidades e Parâmetros de Locação
              </h6>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Lotação Máxima (Passageiros)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ex: 5"
                  value={veiculoData.lotacao_maxima || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, lotacao_maxima: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Capacidade de Transporte</Form.Label>
                <Form.Control
                  placeholder="Ex: 15 Toneladas, 1200 kg"
                  value={veiculoData.capacidade_transporte || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, capacidade_transporte: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Capacidade do Tanque (L)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ex: 50"
                  value={veiculoData.capacidade_tanque || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, capacidade_tanque: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Valor do Bem (R$)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="R$ 0,00"
                  value={veiculoData.valor_bem || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, valor_bem: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Valor de Locação (R$)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="R$ 0,00"
                  value={veiculoData.valor_locacao || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, valor_locacao: e.target.value })}
                />
              </Form.Group>
            </Col>

            {/* SECTION 4: ATRIBUIÇÃO E GESTÃO */}
            <Col md={12}>
              <h6 className="border-bottom pb-2 text-primary fw-bold mt-4 d-flex align-items-center">
                <span className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center me-2" style={{ width: "24px", height: "24px", fontSize: "0.85rem" }}>4</span>
                Atribuição e Gestão
              </h6>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Unidade / Filial</Form.Label>
                <Form.Select value={veiculoData.unidade_id || ""} onChange={e => setVeiculoData({ ...veiculoData, unidade_id: e.target.value })}>
                  <option value="">Não Vinculado</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.nome_unidade}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Centro de Custo</Form.Label>
                <Form.Select value={veiculoData.centro_custo || ""} onChange={e => setVeiculoData({ ...veiculoData, centro_custo: e.target.value })}>
                  <option value="">Selecione...</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.nome_unidade}>{u.nome_unidade}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Status Atual</Form.Label>
                <Form.Select value={veiculoData.status || "Disponível"} onChange={e => setVeiculoData({ ...veiculoData, status: e.target.value })}>
                  <option value="Disponível">Disponível</option>
                  <option value="Em Uso">Em uso</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Sinistro">Sinistro</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Vendido">Vendido</option>
                  <option value="Venda-proposta">Disponível para venda</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Data Aquisição</Form.Label>
                <Form.Control
                  type="date"
                  value={veiculoData.data_aquisicao || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, data_aquisicao: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Forma Pg. / Cartão Atrelado</Form.Label>
                <InputGroup>
                  <Form.Select
                    value={veiculoData.forma_pagamento_id || ""}
                    onChange={e => setVeiculoData({ ...veiculoData, forma_pagamento_id: e.target.value })}
                  >
                    <option value="">Nenhuma</option>
                    {formasPagamento.map(fp => (
                      <option key={fp.id} value={fp.id}>
                        {fp.nome} {fp.bandeira ? `(${fp.bandeira})` : ""} {fp.numero_cartao ? `- ${fp.numero_cartao}` : ""}
                      </option>
                    ))}
                  </Form.Select>
                  <Button variant="outline-primary" onClick={() => setShowQuickFormaPg(true)}>+</Button>
                </InputGroup>
              </Form.Group>
            </Col>

            {/* SECTION 5: DOCUMENTOS E ALERTAS */}
            <Col md={12}>
              <h6 className="border-bottom pb-2 text-primary fw-bold mt-4 d-flex align-items-center">
                <span className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center me-2" style={{ width: "24px", height: "24px", fontSize: "0.85rem" }}>5</span>
                Controle de Documentação e Alertas
              </h6>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Renavam</Form.Label>
                <Form.Control
                  value={veiculoData.renavam || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, renavam: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Chassi</Form.Label>
                <Form.Control
                  value={veiculoData.chassi || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, chassi: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Apólice de Seguro</Form.Label>
                <Form.Control
                  placeholder="Número ou referência do seguro contratado"
                  value={veiculoData.apolice_seguro || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, apolice_seguro: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Vencimento Seguro</Form.Label>
                <Form.Control
                  type="date"
                  value={veiculoData.data_vencimento_seguro || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, data_vencimento_seguro: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Vencimento IPVA</Form.Label>
                <Form.Control
                  type="date"
                  value={veiculoData.data_vencimento_ipva || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, data_vencimento_ipva: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Venc. Licenciamento</Form.Label>
                <Form.Control
                  type="date"
                  value={veiculoData.data_vencimento_licenciamento || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, data_vencimento_licenciamento: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Próxima Vistoria</Form.Label>
                <Form.Control
                  type="date"
                  value={veiculoData.data_vencimento_vistoria || ""}
                  onChange={e => setVeiculoData({ ...veiculoData, data_vencimento_vistoria: e.target.value })}
                />
              </Form.Group>
            </Col>

          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={onHide}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={!veiculoData.placa || !veiculoData.modelo || !veiculoData.marca}
          >
            Salvar Veículo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* QUICK MODAL: FORMA PG */}
      <Modal show={showQuickFormaPg} onHide={() => setShowQuickFormaPg(false)} centered size="sm">
        <Modal.Header closeButton><Modal.Title className="h6 fw-bold">Novo Cartão / Forma Pg.</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Descrição / Nome</Form.Label>
            <Form.Control
              type="text"
              value={newFormaPgName}
              onChange={e => setNewFormaPgName(e.target.value)}
              placeholder="Ex: Cartão Combustível Carro 01"
              required
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Bandeira (Opcional)</Form.Label>
            <Form.Control
              type="text"
              value={newCardBrand}
              onChange={e => setNewCardBrand(e.target.value)}
              placeholder="Ex: Visa, MasterCard"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Número do Cartão (Opcional)</Form.Label>
            <Form.Control
              type="text"
              value={newCardNumber}
              onChange={e => setNewCardNumber(e.target.value)}
              placeholder="Ex: Final 4321"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowQuickFormaPg(false)}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleCreateFormaPg}>Adicionar</Button>
        </Modal.Footer>
      </Modal>
    </>
  )

}