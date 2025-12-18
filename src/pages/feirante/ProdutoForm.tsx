import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

export default function ProdutoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    unidade: "kg",
    estoque: "",
    categoria: "",
    disponivel: true
  });

  // Carregar dados do produto quando estiver editando
  useEffect(() => {
    if (isEditing && id) {
      const fetchProduto = async () => {
        try {
          setLoading(true);
          const produto = await api.produtos.get(id);
          setFormData({
            nome: produto.nome || "",
            descricao: produto.descricao || "",
            preco: produto.preco?.toString() || "",
            unidade: produto.unidade || "kg",
            estoque: produto.estoque?.toString() || "",
            categoria: produto.categoria || "",
            disponivel: produto.disponivel !== undefined ? produto.disponivel : true
          });
        } catch (error: any) {
          console.error('Erro ao carregar produto:', error);
          toast.error("Erro ao carregar produto para edição");
          navigate("/feirante/produtos");
        } finally {
          setLoading(false);
        }
      };
      fetchProduto();
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar campos obrigatórios
      if (!formData.nome.trim()) {
        toast.error("Nome do produto é obrigatório");
        setLoading(false);
        return;
      }

      if (!formData.preco || parseFloat(formData.preco) <= 0) {
        toast.error("Preço deve ser maior que zero");
        setLoading(false);
        return;
      }

      if (!formData.unidade) {
        toast.error("Unidade é obrigatória");
        setLoading(false);
        return;
      }

      // Preparar dados para envio
      const produtoData = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        preco: parseFloat(formData.preco),
        unidade: formData.unidade,
        categoria: formData.categoria || null,
        estoque: formData.estoque ? parseInt(formData.estoque) : 0,
        disponivel: formData.disponivel,
        imagem: null // Pode ser implementado upload de imagem depois
      };

      if (isEditing && id) {
        // Atualizar produto existente
        await api.produtos.update(id, produtoData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        // Criar novo produto
        await api.produtos.create(produtoData);
        toast.success("Produto criado com sucesso!");
      }

      navigate("/feirante/produtos");
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      toast.error(error.message || (isEditing ? "Erro ao atualizar produto" : "Erro ao criar produto"));
    } finally {
      setLoading(false);
    }
  };

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
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frutas">Frutas</SelectItem>
                      <SelectItem value="legumes">Legumes</SelectItem>
                      <SelectItem value="verduras">Verduras</SelectItem>
                      <SelectItem value="graos">Grãos</SelectItem>
                      <SelectItem value="laticinios">Laticínios</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar Produto"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
