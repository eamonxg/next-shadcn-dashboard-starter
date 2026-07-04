import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PRIORITY_LABELS } from '../constants/options';

const swatches = [
  { name: '主强调', token: 'var(--primary)', note: '图表点击态、关键操作' },
  { name: 'Chart 1', token: 'var(--chart-1)', note: '线索总量、渠道主色' },
  { name: 'Chart 2', token: 'var(--chart-2)', note: '采用率、已采用对比' },
  { name: 'Chart 3', token: 'var(--chart-3)', note: '辅助分类' },
  { name: '风险红', token: 'oklch(63.7% 0.237 25.331)', note: '高优先级线索' },
  { name: '预警橙', token: 'oklch(76.9% 0.188 70.08)', note: '待审核压力' }
];

export function DesignSpec() {
  return (
    <div className='grid gap-4'>
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>色彩语义</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {swatches.map((item) => (
            <div key={item.name} className='rounded-lg border p-3'>
              <div className='flex items-center gap-3'>
                <span
                  className='size-10 rounded-md border shadow-xs'
                  style={{ background: item.token }}
                />
                <div>
                  <div className='text-sm font-medium'>{item.name}</div>
                  <div className='text-muted-foreground text-xs'>{item.note}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>优先级徽标</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2'>
            <Badge variant='outline' className='border-red-500/30 bg-red-500/10 text-red-700'>
              {PRIORITY_LABELS.high}
            </Badge>
            <Badge variant='outline' className='border-amber-500/30 bg-amber-500/10 text-amber-700'>
              {PRIORITY_LABELS.medium}
            </Badge>
            <Badge variant='outline' className='text-muted-foreground bg-muted'>
              {PRIORITY_LABELS.low}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>图表交互规则</CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground grid gap-2 text-sm leading-6'>
            <p>渠道环形图、类型条形图、区域热区矩阵均可点击筛选明细。</p>
            <p>被选中的图形保持高亮，未选中项降低透明度，顶部 chip 展示当前筛选。</p>
            <p>趋势图基于当前筛选后的线索重新聚合，保证分析链路一致。</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
