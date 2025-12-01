const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

  const fullUrl = `${API_URL}${endpoint}`;
  console.log(`🌐 API Request: ${options.method || 'GET'} ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });
    
    console.log(`📡 API Response: ${response.status} ${response.statusText}`, fullUrl);

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText || 'Bad Request'}`;
      const contentType = response.headers.get('content-type');
      let errorData: any = null;
      
      try {
        // Tentar ler o body da resposta diretamente
        // Verificar se a resposta já foi consumida
        let text = '';
        try {
          text = await response.text();
          console.error('📛 Texto da resposta de erro:', text);
          console.error('📛 Tamanho do texto:', text.length);
        } catch (textError) {
          console.error('❌ Erro ao ler texto da resposta:', textError);
          // Tentar clonar e ler novamente
          try {
            const cloned = response.clone();
            text = await cloned.text();
            console.error('📛 Texto da resposta clonada:', text);
          } catch (cloneError) {
            console.error('❌ Erro ao ler resposta clonada:', cloneError);
          }
        }
        
        console.error('📛 Content-Type:', contentType);
        console.error('📛 Status:', response.status);
        console.error('📛 StatusText:', response.statusText);
        console.error('📛 Headers:', Object.fromEntries(response.headers.entries()));
        
        if (text && text.trim()) {
          // Tentar parsear como JSON
        if (contentType && contentType.includes('application/json')) {
            try {
              errorData = JSON.parse(text);
              console.error('📛 JSON parseado:', errorData);
              
              // Tentar diferentes campos possíveis para a mensagem de erro
              errorMessage = errorData.error || 
                           errorData.message || 
                           errorData.detail ||
                           errorMessage;
              
              console.error('📛 Erro da API:', {
                status: response.status,
                url: fullUrl,
                errorData,
                parsedMessage: errorMessage
              });
            } catch (parseError: any) {
              console.error('❌ Erro ao parsear JSON de erro:', parseError);
              console.error('❌ Texto recebido:', text);
              errorMessage = text.length > 200 ? `${text.substring(0, 200)}...` : text;
            }
        } else {
            // Se não for JSON, usar o texto diretamente
            errorMessage = text.length > 200 ? `${text.substring(0, 200)}...` : text || errorMessage;
          }
        }
      } catch (readError: any) {
        console.error('❌ Erro ao ler resposta de erro:', readError);
        // Se não conseguir ler, usar a mensagem padrão baseada no status
        if (response.status === 400) {
          errorMessage = 'Requisição inválida. Verifique os dados enviados.';
        } else if (response.status === 401) {
          errorMessage = 'Não autorizado. Faça login novamente.';
        } else if (response.status === 403) {
          errorMessage = 'Acesso negado. Você não tem permissão para esta ação.';
        } else if (response.status === 404) {
          errorMessage = 'Recurso não encontrado.';
        } else if (response.status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
        }
      }
      
      // Criar erro com todas as informações
      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.response = errorData ? { data: errorData } : null;
      console.error('🚨 Erro lançado:', { 
        message: errorMessage, 
        status: response.status, 
        errorData,
        stack: error.stack
      });
      throw error;
    }

    return response;
  } catch (error: any) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError' || 
        error.message?.includes('fetch') || error.message?.includes('NetworkError')) {
      console.error('❌ Erro de conexão com a API:', {
        url: fullUrl,
        error: error.message,
        errorName: error.name,
        apiUrl: API_URL,
        endpoint,
        method: options.method || 'GET',
      });
      
      throw new Error(
        `❌ Não foi possível conectar à API!\n\n` +
        `Verifique:\n` +
        `1. A API está rodando? Teste: http://localhost:3001/health\n` +
        `2. O arquivo .env tem VITE_API_URL=http://localhost:3001/api?\n` +
        `3. Você reiniciou o React após criar o .env?\n` +
        `4. O CORS está configurado corretamente no backend?\n\n` +
        `URL tentada: ${fullUrl}`
      );
    }
    throw error;
  }
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await apiRequest(endpoint);
  const text = await response.text();
  
  if (!text) {
    return null as T;
  }
  
  try {
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Erro ao parsear JSON:', error);
    console.error('Tamanho total da resposta:', text.length, 'caracteres');
    console.error('Primeiros 500 caracteres:', text.substring(0, 500));
    console.error('Últimos 500 caracteres:', text.substring(Math.max(0, text.length - 500)));
    
    // Tentar encontrar onde o JSON quebra
    const jsonErrorMatch = error.message?.match(/position (\d+)/);
    if (jsonErrorMatch) {
      const errorPosition = parseInt(jsonErrorMatch[1]);
      const start = Math.max(0, errorPosition - 100);
      const end = Math.min(text.length, errorPosition + 100);
      console.error(`Contexto do erro (posição ${errorPosition}):`, text.substring(start, end));
    }
    
    throw new Error(`Resposta JSON inválida do servidor. Erro: ${error.message}. Verifique os logs do console para mais detalhes.`);
  }
}

