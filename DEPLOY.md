# 🚀 Guia de Deploy na Vercel com Supabase

Este guia mostra como fazer o deploy do **Conta em Paz** na Vercel com backend e frontend integrados usando Supabase como banco de dados.

## ⚠️ Sobre este Setup

Este projeto usa Supabase, uma plataforma de banco de dados PostgreSQL open-source, ideal para:
- Aplicações em produção
- MVPs
- Projetos escaláveis
- Desenvolvimento rápido

**Características:**
- ✅ Banco de dados PostgreSQL gerenciado
- ✅ Backup automático
- ✅ Autenticação integrada (não usado neste projeto)
- ✅ Row Level Security (RLS)
- ✅ Escalável

**Plano gratuito:** 500MB de banco de dados, 2GB de bandwidth/mês

---

## 📋 Pré-requisitos

1. Conta na Vercel (gratuita): https://vercel.com
2. Conta no Supabase (gratuita): https://supabase.com
3. Repositório Git do projeto (GitHub, GitLab ou Bitbucket)
4. Git instalado localmente

---

## 🔧 Passo 1: Preparar o Repositório

### 1.1 Instalar dependências atualizadas

```bash
npm install
```

### 1.2 Fazer commit das alterações

```bash
git add .
git commit -m "feat: configurar deploy com Supabase"
git push origin main
```

### 1.3 Verificar arquivos importantes

Certifique-se que estes arquivos existem:
- ✅ `vercel.json` (configuração da Vercel)
- ✅ `package.json` (com `pg` nas dependências)
- ✅ Pasta `api/` (funções serverless)
- ✅ `.env.example` (modelo de variáveis de ambiente)

---

## 🗄️ Passo 2: Configurar Banco de Dados no Supabase

### 2.1 Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Escolha uma organização ou crie uma nova
4. Preencha:
   - **Name:** `conta-em-paz` (ou nome de sua preferência)
   - **Database Password:** Crie uma senha forte (anote!)
   - **Region:** Escolha a mais próxima (ex: South America)
5. Clique em **"Create new project"**
6. Aguarde ~2 minutos enquanto o projeto é provisionado

### 2.2 Obter Connection String

1. No dashboard do projeto, vá em **Settings** → **Database**
2. Role até **Connection String**
3. Selecione a aba **URI**
4. Copie a connection string (formato: `postgresql://postgres:[YOUR-PASSWORD]@...`)
5. **Substitua `[YOUR-PASSWORD]` pela senha que você criou**

Exemplo:
```
postgresql://postgres:suaSenhaForte123@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

### 2.3 Criar as Tabelas

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole o SQL abaixo e clique em **Run**:

```sql
-- Criar tabela users
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela categories
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

-- Criar tabela transactions
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Criar tabela user_settings
CREATE TABLE IF NOT EXISTS user_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL,
  monthly_limit NUMERIC DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir acesso via service role
CREATE POLICY "Service role can do anything on users" ON users FOR ALL
USING (true);

CREATE POLICY "Service role can do anything on categories" ON categories
FOR ALL USING (true);

CREATE POLICY "Service role can do anything on transactions" ON
transactions FOR ALL USING (true);

CREATE POLICY "Service role can do anything on user_settings" ON
user_settings FOR ALL USING (true);
```

4. Verifique se as tabelas foram criadas em **Table Editor**

---

## 🌐 Passo 3: Deploy na Vercel

### Opção A: Via Website (Recomendado)

1. Acesse https://vercel.com e faça login

2. Clique em **"Add New Project"**

3. Importe seu repositório do GitHub/GitLab

4. Configure o projeto:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (raiz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Adicione as variáveis de ambiente:**

   Clique em "Environment Variables" e adicione:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Cole a connection string do Supabase (Passo 2.2) |
   | `JWT_SECRET` | Gere uma chave forte (comando abaixo) |
   | `NODE_ENV` | `production` |

   ⚠️ **IMPORTANTE:**
   - A `DATABASE_URL` é a connection string completa do Supabase com sua senha
   - Crie uma chave `JWT_SECRET` forte e única!

   Gere uma chave JWT_SECRET com:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Exemplo de variáveis:
   ```
   DATABASE_URL=postgresql://postgres:suaSenha@db.xxx.supabase.co:5432/postgres
   JWT_SECRET=a1b2c3d4e5f6...
   NODE_ENV=production
   ```

7. Clique em **"Deploy"**

8. Aguarde 2-5 minutos para o build completar

9. Acesse o link fornecido (ex: `https://seu-projeto.vercel.app`)

### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Adicionar variáveis de ambiente
vercel env add JWT_SECRET
# Cole sua chave secreta quando solicitado

vercel env add NODE_ENV
# Digite: production

# Conectar ao banco Postgres
vercel link
vercel env pull

# Deploy em produção
vercel --prod
```

---

## ✅ Passo 4: Testar o Deploy

1. Acesse a URL do seu projeto na Vercel

2. Você será redirecionado para `/auth`

3. Crie uma conta de teste

4. Adicione algumas transações

5. Teste todas as funcionalidades

6. Atualize a página - os dados devem persistir! ✅

---

## 🔍 Verificar se funcionou

### Testar API diretamente:

```bash
# Substitua SEU_DOMINIO.vercel.app pelo seu domínio

# Criar conta
curl -X POST https://SEU_DOMINIO.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@email.com","password":"123456"}'

# Fazer login
curl -X POST https://SEU_DOMINIO.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"123456"}'
```

---

## 🗄️ Gerenciar Banco de Dados

### Via Dashboard do Supabase

1. Vá em **Table Editor** para ver e editar dados das tabelas
2. Vá em **SQL Editor** para executar queries SQL
3. Vá em **Database** > **Backups** para gerenciar backups (apenas no plano pago)

### Executar Queries SQL no Supabase:

```sql
-- Ver usuários
SELECT id, name, email, created_at FROM users;

-- Ver transações de um usuário
SELECT * FROM transactions WHERE user_id = 1 ORDER BY date DESC;

-- Ver limite mensal
SELECT * FROM user_settings WHERE user_id = 1;

-- Deletar dados de teste
DELETE FROM transactions WHERE user_id = 1;
DELETE FROM categories WHERE user_id = 1;
DELETE FROM user_settings WHERE user_id = 1;
DELETE FROM users WHERE id = 1;
```

---

## 🐛 Solução de Problemas

### ⚠️ Erro: "Server error (HTTP status 404): Not Found" (NeonDbError)

**Causa:** Estava usando `@vercel/postgres` ao invés de biblioteca compatível com Supabase.

**Solução:** ✅ **JÁ CORRIGIDO!** Agora o projeto usa a biblioteca `pg` que é compatível com Supabase.
- Execute `npm install` para atualizar as dependências
- Faça commit e push das alterações
- Reconfigure o deploy na Vercel com a variável `DATABASE_URL`

### Erro: "DATABASE_URL não definida"

**Causa:** Variável de ambiente `DATABASE_URL` não configurada na Vercel.

**Solução:**
1. Vá em Project Settings > Environment Variables na Vercel
2. Adicione a variável `DATABASE_URL` com a connection string do Supabase
3. Redeploy o projeto

### Erro: "relation users does not exist"

**Causa:** Tabelas não foram criadas no Supabase.

**Solução:**
1. Execute o SQL fornecido no Passo 2.3 no SQL Editor do Supabase
2. Verifique se as tabelas foram criadas em **Table Editor**
3. A aplicação também tenta criar as tabelas automaticamente no primeiro acesso

### Erro: "password authentication failed"

**Causa:** Senha incorreta na connection string.

**Solução:**
1. Verifique se substituiu `[YOUR-PASSWORD]` pela senha real do Supabase
2. Confira a senha em Settings > Database no Supabase
3. Se necessário, resete a senha do banco de dados

### Dados não persistem

**Causa:** Banco não conectado ou credenciais incorretas.

**Solução:**
1. Verifique logs em Deployments > Functions na Vercel
2. Procure por erros de conexão
3. Confirme que a variável `DATABASE_URL` está correta
4. Teste a connection string localmente

### Timeout nas requisições

**Solução:**
1. Em `vercel.json`, aumente `maxDuration` (máximo 10s no plano gratuito)
2. Otimize queries SQL
3. Use índices no banco de dados

---

## 📊 Monitoramento

### Ver Logs em Tempo Real:

1. Acesse seu projeto na Vercel
2. Vá em **"Deployments"**
3. Clique no deployment mais recente
4. Vá em **"Functions"** para ver logs das APIs

Ou via CLI:
```bash
vercel logs
```

### Métricas do Banco no Supabase:

1. Vá em **Settings** > **Usage**
2. Veja métricas de:
   - Database size
   - Bandwidth utilizado
   - API requests

---

## 🔐 Segurança

### Recomendações:

1. **JWT_SECRET forte**: Use no mínimo 32 caracteres aleatórios

2. **Limite de conexões**: Vercel Postgres gerencia automaticamente

3. **HTTPS**: A Vercel fornece HTTPS automático ✅

4. **Variáveis de Ambiente**: Nunca commite secrets no Git

5. **CORS**: Configure domínios específicos em produção

6. **Backups**: Configure backups automáticos no dashboard

---

## 🔄 Atualizações

Para atualizar o projeto em produção:

```bash
# Faça suas alterações localmente
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

