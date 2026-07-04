import { queryOptions } from '@tanstack/react-query';
import { getDashboardData, getRecords, getTrend } from './service';
import type { Granularity, NewsTipFilters } from './types';

export const newsTipKeys = {
  all: ['news-tips'] as const,
  dashboard: (filters: NewsTipFilters) => [...newsTipKeys.all, 'dashboard', filters] as const,
  trend: (filters: NewsTipFilters, granularity: Granularity) =>
    [...newsTipKeys.all, 'trend', filters, granularity] as const,
  records: (filters: NewsTipFilters) => [...newsTipKeys.all, 'records', filters] as const
};

export const dashboardQueryOptions = (filters: NewsTipFilters) =>
  queryOptions({
    queryKey: newsTipKeys.dashboard(filters),
    queryFn: () => getDashboardData(filters)
  });

export const trendQueryOptions = (filters: NewsTipFilters, granularity: Granularity) =>
  queryOptions({
    queryKey: newsTipKeys.trend(filters, granularity),
    queryFn: () => getTrend(filters, granularity)
  });

export const recordsQueryOptions = (filters: NewsTipFilters) =>
  queryOptions({
    queryKey: newsTipKeys.records(filters),
    queryFn: () => getRecords(filters)
  });
