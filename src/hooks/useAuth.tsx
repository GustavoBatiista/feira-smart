import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nome: string, tipo: 'cliente' | 'feirante') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se existe usuário no localStorage
    const storedUser = localStorage.getItem('feirasmart_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulação de login - substituir por API real
    const mockUser: User = {
      id: '1',
      email,
      nome: 'Usuário Teste',
      tipo: email.includes('feirante') ? 'feirante' : 'cliente',
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem('feirasmart_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const register = async (email: string, password: string, nome: string, tipo: 'cliente' | 'feirante') => {
    // Simulação de registro - substituir por API real
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      nome,
      tipo,
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem('feirasmart_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('feirasmart_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
