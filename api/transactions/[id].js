import getDatabase from '../db.js';
import { authenticateToken, handleCors } from '../auth-middleware.js';

export default function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { id } = req.query;
  const db = getDatabase();

  try {
    if (req.method === 'PUT') {
      const { type, description, amount, category, date } = req.body;

      const existing = db.prepare('SELECT id FROM transactions WHERE id = ? AND user_id = ?').get(id, auth.user.userId);
      if (!existing) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      db.prepare(
        'UPDATE transactions SET type = ?, description = ?, amount = ?, category = ?, date = ? WHERE id = ? AND user_id = ?'
      ).run(type, description, amount, category, date, id, auth.user.userId);

      const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
      return res.json(transaction);
    }

    if (req.method === 'DELETE') {
      const result = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, auth.user.userId);

      if (result.changes === 0) {
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
