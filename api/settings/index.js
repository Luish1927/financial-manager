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
      const settings = db.prepare('SELECT monthly_limit FROM user_settings WHERE user_id = ?').get(auth.user.userId);

      if (!settings) {
        db.prepare('INSERT INTO user_settings (user_id, monthly_limit) VALUES (?, 0)').run(auth.user.userId);
        return res.json({ monthlyLimit: 0 });
      }

      return res.json({ monthlyLimit: settings.monthly_limit });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em settings:', error);
    return res.status(500).json({ error: 'Erro ao processar configurações' });
  }
}
