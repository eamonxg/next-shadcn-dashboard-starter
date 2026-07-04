'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { PRIORITY_LABELS } from '../constants/options';
import type { NewsTipFilterKind, NewsTipFilterState, NewsTipFilterValue } from '../utils/analytics';

interface ActiveFiltersProps {
  filters: NewsTipFilterState;
  resultCount: number;
  totalCount: number;
  updatedAt: string;
  onRemove: (kind: NewsTipFilterKind, value: NewsTipFilterValue) => void;
  onClear: () => void;
}

const filterLabels: Record<NewsTipFilterKind, string> = {
  status: '状态',
  category: '类型',
  sourcePlatform: '平台',
  channel: '来源',
  district: '区域',
  priority: '优先级'
};

function formatUpdatedAt(iso: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(iso));
}

function formatValue(kind: NewsTipFilterKind, value: string) {
  if (kind === 'priority') {
    return PRIORITY_LABELS[value as keyof typeof PRIORITY_LABELS] ?? value;
  }
  return value;
}

export function ActiveFilters({
  filters,
  resultCount,
  totalCount,
  updatedAt,
  onRemove,
  onClear
}: ActiveFiltersProps) {
  const chips = (Object.keys(filters) as NewsTipFilterKind[]).flatMap((kind) =>
    filters[kind].map((value) => ({ kind, value: value as NewsTipFilterValue }))
  );

  return (
    <div className='border-border/70 bg-card/70 flex flex-col gap-3 rounded-lg border p-3 shadow-xs backdrop-blur md:flex-row md:items-center md:justify-between'>
      <div className='flex min-w-0 flex-1 flex-wrap items-center gap-2'>
        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
          <Icons.adjustments className='size-4' />
          <span className='tabular-nums'>
            当前筛选 {resultCount} 条 / 全量 {totalCount} 条
          </span>
        </div>
        {chips.length === 0 ? (
          <Badge variant='outline' className='text-muted-foreground font-normal'>
            未设置维度筛选
          </Badge>
        ) : (
          chips.map((chip) => (
            <Badge
              key={`${chip.kind}-${chip.value}`}
              variant='outline'
              className={cn(
                'bg-primary/10 border-primary/20 text-foreground gap-1.5 pr-1 font-normal',
                chip.kind === 'priority' && 'border-red-500/30 bg-red-500/10 text-red-700'
              )}
            >
              {filterLabels[chip.kind]}：{formatValue(chip.kind, chip.value)}
              <button
                type='button'
                className='hover:bg-background/80 rounded-sm p-0.5'
                aria-label={`移除${filterLabels[chip.kind]}筛选`}
                onClick={() => onRemove(chip.kind, chip.value)}
              >
                <Icons.close className='size-3' />
              </button>
            </Badge>
          ))
        )}
      </div>
      <div className='flex shrink-0 items-center justify-between gap-2 md:justify-end'>
        <span className='text-muted-foreground text-xs tabular-nums'>
          更新于 {formatUpdatedAt(updatedAt)}
        </span>
        {chips.length > 0 && (
          <Button variant='ghost' size='sm' onClick={onClear}>
            清空筛选
          </Button>
        )}
      </div>
    </div>
  );
}
