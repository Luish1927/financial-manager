import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabase } from '../db.js';
import { handleCors } from '../auth-middleware.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('📝 [REGISTER] Iniciando registro...');

    const { name, email, password } = req.body;
    console.log('📝 [REGISTER] Dados recebidos:', { name, email, passwordLength: password?.length });

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    const supabase = getSupabase();

    console.log('📝 [REGISTER] Verificando se email já existe...');
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);

    if (checkError) {
      console.error('❌ [REGISTER] Erro ao verificar email:', checkError);
      throw checkError;
    }

    console.log('📝 [REGISTER] Usuários encontrados:', existingUsers?.length || 0);

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    console.log('📝 [REGISTER] Gerando hash da senha...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('📝 [REGISTER] Inserindo usuário no banco...');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword }])
      .select('id')
      .single();

    if (insertError) {
      console.error('❌ [REGISTER] Erro ao inserir usuário:', insertError);
      throw insertError;
    }

    console.log('📝 [REGISTER] Usuário criado com ID:', newUser.id);

    const userId = newUser.id;

    const defaultCategories = [
      "Alimentação", "Transporte", "Moradia", "Saúde", "Lazer",
      "Educação", "Salário", "Freelance", "Investimentos"
    ];

    console.log('📝 [REGISTER] Criando categorias padrão...');
    const categoriesToInsert = defaultCategories.map(category => ({
      user_id: userId,
      name: category
    }));

    const { error: categoriesError } = await supabase
      .from('categories')
      .insert(categoriesToInsert);

    if (categoriesError) {
      console.error('❌ [REGISTER] Erro ao criar categorias:', categoriesError);
      throw categoriesError;
    }

    console.log('📝 [REGISTER] Categorias criadas com sucesso');

    console.log('📝 [REGISTER] Criando configurações do usuário...');
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert([{ user_id: userId, monthly_limit: 0 }]);

    if (settingsError) {
      console.error('❌ [REGISTER] Erro ao criar configurações:', settingsError);
      throw settingsError;
    }

    console.log('📝 [REGISTER] Configurações criadas com sucesso');

    console.log('📝 [REGISTER] Gerando token JWT...');
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'dev_secret_key_change_in_production_2024',
      { expiresIn: '7d' }
    );

    console.log('✅ [REGISTER] Registro concluído com sucesso!');
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: { id: userId, name, email }
    });
  } catch (error) {
    console.error('❌ [REGISTER] Erro no registro:', error);
    console.error('❌ [REGISTER] Stack trace:', error.stack);
    console.error('❌ [REGISTER] Mensagem:', error.message);
    res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
}
