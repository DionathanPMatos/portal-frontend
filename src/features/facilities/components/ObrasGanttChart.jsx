import React from "react";
import { Badge, ProgressBar, Card } from "react-bootstrap";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ObrasGanttChart({ project, stages = [], employees = [] }) {
  if (!project) return null;

  if (stages.length === 0) {
    return (
      <Card className="shadow-sm border-0 text-center py-5">
        <Card.Body>
          <p className="text-muted mb-0">Nenhuma etapa cadastrada para este projeto. Cadastre etapas para visualizar o gráfico de Gantt.</p>
        </Card.Body>
      </Card>
    );
  }

  const parseDate = (d) => (d ? new Date(d) : null);

  // Encontra o range geral de datas para a escala do gráfico
  let minDate = parseDate(project.data_inicio) || new Date();
  let maxDate = parseDate(project.data_prevista_conclusao) || new Date();

  stages.forEach((e) => {
    const startP = parseDate(e.data_inicio_planejada);
    const endP = parseDate(e.data_fim_planejada);
    const startR = parseDate(e.data_inicio_real);
    const endR = parseDate(e.data_fim_real);

    if (startP && startP < minDate) minDate = startP;
    if (endP && endP > maxDate) maxDate = endP;
    if (startR && startR < minDate) minDate = startR;
    if (endR && endR > maxDate) maxDate = endR;
  });

  // Adiciona margem de segurança de 3 dias no início e fim do gráfico
  minDate = new Date(minDate.getTime() - 3 * 24 * 60 * 60 * 1000);
  maxDate = new Date(maxDate.getTime() + 3 * 24 * 60 * 60 * 1000);

  const totalDuration = maxDate - minDate;

  // Gera os marcadores de meses/semanas na linha de tempo
  const months = [];
  let tempDate = new Date(minDate);
  while (tempDate <= maxDate) {
    months.push(new Date(tempDate));
    // Avança 15 dias para criar marcadores de meio de mês ou quinzenais
    tempDate.setDate(tempDate.getDate() + 15);
  }

  const statusColors = {
    "Não Iniciada": "secondary",
    "Em Execução": "warning",
    "Parada": "danger",
    "Concluída": "success",
  };

  return (
    <Card className="shadow-sm border-0 mb-4 overflow-hidden">
      <Card.Header className="bg-dark text-white py-3">
        <h5 className="mb-0 text-uppercase">Gráfico de Gantt do Projeto</h5>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="d-flex flex-column" style={{ minWidth: "800px" }}>
          {/* Linha do Tempo / Cabeçalho */}
          <div className="d-flex border-bottom bg-light text-muted fw-bold small text-center align-items-center" style={{ height: "45px" }}>
            <div className="border-right p-2 text-start" style={{ width: "250px", flexShrink: 0 }}>
              Etapas
            </div>
            <div className="position-relative flex-grow-1 h-100 d-flex justify-content-between px-2 align-items-center">
              {months.map((m, idx) => {
                const percent = ((m - minDate) / totalDuration) * 100;
                return (
                  <div
                    key={idx}
                    className="position-absolute border-left h-100 d-flex align-items-center justify-content-center"
                    style={{
                      left: `${percent}%`,
                      transform: "translateX(-50%)",
                      fontSize: "0.75rem",
                      borderLeft: "1px dashed #ced4da",
                      width: "80px",
                    }}
                  >
                    {format(m, "dd/MM", { locale: ptBR })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lista de Etapas e Barras Gantt */}
          <div className="d-flex flex-column">
            {stages.map((e) => {
              const startP = parseDate(e.data_inicio_planejada);
              const endP = parseDate(e.data_fim_planejada);
              const startR = parseDate(e.data_inicio_real);
              const endR = parseDate(e.data_fim_real) || (e.status === "Em Execução" ? new Date() : null);

              // Calcula o posicionamento das barras planejadas e reais
              let planLeft = 0;
              let planWidth = 0;
              if (startP && endP) {
                planLeft = ((startP - minDate) / totalDuration) * 100;
                planWidth = ((endP - startP) / totalDuration) * 100;
              }

              let realLeft = 0;
              let realWidth = 0;
              if (startR && endR) {
                realLeft = ((startR - minDate) / totalDuration) * 100;
                realWidth = ((endR - startR) / totalDuration) * 100;
              }

              // Extrai nomes dos responsáveis
              let resIds = [];
              try {
                resIds = Array.isArray(e.responsavel_ids)
                  ? e.responsavel_ids
                  : JSON.parse(e.responsavel_ids || "[]");
              } catch (err) {
                resIds = [];
              }
              const names = employees
                .filter((emp) => resIds.includes(emp.id))
                .map((emp) => emp.nome_completo)
                .join(", ") || "Sem responsável";

              return (
                <div key={e.id} className="d-flex border-bottom hover-bg-light align-items-center py-2" style={{ minHeight: "80px" }}>
                  {/* Informações da Etapa (Coluna Fixa) */}
                  <div className="px-3 text-start border-right" style={{ width: "250px", flexShrink: 0 }}>
                    <div className="fw-bold text-dark" style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>
                      #{e.numero_etapa} - {e.nome_etapa}
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <Badge bg={statusColors[e.status] || "secondary"} style={{ fontSize: "0.68rem" }}>
                        {e.status}
                      </Badge>
                      <span className="text-muted font-monospace" style={{ fontSize: "0.72rem" }}>
                        {e.percentual_calculado || 0}%
                      </span>
                    </div>
                    <div className="text-muted text-truncate mt-1" style={{ fontSize: "0.72rem" }} title={names}>
                      👤 {names}
                    </div>
                  </div>

                  {/* Linhas de Gantt (Timeline) */}
                  <div className="position-relative flex-grow-1 h-100 px-2 d-flex flex-column justify-content-center gap-1.5" style={{ minHeight: "60px" }}>
                    {/* Linhas verticais pontilhadas no background */}
                    {months.map((m, idx) => {
                      const percent = ((m - minDate) / totalDuration) * 100;
                      return (
                        <div
                          key={idx}
                          className="position-absolute h-100"
                          style={{
                            left: `${percent}%`,
                            borderLeft: "1px dashed rgba(206, 212, 218, 0.4)",
                            top: 0,
                            zIndex: 1,
                          }}
                        />
                      );
                    })}

                    {/* Barra Planejada */}
                    {startP && endP && (
                      <div
                        className="position-relative d-flex align-items-center justify-content-center text-white font-weight-bold"
                        style={{
                          left: `${planLeft}%`,
                          width: `${planWidth}%`,
                          minWidth: "15px",
                          height: "18px",
                          backgroundColor: "#63b3ed",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          zIndex: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          cursor: "help",
                        }}
                        title={`Planejado: ${format(startP, "dd/MM")} até ${format(endP, "dd/MM")}`}
                      >
                        Planejado
                      </div>
                    )}

                    {/* Barra Real */}
                    {startR && endR && (
                      <div
                        className="position-relative d-flex align-items-center justify-content-center text-white"
                        style={{
                          left: `${realLeft}%`,
                          width: `${realWidth}%`,
                          minWidth: "15px",
                          height: "18px",
                          backgroundColor: e.status === "Concluída" ? "#48bb78" : "#ecc94b",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                          zIndex: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          cursor: "help",
                        }}
                        title={`Realizado: ${format(startR, "dd/MM")} até ${
                          e.data_fim_real ? format(new Date(e.data_fim_real), "dd/MM") : "Em andamento"
                        }`}
                      >
                        Real
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
