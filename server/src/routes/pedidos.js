import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Listar pedidos
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    const params = [];

    if (req.user.tipo === 'cliente') {
      // Cliente vê apenas seus pedidos
      query = 'SELECT * FROM pedidos WHERE cliente_id = $1 ORDER BY created_at DESC';
      params.push(req.user.id);
    } else if (req.user.tipo === 'feirante') {
      // Feirante vê pedidos de suas feiras
      query = `SELECT p.* FROM pedidos p
               JOIN feirantes f ON p.feirante_id = f.id
               WHERE f.user_id = $1
               ORDER BY p.created_at DESC`;
      params.push(req.user.id);
    } else {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// Obter pedido por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar pedido com itens
    const pedidoResult = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    
    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const pedido = pedidoResult.rows[0];

    // Verificar permissão
    if (req.user.tipo === 'cliente' && pedido.cliente_id !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    if (req.user.tipo === 'feirante') {
      const feiranteCheck = await pool.query(
        'SELECT user_id FROM feirantes WHERE id = $1',
        [pedido.feirante_id]
      );
      if (feiranteCheck.rows[0]?.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    }

    // Buscar itens do pedido
    const itensResult = await pool.query(
      'SELECT * FROM pedido_itens WHERE pedido_id = $1',
      [id]
    );

    res.json({
      ...pedido,
      itens: itensResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

// Criar pedido
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'cliente') {
      return res.status(403).json({ error: 'Apenas clientes podem criar pedidos' });
    }

    const { feirante_id, feira_id, itens, observacoes } = req.body;

    if (!feirante_id || !feira_id || !itens || itens.length === 0) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Calcular total
    let total = 0;
    for (const item of itens) {
      total += parseFloat(item.preco) * parseInt(item.quantidade);
    }

    // Criar pedido
    const pedidoResult = await pool.query(
      `INSERT INTO pedidos (cliente_id, feirante_id, feira_id, total, status, observacoes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'pendente', $5, NOW(), NOW())
       RETURNING *`,
      [req.user.id, feirante_id, feira_id, total, observacoes || null]
    );

    const pedido = pedidoResult.rows[0];

    // Criar itens do pedido
    for (const item of itens) {
      await pool.query(
        `INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, quantidade, preco, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [pedido.id, item.produto_id, item.nome_produto, item.quantidade, item.preco]
      );
    }

    // Buscar pedido completo
    const itensResult = await pool.query(
      'SELECT * FROM pedido_itens WHERE pedido_id = $1',
      [pedido.id]
    );

    res.status(201).json({
      ...pedido,
      itens: itensResult.rows
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// Atualizar status do pedido (feirante)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'feirante') {
      return res.status(403).json({ error: 'Apenas feirantes podem atualizar status' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    // Verificar se o pedido pertence a uma feira do feirante
    const pedidoCheck = await pool.query(
      `SELECT p.* FROM pedidos p
       JOIN feirantes f ON p.feirante_id = f.id
       WHERE p.id = $1 AND f.user_id = $2`,
      [id, req.user.id]
    );

    if (pedidoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado ou não pertence ao feirante' });
    }

    const result = await pool.query(
      `UPDATE pedidos 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do pedido' });
  }
});

export default router;

