import { TableColumn, UserRow } from '../types';
import { formatCurrency } from '../utils/format';
import { DataTable } from './DataTable';

interface UserTableProps {
  data: UserRow[];
  loading: boolean;
  error: string | null;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  sorting?: {
    sortBy: string;
    sortDir: 'asc' | 'desc';
    onChange: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
}

const columns: TableColumn<UserRow>[] = [
  {
    key: 'id',
    title: 'ID',
    sortable: true,
    width: '20'
  },
  {
    key: 'name',
    title: 'Name',
    sortable: true,
    width: '30'
  },
  {
    key: 'email',
    title: 'Email',
    sortable: true,
    width: '40'
  },
  {
    key: 'orderCount',
    title: 'Orders',
    sortable: true,
    width: '20',
    render: (value: number) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {value}
      </span>
    )
  },
  {
    key: 'orderTotal',
    title: 'Total Amount',
    sortable: true,
    width: '30',
    render: (value: number) => (
      <span className="font-medium text-green-600">
        {formatCurrency(value)}
      </span>
    )
  },
  {
    key: 'createdAt',
    title: 'Created',
    sortable: true,
    width: '30',
    render: (value: string) => new Date(value).toLocaleDateString()
  }
];

export function UserTable(props: UserTableProps) {
  return (
    <DataTable
      {...props}
      columns={columns}
    />
  );
}

