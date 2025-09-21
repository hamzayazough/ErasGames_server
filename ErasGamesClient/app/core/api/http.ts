import { API_CONFIG, ApiError, RequestConfig, HttpMethod } from './config';

export class HttpService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Set authorization token for authenticated requests
   */
  setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Merge headers
    const headers = {
      ...this.defaultHeaders,
      ...config?.headers,
    };

    // Build request configuration
    const requestConfig: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(config?.timeout || this.timeout),
    };

    // Add body for POST/PUT/PATCH requests
    if (data && [HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH].includes(method)) {
      requestConfig.body = JSON.stringify(data);
    }

    // Add query parameters for GET requests
    let finalUrl = url;
    if (config?.params && method === HttpMethod.GET) {
      const searchParams = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        finalUrl += `?${queryString}`;
      }
    }

    try {
      console.log(`🌐 ${method} ${finalUrl}`, data ? { body: data } : '');
      
      const response = await fetch(finalUrl, requestConfig);
      
      let responseData: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      console.log(`📱 ${method} ${finalUrl} - ${response.status}`, responseData);

      if (!response.ok) {
        const errorMessage = responseData?.message || responseData || `HTTP ${response.status}`;
        throw new ApiError(errorMessage, response.status);
      }

      return responseData;
    } catch (error) {
      console.error(`❌ ${method} ${finalUrl}`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors, timeouts, etc.
      if (error.name === 'TimeoutError') {
        throw new ApiError('Request timeout', 408);
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new ApiError('Network error - please check your connection', 0);
      }
      
      throw new ApiError(error.message || 'An unexpected error occurred');
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(HttpMethod.GET, endpoint, undefined, config);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(HttpMethod.POST, endpoint, data, config);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(HttpMethod.PUT, endpoint, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(HttpMethod.DELETE, endpoint, undefined, config);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(HttpMethod.PATCH, endpoint, data, config);
  }
}

// Create and export singleton instance
export const httpService = new HttpService();

// Custom error class
class ApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}