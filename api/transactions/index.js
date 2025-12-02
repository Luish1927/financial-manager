import getDatabase from '../db.js';
import { authenticateToken, handleCors } from '../auth-middleware.js';

export default function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const db = getDatabase();

  try {
    if (req.method === 'GET') {
      const transactions = db.prepare(
        'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC'
      ).all(auth.user.userId);
      return res.json(transactions);
    }

    if (req.method === 'POST') {
      const { type, description, amount, category, date } = req.body;

      if (!type || !description || !amount || !category || !date) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
      }

      const result = db.prepare(
        'INSERT INTO transactions (user_id, type, description, amount, category, date) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(auth.user.userId, type, description, amount, category, date);

      const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(transaction);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em transactions:', error);
    return res.status(500).json({ error: 'Erro ao processar transação' });
  }
}
