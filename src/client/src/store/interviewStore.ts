import { create } from 'zustand';
import { Interview, CreateInterviewRequest, CompleteInterviewRequest } from '@/types';
import { apiClient } from '@/utils';

interface InterviewState {
  interviews: Interview[];
  currentInterview: Interview | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  
  // Actions
  fetchInterviews: (params?: InterviewListParams) => Promise<void>;
  fetchInterviewById: (id: string) => Promise<void>;
  createInterview: (data: CreateInterviewRequest) => Promise<Interview>;
  startInterview: (id: string) => Promise<void>;
  completeInterview: (id: string, data: CompleteInterviewRequest) => Promise<void>;
  pauseInterview: (id: string) => Promise<void>;
  resumeInterview: (id: string) => Promise<void>;
  cancelInterview: (id: string) => Promise<void>;
  setCurrentInterview: (interview: Interview | null) => void;
  clearError: () => void;
}

interface InterviewListParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  interviews: [],
  currentInterview: null,
  isLoading: false,
  isCreating: false,
  error: null,

  fetchInterviews: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/interviews', { params });
      
      if (response.success && response.data) {
        set({ 
          interviews: response.data.interviews,
          isLoading: false 
        });
      } else {
        throw new Error(response.error || '获取面试列表失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取面试列表失败',
        isLoading: false 
      });
    }
  },

  fetchInterviewById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/interviews/${id}`);
      
      if (response.success && response.data) {
        set({ 
          currentInterview: response.data,
          isLoading: false 
        });
      } else {
        throw new Error(response.error || '获取面试详情失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取面试详情失败',
        isLoading: false 
      });
    }
  },

  createInterview: async (data: CreateInterviewRequest) => {
    set({ isCreating: true, error: null });
    try {
      const response = await apiClient.post('/interviews', data);
      
      if (response.success && response.data) {
        const newInterview = response.data;
        set(state => ({ 
          interviews: [newInterview, ...state.interviews],
          currentInterview: newInterview,
          isCreating: false 
        }));
        return newInterview;
      } else {
        throw new Error(response.error || '创建面试失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '创建面试失败',
        isCreating: false 
      });
      throw error;
    }
  },

  startInterview: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/interviews/${id}/start`);
      
      if (response.success && response.data) {
        const updatedInterview = response.data;
        set(state => ({
          interviews: state.interviews.map(i => 
            i.id === id ? updatedInterview : i
          ),
          currentInterview: state.currentInterview?.id === id 
            ? updatedInterview 
            : state.currentInterview,
          isLoading: false
        }));
      } else {
        throw new Error(response.error || '开始面试失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '开始面试失败',
        isLoading: false 
      });
    }
  },

  completeInterview: async (id: string, data: CompleteInterviewRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/interviews/${id}/complete`, data);
      
      if (response.success && response.data) {
        const updatedInterview = response.data;
        set(state => ({
          interviews: state.interviews.map(i => 
            i.id === id ? updatedInterview : i
          ),
          currentInterview: state.currentInterview?.id === id 
            ? updatedInterview 
            : state.currentInterview,
          isLoading: false
        }));
      } else {
        throw new Error(response.error || '完成面试失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '完成面试失败',
        isLoading: false 
      });
    }
  },

  pauseInterview: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/interviews/${id}/pause`);
      
      if (response.success && response.data) {
        const updatedInterview = response.data;
        set(state => ({
          interviews: state.interviews.map(i => 
            i.id === id ? updatedInterview : i
          ),
          currentInterview: state.currentInterview?.id === id 
            ? updatedInterview 
            : state.currentInterview,
          isLoading: false
        }));
      } else {
        throw new Error(response.error || '暂停面试失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '暂停面试失败',
        isLoading: false 
      });
    }
  },

  resumeInterview: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/interviews/${id}/resume`);
      
      if (response.success && response.data) {
        const updatedInterview = response.data;
        set(state => ({
          interviews: state.interviews.map(i => 
            i.id === id ? updatedInterview : i
          ),
          currentInterview: state.currentInterview?.id === id 
            ? updatedInterview 
            : state.currentInterview,
          isLoading: false
        }));
      } else {
        throw new Error(response.error || '恢复面试失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '恢复面试失败',
        isLoading: false 
      });
    }
  },

  cancelInterview: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/interviews/${id}/cancel`);
      
      if (response.success && response.data) {
        const updatedInterview = response.data;
        set(state => ({
          interviews: state.interviews.map(i => 
            i.id === id ? updatedInterview : i
          ),
          currentInterview: state.currentInterview?.id === id 
            ? updatedInterview 
            : state.currentInterview,
          isLoading: false
        }));
      } else {
        throw new Error(response.error || '取消面试失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '取消面试失败',
        isLoading: false 
      });
    }
  },

  setCurrentInterview: (interview: Interview | null) => {
    set({ currentInterview: interview });
  },

  clearError: () => {
    set({ error: null });
  },
}));