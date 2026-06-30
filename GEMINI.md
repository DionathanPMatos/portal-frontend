# Diretrizes do Projeto - Antigravity Config (Portal DCA)

Este arquivo contém as diretrizes arquiteturais, o escopo de negócios e as restrições técnicas do Portal DCA (Delta Cable Americas). Os agentes do Antigravity devem consultar este documento antes de planejar ou executar qualquer alteração no código para evitar desperdício de tokens e garantir a segurança do sistema.

---

## 🏢 1. Visão Geral e Escopo de Negócios
* **Nome do Projeto:** Portal DCA (Comercial e Repositório Técnico)
* **Objetivo:** Plataforma corporativa para gerenciamento de projetos de infraestrutura, segurança eletrônica, desenvolvimento de redes e centralização de documentos técnicos.
* **Módulo de IA Interna:** O sistema conta com uma arquitetura RAG (Retrieval-Augmented Generation) projetada para ler exclusivamente os manuais de infraestrutura, normas de certificação de CFTV e repositórios dos setores internos.

---

## 🛠️ 2. Stack Tecnológico e Padrões de Desenvolvimento
O agente deve respeitar as seguintes tecnologias ao propor soluções:

* **Frontend:** React (com suporte a módulos em FlutterFlow, quando aplicável).
* **Backend:** Node.js para construção das APIs e lógicas de negócio.
* **Estilização e UI:** Foco no uso de CSS personalizado, criação de componentes CSS modulares, botões customizados e manipulação de assets SVG. 
* **Modelagem e Visualização:** O projeto pode interagir com conceitos de Digital Twin e visualizações espaciais para projetos de segurança (medições e parâmetros de AutoCAD/Blender com texturas PBR). A lógica visual deve ser tratada com isolamento no frontend.

---

## 🧠 3. Regras de Ouro do Assistente de IA (RAG)
Quando o agente for atuar no código do pipeline de Inteligência Artificial do portal:

* **Isolamento de Dados Estrito:** O código deve garantir que a IA do portal responda **apenas** com base nos documentos vetorizados presentes no sistema.
* **Proibição de Conhecimento Externo:** O prompt enviado para a API final do Gemini dentro do Node.js deve travar o modelo para nunca inventar especificações técnicas ou preencher lacunas com dados externos.
* **Tratamento de Exceções:** Se a informação não for encontrada nos repositórios técnicos vetorizados, o sistema deve ser codificado para retornar uma mensagem amigável indicando a ausência do dado.

---

## 🚫 4. Controle de Tokens e Eficiência (Instruções para o Antigravity)
* **Foco no Prompt:** NÃO faça varreduras completas no diretório para tarefas simples. Modifique apenas os arquivos explicitamente apontados no chat.
* **Ignorar Diretórios de Peso:** Pastas como `node_modules`, builds, bancos de vetores locais e diretórios contendo assets brutos de renderização 3D/texturas estão fora do escopo de leitura, salvo pedido explícito.
* **Aprovação Obrigatória:** Sempre apresente um *Implementation Plan* listando estritamente os arquivos que serão alterados antes de iniciar a escrita de qualquer código. 

---

## 📂 5. Mapa Estrutural de Diretórios
Para otimizar o tempo de busca e o consumo de tokens do agente:

* `src/frontend/` -> Interface de usuário, páginas, componentes CSS puros e assets SVG.
* `src/backend/` -> Controladores Node.js, rotas, regras de negócios e integrações de banco de dados.
* `src/ai_engine/` -> Scripts de ingestão de PDFs/documentos, conexão com o banco de vetores e chamadas à API do Gemini.
* `src/docs/` -> Repositórios de arquivos brutos, manuais de infraestrutura e anexos dos setores.

## 🔄 6. Workflows e Processos de Desenvolvimento
Siga estritamente os fluxos abaixo ao executar tarefas contínuas no projeto:

### Git e Versionamento (Padrão para repositórios como portal_dca)
* **Branches:** Não faça commits direto na `main`. Toda nova implementação deve ser feita em uma branch específica seguindo o padrão: `feature/nome-da-tarefa`, `bugfix/nome-do-erro` ou `docs/atualizacao-readme`.
* **Commits:** Utilize o padrão de Conventional Commits (ex: `feat: adiciona componente de botão CSS`, `fix: corrige timeout na API de Node.js`, `chore: atualiza dependências`).

### Fluxo de Criação de Novas Features (Frontend/Backend)
1. **Frontend (React):** Ao criar uma nova tela, isole o CSS personalizado e os SVGs em arquivos na mesma pasta do componente. Não altere os estilos globais a menos que seja explicitamente solicitado.
2. **Backend (Node.js):** Toda nova rota deve incluir validação de entrada, bloco de `try/catch` e ser testada isoladamente antes de ser integrada ao banco de dados.

### Pipeline de Deploy e Nuvem
* **Infraestrutura:** O sistema está preparado para rodar em ambientes de nuvem maduros (GCP, Azure ou AWS). Quaisquer scripts de automação gerados devem ser compatíveis com pipelines de CI/CD padrão (ex: GitHub Actions) e utilizar variáveis de ambiente.
* **Processamento RAG (IA):** Alterações no script de vetorização de PDFs devem ser testadas localmente antes de qualquer tentativa de deploy, para não corromper o banco de vetores de produção.