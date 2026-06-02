# 📋 Módulo de Gestão de Obras e Reformas

## Visão Geral

O módulo de **Gestão de Obras e Reformas** é um CRM completo integrado ao sistema de Facilities para gerenciar projetos de construção, reforma e manutenção de infraestrutura das filiais.

---

## 🎯 Funcionalidades Principais

### 1. **Gestão de Projetos**
- Cadastro de novos projetos de obras
- Rastreamento de status (Planejamento, Em Execução, Parado, Concluído)
- Definição de prioridades (Baixa, Normal, Alta, Crítica)
- Acompanhamento de orçamento vs. custo real
- Indicador de progresso percentual
- Associação a filiais específicas

### 2. **Etapas da Obra**
- Divisão do projeto em etapas sequenciais
- Planejamento de datas início/fim para cada etapa
- Rastreamento de data real de conclusão
- Status individual de cada etapa
- Indicador de progresso por etapa
- Definição de ordem de execução

### 3. **Orçamentos**
- Múltiplos orçamentos por projeto
- Associação com prestadores de serviço
- Valores estimados vs. valores reais
- Status de aprovação
- Opcional: associação com etapas específicas

### 4. **Lista de Materiais**
- Cadastro detalhado de materiais necessários
- Quantidade, unidade e valor unitário
- Cálculo automático de valor total
- Rastreamento de status (Pendente, Entregue)
- Datas de requisição e entrega
- Associação com fornecedores

### 5. **Checklists**
- Criação de listas de verificação por etapa
- Itens com status de conclusão
- Atribuição de responsáveis
- Rastreamento de data de conclusão
- Observações por item

### 6. **Cronograma**
- Visualização de atividades planejadas
- Datas de execução
- Atribuição de responsáveis
- Status do cronograma

### 7. **Evolução do Projeto**
- Registro de progresso percentual
- Tarefas concluídas vs. total
- Materiais entregues vs. total esperado
- Custo gasto vs. orçado
- Observações sobre o andamento

### 8. **Comentários e Observações**
- Comentários gerais do projeto
- Comentários específicos por etapa
- Tipos: Observação, Alerta, Problema, Sugestão, Nota Importante
- Rastreamento de quem fez o comentário e quando

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

```
obras_projetos
├── id (PK)
├── nome_projeto
├── descricao
├── filial_id (FK → unidades_filiais)
├── responsavel_id
├── data_inicio
├── data_prevista_conclusao
├── data_conclusao
├── status
├── orcamento_total
├── custo_atual
├── percentual_conclusao
├── prioridade
└── timestamps

obras_etapas
├── id (PK)
├── projeto_id (FK → obras_projetos)
├── numero_etapa
├── nome_etapa
├── descricao
├── data_inicio_planejada
├── data_fim_planejada
├── data_inicio_real
├── data_fim_real
├── status
├── percentual_conclusao
├── ordem_execucao
└── timestamps

obras_orcamentos
├── id (PK)
├── projeto_id (FK)
├── etapa_id (FK) [opcional]
├── descricao
├── valor_estimado
├── valor_real
├── prestador_id (FK → facilities_prestadores)
├── status
├── data_solicitacao
├── data_aprovacao
└── timestamps

obras_materiais
├── id (PK)
├── projeto_id (FK)
├── etapa_id (FK) [opcional]
├── nome_material
├── descricao
├── quantidade
├── unidade
├── valor_unitario
├── valor_total
├── fornecedor_id (FK → facilities_prestadores)
├── status
├── data_requisicao
├── data_entrega
└── timestamps

obras_checklists
├── id (PK)
├── projeto_id (FK)
├── etapa_id (FK) [opcional]
├── titulo
├── descricao
├── criador_id
└── timestamps

obras_checklist_itens
├── id (PK)
├── checklist_id (FK → obras_checklists)
├── descricao
├── concluido
├── responsavel_id
├── data_conclusao
└── timestamps

obras_cronograma
├── id (PK)
├── projeto_id (FK)
├── etapa_id (FK)
├── data_planejada
├── atividade
├── responsavel_id
├── status
└── timestamps

obras_evolucao
├── id (PK)
├── projeto_id (FK)
├── etapa_id (FK) [opcional]
├── percentual_concluido
├── tarefas_concluidas
├── tarefas_total
├── materiais_entregues
├── materiais_total
├── orcamento_gasto
├── usuario_id
└── data_atualizacao

obras_comentarios
├── id (PK)
├── projeto_id (FK)
├── etapa_id (FK) [opcional]
├── usuario_id
├── conteudo
├── tipo
└── timestamps

obras_documentos
├── id (PK)
├── projeto_id (FK)
├── etapa_id (FK) [opcional]
├── nome_arquivo
├── tipo_documento
├── caminho_arquivo
├── tamanho_arquivo
├── uploaded_by
└── data_upload
```

---

## 🔌 API Endpoints

### Projetos
```
GET    /api/obras/projetos                    - Listar todos os projetos
GET    /api/obras/projetos/:id                - Buscar projeto específico
POST   /api/obras/projetos                    - Criar novo projeto
PUT    /api/obras/projetos/:id                - Atualizar projeto
```

### Etapas
```
GET    /api/obras/etapas/:projeto_id          - Listar etapas de um projeto
POST   /api/obras/etapas                      - Criar nova etapa
PUT    /api/obras/etapas/:id                  - Atualizar etapa
```

### Orçamentos
```
GET    /api/obras/orcamentos/:projeto_id      - Listar orçamentos
POST   /api/obras/orcamentos                  - Criar orçamento
PUT    /api/obras/orcamentos/:id              - Atualizar orçamento
```

### Materiais
```
GET    /api/obras/materiais/:projeto_id       - Listar materiais
POST   /api/obras/materiais                   - Adicionar material
PUT    /api/obras/materiais/:id               - Atualizar material
```

