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
        .from('transactions')
        .select('*')
        .eq('user_id', auth.user.userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.json(data);
    }

    if (req.method === 'POST') {
      const { type, description, amount, category, date } = req.body;

      if (!type || !description || !amount || !category || !date) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: auth.user.userId,
          type,
          description,
          amount,
          category,
          date
        }])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em transactions:', error);
    return res.status(500).json({ error: 'Erro ao processar transação' });
  }
}
