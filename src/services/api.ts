import { Link, CreateLinkRequest, ApiResponse, AuthRequest, AuthResponse, User } from '../types';

const API_BASE_URL = '/api';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Set auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  // Authentication
  register: async (data: AuthRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  login: async (data: Omit<AuthRequest, 'name'>): Promise<ApiResponse<AuthResponse>> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    
    return response.json();
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Create a new shortened link
  createLink: async (data: CreateLinkRequest): Promise<ApiResponse<Link & { shortUrl: string }>> => {
    const response = await fetch(`${API_BASE_URL}/shorten`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  // Get all links
  getAllLinks: async (): Promise<ApiResponse<Link[]>> => {
    const response = await fetch(`${API_BASE_URL}/links`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Toggle link status
  toggleLinkStatus: async (id: number): Promise<ApiResponse<Link>> => {
    const response = await fetch(`${API_BASE_URL}/links/${id}/toggle`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    
    return response.json();
  },

  // Delete link
  deleteLink: async (id: number): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/links/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return response.json();
  },
};