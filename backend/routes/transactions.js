import express from 'express';
import db from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar todas as transações do usuário
router.get('/', (req, res) => {
  try {
    const transactions = db.prepare(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC'
    ).all(req.user.userId);

    res.json(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// Criar nova transação
router.post('/', (req, res) => {
  try {
    const { type, description, amount, category, date } = req.body;

    if (!type || !description || !amount || !category || !date) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
    }

    const result = db.prepare(
      'INSERT INTO transactions (user_id, type, description, amount, category, date) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.userId, type, description, amount, category, date);

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// Atualizar transação
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, amount, category, date } = req.body;

    // Verificar se a transação pertence ao usuário
    const existing = db.prepare('SELECT id FROM transactions WHERE id = ? AND user_id = ?').get(id, req.user.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    db.prepare(
      'UPDATE transactions SET type = ?, description = ?, amount = ?, category = ?, date = ? WHERE id = ? AND user_id = ?'
    ).run(type, description, amount, category, date, id, req.user.userId);

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);

    res.json(transaction);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
});

// Deletar transação
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, req.user.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
});

export default router;
