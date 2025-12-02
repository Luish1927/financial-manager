# Conta em Paz - Gerenciador Financeiro

Sistema completo de gerenciamento financeiro pessoal com autenticação de usuários, controle de transações, categorias personalizadas e limite de gastos mensal.

## Funcionalidades

- Sistema de autenticação (registro e login)
- Gestão de transações (receitas e despesas)
- Categorias personalizadas
- Limite de gastos mensal com acompanhamento visual
- Dashboard com visão geral financeira
- Gráficos de visualização mensal e diária
- Filtro por categorias
- Interface responsiva

## Tecnologias

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- shadcn/ui + Tailwind CSS
- Recharts (gráficos)
- React Hook Form + Zod (formulários)
- React Router (navegação)

### Backend
- Node.js + Express
- SQLite (banco de dados)
- JWT (autenticação)
- bcryptjs (criptografia)

## Instalação e Execução

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### 1. Backend

```bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor (modo desenvolvimento)
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 2. Frontend

```bash
# Na raiz do projeto
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:8080`

## Primeiro Uso

1. Acesse `http://localhost:8080`
2. Você será redirecionado para a tela de login
3. Clique em "Criar conta" e preencha os dados
4. Após o registro, você será automaticamente logado
5. Comece a adicionar suas transações!

## Estrutura do Projeto

```
conta-em-paz/
├── backend/              # Servidor Node.js
│   ├── database/        # Banco de dados SQLite
│   ├── middleware/      # Middleware de autenticação
│   ├── routes/          # Rotas da API
│   └── server.js        # Servidor principal
├── src/                 # Frontend React
│   ├── components/      # Componentes React
│   ├── contexts/        # Context API (Auth)
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Páginas/Rotas
│   └── types/           # TypeScript types
└── README.md
```

## API Endpoints

Veja a documentação completa da API em `backend/README.md`

### Principais endpoints:
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login
- `GET /api/transactions` - Listar transações
- `POST /api/transactions` - Criar transação
- `GET /api/categories` - Listar categorias
- `PUT /api/settings/monthly-limit` - Atualizar limite mensal

## Recursos

- Autenticação JWT com token de 7 dias
- Dados isolados por usuário
- Persistência em banco de dados SQLite
- Validação de formulários
- Tratamento de erros
- Toast notifications
- Interface responsiva

## Desenvolvimento

### Frontend
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
```

### Backend
```bash
npm run dev      # Desenvolvimento com nodemon
npm start        # Produção
```

## Deploy

### Deploy Simplificado (Frontend + Backend na Vercel)

Este projeto está configurado para deploy completo na Vercel com backend integrado via Serverless Functions.

**⚠️ IMPORTANTE:** SQLite em ambiente serverless é efêmero. Para produção real, migre para PostgreSQL, MySQL ou MongoDB.

**Guia completo:** Veja [DEPLOY.md](./DEPLOY.md) para instruções detalhadas.

**Quick Start:**

1. Faça push para GitHub/GitLab
2. Importe projeto na Vercel
3. Adicione variável de ambiente: `JWT_SECRET=sua_chave_aqui`
4. Deploy! 🚀

### Deploy Separado (Recomendado para Produção)

**Backend:**
- Railway (com PostgreSQL)
- Render (com PostgreSQL)
- Heroku
- AWS EC2 + RDS

**Frontend:**
- Vercel
- Netlify
- Lovable (https://lovable.dev/projects/0beb78a4-427a-4249-99cd-f7d0c6a96386)
- Cloudflare Pages

## Segurança

- Senhas criptografadas com bcrypt
- Autenticação via JWT
- Tokens armazenados no localStorage
- Rotas protegidas no backend
- Validação de dados no frontend e backend

## Próximos Passos

- Recuperação de senha
- Exportação de dados (CSV, PDF)
- Gráficos mais avançados
- Metas financeiras
- Notificações de limite
- Modo escuro
- PWA (Progressive Web App)

## Licença

MIT

## Lovable Project

**URL**: https://lovable.dev/projects/0beb78a4-427a-4249-99cd-f7d0c6a96386
