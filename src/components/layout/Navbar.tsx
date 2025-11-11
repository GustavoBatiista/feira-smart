import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();

  const totalItems = items.reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FeiraSmart
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.tipo === 'cliente' && (
                  <>
                    <Link to="/feiras">
                      <Button variant="ghost">Feiras</Button>
                    </Link>
                    <Link to="/carrinho" className="relative">
                      <Button variant="ghost" size="icon">
                        <ShoppingCart className="h-5 w-5" />
                        {totalItems > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-secondary">
                            {totalItems}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </>
                )}
                
                {user.tipo === 'feirante' && (
                  <>
                    <Link to="/feirante/dashboard">
                      <Button variant="ghost">Dashboard</Button>
                    </Link>
                    <Link to="/feirante/produtos">
                      <Button variant="ghost">Produtos</Button>
                    </Link>
                    <Link to="/feirante/pedidos">
                      <Button variant="ghost">Pedidos</Button>
                    </Link>
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.nome}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {user.tipo === 'cliente' && (
                      <DropdownMenuItem asChild>
                        <Link to="/pedidos">Meus Pedidos</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link to="/register">
                  <Button>Cadastrar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
