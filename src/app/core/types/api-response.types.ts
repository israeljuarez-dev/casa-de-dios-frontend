export interface ApiResponse<T> {
  status: number;
  message: string;
  success: boolean;
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  reasons: string[];
}