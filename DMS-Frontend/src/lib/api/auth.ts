import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  roles: Role[];
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
  expiresIn: number;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },

  refreshToken: async (): Promise<{ accessToken: string; user: User; expiresIn: number }> => {
    const response = await apiClient.post('/api/auth/refresh');
    return response.data;
  },
};
