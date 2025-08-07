export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  service: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface LogState {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  isLoading: boolean;
  error: string | null;
  filters: {
    level: string;
    service: string;
    timeRange: string;
    search: string;
  };
}

export interface Analytics {
  totalLogs: number;
  errorRate: number;
  serviceStats: { service: string; count: number; errorRate: number }[];
  timeSeriesData: { timestamp: string; errors: number; warnings: number; info: number }[];
  topErrors: { message: string; count: number; service: string }[];
}

export interface AnalyticsState {
  data: Analytics | null;
  isLoading: boolean;
  error: string | null;
}