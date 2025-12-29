/**
 * API configuration and utilities
 */

// Get the API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - The API endpoint (e.g., '/api/auth/login')
 * @returns The full URL
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
}

/**
 * Make an API request with proper error handling
 * @param endpoint - The API endpoint
 * @param options - Fetch options
 * @returns Promise with the response
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = getApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response;
}