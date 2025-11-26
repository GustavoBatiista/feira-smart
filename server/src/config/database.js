import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'feira_smart',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexão ao iniciar
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões:', err);
});

// Função para testar conexão
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com PostgreSQL testada:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error.message);
    return false;
  }
}

export default pool;

