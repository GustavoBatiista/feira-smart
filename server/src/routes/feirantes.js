import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Listar feirantes
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { feira_id, user_id } = req.query;
    
    let query = 'SELECT * FROM feirantes WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (feira_id) {
      query += ` AND feira_id = $${paramCount}`;
      params.push(feira_id);
      paramCount++;
    }

    if (user_id) {
      query += ` AND user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar feirantes:', error);
    res.status(500).json({ error: 'Erro ao buscar feirantes' });
  }
});

// Obter feirante por ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM feirantes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feirante não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar feirante:', error);
    res.status(500).json({ error: 'Erro ao buscar feirante' });
  }
});

// Criar feirante (cadastro em feira)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'feirante') {
      return res.status(403).json({ error: 'Apenas feirantes podem se cadastrar em feiras' });
    }

    const {
      feira_id,
      nome_estande,
      descricao,
      categoria,
      avatar
    } = req.body;

    if (!feira_id || !nome_estande) {
      return res.status(400).json({ error: 'Feira e nome do estande são obrigatórios' });
    }

    // Verificar se já está cadastrado nesta feira
    const existing = await pool.query(
      'SELECT id FROM feirantes WHERE user_id = $1 AND feira_id = $2',
      [req.user.id, feira_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Você já está cadastrado nesta feira' });
    }

    const result = await pool.query(
      `INSERT INTO feirantes (user_id, feira_id, nome_estande, descricao, categoria, avatar, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [req.user.id, feira_id, nome_estande, descricao || null, categoria || null, avatar || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar feirante:', error);
    res.status(500).json({ error: 'Erro ao criar feirante' });
  }
});

// Atualizar feirante
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se pertence ao usuário
    const feiranteCheck = await pool.query(
      'SELECT id FROM feirantes WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (feiranteCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Feirante não encontrado ou não pertence ao usuário' });
    }

    const {
      nome_estande,
      descricao,
      categoria,
      avatar
    } = req.body;

    const result = await pool.query(
      `UPDATE feirantes 
       SET nome_estande = COALESCE($1, nome_estande),
           descricao = COALESCE($2, descricao),
           categoria = COALESCE($3, categoria),
           avatar = COALESCE($4, avatar),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [nome_estande, descricao, categoria, avatar, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar feirante:', error);
    res.status(500).json({ error: 'Erro ao atualizar feirante' });
  }
});

export default router;

