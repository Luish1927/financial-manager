import { getSupabase } from '../db.js';
import { authenticateToken, handleCors } from '../auth-middleware.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const supabase = getSupabase();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', auth.user.userId)
        .order('name', { ascending: true });

      if (error) throw error;

      const categoryNames = data.map(c => c.name);
      return res.json(categoryNames);
    }

    if (req.method === 'POST') {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
      }

      const { data: existing, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', auth.user.userId)
        .eq('name', name);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'Categoria já existe' });
      }

      const { error: insertError } = await supabase
        .from('categories')
        .insert([{ user_id: auth.user.userId, name }]);

      if (insertError) throw insertError;

      return res.status(201).json({ name });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em categories:', error);
    return res.status(500).json({ error: 'Erro ao processar categoria' });
  }
}
