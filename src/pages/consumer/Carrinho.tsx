import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";

export default function Carrinho() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isFinalizing, setIsFinalizing] = useState(false);

  const finalizarReserva = async () => {
    if (!user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para finalizar a reserva",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar",
        variant: "destructive",
      });
      return;
    }

    // Agrupar itens por feirante (assumindo que todos os itens são do mesmo feirante)
    // Se houver itens de feirantes diferentes, criamos um pedido para cada
    const itemsPorFeirante = items.reduce((acc, item) => {
      const key = `${item.feiranteId}-${item.feiraId}`;
      if (!acc[key]) {
        acc[key] = {
          feiranteId: item.feiranteId,
          feiraId: item.feiraId,
          items: []
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {} as Record<string, { feiranteId: string; feiraId: string; items: typeof items }>);

    setIsFinalizing(true);

    try {
      // Criar um pedido para cada feirante
      const promises = Object.values(itemsPorFeirante).map(async (grupo) => {
        const itensFormatados = grupo.items.map(item => ({
          produto_id: item.id,
          nome_produto: item.nome,
          quantidade: item.quantidade,
          preco: item.preco
        }));

        return api.pedidos.create({
          feirante_id: grupo.feiranteId,
          feira_id: grupo.feiraId,
          itens: itensFormatados,
          observacoes: null
        });
      });

      await Promise.all(promises);

      toast({
        title: "Reserva finalizada!",
        description: "Seu pedido foi enviado e estará em reserva. Você receberá atualizações em breve.",
      });

      clearCart();
      navigate('/pedidos');
    } catch (error: any) {
      console.error('Erro ao finalizar reserva:', error);
      toast({
        title: "Erro ao finalizar reserva",
        description: error.message || "Não foi possível finalizar a reserva. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Seu carrinho está vazio
          </h2>
          <p className="text-muted-foreground mb-6">
            Adicione produtos das feiras para fazer sua reserva
          </p>
          <Link to="/feiras">
            <Button>Ver Feiras</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/feiras">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continuar Comprando
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-foreground">
                    Meu Carrinho
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive"
                  >
                    Limpar carrinho
                  </Button>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          Feirante: {item.feiranteNome}
                        </p>
                        <p className="text-sm font-medium text-primary mt-1">
                          R$ {item.preco.toFixed(2)} / {item.unidade}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium text-sm">
                            {item.quantidade}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-foreground">
                          R$ {(item.preco * item.quantidade).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Resumo do Pedido
                </h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de reserva</span>
                    <span className="font-medium">R$ 0,00</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between mb-6">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-primary">
                    R$ {total.toFixed(2)}
                  </span>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={finalizarReserva}
                  disabled={isFinalizing || items.length === 0}
                >
                  {isFinalizing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Finalizando...
                    </>
                  ) : (
                    "Finalizar Reserva"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Você pagará na retirada dos produtos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
