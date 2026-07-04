import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { getQueryClient } from '@/lib/query-client';
import {
  dashboardQueryOptions,
  recordsQueryOptions,
  trendQueryOptions
} from '@/features/news-tips/api/queries';
import type { Granularity, NewsTipFilters } from '@/features/news-tips/api/types';
import { Cockpit } from '@/features/news-tips/components/cockpit';
import { CockpitToolbar } from '@/features/news-tips/components/toolbar';

export const metadata = {
  title: '深圳报料数据驾驶舱'
};

export const dynamic = 'force-static';

const defaultFilters: NewsTipFilters = {
  range: 'month',
  sort: 'priority'
};

const defaultGranularity: Granularity = 'day';

export default async function NewsTipPage() {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(dashboardQueryOptions(defaultFilters));
  void queryClient.prefetchQuery(trendQueryOptions(defaultFilters, defaultGranularity));
  void queryClient.prefetchQuery(recordsQueryOptions(defaultFilters));

  return (
    <PageContainer
      pageTitle='深圳报料数据驾驶舱'
      pageDescription='深圳本地媒体报料分诊 · 态势研判 · 处理效率 · 明细导出'
      pageHeaderAction={<CockpitToolbar />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={null}>
          <Cockpit />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
