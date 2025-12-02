import { sql } from '../db.js';
import { authenticateToken, handleCors } from '../auth-middleware.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  try {

    if (req.method === 'GET') {
      const result = await sql`
        SELECT * FROM transactions
        WHERE user_id = ${auth.user.userId}
        ORDER BY date DESC, created_at DESC
      `;
      return res.json(result.rows);
    }

    if (req.method === 'POST') {
      const { type, description, amount, category, date } = req.body;

      if (!type || !description || !amount || !category || !date) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
      }

      const result = await sql`
        INSERT INTO transactions (user_id, type, description, amount, category, date)
        VALUES (${auth.user.userId}, ${type}, ${description}, ${amount}, ${category}, ${date})
        RETURNING *
      `;

      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em transactions:', error);
    return res.status(500).json({ error: 'Erro ao processar transação' });
  }
}
