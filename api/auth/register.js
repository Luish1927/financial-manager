import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql, initDatabase } from '../db.js';
import { handleCors } from '../auth-middleware.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    await initDatabase();

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id
    `;

    const userId = result.rows[0].id;

    const defaultCategories = [
      "Alimentação", "Transporte", "Moradia", "Saúde", "Lazer",
      "Educação", "Salário", "Freelance", "Investimentos"
    ];

    for (const category of defaultCategories) {
      await sql`
        INSERT INTO categories (user_id, name)
        VALUES (${userId}, ${category})
      `;
    }

    await sql`
      INSERT INTO user_settings (user_id, monthly_limit)
      VALUES (${userId}, 0)
    `;

    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'dev_secret_key_change_in_production_2024',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: { id: userId, name, email }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}
