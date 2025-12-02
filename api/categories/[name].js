import { getSupabase } from '../db.js';
import { authenticateToken, handleCors } from '../auth-middleware.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { name } = req.query;
  const oldName = decodeURIComponent(name);
  const supabase = getSupabase();

  try {
    if (req.method === 'PUT') {
      const { newName } = req.body;

      if (!newName) {
        return res.status(400).json({ error: 'Novo nome é obrigatório' });
      }

      const { data: existing, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', auth.user.userId)
        .eq('name', oldName);

      if (checkError) throw checkError;

      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      const { data: duplicate, error: dupError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', auth.user.userId)
        .eq('name', newName);

      if (dupError) throw dupError;

      if (duplicate && duplicate.length > 0) {
        return res.status(400).json({ error: 'Categoria com esse nome já existe' });
      }

      const { error: updateCatError } = await supabase
        .from('categories')
        .update({ name: newName })
        .eq('user_id', auth.user.userId)
        .eq('name', oldName);

      if (updateCatError) throw updateCatError;

      const { error: updateTransError } = await supabase
        .from('transactions')
        .update({ category: newName })
        .eq('user_id', auth.user.userId)
        .eq('category', oldName);

      if (updateTransError) throw updateTransError;

      return res.json({ oldName, newName });
    }

    if (req.method === 'DELETE') {
      const { data: deleted, error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('user_id', auth.user.userId)
        .eq('name', oldName)
        .select('id');

      if (deleteError) throw deleteError;

      if (!deleted || deleted.length === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      const { error: deleteTransError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', auth.user.userId)
        .eq('category', oldName);

      if (deleteTransError) throw deleteTransError;

      return res.json({ message: 'Categoria deletada com sucesso' });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em category [name]:', error);
    return res.status(500).json({ error: 'Erro ao processar categoria' });
  }
}
