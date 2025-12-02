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
      const categories = db.prepare(
        'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC'
      ).all(auth.user.userId);
      const categoryNames = categories.map(c => c.name);
      return res.json(categoryNames);
    }

    if (req.method === 'POST') {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
      }

      const existing = db.prepare('SELECT id FROM categories WHERE user_id = ? AND name = ?').get(auth.user.userId, name);
      if (existing) {
        return res.status(400).json({ error: 'Categoria já existe' });
      }

      db.prepare('INSERT INTO categories (user_id, name) VALUES (?, ?)').run(auth.user.userId, name);
      return res.status(201).json({ name });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em categories:', error);
    return res.status(500).json({ error: 'Erro ao processar categoria' });
  }
}
