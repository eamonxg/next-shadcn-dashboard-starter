import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

import PageContainer from '@/components/layout/page-container';
import { recordsQueryOptions } from '@/features/news-tips/api/queries';
import type { NewsTipFilters } from '@/features/news-tips/api/types';
import { FlowBoard } from '@/features/news-tips/components/flow-board';
import { CockpitToolbar } from '@/features/news-tips/components/toolbar';
import { getQueryClient } from '@/lib/query-client';

export const metadata = {
  title: '深圳报料处理流转'
};

export const dynamic = 'force-static';

const defaultFilters: NewsTipFilters = {
  range: 'month',
  sort: 'priority'
};

export default async function NewsTipFlowPage() {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(recordsQueryOptions(defaultFilters));

  return (
    <PageContainer
      pageTitle='处理流转'
      pageDescription='按待审核 / 跟进中 / 已采用 / 不予采用 查看线索流转与积压'
      pageHeaderAction={<CockpitToolbar />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={null}>
          <FlowBoard />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
