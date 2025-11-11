import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, User, Phone, Calendar, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function PedidosFeirante() {
  const [pedidos, setPedidos] = useState([
    {
      id: 1,
      numero: "1001",
      data: "2024-01-15",
      cliente: "Ana Silva",
      telefone: "(11) 98765-4321",
      status: "pendente" as const,
      total: 45.50,
      items: [
        { nome: "Tomate Orgânico", quantidade: 2, unidade: "kg", preco: 17.00 },
        { nome: "Alface Crespa", quantidade: 3, unidade: "unidade", preco: 10.50 }
      ]
    },
    {
      id: 2,
      numero: "1002",
      data: "2024-01-15",
      cliente: "Carlos Santos",
      telefone: "(11) 91234-5678",
      status: "pendente" as const,
      total: 67.80,
      items: [
        { nome: "Cenoura", quantidade: 3, unidade: "kg", preco: 18.00 },
        { nome: "Rúcula", quantidade: 4, unidade: "maço", preco: 16.00 }
      ]
    },
    {
      id: 3,
      numero: "1003",
      data: "2024-01-14",
      cliente: "Maria Oliveira",
      telefone: "(11) 99876-5432",
      status: "concluido" as const,
      total: 32.00,
      items: [
        { nome: "Alface Crespa", quantidade: 2, unidade: "unidade", preco: 7.00 }
      ]
    }
  ]);

  const handleConcluir = (pedidoId: number) => {
    setPedidos(prevPedidos =>
      prevPedidos.map(p =>
        p.id === pedidoId ? { ...p, status: "concluido" as const } : p
      )
    );
    toast.success("Pedido marcado como concluído!");
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pendente":
        return "default";
      case "concluido":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "concluido":
        return "Concluído";
      default:
        return status;
    }
  };

  const pedidosPendentes = pedidos.filter(p => p.status === "pendente");
  const pedidosConcluidos = pedidos.filter(p => p.status === "concluido");

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
              {pedido.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    {item.quantidade}x {item.nome}
                  </span>
                  <span className="font-medium text-primary">
                    R$ {item.preco.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground">Total: </span>
            <span className="text-xl font-bold text-primary">
              R$ {pedido.total.toFixed(2)}
            </span>
          </div>
          {pedido.status === "pendente" && (
            <Button
              className="gap-2"
              onClick={() => handleConcluir(pedido.id)}
            >
              <CheckCircle className="h-4 w-4" />
              Marcar como Retirado
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
