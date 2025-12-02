import { getSupabase } from '../db.js';
import { authenticateToken, handleCors } from '../auth-middleware.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const supabase = getSupabase();

  try {
    const { monthlyLimit } = req.body;

    if (monthlyLimit === undefined || monthlyLimit === null) {
      return res.status(400).json({ error: 'Limite mensal é obrigatório' });
    }

    if (monthlyLimit < 0) {
      return res.status(400).json({ error: 'Limite mensal não pode ser negativo' });
    }

    const { data: existing, error: checkError } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', auth.user.userId);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      const { error: updateError } = await supabase
        .from('user_settings')
        .update({
          monthly_limit: monthlyLimit,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', auth.user.userId);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('user_settings')
        .insert([{
          user_id: auth.user.userId,
          monthly_limit: monthlyLimit
        }]);

      if (insertError) throw insertError;
    }

    return res.json({ monthlyLimit });
  } catch (error) {
    console.error('Erro ao atualizar limite mensal:', error);
    return res.status(500).json({ error: 'Erro ao atualizar limite mensal' });
  }
}
