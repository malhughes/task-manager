import { api, ApiError } from './api.js';

// Authentication API service functions
export const authService = {
  // Login user
  async login(credentials) {
    try {
      const { username, password } = credentials;

      if (!username || !password) {
        throw new ApiError('Username and password are required', 400);
      }

      const response = await api.post('/auth/login', {
        username: username.trim(),
        password,
      });

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw new ApiError(
        error.message || 'Login failed',
        error.status || 401,
        error.data
      );
    }
  },

  // Logout user
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      console.error('Logout failed:', error);
      throw new ApiError(
        error.message || 'Logout failed',
        error.status || 500,
        error.data
      );
    }
  },

  // Register new user
  async register(userData) {
    try {
      const { fullName, username, email, password, confirmPassword } = userData;

      if (!fullName || !username || !email || !password) {
        throw new ApiError('Full name, username, email, and password are required', 400);
      }

      if (password !== confirmPassword) {
        throw new ApiError('Passwords do not match', 400);
      }

      const response = await api.post('/auth/signup', {
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw new ApiError(
        error.message || 'Registration failed',
        error.status || 400,
        error.data
      );
    }
  },

  // Check if user is authenticated
  async checkAuth() {
    try {
      // This endpoint should return user info if authenticated
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      // If auth check fails, user is not authenticated
      if (error.status === 401) {
        return null;
      }

      console.error('Auth check failed:', error);
      throw new ApiError(
        error.message || 'Authentication check failed',
        error.status || 500,
        error.data
      );
    }
  },
};