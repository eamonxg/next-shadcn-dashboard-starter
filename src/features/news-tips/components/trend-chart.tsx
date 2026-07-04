'use client';

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GRANULARITY_OPTIONS } from '../constants/options';
import { useNewsTipParams } from '../hooks/use-news-tip-params';
import { aggregateTrend } from '../utils/analytics';
import type { NewsTipRecordWithPriority, TrendPoint } from '../api/types';

interface TrendChartProps {
  records: NewsTipRecordWithPriority[];
}

function TooltipContent({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const count = payload.find((item) => item.dataKey === 'count')?.value ?? 0;
  const adoptionRate = payload.find((item) => item.dataKey === 'adoptionRate')?.value ?? 0;

  return (
    <div className='bg-background rounded-lg border px-3 py-2 text-xs shadow-xl'>
      <div className='font-medium'>{label}</div>
      <div className='text-muted-foreground mt-1 grid gap-1'>
        <span className='tabular-nums'>线索量 {count} 条</span>
        <span className='tabular-nums'>采用率 {adoptionRate.toFixed(1)}%</span>
      </div>
    </div>
  );
}

export function TrendChart({ records }: TrendChartProps) {
  const { granularity, setParams } = useNewsTipParams();
  const data: TrendPoint[] = aggregateTrend(records, granularity);

  return (
    <Card>
      <CardHeader className='flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between'>
        <CardTitle className='text-sm font-medium'>线索量与采用率趋势</CardTitle>
        <Tabs
          value={granularity}
          onValueChange={(value) => void setParams({ granularity: value as typeof granularity })}
        >
          <TabsList>
            {GRANULARITY_OPTIONS.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className='h-80'>
          {data.length === 0 ? (
            <div className='bg-muted/40 text-muted-foreground flex h-full items-center justify-center rounded-lg text-sm'>
              当前筛选暂无趋势数据
            </div>
          ) : (
            <ChartContainer
              config={{
                count: { label: '线索量', color: 'var(--chart-1)' },
                adoptionRate: { label: '采用率', color: 'var(--chart-2)' }
              }}
              className='h-full w-full'
            >
              <ComposedChart data={data} margin={{ top: 16, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis
                  yAxisId='left'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId='right'
                  orientation='right'
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip content={<TooltipContent />} />
                <Bar
                  yAxisId='left'
                  dataKey='count'
                  fill='var(--color-count)'
                  radius={[6, 6, 0, 0]}
                  barSize={22}
                  opacity={0.78}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='adoptionRate'
                  stroke='var(--color-adoptionRate)'
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
