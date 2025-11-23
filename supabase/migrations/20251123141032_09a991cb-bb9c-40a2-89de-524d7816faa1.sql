-- Create enum types
CREATE TYPE public.user_type AS ENUM ('cliente', 'feirante');
CREATE TYPE public.feira_status AS ENUM ('ativa', 'encerrada', 'agendada');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo user_type NOT NULL DEFAULT 'cliente',
  telefone TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create feiras table
CREATE TABLE public.feiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  localizacao TEXT NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  imagem TEXT,
  status feira_status NOT NULL DEFAULT 'agendada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feiras ENABLE ROW LEVEL SECURITY;

-- Feiras policies - everyone can view active fairs
CREATE POLICY "Anyone can view feiras"
  ON public.feiras FOR SELECT
  USING (true);

-- Create feirantes table
CREATE TABLE public.feirantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feira_id UUID NOT NULL REFERENCES public.feiras(id) ON DELETE CASCADE,
  nome_estande TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  avatar TEXT,
  avaliacao DECIMAL(2,1) DEFAULT 0,
  num_avaliacoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, feira_id)
);

ALTER TABLE public.feirantes ENABLE ROW LEVEL SECURITY;

-- Feirantes policies
CREATE POLICY "Anyone can view feirantes"
  ON public.feirantes FOR SELECT
  USING (true);

CREATE POLICY "Feirantes can insert their own records"
  ON public.feirantes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Feirantes can update their own records"
  ON public.feirantes FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, tipo)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome', new.email),
    COALESCE((new.raw_user_meta_data->>'tipo')::user_type, 'cliente')
  );
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feiras_updated_at
  BEFORE UPDATE ON public.feiras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feirantes_updated_at
  BEFORE UPDATE ON public.feirantes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();