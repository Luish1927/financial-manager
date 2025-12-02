import express from 'express';
import db from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar todas as categorias do usuário
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC'
    ).all(req.user.userId);

    // Retornar apenas os nomes das categorias
    const categoryNames = categories.map(c => c.name);
    res.json(categoryNames);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Criar nova categoria
router.post('/', (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
    }

    // Verificar se categoria já existe para este usuário
    const existing = db.prepare('SELECT id FROM categories WHERE user_id = ? AND name = ?').get(req.user.userId, name);
    if (existing) {
      return res.status(400).json({ error: 'Categoria já existe' });
    }

    db.prepare('INSERT INTO categories (user_id, name) VALUES (?, ?)').run(req.user.userId, name);

    res.status(201).json({ name });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

// Atualizar categoria (renomear)
router.put('/:oldName', (req, res) => {
  try {
    const { oldName } = req.params;
    const { newName } = req.body;

    if (!newName) {
      return res.status(400).json({ error: 'Novo nome é obrigatório' });
    }

    // Verificar se a categoria antiga existe
    const existing = db.prepare('SELECT id FROM categories WHERE user_id = ? AND name = ?').get(req.user.userId, oldName);
    if (!existing) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Verificar se o novo nome já existe
    const duplicate = db.prepare('SELECT id FROM categories WHERE user_id = ? AND name = ?').get(req.user.userId, newName);
    if (duplicate) {
      return res.status(400).json({ error: 'Categoria com esse nome já existe' });
    }

    // Atualizar categoria
    db.prepare('UPDATE categories SET name = ? WHERE user_id = ? AND name = ?').run(newName, req.user.userId, oldName);

    // Atualizar transações com essa categoria
    db.prepare('UPDATE transactions SET category = ? WHERE user_id = ? AND category = ?').run(newName, req.user.userId, oldName);

    res.json({ oldName, newName });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// Deletar categoria
router.delete('/:name', (req, res) => {
  try {
    const { name } = req.params;

    const result = db.prepare('DELETE FROM categories WHERE user_id = ? AND name = ?').run(req.user.userId, name);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Deletar também todas as transações dessa categoria
    db.prepare('DELETE FROM transactions WHERE user_id = ? AND category = ?').run(req.user.userId, name);

    res.json({ message: 'Categoria deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ error: 'Erro ao deletar categoria' });
  }
});

export default router;
