# 🚀 Guia de Deploy na Vercel

Este guia mostra como fazer o deploy do **Conta em Paz** na Vercel com backend e frontend integrados usando Vercel Postgres.

## ⚠️ Sobre este Setup

Este projeto usa Vercel Postgres, um banco de dados PostgreSQL gerenciado pela Vercel, ideal para:
- Demonstrações
- MVPs
- Testes
- Protótipos

**Características:**
- ✅ Banco de dados persistente (não efêmero como SQLite)
- ✅ Backup automático
- ✅ Sem preocupações com compilação de módulos nativos
- ✅ Escalável

**Plano gratuito:** 256MB de armazenamento, 60 horas de computação/mês

---

## 📋 Pré-requisitos

1. Conta na Vercel (gratuita): https://vercel.com
2. Repositório Git do projeto (GitHub, GitLab ou Bitbucket)
3. Git instalado localmente

---

## 🔧 Passo 1: Preparar o Repositório

### 1.1 Fazer commit das alterações

```bash
git add .
git commit -m "feat: adicionar suporte para deploy na Vercel com Postgres"
git push origin main
```

### 1.2 Verificar arquivos importantes

Certifique-se que estes arquivos existem:
- ✅ `vercel.json` (configuração da Vercel)
- ✅ `package.json` (com @vercel/postgres nas dependências)
- ✅ Pasta `api/` (funções serverless)

---

## 🗄️ Passo 2: Criar Banco de Dados Vercel Postgres

### 2.1 Via Dashboard da Vercel

1. Acesse https://vercel.com/dashboard
2. Clique em **"Storage"** no menu lateral
3. Clique em **"Create Database"**
4. Escolha **"Postgres"**
5. Digite um nome para o banco (ex: `conta-em-paz-db`)
6. Escolha a região mais próxima de você
7. Clique em **"Create"**

### 2.2 Importante

A Vercel criará automaticamente as variáveis de ambiente:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

Essas variáveis serão injetadas automaticamente nas suas funções serverless! ✅

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
   | `JWT_SECRET` | `sua_chave_secreta_super_segura_mude_aqui` |
   | `NODE_ENV` | `production` |

   ⚠️ **IMPORTANTE:** Crie uma chave JWT_SECRET forte e única!

   Você pode gerar uma com:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Conectar ao Banco de Dados:**

   - Na mesma tela de "Environment Variables"
   - Clique em **"Connect Store"** (ou "Add")
   - Selecione o banco Postgres que você criou no Passo 2
   - As variáveis do Postgres serão adicionadas automaticamente!

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

### Via Dashboard da Vercel

1. Vá em **Storage** > seu banco Postgres
2. Clique em **"Data"** para ver tabelas e dados
3. Clique em **"Query"** para executar SQL
4. Use **"Backups"** para criar/restaurar backups manuais

### Executar Queries SQL:

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

### Erro: "relation users does not exist"

**Causa:** Tabelas não foram criadas no banco.

**Solução:**
1. A aplicação cria as tabelas automaticamente no primeiro acesso
2. Ou crie manualmente via Query no dashboard:
   - Vá em Storage > seu banco > Query
   - Execute o SQL de criação das tabelas (veja `api/db.js`)

### Erro: "Connection string is not defined"

**Causa:** Variáveis de ambiente do Postgres não configuradas.

**Solução:**
1. Vá em Project Settings > Environment Variables
2. Certifique-se que as variáveis POSTGRES_* estão presentes
3. Se não estiverem, clique em "Connect Store" e conecte ao banco

### Dados não persistem

**Causa:** Banco não conectado ou credenciais incorretas.

**Solução:**
1. Verifique logs em Deployments > Functions
2. Procure por erros de conexão
3. Confirme que as variáveis POSTGRES_* estão corretas

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

### Métricas do Banco:

1. Vá em **Storage** > seu banco
2. Veja **"Usage"** para:
   - Espaço usado
   - Queries executadas
   - Conexões ativas

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

## 💡 Alternativas ao Vercel Postgres

Se precisar de mais recursos ou preferir outras opções:

### Supabase (PostgreSQL)
- Plano gratuito: 500MB + 2GB de transferência
- Inclui autenticação, storage e realtime
- URL: https://supabase.com

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

Para usar estas alternativas:
1. Crie o banco no serviço escolhido
2. Adicione a connection string como variável `POSTGRES_URL` (ou `DATABASE_URL`)
3. Ajuste `api/db.js` se necessário para o formato da connection string

---

**Seu projeto está pronto para o mundo! 🚀**
