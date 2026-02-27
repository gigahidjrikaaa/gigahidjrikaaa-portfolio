const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// --- Type Definitions (matching backend schemas) ---
export interface ProjectBase {
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
  thumbnail_url?: string;
  ui_image_url?: string;
  is_featured: boolean;
  is_active?: boolean;
  display_order: number;
}

export type ProjectUpdate = Partial<ProjectBase>;

export interface ProjectResponse extends ProjectBase {
  id: number;
  created_at: string;
  updated_at: string;
  images?: ProjectImageResponse[];
}

export interface ProjectImageBase {
  url: string;
  kind?: string;
  caption?: string;
  display_order?: number;
}

export type ProjectImageCreate = ProjectImageBase;
export type ProjectImageUpdate = Partial<ProjectImageBase>;

export interface ProjectImageResponse extends ProjectImageBase {
  id: number;
  project_id: number;
  created_at: string;
}

export interface ExperienceBase {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  company_logo_url?: string;
  is_current: boolean;
  display_order: number;
}

export type ExperienceUpdate = Partial<ExperienceBase>;

export interface ExperienceResponse extends ExperienceBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface EducationBase {
  degree: string;
  institution: string;
  location: string;
  period: string;
  description: string;
  gpa?: string;
  institution_logo_url?: string;
  institution_background_url?: string;
  is_current: boolean;
  display_order: number;
}

export type EducationUpdate = Partial<EducationBase>;

