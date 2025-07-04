import create from 'zustand';
import { adminApi } from '@/services/api';

// Define interfaces for our data
interface Project { id: number; title: string; /* other project fields */ }
interface Skill { id: number; name: string; /* other skill fields */ }
interface Experience { id: number; title: string; /* other experience fields */ }
interface Education { id: number; degree: string; /* other education fields */ }
interface ContactMessage { id: number; name: string; is_read: boolean; /* other message fields */ }

interface AdminState {
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  messages: ContactMessage[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchSkills: () => Promise<void>;
  fetchExperience: () => Promise<void>;
  fetchEducation: () => Promise<void>;
  fetchMessages: () => Promise<void>;
  // Add methods for create, update, delete later
}

export const useAdminStore = create<AdminState>((set) => ({
  // Initial state
  projects: [],
  skills: [],
  experience: [],
  education: [],
  messages: [],
  loading: false,
  error: null,

  // Fetch methods
  fetchProjects: async () => {
    try {
      set({ loading: true, error: null });
      const projects = await adminApi.getProjects();
      set({ projects, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch projects', loading: false });
    }
  },

  fetchSkills: async () => {
    try {
      set({ loading: true, error: null });
      const skills = await adminApi.getSkills();
      set({ skills, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch skills', loading: false });
    }
  },

  fetchExperience: async () => {
    try {
      set({ loading: true, error: null });
      const experience = await adminApi.getExperience();
      set({ experience, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch experience', loading: false });
    }
  },

  fetchEducation: async () => {
    try {
      set({ loading: true, error: null });
      const education = await adminApi.getEducation();
      set({ education, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch education', loading: false });
    }
  },

  fetchMessages: async () => {
    try {
      set({ loading: true, error: null });
      const messages = await adminApi.getContactMessages();
      set({ messages, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch messages', loading: false });
    }
  },
}));
