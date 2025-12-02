# 📋 Resumo da Sessão - Deploy Supabase + Vercel

**Data:** 02/12/2025
**Projeto:** Gerenciador Financeiro (conta-em-paz)
**Status Final:** ✅ Funcionando 100% em produção!

---

## 🎯 Objetivo da Sessão

Resolver problemas de conexão com Supabase e fazer o deploy completo na Vercel, incluindo funcionalidades de edição e deleção que não estavam funcionando.

---

## 🐛 Problemas Encontrados e Soluções

### Problema 1: Erro de Conexão - `ENETUNREACH` (IPv6)

**Erro:**
```
connect ENETUNREACH 2600:1f1e:75b:4b11:436c:f568:22a1:1fe5:5432
```

**Causa:**
- Conexão PostgreSQL direta (`pg` package) tentava usar IPv6
- Rede local (dados móveis + WSL2) não suportava IPv6
- Supabase não aceita conexões IPv4 diretas

**Solução:**
- Migrar de `pg` (PostgreSQL direto) para `@supabase/supabase-js` (HTTPS)
- Usar Supabase Client que funciona via API REST (compatível com qualquer rede)

**Arquivos modificados:**
- `api/db.js` - Substituiu Pool PostgreSQL por createClient Supabase
- Todos os handlers em `api/auth/`, `api/categories/`, `api/transactions/`, `api/settings/`
- Convertidos de queries SQL para métodos do Supabase (.from(), .select(), .insert(), etc)

**Variáveis de ambiente alteradas:**
```env
# ANTES:
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres

# DEPOIS:
SUPABASE_URL=https://wuasyqjpbvepjjfzfxfu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Problema 2: Rotas do Frontend Apontando para Porta Errada

**Erro:**
```
ERR_CONNECTION_REFUSED localhost:5173/api/...
ERR_CONNECTION_REFUSED localhost:3001/api/...
```

**Causa:**
- Frontend (Vite) roda na porta 8080
- Backend (Vercel Dev) roda na porta 3000
- Frontend estava chamando portas 5173 e 3001 (incorretas)

**Solução:**
- Atualizar `src/hooks/useApi.ts` linha 9
- Atualizar `src/pages/Auth.tsx` linha 28
- Ambos agora usam `http://localhost:3000` em desenvolvimento

**Antes:**
```typescript
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5173/api';
const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';
```

**Depois:**
```typescript
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';
const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';
```

---

### Problema 3: Erro 405 (Method Not Allowed) em Rotas Dinâmicas

**Erro:**
```
PUT /api/transactions/3 405 (Method Not Allowed)
DELETE /api/transactions/2 405 (Method Not Allowed)
```

**Causa:**
- `vercel.json` tinha uma reescrita que capturava TODAS as rotas: `"source": "/api/(.*)"`
- Isso fazia com que requisições PUT/DELETE para `/api/transactions/[id]` fossem redirecionadas para `/index.html`
- A Vercel não executava as funções serverless, retornava HTML

**Solução:**
- Modificar `vercel.json` para EXCLUIR rotas `/api/` da reescrita
- Usar regex negativo: `"source": "/((?!api/.*).*)"` (significa: "qualquer coisa QUE NÃO comece com api/")

**vercel.json final:**
```json
{
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" }
      ]
    }
  ]
}
```

---

## 📁 Estrutura de Rotas da API

### Rotas Dinâmicas (Vercel Serverless Functions)

A Vercel usa a estrutura de pastas para criar rotas automaticamente:

**Arquivos com colchetes = parâmetros dinâmicos:**
```
api/transactions/[id].js    → /api/transactions/:id  (ex: /api/transactions/123)
api/categories/[name].js    → /api/categories/:name  (ex: /api/categories/Alimentação)
```

**Como funciona:**
1. Cliente faz: `DELETE /api/transactions/123`
2. Vercel identifica que existe `api/transactions/[id].js`
3. Passa o valor `123` em `req.query.id`
4. Função executa e retorna resposta

**Tentativa que NÃO funcionou:**
- Renomear para `_id.js` e usar query params `?id=123`
- Motivo: Vercel não reconheceu como rota válida (404)

---

## 🔧 Configurações Finais

### Variáveis de Ambiente na Vercel

No dashboard da Vercel (Settings → Environment Variables):

```
SUPABASE_URL = https://wuasyqjpbvepjjfzfxfu.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET = (gerar com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NODE_ENV = production (apenas em Production)
```

### Arquivo .env Local

```env
SUPABASE_URL=https://wuasyqjpbvepjjfzfxfu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=7034cef8e29b7b8e7ef952ad300cb0df6efcb6d3aed956eb18e9060a6048003a
NODE_ENV=development
```

---

## 📦 Pacotes Instalados

```bash
npm install @supabase/supabase-js
```

**Dependências principais:**
- `@supabase/supabase-js` - Cliente Supabase (HTTPS)
- `pg` - PostgreSQL (mantido como fallback no código, mas não usado)
- `bcryptjs` - Hash de senhas
- `jsonwebtoken` - Autenticação JWT

---

## 🚀 Como Rodar o Projeto

### Desenvolvimento Local

**Terminal 1 - Backend (Vercel Dev):**
```bash
vercel dev --listen 3000
```

**Terminal 2 - Frontend (Vite):**
```bash
npm run dev:frontend
```

**Acessar:** http://localhost:8080

### Produção

**Deploy automático via Git:**
```bash
git add -A
git commit -m "mensagem"
git push origin main
```

Vercel faz deploy automaticamente em ~2-3 minutos.

