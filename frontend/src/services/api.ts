const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
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
  async login(username: string, password: string) {
    return this.request('/auth/login-json', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  async verifyToken() {
    return this.request('/auth/verify-token');
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }
}

class AdminApiService extends ApiService {
  // Dashboard
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  // Projects
  async getProjects() {
    return this.request('/admin/projects');
  }

  async getProject(id: number) {
    return this.request(`/admin/projects/${id}`);
  }

  async createProject(project: any) {
    return this.request('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  }

  async updateProject(id: number, project: any) {
    return this.request(`/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project)
    });
  }

  async deleteProject(id: number) {
    return this.request(`/admin/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // Contact Messages
  async getContactMessages() {
    return this.request('/admin/contact-messages');
  }

  async markMessageAsRead(id: number) {
    return this.request(`/admin/contact-messages/${id}/mark-read`, {
      method: 'PUT'
    });
  }

  async deleteMessage(id: number) {
    return this.request(`/admin/contact-messages/${id}`, {
      method: 'DELETE'
    });
  }

  // Experience
  async getExperience() {
    return this.request('/admin/experience');
  }

  async createExperience(experience: any) {
    return this.request('/admin/experience', {
      method: 'POST',
      body: JSON.stringify(experience)
    });
  }

  async updateExperience(id: number, experience: any) {
    return this.request(`/admin/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(experience)
    });
  }

  async deleteExperience(id: number) {
    return this.request(`/admin/experience/${id}`, {
      method: 'DELETE'
    });
  }

  // Education
  async getEducation() {
    return this.request('/admin/education');
  }

  async createEducation(education: any) {
    return this.request('/admin/education', {
      method: 'POST',
      body: JSON.stringify(education)
    });
  }

  async updateEducation(id: number, education: any) {
    return this.request(`/admin/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(education)
    });
  }

  async deleteEducation(id: number) {
    return this.request(`/admin/education/${id}`, {
      method: 'DELETE'
    });
  }

  // Skills
  async getSkills() {
    return this.request('/admin/skills');
  }

  async createSkill(skill: any) {
    return this.request('/admin/skills', {
      method: 'POST',
      body: JSON.stringify(skill)
    });
  }

  async updateSkill(id: number, skill: any) {
    return this.request(`/admin/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skill)
    });
  }

  async deleteSkill(id: number) {
    return this.request(`/admin/skills/${id}`, {
      method: 'DELETE'
    });
  }
}

export const apiService = new ApiService();
export const adminApi = new AdminApiService();