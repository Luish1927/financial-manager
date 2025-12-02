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
        SELECT monthly_limit FROM user_settings WHERE user_id = ${auth.user.userId}
      `;

      if (result.rows.length === 0) {
        await sql`
          INSERT INTO user_settings (user_id, monthly_limit) VALUES (${auth.user.userId}, 0)
        `;
        return res.json({ monthlyLimit: 0 });
      }

      return res.json({ monthlyLimit: parseFloat(result.rows[0].monthly_limit) });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em settings:', error);
    return res.status(500).json({ error: 'Erro ao processar configurações' });
  }
}
