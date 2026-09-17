# Vértice Auditor Fiscal 🚀
> Plataforma Inteligente de Inteligência Tributária, Auditoria Digital & BPO Financeiro.

Este repositório contém a aplicação completa **Vértice Auditor Fiscal**, desenvolvida com uma arquitetura robusta Full-Stack (React 18 + Vite + Express + Node.js) em TypeScript, totalmente otimizada para performance, conformidade fiscal brasileira e alta entregabilidade.

---

## 🛠️ Tecnologias Utilizadas

### Frontend (SPA)
- **React 18** com **Vite** (Build ultrarrápido)
- **Tailwind CSS** (Estilização utilitária e design system limpo)
- **Framer Motion** (Transições e micro-interações fluidas)
- **Recharts** & **D3.js** (Visualização analítica de dados contábeis e fiscais)
- **Lucide React** (Ícones modernos e consistentes)

### Backend (API & Serviços)
- **Express / Node.js** (Servidor backend escalável)
- **ImapFlow** & **Mailparser** (Integração direta e segura com o protocolo IMAP)
- **Nodemailer** (Disparo via SMTP Umbler seguro)
- **SendGrid API** (Envio transacional alternativo de alta reputação)
- **Google GenAI SDK** (Inteligência Artificial para simulações e diagnósticos tributários)

---

## ⚙️ Variáveis de Ambiente (`.env`)

Para o correto funcionamento do sistema de e-mails, recebimento automático e IA, crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# API de Inteligência Artificial
GEMINI_API_KEY="SUA_CHAVE_GEMINI_AQUI"

# URL de Hospedagem
APP_URL="http://localhost:3000"

# Gateway de Envio Transacional (Opcional - Alternativa ao SMTP)
SENDGRID_API_KEY="SUA_CHAVE_SENDGRID_AQUI"

# Credenciais de Envio (SMTP Umbler)
UMBLER_SMTP_HOST="smtp.umbler.com"
UMBLER_SMTP_PORT="587"
UMBLER_SMTP_USER="contato@verticeanalises.com.br"
UMBLER_SMTP_PASS="SUA_SENHA_DO_EMAIL_AQUI"

# Credenciais de Leitura (IMAP Umbler)
UMBLER_IMAP_HOST="imap.umbler.com"
UMBLER_IMAP_PORT="993"
UMBLER_IMAP_USER="contato@verticeanalises.com.br"
UMBLER_IMAP_PASS="SUA_SENHA_DO_EMAIL_AQUI"
```

---

## 🚀 Como Executar o Projeto Localmente

### 1. Instalar as dependências
```bash
npm install
```

### 2. Executar em modo de desenvolvimento (Live Reload)
```bash
npm run dev
```
O servidor iniciará automaticamente em: **`http://localhost:3000`**

### 3. Compilar para Produção (Build unificado)
```bash
npm run build
```
Este comando executa a compilação completa dos assets estáticos do React e empacota o backend de forma limpa em `dist/server.cjs`.

### 4. Executar em Produção
```bash
npm start
```

---

## 📂 Estrutura de Pastas Principal

```text
├── dist/                  # Artefatos compilados de produção (React + Server)
├── src/
│   ├── components/        # Componentes visuais React reutilizáveis
│   │   ├── UmblerWebmailModule.tsx  # Caixa de Entrada e Gestão de E-mails
│   │   └── SupportContactModal.tsx  # Modal de Atendimento Fale Conosco
│   ├── utils/             # Serviços auxiliares e autenticação
│   ├── App.tsx            # Componente de controle principal do React
│   └── main.tsx           # Ponto de entrada do Frontend
├── server.ts              # Backend Express, rotas SMTP/IMAP e integrações
├── package.json           # Dependências e scripts de execução
├── vite.config.ts         # Configuração de bundler e HMR
└── .gitignore             # Arquivos ignorados no commit do Git
```

---

## 🔒 Segurança e Boas Práticas
- **Não commite arquivos `.env`**: O arquivo `.gitignore` já está configurado para proteger suas credenciais de SMTP, IMAP e chaves de API.
- **Assinatura Global Padronizada**: Todas as respostas utilizam a identidade institucional `Equipe Vértice Auditor Fiscal`.