A Vercel fará deploy automático a cada push! 🎉

---

## 💾 Migração de Dados

### Exportar dados do SQLite local:

```bash
# No diretório backend/
sqlite3 database/conta-em-paz.db .dump > backup.sql
```

### Importar para Postgres:

1. Converta o SQL do SQLite para Postgres (ajuste sintaxe)
2. Execute via Query no dashboard da Vercel

---

## 📚 Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Limits do Plano Gratuito](https://vercel.com/docs/limits/overview)

---

## 🎯 Checklist Final

Antes de considerar "pronto para produção":

- [x] Migrar para banco de dados persistente (Vercel Postgres)
- [ ] Adicionar rate limiting
- [ ] Implementar logs estruturados
- [ ] Configurar monitoramento de erros (Sentry)
- [ ] Adicionar testes automatizados
- [ ] Configurar CI/CD
- [ ] Implementar backup de dados automático
- [ ] Adicionar recuperação de senha
- [ ] Configurar domínio customizado
- [ ] Implementar analytics

---

## 📞 Suporte

Problemas com o deploy?

1. Verifique os logs na Vercel (Deployments > Functions)
2. Confira se todas as variáveis de ambiente estão configuradas
3. Verifique a conexão com o banco em Storage
4. Teste localmente antes: `npm run build && npm run preview`

---

## 💡 Alternativas ao Supabase

Se preferir outras opções de banco de dados PostgreSQL:

### Neon (PostgreSQL)
- Plano gratuito: 512MB + auto-suspend
- Branching de banco de dados
- URL: https://neon.tech

### PlanetScale (MySQL)
- Plano gratuito: 5GB + 1 bilhão de leituras
- Branching de schema
- URL: https://planetscale.com

### Railway (PostgreSQL/MySQL)
- $5 de crédito gratuito/mês
- Deploy de backend também
- URL: https://railway.app

### Vercel Postgres
- Plano gratuito: 256MB + 60 horas de computação/mês
- Integrado com Vercel
- URL: https://vercel.com/storage/postgres

Para usar estas alternativas:
1. Crie o banco no serviço escolhido
2. Obtenha a connection string PostgreSQL
3. Configure a variável `DATABASE_URL` na Vercel com a nova connection string
4. O código já está compatível com qualquer PostgreSQL via biblioteca `pg`

---

**Seu projeto está pronto para o mundo! 🚀**
