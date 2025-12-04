import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  unidade: string;
  categoria?: string;
  estoque: number;
  descricao?: string;
  imagem?: string;
  disponivel: boolean;
}

export default function FeiranteProdutos() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [feirante, setFeirante] = useState<any>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pegar o ID da feira do estado da navegação ou buscar via feirante
  const [feiraId, setFeiraId] = useState<string | null>(
    location.state?.feiraId || null
  );

  useEffect(() => {
    if (id) {
      fetchFeirante();
      fetchProdutos();
    }
  }, [id]);

  const fetchFeirante = async () => {
    if (!id) return;
    
    try {
      const data = await api.feirantes.get(id);
      setFeirante(data);
      
      // Pegar o ID da feira do feirante
      if (data?.feira?.id) {
        setFeiraId(data.feira.id);
      } else if (data?.feira_id) {
        setFeiraId(data.feira_id);
      }
    } catch (err: any) {
      console.error('Erro ao buscar feirante:', err);
      setError('Erro ao carregar informações do feirante.');
    }
  };

  const fetchProdutos = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await api.produtos.list({ 
        feirante_id: id,
        disponivel: true 
      });
      
      if (data && Array.isArray(data)) {
        const produtosMapeados: Produto[] = data.map((p: any) => ({
          id: p.id,
          nome: p.nome,
          preco: parseFloat(p.preco) || 0,
          unidade: p.unidade || 'unidade',
          categoria: p.categoria,
          estoque: parseInt(p.estoque) || 0,
          descricao: p.descricao,
          imagem: p.imagem,
          disponivel: p.disponivel !== false,
        }));
        
        setProdutos(produtosMapeados);
      } else {
        setProdutos([]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar produtos:', err);
      setError('Erro ao carregar produtos.');
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProdutos = useMemo(() => {
    if (!searchTerm.trim()) {
      return produtos;
    }
    
    const term = searchTerm.toLowerCase().trim();
    return produtos.filter(p =>
      p.nome.toLowerCase().includes(term) ||
      p.categoria?.toLowerCase().includes(term) ||
      p.descricao?.toLowerCase().includes(term)
    );
  }, [produtos, searchTerm]);

  const handleQuantityChange = (produtoId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [produtoId]: Math.max(0, (prev[produtoId] || 0) + delta)
    }));
  };

  const handleAddToCart = (produto: Produto) => {
    if (!produto.disponivel) {
      toast.error('Produto não disponível');
      return;
    }

    const quantity = quantities[produto.id] || 1;
    
    if (quantity <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    if (quantity > produto.estoque) {
      toast.error(`Quantidade não disponível. Estoque: ${produto.estoque}`);
      return;
    }

    addToCart({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      unidade: produto.unidade,
      quantidade: quantity,
      feiranteId: id || '',
      feiranteNome: feirante?.nome_estande || feirante?.nomeEstande || 'Feirante'
    });
    
    toast.success(`${produto.nome} adicionado ao carrinho!`);
    setQuantities(prev => ({ ...prev, [produto.id]: 0 }));
  };

  // Determinar URL de voltar
  const getBackUrl = () => {
    if (feiraId) {
      return `/feira/${feiraId}/detalhes`;
    }
    // Se não tiver feiraId, tentar buscar do feirante ou voltar para lista de feiras
    return '/feiras';
  };

  // Avatar padrão
  const getAvatarUrl = () => {
    if (feirante?.avatar) {
      return feirante.avatar;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${id || 'default'}`;
  };

  if (isLoading && !feirante) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !feirante) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-6 gap-2"
            onClick={() => navigate(getBackUrl())}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => {
                fetchFeirante();
                fetchProdutos();
              }}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to={getBackUrl()}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        {feirante && (
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-background overflow-hidden">
                <img
                  src={getAvatarUrl()}
                  alt={feirante.nome_estande || feirante.nomeEstande || 'Feirante'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${id || 'default'}`;
                  }}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">
                  {feirante.nome_estande || feirante.nomeEstande || 'Feirante'}
                </h1>
                {feirante.categoria && (
                  <p className="text-muted-foreground">{feirante.categoria}</p>
                )}
                {feirante.descricao && (
                  <p className="text-sm text-muted-foreground mt-2">{feirante.descricao}</p>
                )}
              </div>
            </div>
          </div>
        )}

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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando produtos...</span>
          </div>
        ) : filteredProdutos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum produto encontrado para sua busca.' : 'Nenhum produto disponível no momento.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProdutos.map((produto) => (
              <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{produto.nome}</h3>
                      {produto.categoria && (
                        <Badge variant="outline">{produto.categoria}</Badge>
                      )}
                    </div>
                    {produto.descricao && (
                      <p className="text-sm text-muted-foreground mb-3">{produto.descricao}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(produto.preco)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        por {produto.unidade}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Estoque: {produto.estoque} {produto.unidade}
                    </p>
                    {!produto.disponivel && (
                      <Badge variant="destructive" className="mt-2">Indisponível</Badge>
                    )}
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
                        disabled={!produto.disponivel || (quantities[produto.id] || 0) >= produto.estoque}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => handleAddToCart(produto)}
                      disabled={!produto.disponivel || (quantities[produto.id] || 0) <= 0 || produto.estoque === 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Adicionar
                    </Button>
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
