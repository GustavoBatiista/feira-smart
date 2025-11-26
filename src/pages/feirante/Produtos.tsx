import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api-client";
import { Produto } from "@/types";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Produtos() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<Produto | null>(null);

  useEffect(() => {
    if (!authLoading && user && user.tipo === 'feirante') {
      fetchProdutos();
    } else if (!authLoading && user && user.tipo !== 'feirante') {
      navigate('/feiras');
    } else if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const fetchProdutos = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Primeiro, buscar os feirantes do usuário
      const feirantes = await api.feirantes.list({ user_id: user.id });

      if (!feirantes || feirantes.length === 0) {
        setProdutos([]);
        setIsLoading(false);
        return;
      }

      // Buscar produtos de todos os feirantes do usuário
      const allProdutos: any[] = [];
      for (const feirante of feirantes) {
        try {
          const produtos = await api.produtos.list({ feirante_id: feirante.id });
          allProdutos.push(...produtos);
        } catch (error) {
          console.error(`Erro ao buscar produtos do feirante ${feirante.id}:`, error);
        }
      }

      setProdutos(allProdutos.map(p => ({
        id: p.id,
        feiranteId: p.feirante_id,
        nome: p.nome,
        descricao: p.descricao || '',
        preco: parseFloat(p.preco.toString()),
        unidade: p.unidade,
        categoria: p.categoria || '',
        imagem: p.imagem || '',
        estoque: p.estoque,
        disponivel: p.disponivel,
      })));
    } catch (error: any) {
      console.error('Error fetching produtos:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: error.message || "Não foi possível carregar os produtos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!produtoToDelete) return;

    try {
      await api.produtos.delete(produtoToDelete.id);

      toast({
        title: "Produto excluído!",
        description: `${produtoToDelete.nome} foi removido com sucesso.`,
      });

      setDeleteDialogOpen(false);
      setProdutoToDelete(null);
      fetchProdutos(); // Recarregar lista
    } catch (error: any) {
      console.error('Error deleting produto:', error);
      toast({
        title: "Erro ao excluir produto",
        description: error.message || "Não foi possível excluir o produto",
        variant: "destructive",
      });
    }
  };

  const filteredProdutos = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setProdutoToDelete(produto);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProdutos.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado ainda"}
            </p>
            {!searchTerm && (
              <Link to="/feirante/produtos/novo" className="mt-4 inline-block">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Primeiro Produto
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{produtoToDelete?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
