import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { PaginatedResponse, PaginationQuery, UserRow } from '../types';

export interface UseUsersOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialSearch?: string;
  initialSortBy?: string;
  initialSortDir?: 'asc' | 'desc';
  autoLoad?: boolean;
}

export interface UseUsersReturn {
  data: PaginatedResponse<UserRow> | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateQuery: (updates: Partial<PaginationQuery>) => void;
  query: PaginationQuery;
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const {
    initialPage = 1,
    initialPageSize = 50,
    initialSearch = '',
    initialSortBy = 'name',
    initialSortDir = 'asc',
    autoLoad = true
  } = options;

  const [data, setData] = useState<PaginatedResponse<UserRow> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<PaginationQuery>({
    page: initialPage,
    pageSize: initialPageSize,
    search: initialSearch,
    sortBy: initialSortBy as any,
    sortDir: initialSortDir
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.getUsers(query);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const updateQuery = useCallback((updates: Partial<PaginationQuery>) => {
    setQuery(prev => ({
      ...prev,
      ...updates,
      // Reset to page 1 when changing search or sort
      ...(updates.search !== undefined || updates.sortBy !== undefined || updates.sortDir !== undefined
        ? { page: 1 }
        : {})
    }));
  }, []);

  const refetch = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (autoLoad) {
      fetchUsers();
    }
  }, [fetchUsers, autoLoad]);

  return {
    data,
    loading,
    error,
    refetch,
    updateQuery,
    query
  };
}

