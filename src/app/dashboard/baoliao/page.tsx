import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { SearchParams } from 'nuqs/server';
import PageContainer from '@/components/layout/page-container';
import { getQueryClient } from '@/lib/query-client';
import {
  dashboardQueryOptions,
  recordsQueryOptions,
  trendQueryOptions
} from '@/features/baoliao/api/queries';
import { baoliaoSearchParamsCache } from '@/features/baoliao/lib/search-params';
import { Cockpit } from '@/features/baoliao/components/cockpit';
import { CockpitToolbar } from '@/features/baoliao/components/toolbar';

export const metadata = {
  title: '新闻报料线索驾驶舱'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function BaoliaoPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const { range, granularity } = baoliaoSearchParamsCache.parse(searchParams);

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(dashboardQueryOptions(range));
  void queryClient.prefetchQuery(trendQueryOptions(granularity, range));
  void queryClient.prefetchQuery(recordsQueryOptions({ range }));

  return (
    <PageContainer
      pageTitle='新闻报料线索驾驶舱'
      pageDescription='全渠道线索汇聚 · 审核跟进 · 采用转化一屏总览'
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