**URL:** https://conta-em-paz.vercel.app

---

## ✅ Funcionalidades Testadas e Funcionando

- ✅ Registro de usuário
- ✅ Login
- ✅ Adicionar transação (receita/despesa)
- ✅ **Editar transação** (estava com erro 405, RESOLVIDO)
- ✅ **Deletar transação** (estava com erro 405, RESOLVIDO)
- ✅ Listar transações
- ✅ Adicionar categoria
- ✅ **Editar categoria** (estava com erro 405, RESOLVIDO)
- ✅ **Deletar categoria** (estava com erro 405, RESOLVIDO)
- ✅ Configurar limite mensal
- ✅ Dashboard com gráficos
- ✅ Persistência de dados no Supabase

---

## 📚 Conceitos Importantes

### 1. Por que Supabase Client ao invés de PostgreSQL direto?

**PostgreSQL direto (`pg` package):**
- Conecta na porta 5432 (porta do banco de dados)
- Requer suporte IPv4 ou IPv6
- Mais rápido (conexão direta)
- ❌ Não funciona em redes restritivas (dados móveis, WSL2 sem IPv6)

**Supabase Client (`@supabase/supabase-js`):**
- Conecta via HTTPS (porta 443)
- Funciona em qualquer rede (mesmo com firewall/NAT)
- API REST por baixo dos panos
- ✅ Compatível com navegadores e ambientes serverless

### 2. Como funcionam rotas `[id].js` e `[name].js`?

São **rotas dinâmicas** da Vercel:

**Exemplo prático:**
```javascript
// Arquivo: api/transactions/[id].js
export default async function handler(req, res) {
  const { id } = req.query;  // Pega o valor dinâmico

  if (req.method === 'DELETE') {
    // Deletar transação com ID = id
  }
}
```

**Requisição:**
```
DELETE /api/transactions/123
```

**O que acontece:**
1. Vercel identifica que `/api/transactions/123` corresponde ao padrão `/api/transactions/[id]`
2. Executa `api/transactions/[id].js`
3. Passa `{ id: "123" }` em `req.query`

### 3. O que é `vercel.json` e para que serve?

Arquivo de configuração da Vercel que define:

**Rewrites (redirecionamentos):**
```json
"rewrites": [
  {
    "source": "/((?!api/.*).*)",  // Qualquer rota QUE NÃO seja /api/*
    "destination": "/index.html"   // Redireciona para SPA
  }
]
```

Isso faz com que:
- `/` → `/index.html`
- `/dashboard` → `/index.html` (React Router cuida das rotas)
- `/api/transactions` → NÃO redireciona (executa função serverless)

**Headers (CORS):**
```json
"headers": [
  {
    "source": "/api/(.*)",
    "headers": [
      { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE" }
    ]
  }
]
```

Permite que o frontend faça requisições PUT/DELETE para a API.

---

## 🔗 Links Úteis

**Projeto:**
- Frontend em Produção: https://conta-em-paz.vercel.app
- Dashboard Vercel: https://vercel.com/dashboard
- Dashboard Supabase: https://supabase.com/dashboard
- Repositório GitHub: https://github.com/Luish1927/financial-manager

**Documentação:**
- Vercel Serverless Functions: https://vercel.com/docs/functions
- Supabase Client JS: https://supabase.com/docs/reference/javascript
- Vercel.json Reference: https://vercel.com/docs/projects/project-configuration

---

## 🎓 Perguntas para Aprender Mais

Se quiser se aprofundar, pesquise sobre:

1. **Como funciona CORS e preflight requests (OPTIONS)?**
2. **Diferença entre Session Pooling e Transaction Pooling no Supabase?**
3. **O que são Serverless Functions e como a Vercel as executa?**
4. **Row Level Security (RLS) no Supabase - está configurado?**
5. **Como debugar problemas de deploy na Vercel (Runtime Logs)?**

---

## 🐛 Troubleshooting Futuro

### Se der erro 405 novamente:
1. Verifique `vercel.json` - a reescrita não deve capturar `/api/*`
2. Verifique se os arquivos são `[id].js` e não `_id.js` ou `id.js`
3. Cheque os logs da Vercel: Dashboard → Deployments → Functions

### Se der erro de conexão com Supabase:
1. Verifique se `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão configuradas
2. Confira no Supabase Dashboard → Settings → API se as chaves estão corretas
3. Verifique se as tabelas existem: Table Editor

### Se der erro CORS:
1. Verifique `api/auth-middleware.js` - função `handleCors`
2. Cheque `vercel.json` - headers devem incluir `PUT` e `DELETE`
3. Teste com `curl -X OPTIONS http://localhost:3000/api/transactions/1`

---

## 🎉 Resumo Final

**O que funcionou:**
- Migração completa para Supabase Client (resolve problema de rede)
- Configuração correta do `vercel.json` (resolve erro 405)
- Todas as funcionalidades CRUD funcionando em produção

**Commits importantes:**
```bash
git log --oneline
# f25d958 fix: reverter para rotas com path params [id] e [name]
# b475cb7 fix: excluir rotas /api/ da reescrita para index.html
# 15970c1 fix: usar rotas com query params ao invés de path params
# aff0681 feat: migrar para Supabase Client (HTTPS)
```

**Próximos passos sugeridos:**
- [ ] Configurar RLS (Row Level Security) no Supabase para maior segurança
- [ ] Adicionar testes automatizados
- [ ] Implementar cache para melhorar performance
- [ ] Configurar domínio customizado na Vercel

---

**Sessão concluída com sucesso!** 🚀✨
