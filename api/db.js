import pg from 'pg';
const { Pool } = pg;

let pool;

export const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL não definida nas variáveis de ambiente');
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

    pool.on('error', (err) => {
      console.error('Erro inesperado no pool de conexões:', err);
    });

    console.log('Pool de conexões PostgreSQL inicializado');
  }
  return pool;
};

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

    return await client.query(query, params);
  }

  // Se for uma query simples (string)
  return await client.query(strings, values);
};
