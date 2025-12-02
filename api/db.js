import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Pool } = pg;

let supabase;
let pool;

// Inicializar Supabase Client (via HTTPS - funciona em qualquer rede)
export const getSupabase = () => {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas');
    }

    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Supabase Client inicializado via HTTPS');
  }
  return supabase;
};

// Fallback: Pool PostgreSQL direto (para quando HTTPS funcionar)
export const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      // Se não tiver DATABASE_URL, não inicializa pool
      return null;
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

    console.log('✅ Pool PostgreSQL inicializado');
  }
  return pool;
};

// Helper para executar SQL - tenta PostgreSQL direto primeiro, senão usa Supabase
export const sql = async (strings, ...values) => {
  // Construir query e params
  let query = '';
  const params = [];

  if (Array.isArray(strings) && strings.raw) {
    for (let i = 0; i < strings.length; i++) {
      query += strings[i];
      if (i < values.length) {
        params.push(values[i]);
        query += `$${params.length}`;
      }
    }
  } else {
    query = strings;
  }

  // Tentar usar Pool PostgreSQL direto
  const pgPool = getPool();
  if (pgPool) {
    try {
      return await pgPool.query(query, params);
    } catch (error) {
      console.warn('⚠️ Falha ao usar PostgreSQL direto, tentando via Supabase Client...');
      console.warn('Erro:', error.message);
    }
  }

  // Fallback: Usar Supabase Client para queries específicas
  // Como não dá para executar SQL direto, vamos precisar usar os métodos do Supabase
  // Por enquanto, retorna erro para sabermos que queries precisam ser reescritas
  throw new Error('Conexão PostgreSQL falhou. Use métodos do Supabase Client diretamente.');
};
