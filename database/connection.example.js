/**
 * Exemplo de conexão com o banco de dados PostgreSQL
 * 
 * Instale as dependências:
 * npm install pg
 * ou
 * npm install pg-promise
 */

// ============================================
// Opção 1: Usando pg (driver oficial)
// ============================================

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'feira_smart',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'senha123',
  max: 20, // máximo de clientes no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
  } else {
    console.log('✅ Conectado ao banco de dados:', res.rows[0].now);
  }
});

module.exports = pool;

// ============================================
// Opção 2: Usando pg-promise (recomendado)
// ============================================

/*
const pgp = require('pg-promise')();
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'senha123'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'feira_smart'}`;

const db = pgp(connectionString);

// Testar conexão
db.one('SELECT NOW()')
  .then(data => {
    console.log('✅ Conectado ao banco de dados:', data.now);
  })
  .catch(error => {
    console.error('Erro ao conectar ao banco:', error);
  });

module.exports = db;
*/

// ============================================
// Exemplos de queries
// ============================================

/*
// Buscar todas as feiras ativas
async function getFeirasAtivas() {
  const query = 'SELECT * FROM feiras WHERE status = $1';
  const result = await pool.query(query, ['ativa']);
  return result.rows;
}

// Buscar produtos de um feirante
async function getProdutosByFeirante(feiranteId) {
  const query = 'SELECT * FROM produtos WHERE feirante_id = $1 AND disponivel = true';
  const result = await pool.query(query, [feiranteId]);
  return result.rows;
}

// Criar um novo pedido
async function criarPedido(pedidoData) {
  const { cliente_id, feirante_id, feira_id, itens, total } = pedidoData;
  
  // Iniciar transação
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Inserir pedido
    const pedidoResult = await client.query(
      'INSERT INTO pedidos (cliente_id, feirante_id, feira_id, total) VALUES ($1, $2, $3, $4) RETURNING id',
      [cliente_id, feirante_id, feira_id, total]
    );
    const pedidoId = pedidoResult.rows[0].id;
    
    // Inserir itens do pedido
    for (const item of itens) {
      await client.query(
        'INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, quantidade, preco) VALUES ($1, $2, $3, $4, $5)',
        [pedidoId, item.produto_id, item.nome_produto, item.quantidade, item.preco]
      );
    }
    
    await client.query('COMMIT');
    return pedidoId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
*/




