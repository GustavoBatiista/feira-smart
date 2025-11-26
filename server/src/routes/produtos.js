import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Listar produtos de um feirante ou todos
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { feirante_id, disponivel } = req.query;
    
    let query = 'SELECT * FROM produtos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (feirante_id) {
      query += ` AND feirante_id = $${paramCount}`;
      params.push(feirante_id);
      paramCount++;
    }

    if (disponivel !== undefined) {
      query += ` AND disponivel = $${paramCount}`;
      params.push(disponivel === 'true');
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Obter produto por ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// Criar produto (feirante)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'feirante') {
      return res.status(403).json({ error: 'Apenas feirantes podem criar produtos' });
    }

    const {
      feirante_id,
      nome,
      descricao,
      preco,
      unidade,
      categoria,
      imagem,
      estoque,
      disponivel = true
    } = req.body;

    if (!nome || !preco || !unidade || !feirante_id) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // Verificar se o feirante pertence ao usuário
    const feiranteCheck = await pool.query(
      'SELECT id FROM feirantes WHERE id = $1 AND user_id = $2',
      [feirante_id, req.user.id]
    );

    if (feiranteCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Feirante não encontrado ou não pertence ao usuário' });
    }

    const result = await pool.query(
      `INSERT INTO produtos (feirante_id, nome, descricao, preco, unidade, categoria, imagem, estoque, disponivel, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [feirante_id, nome, descricao || null, preco, unidade, categoria || null, imagem || null, estoque || 0, disponivel]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// Atualizar produto (feirante)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'feirante') {
      return res.status(403).json({ error: 'Apenas feirantes podem atualizar produtos' });
    }

    const { id } = req.params;
    const {
      nome,
      descricao,
      preco,
      unidade,
      categoria,
      imagem,
      estoque,
      disponivel
    } = req.body;

    // Verificar se o produto pertence a um feirante do usuário
    const produtoCheck = await pool.query(
      `SELECT p.* FROM produtos p
       JOIN feirantes f ON p.feirante_id = f.id
       WHERE p.id = $1 AND f.user_id = $2`,
      [id, req.user.id]
    );

    if (produtoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado ou não pertence ao usuário' });
    }

    const result = await pool.query(
      `UPDATE produtos 
       SET nome = COALESCE($1, nome),
           descricao = COALESCE($2, descricao),
           preco = COALESCE($3, preco),
           unidade = COALESCE($4, unidade),
           categoria = COALESCE($5, categoria),
           imagem = COALESCE($6, imagem),
           estoque = COALESCE($7, estoque),
           disponivel = COALESCE($8, disponivel),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [nome, descricao, preco, unidade, categoria, imagem, estoque, disponivel, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Deletar produto (feirante)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'feirante') {
      return res.status(403).json({ error: 'Apenas feirantes podem deletar produtos' });
    }

    const { id } = req.params;

    // Verificar se o produto pertence a um feirante do usuário
    const produtoCheck = await pool.query(
      `SELECT p.* FROM produtos p
       JOIN feirantes f ON p.feirante_id = f.id
       WHERE p.id = $1 AND f.user_id = $2`,
      [id, req.user.id]
    );

    if (produtoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado ou não pertence ao usuário' });
    }

    await pool.query('DELETE FROM produtos WHERE id = $1', [id]);

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

export default router;

