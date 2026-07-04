'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DistrictStat, ShenzhenDistrict } from '../api/types';

interface DistrictHeatGridProps {
  data: DistrictStat[];
  activeDistricts: ShenzhenDistrict[];
  onSelect: (district: ShenzhenDistrict) => void;
}

export function DistrictHeatGrid({ data, activeDistricts, onSelect }: DistrictHeatGridProps) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium'>区域热区矩阵</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-2 sm:grid-cols-2 xl:grid-cols-5'>
          {data.map((item) => {
            const intensity = item.count / maxCount;
            const active = activeDistricts.includes(item.district);
            const hasPendingPressure = item.pendingCount >= 2;

            return (
              <button
                key={item.district}
                type='button'
                className={cn(
                  'group relative min-h-24 rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                  active
                    ? 'border-primary bg-primary/15 ring-primary/35 ring-2'
                    : 'border-border bg-muted/35 hover:border-primary/40'
                )}
                style={{
                  backgroundImage: `linear-gradient(135deg, color-mix(in oklch, var(--primary) ${
                    8 + intensity * 26
                  }%, transparent), transparent 72%)`
                }}
                onClick={() => onSelect(item.district)}
                aria-label={`筛选区域 ${item.district}`}
              >
                {hasPendingPressure && (
                  <span className='absolute top-3 right-3 size-2 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]' />
                )}
                <div className='flex h-full flex-col justify-between gap-3'>
                  <div>
                    <div className='font-medium'>{item.district}</div>
                    <div className='text-muted-foreground mt-1 text-xs'>
                      线索密度 #{data.indexOf(item) + 1}
                    </div>
                  </div>
                  <div className='grid gap-2'>
                    <div className='flex items-end justify-between'>
                      <span className='text-2xl font-semibold tabular-nums'>{item.count}</span>
                      <span className='text-muted-foreground text-xs tabular-nums'>
                        {item.share.toFixed(1)}%
                      </span>
                    </div>
                    <div className='flex flex-wrap gap-1.5'>
                      <Badge variant='outline' className='bg-background/70 font-normal'>
                        待审 {item.pendingCount}
                      </Badge>
                      <Badge variant='outline' className='bg-background/70 font-normal'>
                        采用 {item.adoptionRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