### Checklists
```
GET    /api/obras/checklists/:projeto_id      - Listar checklists
GET    /api/obras/checklist-itens/:checklist_id - Listar itens do checklist
POST   /api/obras/checklists                  - Criar checklist
POST   /api/obras/checklist-itens             - Criar item de checklist
PUT    /api/obras/checklist-itens/:id         - Atualizar item de checklist
```

### Cronograma
```
GET    /api/obras/cronograma/:projeto_id      - Listar cronograma
POST   /api/obras/cronograma                  - Adicionar atividade ao cronograma
```

### Evolução
```
GET    /api/obras/evolucao/:projeto_id        - Listar evolução do projeto
POST   /api/obras/evolucao                    - Registrar evolução
```

### Comentários
```
GET    /api/obras/comentarios/:projeto_id     - Listar comentários
POST   /api/obras/comentarios                 - Adicionar comentário
```

---

## 📱 Componentes React

### GestaoObras.jsx
Componente principal que gerencia:
- Listagem de projetos com filtros
- Seleção de projeto
- Visualização de detalhes
- Múltiplas abas (Visão Geral, Etapas, Orçamentos, Materiais, Checklists, Comentários)
- Status e progresso visual

### ModalProjeto.jsx
Modal para:
- Criar novo projeto
- Editar projeto existente
- Definir metadados do projeto

### ModalEtapa.jsx
Modal para:
- Criar etapas da obra
- Definir datas planejadas
- Ordenar execução

### ModalOrcamento.jsx
Modal para:
- Criar orçamentos
- Associar prestadores
- Rastrear valores

### ModalMaterial.jsx
Modal para:
- Adicionar materiais
- Definir quantidades
- Associar fornecedores

### ModalChecklist.jsx
Modal para:
- Criar checklists
- Definir descrições

### ModalComentario.jsx
Modal para:
- Adicionar comentários
- Classificar tipo de comentário

---

## 🚀 Como Usar

### 1. Acessar o Módulo
O módulo está disponível em: `Modulo_Facilities > GestaoObras.jsx`

### 2. Criar Novo Projeto
1. Clique em "Novo Projeto"
2. Preencha os dados principais:
   - Nome do projeto
   - Filial associada
   - Data início/conclusão
   - Orçamento total
   - Prioridade
3. Clique em "Salvar Projeto"

### 3. Adicionar Etapas
1. Selecione o projeto
2. Vá para a aba "Etapas"
3. Clique em "Nova Etapa"
4. Preencha os dados:
   - Número e nome da etapa
   - Descrição
   - Datas planejadas
   - Ordem de execução

### 4. Gerenciar Orçamentos
1. Na aba "Orçamentos"
2. Clique em "Novo Orçamento"
3. Defina:
   - Descrição do item
   - Valor estimado
   - Prestador responsável
4. Atualize com valores reais conforme gasto

### 5. Controlar Materiais
1. Na aba "Materiais"
2. Clique em "Adicionar Material"
3. Especifique:
   - Nome e quantidade
   - Valor unitário
   - Fornecedor
   - Data de entrega esperada

### 6. Criar Checklists
1. Na aba "Checklists"
2. Clique em "Novo Checklist"
3. Defina:
   - Título e descrição
   - Associar a etapa (opcional)
4. Adicione itens conforme necessário

### 7. Registrar Comentários
1. Na aba "Comentários"
2. Clique em "Adicionar Comentário"
3. Classifique o tipo:
   - Observação
   - Alerta
   - Problema
   - Sugestão
   - Nota Importante

---

## 📊 Recursos Avançados

### Filtros e Busca
- **Buscar por nome**: Digite o nome do projeto para filtrar
- **Filtrar por status**: Escolha entre Planejamento, Em Execução, Parado, Concluído
- **Filtrar por prioridade**: Selecione Baixa, Normal, Alta ou Crítica

### Indicadores Visuais
- **Barra de progresso**: Percentual de conclusão do projeto/etapa
- **Badges de status**: Cores diferentes para cada status
- **Comparativo orçamentário**: Orçamento vs. Custo real

### Relatórios Potenciais
Dados preparados para gerar:
- Relatório de custos por etapa
- Evolução temporal do projeto
- Análise de desvios orçamentários
- Comparativo com cronograma planejado

---

## 🔒 Permissões e Segurança

- Autenticação obrigatória via `authMiddleware`
- Rastreamento de usuário criador
- Auditar é automático em `created_at` e `updated_at`
- Recomendações:
  - Gestores podem criar/editar projetos
  - Supervisores podem atualizar status e progresso
  - Todos podem visualizar e comentar

---

## 📝 Próximos Passos (Melhorias Futuras)

- [ ] Integração com importação de arquivos (plantas, orçamentos)
- [ ] Relatórios em PDF
- [ ] Dashboard com KPIs de todas as obras
- [ ] Notificações automáticas de atrasos
- [ ] Integração com prestadores de serviço
- [ ] Histórico de alterações
- [ ] Exportar para Excel
- [ ] Gráficos de Gantt
- [ ] Integração com sistemas de pagamento
- [ ] App mobile para acompanhamento em obra

---

## 🆘 Troubleshooting

### Problema: Etapas não carregam
**Solução**: Verifique se o projeto foi salvo corretamente e recarregue a página

### Problema: Erro ao salvar orçamento
**Solução**: Certifique-se de que um projeto está selecionado antes de criar

### Problema: Materiais com valores zerados
**Solução**: Verifique se quantidade e valor unitário foram preenchidos corretamente

---

## 📞 Suporte

Para dúvidas ou sugestões sobre o módulo, consulte a documentação da API ou entre em contato com a equipe de desenvolvimento.
