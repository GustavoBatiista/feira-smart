import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, MapPin, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface PedidoItem {
  nome: string;
  quantidade: number;
  unidade?: string;
  preco: number;
}

interface Pedido {
  id: string;
  numero: string;
  data: string;
  feira: string;
  status: 'pendente' | 'confirmado' | 'pronto' | 'entregue' | 'cancelado';
  total: number;
  items: PedidoItem[];
}

export default function Pedidos() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proteção de rota: redirecionar se não for cliente
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setIsLoading(false);
        navigate('/login');
        return;
      } else if (user.tipo !== 'cliente') {
        setIsLoading(false);
        navigate('/feiras');
        return;
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Só buscar pedidos se o usuário estiver autenticado, for cliente e não estiver carregando
    if (!authLoading && user && user.tipo === 'cliente') {
      fetchPedidos();
    } else if (!authLoading && (!user || user.tipo !== 'cliente')) {
      // Se não for cliente ou não estiver autenticado, não precisa carregar
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const fetchPedidos = async () => {
    // Verificar novamente antes de fazer a requisição
    if (!user || user.tipo !== 'cliente') {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await api.pedidos.list();

      if (data && Array.isArray(data)) {
        const pedidosFormatados: Pedido[] = data.map((p: any, index: number) => {
          // Gerar número do pedido baseado no ID (pegar últimos 4 caracteres em maiúsculas)
          const numeroPedido = p.id?.toString().slice(-4).toUpperCase() || String(index + 1).padStart(4, '0');
          
          // Mapear itens do banco para o formato esperado
          const items: PedidoItem[] = (p.itens || []).map((item: any) => ({
            nome: item.nome_produto || 'Produto',
            quantidade: parseInt(item.quantidade) || 0,
            unidade: item.unidade || '',
            preco: parseFloat(item.preco) || 0,
          }));

          return {
            id: p.id,
            numero: numeroPedido,
            data: p.created_at || new Date().toISOString(),
            feira: p.feira_nome || 'Feira',
            status: p.status || 'pendente',
            total: parseFloat(p.total) || 0,
            items: items,
          };
        });

        setPedidos(pedidosFormatados);
      }
    } catch (err: any) {
      console.error('Erro ao buscar pedidos:', err);
      let errorMessage = err.message || "Não foi possível carregar os pedidos";
      
      // Melhorar mensagens de erro específicas
      if (errorMessage.includes('conectar') || errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
        errorMessage = "Erro de conexão com o servidor. Verifique se a API está rodando em http://localhost:3001";
      } else if (errorMessage.includes('Resposta inválida')) {
        errorMessage = "Erro de comunicação com o servidor. Verifique se a API está funcionando.";
      } else if (errorMessage.includes('Token') || (err as any).status === 401) {
        errorMessage = "Sua sessão expirou. Faça login novamente.";
      } else if ((err as any).status === 403) {
        errorMessage = "Você não tem permissão para ver pedidos. Verifique se está logado como cliente.";
      }
      
      setError(errorMessage);
      toast({
        title: "Erro ao carregar pedidos",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pendente":
        return "default";
      case "confirmado":
        return "default";
      case "pronto":
        return "secondary";
      case "entregue":
        return "secondary";
      case "cancelado":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "confirmado":
        return "Confirmado";
      case "pronto":
        return "Pronto para Retirada";
      case "entregue":
        return "Entregue";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Erro ao carregar pedidos
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchPedidos}>Tentar novamente</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Meus Pedidos</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe suas reservas e histórico
          </p>
        </div>

        {pedidos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Nenhum pedido ainda
              </h2>
              <p className="text-muted-foreground">
                Faça sua primeira reserva nas feiras
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pedidos.map((pedido) => (
              <Card key={pedido.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Pedido #{pedido.numero}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(pedido.data).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(pedido.status)}>
                      {getStatusLabel(pedido.status)}
                    </Badge>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{pedido.feira}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {pedido.items && pedido.items.length > 0 ? (
                        pedido.items.map((item, idx) => {
                          const subtotal = item.preco * item.quantidade;
                          return (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-foreground">
                                {item.quantidade}x {item.nome}
                              </span>
                              <span className="font-medium text-primary">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(subtotal)}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum item cadastrado</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-muted-foreground">Total: </span>
                      <span className="text-xl font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(pedido.total)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
