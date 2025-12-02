import { sql, initDatabase } from '../db.js';
import { authenticateToken, handleCors } from '../auth-middleware.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    await initDatabase();

    const { monthlyLimit } = req.body;

    if (monthlyLimit === undefined || monthlyLimit === null) {
      return res.status(400).json({ error: 'Limite mensal é obrigatório' });
    }

    if (monthlyLimit < 0) {
      return res.status(400).json({ error: 'Limite mensal não pode ser negativo' });
    }

    const existing = await sql`
      SELECT id FROM user_settings WHERE user_id = ${auth.user.userId}
    `;

    if (existing.rows.length > 0) {
      await sql`
        UPDATE user_settings
        SET monthly_limit = ${monthlyLimit}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${auth.user.userId}
      `;
    } else {
      await sql`
        INSERT INTO user_settings (user_id, monthly_limit)
        VALUES (${auth.user.userId}, ${monthlyLimit})
      `;
    }

    return res.json({ monthlyLimit });
  } catch (error) {
    console.error('Erro ao atualizar limite mensal:', error);
    return res.status(500).json({ error: 'Erro ao atualizar limite mensal' });
  }
}
