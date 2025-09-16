export class ApiError extends Error {
  status?: number;
  code?: string;
  data?: unknown;

  constructor(message: string, status?: number, code?: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export function normalizeApiError(err: any): ApiError {
  if (err?.response) {
    const {status, data} = err.response;
    const message = data?.message || `Request failed (${status})`;
    return new ApiError(message, status, data?.code, data);
  }

  if (err?.request) {
    return new ApiError('Network error - no response received');
  }

  return new ApiError(err?.message ?? 'Unknown error occurred');
}
