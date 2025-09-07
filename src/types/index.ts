export interface Link {
  id: number;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  expiresAt: string | null;
  clickCount: number;
  isActive: boolean;
  shortUrl?: string;
  isExpired?: boolean;
}

export interface CreateLinkRequest {
  originalUrl: string;
  shortCode: string;
  expiresAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}