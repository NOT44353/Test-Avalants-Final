import { Database, DollarSign, Loader2, ShoppingCart, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UserTable } from '../components/UserTable';
import VirtualizedDataTable from '../components/VirtualizedDataTable';
import { useDebounce } from '../hooks/useDebounce';
import { useUsers } from '../hooks/useUsers';
import { apiService } from '../services/api';

export function UsersPage() {
  const [searchValue, setSearchValue] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [useVirtualization, setUseVirtualization] = useState(false);

  const debouncedSearch = useDebounce(searchValue, 250);

  const {
    data,
    loading,
    error,
    refetch,
    updateQuery,
    query
  } = useUsers({
    initialPage: 1,
    initialPageSize: 50,
    autoLoad: true
  });

  // Update search when debounced value changes
  useEffect(() => {
    updateQuery({ search: debouncedSearch });
  }, [debouncedSearch, updateQuery]);

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const statsData = await apiService.getUserStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);

  const handlePageChange = (page: number, pageSize: number) => {
    updateQuery({ page, pageSize });
  };

  const handleSort = (sortBy: string, sortDir: 'asc' | 'desc') => {
    updateQuery({ sortBy: sortBy as any, sortDir });
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Manage and view user data with advanced filtering and sorting
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalUsers?.toLocaleString() || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Orders
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalOrders?.toLocaleString() || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Revenue
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${stats.totalRevenue?.toLocaleString() || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Avg Order Value
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${stats.averageOrderValue?.toFixed(2) || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Users</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {data ? `Showing ${data.items.length} of ${data.total} users` : 'Loading...'}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={useVirtualization}
                    onChange={(e) => setUseVirtualization(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Virtual Scrolling</span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6">
            {useVirtualization ? (
              <VirtualizedDataTable
                data={data?.items || []}
                columns={[
                  { key: 'name', title: 'Name', minWidth: 200 },
                  { key: 'email', title: 'Email', minWidth: 250 },
                  { key: 'orderCount', title: 'Orders', align: 'right', minWidth: 100 },
                  { key: 'orderTotal', title: 'Total', align: 'right', minWidth: 120, render: (value) => `$${value.toLocaleString()}` },
                  { key: 'createdAt', title: 'Created', minWidth: 120, render: (value) => new Date(value).toLocaleDateString() }
                ]}
                loading={loading}
                error={error}
                pagination={data ? {
                  page: data.page,
                  pageSize: data.pageSize,
                  total: data.total,
                  onChange: handlePageChange
                } : undefined}
                sorting={{
                  sortBy: query.sortBy || 'name',
                  sortDir: query.sortDir || 'asc',
                  onChange: handleSort
                }}
                search={{
                  value: searchValue,
                  onChange: handleSearch,
                  placeholder: 'Search by name or email...'
                }}
                height={400}
                itemHeight={50}
              />
            ) : (
              <UserTable
                data={data?.items || []}
                loading={loading}
                error={error}
                pagination={data ? {
                  current: data.page,
                  pageSize: data.pageSize,
                  total: data.total,
                  onChange: handlePageChange
                } : undefined}
                sorting={{
                  sortBy: query.sortBy || 'name',
                  sortDir: query.sortDir || 'asc',
                  onChange: handleSort
                }}
                search={{
                  value: searchValue,
                  onChange: handleSearch,
                  placeholder: 'Search by name or email...'
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

