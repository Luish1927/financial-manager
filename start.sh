#!/bin/bash

echo "🚀 Iniciando Conta em Paz..."
echo ""

# Verificar se o backend está instalado
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend
    npm install
    cd ..
    echo ""
fi

# Verificar se o frontend está instalado
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
    echo ""
fi

# Verificar se o .env existe no backend
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Criando arquivo .env do backend..."
    cp backend/.env.example backend/.env
    echo ""
fi

echo "🔧 Iniciando backend na porta 3001..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo "🎨 Iniciando frontend na porta 8080..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servidores iniciados com sucesso!"
echo ""
echo "📍 Frontend: http://localhost:8080"
echo "📍 Backend:  http://localhost:3001"
echo ""
echo "Para parar os servidores, pressione Ctrl+C"
echo ""

# Aguardar até que os processos sejam interrompidos
wait $BACKEND_PID $FRONTEND_PID
