import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";

const ModalProjeto = ({ show, onHide, data, setData, onSave, unidades, funcionarios }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  // Prepara as opções para o react-select
  const funcionarioOptions = funcionarios.map(f => ({
    value: f.id,
    label: f.nome_completo
  }));

  // Filtra as opções que já estão selecionadas
  const selectedFuncionarioOptions = funcionarioOptions.filter(
    option => data?.equipe_ids?.includes(option.value)
  );

  const handleEquipeChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setData({ ...data, equipe_ids: selectedIds });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{data?.id ? "Editar Projeto" : "Novo Projeto"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Nome do Projeto</Form.Label>
                <Form.Control
                  type="text"
                  name="nome_projeto"
                  value={data?.nome_projeto || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Filial</Form.Label>
                <Form.Select name="filial_id" value={data?.filial_id || ""} onChange={handleChange}>
                  <option value="">Selecione a filial...</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>{u.nome_unidade}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Responsável pelo Projeto</Form.Label>
                <Form.Select name="responsavel_id" value={data?.responsavel_id || ""} onChange={handleChange}>
                  <option value="">Selecione o responsável...</option>
                  {funcionarios.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome_completo}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Equipe do Projeto</Form.Label>
                <Select
                  isMulti
                  name="equipe_ids"
                  options={funcionarioOptions}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={selectedFuncionarioOptions}
                  onChange={handleEquipeChange}
                  placeholder="Selecione os colaboradores..."
                  noOptionsMessage={() => 'Nenhum colaborador encontrado'}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data de Início</Form.Label>
                <Form.Control
                  type="date"
                  name="data_inicio"
                  value={data?.data_inicio?.split('T')[0] || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Previsão de Conclusão</Form.Label>
                <Form.Control
                  type="date"
                  name="data_prevista_conclusao"
                  value={data?.data_prevista_conclusao?.split('T')[0] || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Orçamento Total (R$)</Form.Label>
                <Form.Control
                  type="number"
                  name="orcamento_total"
                  value={data?.orcamento_total || 0}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Prioridade</Form.Label>
                <Form.Select name="prioridade" value={data?.prioridade || "Normal"} onChange={handleChange}>
                  <option value="Baixa">Baixa</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Descrição / Escopo</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descricao"
              value={data?.descricao || ""}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Observações</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="observacoes"
              value={data?.observacoes || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSave}>
          Salvar Projeto
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalProjeto;