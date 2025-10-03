import clsx from 'clsx';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { TableColumn, TableProps } from '../types';

interface VirtualizedDataTableProps<T extends Record<string, any>> extends TableProps<T> {
  height?: number;
  itemHeight?: number;
}

export function VirtualizedDataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error,
  pagination,
  sorting,
  search,
  height = 400,
  itemHeight = 50
}: VirtualizedDataTableProps<T>) {
  const handleSort = useCallback((key: string) => {
    if (!sorting) return;

    const newSortDir = sorting.sortBy === key && sorting.sortDir === 'asc' ? 'desc' : 'asc';
    sorting.onChange(key, newSortDir);
  }, [sorting]);

  const renderCell = useCallback((column: TableColumn<T>, item: T) => {
    const value = item[column.key];

    if (column.render) {
      return column.render(value, item);
    }

    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    if (typeof value === 'string' && value.includes('T')) {
      return new Date(value).toLocaleDateString();
    }

    return value;
  }, []);

  const getSortIcon = useCallback((key: string) => {
    if (!sorting || sorting.sortBy !== key) {
      return null;
    }

    return sorting.sortDir === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  }, [sorting]);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];
    if (!item) return null;

    return (
      <div
        style={style}
        className={clsx(
          'flex items-center px-4 py-3 border-b border-gray-200 hover:bg-gray-50',
          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
        )}
      >
        {columns.map((column, colIndex) => (
          <div
            key={String(column.key)}
            className={clsx(
              'flex-1 px-2 text-sm text-gray-900',
              column.width && `w-${column.width}`,
              column.align === 'right' && 'text-right',
              column.align === 'center' && 'text-center'
            )}
            style={{ minWidth: column.minWidth }}
          >
            {renderCell(column, item)}
          </div>
        ))}
      </div>
    );
  }, [data, columns, renderCell]);

  const headerRow = useMemo(() => (
    <div className="flex items-center px-4 py-3 bg-gray-100 border-b border-gray-200 font-medium text-sm text-gray-700">
      {columns.map((column) => (
        <div
          key={String(column.key)}
          className={clsx(
            'flex-1 px-2',
            column.width && `w-${column.width}`,
            column.align === 'right' && 'text-right',
            column.align === 'center' && 'text-center',
            sorting && 'cursor-pointer hover:bg-gray-200 select-none'
          )}
          style={{ minWidth: column.minWidth }}
          onClick={() => sorting && handleSort(String(column.key))}
        >
          <div className="flex items-center space-x-1">
            <span>{column.title}</span>
            {getSortIcon(String(column.key))}
          </div>
        </div>
      ))}
    </div>
  ), [columns, sorting, handleSort, getSortIcon]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-gray-600">Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8 text-center">
          <div className="text-red-600 mb-2">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Error loading data</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8 text-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border" data-testid="virtual-table">
      {/* Header */}
      {headerRow}

      {/* Virtualized List */}
      <div className="relative">
        <List
          height={height}
          itemCount={data.length}
          itemSize={itemHeight}
          width="100%"
        >
          {Row}
        </List>
      </div>

      {/* Pagination Info */}
      {pagination && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        Showing {(((pagination.page || pagination.current || 1) - 1) * pagination.pageSize) + 1} to{' '}
        {Math.min((pagination.page || pagination.current || 1) * pagination.pageSize, pagination.total)} of{' '}
          {pagination.total.toLocaleString()} entries
        </div>
      )}
    </div>
  );
}

export default VirtualizedDataTable;
