import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

// Routes
import authRoutes from './routes/auth.js';
import feirasRoutes from './routes/feiras.js';
import produtosRoutes from './routes/produtos.js';
import feirantesRoutes from './routes/feirantes.js';
import pedidosRoutes from './routes/pedidos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API FeiraSmart está funcionando!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/feiras', feirasRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/feirantes', feirantesRoutes);
app.use('/api/pedidos', pedidosRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
async function startServer() {
  // Testar conexão com banco
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('❌ Não foi possível conectar ao banco de dados. Verifique as configurações no arquivo .env');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('🚀 Servidor iniciado!');
    console.log(`📡 API rodando em: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('📚 Rotas disponíveis:');
    console.log('   POST   /api/auth/register');
    console.log('   POST   /api/auth/login');
    console.log('   GET    /api/auth/me');
    console.log('   GET    /api/feiras');
    console.log('   POST   /api/feiras');
    console.log('   GET    /api/produtos');
    console.log('   POST   /api/produtos');
    console.log('   GET    /api/feirantes');
    console.log('   POST   /api/feirantes');
    console.log('   GET    /api/pedidos');
    console.log('   POST   /api/pedidos');
  });
}

startServer();

