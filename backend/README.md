# Conta em Paz - Backend

Backend do sistema de gerenciamento financeiro pessoal.

## Tecnologias

- Node.js + Express
- SQLite (banco de dados)
- JWT (autenticação)
- bcryptjs (criptografia de senhas)

## Instalação

1. Navegue até a pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e altere o `JWT_SECRET` para uma chave segura em produção.

## Executar

### Modo de desenvolvimento (com hot reload):
```bash
npm run dev
```

### Modo de produção:
```bash
npm start
```

O servidor estará disponível em `http://localhost:3001`

## Endpoints da API

### Autenticação

- **POST** `/api/auth/register` - Criar nova conta
  ```json
  {
    "name": "Nome do Usuário",
    "email": "email@exemplo.com",
    "password": "senha123"
  }
  ```

- **POST** `/api/auth/login` - Fazer login
  ```json
  {
    "email": "email@exemplo.com",
    "password": "senha123"
  }
  ```

- **GET** `/api/auth/verify` - Verificar token (requer autenticação)

### Transações (todas requerem autenticação)

- **GET** `/api/transactions` - Listar todas as transações
- **POST** `/api/transactions` - Criar nova transação
- **PUT** `/api/transactions/:id` - Atualizar transação
- **DELETE** `/api/transactions/:id` - Deletar transação

### Categorias (todas requerem autenticação)

- **GET** `/api/categories` - Listar categorias
- **POST** `/api/categories` - Criar categoria
- **PUT** `/api/categories/:oldName` - Renomear categoria
- **DELETE** `/api/categories/:name` - Deletar categoria

### Configurações (todas requerem autenticação)

- **GET** `/api/settings` - Obter configurações (limite mensal)
- **PUT** `/api/settings/monthly-limit` - Atualizar limite mensal

## Autenticação

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer {token}
```

## Banco de Dados

O banco de dados SQLite é criado automaticamente em `database/conta-em-paz.db` na primeira execução.

### Estrutura das Tabelas

- **users** - Usuários do sistema
- **transactions** - Transações financeiras
- **categories** - Categorias personalizadas por usuário
- **user_settings** - Configurações do usuário (limite mensal)
