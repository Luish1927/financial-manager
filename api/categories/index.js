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
        SELECT * FROM categories WHERE user_id = ${auth.user.userId} ORDER BY name ASC
      `;
      const categoryNames = result.rows.map(c => c.name);
      return res.json(categoryNames);
    }

    if (req.method === 'POST') {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
      }

      const existing = await sql`
        SELECT id FROM categories WHERE user_id = ${auth.user.userId} AND name = ${name}
      `;

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Categoria já existe' });
      }

      await sql`
        INSERT INTO categories (user_id, name) VALUES (${auth.user.userId}, ${name})
      `;
      return res.status(201).json({ name });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em categories:', error);
    return res.status(500).json({ error: 'Erro ao processar categoria' });
  }
}
