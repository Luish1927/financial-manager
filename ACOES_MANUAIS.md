# ⚠️ AÇÕES MANUAIS NECESSÁRIAS - FAZER ANTES DE CONECTAR

Este documento contém todas as ações que **VOCÊ** precisa fazer manualmente na Vercel e no Supabase antes de rodar o projeto.

---

## 📋 CHECKLIST RÁPIDO

- [ ] **Fase 1:** Deletar projeto na Vercel
- [ ] **Fase 1:** Deletar projeto no Supabase
- [ ] **Fase 2:** Criar novo projeto no Supabase
- [ ] **Fase 2:** Executar SQL para criar tabelas
- [ ] **Fase 2:** Obter connection string
- [ ] **Fase 2:** Criar arquivo .env local com a connection string
- [ ] **Aguardar:** Claude terminar configurações locais
- [ ] **Fase 6:** Instalar Vercel CLI globalmente
- [ ] **Fase 7:** Testar localmente
- [ ] **Fase 8:** Criar projeto na Vercel e configurar variáveis
- [ ] **Fase 9:** Testar em produção

---

## FASE 1: LIMPEZA TOTAL 🧹

### 1.1 Deletar Projeto na Vercel

1. Acesse https://vercel.com/dashboard
2. Encontre seu projeto atual (conta-em-paz ou financial-manager)
3. Clique no projeto
4. Vá em **Settings** (última opção do menu lateral)
5. Role até o final da página
6. Encontre a seção **"Delete Project"**
7. Clique em **"Delete"**
8. Digite o nome do projeto para confirmar
9. Clique em **"Delete"**

**✅ Confirmação:** O projeto não deve mais aparecer no seu dashboard da Vercel.

---

### 1.2 Deletar Projeto no Supabase

1. Acesse https://supabase.com/dashboard
2. Encontre o projeto `pzubwlrmvddinlwnencn` (ou conta-em-paz)
3. Clique no projeto
4. Vá em **Settings** (ícone de engrenagem no menu lateral)
5. Role até **"Danger Zone"** ou **"Delete project"**
6. Clique em **"Delete project"**
7. Digite o nome do projeto para confirmar
8. Clique em **"I understand, delete this project"**

**✅ Confirmação:** O projeto não deve mais aparecer no dashboard do Supabase.

---

## FASE 2: CRIAR NOVO SUPABASE 🆕

### 2.1 Criar Projeto Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em **"New project"** (botão verde)
3. Selecione sua organização (ou crie uma se não tiver)

4. **Preencha os campos:**
   - **Name:** `conta-em-paz` (ou nome que preferir)
   - **Database Password:**
     - Clique em **"Generate a password"** OU crie uma senha FORTE
     - **⚠️ IMPORTANTE: COPIE E SALVE ESSA SENHA IMEDIATAMENTE!** - 5mVQdBCwQzRQIJTw
     - Cole em um lugar seguro (bloco de notas, gerenciador de senhas)
   - **Region:** Escolha **South America (São Paulo)** (mais próximo do Brasil)
   - **Pricing Plan:** Free (já selecionado)

5. Clique em **"Create new project"**

6. **Aguarde 2-3 minutos** enquanto o Supabase provisiona o banco de dados
   - Você verá uma tela com "Setting up project..."
   - Aguarde até aparecer o dashboard completo

**✅ Confirmação:** Você deve ver o dashboard do projeto com abas Database, Table Editor, SQL Editor, etc.

---

### 2.2 Criar Tabelas no Banco de Dados

Agora vamos criar as 4 tabelas necessárias:

1. No dashboard do projeto, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New query"** (botão + no canto superior)
3. **Cole TODO o SQL abaixo** na área de texto:

```sql
-- Tabela users
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela categories
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

-- Tabela transactions
CREATE TABLE transactions (
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

-- Tabela user_settings
CREATE TABLE user_settings (
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

-- Criar políticas (Service role pode fazer tudo)
CREATE POLICY "Service role full access" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access" ON categories FOR ALL USING (true);
CREATE POLICY "Service role full access" ON transactions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON user_settings FOR ALL USING (true);
```

4. Clique em **"Run"** (ou pressione `Ctrl + Enter`)
5. Você deve ver: **"Success. No rows returned"**

**✅ Confirmação:**
- Clique em **"Table Editor"** no menu lateral
- Você deve ver 4 tabelas: `users`, `categories`, `transactions`, `user_settings`

---

### 2.3 Obter Connection String

Agora precisamos da connection string para conectar ao banco:

1. Clique em **"Settings"** (ícone de engrenagem no menu lateral)
2. Clique em **"Database"** (segunda opção)
3. Role até encontrar **"Connection string"**
4. Você verá várias abas: **Postgres**, **URI**, **JDBC**, etc.
5. **Clique na aba "URI"**
6. Você verá algo como:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
7. **Clique no ícone de olho 👁️** para revelar a senha
8. A connection string será atualizada com sua senha real:
   ```
   postgresql://postgres:suaSenhaReal123@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
9. **Clique no ícone de copiar 📋** para copiar a connection string COMPLETA

**✅ Confirmação:** Você deve ter uma string começando com `postgresql://postgres:` e terminando com `:5432/postgres`

