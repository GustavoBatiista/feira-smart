import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Calendar, Store } from "lucide-react";

export default function FeiraDetalhes() {
  const { id } = useParams();

  const feira = {
    id: Number(id),
    nome: "Feira Orgânica do Parque",
    local: "Parque da Cidade",
    endereco: "Av. Principal, 123 - Centro",
    horario: "07:00 - 14:00",
    dias: "Sábados e Domingos",
    status: "aberta" as const,
    descricao: "Feira com produtos orgânicos frescos diretamente dos produtores locais."
  };

  const feirantes = [
    {
      id: 1,
      nome: "João Silva",
      especialidade: "Frutas e Verduras",
      produtos: 24,
      foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao"
    },
    {
      id: 2,
      nome: "Maria Santos",
      especialidade: "Laticínios",
      produtos: 15,
      foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria"
    },
    {
      id: 3,
      nome: "Pedro Oliveira",
      especialidade: "Grãos e Cereais",
      produtos: 18,
      foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=pedro"
    },
    {
      id: 4,
      nome: "Ana Costa",
      especialidade: "Produtos Naturais",
      produtos: 12,
      foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/feiras">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Feiras
          </Button>
        </Link>

        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{feira.nome}</h1>
                <Badge variant={feira.status === "aberta" ? "default" : "secondary"}>
                  {feira.status === "aberta" ? "Aberta" : "Fechada"}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{feira.descricao}</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{feira.endereco}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{feira.horario}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{feira.dias}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Feirantes Participantes</h2>
          <p className="text-muted-foreground">
            Confira os produtos de cada feirante
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {feirantes.map((feirante) => (
            <Link key={feirante.id} to={`/feirante/${feirante.id}/produtos`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 mb-4 overflow-hidden">
                      <img
                        src={feirante.foto}
                        alt={feirante.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {feirante.nome}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {feirante.especialidade}
                    </p>
                    <div className="flex items-center gap-2 text-primary">
                      <Store className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {feirante.produtos} produtos
                      </span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    Ver Produtos
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
