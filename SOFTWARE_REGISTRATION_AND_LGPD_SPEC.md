# DOSSIÊ TÉCNICO DE REGISTRO DE SOFTWARE E CONFORMIDADE LEGISLATIVA
## VÉRTICE AUDITOR FISCAL — Plataforma SaaS de Inteligência Tributária, Auditoria e Planejamento Fiscal

---

### 1. IDENTIFICAÇÃO DO SOFTWARE E PROPRIEDADE INTELECTUAL
* **Nome Comercial:** Vértice Auditor Fiscal
* **Versão:** 3.8.0-PRO
* **Segmento:** Tecnologia da Informação Aplicada à Contabilidade, Direito Tributário e Gestão Financeira (B2B / SaaS)
* **Finalidade:** Automação de diagnósticos tributários, comparativo de regimes (Simples Nacional vs. Lucro Presumido vs. Lucro Real), cálculo automatizado do Fator R (LC 123/06), simulação da Reforma Tributária (IVA Dual - EC 132/2023), BPO Financeiro e Auditoria Fiscal Inteligente apoiada por Inteligência Artificial (SDK Gemini).

---

### 2. ARQUITETURA TÉCNICA E ENGENHARIA DE SOFTWARE
O sistema foi desenvolvido sob uma arquitetura full-stack moderna e altamente resiliente:
- **Camada de Apresentação (Frontend):** React 18+, TypeScript, Tailwind CSS (Comfortable Dark Slate Theme), Recharts (Visualização analítica de dados e projeções), Lucide React.
- **Camada de Servidor e API (Backend):** Node.js / Express.js estruturado em rotas seguras `/api/*`.
- **Motor de Inteligência Artificial:** Integração via servidor com o SDK `@google/genai` para processamento de pareceres técnicos e auditoria preditiva, garantindo que credenciais e chaves de API jamais sejam expostas no navegador.
- **Camada de Persistência Híbrida:** Suporte a armazenamento local seguro (`localStorage` criptografado) e bancos de dados em nuvem para persistência de multi-inquilinos (*Multi-tenant*).

---

### 3. CONFORMIDADE COM A LGPD (LEI Nº 13.709/2018)
O Vértice Auditor Fiscal foi arquitetado desde sua concepção sob os princípios de *Privacy by Design* e *Privacy by Default*, atendendo rigorosamente à Lei Geral de Proteção de Dados:
1. **Minimização e Consentimento:** A coleta de dados corporativos e documentos fiscais (PDFs, balancetes, extratos e-CAC) ocorre exclusivamente mediante consentimento explícito do titular ou representante legal da empresa auditada.
2. **Criptografia e Segurança da Informação:** Dados sensíveis de faturamento, folha de pagamento e documentos fiscais são protegidos por criptografia em trânsito (HTTPS/TLS 1.3) e em repouso.
3. **Anonimização e Pseudonimização:** Relatórios e pareceres gerados podem ser anonimizados para fins de benchmark setorial e treinamento de modelos estatísticos.
4. **Direito ao Esquecimento (Eliminação de Dados):** O sistema possui rotinas automatizadas no módulo de gestão de empresas e contas que permitem a exclusão definitiva e irreversível (`Hard Delete`) de todos os registros e cache de auditoria vinculados a um CNPJ/CPF a pedido do titular.
5. **Portabilidade:** Funcionalidade nativa para exportação integral dos dados do cliente em formatos estruturados (JSON / CSV / PDF).

---

### 4. ARQUITETURA MULTIPLATAFORMA (WEB & MOBILE)
O ecossistema Vértice Auditor Fiscal está preparado para distribuição multiplataforma:
- **Aplicação Web Progressiva (PWA):** Suporte completo a instalação offline, Service Workers e manifest para execução direta em navegadores desktop e mobile.
- **Empacotamento Mobile Nativo (Android / iOS):** A base de código React/TypeScript pode ser compilada diretamente via **Capacitor** ou **React Native**, compartilhando 100% da lógica de negócio e motores de cálculo tributário com os aplicativos nativos para smartphones e tablets.

---

### 5. MODELO DE NEGÓCIOS E VISÃO CLIENTE HABILITADA PELO ESCRITÓRIO
O modelo comercial B2B adota uma estrutura piramidal de controle hierárquico:
1. **Visão Master (Administrador da Plataforma):** Gestão global de planos, assinaturas, faturamento, liberação de licenças e auditoria do sistema.
2. **Visão Escritório Contábil (Contador Sênior / Perito):**
   - O escritório possui autonomia total para cadastrar sua carteira de empresas clientes.
   - O contador realiza os diagnósticos tributários, executa simulações de Fator R, importa balancetes em PDF e audita a situação fiscal.
   - **Habilitação da Visão Cliente:** Com um único clique no painel de gestão de parceiros/empresas, o escritório cria e habilita o acesso restrito do cliente final.
3. **Visão Cliente Final (Acesso Consultivo):**
   - O cliente final (diretoria, sócio ou gestor financeiro) acessa com credenciais exclusivas restritas à sua empresa.
   - Visualiza em tempo real os laudos técnicos, pareceres da IA, gráficos de economia tributária e o status de conformidade, **sem acesso** às ferramentas de alteração de planos ou dados confidenciais de outros clientes do escritório.

---
*Dossiê técnico elaborado para fins de depósito de registro de programa de computador junto ao INPI e comercialização de licenças de uso de software.*
