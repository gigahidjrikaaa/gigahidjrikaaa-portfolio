const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// --- Type Definitions (matching backend schemas) ---
interface ProjectBase {
  title: string;
  tagline: string;
  description: string;
  github_url: string;
  live_url?: string;
  case_study_url?: string;
  role: string;
  team_size: number;
  challenges: string;
  solutions: string;
  impact: string;
  image_url?: string;
  is_featured: boolean;
  display_order: number;
}

export type ProjectUpdate = Partial<ProjectBase>;

export interface ProjectResponse extends ProjectBase {
  id: number;
  created_at: string;
  updated_at: string;
}

interface ExperienceBase {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  is_current: boolean;
  display_order: number;
}

export type ExperienceUpdate = Partial<ExperienceBase>;

export interface ExperienceResponse extends ExperienceBase {
  id: number;
  created_at: string;
  updated_at: string;
}

interface EducationBase {
  degree: string;
  institution: string;
  location: string;
  period: string;
  description: string;
  gpa?: string;
  is_current: boolean;
  display_order: number;
}

export type EducationUpdate = Partial<EducationBase>;

export interface EducationResponse extends EducationBase {
  id: number;
  created_at: string;
  updated_at: string;
}

interface SkillBase {
  name: string;
  category: string;
  proficiency: number;
  display_order: number;
}

export type SkillUpdate = Partial<SkillBase>;

export interface SkillResponse extends SkillBase {
  id: number;
  created_at: string;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessageResponse {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

export interface DashboardStats {
  total_projects: number;
  featured_projects: number;
  total_skills: number;
  total_experience: number;
  total_education: number;
  unread_messages: number;
  total_messages: number;
}

// --- API Services ---
class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<Token> {
    return this.request<Token>('/auth/login-json', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  async verifyToken(): Promise<{ valid: boolean; user: UserResponse }> {
    return this.request<{ valid: boolean; user: UserResponse }>('/auth/verify-token', {
      method: 'POST'
    });
  }

  async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>('/auth/me');
  }

  // Public Education
  async getEducation(): Promise<EducationResponse[]> {
    return this.request<EducationResponse[]>('/education');
  }

  // Public Experience
  async getExperience(): Promise<ExperienceResponse[]> {
    return this.request<ExperienceResponse[]>('/experience');
  }

  // Public Skills
  async getSkills(): Promise<SkillResponse[]> {
    return this.request<SkillResponse[]>('/skills');
  }

  // Public Projects
  async getProjects(): Promise<ProjectResponse[]> {
    return this.request<ProjectResponse[]>('/projects/all');
  }
}

class AdminApiService extends ApiService {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/admin/dashboard/stats');
  }

  // Projects
  async getProjects(): Promise<ProjectResponse[]> {
    return this.request<ProjectResponse[]>('/admin/projects');
  }

  async getProject(id: number): Promise<ProjectResponse> {
    return this.request<ProjectResponse>(`/admin/projects/${id}`);
  }

  async createProject(project: ProjectBase): Promise<ProjectResponse> {
    return this.request<ProjectResponse>('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  }

  async updateProject(id: number, project: ProjectUpdate): Promise<ProjectResponse> {
    return this.request<ProjectResponse>(`/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project)
    });
  }

  async deleteProject(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // Contact Messages
  async getContactMessages(): Promise<ContactMessageResponse[]> {
    return this.request<ContactMessageResponse[]>('/admin/contact-messages');
  }

  async markMessageAsRead(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/contact-messages/${id}/mark-read`, {
      method: 'PUT'
    });
  }

  async deleteMessage(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/contact-messages/${id}`, {
      method: 'DELETE'
    });
  }

  // Experience
  async getExperience(): Promise<ExperienceResponse[]> {
    return this.request<ExperienceResponse[]>('/admin/experience');
  }

  async createExperience(experience: ExperienceBase): Promise<ExperienceResponse> {
    return this.request<ExperienceResponse>('/admin/experience', {
      method: 'POST',
      body: JSON.stringify(experience)
    });
  }

  async updateExperience(id: number, experience: ExperienceUpdate): Promise<ExperienceResponse> {
    return this.request<ExperienceResponse>(`/admin/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(experience)
    });
  }

  async deleteExperience(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/experience/${id}`, {
      method: 'DELETE'
    });
  }

  // Education
  async getEducation(): Promise<EducationResponse[]> {
    return this.request<EducationResponse[]>('/admin/education');
  }

  async createEducation(education: EducationBase): Promise<EducationResponse> {
    return this.request<EducationResponse>('/admin/education', {
      method: 'POST',
      body: JSON.stringify(education)
    });
  }

  async updateEducation(id: number, education: EducationUpdate): Promise<EducationResponse> {
    return this.request<EducationResponse>(`/admin/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(education)
    });
  }

  async deleteEducation(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/education/${id}`, {
      method: 'DELETE'
    });
  }

  // Skills
  async getSkills(): Promise<SkillResponse[]> {
    return this.request<SkillResponse[]>('/admin/skills');
  }

  async createSkill(skill: SkillBase): Promise<SkillResponse> {
    return this.request<SkillResponse>('/admin/skills', {
      method: 'POST',
      body: JSON.stringify(skill)
    });
  }

  async updateSkill(id: number, skill: SkillUpdate): Promise<SkillResponse> {
    return this.request<SkillResponse>(`/admin/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skill)
    });
  }

  async deleteSkill(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/skills/${id}`, {
      method: 'DELETE'
    });
  }
}

export const apiService = new ApiService();
export const adminApi = new AdminApiService();