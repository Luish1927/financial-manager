import getDatabase from '../db.js';
import { authenticateToken, handleCors } from '../auth-middleware.js';

export default function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const db = getDatabase();

  try {
    const { monthlyLimit } = req.body;

    if (monthlyLimit === undefined || monthlyLimit === null) {
      return res.status(400).json({ error: 'Limite mensal é obrigatório' });
    }

    if (monthlyLimit < 0) {
      return res.status(400).json({ error: 'Limite mensal não pode ser negativo' });
    }

    const existing = db.prepare('SELECT id FROM user_settings WHERE user_id = ?').get(auth.user.userId);

    if (existing) {
      db.prepare('UPDATE user_settings SET monthly_limit = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
        .run(monthlyLimit, auth.user.userId);
    } else {
      db.prepare('INSERT INTO user_settings (user_id, monthly_limit) VALUES (?, ?)')
        .run(auth.user.userId, monthlyLimit);
    }

    return res.json({ monthlyLimit });
  } catch (error) {
    console.error('Erro ao atualizar limite mensal:', error);
    return res.status(500).json({ error: 'Erro ao atualizar limite mensal' });
  }
}