export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const text = await response.text();
  
  if (!text) {
    return null as T;
  }
  
  try {
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Erro ao parsear JSON:', error);
    console.error('Resposta recebida (primeiros 500 caracteres):', text.substring(0, 500));
    throw new Error('Resposta inválida do servidor. Verifique se a API está funcionando corretamente.');
  }
}

export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const text = await response.text();
  
  if (!text) {
    return null as T;
  }
  
  try {
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Erro ao parsear JSON:', error);
    console.error('Resposta recebida (primeiros 500 caracteres):', text.substring(0, 500));
    throw new Error('Resposta inválida do servidor. Verifique se a API está funcionando corretamente.');
  }
}

export async function apiPatch<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  const text = await response.text();
  
  if (!text) {
    return null as T;
  }
  
  try {
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Erro ao parsear JSON:', error);
    console.error('Resposta recebida (primeiros 500 caracteres):', text.substring(0, 500));
    throw new Error('Resposta inválida do servidor. Verifique se a API está funcionando corretamente.');
  }
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'DELETE',
  });
  const text = await response.text();
  
  if (!text) {
    return null as T;
  }
  
  try {
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Erro ao parsear JSON:', error);
    console.error('Resposta recebida (primeiros 500 caracteres):', text.substring(0, 500));
    throw new Error('Resposta inválida do servidor. Verifique se a API está funcionando corretamente.');
  }
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; nome: string; tipo: 'cliente' | 'feirante'; telefone?: string }) => {
      // Converter o tipo para maiúsculas para corresponder ao enum do backend
      const payload = {
        ...data,
        tipo: data.tipo.toUpperCase() as 'CLIENTE' | 'FEIRANTE'
      };
      return apiPost<{ user: any; token: string }>('/auth/register', payload);
    },
    
    login: (data: { email: string; password: string }) =>
      apiPost<{ user: any; token: string }>('/auth/login', data),
    
    me: () =>
      apiGet<any>('/auth/me'),
  },

  feiras: {
    list: () =>
      apiGet<any[]>('/feiras'),
    
    get: (id: string) =>
      apiGet<any>(`/feiras/${id}`),
    
    create: (data: any) =>
      apiPost<any>('/feiras', data),
    
    update: (id: string, data: any) =>
      apiPut<any>(`/feiras/${id}`, data),
    
    delete: (id: string) =>
      apiDelete<any>(`/feiras/${id}`),
  },

  produtos: {
    list: (params?: { feirante_id?: string; user_id?: string; disponivel?: boolean }) => {
      const queryParams = new URLSearchParams();
      if (params?.user_id) queryParams.append('user_id', params.user_id);
      else if (params?.feirante_id) queryParams.append('feirante_id', params.feirante_id);
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
    
    getDashboardStats: () =>
      apiGet<{
        produtosAtivos: number;
        pedidosHoje: number;
        faturamentoHoje: number;
        crescimento: number;
      }>('/feirantes/stats/dashboard'),
  },

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

  upload: {
    /**
     * Faz upload de uma imagem
     * @param file - Arquivo de imagem (File object)
     * @returns Promise com filePath e fileUrl
     */
    image: async (file: File): Promise<{ message: string; filePath: string; fileUrl: string }> => {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Não definir Content-Type - deixar o browser definir para multipart/form-data

      const fullUrl = `${API_URL}/upload/image`;
      console.log(`🌐 API Request: POST ${fullUrl}`);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: formData,
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`, fullUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        const error = new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }

      return response.json();
    },

    /**
     * Exclui uma imagem
     * @param filePath - Caminho do arquivo a ser excluído
     */
    deleteImage: async (filePath: string): Promise<{ message: string }> => {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({ filePath });
      const fullUrl = `${API_URL}/upload/image?${queryParams}`;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(`🌐 API Request: DELETE ${fullUrl}`);

      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers,
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`, fullUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        const error = new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }

      return response.json();
    },
  },
};

export default api;

