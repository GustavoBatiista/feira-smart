-- Script para tornar feirante_id nullable na tabela produtos
-- Isso permite criar produtos sem estar cadastrado em uma feira
-- O produto ficará vinculado apenas ao user_id (feirante)

-- Remover constraint NOT NULL se existir
ALTER TABLE public.produtos 
ALTER COLUMN feirante_id DROP NOT NULL;

-- Verificar se a alteração foi aplicada
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'produtos'
  AND column_name = 'feirante_id';

