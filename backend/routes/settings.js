import express from 'express';
import db from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Obter configurações do usuário
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT monthly_limit FROM user_settings WHERE user_id = ?').get(req.user.userId);

    if (!settings) {
      // Criar configurações padrão se não existir
      db.prepare('INSERT INTO user_settings (user_id, monthly_limit) VALUES (?, 0)').run(req.user.userId);
      return res.json({ monthlyLimit: 0 });
    }

    res.json({ monthlyLimit: settings.monthly_limit });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// Atualizar limite mensal
router.put('/monthly-limit', (req, res) => {
  try {
    const { monthlyLimit } = req.body;

    if (monthlyLimit === undefined || monthlyLimit === null) {
      return res.status(400).json({ error: 'Limite mensal é obrigatório' });
    }

    if (monthlyLimit < 0) {
      return res.status(400).json({ error: 'Limite mensal não pode ser negativo' });
    }

    // Verificar se configurações existem
    const existing = db.prepare('SELECT id FROM user_settings WHERE user_id = ?').get(req.user.userId);

    if (existing) {
      db.prepare('UPDATE user_settings SET monthly_limit = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
        .run(monthlyLimit, req.user.userId);
    } else {
      db.prepare('INSERT INTO user_settings (user_id, monthly_limit) VALUES (?, ?)')
        .run(req.user.userId, monthlyLimit);
    }

    res.json({ monthlyLimit });
  } catch (error) {
    console.error('Erro ao atualizar limite mensal:', error);
    res.status(500).json({ error: 'Erro ao atualizar limite mensal' });
  }
});

export default router;
