'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { recordsQueryOptions } from '@/features/news-tips/api/queries';
import { WorkbenchNav } from '@/features/news-tips/components/section-nav';
import { useNewsTipParams } from '@/features/news-tips/hooks/use-news-tip-params';
import { groupRecordsByStatus } from '@/features/news-tips/utils/analytics';

export function FlowBoard() {
  const { filters } = useNewsTipParams();
  const { data } = useSuspenseQuery(recordsQueryOptions(filters));
  const groups = groupRecordsByStatus(data.items);

  return (
    <div className='grid gap-4'>
      <WorkbenchNav />
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {groups.map((group) => (
          <Card key={group.status} className='flex flex-col'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>{group.status}</CardTitle>
              <Badge variant='secondary'>{group.items.length}</Badge>
            </CardHeader>
            <CardContent className='grid max-h-[70vh] gap-2 overflow-y-auto'>
              {group.items.length === 0 ? (
                <p className='text-muted-foreground py-6 text-center text-xs'>暂无线索</p>
              ) : (
                group.items.map((record) => (
                  <div key={record.id} className='grid gap-1 rounded-lg border p-3'>
                    <span className='truncate text-sm font-medium'>{record.title}</span>
                    <span className='text-muted-foreground text-xs'>
                      {record.district} · {record.category}
                    </span>
                    <div className='flex items-center justify-between text-xs'>
                      <Badge variant='outline'>{record.priorityLabel}</Badge>
                      <span className='text-muted-foreground tabular-nums'>{record.assignee}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
