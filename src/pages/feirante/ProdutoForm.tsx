import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api-client";

export default function ProdutoForm() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [feiranteId, setFeiranteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    unidade: "kg",
    estoque: "",
    categoria: "",
    imagem: "",
    disponivel: true
  });

  // Buscar feirante_id do usuário
  useEffect(() => {
    if (!authLoading && user && user.tipo === 'feirante') {
      fetchFeiranteId();
    } else if (!authLoading && (!user || user.tipo !== 'feirante')) {
      navigate('/feirante/produtos');
    }
  }, [user, authLoading, navigate]);

  // Carregar dados do produto se estiver editando
  useEffect(() => {
    if (id && feiranteId) {
      fetchProduto();
    }
  }, [id, feiranteId]);

  const fetchFeiranteId = async () => {
    if (!user) return;

    try {
      const feirantes = await api.feirantes.list({ user_id: user.id });

      if (!feirantes || feirantes.length === 0) {
        toast({
          title: "Você precisa se cadastrar em uma feira primeiro",
          description: "Cadastre-se em uma feira antes de adicionar produtos.",
          variant: "destructive",
        });
        navigate('/feirante/dashboard');
        return;
      }

      // Usar o primeiro feirante encontrado
      setFeiranteId(feirantes[0].id);
    } catch (error: any) {
      console.error('Error fetching feirante:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Não foi possível carregar seus dados de feirante",
        variant: "destructive",
      });
    }
  };

  const fetchProduto = async () => {
    if (!id || !feiranteId) return;

    try {
      setLoadingData(true);
      const produto = await api.produtos.get(id);

      if (produto) {
        setFormData({
          nome: produto.nome,
          descricao: produto.descricao || '',
          preco: produto.preco.toString(),
          unidade: produto.unidade,
          estoque: produto.estoque.toString(),
          categoria: produto.categoria || '',
          imagem: produto.imagem || '',
          disponivel: produto.disponivel,
        });
      }
    } catch (error: any) {
      console.error('Error fetching produto:', error);
      toast({
        title: "Erro ao carregar produto",
        description: error.message || "Não foi possível carregar o produto",
        variant: "destructive",
      });
      navigate('/feirante/produtos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feiranteId) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar seu estande. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    // Validação
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do produto é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      toast({
        title: "Preço inválido",
        description: "O preço deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }

    if (!formData.estoque || parseInt(formData.estoque) < 0) {
      toast({
        title: "Estoque inválido",
        description: "O estoque não pode ser negativo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const produtoData = {
        feirante_id: feiranteId,
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        preco: parseFloat(formData.preco),
        unidade: formData.unidade,
        estoque: parseInt(formData.estoque),
        categoria: formData.categoria || null,
        imagem: formData.imagem.trim() || null,
        disponivel: formData.disponivel,
      };

      if (isEditing && id) {
        // Atualizar produto
        await api.produtos.update(id, produtoData);

        toast({
          title: "Produto atualizado!",
          description: `${formData.nome} foi atualizado com sucesso.`,
        });
      } else {
        // Criar produto
        await api.produtos.create(produtoData);

        toast({
          title: "Produto criado!",
          description: `${formData.nome} foi adicionado com sucesso.`,
        });
      }

      navigate("/feirante/produtos");
    } catch (error: any) {
      console.error('Error saving produto:', error);
      toast({
        title: isEditing ? "Erro ao atualizar produto" : "Erro ao criar produto",
        description: error.message || "Não foi possível salvar o produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate("/feirante/produtos")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</CardTitle>
            <CardDescription>
              Preencha as informações do produto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Tomate Orgânico"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o produto..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço *</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidade">Unidade *</Label>
                  <Select
                    value={formData.unidade}
                    onValueChange={(value) => setFormData({ ...formData, unidade: value })}
                  >
                    <SelectTrigger id="unidade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Quilograma (kg)</SelectItem>
                      <SelectItem value="unidade">Unidade</SelectItem>
                      <SelectItem value="maço">Maço</SelectItem>
                      <SelectItem value="dúzia">Dúzia</SelectItem>
                      <SelectItem value="litro">Litro (L)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estoque">Estoque *</Label>
                  <Input
                    id="estoque"
                    type="number"
                    placeholder="0"
                    value={formData.estoque}
                    onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frutas">Frutas</SelectItem>
                      <SelectItem value="Legumes">Legumes</SelectItem>
                      <SelectItem value="Verduras">Verduras</SelectItem>
                      <SelectItem value="Grãos">Grãos</SelectItem>
                      <SelectItem value="Laticínios">Laticínios</SelectItem>
                      <SelectItem value="Hortifruti">Hortifruti</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imagem">URL da Imagem</Label>
                <Input
                  id="imagem"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={formData.imagem}
                  onChange={(e) => setFormData({ ...formData, imagem: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Link para a imagem do produto (opcional)
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="disponivel" className="text-base">Produto Disponível</Label>
                  <p className="text-sm text-muted-foreground">
                    Ative para exibir o produto na feira
                  </p>
                </div>
                <Switch
                  id="disponivel"
                  checked={formData.disponivel}
                  onCheckedChange={(checked) => setFormData({ ...formData, disponivel: checked })}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/feirante/produtos")}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={loading || !feiranteId}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : isEditing ? (
                    "Atualizar"
                  ) : (
                    "Criar Produto"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
