import { createSearchParamsCache, parseAsStringLiteral } from 'nuqs/server';
import type { Granularity, TimeRange } from '@/features/baoliao/api/types';

const rangeValues: TimeRange[] = ['today', 'week', 'month', 'all'];
const granularityValues: Granularity[] = ['day', 'week', 'month'];

export const baoliaoSearchParams = {
  range: parseAsStringLiteral(rangeValues).withDefault('month'),
  granularity: parseAsStringLiteral(granularityValues).withDefault('day')
};

export const baoliaoSearchParamsCache = createSearchParamsCache(baoliaoSearchParams);
