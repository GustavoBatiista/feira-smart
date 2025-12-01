import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, User, Phone, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";

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
  cliente: string;
  telefone: string;
  status: 'pendente' | 'confirmado' | 'pronto' | 'entregue' | 'cancelado';
  total: number;
  items: PedidoItem[];
}

export default function PedidosFeirante() {
  const { user, isLoading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && user.tipo === 'feirante') {
      fetchPedidos();
    }
  }, [user, authLoading]);

  const fetchPedidos = async () => {
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
            nome: item.nomeProduto || item.nome_produto || 'Produto',
            quantidade: parseInt(item.quantidade) || 0,
            unidade: item.unidade || '',
            preco: parseFloat(item.preco) || 0,
          }));

          return {
            id: p.id,
            numero: numeroPedido,
            data: p.createdAt || p.created_at || new Date().toISOString(),
            cliente: p.cliente?.nome || p.cliente_nome || 'Cliente',
            telefone: p.cliente?.telefone || p.cliente_telefone || 'Não informado',
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
      if (errorMessage.includes('Resposta inválida')) {
        errorMessage = "Erro de comunicação com o servidor. Verifique se a API está funcionando.";
      } else if (errorMessage.includes('Token')) {
        errorMessage = "Sua sessão expirou. Faça login novamente.";
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

  const handleConcluir = async (pedidoId: string) => {
    try {
      await api.pedidos.updateStatus(pedidoId, 'entregue');
      
      // Atualizar estado local
      setPedidos(prevPedidos =>
        prevPedidos.map(p =>
          p.id === pedidoId ? { ...p, status: 'entregue' as const } : p
        )
      );
      
      toast({
        title: "Pedido atualizado",
        description: "Pedido marcado como entregue!",
      });
    } catch (err: any) {
      console.error('Erro ao atualizar pedido:', err);
      toast({
        title: "Erro ao atualizar pedido",
        description: err.message || "Não foi possível atualizar o pedido",
        variant: "destructive",
      });
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
        return "Pronto";
      case "entregue":
        return "Entregue";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  // Pedidos que ainda não foram entregues ou cancelados
  const pedidosPendentes = pedidos.filter(p => 
    p.status === 'pendente' || p.status === 'confirmado' || p.status === 'pronto'
  );
  
  // Pedidos entregues ou cancelados
  const pedidosConcluidos = pedidos.filter(p => 
    p.status === 'entregue' || p.status === 'cancelado'
  );

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

  const PedidoCard = ({ pedido }: { pedido: typeof pedidos[0] }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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

        <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{pedido.cliente}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{pedido.telefone}</span>
          </div>

          <div className="border-t pt-3 mt-3">
            <p className="text-sm font-medium text-foreground mb-2">Itens:</p>
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
          {(pedido.status === "pendente" || pedido.status === "confirmado" || pedido.status === "pronto") && (
            <Button
              className="gap-2"
              onClick={() => handleConcluir(pedido.id)}
            >
              <CheckCircle className="h-4 w-4" />
              Marcar como Entregue
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Pedidos Recebidos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os pedidos dos seus clientes
          </p>
        </div>

        <Tabs defaultValue="pendentes" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
            <TabsTrigger value="pendentes">
              Pendentes ({pedidosPendentes.length})
            </TabsTrigger>
            <TabsTrigger value="concluidos">
              Concluídos ({pedidosConcluidos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes">
            {pedidosPendentes.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Nenhum pedido pendente
                  </h2>
                  <p className="text-muted-foreground">
                    Novos pedidos aparecerão aqui
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {pedidosPendentes.map((pedido) => (
                  <PedidoCard key={pedido.id} pedido={pedido} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="concluidos">
            {pedidosConcluidos.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Nenhum pedido concluído
                  </h2>
                  <p className="text-muted-foreground">
                    Pedidos finalizados aparecerão aqui
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {pedidosConcluidos.map((pedido) => (
                  <PedidoCard key={pedido.id} pedido={pedido} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
