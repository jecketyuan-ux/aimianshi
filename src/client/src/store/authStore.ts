import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { apiClient } from '@/utils';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/login', {
            email,
            password,
          });

          if (response.success && response.data) {
            const { user, token, refreshToken } = response.data;
            
            apiClient.setAuthToken(token);
            apiClient.setRefreshToken(refreshToken);
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            throw new Error(response.error || '登录失败');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/register', userData);

          if (response.success && response.data) {
            const { user, token, refreshToken } = response.data;
            
            apiClient.setAuthToken(token);
            apiClient.setRefreshToken(refreshToken);
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            throw new Error(response.error || '注册失败');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        apiClient.removeTokens();
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      },

      refreshToken: async () => {
        try {
          const refreshToken = apiClient.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await apiClient.post('/auth/refresh-token', {
            refreshToken,
          });

          if (response.success && response.data) {
            const { token, refreshToken: newRefreshToken } = response.data;
            
            apiClient.setAuthToken(token);
            apiClient.setRefreshToken(newRefreshToken);
          } else {
            throw new Error(response.error || 'Token refresh failed');
          }
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          const response = await apiClient.put('/auth/profile', updates);

          if (response.success && response.data) {
            const { user } = response.data;
            set({ user });
          } else {
            throw new Error(response.error || '更新失败');
          }
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);