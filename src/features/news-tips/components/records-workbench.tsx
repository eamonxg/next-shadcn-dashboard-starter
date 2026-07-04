'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { dashboardQueryOptions, recordsQueryOptions } from '@/features/news-tips/api/queries';
import { ActiveFilters } from '@/features/news-tips/components/active-filters';
import { RecordsTable } from '@/features/news-tips/components/records-table';
import { WorkbenchNav } from '@/features/news-tips/components/section-nav';
import { useNewsTipFilterState } from '@/features/news-tips/hooks/use-news-tip-filter-state';

export function RecordsWorkbench() {
  const {
    queryFilters,
    filterState,
    sortMode,
    setParams,
    toggleFilter,
    removeFilter,
    clearFilters,
    changeSort
  } = useNewsTipFilterState();
  const { data: dashboard } = useSuspenseQuery(dashboardQueryOptions(queryFilters));
  const { data: recordsResponse } = useSuspenseQuery(recordsQueryOptions(queryFilters));

  const showTodayTodo = () => {
    void setParams({
      range: 'today',
      dateFrom: null,
      dateTo: null,
      status: ['待审核'],
      category: [],
      sourcePlatform: [],
      channel: [],
      district: [],
      priority: [],
      sort: 'priority'
    });
  };

  return (
    <div className='grid gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <WorkbenchNav />
        <Button variant='outline' size='sm' onClick={showTodayTodo}>
          <Icons.clock />
          今日待办
        </Button>
      </div>
      <ActiveFilters
        filters={filterState}
        resultCount={recordsResponse.items.length}
        totalCount={recordsResponse.rangeTotalItems}
        updatedAt={dashboard.updatedAt}
        onRemove={removeFilter}
        onClear={clearFilters}
      />
      <RecordsTable
        records={recordsResponse.items}
        totalCount={recordsResponse.rangeTotalItems}
        filters={filterState}
        sortMode={sortMode}
        onToggleFilter={toggleFilter}
        onClearFilters={clearFilters}
        onSortChange={changeSort}
      />
    </div>
  );
}
