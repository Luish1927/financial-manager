import { sql, initDatabase } from '../db.js';
import { authenticateToken, handleCors } from '../auth-middleware.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { id } = req.query;

  try {
    await initDatabase();

    if (req.method === 'PUT') {
      const { type, description, amount, category, date } = req.body;

      const existing = await sql`
        SELECT id FROM transactions WHERE id = ${id} AND user_id = ${auth.user.userId}
      `;

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      const result = await sql`
        UPDATE transactions
        SET type = ${type}, description = ${description}, amount = ${amount},
            category = ${category}, date = ${date}
        WHERE id = ${id} AND user_id = ${auth.user.userId}
        RETURNING *
      `;

      return res.json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const result = await sql`
        DELETE FROM transactions WHERE id = ${id} AND user_id = ${auth.user.userId}
        RETURNING id
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      return res.json({ message: 'Transação deletada com sucesso' });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em transaction [id]:', error);
    return res.status(500).json({ error: 'Erro ao processar transação' });
  }
}
