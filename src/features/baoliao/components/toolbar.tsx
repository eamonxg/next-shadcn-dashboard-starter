'use client';

import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ThemeModeToggle } from '@/components/themes/theme-mode-toggle';
import { baoliaoKeys } from '@/features/baoliao/api/queries';
import { useBaoliaoParams } from '@/features/baoliao/hooks/use-baoliao-params';
import type { TimeRange } from '@/features/baoliao/api/types';

const rangeOptions: { value: TimeRange; label: string }[] = [
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'all', label: '全部' }
];

export function CockpitToolbar() {
  const { range, setParams } = useBaoliaoParams();
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: baoliaoKeys.all }) > 0;

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: baoliaoKeys.all });
  };

  return (
    <div className='flex items-center gap-2'>
      <Tabs value={range} onValueChange={(value) => void setParams({ range: value as TimeRange })}>
        <TabsList>
          {rangeOptions.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Button
        variant='outline'
        size='icon'
        isLoading={isFetching}
        onClick={handleRefresh}
        aria-label='刷新'
      >
        <Icons.refresh className={isFetching ? 'animate-spin' : ''} />
      </Button>
      <ThemeModeToggle />
    </div>
  );
}
