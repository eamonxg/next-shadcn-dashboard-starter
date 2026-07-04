'use client';

import { useMemo } from 'react';
import { parseAsArrayOf, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import {
  NEWS_TIP_CATEGORIES,
  NEWS_TIP_CHANNELS,
  NEWS_TIP_DISTRICTS,
  NEWS_TIP_SOURCE_PLATFORMS,
  NEWS_TIP_STATUSES,
  PRIORITY_LEVELS
} from '@/features/news-tips/constants/options';
import type { Granularity, NewsTipFilters, TimeRange } from '@/features/news-tips/api/types';

const ARRAY_SEPARATOR = ',';
const rangeValues: TimeRange[] = ['today', 'week', 'month', 'custom'];
const granularityValues: Granularity[] = ['day', 'week', 'month'];
const sortValues: NonNullable<NewsTipFilters['sort']>[] = [
  'priority',
  'createdAt',
  'responseMinutes'
];

export function useNewsTipParams() {
  const [params, setParams] = useQueryStates(
    {
      range: parseAsStringLiteral(rangeValues).withDefault('month'),
      granularity: parseAsStringLiteral(granularityValues).withDefault('day'),
      dateFrom: parseAsString,
      dateTo: parseAsString,
      status: parseAsArrayOf(parseAsStringLiteral(NEWS_TIP_STATUSES), ARRAY_SEPARATOR).withDefault(
        []
      ),
      category: parseAsArrayOf(
        parseAsStringLiteral(NEWS_TIP_CATEGORIES),
        ARRAY_SEPARATOR
      ).withDefault([]),
      sourcePlatform: parseAsArrayOf(
        parseAsStringLiteral(NEWS_TIP_SOURCE_PLATFORMS),
        ARRAY_SEPARATOR
      ).withDefault([]),
      channel: parseAsArrayOf(parseAsStringLiteral(NEWS_TIP_CHANNELS), ARRAY_SEPARATOR).withDefault(
        []
      ),
      district: parseAsArrayOf(
        parseAsStringLiteral(NEWS_TIP_DISTRICTS),
        ARRAY_SEPARATOR
      ).withDefault([]),
      priority: parseAsArrayOf(parseAsStringLiteral(PRIORITY_LEVELS), ARRAY_SEPARATOR).withDefault(
        []
      ),
      sort: parseAsStringLiteral(sortValues).withDefault('priority')
    },
    { shallow: true, clearOnDefault: true }
  );

  const filters = useMemo<NewsTipFilters>(
    () => ({
      range: params.range,
      ...(params.dateFrom ? { dateFrom: params.dateFrom } : {}),
      ...(params.dateTo ? { dateTo: params.dateTo } : {}),
      ...(params.status.length > 0 ? { status: params.status } : {}),
      ...(params.category.length > 0 ? { category: params.category } : {}),
      ...(params.sourcePlatform.length > 0 ? { sourcePlatform: params.sourcePlatform } : {}),
      ...(params.channel.length > 0 ? { channel: params.channel } : {}),
      ...(params.district.length > 0 ? { district: params.district } : {}),
      ...(params.priority.length > 0 ? { priority: params.priority } : {}),
      sort: params.sort
    }),
    [params]
  );

  return {
    params,
    filters,
    granularity: params.granularity,
    setParams
  };
}
