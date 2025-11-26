import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Calendar, Store, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { Navbar } from "@/components/layout/Navbar";
import heroImage from "@/assets/hero-feira.jpg";

interface Feirante {
  id: string;
  nome_estande: string;
  descricao?: string;
  categoria?: string;
  avatar?: string;
  avaliacao: number;
  num_avaliacoes: number;
  produtosCount?: number;
}

export default function FeiraDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [feira, setFeira] = useState<any>(null);
  const [feirantes, setFeirantes] = useState<Feirante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchFeira();
      fetchFeirantes();
    }
  }, [id]);

  const fetchFeira = async () => {
    if (!id) return;
    
    try {
      const data = await api.feiras.get(id);
      setFeira(data);
    } catch (err: any) {
      console.error('Erro ao buscar feira:', err);
      setError('Erro ao carregar informações da feira.');
    }
  };

  const fetchFeirantes = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Buscar feirantes da feira
      const feirantesData = await api.feirantes.list({ feira_id: id });
      
      if (feirantesData && feirantesData.length > 0) {
        // Buscar quantidade de produtos para cada feirante
        const feirantesComProdutos = await Promise.all(
          feirantesData.map(async (feirante: any) => {
            try {
              const produtos = await api.produtos.list({ 
                feirante_id: feirante.id,
                disponivel: true 
              });
              return {
                ...feirante,
                produtosCount: produtos?.length || 0,
              };
            } catch (err) {
              console.error(`Erro ao buscar produtos do feirante ${feirante.id}:`, err);
              return {
                ...feirante,
                produtosCount: 0,
              };
            }
          })
        );
        
        setFeirantes(feirantesComProdutos);
      } else {
        setFeirantes([]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar feirantes:', err);
      setError('Erro ao carregar feirantes.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-success text-white';
      case 'agendada':
        return 'bg-warning text-white';
      case 'encerrada':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'Acontecendo agora';
      case 'agendada':
        return 'Em breve';
      case 'encerrada':
        return 'Encerrada';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Formata HH:MM:SS para HH:MM
  };

  if (isLoading && !feira) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando feira...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !feira) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
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

  if (!feira) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Feira não encontrada.
            </p>
            <Button onClick={() => navigate('/feiras')}>
              Voltar para Feiras
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const feiraImage = feira.imagem || heroImage;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section com Imagem da Feira */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img
          src={feiraImage}
          alt={feira.nome}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {feira.nome}
              </h1>
              <p className="text-lg md:text-xl mb-6">
                {feira.descricao || 'Produtos frescos e de qualidade'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Link to="/feiras">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Feiras
          </Button>
        </Link>

        {/* Informações da Feira */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground">{feira.nome}</h2>
                <Badge className={getStatusColor(feira.status)}>
                  {getStatusLabel(feira.status)}
                </Badge>
              </div>
              {feira.descricao && (
                <p className="text-muted-foreground mb-4">{feira.descricao}</p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{feira.localizacao}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>
                    {formatDate(feira.data_inicio)}
                    {feira.data_fim && feira.data_fim !== feira.data_inicio && (
                      <> até {formatDate(feira.data_fim)}</>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>
                    {formatTime(feira.hora_inicio)} - {formatTime(feira.hora_fim)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Feirantes */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Feirantes Participantes
          </h2>
          <p className="text-muted-foreground">
            Confira os produtos de cada feirante
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando feirantes...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchFeirantes}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && feirantes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Nenhum feirante cadastrado nesta feira ainda.
            </p>
            <p className="text-sm text-muted-foreground">
              Volte mais tarde para ver os feirantes participantes!
            </p>
          </div>
        )}

        {/* Feirantes Grid */}
        {!isLoading && !error && feirantes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {feirantes.map((feirante) => (
              <Link key={feirante.id} to={`/feirante/${feirante.id}/produtos`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-primary/10 mb-4 overflow-hidden">
                        {feirante.avatar ? (
                          <img
                            src={feirante.avatar}
                            alt={feirante.nome_estande}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback para um avatar padrão se a imagem falhar
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${feirante.id}`;
                            }}
                          />
                        ) : (
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${feirante.id}`}
                            alt={feirante.nome_estande}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {feirante.nome_estande}
                      </h3>
                      {feirante.categoria && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {feirante.categoria}
                        </p>
                      )}
                      {feirante.descricao && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {feirante.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-primary">
                        <Store className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {feirante.produtosCount || 0} {feirante.produtosCount === 1 ? 'produto' : 'produtos'}
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
        )}
      </div>
    </div>
  );
}
