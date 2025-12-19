# ⚠️ VERIFICAÇÃO IMPORTANTE - Connection String do Supabase

## O Erro que Você Está Recebendo

```
Error: getaddrinfo ENOTFOUND db.pzubwlrmvddinlwnencn.supabase.co
```

Este erro significa que o hostname do Supabase não está sendo encontrado. Isso pode acontecer por:

1. **Projeto Supabase foi deletado ou pausado**
2. **Connection string incorreta**
3. **Projeto ainda está sendo provisionado**

## Como Verificar e Corrigir

### Passo 1: Verificar se o Projeto Existe

1. Acesse https://supabase.com/dashboard
2. Verifique se o projeto `pzubwlrmvddinlwnencn` existe e está ativo
3. Se não existir, você precisa criar um novo projeto

### Passo 2: Obter a Connection String Correta

**IMPORTANTE:** Use a connection string **CORRETA** do Supabase:

1. No dashboard do projeto, vá em **Settings** → **Database**
2. Role até **Connection String**
3. Você verá várias opções de connection string:

   **❌ NÃO USE:**
   - Transaction pooler (porta 6543)
   - Session pooler (porta 5432 via pooler)

   **✅ USE:**
   - **Direct connection** (porta 5432 - conexão direta)
   - Ou **URI** na aba correspondente

4. A string correta deve ter este formato:
   ```
   postgresql://postgres.pzubwlrmvddinlwnencn:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```

   Ou formato direto:
   ```
   postgresql://postgres:[PASSWORD]@db.pzubwlrmvddinlwnencn.supabase.co:5432/postgres
   ```

5. **Substitua `[PASSWORD]` pela senha real**

### Passo 3: Revelar a Senha

1. No mesmo lugar (Settings → Database)
2. A senha estará mascarada como `[YOUR-PASSWORD]`
3. Clique no ícone de olho (👁️) para revelar
4. Copie a connection string completa com a senha revelada

### Passo 4: Configurar na Vercel

1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. **DELETE** todas as variáveis antigas relacionadas a banco de dados:
   - `POSTGRES_URL` (se for do Vercel Postgres antigo)
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - Qualquer outra relacionada ao Vercel Postgres

4. **ADICIONE** a nova variável:
   - **Nome:** `DATABASE_URL`
   - **Valor:** A connection string completa do Supabase (com senha revelada)
   - **Environments:** Marque Production, Preview e Development

5. Clique em **Save**

### Passo 5: Forçar Redeploy

1. Vá em **Deployments** na Vercel
2. Clique nos 3 pontinhos (...) do último deployment
3. Clique em **Redeploy**
4. Marque a opção **"Use existing Build Cache"** como **DESMARCADA** (para forçar rebuild limpo)
5. Clique em **Redeploy**

## Se o Projeto Supabase Não Existe Mais

Se o projeto foi deletado ou não existe, você precisa criar um novo:

### Criar Novo Projeto Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em **New Project**
3. Preencha:
   - **Name:** conta-em-paz (ou outro nome)
   - **Database Password:** Crie uma senha FORTE e ANOTE
   - **Region:** South America (São Paulo) ou mais próximo
4. Clique em **Create new project**
5. Aguarde 2-3 minutos para provisionar

### Criar as Tabelas no Novo Projeto

1. Vá em **SQL Editor**
2. Clique em **New Query**
3. Cole e execute este SQL:

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

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Service role can do anything on users" ON users FOR ALL USING (true);
CREATE POLICY "Service role can do anything on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Service role can do anything on transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Service role can do anything on user_settings" ON user_settings FOR ALL USING (true);
```

4. Verifique se as tabelas foram criadas em **Table Editor**
5. Obtenha a nova connection string em **Settings** → **Database**
6. Configure na Vercel como descrito no Passo 4 acima

## Checklist Final

- [ ] Projeto Supabase existe e está ativo
- [ ] Connection string correta foi obtida (com senha revelada)
- [ ] Variável `DATABASE_URL` foi configurada na Vercel
- [ ] Variáveis antigas do Vercel Postgres foram removidas
- [ ] Redeploy foi feito sem cache
- [ ] Tabelas foram criadas no Supabase

## Testando Localmente (Opcional)

Você pode testar a connection string localmente antes de fazer deploy:

```bash
# Crie um arquivo .env na raiz do projeto
echo "DATABASE_URL=sua_connection_string_aqui" > .env

# Instale pg para teste
npm install

# Teste com Node.js
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT NOW()', (err, res) => { if (err) console.error(err); else console.log('✅ Conexão OK:', res.rows[0]); pool.end(); });"
```

Se aparecer "✅ Conexão OK", a string está correta!
