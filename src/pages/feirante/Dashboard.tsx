import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, ShoppingCart, TrendingUp, DollarSign, Calendar, MapPin, Store } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Feira } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();
  const [feiras, setFeiras] = useState<Feira[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeira, setSelectedFeira] = useState<Feira | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nomeEstande: '',
    descricao: '',
    categoria: '',
  });

  useEffect(() => {
    fetchFeiras();
  }, []);

  const fetchFeiras = async () => {
    try {
      const { data, error } = await supabase
        .from('feiras')
        .select('*')
        .eq('status', 'ativa')
        .order('data_inicio', { ascending: true });

      if (error) throw error;

      if (data) {
        setFeiras(data.map(f => ({
          id: f.id,
          nome: f.nome,
          localizacao: f.localizacao,
          descricao: f.descricao || '',
          dataInicio: f.data_inicio,
          dataFim: f.data_fim,
          horaInicio: f.hora_inicio,
          horaFim: f.hora_fim,
          imagem: f.imagem || '',
          status: f.status as 'ativa' | 'encerrada' | 'agendada',
        })));
      }
    } catch (error) {
      console.error('Error fetching feiras:', error);
      toast({
        title: "Erro ao carregar feiras",
        description: "Não foi possível carregar as feiras disponíveis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCadastro = async () => {
    if (!user || !selectedFeira) return;

    if (!formData.nomeEstande || !formData.categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome do estande e a categoria",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('feirantes')
        .insert({
          user_id: user.id,
          feira_id: selectedFeira.id,
          nome_estande: formData.nomeEstande,
          descricao: formData.descricao,
          categoria: formData.categoria,
        });

      if (error) throw error;

      toast({
        title: "Cadastro realizado!",
        description: `Você foi cadastrado na feira ${selectedFeira.nome}`,
      });

      setIsDialogOpen(false);
      setFormData({ nomeEstande: '', descricao: '', categoria: '' });
      setSelectedFeira(null);
    } catch (error: any) {
      console.error('Error registering:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível realizar o cadastro",
        variant: "destructive",
      });
    }
  };

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
            Cadastre-se nas feiras disponíveis para começar a vender
          </p>
        </div>

        {/* Feiras Disponíveis */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Feiras Disponíveis</h2>
          {isLoading ? (
            <div className="text-center py-8">Carregando feiras...</div>
          ) : feiras.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma feira ativa no momento
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feiras.map((feira) => (
                <Card key={feira.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      {feira.nome}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{feira.localizacao}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">
                        {new Date(feira.dataInicio).toLocaleDateString('pt-BR')} - {new Date(feira.dataFim).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {feira.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {feira.descricao}
                      </p>
                    )}
                    <Dialog open={isDialogOpen && selectedFeira?.id === feira.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) {
                        setSelectedFeira(null);
                        setFormData({ nomeEstande: '', descricao: '', categoria: '' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full mt-4" 
                          onClick={() => setSelectedFeira(feira)}
                        >
                          Cadastrar-se nesta feira
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cadastrar em {feira.nome}</DialogTitle>
                          <DialogDescription>
                            Preencha os dados do seu estande
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="nomeEstande">Nome do Estande *</Label>
                            <Input
                              id="nomeEstande"
                              placeholder="Ex: Frutas do João"
                              value={formData.nomeEstande}
                              onChange={(e) => setFormData({ ...formData, nomeEstande: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="categoria">Categoria *</Label>
                            <Input
                              id="categoria"
                              placeholder="Ex: Frutas e Verduras"
                              value={formData.categoria}
                              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea
                              id="descricao"
                              placeholder="Descreva seus produtos..."
                              value={formData.descricao}
                              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <Button onClick={handleCadastro} className="w-full">
                            Confirmar Cadastro
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Produtos Ativos
              </CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                produtos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pedidos Hoje
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                novos pedidos
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Faturamento
              </CardTitle>
              <DollarSign className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">R$ 0</div>
              <p className="text-xs text-muted-foreground mt-1">
                hoje
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Crescimento
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">+0%</div>
              <p className="text-xs text-muted-foreground mt-1">
                vs. semana passada
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
