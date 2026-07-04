'use client';

import { useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { dashboardQueryOptions, recordsQueryOptions } from '@/features/news-tips/api/queries';
import type { InsightItem } from '@/features/news-tips/api/types';
import { ActiveFilters } from '@/features/news-tips/components/active-filters';
import { CategoryBar } from '@/features/news-tips/components/category-bar';
import { ChannelPie } from '@/features/news-tips/components/channel-pie';
import { DistrictHeatGrid } from '@/features/news-tips/components/district-heat-grid';
import { InsightStrip } from '@/features/news-tips/components/insight-strip';
import { KpiCards } from '@/features/news-tips/components/kpi-cards';
import { RecordsTable } from '@/features/news-tips/components/records-table';
import { TrendChart } from '@/features/news-tips/components/trend-chart';
import { useNewsTipParams } from '@/features/news-tips/hooks/use-news-tip-params';
import {
  aggregateCategories,
  aggregateChannels,
  aggregateDistricts,
  emptyNewsTipFilters,
  removeFilterValue,
  toggleFilterValue,
  type NewsTipFilterKind,
  type NewsTipFilterState,
  type NewsTipFilterValue,
  type NewsTipSortMode
} from '@/features/news-tips/utils/analytics';

export function Cockpit() {
  const { params, filters: queryFilters, setParams } = useNewsTipParams();
  const { data: dashboard } = useSuspenseQuery(dashboardQueryOptions(queryFilters));
  const { data: recordsResponse } = useSuspenseQuery(recordsQueryOptions(queryFilters));
  const records = recordsResponse.items;
  const [activeInsightId, setActiveInsightId] = useState<string | null>(null);

  const filters = useMemo<NewsTipFilterState>(
    () => ({
      status: params.status,
      category: params.category,
      sourcePlatform: params.sourcePlatform,
      channel: params.channel,
      district: params.district,
      priority: params.priority
    }),
    [
      params.category,
      params.channel,
      params.district,
      params.priority,
      params.sourcePlatform,
      params.status
    ]
  );
  const sortMode = params.sort;
  const filteredRecords = records;

  const channelData = useMemo(() => aggregateChannels(filteredRecords), [filteredRecords]);
  const categoryData = useMemo(() => aggregateCategories(filteredRecords), [filteredRecords]);
  const districtData = useMemo(() => aggregateDistricts(filteredRecords), [filteredRecords]);

  const commitFilters = (nextFilters: NewsTipFilterState) => {
    void setParams({
      status: nextFilters.status,
      category: nextFilters.category,
      sourcePlatform: nextFilters.sourcePlatform,
      channel: nextFilters.channel,
      district: nextFilters.district,
      priority: nextFilters.priority
    });
  };

  const handleToggleFilter = (kind: NewsTipFilterKind, value: NewsTipFilterValue) => {
    setActiveInsightId(null);
    commitFilters(toggleFilterValue(filters, kind, value));
  };

  const handleRemoveFilter = (kind: NewsTipFilterKind, value: NewsTipFilterValue) => {
    setActiveInsightId(null);
    commitFilters(removeFilterValue(filters, kind, value));
  };

  const handleClearFilters = () => {
    setActiveInsightId(null);
    commitFilters(emptyNewsTipFilters);
  };

  const handleSortChange = (nextSortMode: NewsTipSortMode) => {
    setActiveInsightId(null);
    void setParams({ sort: nextSortMode });
  };

  const handleApplyInsight = (insight: InsightItem) => {
    setActiveInsightId(insight.id);

    if (insight.action.type === 'sort') {
      void setParams({ sort: insight.action.value });
      return;
    }

    if (insight.action.type === 'filter-status') {
      void setParams({ status: [insight.action.value] });
      return;
    }

    if (insight.action.type === 'filter-category') {
      void setParams({ category: [insight.action.value] });
      return;
    }

    if (insight.action.type === 'filter-sourcePlatform') {
      void setParams({ sourcePlatform: [insight.action.value] });
      return;
    }

    if (insight.action.type === 'filter-channel') {
      void setParams({ channel: [insight.action.value] });
      return;
    }

    if (insight.action.type === 'filter-district') {
      void setParams({ district: [insight.action.value] });
      return;
    }

    void setParams({ priority: [insight.action.value] });
  };

  return (
    <div className='grid gap-4'>
      <ActiveFilters
        filters={filters}
        resultCount={filteredRecords.length}
        totalCount={recordsResponse.rangeTotalItems}
        updatedAt={dashboard.updatedAt}
        onRemove={handleRemoveFilter}
        onClear={handleClearFilters}
      />

      <KpiCards />

      <InsightStrip
        insights={dashboard.insights}
        activeInsightId={activeInsightId}
        onApply={handleApplyInsight}
      />

      <div className='grid gap-4 xl:grid-cols-5'>
        <div className='xl:col-span-2'>
          <ChannelPie
            data={channelData}
            activeChannels={filters.channel}
            onSelect={(channel) => handleToggleFilter('channel', channel)}
          />
        </div>
        <div className='xl:col-span-3'>
          <CategoryBar
            data={categoryData}
            activeCategories={filters.category}
            onSelect={(category) => handleToggleFilter('category', category)}
          />
        </div>
      </div>

      <DistrictHeatGrid
        data={districtData}
        activeDistricts={filters.district}
        onSelect={(district) => handleToggleFilter('district', district)}
      />

      <TrendChart records={filteredRecords} />

      <RecordsTable
        records={filteredRecords}
        totalCount={recordsResponse.rangeTotalItems}
        filters={filters}
        sortMode={sortMode}
        onToggleFilter={handleToggleFilter}
        onClearFilters={handleClearFilters}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
