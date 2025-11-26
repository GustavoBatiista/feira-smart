import { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Feira } from '@/types';
import heroImage from '@/assets/hero-feira.jpg';
import { api } from '@/lib/api-client';

const Feiras = () => {
  const [feiras, setFeiras] = useState<Feira[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeiras();
  }, []);

  const fetchFeiras = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await api.feiras.list();
      
      if (data) {
        // Mapear dados da API (snake_case) para o formato do componente (camelCase)
        const mappedFeiras: Feira[] = data.map((f: any) => ({
          id: f.id,
          nome: f.nome,
          localizacao: f.localizacao,
          descricao: f.descricao || '',
          dataInicio: f.data_inicio,
          dataFim: f.data_fim,
          horaInicio: f.hora_inicio?.slice(0, 5) || '', // Formata HH:MM:SS para HH:MM
          horaFim: f.hora_fim?.slice(0, 5) || '',
          imagem: f.imagem || heroImage,
          status: f.status as 'ativa' | 'encerrada' | 'agendada',
        }));
        
        setFeiras(mappedFeiras);
      }
    } catch (err: any) {
      console.error('Erro ao buscar feiras:', err);
      setError('Erro ao carregar feiras. Tente novamente mais tarde.');
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img
          src={heroImage}
          alt="Feira"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Descubra as Melhores Feiras
              </h1>
              <p className="text-lg md:text-xl mb-6">
                Produtos frescos, orgânicos e artesanais direto dos produtores para você
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feiras List */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Feiras Disponíveis</h2>
          <p className="text-muted-foreground">
            Explore as feiras e reserve seus produtos favoritos
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando feiras...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchFeiras}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && feiras.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Nenhuma feira disponível no momento.
            </p>
            <p className="text-sm text-muted-foreground">
              Volte mais tarde para ver novas feiras!
            </p>
          </div>
        )}

        {/* Feiras Grid */}
        {!isLoading && !error && feiras.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {feiras.map((feira) => (
              <Card key={feira.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={feira.imagem}
                    alt={feira.nome}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-4 right-4 ${getStatusColor(feira.status)}`}>
                    {getStatusLabel(feira.status)}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-1">{feira.nome}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {feira.descricao}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feira.localizacao}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {new Date(feira.dataInicio).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {feira.horaInicio} - {feira.horaFim}
                    </span>
                  </div>

                  <Link to={`/feira/${feira.id}/detalhes`}>
                    <Button className="w-full mt-4">
                      Ver Feirantes
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feiras;
