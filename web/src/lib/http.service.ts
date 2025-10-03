// lib/http.service.ts
import { auth } from "./firebase";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class HttpService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  }

  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    return await user.getIdToken();
  }

  private async buildHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("Content-Type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
      const errorBody = isJson ? await response.json() : await response.text();
      throw new Error(
        errorBody?.message ||
          errorBody ||
          `HTTP ${response.status}: ${response.statusText}`
      );
    }

    if (isJson) {
      return await response.json();
    }

    return {
      success: true,
      data: (await response.text()) as unknown as T,
    };
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const headers = await this.buildHeaders();
    const response = await fetch(this.buildUrl(endpoint), {
      method: "GET",
      headers,
    });
    return this.handleResponse<T>(response);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const headers = await this.buildHeaders();
    const response = await fetch(this.buildUrl(endpoint), {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const headers = await this.buildHeaders();
    const response = await fetch(this.buildUrl(endpoint), {
      method: "PATCH",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const headers = await this.buildHeaders();
    const response = await fetch(this.buildUrl(endpoint), {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const headers = await this.buildHeaders();
    const response = await fetch(this.buildUrl(endpoint), {
      method: "DELETE",
      headers,
    });
    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const httpService = new HttpService();
