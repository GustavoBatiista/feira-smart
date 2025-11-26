import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  session: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, nome: string, tipo: 'cliente' | 'feirante') => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = await api.auth.me();
      
      setUser({
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        tipo: userData.tipo,
        telefone: userData.telefone,
        avatar: userData.avatar,
        createdAt: userData.createdAt || userData.created_at,
      });
      
      setSession({ token: localStorage.getItem('token') });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // Token inválido, limpar
      localStorage.removeItem('token');
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login({ email, password });
      
      // Salvar token
      localStorage.setItem('token', response.token);
      
      // Atualizar usuário
      setUser({
        id: response.user.id,
        email: response.user.email,
        nome: response.user.nome,
        tipo: response.user.tipo,
        telefone: response.user.telefone,
        avatar: response.user.avatar,
        createdAt: response.user.createdAt || response.user.created_at,
      });
      
      setSession({ token: response.token });
      
      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: { message: error.message || 'Erro ao fazer login' } };
    }
  };

  const register = async (email: string, password: string, nome: string, tipo: 'cliente' | 'feirante') => {
    try {
      const response = await api.auth.register({ email, password, nome, tipo });
      
      // Salvar token
      localStorage.setItem('token', response.token);
      
      // Atualizar usuário
      setUser({
        id: response.user.id,
        email: response.user.email,
        nome: response.user.nome,
        tipo: response.user.tipo,
        telefone: response.user.telefone,
        avatar: response.user.avatar,
        createdAt: response.user.createdAt || response.user.created_at,
      });
      
      setSession({ token: response.token });
      
      return { error: null };
    } catch (error: any) {
      console.error('Register error:', error);
      return { error: { message: error.message || 'Erro ao criar conta' } };
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, register, logout }}>
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
