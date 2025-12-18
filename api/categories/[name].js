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
      const { newName, type, icon, color, description } = req.body;

      const { data: existing, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', auth.user.userId)
        .eq('name', oldName);

      if (checkError) throw checkError;

      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Se está mudando o nome, verificar se o novo nome já existe
      if (newName && newName !== oldName) {
        const { data: duplicate, error: dupError } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', auth.user.userId)
          .eq('name', newName);

        if (dupError) throw dupError;

        if (duplicate && duplicate.length > 0) {
          return res.status(400).json({ error: 'Categoria com esse nome já existe' });
        }
      }

      // Construir objeto de update dinamicamente
      const updates = {};
      if (newName) updates.name = newName;
      if (type) updates.type = type;
      if (icon) updates.icon = icon;
      if (color) updates.color = color;
      if (description !== undefined) updates.description = description;

      const { data: updatedCategory, error: updateCatError } = await supabase
        .from('categories')
        .update(updates)
        .eq('user_id', auth.user.userId)
        .eq('name', oldName)
        .select()
        .single();

      if (updateCatError) throw updateCatError;

      // Atualizar transações se o nome mudou
      if (newName && newName !== oldName) {
        const { error: updateTransError } = await supabase
          .from('transactions')
          .update({ category: newName })
          .eq('user_id', auth.user.userId)
          .eq('category', oldName);

        if (updateTransError) throw updateTransError;
      }

      return res.json(updatedCategory);
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
