import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Produtos() {
  const [searchTerm, setSearchTerm] = useState("");

  const produtos = [
    {
      id: 1,
      nome: "Tomate Orgânico",
      preco: 8.5,
      unidade: "kg",
      estoque: 50,
      categoria: "Legumes",
      disponivel: true
    },
    {
      id: 2,
      nome: "Alface Crespa",
      preco: 3.5,
      unidade: "unidade",
      estoque: 30,
      categoria: "Verduras",
      disponivel: true
    },
    {
      id: 3,
      nome: "Cenoura",
      preco: 6.0,
      unidade: "kg",
      estoque: 5,
      categoria: "Legumes",
      disponivel: true
    },
    {
      id: 4,
      nome: "Banana Prata",
      preco: 5.5,
      unidade: "kg",
      estoque: 0,
      categoria: "Frutas",
      disponivel: false
    }
  ];

  const filteredProdutos = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meus Produtos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seu catálogo de produtos
            </p>
          </div>
          <Link to="/feirante/produtos/novo">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Produto
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProdutos.map((produto) => (
            <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{produto.nome}</h3>
                    <p className="text-sm text-muted-foreground">{produto.categoria}</p>
                  </div>
                  <Badge variant={produto.disponivel ? "default" : "secondary"}>
                    {produto.disponivel ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço</span>
                    <span className="font-semibold text-primary">
                      R$ {produto.preco.toFixed(2)}/{produto.unidade}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estoque</span>
                    <span className={`font-medium ${produto.estoque < 10 ? 'text-destructive' : 'text-foreground'}`}>
                      {produto.estoque} {produto.unidade}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/feirante/produtos/${produto.id}/editar`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProdutos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
