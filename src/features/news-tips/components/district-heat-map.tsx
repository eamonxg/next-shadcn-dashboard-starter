'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DistrictStat, ShenzhenDistrict } from '../api/types';
import {
  SHENZHEN_DISTRICT_GEO,
  SHENZHEN_MAP_VIEWBOX,
  type MappedDistrict
} from '../lib/shenzhen-geo';

interface DistrictHeatMapViewProps {
  data: DistrictStat[];
  activeDistricts: ShenzhenDistrict[];
  onSelect: (district: ShenzhenDistrict) => void;
}

const SHANWEI_DISTRICT: ShenzhenDistrict = '深汕特别合作区';

export function DistrictHeatMapView({ data, activeDistricts, onSelect }: DistrictHeatMapViewProps) {
  const [selected, setSelected] = useState<ShenzhenDistrict | null>(null);

  const maxCount = Math.max(...data.map((item) => item.count), 1);
  const statByDistrict = new Map(data.map((item) => [item.district, item]));
  const shanwei = statByDistrict.get(SHANWEI_DISTRICT);
  const selectedStat = selected ? statByDistrict.get(selected) : undefined;

  const handlePick = (district: ShenzhenDistrict) => {
    setSelected(district);
  };

  return (
    <>
      <div className='mx-auto w-full max-w-2xl'>
        <svg
          viewBox={SHENZHEN_MAP_VIEWBOX}
          className='h-auto w-full'
          role='group'
          aria-label='深圳区划热力分布图'
        >
          {(
            Object.entries(SHENZHEN_DISTRICT_GEO) as [
              MappedDistrict,
              (typeof SHENZHEN_DISTRICT_GEO)[MappedDistrict]
            ][]
          ).map(([district, shape]) => {
            const stat = statByDistrict.get(district);
            const intensity = stat ? stat.count / maxCount : 0;
            const active = activeDistricts.includes(district) || selected === district;
            const hasPendingPressure = (stat?.pendingCount ?? 0) >= 2;

            return (
              <g key={district}>
                <path
                  d={shape.d}
                  role='button'
                  tabIndex={0}
                  aria-label={`筛选区域 ${district}，线索数 ${stat?.count ?? 0}`}
                  onClick={() => handlePick(district)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handlePick(district);
                    }
                  }}
                  className={cn(
                    'stroke-border cursor-pointer transition-all outline-none',
                    active ? 'stroke-primary stroke-[3]' : 'stroke-[1.5] hover:stroke-primary/60',
                    hasPendingPressure && !active && 'stroke-red-500/70'
                  )}
                  style={{
                    fill: `color-mix(in oklch, var(--primary) ${8 + intensity * 60}%, var(--muted))`
                  }}
                >
                  <title>{`${district} · 线索 ${stat?.count ?? 0} · 待审 ${stat?.pendingCount ?? 0} · 采用率 ${(stat?.adoptionRate ?? 0).toFixed(1)}% · 占比 ${(stat?.share ?? 0).toFixed(1)}%`}</title>
                </path>
                <text
                  x={shape.labelX}
                  y={shape.labelY}
                  textAnchor='middle'
                  dominantBaseline='middle'
                  className='fill-foreground pointer-events-none hidden text-[13px] font-medium sm:block'
                >
                  {district.replace(/[区]$/, '')}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className='flex flex-wrap items-center gap-2 text-xs'>
        <span className='text-muted-foreground'>密度</span>
        <div className='h-2 w-24 rounded-full bg-gradient-to-r from-[color-mix(in_oklch,var(--primary)_8%,var(--muted))] to-[color-mix(in_oklch,var(--primary)_68%,var(--muted))]' />
        <span className='text-muted-foreground'>低 → 高</span>
      </div>

      {shanwei && (
        <button
          type='button'
          onClick={() => handlePick(SHANWEI_DISTRICT)}
          className={cn(
            'flex items-center justify-between rounded-lg border p-3 text-left transition-colors',
            activeDistricts.includes(SHANWEI_DISTRICT) || selected === SHANWEI_DISTRICT
              ? 'border-primary bg-primary/10'
              : 'border-border bg-muted/35 hover:border-primary/40'
          )}
          aria-label={`筛选区域 ${SHANWEI_DISTRICT}`}
        >
          <div>
            <div className='font-medium'>{SHANWEI_DISTRICT}</div>
            <div className='text-muted-foreground text-xs'>跨域 / 应急补充区域</div>
          </div>
          <div className='flex flex-wrap gap-1.5'>
            <Badge variant='outline' className='bg-background/70 font-normal'>
              线索 {shanwei.count}
            </Badge>
            <Badge variant='outline' className='bg-background/70 font-normal'>
              待审 {shanwei.pendingCount}
            </Badge>
          </div>
        </button>
      )}

      {selectedStat && (
        <div className='bg-muted/40 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3'>
          <div className='grid gap-1'>
            <div className='font-medium'>{selectedStat.district}</div>
            <div className='text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs'>
              <span>线索 {selectedStat.count}</span>
              <span>待审 {selectedStat.pendingCount}</span>
              <span>采用率 {selectedStat.adoptionRate.toFixed(1)}%</span>
              <span>占比 {selectedStat.share.toFixed(1)}%</span>
            </div>
          </div>
          <Button size='sm' onClick={() => onSelect(selectedStat.district)}>
            进明细
          </Button>
        </div>
      )}
    </>
  );
}
