
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- Drop types if they exist
DROP TYPE IF EXISTS public.user_type CASCADE;
DROP TYPE IF EXISTS public.pedido_status CASCADE;

-- Create enum types
CREATE TYPE public.user_type AS ENUM ('cliente', 'feirante');
CREATE TYPE public.pedido_status AS ENUM ('pendente', 'confirmado', 'pronto', 'entregue', 'cancelado');

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (usuários)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  tipo user_type NOT NULL DEFAULT 'cliente',
  telefone TEXT,
  avatar TEXT,
  password_hash TEXT, -- Para autenticação própria (sem Supabase)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feiras table
CREATE TABLE IF NOT EXISTS public.feiras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  localizacao TEXT NOT NULL,
  descricao TEXT,
  dia_da_semana INTEGER NOT NULL CHECK (dia_da_semana >= 0 AND dia_da_semana <= 6), -- 0=domingo, 1=segunda, ..., 6=sábado
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  imagem TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feirantes table
CREATE TABLE IF NOT EXISTS public.feirantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feira_id UUID NOT NULL REFERENCES public.feiras(id) ON DELETE CASCADE,
  nome_estande TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  avatar TEXT,
  avaliacao DECIMAL(2,1) DEFAULT 0 CHECK (avaliacao >= 0 AND avaliacao <= 5),
  num_avaliacoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, feira_id)
);

-- Produtos table
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feirante_id UUID REFERENCES public.feirantes(id) ON DELETE CASCADE, -- Nullable: permite produtos sem feirante cadastrado
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feirante_id UUID NOT NULL REFERENCES public.feirantes(id) ON DELETE CASCADE,
  feira_id UUID NOT NULL REFERENCES public.feiras(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status pedido_status NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pedido Itens table (itens de um pedido)
CREATE TABLE IF NOT EXISTS public.pedido_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  nome_produto TEXT NOT NULL, -- Nome do produto no momento da compra (snapshot)
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0), -- Preço do produto no momento da compra
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_tipo ON public.profiles(tipo);

-- Feiras indexes
CREATE INDEX IF NOT EXISTS idx_feiras_dia_da_semana ON public.feiras(dia_da_semana);

-- Feirantes indexes
CREATE INDEX IF NOT EXISTS idx_feirantes_user_id ON public.feirantes(user_id);
CREATE INDEX IF NOT EXISTS idx_feirantes_feira_id ON public.feirantes(feira_id);

-- Produtos indexes
CREATE INDEX IF NOT EXISTS idx_produtos_user_id ON public.produtos(user_id);
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feiras_updated_at
  BEFORE UPDATE ON public.feiras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feirantes_updated_at
  BEFORE UPDATE ON public.feirantes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.feiras (id, nome, localizacao, descricao, dia_da_semana, hora_inicio, hora_fim)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'Feira Orgânica Central',
    'Praça da República, Centro',
    'Feira com produtos orgânicos frescos diretamente dos produtores locais.',
    EXTRACT(DOW FROM CURRENT_DATE)::INTEGER, -- Dia da semana atual (0=domingo, 6=sábado)
    '06:00:00',
    '14:00:00'
  )
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.profiles IS 'Perfis de usuários (clientes e feirantes)';
COMMENT ON TABLE public.feiras IS 'Informações das feiras livres';
COMMENT ON TABLE public.feirantes IS 'Informações dos estandes/feirantes';
COMMENT ON TABLE public.produtos IS 'Catálogo de produtos dos feirantes';
COMMENT ON TABLE public.pedidos IS 'Pedidos realizados pelos clientes';
COMMENT ON TABLE public.pedido_itens IS 'Itens de cada pedido';







