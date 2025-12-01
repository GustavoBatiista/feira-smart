import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Produto } from "@/types";

export default function FeiranteProdutos() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [feirante, setFeirante] = useState<any>(null);
  const [feiraId, setFeiraId] = useState<string | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isLoadingFeirante, setIsLoadingFeirante] = useState(true);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchFeirante();
      fetchProdutos();
    }
  }, [id]);

  const fetchFeirante = async () => {
    if (!id) return;
    
    try {
      setIsLoadingFeirante(true);
      setError(null);
      
      const data = await api.feirantes.get(id);
      setFeirante(data);
      setFeiraId(data.feira_id); // Guardar feira_id para o botão voltar
    } catch (err: any) {
      console.error('Erro ao buscar feirante:', err);
      setError('Erro ao carregar informações do feirante.');
    } finally {
      setIsLoadingFeirante(false);
    }
  };

  const fetchProdutos = async () => {
    if (!id) return;
    
    try {
      setIsLoadingProdutos(true);
      setError(null);
      
      const data = await api.produtos.list({ 
        feirante_id: id,
        disponivel: true 
      });
      
      if (data) {
        // Mapear dados da API (snake_case) para o formato do componente
        const mappedProdutos: Produto[] = data.map((p: any) => ({
          id: p.id,
          feiranteId: p.feirante_id,
          nome: p.nome,
          descricao: p.descricao || '',
          preco: parseFloat(p.preco),
          unidade: p.unidade,
          categoria: p.categoria || '',
          imagem: p.imagem || '',
          estoque: p.estoque,
          disponivel: p.disponivel,
        }));
        
        setProdutos(mappedProdutos);
      }
    } catch (err: any) {
      console.error('Erro ao buscar produtos:', err);
      setError('Erro ao carregar produtos.');
    } finally {
      setIsLoadingProdutos(false);
    }
  };

  const filteredProdutos = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleQuantityChange = (produtoId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [produtoId]: Math.max(0, (prev[produtoId] || 0) + delta)
    }));
  };

  const handleAddToCart = (produto: Produto) => {
    if (!feirante) return;
    
    const quantity = quantities[produto.id] || 1;
    
    if (quantity <= 0) {
      toast.error('Selecione uma quantidade válida');
      return;
    }
    
    if (quantity > produto.estoque) {
      toast.error(`Quantidade indisponível. Estoque: ${produto.estoque}`);
      return;
    }
    
    if (!feiraId) {
      toast.error("Erro: Feira não identificada");
      return;
    }

    addToCart({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      unidade: produto.unidade,
      quantidade: quantity,
      feiranteId: feirante.id,
      feiraId: feiraId,
      feiranteNome: feirante.nome_estande || feirante.nomeEstande || 'Feirante'
    });
    
    toast.success(`${produto.nome} adicionado ao carrinho!`);
    setQuantities(prev => ({ ...prev, [produto.id]: 0 }));
  };

  // Loading inicial
  if (isLoadingFeirante) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando feirante...</span>
          </div>
        </div>
      </div>
    );
  }

  // Erro ao carregar feirante
  if (error && !feirante) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/feiras')}
            >
              Voltar para Feiras
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Feirante não encontrado
  if (!feirante) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Feirante não encontrado.
            </p>
            <Button onClick={() => navigate('/feiras')}>
              Voltar para Feiras
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const feiranteAvatar = feirante.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${feirante.id}`;
  const backUrl = feiraId ? `/feira/${feiraId}/detalhes` : '/feiras';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to={backUrl}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        {/* Header do Feirante */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-background overflow-hidden flex-shrink-0">
              <img
                src={feiranteAvatar}
                alt={feirante.nome_estande}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${feirante.id}`;
                }}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {feirante.nome_estande}
              </h1>
              {feirante.categoria && (
                <p className="text-muted-foreground mb-1">
                  {feirante.categoria}
                </p>
              )}
              {feirante.descricao && (
                <p className="text-sm text-muted-foreground">
                  {feirante.descricao}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Busca */}
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

        {/* Loading produtos */}
        {isLoadingProdutos && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando produtos...</span>
          </div>
        )}

        {/* Erro ao carregar produtos */}
        {error && !isLoadingProdutos && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchProdutos}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Lista de produtos */}
        {!isLoadingProdutos && !error && filteredProdutos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProdutos.map((produto) => (
              <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                        {produto.nome}
                      </h3>
                      {produto.categoria && (
                        <Badge variant="outline" className="ml-2 flex-shrink-0">
                          {produto.categoria}
                        </Badge>
                      )}
                    </div>
                    {produto.descricao && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {produto.descricao}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">
                        R$ {produto.preco.toFixed(2).replace('.', ',')}
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
                        disabled={(quantities[produto.id] || 0) >= produto.estoque}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => handleAddToCart(produto)}
                      disabled={produto.estoque <= 0 || !produto.disponivel}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                  
                  {produto.estoque <= 0 && (
                    <p className="text-xs text-destructive mt-2 text-center">
                      Produto esgotado
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoadingProdutos && !error && filteredProdutos.length === 0 && produtos.length > 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum produto encontrado com "{searchTerm}"
            </p>
          </div>
        )}

        {!isLoadingProdutos && !error && produtos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Este feirante ainda não possui produtos cadastrados.
            </p>
            <p className="text-sm text-muted-foreground">
              Volte mais tarde para ver os produtos disponíveis!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