---

### 2.4 Criar Arquivo .env Local

1. Abra o projeto no seu editor de código
2. **Na raiz do projeto**, crie um arquivo chamado `.env`
3. Cole o seguinte conteúdo:

```env
DATABASE_URL=COLE_SUA_CONNECTION_STRING_AQUI
JWT_SECRET=VAMOS_GERAR_DEPOIS
NODE_ENV=development
```

4. **Substitua `COLE_SUA_CONNECTION_STRING_AQUI`** pela connection string que você copiou no passo 2.3

5. Para gerar o `JWT_SECRET`, abra um terminal e execute:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. Copie o resultado e substitua `VAMOS_GERAR_DEPOIS`

**Exemplo final do .env:**
```env
DATABASE_URL=postgresql://postgres:abc123xyz@db.xpto.supabase.co:5432/postgres
JWT_SECRET=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f
NODE_ENV=development
```

**✅ Confirmação:** Arquivo `.env` existe na raiz do projeto com as 3 variáveis preenchidas.

---

## AGUARDE AQUI ⏸️

Neste ponto, **AGUARDE** o Claude terminar de executar todas as configurações locais:
- Deletar pasta backend/
- Atualizar código do /api
- Ajustar frontend
- Atualizar package.json

**Quando o Claude avisar que terminou**, continue para a Fase 6.

---

## FASE 6: INSTALAR VERCEL CLI 🔧

### 6.1 Instalar Vercel CLI Globalmente

Abra um terminal e execute:

```bash
npm install -g vercel
```

**✅ Confirmação:** Execute `vercel --version` e deve aparecer um número de versão (ex: `33.0.0`).

### 6.2 Login na Vercel (Opcional - pode fazer depois)

```bash
vercel login
```

Siga as instruções na tela para fazer login.

---

## FASE 7: TESTAR LOCALMENTE 🧪

### 7.1 Rodar o Backend (Vercel Dev)

Abra um terminal e execute:

```bash
vercel dev --listen 3000
```

**O que vai acontecer:**
- Vercel vai perguntar algumas coisas na primeira vez
- **"Set up and develop?"** → Digite `Y` e Enter
- **"Which scope?"** → Escolha sua conta (use setas e Enter)
- **"Link to existing project?"** → Digite `N` e Enter (não temos projeto ainda)
- **"What's your project's name?"** → Digite `conta-em-paz` e Enter
- **"In which directory is your code located?"** → Apenas Enter (usa o diretório atual)
- Vercel vai detectar automaticamente as configurações

**✅ Confirmação:** Você deve ver:
```
Ready! Available at http://localhost:3000
```

**⚠️ DEIXE ESTE TERMINAL RODANDO!** Não feche.

### 7.2 Rodar o Frontend (Vite)

Abra um **NOVO terminal** (deixe o anterior rodando) e execute:

```bash
npm run dev:frontend
```

**✅ Confirmação:** Você deve ver:
```
Local:   http://localhost:8080/
```

### 7.3 Acessar a Aplicação

1. Abra o navegador
2. Acesse `http://localhost:8080`
3. Você deve ver a tela de login/registro

### 7.4 Testar Funcionalidades (CHECKLIST)

Execute TODOS estes testes:

#### Autenticação:
- [ ] Criar nova conta (nome, email, senha)
- [ ] Verificar se redireciona para dashboard após registro
- [ ] Fazer logout
- [ ] Fazer login novamente
- [ ] Testar senha incorreta (deve dar erro)

#### Transações:
- [ ] Adicionar receita (income)
- [ ] Adicionar despesa (expense)
- [ ] Editar transação
- [ ] Deletar transação
- [ ] Verificar se totais estão corretos

#### Categorias:
- [ ] Ver categorias padrão (9 categorias)
- [ ] Adicionar categoria customizada
- [ ] Renomear categoria
- [ ] Deletar categoria

#### Configurações:
- [ ] Ver limite mensal (deve ser 0)
- [ ] Definir limite mensal
- [ ] Verificar se atualiza no dashboard

#### Validação no Supabase:
- [ ] Abrir Supabase → Table Editor
- [ ] Verificar tabela `users` (deve ter seu usuário)
- [ ] Verificar tabela `transactions` (deve ter transações criadas)
- [ ] Verificar tabela `categories` (deve ter categorias)

**✅ Se TUDO funcionar, prossiga para Fase 8. Se houver erro, copie o erro completo e mostre ao Claude.**

---

## FASE 8: DEPLOY NA VERCEL ☁️

### 8.1 Fazer Commit e Push

No terminal, execute:

```bash
git add .
git status
```

Verifique o que será commitado. Depois:

```bash
git commit -m "refactor: configurar projeto para Vercel + Supabase"
git push origin main
```

### 8.2 Criar Projeto na Vercel

