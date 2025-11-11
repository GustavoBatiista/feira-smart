import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { Navbar } from "@/components/layout/Navbar";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Feiras from "./pages/consumer/Feiras";
import FeiraDetalhes from "./pages/consumer/FeiraDetalhes";
import FeiranteProdutos from "./pages/consumer/FeiranteProdutos";
import Carrinho from "./pages/consumer/Carrinho";
import Pedidos from "./pages/consumer/Pedidos";
import Dashboard from "./pages/feirante/Dashboard";
import Produtos from "./pages/feirante/Produtos";
import ProdutoForm from "./pages/feirante/ProdutoForm";
import PedidosFeirante from "./pages/feirante/PedidosFeirante";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Consumer Routes */}
              <Route path="/feiras" element={<Feiras />} />
              <Route path="/feira/:id/detalhes" element={<FeiraDetalhes />} />
              <Route path="/feirante/:id/produtos" element={<FeiranteProdutos />} />
              <Route path="/carrinho" element={<Carrinho />} />
              <Route path="/pedidos" element={<Pedidos />} />
              
              {/* Feirante Routes */}
              <Route path="/feirante/dashboard" element={<Dashboard />} />
              <Route path="/feirante/produtos" element={<Produtos />} />
              <Route path="/feirante/produtos/novo" element={<ProdutoForm />} />
              <Route path="/feirante/produtos/:id/editar" element={<ProdutoForm />} />
              <Route path="/feirante/pedidos" element={<PedidosFeirante />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
