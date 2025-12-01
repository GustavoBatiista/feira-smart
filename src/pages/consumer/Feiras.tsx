import { useState, useEffect, useMemo } from 'react';
import { MapPin, Calendar, Clock, ChevronRight, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Feira } from '@/types';
import heroImage from '@/assets/hero-feira.jpg';
import { api } from '@/lib/api-client';

const DIAS_DA_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const getDiaDaSemanaNome = (dia: number): string => {
  return DIAS_DA_SEMANA[dia] || 'Dia inválido';
};

const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return '';
  
  // Se for uma string, formatar o horário
  if (typeof timeString === 'string') {
    // Pode vir como "HH:mm:ss" ou "HH:mm" ou apenas "HH:mm:ss.SSS"
    // Remover milissegundos se existirem e pegar apenas HH:MM
    const timeOnly = timeString.split('.')[0]; // Remove milissegundos
    return timeOnly.slice(0, 5); // Pega apenas HH:MM
  }
  
  return '';
};

const Feiras = () => {
  const [feiras, setFeiras] = useState<Feira[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFeiras();
  }, []);

  const fetchFeiras = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await api.feiras.list();
      
      if (data) {
        const mappedFeiras: Feira[] = data.map((f: any) => {
          // Tratar horários que podem vir de diferentes formas (snake_case ou camelCase)
          const rawHoraInicio = f.hora_inicio || f.horaInicio;
          const rawHoraFim = f.hora_fim || f.horaFim;
          
          const horaInicio = formatTime(rawHoraInicio);
          const horaFim = formatTime(rawHoraFim);
          
          // Normalizar URL da imagem
          // Tratar casos onde a imagem pode ser null, undefined, string vazia, ou a string "null"
          let imagemUrl = f.imagem;
          
          // Se for null, undefined, string vazia, ou a string literal "null", considerar como sem imagem
          if (!imagemUrl || imagemUrl === 'null' || imagemUrl === 'undefined' || imagemUrl.trim() === '') {
            imagemUrl = heroImage;
          } else if (imagemUrl.startsWith('/uploads')) {
            // Se a imagem for um caminho relativo (começar com /uploads), converter para URL completa
            const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
            imagemUrl = API_BASE + imagemUrl;
          }
          // Se já for uma URL completa (http/https), usar diretamente
          
          return {
            id: f.id,
            nome: f.nome,
            localizacao: f.localizacao,
            descricao: f.descricao || '',
            diaDaSemana: f.dia_da_semana ?? f.diaDaSemana ?? 0,
            horaInicio: horaInicio,
            horaFim: horaFim,
            imagem: imagemUrl,
          };
        });
        setFeiras(mappedFeiras);
      }
    } catch (err: any) {
      console.error('Erro ao buscar feiras:', err);
      setError('Erro ao carregar feiras. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar feiras por nome ou localização
  const filteredFeiras = useMemo(() => {
    if (!searchTerm.trim()) {
      return feiras;
    }

    const term = searchTerm.toLowerCase().trim();
    return feiras.filter((feira) => {
      const nomeMatch = feira.nome.toLowerCase().includes(term);
      const localizacaoMatch = feira.localizacao.toLowerCase().includes(term);
      return nomeMatch || localizacaoMatch;
    });
  }, [feiras, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
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
                Produtos frescos, comidas típicas, doces, salgados e muito mais, tudo em um só lugar.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Feiras Disponíveis</h2>
          <p className="text-muted-foreground mb-6">
            Explore as feiras e reserve seus produtos favoritos
          </p>
          
          {/* Barra de Pesquisa */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando feiras...</span>
          </div>
        )}

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

        {!isLoading && !error && feiras.length > 0 && filteredFeiras.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Nenhuma feira encontrada para "{searchTerm}".
            </p>
            <p className="text-sm text-muted-foreground">
              Tente buscar por outro termo.
            </p>
          </div>
        )}

        {!isLoading && !error && filteredFeiras.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFeiras.map((feira) => (
              <Card key={feira.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img
                    src={feira.imagem || heroImage}
                    alt={feira.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Fallback para imagem padrão se a imagem falhar ao carregar
                      if (target.src !== heroImage) {
                        target.src = heroImage;
                      }
                    }}
                  />
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
                      {getDiaDaSemanaNome(feira.diaDaSemana)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {feira.horaInicio && feira.horaFim 
                        ? `${feira.horaInicio} - ${feira.horaFim}`
                        : 'Horário não disponível'}
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
