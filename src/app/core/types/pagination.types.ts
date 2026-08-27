export interface PaginationCriteria {
  page?: number;
  size?: number;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface PaginationResponse<T> {
  content: T[];
  pageSize: number;
  totalElements: number;
  totalPages: number;
}