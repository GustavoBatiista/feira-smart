import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

const CART_STORAGE_KEY = 'feira-smart-cart';

// Função para carregar o carrinho do localStorage
const loadCartFromStorage = (): ItemCarrinho[] => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      return JSON.parse(storedCart);
    }
  } catch (error) {
    console.error('Erro ao carregar carrinho do localStorage:', error);
  }
  return [];
};

// Função para salvar o carrinho no localStorage
const saveCartToStorage = (items: ItemCarrinho[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Erro ao salvar carrinho no localStorage:', error);
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Carregar carrinho do localStorage no estado inicial
  const [items, setItems] = useState<ItemCarrinho[]>(() => loadCartFromStorage());

  // Salvar carrinho no localStorage sempre que os itens mudarem
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addToCart = (item: ItemCarrinho) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      
      if (existingItem) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantidade: i.quantidade + item.quantidade }
            : i
        );
      }
      
      return [...prev, item];
    });
  };

  const removeFromCart = (produtoId: string) => {
    setItems(prev => prev.filter(item => item.id !== produtoId));
  };

  const updateQuantity = (produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removeFromCart(produtoId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === produtoId ? { ...item, quantidade } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce(
    (sum, item) => sum + item.preco * item.quantidade,
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
