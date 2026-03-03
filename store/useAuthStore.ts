import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (email && password) {
      const mockUser: User = {
        id: 'user1',
        email,
        firstName: 'Alex',
        lastName: 'Thompson',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        phone: '+1 555-0100',
        createdAt: new Date('2023-06-15'),
        preferredLanguage: 'en',
      };
      
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    } else {
      set({ error: 'Invalid credentials', isLoading: false });
    }
  },

  signup: async (data: SignupData) => {
    set({ isLoading: true, error: null });
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const newUser: User = {
      id: 'user_' + Date.now(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      createdAt: new Date(),
      preferredLanguage: 'en',
    };
    
    set({ user: newUser, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateProfile: (data: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (!email.includes('@')) {
      set({ error: 'Please enter a valid email', isLoading: false });
      return;
    }
    
    set({ isLoading: false });
  },

  clearError: () => set({ error: null }),
}));