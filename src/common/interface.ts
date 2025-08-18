export interface Response {
  /** Indicates if the request was successful */
  success: boolean;
  /** The result of the request */
  result?: string | number;
}

export interface Paginated {
  /** Total number of results */
  count: number;
  /** Number of results per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Current page number */
  current: number;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
}

export interface Pagination {
  take: number;
  skip: number;
}
