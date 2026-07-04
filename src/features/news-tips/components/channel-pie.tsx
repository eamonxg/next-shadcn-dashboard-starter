'use client';

import { Cell, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import type { ChannelSlice, NewsTipChannel } from '../api/types';

interface ChannelPieProps {
  data: ChannelSlice[];
  activeChannels: NewsTipChannel[];
  onSelect: (channel: NewsTipChannel) => void;
}

const colors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--primary)'
];

function TooltipContent({
  active,
  payload,
  total
}: {
  active?: boolean;
  payload?: { payload: ChannelSlice; value: number; color: string }[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const percent = total === 0 ? 0 : (item.value / total) * 100;

  return (
    <div className='bg-background rounded-lg border px-3 py-2 text-xs shadow-xl'>
      <div className='font-medium'>{item.payload.channel}</div>
      <div className='text-muted-foreground mt-1 flex items-center gap-2'>
        <span className='size-2 rounded-full' style={{ backgroundColor: item.color }} />
        <span className='tabular-nums'>
          {item.value} 条 · {percent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export function ChannelPie({ data, activeChannels, onSelect }: ChannelPieProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const chartData = data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length]
  }));

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium'>来源渠道占比</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-4 lg:grid-cols-[minmax(0,220px)_1fr]'>
        <div className='relative h-56 min-w-0'>
          {total === 0 ? (
            <div className='bg-muted/40 text-muted-foreground flex h-full items-center justify-center rounded-lg text-sm'>
              当前筛选暂无渠道数据
            </div>
          ) : (
            <>
              <ChartContainer config={{ count: { label: '线索数' } }} className='h-full w-full'>
                <PieChart>
                  <ChartTooltip content={<TooltipContent total={total} />} />
                  <Pie
                    data={chartData}
                    dataKey='count'
                    nameKey='channel'
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={2}
                    strokeWidth={0}
                    onClick={(entry) => onSelect((entry as ChannelSlice).channel)}
                  >
                    {chartData.map((entry) => {
                      const dimmed =
                        activeChannels.length > 0 && !activeChannels.includes(entry.channel);
                      return (
                        <Cell
                          key={entry.channel}
                          fill={entry.fill}
                          opacity={dimmed ? 0.25 : 1}
                          className='cursor-pointer transition-opacity'
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                <div className='text-center'>
                  <div className='text-2xl font-semibold tabular-nums'>{total}</div>
                  <div className='text-muted-foreground text-xs'>条线索</div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className='grid content-center gap-2'>
          {chartData.map((item) => {
            const percent = total === 0 ? 0 : (item.count / total) * 100;
            const active = activeChannels.includes(item.channel);

            return (
              <button
                key={item.channel}
                type='button'
                className={cn(
                  'hover:bg-muted/70 flex items-center justify-between gap-3 rounded-md px-2 py-2 text-left transition-colors',
                  active && 'bg-primary/10 text-primary'
                )}
                onClick={() => onSelect(item.channel)}
                aria-label={`筛选来源 ${item.channel}`}
              >
                <span className='flex min-w-0 items-center gap-2'>
                  <span
                    className='size-2.5 shrink-0 rounded-full'
                    style={{ background: item.fill }}
                  />
                  <span className='truncate text-sm'>{item.channel}</span>
                </span>
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
