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
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
  imagem: string;
  status: 'ativa' | 'encerrada' | 'agendada';
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
  id: number;
  nome: string;
  preco: number;
  unidade: string;
  quantidade: number;
  feiranteId: number;
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
