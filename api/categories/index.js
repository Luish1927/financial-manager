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
        .select('id, name, type, icon, color, description')
        .eq('user_id', auth.user.userId)
        .order('name', { ascending: true });

      if (error) throw error;

      // Retornar objetos completos ao invés de apenas nomes
      return res.json(data);
    }

    if (req.method === 'POST') {
      const { name, type, icon, color, description } = req.body;

      // Validações
      if (!name || !type || !icon || !color) {
        return res.status(400).json({
          error: 'Campos obrigatórios: name, type, icon, color'
        });
      }

      if (!['income', 'expense', 'both'].includes(type)) {
        return res.status(400).json({
          error: 'Tipo deve ser: income, expense ou both'
        });
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

      const { data: newCategory, error: insertError } = await supabase
        .from('categories')
        .insert([{
          user_id: auth.user.userId,
          name,
          type,
          icon,
          color,
          description: description || ''
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      return res.status(201).json(newCategory);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em categories:', error);
    return res.status(500).json({ error: 'Erro ao processar categoria' });
  }
}
