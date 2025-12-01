import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import heroImage from '@/assets/hero-feira.jpg';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.tipo === 'feirante') {
        navigate('/feirante/dashboard');
      } else {
        navigate('/feiras');
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Store,
      title: 'Feiras Locais',
      description: 'Descubra feiras próximas a você com produtos frescos e de qualidade',
    },
    {
      icon: ShoppingBag,
      title: 'Reserve Produtos',
      description: 'Faça sua lista e reserve os produtos antes de ir à feira',
    },
    {
      icon: Users,
      title: 'Conheça os Feirantes',
      description: 'Conecte-se diretamente com os produtores locais',
    },
    {
      icon: TrendingUp,
      title: 'Gestão Simplificada',
      description: 'Feirantes podem gerenciar produtos e pedidos facilmente',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-screen w-full overflow-hidden">
        <img
          src={heroImage}
          alt="Feira"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-secondary/85 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl text-white">
              <div className="flex items-center space-x-3 mb-6">
                <Store className="h-12 w-12" />
                <h1 className="text-5xl md:text-6xl font-bold">FeiraSmart</h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                Produtos frescos, comidas típicas, doces, salgados e muito mais, tudo em um só lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
                >
                  Começar Agora
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
                >
                  Já tenho conta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Por que usar o FeiraSmart?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma completa para revolucionar a experiência das feiras livres
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary to-secondary py-24">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de consumidores e feirantes que já usam o FeiraSmart
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
          >
            Criar Conta Grátis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
