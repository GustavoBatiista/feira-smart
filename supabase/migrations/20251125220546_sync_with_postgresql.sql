-- ============================================
-- FeiraSmart - Sync Supabase with PostgreSQL
-- Migração completa para sincronizar com database/schema.sql
-- ============================================

-- ============================================
-- ENUMS - Adicionar enum faltante
-- ============================================

DO $$ BEGIN
  CREATE TYPE public.pedido_status AS ENUM ('pendente', 'confirmado', 'pronto', 'entregue', 'cancelado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES - Melhorias e ajustes nas existentes
-- ============================================

-- Adicionar UNIQUE constraint em profiles.email se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_email_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- Adicionar CHECK constraint em feirantes.avaliacao
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'feirantes_avaliacao_check'
  ) THEN
    ALTER TABLE public.feirantes 
    ADD CONSTRAINT feirantes_avaliacao_check 
    CHECK (avaliacao >= 0 AND avaliacao <= 5);
  END IF;
END $$;

-- ============================================
-- TABLES - Criar tabelas faltantes
-- ============================================

-- Produtos table
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feirante_id UUID NOT NULL REFERENCES public.feirantes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
  unidade TEXT NOT NULL DEFAULT 'unidade',
  categoria TEXT,
  imagem TEXT,
  estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  disponivel BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pedidos table
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feirante_id UUID NOT NULL REFERENCES public.feirantes(id) ON DELETE CASCADE,
  feira_id UUID NOT NULL REFERENCES public.feiras(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status pedido_status NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pedido Itens table
CREATE TABLE IF NOT EXISTS public.pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  nome_produto TEXT NOT NULL, -- Nome do produto no momento da compra (snapshot)
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0), -- Preço do produto no momento da compra
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;

-- Policies para Produtos
DO $$ 
BEGIN
  -- Todos podem ver produtos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'produtos' 
    AND policyname = 'Anyone can view produtos'
  ) THEN
    CREATE POLICY "Anyone can view produtos"
      ON public.produtos FOR SELECT
      USING (true);
  END IF;

  -- Feirantes podem inserir seus próprios produtos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'produtos' 
    AND policyname = 'Feirantes can insert their own produtos'
  ) THEN
    CREATE POLICY "Feirantes can insert their own produtos"
      ON public.produtos FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.feirantes f
          WHERE f.id = feirante_id AND f.user_id = auth.uid()
        )
      );
  END IF;

  -- Feirantes podem atualizar seus próprios produtos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'produtos' 
    AND policyname = 'Feirantes can update their own produtos'
  ) THEN
    CREATE POLICY "Feirantes can update their own produtos"
      ON public.produtos FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.feirantes f
          WHERE f.id = feirante_id AND f.user_id = auth.uid()
        )
      );
  END IF;

  -- Feirantes podem deletar seus próprios produtos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'produtos' 
    AND policyname = 'Feirantes can delete their own produtos'
  ) THEN
    CREATE POLICY "Feirantes can delete their own produtos"
      ON public.produtos FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.feirantes f
          WHERE f.id = feirante_id AND f.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policies para Pedidos
DO $$ 
BEGIN
  -- Clientes podem ver seus próprios pedidos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pedidos' 
    AND policyname = 'Clients can view their own pedidos'
  ) THEN
    CREATE POLICY "Clients can view their own pedidos"
      ON public.pedidos FOR SELECT
      USING (auth.uid() = cliente_id);
  END IF;

  -- Feirantes podem ver pedidos de suas feiras
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pedidos' 
    AND policyname = 'Feirantes can view pedidos from their feiras'
  ) THEN
    CREATE POLICY "Feirantes can view pedidos from their feiras"
      ON public.pedidos FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.feirantes f
          WHERE f.id = pedidos.feirante_id AND f.user_id = auth.uid()
        )
      );
  END IF;

  -- Clientes podem criar pedidos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pedidos' 
    AND policyname = 'Clients can create pedidos'
  ) THEN
    CREATE POLICY "Clients can create pedidos"
      ON public.pedidos FOR INSERT
      WITH CHECK (auth.uid() = cliente_id);
  END IF;

  -- Feirantes podem atualizar pedidos de suas feiras
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pedidos' 
    AND policyname = 'Feirantes can update pedidos from their feiras'
  ) THEN
    CREATE POLICY "Feirantes can update pedidos from their feiras"
      ON public.pedidos FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.feirantes f
          WHERE f.id = pedidos.feirante_id AND f.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policies para Pedido Itens
DO $$ 
BEGIN
  -- Usuários podem ver itens dos seus pedidos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pedido_itens' 
    AND policyname = 'Users can view pedido_itens from their pedidos'
  ) THEN
    CREATE POLICY "Users can view pedido_itens from their pedidos"
      ON public.pedido_itens FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.pedidos p
          WHERE p.id = pedido_itens.pedido_id 
          AND (
            p.cliente_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.feirantes f
              WHERE f.id = p.feirante_id AND f.user_id = auth.uid()
            )
          )
        )
      );
  END IF;

  -- Clientes podem inserir itens em seus pedidos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pedido_itens' 
    AND policyname = 'Clients can insert pedido_itens to their pedidos'
  ) THEN
    CREATE POLICY "Clients can insert pedido_itens to their pedidos"
      ON public.pedido_itens FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.pedidos p
          WHERE p.id = pedido_itens.pedido_id AND p.cliente_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================
-- INDEXES
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_tipo ON public.profiles(tipo);

-- Feiras indexes
CREATE INDEX IF NOT EXISTS idx_feiras_status ON public.feiras(status);
CREATE INDEX IF NOT EXISTS idx_feiras_data_inicio ON public.feiras(data_inicio);

-- Feirantes indexes
CREATE INDEX IF NOT EXISTS idx_feirantes_user_id ON public.feirantes(user_id);
CREATE INDEX IF NOT EXISTS idx_feirantes_feira_id ON public.feirantes(feira_id);

-- Produtos indexes
CREATE INDEX IF NOT EXISTS idx_produtos_feirante_id ON public.produtos(feirante_id);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_disponivel ON public.produtos(disponivel);

-- Pedidos indexes
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON public.pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_feirante_id ON public.pedidos(feirante_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_feira_id ON public.pedidos(feira_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON public.pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos(created_at);

-- Pedido Itens indexes
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido_id ON public.pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_produto_id ON public.pedido_itens(produto_id);

-- ============================================
-- TRIGGERS - Adicionar triggers faltantes
-- ============================================

-- Trigger para produtos updated_at
DROP TRIGGER IF EXISTS update_produtos_updated_at ON public.produtos;
CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para pedidos updated_at
DROP TRIGGER IF EXISTS update_pedidos_updated_at ON public.pedidos;
CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.profiles IS 'Perfis de usuários (clientes e feirantes)';
COMMENT ON TABLE public.feiras IS 'Informações das feiras livres';
COMMENT ON TABLE public.feirantes IS 'Informações dos estandes/feirantes';
COMMENT ON TABLE public.produtos IS 'Catálogo de produtos dos feirantes';
COMMENT ON TABLE public.pedidos IS 'Pedidos realizados pelos clientes';
COMMENT ON TABLE public.pedido_itens IS 'Itens de cada pedido';

-- ============================================
-- END OF MIGRATION
-- ============================================

