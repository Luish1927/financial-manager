import { getSupabase } from '../db.js';
import { authenticateToken, handleCors } from '../auth-middleware.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { id } = req.query;
  const supabase = getSupabase();

  try {
    if (req.method === 'PUT') {
      const { type, description, amount, category, date } = req.body;

      const { data: existing, error: checkError } = await supabase
        .from('transactions')
        .select('id')
        .eq('id', id)
        .eq('user_id', auth.user.userId);

      if (checkError) throw checkError;

      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      const { data, error: updateError } = await supabase
        .from('transactions')
        .update({
          type,
          description,
          amount,
          category,
          date
        })
        .eq('id', id)
        .eq('user_id', auth.user.userId)
        .select()
        .single();

      if (updateError) throw updateError;

      return res.json(data);
    }

    if (req.method === 'DELETE') {
      const { data: deleted, error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', auth.user.userId)
        .select('id');

      if (deleteError) throw deleteError;

      if (!deleted || deleted.length === 0) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      return res.json({ message: 'Transação deletada com sucesso' });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em transaction [id]:', error);
    return res.status(500).json({ error: 'Erro ao processar transação' });
  }
}
