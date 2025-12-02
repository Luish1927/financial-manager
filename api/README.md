# 💰 Conta em Paz

Aplicação web de gerenciamento financeiro pessoal, construída com React + TypeScript e deploy na Vercel com banco de dados Supabase.

## 🚀 Tecnologias

- **Frontend:** React 18, TypeScript, Vite, shadcn/ui, TailwindCSS
- **Backend:** Vercel Serverless Functions
- **Banco de Dados:** PostgreSQL (Supabase)
- **Autenticação:** JWT (JSON Web Tokens)
- **Deploy:** Vercel

## 📋 Funcionalidades

- ✅ Autenticação de usuários (registro e login)
- ✅ Gerenciamento de transações (receitas e despesas)
- ✅ Categorização de transações
- ✅ Definição de limite mensal de gastos
- ✅ Dashboard com visualização de dados
- ✅ Gráficos e estatísticas financeiras

## 🛠️ Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com)
- Conta na [Vercel](https://vercel.com)
- Vercel CLI instalado globalmente: `npm install -g vercel`

## ⚙️ Configuração Local

Veja o guia completo em [ACOES_MANUAIS.md](./ACOES_MANUAIS.md)

### Resumo rápido:

1. Clone o repositório
2. Instale dependências: `npm install`
3. Crie arquivo `.env` com as variáveis (veja `.env.example`)
4. Configure banco de dados no Supabase
5. Rode localmente:
   - Terminal 1: `vercel dev --listen 3000`
   - Terminal 2: `npm run dev:frontend`
6. Acesse `http://localhost:8080`

## 🚢 Deploy na Vercel

1. Fazer commit e push
2. Criar projeto na Vercel importando o repositório
3. Configurar variáveis de ambiente (DATABASE_URL, JWT_SECRET, NODE_ENV)
4. Deploy

Veja instruções detalhadas em [ACOES_MANUAIS.md](./ACOES_MANUAIS.md)

## 📁 Estrutura do Projeto

```
conta-em-paz/
├── api/                    # Vercel Serverless Functions
│   ├── auth/              # Endpoints de autenticação
│   ├── transactions/      # Endpoints de transações
│   ├── categories/        # Endpoints de categorias
│   ├── settings/          # Endpoints de configurações
│   └── db.js              # Pool de conexão PostgreSQL
├── src/                   # Frontend React + TypeScript
│   ├── components/        # Componentes UI
│   ├── hooks/             # Custom hooks
│   └── pages/             # Páginas
├── .env.example          # Template de variáveis
└── vercel.json           # Configuração Vercel
```

## 📝 Scripts Disponíveis

```bash
npm run dev              # Roda Vercel Dev (backend + frontend)
npm run dev:frontend     # Roda apenas o frontend (Vite)
npm run build            # Build de produção
npm run preview          # Preview do build
npm run lint             # Lint do código
```

## 📚 Documentação

- [ACOES_MANUAIS.md](./ACOES_MANUAIS.md) - Guia passo a passo completo
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Supabase](https://supabase.com/docs)

---

**Desenvolvido com ❤️ usando React + Vercel + Supabase**
