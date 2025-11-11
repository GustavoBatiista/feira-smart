import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Produtos Ativos",
      value: "24",
      description: "produtos cadastrados",
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Pedidos Hoje",
      value: "12",
      description: "novos pedidos",
      icon: ShoppingCart,
      color: "text-secondary"
    },
    {
      title: "Faturamento",
      value: "R$ 1.240",
      description: "hoje",
      icon: DollarSign,
      color: "text-accent"
    },
    {
      title: "Crescimento",
      value: "+18%",
      description: "vs. semana passada",
      icon: TrendingUp,
      color: "text-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Olá, {user?.nome}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao seu painel de controle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Pedidos</CardTitle>
              <CardDescription>Pedidos recentes dos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Pedido #{1000 + i}</p>
                      <p className="text-sm text-muted-foreground">Cliente {i}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">R$ {(45 + i * 20).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Pendente</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos em Destaque</CardTitle>
              <CardDescription>Seus produtos mais vendidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Tomate Orgânico", "Alface Crespa", "Cenoura"].map((produto, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{produto}</p>
                      <p className="text-sm text-muted-foreground">{15 - i * 2} vendas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-secondary">R$ {(8 + i * 2).toFixed(2)}/kg</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
