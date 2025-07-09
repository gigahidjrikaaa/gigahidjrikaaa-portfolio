import { create } from 'zustand';
import { adminApi, ProjectBase, ProjectResponse, ExperienceBase, EducationBase, SkillBase, ContactMessageResponse } from '@/services/api';

interface AdminState {
  projects: ProjectResponse[]; // Use ProjectResponse directly
  experience: ExperienceBase[]; // Use ExperienceBase or ExperienceResponse if available
  education: EducationBase[];   // Use EducationBase or EducationResponse if available
  skills: SkillBase[];          // Use SkillBase or SkillResponse if available
  messages: ContactMessageResponse[]; // Use ContactMessageResponse directly
  loading: boolean;
  error: string | null;
  
  fetchProjects: () => Promise<void>;
  createProject: (project: ProjectBase) => Promise<void>;
  updateProject: (id: number, project: ProjectBase) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;

  fetchExperience: () => Promise<void>;
  createExperience: (experience: ExperienceBase) => Promise<void>;
  updateExperience: (id: number, experience: ExperienceBase) => Promise<void>;
  deleteExperience: (id: number) => Promise<void>;

  fetchEducation: () => Promise<void>;
  createEducation: (education: EducationBase) => Promise<void>;
  updateEducation: (id: number, education: EducationBase) => Promise<void>;
  deleteEducation: (id: number) => Promise<void>;

  fetchSkills: () => Promise<void>;
  createSkill: (skill: SkillBase) => Promise<void>;
  updateSkill: (id: number, skill: SkillBase) => Promise<void>;
  deleteSkill: (id: number) => Promise<void>;

  fetchMessages: () => Promise<void>;
  markMessageAsRead: (id: number) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  // Initial state
  projects: [],
  experience: [],
  education: [],
  skills: [],
  messages: [],
  loading: false,
  error: null,

  // Project methods
  fetchProjects: async () => {
    try {
      set({ loading: true, error: null });
      const projects = await adminApi.getProjects();
      set({ projects, loading: false });
    } catch {
      set({ error: 'Failed to fetch projects', loading: false });
    }
  },

  createProject: async (project: ProjectBase) => {
    try {
      set({ loading: true, error: null });
      const newProject = await adminApi.createProject(project);
      set((state) => ({
        projects: [...state.projects, newProject],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create project', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  updateProject: async (id: number, project: ProjectBase) => {
    try {
      set({ loading: true, error: null });
      const updatedProject = await adminApi.updateProject(id, project);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update project', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  deleteProject: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await adminApi.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete project', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  // Experience methods
  fetchExperience: async () => {
    try {
      set({ loading: true, error: null });
      const experience = await adminApi.getExperience();
      set({ experience, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch experience', loading: false });
    }
  },

  createExperience: async (experience: ExperienceBase) => {
    try {
      set({ loading: true, error: null });
      const newExperience = await adminApi.createExperience(experience);
      set((state) => ({
        experience: [...state.experience, newExperience],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create experience', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  updateExperience: async (id: number, experience: ExperienceBase) => {
    try {
      set({ loading: true, error: null });
      const updatedExperience = await adminApi.updateExperience(id, experience);
      set((state) => ({
        experience: state.experience.map((exp) => (exp.id === id ? updatedExperience : exp)),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update experience', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  deleteExperience: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await adminApi.deleteExperience(id);
      set((state) => ({
        experience: state.experience.filter((exp) => exp.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete experience', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  // Education methods
  fetchEducation: async () => {
    try {
      set({ loading: true, error: null });
      const education = await adminApi.getEducation();
      set({ education, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch education', loading: false });
    }
  },

  createEducation: async (education: EducationBase) => {
    try {
      set({ loading: true, error: null });
      const newEducation = await adminApi.createEducation(education);
      set((state) => ({
        education: [...state.education, newEducation],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create education', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  updateEducation: async (id: number, education: EducationBase) => {
    try {
      set({ loading: true, error: null });
      const updatedEducation = await adminApi.updateEducation(id, education);
      set((state) => ({
        education: state.education.map((edu) => (edu.id === id ? updatedEducation : edu)),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update education', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  deleteEducation: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await adminApi.deleteEducation(id);
      set((state) => ({
        education: state.education.filter((edu) => edu.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete education', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  // Skill methods
  fetchSkills: async () => {
    try {
      set({ loading: true, error: null });
      const skills = await adminApi.getSkills();
      set({ skills, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch skills', loading: false });
    }
  },

  createSkill: async (skill: SkillBase) => {
    try {
      set({ loading: true, error: null });
      const newSkill = await adminApi.createSkill(skill);
      set((state) => ({
        skills: [...state.skills, newSkill],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create skill', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  updateSkill: async (id: number, skill: SkillBase) => {
    try {
      set({ loading: true, error: null });
      const updatedSkill = await adminApi.updateSkill(id, skill);
      set((state) => ({
        skills: state.skills.map((s) => (s.id === id ? updatedSkill : s)),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update skill', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  deleteSkill: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await adminApi.deleteSkill(id);
      set((state) => ({
        skills: state.skills.filter((s) => s.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete skill', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  // Contact Message methods
  fetchMessages: async () => {
    try {
      set({ loading: true, error: null });
      const messages = await adminApi.getContactMessages();
      set({ messages, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch messages', loading: false });
    }
  },

  markMessageAsRead: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await adminApi.markMessageAsRead(id);
      set((state) => ({
        messages: state.messages.map((msg) => (msg.id === id ? { ...msg, is_read: true } : msg)),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to mark message as read', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },

  deleteMessage: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await adminApi.deleteMessage(id);
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete message', loading: false });
      throw error; // Re-throw to allow component to handle
    }
  },
}));