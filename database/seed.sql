-- ============================================
-- FeiraSmart - Seed Data
-- Script para popular o banco com dados de exemplo
-- Execute após o schema.sql
-- ============================================

-- Limpar dados existentes (CUIDADO: isso deleta todos os dados!)
-- TRUNCATE TABLE pedido_itens, pedidos, produtos, feirantes, profiles, feiras CASCADE;

-- ============================================
-- INSERIR FEIRAS
-- ============================================

INSERT INTO public.feiras (id, nome, localizacao, descricao, data_inicio, data_fim, hora_inicio, hora_fim, status, imagem) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Feira Orgânica Central',
    'Praça da República, Centro',
    'Feira com produtos orgânicos frescos diretamente dos produtores locais.',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 day',
    '06:00:00',
    '14:00:00',
    'ativa',
    'https://example.com/feira-organica.jpg'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Feira do Artesanato',
    'Parque Municipal, Jardins',
    'Artesanato local e produtos alimentícios de qualidade.',
    CURRENT_DATE + INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '2 days',
    '08:00:00',
    '16:00:00',
    'agendada',
    'https://example.com/feira-artesanato.jpg'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERIR PERFIS DE USUÁRIOS
-- ============================================

INSERT INTO public.profiles (id, email, nome, tipo, telefone, avatar) VALUES
  -- Clientes
  (
    '750e8400-e29b-41d4-a716-446655440001',
    'cliente1@example.com',
    'João Silva',
    'cliente',
    '(11) 99999-1111',
    'https://example.com/avatar-cliente1.jpg'
  ),
  (
    '750e8400-e29b-41d4-a716-446655440002',
    'cliente2@example.com',
    'Maria Santos',
    'cliente',
    '(11) 99999-2222',
    'https://example.com/avatar-cliente2.jpg'
  ),
  -- Feirantes
  (
    '750e8400-e29b-41d4-a716-446655440003',
    'feirante1@example.com',
    'Carlos Oliveira',
    'feirante',
    '(11) 99999-3333',
    'https://example.com/avatar-feirante1.jpg'
  ),
  (
    '750e8400-e29b-41d4-a716-446655440004',
    'feirante2@example.com',
    'Ana Costa',
    'feirante',
    '(11) 99999-4444',
    'https://example.com/avatar-feirante2.jpg'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERIR FEIRANTES
-- ============================================

INSERT INTO public.feirantes (id, user_id, feira_id, nome_estande, descricao, categoria, avatar, avaliacao, num_avaliacoes) VALUES
  (
    '850e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'Hortaliças Frescas',
    'Verduras e legumes orgânicos cultivados sem agrotóxicos.',
    'Hortifruti',
    'https://example.com/estande-hortaliças.jpg',
    4.8,
    25
  ),
  (
    '850e8400-e29b-41d4-a716-446655440002',
    '750e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440001',
    'Frutas da Terra',
    'Frutas frescas e suculentas direto do pomar.',
    'Frutas',
    'https://example.com/estande-frutas.jpg',
    4.9,
    30
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERIR PRODUTOS
-- ============================================

INSERT INTO public.produtos (id, feirante_id, nome, descricao, preco, unidade, categoria, imagem, estoque, disponivel) VALUES
  -- Produtos do feirante 1 (Hortaliças)
  (
    '950e8400-e29b-41d4-a716-446655440001',
    '850e8400-e29b-41d4-a716-446655440001',
    'Alface Crespa',
    'Alface crespa orgânica, fresquinha colhida de manhã.',
    3.50,
    'maço',
    'Verduras',
    'https://example.com/alface.jpg',
    50,
    true
  ),
  (
    '950e8400-e29b-41d4-a716-446655440002',
    '850e8400-e29b-41d4-a716-446655440001',
    'Tomate Cereja',
    'Tomate cereja orgânico, doce e saboroso.',
    8.90,
    'bandeja',
    'Legumes',
    'https://example.com/tomate-cereja.jpg',
    30,
    true
  ),
  (
    '950e8400-e29b-41d4-a716-446655440003',
    '850e8400-e29b-41d4-a716-446655440001',
    'Cenoura',
    'Cenoura orgânica, rica em betacaroteno.',
    4.50,
    'kg',
    'Legumes',
    'https://example.com/cenoura.jpg',
    40,
    true
  ),
  -- Produtos do feirante 2 (Frutas)
  (
    '950e8400-e29b-41d4-a716-446655440004',
    '850e8400-e29b-41d4-a716-446655440002',
    'Banana Prata',
    'Banana prata madura e doce.',
    5.90,
    'kg',
    'Frutas',
    'https://example.com/banana.jpg',
    60,
    true
  ),
  (
    '950e8400-e29b-41d4-a716-446655440005',
    '850e8400-e29b-41d4-a716-446655440002',
    'Mamão Papaya',
    'Mamão papaya doce e suculento.',
    6.50,
    'unidade',
    'Frutas',
    'https://example.com/mamao.jpg',
    25,
    true
  ),
  (
    '950e8400-e29b-41d4-a716-446655440006',
    '850e8400-e29b-41d4-a716-446655440002',
    'Laranja Lima',
    'Laranja lima suculenta, perfeita para suco.',
    4.90,
    'kg',
    'Frutas',
    'https://example.com/laranja.jpg',
    50,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERIR PEDIDOS (Opcional - para teste)
-- ============================================

INSERT INTO public.pedidos (id, cliente_id, feirante_id, feira_id, total, status, observacoes) VALUES
  (
    'a50e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440001',
    '850e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    16.90,
    'pendente',
    'Por favor, deixar na entrada da feira.'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERIR ITENS DO PEDIDO
-- ============================================

INSERT INTO public.pedido_itens (id, pedido_id, produto_id, nome_produto, quantidade, preco) VALUES
  (
    'b50e8400-e29b-41d4-a716-446655440001',
    'a50e8400-e29b-41d4-a716-446655440001',
    '950e8400-e29b-41d4-a716-446655440001',
    'Alface Crespa',
    2,
    3.50
  ),
  (
    'b50e8400-e29b-41d4-a716-446655440002',
    'a50e8400-e29b-41d4-a716-446655440001',
    '950e8400-e29b-41d4-a716-446655440002',
    'Tomate Cereja',
    1,
    8.90
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CONSULTAS ÚTEIS PARA TESTE
-- ============================================

-- Ver todas as feiras ativas
-- SELECT * FROM feiras WHERE status = 'ativa';

-- Ver produtos de um feirante
-- SELECT p.* FROM produtos p 
-- JOIN feirantes f ON p.feirante_id = f.id 
-- WHERE f.id = '850e8400-e29b-41d4-a716-446655440001';

-- Ver pedidos de um cliente
-- SELECT * FROM pedidos WHERE cliente_id = '750e8400-e29b-41d4-a716-446655440001';

-- Ver pedidos com itens
-- SELECT 
--   ped.id,
--   ped.total,
--   ped.status,
--   pi.nome_produto,
--   pi.quantidade,
--   pi.preco
-- FROM pedidos ped
-- JOIN pedido_itens pi ON ped.id = pi.pedido_id
-- WHERE ped.id = 'a50e8400-e29b-41d4-a716-446655440001';

