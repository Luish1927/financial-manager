import jwt from 'jsonwebtoken';
import { sql } from '../db.js';
import { handleCors } from '../auth-middleware.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_change_in_production_2024');

    const result = await sql`
      SELECT id, name, email FROM users WHERE id = ${decoded.userId}
    `;

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user });
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
  }
}
