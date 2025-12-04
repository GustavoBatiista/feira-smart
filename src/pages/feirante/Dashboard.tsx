import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, ShoppingCart, TrendingUp, DollarSign, Calendar, MapPin, Store, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Feira } from "@/types";

const DIAS_DA_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const getDiaDaSemanaNome = (dia: number): string => {
  return DIAS_DA_SEMANA[dia] || 'Dia inválido';
};

// Função para obter o dia da semana atual (0=domingo, 1=segunda, ..., 6=sábado)
const getDiaAtual = (): number => {
  return new Date().getDay();
};

// Função para verificar se uma feira está disponível hoje
const isFeiraDisponivelHoje = (diaDaSemana: number): boolean => {
  return diaDaSemana === getDiaAtual();
};

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [feiras, setFeiras] = useState<Feira[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeira, setSelectedFeira] = useState<Feira | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nomeEstande: '',
    descricao: '',
    categoria: '',
  });
  const [stats, setStats] = useState({
    produtosAtivos: 0,
    pedidosHoje: 0,
    faturamentoHoje: 0,
    crescimento: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [minhasFeiras, setMinhasFeiras] = useState<any[]>([]);
  const [isLoadingMinhasFeiras, setIsLoadingMinhasFeiras] = useState(true);
  const [selectedBarraca, setSelectedBarraca] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nomeEstande: '',
    descricao: '',
    categoria: '',
  });
  const [barracaParaRemover, setBarracaParaRemover] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Proteção de rota: redirecionar se não for feirante
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.tipo !== 'feirante') {
        navigate('/feiras');
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && user.tipo === 'feirante') {
      fetchFeiras();
      fetchStats();
      fetchMinhasFeiras();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await api.feirantes.getDashboardStats();
      if (data) {
        setStats({
          produtosAtivos: data.produtosAtivos || 0,
          pedidosHoje: data.pedidosHoje || 0,
          faturamentoHoje: data.faturamentoHoje || 0,
          crescimento: data.crescimento || 0,
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: error.message || "Não foi possível carregar as estatísticas",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchFeiras = async () => {
    try {
      // Buscar todas as feiras cadastradas
      const data = await api.feiras.list();
      
      console.log('Feiras retornadas da API:', data?.length || 0);

      if (data) {
        setFeiras(data.map((f: any) => ({
          id: f.id,
          nome: f.nome,
          localizacao: f.localizacao,
          descricao: f.descricao || '',
          diaDaSemana: f.dia_da_semana ?? f.diaDaSemana ?? 0,
          horaInicio: f.hora_inicio || f.horaInicio || '',
          horaFim: f.hora_fim || f.horaFim || '',
          imagem: f.imagem || '',
        })));
      }
    } catch (error: any) {
      console.error('Error fetching feiras:', error);
      toast({
        title: "Erro ao carregar feiras",
        description: error.message || "Não foi possível carregar as feiras disponíveis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMinhasFeiras = async () => {
    try {
      setIsLoadingMinhasFeiras(true);
      const data = await api.feirantes.getMinhasFeiras();
      if (data) {
        setMinhasFeiras(data);
      }
    } catch (error: any) {
      console.error('Erro ao buscar minhas feiras:', error);
      toast({
        title: "Erro ao carregar suas feiras",
        description: error.message || "Não foi possível carregar as feiras cadastradas",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMinhasFeiras(false);
    }
  };

  const handleEditarBarraca = (barraca: any) => {
    setSelectedBarraca(barraca);
    setEditFormData({
      nomeEstande: barraca.nomeEstande || '',
      descricao: barraca.descricao || '',
      categoria: barraca.categoria || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleAtualizarBarraca = async () => {
    if (!selectedBarraca) return;

    if (!editFormData.nomeEstande || !editFormData.categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome do estande e a categoria",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await api.feirantes.update(selectedBarraca.feiranteId, {
        nomeEstande: editFormData.nomeEstande,
        descricao: editFormData.descricao || null,
        categoria: editFormData.categoria,
      });

      toast({
        title: "Barraca atualizada!",
        description: `Os dados da sua barraca foram atualizados com sucesso`,
      });

      setIsEditDialogOpen(false);
      setEditFormData({ nomeEstande: '', descricao: '', categoria: '' });
      setSelectedBarraca(null);
      fetchMinhasFeiras(); // Atualizar lista de feiras cadastradas
    } catch (error: any) {
      console.error('❌ Erro ao atualizar barraca:', error);
      
      let errorMessage = error.message || "Não foi possível atualizar a barraca";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Erro ao atualizar barraca",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRemoverBarraca = (barraca: any) => {
    setBarracaParaRemover(barraca);
    setIsDeleteDialogOpen(true);
  };

  const confirmarRemocao = async () => {
    if (!barracaParaRemover) return;

    try {
      await api.feirantes.delete(barracaParaRemover.feiranteId);

      toast({
        title: "Barraca removida!",
        description: `Sua barraca foi removida da feira ${barracaParaRemover.feira?.nome}`,
      });

      setIsDeleteDialogOpen(false);
      setBarracaParaRemover(null);
      fetchMinhasFeiras(); // Atualizar lista de feiras cadastradas
      fetchStats(); // Atualizar estatísticas
    } catch (error: any) {
      console.error('❌ Erro ao remover barraca:', error);
      
      let errorMessage = error.message || "Não foi possível remover a barraca";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Erro ao remover barraca",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCadastro = async () => {
    if (!user || !selectedFeira) {
      toast({
        title: "Erro",
        description: "Usuário ou feira não encontrados",
        variant: "destructive",
      });
      return;
    }

    if (!formData.nomeEstande || !formData.categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome do estande e a categoria",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o token está presente
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Erro de autenticação",
        description: "Sua sessão expirou. Por favor, faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    console.log('Iniciando cadastro de feirante:', {
      user_id: user.id,
      feira_id: selectedFeira.id,
      nome_estande: formData.nomeEstande,
      descricao: formData.descricao,
      categoria: formData.categoria,
    });

    try {
      const data = await api.feirantes.create({
        feira_id: selectedFeira.id,
        nome_estande: formData.nomeEstande,
        descricao: formData.descricao || null,
        categoria: formData.categoria,
      });

      console.log('✅ Cadastro realizado com sucesso:', data);

      toast({
        title: "Cadastro realizado!",
        description: `Você foi cadastrado na feira ${selectedFeira.nome}`,
      });

      setIsDialogOpen(false);
      setFormData({ nomeEstande: '', descricao: '', categoria: '' });
      setSelectedFeira(null);
      fetchStats(); // Atualizar estatísticas após cadastro
      fetchMinhasFeiras(); // Atualizar lista de feiras cadastradas
    } catch (error: any) {
      console.error('❌ Erro ao cadastrar feirante:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        status: error.status,
        stack: error.stack,
        response: error.response,
      });

      // Extrair mensagem de erro mais detalhada se disponível
      let errorMessage = error.message || "Não foi possível realizar o cadastro";
      
      // Tentar extrair a mensagem do objeto de erro de diferentes formas
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.message === 'string' && error.message !== `Erro ${error.status}: Bad Request`) {
        // Usar a mensagem do erro se não for a genérica
        errorMessage = error.message;
      }
      
      // Mensagens de erro mais específicas
      if (errorMessage.includes('já está cadastrado') || errorMessage.includes('já cadastrado')) {
        errorMessage = "Você já está cadastrado nesta feira";
      } else if (errorMessage.includes('Feira e nome do estande são obrigatórios')) {
        errorMessage = "Preencha todos os campos obrigatórios";
      } else if (errorMessage.includes('Não foi possível conectar à API')) {
        errorMessage = "Erro de conexão com o servidor. Verifique se a API está funcionando.";
      } else if (errorMessage.includes('Token') || errorMessage.includes('token') || error.status === 401) {
        errorMessage = "Sua sessão expirou. Faça login novamente.";
      } else if (error.status === 403) {
        errorMessage = "Você não tem permissão para realizar esta ação. Apenas feirantes podem se cadastrar em feiras.";
      } else if (error.status === 400) {
        // Se for erro 400 e a mensagem ainda for genérica, tentar mais específica
        if (errorMessage === `Erro ${error.status}: Bad Request` || !errorMessage || errorMessage === "Não foi possível realizar o cadastro") {
          errorMessage = error.response?.data?.error || "Dados inválidos. Verifique os campos preenchidos.";
        }
      } else if (error.status === 404) {
        errorMessage = "Feira não encontrada.";
      } else if (error.status === 500) {
        errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
      }
      
      // Se ainda não temos uma mensagem útil, usar uma genérica baseada no status
      if (!errorMessage || errorMessage === `Erro ${error.status}: Bad Request`) {
        errorMessage = "Não foi possível realizar o cadastro. Tente novamente.";
      }

      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatGrowth = (value: number) => {
    if (value > 0) {
      return `+${value.toFixed(1)}%`;
    } else if (value < 0) {
      return `${value.toFixed(1)}%`;
    }
    return '0%';
  };

  // Filtrar feiras por nome ou localização
  const filteredFeiras = useMemo(() => {
    if (!searchTerm.trim()) {
      return feiras;
    }

    const term = searchTerm.toLowerCase().trim();
    return feiras.filter((feira) => {
      const nomeMatch = feira.nome.toLowerCase().includes(term);
      const localizacaoMatch = feira.localizacao.toLowerCase().includes(term);
      return nomeMatch || localizacaoMatch;
    });
  }, [feiras, searchTerm]);

  // Mostrar loading enquanto autenticação está carregando ou se não for feirante
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.tipo !== 'feirante') {
    return null; // O useEffect vai redirecionar
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Olá, {user?.nome}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas feiras e cadastre-se em novas
          </p>
        </div>

        {/* Minhas Feiras Cadastradas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Minhas Feiras</h2>
          
          {isLoadingMinhasFeiras ? (
            <div className="text-center py-8">Carregando suas feiras...</div>
          ) : minhasFeiras.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Você ainda não está cadastrado em nenhuma feira.
                <p className="text-sm mt-2">Cadastre-se em uma feira disponível abaixo para começar a vender.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {minhasFeiras.map((item: any) => {
                const feira = item.feira;
                const disponivelHoje = isFeiraDisponivelHoje(feira?.diaDaSemana || 0);
                
                return (
                  <Card 
                    key={item.feiranteId} 
                    className={`hover:shadow-lg transition-shadow ${
                      disponivelHoje 
                        ? 'ring-2 ring-green-500 ring-offset-2 border-green-500/50' 
                        : ''
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <Store className="h-5 w-5 text-primary" />
                          <span className="line-clamp-1">{feira?.nome}</span>
                        </div>
                        {disponivelHoje && (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg shrink-0">
                            Hoje
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-primary">Sua Barraca:</p>
                        <p className="text-sm font-medium">{item.nomeEstande}</p>
                        {item.categoria && (
                          <p className="text-xs text-muted-foreground mt-1">Categoria: {item.categoria}</p>
                        )}
                      </div>
                      
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">{feira?.localizacao}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">
                          {getDiaDaSemanaNome(feira?.diaDaSemana || 0)}
                        </span>
                      </div>
                      {feira?.descricao && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {feira.descricao}
                        </p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleEditarBarraca(item)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => navigate(`/feirante/produtos?feirante_id=${item.feiranteId}`)}
                        >
                          Produtos
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleRemoverBarraca(item)}
                          className="shrink-0"
                          title="Remover barraca"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Feiras Disponíveis */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Feiras Disponíveis</h2>
          
          {/* Barra de Pesquisa */}
          {!isLoading && feiras.length > 0 && (
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nome ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">Carregando feiras...</div>
          ) : feiras.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma feira disponível no momento
              </CardContent>
            </Card>
          ) : filteredFeiras.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma feira encontrada para "{searchTerm}".
                <p className="text-sm mt-2">Tente buscar por outro termo.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeiras.map((feira) => {
                const disponivelHoje = isFeiraDisponivelHoje(feira.diaDaSemana);
                
                return (
                <Card 
                  key={feira.id} 
                  className={`hover:shadow-lg transition-shadow ${
                    disponivelHoje 
                      ? 'ring-2 ring-primary ring-offset-2 border-primary/50' 
                      : ''
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Store className="h-5 w-5 text-primary" />
                        <span className="line-clamp-1">{feira.nome}</span>
                      </div>
                      {disponivelHoje && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg shrink-0">
                          Disponível
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{feira.localizacao}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-muted-foreground">
                          {getDiaDaSemanaNome(feira.diaDaSemana)}
                        </span>
                        {disponivelHoje && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Hoje
                          </Badge>
                        )}
                      </div>
                    </div>
                    {feira.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {feira.descricao}
                      </p>
                    )}
                    <Dialog open={isDialogOpen && selectedFeira?.id === feira.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) {
                        setSelectedFeira(null);
                        setFormData({ nomeEstande: '', descricao: '', categoria: '' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full mt-4" 
                          onClick={() => setSelectedFeira(feira)}
                        >
                          Cadastrar-se nesta feira
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cadastrar em {feira.nome}</DialogTitle>
                          <DialogDescription>
                            Preencha os dados do seu estande
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="nomeEstande">Nome do Estande *</Label>
                            <Input
                              id="nomeEstande"
                              placeholder="Ex: Frutas do João"
                              value={formData.nomeEstande}
                              onChange={(e) => setFormData({ ...formData, nomeEstande: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="categoria">Categoria *</Label>
                            <Input
                              id="categoria"
                              placeholder="Ex: Frutas e Verduras"
                              value={formData.categoria}
                              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea
                              id="descricao"
                              placeholder="Descreva seus produtos..."
                              value={formData.descricao}
                              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <Button onClick={handleCadastro} className="w-full">
                            Confirmar Cadastro
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Produtos Ativos
              </CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="text-3xl font-bold text-foreground animate-pulse">...</div>
              ) : (
                <div className="text-3xl font-bold text-foreground">{stats.produtosAtivos}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                produtos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pedidos Hoje
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="text-3xl font-bold text-foreground animate-pulse">...</div>
              ) : (
                <div className="text-3xl font-bold text-foreground">{stats.pedidosHoje}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                novos pedidos
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Faturamento
              </CardTitle>
              <DollarSign className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="text-3xl font-bold text-foreground animate-pulse">...</div>
              ) : (
                <div className="text-3xl font-bold text-foreground">{formatCurrency(stats.faturamentoHoje)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                hoje
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Crescimento
              </CardTitle>
              <TrendingUp className={`h-5 w-5 ${stats.crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="text-3xl font-bold text-foreground animate-pulse">...</div>
              ) : (
                <div className={`text-3xl font-bold ${stats.crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatGrowth(stats.crescimento)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                vs. semana passada
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Edição da Barraca */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setSelectedBarraca(null);
          setEditFormData({ nomeEstande: '', descricao: '', categoria: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Barraca</DialogTitle>
            <DialogDescription>
              Atualize os dados da sua barraca na feira {selectedBarraca?.feira?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editNomeEstande">Nome do Estande *</Label>
              <Input
                id="editNomeEstande"
                placeholder="Ex: Frutas do João"
                value={editFormData.nomeEstande}
                onChange={(e) => setEditFormData({ ...editFormData, nomeEstande: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCategoria">Categoria *</Label>
              <Input
                id="editCategoria"
                placeholder="Ex: Frutas e Verduras"
                value={editFormData.categoria}
                onChange={(e) => setEditFormData({ ...editFormData, categoria: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescricao">Descrição</Label>
              <Textarea
                id="editDescricao"
                placeholder="Descreva seus produtos..."
                value={editFormData.descricao}
                onChange={(e) => setEditFormData({ ...editFormData, descricao: e.target.value })}
                rows={3}
              />
            </div>
            <Button onClick={handleAtualizarBarraca} className="w-full">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação de Remoção */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Barraca?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover sua barraca "{barracaParaRemover?.nomeEstande}" da feira "{barracaParaRemover?.feira?.nome}"?
              <br />
              <br />
              <strong>Esta ação não pode ser desfeita.</strong> Todos os produtos e dados relacionados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBarracaParaRemover(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarRemocao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