export interface EducationResponse extends EducationBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface SkillBase {
  name: string;
  category: string;
  proficiency: number;
  icon_url?: string;
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

export interface AwardBase {
  title: string;
  issuer?: string;
  award_date?: string;
  description?: string;
  credential_url?: string;
  image_url?: string;
  display_order: number;
}

export type AwardUpdate = Partial<AwardBase>;

export interface AwardResponse extends AwardBase {
  id: number;
  created_at: string;
}

export interface CertificateBase {
  title: string;
  issuer?: string;
  issue_date?: string;
  credential_id?: string;
  credential_url?: string;
  image_url?: string;
  description?: string;
  display_order: number;
}

export type CertificateUpdate = Partial<CertificateBase>;

export interface CertificateResponse extends CertificateBase {
  id: number;
  created_at: string;
}

export interface ServiceBase {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  is_featured: boolean;
  display_order: number;
}

export type ServiceUpdate = Partial<ServiceBase>;

export interface ServiceResponse extends ServiceBase {
  id: number;
  created_at: string;
}

export interface TestimonialSubmit {
  name: string;
  role: string;
  company?: string;
  content: string;
  rating?: number;
  project_relation?: string;
  linkedin_url?: string;
  submitter_email: string;
}

export interface TestimonialResponse {
  id: number;
  name: string;
  role: string;
  company?: string;
  avatar_url?: string;
  content: string;
  rating?: number;
  project_relation?: string;
  linkedin_url?: string;
  is_featured: boolean;
  display_order: number;
  status?: string;
  submitter_email?: string;
  created_at: string;
}

export interface BlogPostBase {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string;
  cover_image_url?: string;
  og_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  reading_time_minutes?: number;
  view_count?: number;
  like_count?: number;
  is_featured?: boolean;
  status: string;
  is_external?: boolean;
  external_url?: string;
  external_source?: string;
}

export type BlogPostUpdate = Partial<BlogPostBase>;

export interface BlogPostResponse extends BlogPostBase {
  id: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostListResponse {
  items: BlogPostResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  categories: string[];
  popular: BlogPostResponse[];
  latest: BlogPostResponse[];
  featured: BlogPostResponse[];
}

export interface ProfileBase {
  full_name?: string;
  headline?: string;
  bio?: string;
  location?: string;
  availability?: string;
  avatar_url?: string;
  resume_url?: string;
}

export type ProfileUpdate = Partial<ProfileBase>;

export interface ProfileResponse extends ProfileBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileImportResponse {
  profile: ProfileUpdate;
  meta: {
    pages_scanned: number;
    text_length: number;
  };
}

export interface ScrapeResult {
  content_type: 'press_mention' | 'blog_article' | 'project';
  url: string;
  data: Record<string, string | boolean | string[] | null>;
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

export interface MediaAssetBase {
  title?: string;
  alt_text?: string;
  url: string;
  public_id?: string;
  provider?: string;
  folder?: string;
  tags?: string;
  asset_type?: string;
  width?: number;
  height?: number;
  size_bytes?: number;
}

export type MediaAssetCreate = MediaAssetBase;
export type MediaAssetUpdate = Partial<MediaAssetBase>;

export interface MediaAssetResponse extends MediaAssetBase {
  id: number;
  created_at: string;
}

export interface MediaAssetListResponse {
  items: MediaAssetResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface SeoSettingsBase {
  site_title?: string;
  site_description?: string;
  keywords?: string;
  og_image_url?: string;
  canonical_url?: string;
  // Sitemap control
  sitemap_home_priority?: number;
  sitemap_home_changefreq?: string;
  sitemap_blog_enabled?: boolean;
  sitemap_blog_priority?: number;
  sitemap_blog_changefreq?: string;
  sitemap_posts_enabled?: boolean;
  sitemap_posts_priority?: number;
  sitemap_posts_changefreq?: string;
  sitemap_custom_pages?: string; // JSON string
}

export type SeoSettingsUpdate = Partial<SeoSettingsBase>;

export interface SeoSettingsResponse extends SeoSettingsBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface StoryBase {
  title?: string;
  caption?: string;
  image_url: string;
  thumbnail_url?: string;
  is_featured: boolean;
  display_order: number;
}

export type StoryUpdate = Partial<StoryBase>;

export interface StoryResponse extends StoryBase {
  id: number;
  created_at: string;
}

export interface ClientBase {
  name: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  is_featured: boolean;
  display_order: number;
}

export type ClientUpdate = Partial<ClientBase>;

export interface ClientResponse extends ClientBase {
  id: number;
  created_at: string;
}

export interface PressMentionBase {
  title: string;
  publication?: string;
  publication_url?: string;
  publication_date?: string;
  excerpt?: string;
  image_url?: string;
  is_featured: boolean;
  display_order: number;
  social_username?: string;
}

export type PressMentionUpdate = Partial<PressMentionBase>;

export interface PressMentionResponse extends PressMentionBase {
  id: number;
  created_at: string;
}

// --- Analytics ---
export interface AnalyticsRegion {
  region: string;
  count: number;
  pct: number;
  color: string;
}

export interface AnalyticsTopCity {
  label: string;
  city: string;
  country_code: string;
  count: number;
}

export interface AnalyticsStats {
  total: number;
  today: number;
  online_now: number;
  countries_count: number;
  regions: AnalyticsRegion[];
  top_cities: AnalyticsTopCity[];
  sparkline: number[]; // 7 values (last 7 days)
}

// --- API Services ---
class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

class ApiService {
  protected getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  protected getAuthHeaders(endpoint: string, method: string, includeJson: boolean = true) {
    const headers: Record<string, string> = {
      ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    };

    // For cookie-based auth, include CSRF token for state-changing requests.
    const upper = (method || 'GET').toUpperCase();
    const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(upper) && !endpoint.startsWith('/auth/login');
    if (needsCsrf) {
      const csrf = this.getCookie('csrf_token');
      if (csrf) {
        headers['X-CSRF-Token'] = csrf;
      }
    }

    return headers;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeJson: boolean = true,
    allowRefresh: boolean = true
  ): Promise<T> {
    const method = (options.method || 'GET').toString();
    const executeRequest = async () => {
      try {
        return await fetch(`${NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
          ...options,
          credentials: 'include',
          headers: {
            ...this.getAuthHeaders(endpoint, method, includeJson),
            ...options.headers
          }
        });
      } catch {
        throw new Error("Unable to reach the API. Please ensure the backend is running and try again.");
      }
    };

    let response = await executeRequest();

    const shouldSkipRefresh = endpoint.startsWith('/auth/login')
      || endpoint === '/auth/refresh'
      || endpoint === '/auth/logout';

    if (!response.ok && allowRefresh && !shouldSkipRefresh && (response.status === 401 || response.status === 403)) {
      try {
        await this.refreshToken();
      } catch {
        throw new ApiError(`API Error: ${response.statusText}`, response.status);
      }

      response = await executeRequest();
    }

    if (!response.ok) {
      throw new ApiError(`API Error: ${response.statusText}`, response.status);
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

  async refreshToken(): Promise<Token> {
    return this.request<Token>('/auth/refresh', {
      method: 'POST',
    }, true, false);
  }

  async logout(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  }

  async verifyToken(): Promise<{ valid: boolean; user?: UserResponse | null }> {
    try {
      return await this.request<{ valid: boolean; user?: UserResponse | null }>('/auth/verify-token', {
        method: 'POST'
      });
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        return { valid: false, user: null };
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<UserResponse | null> {
    try {
      return await this.request<UserResponse>('/auth/me');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        return null;
      }
      throw error;
    }
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

  // Public Profile
  async getProfile(): Promise<ProfileResponse> {
    return this.request<ProfileResponse>('/profile');
  }

  // Awards
  async getAwards(): Promise<AwardResponse[]> {
    return this.request<AwardResponse[]>('/awards');
  }

  // Certificates
  async getCertificates(): Promise<CertificateResponse[]> {
    return this.request<CertificateResponse[]>('/certificates');
  }

  // Services
  async getServices(): Promise<ServiceResponse[]> {
    return this.request<ServiceResponse[]>('/services');
  }

  // Blog
  async getBlogPosts(): Promise<BlogPostResponse[]> {
    return this.request<BlogPostResponse[]>('/blog');
  }

  async getBlogPostsPaged(params?: { page?: number; page_size?: number; category?: string; q?: string }): Promise<BlogPostListResponse> {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', params.page.toString());
    if (params?.page_size) search.set('page_size', params.page_size.toString());
    if (params?.category) search.set('category', params.category);
    if (params?.q) search.set('q', params.q);
    const suffix = search.toString();
    return this.request<BlogPostListResponse>(`/blog/paged${suffix ? `?${suffix}` : ''}`);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPostResponse> {
    return this.request<BlogPostResponse>(`/blog/${slug}`);
  }

  async trackBlogView(slug: string): Promise<{ message: string; view_count: number }> {
    return this.request<{ message: string; view_count: number }>(`/blog/${slug}/view`, {
      method: 'POST'
    });
  }

  async trackBlogLike(slug: string): Promise<{ message: string; like_count: number }> {
    return this.request<{ message: string; like_count: number }>(`/blog/${slug}/like`, {
      method: 'POST'
    });
  }

  async getRelatedBlogPosts(slug: string): Promise<BlogPostResponse[]> {
    return this.request<BlogPostResponse[]>(`/blog/related?slug=${encodeURIComponent(slug)}`);
  }

  async getTestimonials(): Promise<TestimonialResponse[]> {
    return this.request<TestimonialResponse[]>('/testimonials/featured');
  }

  async submitTestimonial(payload: TestimonialSubmit): Promise<{ message: string }> {
    return this.request<{ message: string }>('/testimonials/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getPublicSeoSettings(): Promise<Partial<SeoSettingsResponse> | null> {
    return this.request<Partial<SeoSettingsResponse> | null>('/seo');
  }

  async getStories(): Promise<StoryResponse[]> {
    return this.request<StoryResponse[]>('/stories');
  }

  async getClients(): Promise<ClientResponse[]> {
    return this.request<ClientResponse[]>('/clients');
  }

  async getPressMentions(): Promise<PressMentionResponse[]> {
    return this.request<PressMentionResponse[]>('/press-mentions');
  }

  async recordVisit(sessionId: string): Promise<void> {
    await this.request<void>('/analytics/visit', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  async getAnalyticsStats(): Promise<AnalyticsStats> {
    return this.request<AnalyticsStats>('/analytics/stats');
  }
}

class AdminApiService extends ApiService {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/admin/dashboard/stats');
  }

  // Profile
  async getProfile(): Promise<ProfileResponse> {
    return this.request<ProfileResponse>('/admin/profile');
  }

  async updateProfile(payload: ProfileUpdate): Promise<ProfileResponse> {
    return this.request<ProfileResponse>('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async importProfileFromLinkedInPdf(file: File): Promise<ProfileImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/profile/import-linkedin-pdf`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...this.getAuthHeaders('/admin/profile/import-linkedin-pdf', 'POST', false),
      },
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => '');
      throw new Error(message || `API Error: ${response.statusText}`);
    }

    return response.json();
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

  // Project Images
  async getProjectImages(projectId: number): Promise<ProjectImageResponse[]> {
    return this.request<ProjectImageResponse[]>(`/admin/projects/${projectId}/images`);
  }

  async createProjectImage(projectId: number, payload: ProjectImageCreate): Promise<ProjectImageResponse> {
    return this.request<ProjectImageResponse>(`/admin/projects/${projectId}/images`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateProjectImage(
    projectId: number,
    imageId: number,
    payload: ProjectImageUpdate
  ): Promise<ProjectImageResponse> {
    return this.request<ProjectImageResponse>(`/admin/projects/${projectId}/images/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteProjectImage(projectId: number, imageId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/projects/${projectId}/images/${imageId}`, {
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

  // Awards
  async getAwards(): Promise<AwardResponse[]> {
    return this.request<AwardResponse[]>('/admin/awards');
  }

  async createAward(payload: AwardBase): Promise<AwardResponse> {
    return this.request<AwardResponse>('/admin/awards', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateAward(id: number, payload: AwardUpdate): Promise<AwardResponse> {
    return this.request<AwardResponse>(`/admin/awards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteAward(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/awards/${id}`, {
      method: 'DELETE',
    });
  }

  // Certificates
  async getCertificates(): Promise<CertificateResponse[]> {
    return this.request<CertificateResponse[]>('/admin/certificates');
  }

  async createCertificate(payload: CertificateBase): Promise<CertificateResponse> {
    return this.request<CertificateResponse>('/admin/certificates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateCertificate(id: number, payload: CertificateUpdate): Promise<CertificateResponse> {
    return this.request<CertificateResponse>(`/admin/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteCertificate(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/certificates/${id}`, {
      method: 'DELETE',
    });
  }

  // Services
  async getServices(): Promise<ServiceResponse[]> {
    return this.request<ServiceResponse[]>('/admin/services');
  }

  async createService(payload: ServiceBase): Promise<ServiceResponse> {
    return this.request<ServiceResponse>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateService(id: number, payload: ServiceUpdate): Promise<ServiceResponse> {
    return this.request<ServiceResponse>(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteService(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Blog
  async getBlogPosts(): Promise<BlogPostResponse[]> {
    return this.request<BlogPostResponse[]>('/admin/blog');
  }

  async createBlogPost(payload: BlogPostBase): Promise<BlogPostResponse> {
    return this.request<BlogPostResponse>('/admin/blog', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateBlogPost(id: number, payload: BlogPostUpdate): Promise<BlogPostResponse> {
    return this.request<BlogPostResponse>(`/admin/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteBlogPost(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/blog/${id}`, {
      method: 'DELETE',
    });
  }

  // Media
  async getMediaAssets(params?: { q?: string; tag?: string; page?: number; page_size?: number }): Promise<MediaAssetListResponse> {
    const search = new URLSearchParams();
    if (params?.q) search.set('q', params.q);
    if (params?.tag) search.set('tag', params.tag);
    if (params?.page) search.set('page', params.page.toString());
    if (params?.page_size) search.set('page_size', params.page_size.toString());

    const suffix = search.toString();
    return this.request<MediaAssetListResponse>(`/admin/media${suffix ? `?${suffix}` : ''}`);
  }

  async createMediaAsset(payload: MediaAssetCreate): Promise<MediaAssetResponse> {
    return this.request<MediaAssetResponse>('/admin/media', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateMediaAsset(id: number, payload: MediaAssetUpdate): Promise<MediaAssetResponse> {
    return this.request<MediaAssetResponse>(`/admin/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteMediaAsset(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/media/${id}`, {
      method: 'DELETE'
    });
  }

  async uploadMediaAsset(
    file: File,
    meta?: { title?: string; alt_text?: string; tags?: string; folder?: string }
  ): Promise<MediaAssetResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (meta?.title) {
      formData.append('title', meta.title);
    }
    if (meta?.alt_text) {
      formData.append('alt_text', meta.alt_text);
    }
    if (meta?.tags) {
      formData.append('tags', meta.tags);
    }
    if (meta?.folder) {
      formData.append('folder', meta.folder);
    }

    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/media/upload`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...this.getAuthHeaders('/admin/media/upload', 'POST', false)
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async bulkDeleteMediaAssets(ids: number[]): Promise<{ deleted_ids: number[]; failed_ids: number[] }> {
    return this.request<{ deleted_ids: number[]; failed_ids: number[] }>(
      '/admin/media/bulk-delete',
      {
        method: 'POST',
        body: JSON.stringify({ ids })
      }
    );
  }

  // SEO Settings
  async getSeoSettings(): Promise<SeoSettingsResponse> {
    return this.request<SeoSettingsResponse>('/admin/seo');
  }

  async updateSeoSettings(payload: SeoSettingsUpdate): Promise<SeoSettingsResponse> {
    return this.request<SeoSettingsResponse>('/admin/seo', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async getStories(): Promise<StoryResponse[]> {
    return this.request<StoryResponse[]>('/admin/stories');
  }

  async createStory(payload: StoryBase): Promise<StoryResponse> {
    return this.request<StoryResponse>('/admin/stories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateStory(id: number, payload: StoryUpdate): Promise<StoryResponse> {
    return this.request<StoryResponse>(`/admin/stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteStory(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/stories/${id}`, {
      method: 'DELETE'
    });
  }

  async getClients(): Promise<ClientResponse[]> {
    return this.request<ClientResponse[]>('/admin/clients');
  }

  async createClient(payload: ClientBase): Promise<ClientResponse> {
    return this.request<ClientResponse>('/admin/clients', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateClient(id: number, payload: ClientUpdate): Promise<ClientResponse> {
    return this.request<ClientResponse>(`/admin/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteClient(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/clients/${id}`, {
      method: 'DELETE'
    });
  }

  async getPressMentions(): Promise<PressMentionResponse[]> {
    return this.request<PressMentionResponse[]>('/admin/press-mentions');
  }

  async createPressMention(payload: PressMentionBase): Promise<PressMentionResponse> {
    return this.request<PressMentionResponse>('/admin/press-mentions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updatePressMention(id: number, payload: PressMentionUpdate): Promise<PressMentionResponse> {
    return this.request<PressMentionResponse>(`/admin/press-mentions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deletePressMention(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/press-mentions/${id}`, {
      method: 'DELETE'
    });
  }

  // ─── Testimonials (admin) ──────────────────────────────────────────────
  async adminGetAllTestimonials(): Promise<TestimonialResponse[]> {
    return this.request<TestimonialResponse[]>('/testimonials/admin/all');
  }

  async adminGetPendingTestimonials(): Promise<TestimonialResponse[]> {
    return this.request<TestimonialResponse[]>('/testimonials/admin/pending');
  }

  async adminApproveTestimonial(id: number): Promise<TestimonialResponse> {
    return this.request<TestimonialResponse>(`/testimonials/admin/${id}/approve`, { method: 'POST' });
  }

  async adminRejectTestimonial(id: number): Promise<TestimonialResponse> {
    return this.request<TestimonialResponse>(`/testimonials/admin/${id}/reject`, { method: 'POST' });
  }

  async adminDeleteTestimonial(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/testimonials/${id}`, { method: 'DELETE' });
  }

  async adminUpdateTestimonial(id: number, payload: Partial<TestimonialResponse>): Promise<TestimonialResponse> {
    return this.request<TestimonialResponse>(`/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // ─── URL Scraper / AI Analyzer ──────────────────────────────────────────
  async scrapeUrl(
    url: string,
    contentType: 'press_mention' | 'blog_article' | 'project'
  ): Promise<ScrapeResult> {
    return this.request<ScrapeResult>('/admin/scrape', {
      method: 'POST',
      body: JSON.stringify({ url, content_type: contentType }),
    });
  }
}

export const apiService = new ApiService();
export const adminApi = new AdminApiService();