1. Acesse https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Se seu repositório não aparecer, clique em **"Adjust GitHub App Permissions"**
4. Selecione o repositório `financial-manager`
5. Clique em **"Import"**

### 8.3 Configurar o Projeto

**Configure os seguintes campos:**

- **Project Name:** `conta-em-paz` (ou outro nome)
- **Framework Preset:** **Vite** (deve detectar automaticamente)
- **Root Directory:** `./` (deixe como está)
- **Build Command:** `npm run build` (deixe como está)
- **Output Directory:** `dist` (deixe como está)

**NÃO CLIQUE EM DEPLOY AINDA!**

### 8.4 Configurar Variáveis de Ambiente

1. **Expanda a seção "Environment Variables"**
2. Adicione as seguintes variáveis:

**Variável 1:**
- **Key:** `DATABASE_URL`
- **Value:** Cole a mesma connection string do Supabase que você usou no .env local
- **Environments:** Marque **Production**, **Preview** e **Development** (todas)

**Variável 2:**
- **Key:** `JWT_SECRET`
- **Value:** Gere uma NOVA chave (não use a mesma do local):
  - Abra um terminal
  - Execute: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - Copie o resultado
- **Environments:** Marque **Production**, **Preview** e **Development** (todas)

**Variável 3:**
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Environments:** Marque apenas **Production**

**✅ Confirmação:** Você deve ter 3 variáveis configuradas.

### 8.5 Deploy

1. Agora clique em **"Deploy"**
2. Aguarde 2-5 minutos (Vercel vai fazer build)
3. Você verá logs passando na tela
4. Quando terminar, verá: **"Congratulations!"** ou similar

**✅ Confirmação:** Você receberá uma URL do tipo `https://conta-em-paz.vercel.app`

---

## FASE 9: TESTAR EM PRODUÇÃO 🚀

### 9.1 Acessar o Site

1. Clique na URL fornecida pela Vercel
2. O site deve abrir (pode levar alguns segundos no primeiro acesso)

### 9.2 Testar Funcionalidades

**⚠️ IMPORTANTE:** Crie uma conta DIFERENTE da que você usou nos testes locais!

Execute TODOS os testes novamente:
- [ ] Criar nova conta
- [ ] Login/logout
- [ ] Adicionar/editar/deletar transações
- [ ] Adicionar/editar/deletar categorias
- [ ] Configurar limite mensal
- [ ] Recarregar página (dados devem persistir)

### 9.3 Verificar Logs

Se houver algum erro:

1. Volte para https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em **"Deployments"**
4. Clique no deployment mais recente
5. Clique em **"Functions"**
6. Procure por erros nos logs
7. Copie o erro completo e mostre ao Claude

### 9.4 Verificar Dados no Supabase

1. Acesse o Supabase dashboard
2. Vá em **Table Editor**
3. Verifique que há 2 usuários agora:
   - Um dos testes locais
   - Um dos testes em produção
4. Verifique transações e categorias de ambos

**✅ Se tudo funcionar, PARABÉNS! O projeto está 100% funcionando!**

---

## 🎉 CHECKLIST FINAL

- [ ] Projeto deletado na Vercel (antigo)
- [ ] Projeto deletado no Supabase (antigo)
- [ ] Novo projeto criado no Supabase
- [ ] Tabelas criadas no Supabase
- [ ] Connection string obtida
- [ ] Arquivo .env criado localmente
- [ ] Vercel CLI instalado
- [ ] Testes locais: TODOS funcionando ✅
- [ ] Deploy feito na Vercel
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Testes em produção: TODOS funcionando ✅
- [ ] Dados persistem no Supabase ✅

---

## 📝 INFORMAÇÕES IMPORTANTES PARA GUARDAR

### Connection String do Supabase:
```
postgresql://postgres:SUA_SENHA@db.XXXX.supabase.co:5432/postgres
```

### JWT Secret (Local):
```
[Cole aqui o JWT_SECRET que você gerou para desenvolvimento]
```

### JWT Secret (Produção):
```
[Cole aqui o JWT_SECRET diferente que você gerou para produção]
```

### URL da Aplicação (Vercel):
```
https://[SEU-PROJETO].vercel.app
```

---

## 🆘 SE ALGO DER ERRADO

### Erro de Conexão com Banco:
- Verifique se a connection string está correta (sem `[YOUR-PASSWORD]`)
- Verifique se as tabelas foram criadas no Supabase
- Verifique se a variável `DATABASE_URL` está configurada

### Erro de Build na Vercel:
- Verifique os logs em Deployments > Functions
- Copie o erro e mostre ao Claude

### Erro "Cannot find module 'pg'":
- Execute `npm install` novamente
- Verifique se `pg` está no `package.json`

### Site em branco ou erro 404:
- Verifique se o build da Vercel completou com sucesso
- Verifique se as variáveis de ambiente estão configuradas
- Aguarde alguns minutos e tente novamente

---

**Bom trabalho! Siga este guia passo a passo e tudo vai funcionar perfeitamente.** 🚀
