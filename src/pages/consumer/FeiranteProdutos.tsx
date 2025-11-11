import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export default function FeiranteProdutos() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const feirante = {
    id: Number(id),
    nome: "João Silva",
    especialidade: "Frutas e Verduras",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao"
  };

  const produtos = [
    {
      id: 1,
      nome: "Tomate Orgânico",
      preco: 8.5,
      unidade: "kg",
      categoria: "Legumes",
      estoque: 50,
      descricao: "Tomates frescos e orgânicos"
    },
    {
      id: 2,
      nome: "Alface Crespa",
      preco: 3.5,
      unidade: "unidade",
      categoria: "Verduras",
      estoque: 30,
      descricao: "Alface fresca colhida hoje"
    },
    {
      id: 3,
      nome: "Cenoura",
      preco: 6.0,
      unidade: "kg",
      categoria: "Legumes",
      estoque: 45,
      descricao: "Cenouras orgânicas e crocantes"
    },
    {
      id: 4,
      nome: "Rúcula",
      preco: 4.0,
      unidade: "maço",
      categoria: "Verduras",
      estoque: 20,
      descricao: "Rúcula fresca e saborosa"
    }
  ];

  const filteredProdutos = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (produtoId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [produtoId]: Math.max(0, (prev[produtoId] || 0) + delta)
    }));
  };

  const handleAddToCart = (produto: typeof produtos[0]) => {
    const quantity = quantities[produto.id] || 1;
    addToCart({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      unidade: produto.unidade,
      quantidade: quantity,
      feiranteId: feirante.id,
      feiranteNome: feirante.nome
    });
    toast.success(`${produto.nome} adicionado ao carrinho!`);
    setQuantities(prev => ({ ...prev, [produto.id]: 0 }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to={`/feira/1/detalhes`}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-background overflow-hidden">
              <img
                src={feirante.foto}
                alt={feirante.nome}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{feirante.nome}</h1>
              <p className="text-muted-foreground">{feirante.especialidade}</p>
            </div>
          </div>
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
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{produto.nome}</h3>
                    <Badge variant="outline">{produto.categoria}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{produto.descricao}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      R$ {produto.preco.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      por {produto.unidade}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Estoque: {produto.estoque} {produto.unidade}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => handleQuantityChange(produto.id, -1)}
                      disabled={(quantities[produto.id] || 0) <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">
                      {quantities[produto.id] || 0}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => handleQuantityChange(produto.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => handleAddToCart(produto)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Adicionar
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
