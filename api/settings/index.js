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
        .from('user_settings')
        .select('monthly_limit')
        .eq('user_id', auth.user.userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert([{ user_id: auth.user.userId, monthly_limit: 0 }]);

        if (insertError) throw insertError;

        return res.json({ monthlyLimit: 0 });
      }

      return res.json({ monthlyLimit: parseFloat(data[0].monthly_limit) });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em settings:', error);
    return res.status(500).json({ error: 'Erro ao processar configurações' });
  }
}
