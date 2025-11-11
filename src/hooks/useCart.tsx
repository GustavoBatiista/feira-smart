import { createContext, useContext, useState, ReactNode } from 'react';
import { ItemCarrinho } from '@/types';
import { toast } from '@/hooks/use-toast';

interface CartContextType {
  items: ItemCarrinho[];
  addToCart: (item: ItemCarrinho) => void;
  removeFromCart: (produtoId: string) => void;
  updateQuantity: (produtoId: string, quantidade: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ItemCarrinho[]>([]);

  const addToCart = (item: ItemCarrinho) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.produto.id === item.produto.id);
      
      if (existingItem) {
        toast({
          title: "Quantidade atualizada",
          description: `${item.produto.nome} atualizado no carrinho`,
        });
        return prev.map(i =>
          i.produto.id === item.produto.id
            ? { ...i, quantidade: i.quantidade + item.quantidade }
            : i
        );
      }
      
      toast({
        title: "Adicionado ao carrinho",
        description: `${item.produto.nome} foi adicionado ao carrinho`,
      });
      return [...prev, item];
    });
  };

  const removeFromCart = (produtoId: string) => {
    setItems(prev => prev.filter(item => item.produto.id !== produtoId));
    toast({
      title: "Removido do carrinho",
      description: "Produto removido com sucesso",
    });
  };

  const updateQuantity = (produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removeFromCart(produtoId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.produto.id === produtoId ? { ...item, quantidade } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce(
    (sum, item) => sum + item.produto.preco * item.quantidade,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
