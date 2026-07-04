'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NewsTipStatus, StatusStat } from '@/features/news-tips/api/types';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<NewsTipStatus, string> = {
  待审核: 'bg-amber-500',
  跟进中: 'bg-sky-500',
  已采用: 'bg-emerald-500',
  不予采用: 'bg-muted-foreground/40'
};

export function StatusProgress({
  data,
  onSelect
}: {
  data: StatusStat[];
  onSelect: (status: NewsTipStatus) => void;
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium'>处理进度</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-3'>
        <div className='bg-muted flex h-3 w-full overflow-hidden rounded-full'>
          {total > 0 &&
            data.map((item) =>
              item.count > 0 ? (
                <button
                  key={item.status}
                  type='button'
                  aria-label={`筛选${item.status}`}
                  onClick={() => onSelect(item.status)}
                  className={cn(
                    'h-full transition-opacity hover:opacity-80',
                    STATUS_COLORS[item.status]
                  )}
                  style={{ width: `${(item.count / total) * 100}%` }}
                />
              ) : null
            )}
        </div>
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
          {data.map((item) => (
            <button
              key={item.status}
              type='button'
              onClick={() => onSelect(item.status)}
              className='hover:bg-muted/70 flex items-center justify-between gap-2 rounded-lg border p-2 text-left transition-colors'
            >
              <span className='flex items-center gap-2 text-xs'>
                <span className={cn('size-2 rounded-full', STATUS_COLORS[item.status])} />
                {item.status}
              </span>
              <span className='text-sm font-semibold tabular-nums'>{item.count}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
