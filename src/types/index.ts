export interface User {
  id: string;
  email: string;
  nome: string;
  tipo: 'cliente' | 'feirante';
  telefone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Feira {
  id: string;
  nome: string;
  localizacao: string;
  descricao: string;
  diaDaSemana: number; // 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado
  horaInicio: string;
  horaFim: string;
  imagem: string;
}

export interface Feirante {
  id: string;
  userId: string;
  feiraId: string;
  nomeEstande: string;
  descricao: string;
  categoria: string;
  avatar: string;
  avaliacao: number;
  numAvaliacoes: number;
}

export interface Produto {
  id: string;
  feiranteId: string;
  nome: string;
  descricao: string;
  preco: number;
  unidade: string;
  categoria: string;
  imagem: string;
  estoque: number;
  disponivel: boolean;
}

export interface ItemCarrinho {
  id: string; // UUID do produto
  nome: string;
  preco: number;
  unidade: string;
  quantidade: number;
  feiranteId: string; // UUID do feirante
  feiraId: string | null; // UUID da feira (pode ser null se feirante não está vinculado a feira)
  feiranteNome: string;
}

export interface Pedido {
  id: string;
  clienteId: string;
  feiranteId: string;
  feiraId: string;
  itens: {
    produtoId: string;
    nomeProduto: string;
    quantidade: number;
    preco: number;
  }[];
  total: number;
  status: 'pendente' | 'confirmado' | 'pronto' | 'entregue' | 'cancelado';
  dataCriacao: string;
  observacoes?: string;
}
