'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import type { CategoryBar as CategoryBarData, NewsTipCategory } from '../api/types';

interface CategoryBarProps {
  data: CategoryBarData[];
  activeCategories: NewsTipCategory[];
  onSelect: (category: NewsTipCategory) => void;
}

function TooltipContent({
  active,
  payload
}: {
  active?: boolean;
  payload?: { payload: CategoryBarData; name: string; value: number; color: string }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const adoptedRate = item.count === 0 ? 0 : (item.adopted / item.count) * 100;

  return (
    <div className='bg-background rounded-lg border px-3 py-2 text-xs shadow-xl'>
      <div className='font-medium'>{item.category}</div>
      <div className='text-muted-foreground mt-1 grid gap-1'>
        <span className='tabular-nums'>总量 {item.count} 条</span>
        <span className='tabular-nums'>
          已采用 {item.adopted} 条 · {adoptedRate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export function CategoryBar({ data, activeCategories, onSelect }: CategoryBarProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const hasData = total > 0;

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium'>线索类型分布</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]'>
        <div className='h-64 min-w-0'>
          {!hasData ? (
            <div className='bg-muted/40 text-muted-foreground flex h-full items-center justify-center rounded-lg text-sm'>
              当前筛选暂无类型数据
            </div>
          ) : (
            <ChartContainer
              config={{
                count: { label: '线索总量', color: 'var(--chart-1)' },
                adopted: { label: '已采用', color: 'var(--chart-2)' }
              }}
              className='h-full w-full'
            >
              <BarChart
                data={data}
                layout='vertical'
                margin={{ top: 8, right: 12, bottom: 8, left: 8 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray='3 3' />
                <XAxis type='number' hide />
                <YAxis
                  type='category'
                  dataKey='category'
                  width={70}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip cursor={false} content={<TooltipContent />} />
                <Bar
                  dataKey='count'
                  radius={[0, 6, 6, 0]}
                  fill='var(--color-count)'
                  barSize={16}
                  onClick={(entry) => onSelect((entry as CategoryBarData).category)}
                >
                  {data.map((entry) => {
                    const dimmed =
                      activeCategories.length > 0 && !activeCategories.includes(entry.category);
                    return (
                      <Cell
                        key={entry.category}
                        opacity={dimmed ? 0.25 : 0.9}
                        className='cursor-pointer'
                      />
                    );
                  })}
                </Bar>
                <Bar
                  dataKey='adopted'
                  radius={[0, 6, 6, 0]}
                  fill='var(--color-adopted)'
                  barSize={8}
                  onClick={(entry) => onSelect((entry as CategoryBarData).category)}
                >
                  {data.map((entry) => {
                    const dimmed =
                      activeCategories.length > 0 && !activeCategories.includes(entry.category);
                    return (
                      <Cell
                        key={entry.category}
                        opacity={dimmed ? 0.25 : 1}
                        className='cursor-pointer'
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </div>
        <div className='grid content-center gap-2'>
          {data.map((item) => {
            const percent = total === 0 ? 0 : (item.count / total) * 100;
            const active = activeCategories.includes(item.category);

            return (
              <button
                key={item.category}
                type='button'
                className={cn(
                  'hover:bg-muted/70 flex items-center justify-between gap-2 rounded-md px-2 py-2 text-left transition-colors',
                  active && 'bg-primary/10 text-primary'
                )}
                onClick={() => onSelect(item.category)}
                aria-label={`筛选类型 ${item.category}`}
              >
                <span className='truncate text-sm'>{item.category}</span>
                <span className='text-muted-foreground text-xs tabular-nums'>
                  {item.count} · {percent.toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
