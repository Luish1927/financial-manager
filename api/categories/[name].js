import getDatabase from '../db.js';
import { authenticateToken, handleCors } from '../auth-middleware.js';

export default function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { name } = req.query;
  const oldName = decodeURIComponent(name);
  const db = getDatabase();

  try {
    if (req.method === 'PUT') {
      const { newName } = req.body;

      if (!newName) {
        return res.status(400).json({ error: 'Novo nome é obrigatório' });
      }

      const existing = db.prepare('SELECT id FROM categories WHERE user_id = ? AND name = ?').get(auth.user.userId, oldName);
      if (!existing) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      const duplicate = db.prepare('SELECT id FROM categories WHERE user_id = ? AND name = ?').get(auth.user.userId, newName);
      if (duplicate) {
        return res.status(400).json({ error: 'Categoria com esse nome já existe' });
      }

      db.prepare('UPDATE categories SET name = ? WHERE user_id = ? AND name = ?').run(newName, auth.user.userId, oldName);
      db.prepare('UPDATE transactions SET category = ? WHERE user_id = ? AND category = ?').run(newName, auth.user.userId, oldName);

      return res.json({ oldName, newName });
    }

    if (req.method === 'DELETE') {
      const result = db.prepare('DELETE FROM categories WHERE user_id = ? AND name = ?').run(auth.user.userId, oldName);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      db.prepare('DELETE FROM transactions WHERE user_id = ? AND category = ?').run(auth.user.userId, oldName);
      return res.json({ message: 'Categoria deletada com sucesso' });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em category [name]:', error);
    return res.status(500).json({ error: 'Erro ao processar categoria' });
  }
}
