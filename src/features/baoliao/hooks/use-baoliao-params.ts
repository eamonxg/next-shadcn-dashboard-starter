'use client';

import { parseAsStringLiteral, useQueryStates } from 'nuqs';
import type { Granularity, TimeRange } from '@/features/baoliao/api/types';

const rangeValues: TimeRange[] = ['today', 'week', 'month', 'all'];
const granularityValues: Granularity[] = ['day', 'week', 'month'];

export function useBaoliaoParams() {
  const [params, setParams] = useQueryStates(
    {
      range: parseAsStringLiteral(rangeValues).withDefault('month'),
      granularity: parseAsStringLiteral(granularityValues).withDefault('day')
    },
    { shallow: true }
  );

  return {
    range: params.range,
    granularity: params.granularity,
    setParams
  };
}
