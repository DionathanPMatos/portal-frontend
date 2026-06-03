import React, { useState, useEffect, useRef} from "react";
import axios from 'axios';
import { FaDollarSign, FaCalendarAlt, FaBullseye, FaTrophy, FaUpload, FaTrash, FaEdit } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import "../styles/Dashboard.css";
import NewsWidget from "./../features/news/pages/NewsWidget";

function Dashboard({ isLoggedIn }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeMarca, setActiveMarca] = useState(null); // 🚀 Estado para controlar a marca isolada

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/api/dashboard-metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error("Erro ao buscar métricas do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Referência invisível para abrir o explorador de arquivos do Windows
  const fileInputRef = useRef(null);

  // Função que dispara o upload para o Node.js
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true); // 🚀 Trava a tela e mostra a mensagem de carregamento
    try {
      await axios.post('/api/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('Resultados do dia importados com sucesso!');
      
      // 🚀 Recarrega as métricas da tela automaticamente com os dados novos!
      const response = await axios.get('/api/dashboard-metrics');
      setMetrics(response.data);
      
    } catch (error) {
      console.error("Erro no upload:", error);
      const mensagemErro = error.response?.data?.error || 'Erro inesperado ao importar o arquivo.';
      alert(`Falha no upload:\n\n${mensagemErro}`);
    } finally {
      event.target.value = null; // Reseta o input para permitir subir o mesmo arquivo de novo se errar
      setIsUploading(false); // 🚀 Oculta a tela de carregamento, seja em caso de erro ou sucesso
    }
  };

  // Função para limpar todos os dados do banco
  const handleClearData = async () => {
    if (window.confirm('Tem certeza que deseja APAGAR TODOS os dados de vendas importados? Essa ação não pode ser desfeita.')) {
      try {
        setLoading(true);
        await axios.delete('/api/dashboard-metrics/clear');
        alert('Dados apagados com sucesso!');
        
        // Recarrega as métricas da tela automaticamente zeradas
        const response = await axios.get('/api/dashboard-metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error("Erro ao limpar dados:", error);
        alert('Erro ao tentar limpar os dados.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Função para editar a meta anual
  const handleEditMetaAno = async () => {
    const valorAtual = metrics?.cardsSuperiores?.metaAno || 0;
    const novaMetaStr = window.prompt("Digite o valor da nova meta ANUAL (apenas números ou casas decimais. Ex: 1500000):", valorAtual);
    
    if (novaMetaStr === null) return; // Usuário cancelou
    
    const novaMeta = parseFloat(novaMetaStr.replace(/\./g, '').replace(',', '.'));
    
    if (isNaN(novaMeta)) {
      alert('Valor inválido. Digite apenas números.');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/dashboard-metrics/meta-ano', { meta: novaMeta });
      
      // Recarrega as métricas
      const response = await axios.get('/api/dashboard-metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error("Erro ao atualizar meta anual:", error);
      alert('Erro ao tentar atualizar a meta anual.');
    } finally {
      setLoading(false);
    }
  };

  // Função para editar a meta mensal
  const handleEditMeta = async () => {
    const valorAtual = metrics?.cardsSuperiores?.metaMes || 0;
    const novaMetaStr = window.prompt("Digite o valor da nova meta para o mês (apenas números ou casas decimais. Ex: 150000 ou 150000.50):", valorAtual);
    
    if (novaMetaStr === null) return; // Usuário cancelou
    
    const novaMeta = parseFloat(novaMetaStr.replace(/\./g, '').replace(',', '.'));
    
    if (isNaN(novaMeta)) {
      alert('Valor inválido. Digite apenas números.');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/dashboard-metrics/meta', { meta: novaMeta });
      
      // Recarrega as métricas
      const response = await axios.get('/api/dashboard-metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
      alert('Erro ao tentar atualizar a meta.');
    } finally {
      setLoading(false);
    }
  };

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
      await axios.post('/api/dashboard-metrics/meta-vendedor', { vendedor: vendedorNome, meta: novaMeta });
      
      // Recarrega as métricas da tela para atualizar a barra de progresso imediatamente
      const response = await axios.get('/api/dashboard-metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error("Erro ao atualizar meta do vendedor:", error);
      alert('Erro ao tentar atualizar a meta do vendedor.');
    } finally {
      setLoading(false);
    }
  };

  // Função para isolar/mostrar marcas ao clicar na legenda do gráfico
  const handleLegendClick = (e) => {
    const { dataKey } = e;
    if (activeMarca === dataKey) {
      setActiveMarca(null); // Se já está isolada, clica para mostrar todas
    } else {
      setActiveMarca(dataKey); // Isola a marca clicada ocultando o resto
    }
  };

  // Formatador de moeda utilitário para o padrão Real (R$)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Paleta de cores para distribuir dinamicamente entre as marcas
  const COLORS = ['#0063c6', '#a72323', '#2A9D8F', '#F77F00', '#6f42c1', '#17a2b8', '#e83e8c', '#fd7e14', '#20c997', '#343a40'];

  // Componente de Tooltip Customizado para o Gráfico
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="fw-bold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: 0 }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando indicadores de performance...</div>;
  }

  return (
    <div className="container-main">
      {/* 🚀 TELA DE CARREGAMENTO DO UPLOAD */}
      {isUploading && (
        <div className="upload-overlay">
          <div className="upload-spinner"></div>
          <h3 className="mt-4 text-white">Processando arquivo...</h3>
          <p className="text-light">Isso pode levar alguns segundos. Por favor, não feche a página.</p>
        </div>
      )}

      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Dashboard Operacional</h1>
          <p className="text-muted text-sm">Visão consolidada de performance comercial e metas</p>
        </div>
        {/* 🚀 NOVA ÁREA DE AÇÕES NO TOPO DIREITO */}
        <div className="page-actions d-flex gap-2">
          <button 
            className="btn btn-outline-danger d-flex align-items-center gap-2 shadow-sm"
            onClick={handleClearData}
          >
            <FaTrash /> Limpar Dados
          </button>
          {/* O input real fica invisível, o botão bonito que aciona ele */}
          <input 
            type="file" 
            accept=".csv" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            onClick={() => fileInputRef.current.click()}
          >
            <FaUpload /> Importar Resultado Diário
          </button>
        </div>
      </div>

      {/* 🚀 GRID DOS 4 CARDS SUPERIORES */}
      <div className="row g-3 mb-4">
        {/* Card 1: Venda Ano */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted text-uppercase text-xs font-weight-bold d-flex align-items-center gap-2">
                    Total Vendas (Ano)
                    <FaEdit 
                      className="text-primary" 
                      style={{ cursor: 'pointer' }} 
                      title="Editar Meta Anual" 
                      onClick={handleEditMetaAno} 
                    />
                  </span>
                  <h4 className="mt-1 mb-0 font-weight-bold text-primary">
                    {formatCurrency(metrics?.cardsSuperiores?.vendaAno || 0)}
                  </h4>
                </div>
                <div className="bg-light-primary rounded-circle p-3 text-primary">
                  <FaCalendarAlt size={20} />
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

        {/* Card 2: Venda Mês */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted text-uppercase text-xs font-weight-bold">Total Vendas (Mês)</span>
                  <h4 className="mt-1 mb-0 font-weight-bold text-success">
                    {formatCurrency(metrics?.cardsSuperiores?.vendaMes || 0)}
                  </h4>
                </div>
                <div className="bg-light-success rounded-circle p-3 text-success">
                  <FaDollarSign size={20} />
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

        {/* Card 3: Venda Dia */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase text-xs font-weight-bold">Vendas de Hoje</span>
                <h3 className="mt-1 mb-0 font-weight-bold text-info">
                  {formatCurrency(metrics?.cardsSuperiores?.vendaDia || 0)}
                </h3>
              </div>
              <div className="bg-light-info rounded-circle p-3 text-info">
                <FaDollarSign size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Meta Mensal */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted text-uppercase text-xs font-weight-bold d-flex align-items-center gap-2">
                    Meta do Mês Atual
                    <FaEdit 
                      className="text-primary" 
                      style={{ cursor: 'pointer' }} 
                      title="Editar Meta Mensal" 
                      onClick={handleEditMeta} 
                    />
                  </span>
                  <h4 className="mt-1 mb-0 font-weight-bold text-warning">
                    {formatCurrency(metrics?.cardsSuperiores?.metaMes || 0)}
                  </h4>
                </div>
                <div className="bg-light-warning rounded-circle p-3 text-warning">
                  <FaBullseye size={20} />
                </div>
              </div>
              <div className="mt-2 pt-1 border-top">
                <small className="text-muted">
                  Falta para a meta: <strong className="text-danger">{formatCurrency(metrics?.cardsSuperiores?.quantoFaltaMeta || 0)}</strong>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 SEÇÃO INFERIOR - GRÁFICO COMPARATIVO E RANKING */}
      <div className="row g-4">
        {/* Card Esquerdo: Gráfico Comparativo Anual Mês a Mês */}
        <div className="col-12 col-lg-8">
          <div className="card h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 font-weight-bold text-dark">Evolução de Vendas Mês a Mês (Comparativo Ano Anterior)</h5>
            </div>
            <div className="card-body">
            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.vendasMensais || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f5" />
                  <XAxis dataKey="mes" tick={{ fill: '#8a949f', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} tick={{ fill: '#8a949f', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="anoAnterior" name="Ano Anterior" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="anoAtual" name="Ano Atual" fill="#0063c6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            </div>
          </div>
        </div>

        {/* Card Direito: Ranking de Vendedores */}
        <div className="col-12 col-lg-4">
          <div className="card h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
              <FaTrophy className="text-warning" />
              <h5 className="mb-0 font-weight-bold text-dark">Top Vendedores do Mês</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={{ maxHeight: '382px', overflowY: 'auto' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-xs text-uppercase" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th className="px-4 py-3" style={{ width: '60px' }}>Pos</th>
                      <th className="py-3">Vendedor</th>
                      <th className="text-end px-4 py-3">Total Vendas</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {metrics?.rankingVendedores?.length > 0 ? (
                      metrics.rankingVendedores.map((item, index) => {
                        const percentual = item.meta > 0 ? (item.total / item.meta) * 100 : 0;
                        const percentualFormatado = percentual > 100 ? 100 : percentual; // Trava a barra visualmente em 100%
                        
                        return (
                        <tr key={index}>
                          <td className="px-4 font-weight-bold text-center align-middle">
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}º`}
                          </td>
                          <td className="py-3">
                            <div className="d-flex justify-content-between mb-1">
                                <span className="font-weight-semibold">{item.nome}</span>
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
                      )})
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center p-4 text-muted">Nenhum registro de venda no mês atual.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 NOVOS GRÁFICOS DE MARCAS / FABRICANTES */}
      <div className="row g-4 mt-1">
        {/* Card Esquerdo: Gráfico de Rosca (Marcas Mês Atual) */}
        <div className="col-12 col-lg-4">
          <div className="card h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 font-weight-bold text-dark">Vendas por Marca (Mês Atual)</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics?.roscaMarcas || []}
                      cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {metrics?.roscaMarcas?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Card Direito: Evolução Anual por Marca */}
        <div className="col-12 col-lg-8">
          <div className="card h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 font-weight-bold text-dark">Desempenho Anual por Marca (Mês a Mês)</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics?.vendasMensaisMarcas || []} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f5" />
                    <XAxis dataKey="mes" tick={{ fill: '#8a949f', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} tick={{ fill: '#8a949f', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '10px', cursor: 'pointer' }} onClick={handleLegendClick} />
                    {metrics?.marcasUnicas?.map((marca, index) => {
                      const isHidden = activeMarca !== null && activeMarca !== marca;
                      return (
                        <Line 
                          key={marca} type="monotone" dataKey={marca} 
                          stroke={COLORS[index % COLORS.length]} strokeWidth={3}
                          dot={{ r: 4, fill: COLORS[index % COLORS.length], strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                          hide={isHidden}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 MURAL DE NOTÍCIAS INTERATIVO INSERIDO AO FINAL DA PÁGINA */}
      <div className="mt-5">
        <NewsWidget />
      </div>

    </div>
  );
}

export default Dashboard;