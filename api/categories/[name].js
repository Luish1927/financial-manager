import { sql, initDatabase } from '../db.js';
import { authenticateToken, handleCors } from '../auth-middleware.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { name } = req.query;
  const oldName = decodeURIComponent(name);

  try {
    await initDatabase();

    if (req.method === 'PUT') {
      const { newName } = req.body;

      if (!newName) {
        return res.status(400).json({ error: 'Novo nome é obrigatório' });
      }

      const existing = await sql`
        SELECT id FROM categories WHERE user_id = ${auth.user.userId} AND name = ${oldName}
      `;

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      const duplicate = await sql`
        SELECT id FROM categories WHERE user_id = ${auth.user.userId} AND name = ${newName}
      `;

      if (duplicate.rows.length > 0) {
        return res.status(400).json({ error: 'Categoria com esse nome já existe' });
      }

      await sql`
        UPDATE categories SET name = ${newName}
        WHERE user_id = ${auth.user.userId} AND name = ${oldName}
      `;

      await sql`
        UPDATE transactions SET category = ${newName}
        WHERE user_id = ${auth.user.userId} AND category = ${oldName}
      `;

      return res.json({ oldName, newName });
    }

    if (req.method === 'DELETE') {
      const result = await sql`
        DELETE FROM categories
        WHERE user_id = ${auth.user.userId} AND name = ${oldName}
        RETURNING id
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      await sql`
        DELETE FROM transactions
        WHERE user_id = ${auth.user.userId} AND category = ${oldName}
      `;

      return res.json({ message: 'Categoria deletada com sucesso' });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em category [name]:', error);
    return res.status(500).json({ error: 'Erro ao processar categoria' });
  }
}
