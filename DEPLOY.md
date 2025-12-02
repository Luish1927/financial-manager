# 🚀 Guia de Deploy na Vercel

Este guia mostra como fazer o deploy do **Conta em Paz** na Vercel com backend e frontend integrados.

## ⚠️ Aviso Importante

Este setup coloca o backend SQLite junto com o frontend na Vercel. **Isso NÃO é recomendado para produção real** porque:

- O banco SQLite em `/tmp` é efêmero (os dados podem ser perdidos)
- Serverless functions têm timeout limitado
- Não há backup automático dos dados

**Use apenas para:**
- Demonstrações
- MVPs
- Testes
- Protótipos

**Para produção real, considere:**
- PostgreSQL (Supabase, Neon, Railway)
- MySQL (PlanetScale)
- MongoDB Atlas
- Outro serviço de banco de dados persistente

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
git commit -m "feat: adicionar suporte para deploy na Vercel"
git push origin main
```

### 1.2 Verificar arquivos importantes

Certifique-se que estes arquivos existem:
- ✅ `vercel.json` (configuração da Vercel)
- ✅ `package.json` (com dependências do backend)
- ✅ Pasta `api/` (funções serverless)

---

## 🌐 Passo 2: Deploy na Vercel

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

6. Clique em **"Deploy"**

7. Aguarde 2-5 minutos para o build completar

8. Acesse o link fornecido (ex: `https://seu-projeto.vercel.app`)

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

# Deploy em produção
vercel --prod
```

---

## ✅ Passo 3: Testar o Deploy

1. Acesse a URL do seu projeto na Vercel

2. Você será redirecionado para `/auth`

3. Crie uma conta de teste

4. Adicione algumas transações

5. Teste todas as funcionalidades

---

## 🔍 Verificar se funcionou

### Testar API diretamente:

```bash
# Substitua SEU_DOMINIO.vercel.app pelo seu domínio

# Health check (se você adicionar)
curl https://SEU_DOMINIO.vercel.app/api/health

# Criar conta
curl -X POST https://SEU_DOMINIO.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@email.com","password":"123456"}'
```

---

## 🐛 Solução de Problemas

### Erro: "Module not found: better-sqlite3"

**Solução:** A Vercel precisa compilar o better-sqlite3 nativamente.

1. Vá em Project Settings > General
2. Em "Node.js Version", selecione 18.x
3. Faça redeploy

### Erro: "Cannot find module 'api/db'"

**Solução:** Verifique se todos os arquivos na pasta `api/` usam extensão `.js`

### Dados sendo perdidos

**Explicação:** É esperado! O SQLite em serverless é efêmero.

**Soluções:**
- Use um banco de dados externo (Supabase, etc)
- Configure um serviço de backup periódico
- Migre para PostgreSQL

### Timeout nas requisições

**Solução:**
1. Em `vercel.json`, aumente `maxDuration` (máximo 10s no plano gratuito)
2. Otimize queries SQL
3. Use índices no banco de dados

---

## 📊 Monitoramento

### Ver Logs em Tempo Real:

1. Acesse seu projeto na Vercel
2. Vá em "Deployments"
3. Clique no deployment mais recente
4. Vá em "Functions" para ver logs das APIs

Ou via CLI:
```bash
vercel logs
```

### Métricas:

- Dashboard da Vercel mostra:
  - Número de requests
  - Tempo de resposta
  - Erros
  - Uso de bandwidth

---

## 🔐 Segurança

### Recomendações:

1. **JWT_SECRET forte**: Use no mínimo 32 caracteres aleatórios

2. **Rate Limiting**: Adicione proteção contra força bruta (não incluído neste MVP)

3. **HTTPS**: A Vercel fornece HTTPS automático ✅

4. **Variáveis de Ambiente**: Nunca commite secrets no Git

5. **CORS**: Configure domínios específicos em produção

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

## 💾 Migração para Banco Real (Recomendado)

### Opção 1: Supabase (PostgreSQL)

1. Crie conta em https://supabase.com
2. Crie um novo projeto
3. Use as credenciais de conexão
4. Substitua better-sqlite3 por pg
5. Atualize queries SQL para PostgreSQL

### Opção 2: PlanetScale (MySQL)

1. Crie conta em https://planetscale.com
2. Crie um database
3. Use mysql2 no lugar de better-sqlite3
4. Atualize queries para MySQL

### Opção 3: MongoDB Atlas

1. Crie conta em https://mongodb.com/atlas
2. Crie um cluster gratuito
3. Use mongoose
4. Reestruture as queries para NoSQL

---

## 📚 Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Limits do Plano Gratuito](https://vercel.com/docs/limits/overview)

---

## 🎯 Checklist Final

Antes de considerar "pronto para produção":

- [ ] Migrar para banco de dados persistente
- [ ] Adicionar rate limiting
- [ ] Implementar logs estruturados
- [ ] Configurar monitoramento de erros (Sentry)
- [ ] Adicionar testes automatizados
- [ ] Configurar CI/CD
- [ ] Implementar backup de dados
- [ ] Adicionar recuperação de senha
- [ ] Configurar domínio customizado
- [ ] Implementar analytics

---

## 📞 Suporte

Problemas com o deploy?

1. Verifique os logs na Vercel
2. Confira se todas as variáveis de ambiente estão configuradas
3. Teste localmente antes: `npm run build && npm run preview`

---

**Seu projeto está pronto para o mundo! 🚀**
