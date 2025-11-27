import { create } from 'zustand';
import { Question, SearchFilters } from '@/types';
import { apiClient } from '@/utils';

interface QuestionState {
  questions: Question[];
  currentQuestion: Question | null;
  categories: string[];
  tags: string[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  // Actions
  fetchQuestions: (filters?: SearchFilters & { page?: number; limit?: number }) => Promise<void>;
  fetchQuestionById: (id: string) => Promise<void>;
  fetchRandomQuestions: (count?: number, filters?: SearchFilters) => Promise<Question[]>;
  fetchCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
  generateQuestion: (data: GenerateQuestionData) => Promise<string>;
  setCurrentQuestion: (question: Question | null) => void;
  clearError: () => void;
}

interface GenerateQuestionData {
  category: string;
  difficulty: string;
  type: string;
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
  questions: [],
  currentQuestion: null,
  categories: [],
  tags: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },

  fetchQuestions: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/questions', { params: filters });
      
      if (response.success && response.data) {
        set({ 
          questions: response.data.questions,
          pagination: response.data.pagination,
          isLoading: false 
        });
      } else {
        throw new Error(response.error || '获取题目列表失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取题目列表失败',
        isLoading: false 
      });
    }
  },

  fetchQuestionById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/questions/${id}`);
      
      if (response.success && response.data) {
        set({ 
          currentQuestion: response.data,
          isLoading: false 
        });
      } else {
        throw new Error(response.error || '获取题目详情失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取题目详情失败',
        isLoading: false 
      });
    }
  },

  fetchRandomQuestions: async (count = 5, filters = {}) => {
    try {
      const response = await apiClient.get('/questions/random', { 
        params: { count, ...filters } 
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || '获取随机题目失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取随机题目失败'
      });
      return [];
    }
  },

  fetchCategories: async () => {
    try {
      const response = await apiClient.get('/questions/categories');
      
      if (response.success && response.data) {
        set({ categories: response.data });
      } else {
        throw new Error(response.error || '获取分类失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取分类失败'
      });
    }
  },

  fetchTags: async () => {
    try {
      const response = await apiClient.get('/questions/tags');
      
      if (response.success && response.data) {
        set({ tags: response.data });
      } else {
        throw new Error(response.error || '获取标签失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取标签失败'
      });
    }
  },

  generateQuestion: async (data: GenerateQuestionData) => {
    try {
      const response = await apiClient.post('/questions/generate', data);
      
      if (response.success && response.data) {
        return response.data.content;
      } else {
        throw new Error(response.error || '生成题目失败');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '生成题目失败'
      });
      throw error;
    }
  },

  setCurrentQuestion: (question: Question | null) => {
    set({ currentQuestion: question });
  },

  clearError: () => {
    set({ error: null });
  },
}));