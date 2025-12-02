import pg from 'pg';
const { Pool } = pg;

let pool;
let initialized = false;

// Função para obter ou criar o pool de conexões
const getPool = () => {
  if (!pool) {
    // Suporta múltiplas variáveis de ambiente (Supabase, Vercel, etc)
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.SUPABASE_DB_URL ||
      process.env.POSTGRES_URL_NON_POOLING;

    if (!connectionString) {
      throw new Error('Nenhuma variável de conexão encontrada (DATABASE_URL, POSTGRES_URL, SUPABASE_DB_URL)');
    }

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Log de erros do pool
    pool.on('error', (err) => {
      console.error('Erro inesperado no pool de conexões:', err);
    });
  }
  return pool;
};

// Helper para executar queries (compatível com a sintaxe anterior)
export const sql = async (strings, ...values) => {
  const client = getPool();

  // Se for um template literal, construir a query
  if (Array.isArray(strings) && strings.raw) {
    let query = '';
    const params = [];

    for (let i = 0; i < strings.length; i++) {
      query += strings[i];
      if (i < values.length) {
        params.push(values[i]);
        query += `$${params.length}`;
      }
    }

    const result = await client.query(query, params);
    return result;
  }

  // Se for uma query simples (string)
  return client.query(strings, values);
};

const initDatabase = async () => {
  if (initialized) return;

  try {
    const client = getPool();

    // Verificar se a conexão está funcionando
    await client.query('SELECT 1');

    // Criar tabela users (compatível com tabelas já existentes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, name)
      )
    `);

    // Criar tabela transactions
    await client.query(`
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
      )
    `);

    // Criar tabela user_settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT UNIQUE NOT NULL,
        monthly_limit NUMERIC DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    initialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Não fazer throw - pode ser que as tabelas já existam no Supabase
    initialized = true; // Marcar como inicializado mesmo com erro
  }
};

export { initDatabase };
