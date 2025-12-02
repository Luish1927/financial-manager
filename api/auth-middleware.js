import jwt from 'jsonwebtoken';

export const authenticateToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { error: 'Token não fornecido', status: 401 };
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_change_in_production_2024');
    return { user };
  } catch (error) {
    return { error: 'Token inválido ou expirado', status: 403 };
  }
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const handleCors = (req, res) => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
};
