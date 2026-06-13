import React, { useState, useEffect } from "react";
import { FaBullseye, FaTrophy, FaEdit, FaChartLine, FaCashRegister, FaSun } from "react-icons/fa";
import Carousel from 'react-bootstrap/Carousel';
import "../styles/Dashboard.css";
import apiClient from "../services/api";
import NewsWidget from '../features/news/pages/NewsWidget'; // 🚀 Importa o widget de notícias

function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [carouselSlides, setCarouselSlides] = useState([]); // State for carousel slides

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        // Fetch metrics and slides in parallel
        const [metricsResponse, slidesResponse] = await Promise.all([
          apiClient.get('/api/dashboard-metrics', {
            params: { month: selectedMonth, year: selectedYear }
          }),
          apiClient.get('/api/homepage-slides')
        ]);
        setMetrics(metricsResponse.data);
        setCarouselSlides(slidesResponse.data);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [selectedMonth, selectedYear]);

  // Função para editar a meta individual do vendedor
  const handleEditVendorMeta = async (vendedorNome, metaAtual) => {
    const novaMetaStr = window.prompt(`Digite a nova meta para o vendedor ${vendedorNome} (apenas números. Ex: 50000):`, metaAtual);
    
    if (novaMetaStr === null) return; // Usuário cancelou
    
    const novaMeta = parseFloat(novaMetaStr.replace(/\./g, '').replace(',', '.'));
    
    if (isNaN(novaMeta)) {
      alert('Valor inválido. Digite apenas números.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/api/dashboard-metrics/meta-vendedor', { vendedor: vendedorNome, meta: novaMeta });
      
      // Recarrega as métricas da tela para atualizar a barra de progresso imediatamente
      const response = await apiClient.get('/api/dashboard-metrics', {
        params: { month: selectedMonth, year: selectedYear }
      });
      setMetrics(response.data);
    } catch (error) {
      console.error("Erro ao atualizar meta do vendedor:", error);
      alert('Erro ao tentar atualizar a meta do vendedor.');
    } finally {
      setLoading(false);
    }
  };

  // Formatador de moeda utilitário para o padrão Real (R$)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando indicadores de performance...</div>;
  }

  return (
    <div className="container-main">
      <div className="page-header mb-3 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
        <div>
          <h1 className="page-title">Olá! Bem vindo de volta</h1>
          <p className="text-muted text-sm">Tudo o que você precisa para começar o seu dia de trabalho.</p>
        </div>
        {/* 🚀 NOVA ÁREA DE AÇÕES NO TOPO DIREITO */}
        <div className="page-actions d-flex flex-wrap justify-content-lg-end gap-2 align-items-center">
          <select 
            className="form-select shadow-sm" 
            style={{ width: '140px', cursor: 'pointer' }}
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            <option value={1}>Janeiro</option>
            <option value={2}>Fevereiro</option>
            <option value={3}>Março</option>
            <option value={4}>Abril</option>
            <option value={5}>Maio</option>
            <option value={6}>Junho</option>
            <option value={7}>Julho</option>
            <option value={8}>Agosto</option>
            <option value={9}>Setembro</option>
            <option value={10}>Outubro</option>
            <option value={11}>Novembro</option>
            <option value={12}>Dezembro</option>
          </select>
          <select 
            className="form-select shadow-sm" 
            style={{ width: '100px', cursor: 'pointer' }}
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>
      </div>



      {/* 🚀 GRID DOS 4 CARDS SUPERIORES */}
      <div className="row g-2 mb-2 kpi-cards-row">
        {/* Card 1: Venda Ano - Ajustado para melhor responsividade */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted  font-weight-bold d-flex align-items-center gap-2 kpi-card-title-font">
                    Total Vendas (Ano)
                  </span>
                  <h4 className="mt-1 mb-0 kpi-main-metric">
                    {formatCurrency(metrics?.cardsSuperiores?.vendaAno || 0)}
                  </h4>
                </div>
                <div className="kpi-icon-circle kpi-icon-circle-purple">
                  <FaChartLine/>
                </div>
              </div>
              <div className="mt-2 pt-1 border-top d-flex flex-column gap-1">
                <small className="text-muted">
                  Falta para a meta: <strong className="text-danger">{formatCurrency(metrics?.cardsSuperiores?.quantoFaltaMetaAno || 0)}</strong>
                </small>
                <small className={metrics?.cardsSuperiores?.percentualAno >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                  {metrics?.cardsSuperiores?.percentualAno > 0 ? '+' : ''}{(metrics?.cardsSuperiores?.percentualAno || 0).toFixed(1)}% <span className="text-muted fw-normal">vs ano anterior</span>
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Venda Mês - Ajustado para melhor responsividade */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted  font-weight-bold kpi-card-title-font"> Total Vendas (Mês)</span>
                  <h4 className="mt-1 mb-0 kpi-main-metric">
                    {formatCurrency(metrics?.cardsSuperiores?.vendaMes || 0)}
                  </h4>
                </div>
                <div className="kpi-icon-circle kpi-icon-circle-blue">
                  <FaCashRegister/>
                </div>
              </div>
              <div className="mt-2 pt-1 border-top">
                <small className={metrics?.cardsSuperiores?.percentualMes >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                  {metrics?.cardsSuperiores?.percentualMes > 0 ? '+' : ''}{(metrics?.cardsSuperiores?.percentualMes || 0).toFixed(1)}% <span className="text-muted fw-normal">vs mês anterior</span>
                </small>
              </div>
            </div>
          </div>
        </div>

        
        {/* Card 3: Vendas do Dia - Ajustado para melhor responsividade */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted  font-weight-bold d-flex align-items-center gap-2 kpi-card-title-font">
                    Vendas do Dia
                  </span>
                  <h4 className="mt-1 mb-0 kpi-main-metric">
                    {formatCurrency(metrics?.cardsSuperiores?.vendaDia || 0)}
                  </h4>
                </div>
                <div className="kpi-icon-circle kpi-icon-circle-pink">
                  <FaSun />
                </div>
              </div>
              <div className="mt-2 pt-1 border-top">

              </div>
            </div>
          </div>
        </div>



        {/* Card 4: Meta Mensal - Ajustado para melhor responsividade */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted  font-weight-bold d-flex align-items-center gap-2 kpi-card-title-font">
                    Meta do Mês Atual
                  </span>
                  <h4 className="mt-1 mb-0 kpi-main-metric">
                    {formatCurrency(metrics?.cardsSuperiores?.metaMes || 0)}
                  </h4>
                </div>
                <div className="kpi-icon-circle kpi-icon-circle-cyan">
                  <FaBullseye />
                </div>
              </div>
              <div className="mt-2 pt-1 border-top">

              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* 3. Corpo Principal (Grid Assimétrico) */}
      <div className="row g-4">
        {/* Coluna da Esquerda (.col-lg-8) */}
        <div className="col-12 col-lg-8">
          {/* Carrossel de Imagens */}
          <div className="card mb-4">
      <div className="card-body p-0" style={{ overflow: 'hidden', borderRadius: '8px', maxHeight: '400px' }}>
        <Carousel fade interval={4000} pause="hover">
          {carouselSlides.length > 0 ? (
            carouselSlides.map(slide => (
              /* Adicionamos 'card-mural' no Item do Carrossel */
              <Carousel.Item key={slide.id} className="card-mural">
                <img
                  className="d-block w-100"
                  src={slide.imageUrl}
                  alt={slide.title}
                  style={{ objectFit: 'cover', height: '400px' }}
                />
                
                {/* Adicionamos 'conteudo-texto' e 'text-start' no Caption */}
                <Carousel.Caption className="conteudo-texto text-start">
                  <h5 className="mural-titulo">{slide.title}</h5>
                  <p className="mural-descricao">{slide.description}</p>
                </Carousel.Caption>
              </Carousel.Item>
            ))
          ) : (
            // Placeholder para quando não há slides
            <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: '400px' }}>
              <span>Nenhum slide para exibir.</span>
            </div>
          )}
        </Carousel>
      </div>
    </div>

          {/* 🚀 Mural de Avisos e Notícias (Widget Reintegrado) */}
          <NewsWidget />
        </div>

        {/* Coluna da Direita (.col-lg-4) */}
        <div className="col-12 col-lg-4">
          {/* Top Vendedores do Mês */}
          <div className="card mb-3">
            <div className="bg-white border-bottom py-3 d-flex align-items-center gap-2 px-4">
              <FaTrophy className="text-warning" />
              <h5 className="mb-0 font-weight-bold text-dark">Top Vendedores do Mês</h5>
            </div>
            <div className="card-body p-0 ranking-vendedores-container">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <tbody className="text-sm">
                    {metrics?.rankingVendedores?.length > 0 ? (
                      metrics.rankingVendedores.map((item, index) => {
                        const percentual = item.meta > 0 ? (item.total / item.meta) * 100 : 0;
                        const percentualFormatado = Math.min(percentual, 100); // Trava a barra visualmente em 100%

                        return (
                          <tr key={index} className="ranking-vendedor-row">
                            <td className="px-4 font-weight-bold text-center align-middle" style={{ width: '60px' }}>
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}º`}
                            </td>
                            <td>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="font-weight-semibold ranking-vendedor-nome">{item.nome}</span>
                                <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                                  Meta: {formatCurrency(item.meta)}
                                  <FaEdit
                                    className="text-primary"
                                    style={{ cursor: 'pointer' }}
                                    title="Editar Meta do Vendedor"
                                    onClick={() => handleEditVendorMeta(item.nome, item.meta)}
                                  />
                                </span>
                              </div>
                              <div className="progress" style={{ height: '6px' }}>
                                <div
                                  className={`progress-bar ${percentual >= 100 ? 'bg-success' : 'bg-primary'}`}
                                  role="progressbar"
                                  style={{ width: `${percentualFormatado}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="text-end px-4 align-middle">
                              <div className="font-weight-bold text-success">{formatCurrency(item.total)}</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{percentual.toFixed(1)}%</div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center p-4 text-muted">Nenhum registro de venda no mês.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Ações Pendentes */}
          <div className="card mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 font-weight-bold text-dark">Ações Pendentes</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Você não possui ações pendentes.</p>
            </div>
          </div>

          {/* Aniversariantes do Mês */}
          <div className="card">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 font-weight-bold text-dark">Aniversariantes do Mês</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Nenhum aniversariante no time este mês.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;