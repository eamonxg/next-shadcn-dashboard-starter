'use client';

import { cn } from '@/lib/utils';
import { CHINA_MAP_VIEWBOX, CHINA_PROVINCE_GEO } from '../lib/china-geo';

interface NationalHeatMapProps {
  totalCount: number;
  onDrill: () => void;
}

const HOT_PROVINCE = '广东';
// mock 标定：以「一个中等城市月度报料量」作为高密度参照，非真实统计口径。
const REFERENCE_MAX = 160;

export function NationalHeatMap({ totalCount, onDrill }: NationalHeatMapProps) {
  const intensity = Math.min(totalCount / REFERENCE_MAX, 1);

  return (
    <>
      <div className='mx-auto w-full max-w-2xl'>
        <svg
          viewBox={CHINA_MAP_VIEWBOX}
          className='h-auto w-full'
          role='group'
          aria-label='全国报料热力分布图'
        >
          {Object.entries(CHINA_PROVINCE_GEO).map(([name, shape]) => {
            const isHot = name === HOT_PROVINCE;

            return (
              <path
                key={name}
                d={shape.d}
                role={isHot ? 'button' : undefined}
                tabIndex={isHot ? 0 : undefined}
                aria-label={isHot ? `下钻查看 ${name}（深圳）区划明细，线索数 ${totalCount}` : name}
                onClick={isHot ? onDrill : undefined}
                onKeyDown={
                  isHot
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onDrill();
                        }
                      }
                    : undefined
                }
                className={cn(
                  'stroke-border stroke-[0.75] transition-all outline-none',
                  isHot && 'cursor-pointer hover:brightness-110'
                )}
                style={{
                  fill: isHot
                    ? `color-mix(in oklch, var(--destructive) ${intensity * 85}%, var(--chart-2))`
                    : 'var(--muted)'
                }}
              >
                <title>
                  {isHot
                    ? `${name}（深圳）· 线索 ${totalCount} · 点击下钻查看区划明细`
                    : `${name} · 暂无 mock 数据`}
                </title>
              </path>
            );
          })}
        </svg>
      </div>

      <div className='flex flex-wrap items-center gap-2 text-xs'>
        <span className='text-muted-foreground'>密度</span>
        <div className='h-2 w-24 rounded-full bg-gradient-to-r from-[var(--chart-2)] to-[var(--destructive)]' />
        <span className='text-muted-foreground'>低 → 高</span>
      </div>

      <p className='text-muted-foreground text-xs'>
        当前仅广东 / 深圳有 mock 报料数据，其余省份为灰底占位。点击广东进入深圳区划明细。
      </p>
    </>
  );
}
