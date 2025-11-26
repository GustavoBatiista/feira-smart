import express from 'express';
import pool from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Listar todas as feiras
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = 'SELECT * FROM feiras';
    const params = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY data_inicio DESC, created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar feiras:', error);
    res.status(500).json({ error: 'Erro ao buscar feiras' });
  }
});

// Obter feira por ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM feiras WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feira não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar feira:', error);
    res.status(500).json({ error: 'Erro ao buscar feira' });
  }
});

// Criar feira (admin)
router.post('/', async (req, res) => {
  try {
    const {
      nome,
      localizacao,
      descricao,
      data_inicio,
      data_fim,
      hora_inicio,
      hora_fim,
      imagem,
      status = 'agendada'
    } = req.body;

    if (!nome || !localizacao || !data_inicio || !data_fim || !hora_inicio || !hora_fim) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const result = await pool.query(
      `INSERT INTO feiras (nome, localizacao, descricao, data_inicio, data_fim, hora_inicio, hora_fim, imagem, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [nome, localizacao, descricao || null, data_inicio, data_fim, hora_inicio, hora_fim, imagem || null, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar feira:', error);
    res.status(500).json({ error: 'Erro ao criar feira' });
  }
});

// Atualizar feira (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      localizacao,
      descricao,
      data_inicio,
      data_fim,
      hora_inicio,
      hora_fim,
      imagem,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE feiras 
       SET nome = COALESCE($1, nome),
           localizacao = COALESCE($2, localizacao),
           descricao = COALESCE($3, descricao),
           data_inicio = COALESCE($4, data_inicio),
           data_fim = COALESCE($5, data_fim),
           hora_inicio = COALESCE($6, hora_inicio),
           hora_fim = COALESCE($7, hora_fim),
           imagem = COALESCE($8, imagem),
           status = COALESCE($9, status),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [nome, localizacao, descricao, data_inicio, data_fim, hora_inicio, hora_fim, imagem, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feira não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar feira:', error);
    res.status(500).json({ error: 'Erro ao atualizar feira' });
  }
});

// Deletar feira (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM feiras WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feira não encontrada' });
    }

    res.json({ message: 'Feira deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar feira:', error);
    res.status(500).json({ error: 'Erro ao deletar feira' });
  }
});

export default router;

