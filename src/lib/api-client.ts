/**
 * Cliente API para comunicação com o backend PostgreSQL
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper para fazer requisições autenticadas
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `Erro: ${response.statusText}`);
    }

    return response;
  } catch (error: any) {
    // Se for erro de rede (failed to fetch)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError' || error.message?.includes('fetch')) {
      console.error('❌ Erro ao conectar à API:', {
        url: `${API_URL}${endpoint}`,
        error: error.message,
        apiUrl: API_URL,
        endpoint,
      });
      
      throw new Error(
        `❌ Não foi possível conectar à API!\n\n` +
        `Verifique:\n` +
        `1. A API está rodando? Teste: http://localhost:3001/health\n` +
        `2. O arquivo .env tem VITE_API_URL=http://localhost:3001/api?\n` +
        `3. Você reiniciou o React após criar o .env?\n\n` +
        `URL tentada: ${API_URL}${endpoint}`
      );
    }
    throw error;
  }
}

// Helper para GET requests
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await apiRequest(endpoint);
  return response.json();
}

// Helper para POST requests
export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

// Helper para PUT requests
export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

// Helper para PATCH requests
export async function apiPatch<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

// Helper para DELETE requests
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'DELETE',
  });
  return response.json();
}

// API methods organizados por recurso
export const api = {
  // Auth
  auth: {
    register: (data: { email: string; password: string; nome: string; tipo: 'cliente' | 'feirante'; telefone?: string }) =>
      apiPost<{ user: any; token: string }>('/auth/register', data),
    
    login: (data: { email: string; password: string }) =>
      apiPost<{ user: any; token: string }>('/auth/login', data),
    
    me: () =>
      apiGet<any>('/auth/me'),
  },

  // Feiras
  feiras: {
    list: (status?: string) =>
      apiGet<any[]>(status ? `/feiras?status=${status}` : '/feiras'),
    
    get: (id: string) =>
      apiGet<any>(`/feiras/${id}`),
    
    create: (data: any) =>
      apiPost<any>('/feiras', data),
    
    update: (id: string, data: any) =>
      apiPut<any>(`/feiras/${id}`, data),
    
    delete: (id: string) =>
      apiDelete<any>(`/feiras/${id}`),
  },

  // Produtos
  produtos: {
    list: (params?: { feirante_id?: string; disponivel?: boolean }) => {
      const queryParams = new URLSearchParams();
      if (params?.feirante_id) queryParams.append('feirante_id', params.feirante_id);
      if (params?.disponivel !== undefined) queryParams.append('disponivel', String(params.disponivel));
      const query = queryParams.toString();
      return apiGet<any[]>(query ? `/produtos?${query}` : '/produtos');
    },
    
    get: (id: string) =>
      apiGet<any>(`/produtos/${id}`),
    
    create: (data: any) =>
      apiPost<any>('/produtos', data),
    
    update: (id: string, data: any) =>
      apiPut<any>(`/produtos/${id}`, data),
    
    delete: (id: string) =>
      apiDelete<any>(`/produtos/${id}`),
  },

  // Feirantes
  feirantes: {
    list: (params?: { feira_id?: string; user_id?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.feira_id) queryParams.append('feira_id', params.feira_id);
      if (params?.user_id) queryParams.append('user_id', params.user_id);
      const query = queryParams.toString();
      return apiGet<any[]>(query ? `/feirantes?${query}` : '/feirantes');
    },
    
    get: (id: string) =>
      apiGet<any>(`/feirantes/${id}`),
    
    create: (data: any) =>
      apiPost<any>('/feirantes', data),
    
    update: (id: string, data: any) =>
      apiPut<any>(`/feirantes/${id}`, data),
  },

  // Pedidos
  pedidos: {
    list: () =>
      apiGet<any[]>('/pedidos'),
    
    get: (id: string) =>
      apiGet<any>(`/pedidos/${id}`),
    
    create: (data: any) =>
      apiPost<any>('/pedidos', data),
    
    updateStatus: (id: string, status: string) =>
      apiPatch<any>(`/pedidos/${id}/status`, { status }),
  },
};

export default api;

