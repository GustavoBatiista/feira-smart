import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, MapPin, User } from "lucide-react";

export default function Pedidos() {
  const pedidos = [
    {
      id: 1,
      numero: "1001",
      data: "2024-01-15",
      feira: "Feira Orgânica do Parque",
      status: "pendente" as const,
      total: 45.50,
      items: [
        { nome: "Tomate Orgânico", quantidade: 2, unidade: "kg" },
        { nome: "Alface Crespa", quantidade: 3, unidade: "unidade" }
      ]
    },
    {
      id: 2,
      numero: "1002",
      data: "2024-01-12",
      feira: "Feira da Praça",
      status: "retirado" as const,
      total: 67.80,
      items: [
        { nome: "Cenoura", quantidade: 3, unidade: "kg" },
        { nome: "Banana Prata", quantidade: 2, unidade: "kg" }
      ]
    },
    {
      id: 3,
      numero: "1003",
      data: "2024-01-10",
      feira: "Feira Orgânica do Parque",
      status: "cancelado" as const,
      total: 32.00,
      items: [
        { nome: "Rúcula", quantidade: 4, unidade: "maço" }
      ]
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pendente":
        return "default";
      case "retirado":
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
        return "Aguardando Retirada";
      case "retirado":
        return "Retirado";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

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
                      {pedido.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-foreground">
                            {item.quantidade}x {item.nome}
                          </span>
                          <span className="text-muted-foreground">
                            {item.quantidade} {item.unidade}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-muted-foreground">Total: </span>
                      <span className="text-xl font-bold text-primary">
                        R$ {pedido.total.toFixed(2)}
                      </span>
                    </div>
                    <Button variant="outline">Ver Detalhes</Button>
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
