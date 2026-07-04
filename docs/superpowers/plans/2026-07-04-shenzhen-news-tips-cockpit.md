# 深圳报料数据驾驶舱 H5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 `/dashboard/news-tips` 从泛新闻线索看板升级为符合新版 PRD 的深圳本地媒体报料驾驶舱系统 H5。

**Architecture:** 保留现有 `src/features/news-tips/` feature 模块，按 `api/types.ts -> api/service.ts -> api/queries.ts` 稳定数据边界。数据层生成 180 天、600 条以上深圳本地模拟线索，所有查询、聚合、筛选和导出都在前端本地 mock 数据上完成，不新增 API Route、Server Action、数据库或任何后端服务。UI 层拆成总览驾驶舱、数据仪表盘、线索明细台三个静态业务页，共享同一套 nuqs URL 状态、mock service 和组件；图表使用 Recharts + 本项目 `ChartContainer`，表格使用 TanStack Table + shadcn/ui 表格组合，并且最终构建必须支持 Next.js pure static export。

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.7, TanStack Query, TanStack Table, nuqs, Recharts, shadcn/ui, Tailwind CSS v4, Bun test.

---

## Scope Check

新版 PRD 是一个驾驶舱系统，包含数据契约、mock 数据、聚合规则、图表、筛选联动、明细表、导出、响应式和静态导出验收。它们共享同一套 `news-tips` 数据与组件边界，并按总览、仪表盘、明细三个页面分流；本计划按可验证的垂直任务拆分，每个任务完成后页面仍能构建。

## Existing State Snapshot

- 已存在 `src/features/news-tips/`、`src/app/dashboard/news-tips/page.tsx` 和旧计划 `docs/superpowers/plans/2026-07-04-news-tips-cockpit.md`。
- 现有实现仍包含广州区划：`天河区`、`越秀区`、`海珠区`、`荔湾区`，必须替换。
- 现有类型缺少新版 PRD 必需字段：`sourcePlatform`、`street`、`locationName`、`department`、`sourceUrl`、`referenceTopic`、`riskTags`、`firstResponseAt`。
- 现有时间范围是 `today | week | month | all`，新版 PRD 要求 `today | week | month | custom` 和自定义日期。
- 现有表格是手写 `Table + DropdownMenu`，执行时应迁移到 TanStack Table 状态和 shadcn/table 组件组合，并复用 `DataTableColumnHeader`、`DataTablePagination`、`Badge`、`Tooltip`、`HoverCard`、`Popover`、`Calendar` 等成熟组件。

## Mature Component Policy

Use these existing mature components before writing custom UI:

- Layout and surfaces: `PageContainer`, `Card`, `ScrollArea`, `Separator`, `Skeleton`.
- Actions and controls: `Button`, `Button isLoading`, `Tabs`, `ToggleGroup`, `Popover`, `Calendar`, `DropdownMenu`, `Command`.
- Feedback and explanation: `Badge`, `Tooltip`, `HoverCard`, `Alert`, `Progress`, `sonner`.
- Charts: `ChartContainer`, `ChartTooltip`, Recharts primitives.
- Tables: `@tanstack/react-table`, `DataTableColumnHeader`, `DataTablePagination`, `DataTableFacetedFilter` where column state is available.
- Icons: only `import { Icons } from '@/components/icons'`.

Only write business-specific composition for the Shenzhen heat grid and record detail panel. Do not modify files under `src/components/ui/` unless a reusable extension is required and used outside one component.

## Static Delivery Constraint

- The cockpit is a pure frontend H5. Do not add backend services, Route Handlers under `src/app/api`, Server Actions, ORM calls, databases, external BFF calls, or AI summary APIs.
- The `news-tips` service layer is a local deterministic mock-data module. It may be imported by server or client components, but it must not depend on Node-only runtime APIs, request headers, cookies, filesystem reads, environment secrets, or network calls.
- The finished app must support static packaging through Next.js `output: 'export'`. Add a build switch such as `NEXT_STATIC_EXPORT=true` in `next.config.ts`; when enabled, use `output: 'export'`, `images.unoptimized: true`, and disable Sentry rewrites/tunnels that are incompatible with static output.
- Static export means the final route set cannot include working backend API routes. If template demo API routes under `src/app/api/products` or `src/app/api/users` block static export, remove or disable those demo routes as part of final cleanup because they are unrelated to the submitted cockpit.
- Verification must include normal build plus static-export build: `bun run build` and `NEXT_PUBLIC_SENTRY_DISABLED=true NEXT_STATIC_EXPORT=true bun run build`.

## Multi-Page Navigation Architecture

The submitted product is a cockpit system, not a forced single page.

| Page | Route | Responsibility |
| --- | --- | --- |
| 总览驾驶舱 | `/dashboard/news-tips` | KPI, actionable insights, key overview charts, high-priority preview |
| 数据仪表盘 | `/dashboard/news-tips/analytics` | Source/category/status charts, Shenzhen heat grid, day/week/month trend |
| 线索明细台 | `/dashboard/news-tips/records` | Full table filtering, sorting, pagination, row expansion, CSV export |
| 设计规范 | `/dashboard/design` | Existing design-spec page for delivery context |

Shared rules:

- All three business pages share `newsTipKeys`, `useNewsTipParams`, `CockpitToolbar`, filter chips, and local mock service.
- URL filter params must be portable across pages. A chart click on the analytics page can lead to the records page with the same filter params.
- The overview page must still satisfy the 30-second judging path; do not move every important judgment into subpages.
- Add page-level navigation via a compact `SectionNav` component and sidebar nav items.

## File Structure

### Modify

- `src/features/news-tips/api/types.ts`  
  Owns the full data contract, enum unions, filter types, KPI/chart response types, and insight action types.

- `src/features/news-tips/constants/options.ts`  
  Owns Shenzhen districts, streets, source platforms, report channels, status/category/priority options, and table filter option labels.

- `src/features/news-tips/api/service.ts`  
  Owns deterministic mock generation, date-window filtering, source/category/status/district/channel/priority filtering, KPI aggregation, trend aggregation, and insight generation.

- `src/features/news-tips/api/queries.ts`  
  Owns `newsTipKeys` and `queryOptions` that include custom date range and filter params in stable query keys.

- `src/features/news-tips/lib/search-params.ts`  
  Owns server-side nuqs parsers for range, granularity, custom dates, filters, pagination, and sort.

- `src/features/news-tips/hooks/use-news-tip-params.ts`  
  Owns client-side nuqs state helpers for toolbar, chart clicks, active chips, and table controls.

- `src/features/news-tips/utils/analytics.ts`  
  Owns pure helpers for active filters, selected chart state, priority sorting, table count summaries, and chart aggregation from filtered records.

- `src/features/news-tips/utils/export-csv.ts`  
  Owns pure CSV string generation plus browser download wrapper.

- `src/features/news-tips/components/cockpit.tsx`  
  Owns overview cockpit composition, query reads, cross-chart filter wiring, and count summaries.

- `src/features/news-tips/components/analytics-dashboard.tsx`  
  Owns the dedicated analytics/instrument dashboard page composition.

- `src/features/news-tips/components/records-workbench.tsx`  
  Owns the dedicated records/detail workbench page composition.

- `src/features/news-tips/components/section-nav.tsx`  
  Owns page-level navigation between 总览、数据仪表盘、线索明细.

- `src/features/news-tips/components/toolbar.tsx`  
  Owns time range tabs, custom date popover, refresh button, last updated display, export trigger location, and theme toggle.

- `src/features/news-tips/components/kpi-cards.tsx`  
  Owns KPI cards with sparkline charts and metric tooltips.

- `src/features/news-tips/components/insight-strip.tsx`  
  Owns three actionable operational insights.

- `src/features/news-tips/components/channel-pie.tsx`  
  Owns source-platform donut chart and click-to-filter behavior.

- `src/features/news-tips/components/category-bar.tsx`  
  Owns category distribution bar chart with adopted overlay and click-to-filter behavior.

- `src/features/news-tips/components/district-heat-grid.tsx`  
  Owns Shenzhen district heat matrix and click-to-filter behavior.

- `src/features/news-tips/components/trend-chart.tsx`  
  Owns day/week/month trend chart with count, completion rate, and adoption rate.

- `src/features/news-tips/components/active-filters.tsx`  
  Owns visible filter chips and clear actions.

- `src/app/dashboard/news-tips/page.tsx`  
  Owns overview route prefetch using parsed URL state and `PageContainer` props.

- `src/app/dashboard/news-tips/analytics/page.tsx`  
  Owns analytics route prefetch using parsed URL state and `PageContainer` props.

- `src/app/dashboard/news-tips/records/page.tsx`  
  Owns records route prefetch using parsed URL state and `PageContainer` props.

- `src/app/page.tsx`  
  Must redirect `/` to `/dashboard/news-tips`.

- `next.config.ts`  
  Owns static export switch for the final deliverable.

- `src/app/api/products/**` and `src/app/api/users/**`  
  Remove or disable only if they prevent `NEXT_STATIC_EXPORT=true bun run build`; these demo APIs are not part of the cockpit.

### Create

- `src/features/news-tips/components/status-progress.tsx`  
  Stacked status progress visualization with click-to-filter behavior.

- `src/features/news-tips/components/section-nav.tsx`  
  Compact route tabs/links for the three news-tips pages.

- `src/features/news-tips/components/records-table/columns.tsx`  
  TanStack Table column definitions, filter metadata, sorting metadata, and cell renderers.

- `src/features/news-tips/components/records-table/record-detail.tsx`  
  Row expansion panel with description, reference topic, reporter info, location, timeline, priority reason, and rule explanation.

- `src/features/news-tips/api/service.test.ts`  
  Bun tests for data volume, Shenzhen localization, required fields, custom date filtering, and no Guangzhou district leakage.

- `src/features/news-tips/utils/analytics.test.ts`  
  Bun tests for priority derivation, completion/adoption rates, insight generation, and trend grouping.

- `src/features/news-tips/utils/export-csv.test.ts`  
  Bun tests for BOM, metadata rows, filename format helper, Chinese headers, and field coverage.

---

### Task 1: Data Contract And Shenzhen Constants

**Files:**
- Modify: `src/features/news-tips/api/types.ts`
- Modify: `src/features/news-tips/constants/options.ts`
- Create: `src/features/news-tips/api/service.test.ts`

- [ ] **Step 1: Write the failing localization and contract tests**

Create `src/features/news-tips/api/service.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { getAllNewsTipRecords, getRecords } from './service';
import {
  NEWS_TIP_CATEGORIES,
  NEWS_TIP_DISTRICTS,
  NEWS_TIP_SOURCE_PLATFORMS
} from '../constants/options';

const guangzhouDistricts = ['天河区', '越秀区', '海珠区', '荔湾区', '白云区', '黄埔区'];

describe('news tips mock data contract', () => {
  test('uses Shenzhen districts and no Guangzhou districts', async () => {
    const records = await getAllNewsTipRecords();
    const districts = new Set(records.map((record) => record.district));

    for (const district of NEWS_TIP_DISTRICTS.slice(0, 10)) {
      expect(districts.has(district)).toBe(true);
    }

    for (const district of guangzhouDistricts) {
      expect(districts.has(district)).toBe(false);
    }
  });

  test('generates at least 600 records across 180 days', async () => {
    const records = await getAllNewsTipRecords();
    const days = new Set(records.map((record) => record.createdAt.slice(0, 10)));

    expect(records.length).toBeGreaterThanOrEqual(600);
    expect(days.size).toBeGreaterThanOrEqual(170);
  });

  test('every category and source platform has usable sample data', async () => {
    const records = await getAllNewsTipRecords();

    for (const category of NEWS_TIP_CATEGORIES) {
      expect(records.filter((record) => record.category === category).length).toBeGreaterThanOrEqual(30);
    }

    for (const platform of NEWS_TIP_SOURCE_PLATFORMS) {
      expect(records.some((record) => record.sourcePlatform === platform)).toBe(true);
    }
  });

  test('records include local source and location fields', async () => {
    const records = await getAllNewsTipRecords();
    const withStreetOrLocation = records.filter((record) => record.street || record.locationName);
    const withReference = records.filter((record) => record.sourceUrl || record.referenceTopic);

    expect(withStreetOrLocation.length / records.length).toBeGreaterThanOrEqual(0.8);
    expect(withReference.length).toBeGreaterThanOrEqual(20);

    for (const record of records.slice(0, 50)) {
      expect(record.id).toMatch(/^SZ-BL-\d{8}-\d{3}$/);
      expect(record.sourcePlatform.length).toBeGreaterThan(0);
      expect(record.referenceTopic.length).toBeGreaterThan(0);
      expect(record.riskTags).toBeInstanceOf(Array);
      expect(record.timeline.length).toBeGreaterThanOrEqual(record.status === '待审核' ? 1 : 2);
    }
  });

  test('custom date range filters records inclusively', async () => {
    const result = await getRecords({
      range: 'custom',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-04'
    });

    for (const record of result.items) {
      const day = record.createdAt.slice(0, 10);
      expect(day >= '2026-07-01').toBe(true);
      expect(day <= '2026-07-04').toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail against the old contract**

Run:

```bash
bun test src/features/news-tips/api/service.test.ts
```

Expected: FAIL because `getAllNewsTipRecords`, `NEWS_TIP_SOURCE_PLATFORMS`, Shenzhen districts, `sourcePlatform`, `street`, `sourceUrl`, `referenceTopic`, `riskTags`, and custom date filters are not implemented yet.

- [ ] **Step 3: Replace `types.ts` with the new PRD contract**

Use this complete contract in `src/features/news-tips/api/types.ts`:

```ts
export type NewsTipCategory =
  | '突发事件'
  | '民生投诉'
  | '交通出行'
  | '文体活动'
  | '环境城建'
  | '消费维权'
  | '其他';

export type NewsTipSourcePlatform =
  | '深圳新闻网'
  | '问政深圳'
  | '读特客户端'
  | '深圳特区报'
  | '读创'
  | '晶报APP'
  | '壹深圳'
  | '南方+深圳';

export type NewsTipChannel =
  | '报料小程序'
  | '新闻热线电话'
  | '微信公众号'
  | '客户端爆料'
  | '微博'
  | '短视频平台'
  | '现场投递';

export type NewsTipStatus = '待审核' | '跟进中' | '已采用' | '不予采用';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type TimeRange = 'today' | 'week' | 'month' | 'custom';
export type Granularity = 'day' | 'week' | 'month';

export type ShenzhenDistrict =
  | '福田区'
  | '罗湖区'
  | '盐田区'
  | '南山区'
  | '宝安区'
  | '龙岗区'
  | '龙华区'
  | '坪山区'
  | '光明区'
  | '大鹏新区'
  | '深汕特别合作区';

export interface TimelineEntry {
  time: string;
  action: '线索提交' | '平台接收' | '编辑分拨' | '首次审核' | '记者跟进' | '部门回应' | '采用发布' | '不予采用';
  operator: string;
  note: string;
}

export interface NewsTipRecord {
  id: string;
  title: string;
  description: string;
  category: NewsTipCategory;
  sourcePlatform: NewsTipSourcePlatform;
  sourceUrl: string | null;
  referenceTopic: string;
  channel: NewsTipChannel;
  status: NewsTipStatus;
  district: ShenzhenDistrict;
  street: string | null;
  locationName: string | null;
  reporter: string;
  assignee: string;
  department: string | null;
  createdAt: string;
  firstResponseAt: string | null;
  responseMinutes: number | null;
  riskTags: string[];
  timeline: TimelineEntry[];
}

export interface NewsTipRecordWithPriority extends NewsTipRecord {
  priorityLevel: PriorityLevel;
  priorityLabel: string;
  priorityReason: string;
  priorityScore: number;
  ageMinutes: number;
}

export interface NewsTipFilters {
  range: TimeRange;
  dateFrom?: string;
  dateTo?: string;
  status?: NewsTipStatus[];
  category?: NewsTipCategory[];
  sourcePlatform?: NewsTipSourcePlatform[];
  channel?: NewsTipChannel[];
  district?: ShenzhenDistrict[];
  priority?: PriorityLevel[];
  sort?: 'priority' | 'createdAt' | 'responseMinutes';
}

export interface NewsTipListResponse {
  items: NewsTipRecordWithPriority[];
  totalItems: number;
  rangeTotalItems: number;
  allItems: number;
}

export interface KpiData {
  todayCount: number;
  todayDelta: number;
  weekCount: number;
  weekDelta: number;
  avgResponseMinutes: number;
  avgResponseDelta: number;
  completionRate: number;
  completionDelta: number;
  adoptionRate: number;
  adoptionDelta: number;
  sparklines: {
    today: number[];
    week: number[];
    response: number[];
    completion: number[];
  };
}

export interface SourcePlatformSlice {
  sourcePlatform: NewsTipSourcePlatform;
  count: number;
}

export interface ChannelSlice {
  channel: NewsTipChannel;
  count: number;
}

export interface CategoryBar {
  category: NewsTipCategory;
  count: number;
  adopted: number;
}

export interface DistrictStat {
  district: ShenzhenDistrict;
  count: number;
  pendingCount: number;
  adoptionRate: number;
  share: number;
}

export interface StatusStat {
  status: NewsTipStatus;
  count: number;
  completionShare: number;
}

export interface TrendPoint {
  label: string;
  count: number;
  completionRate: number;
  adoptionRate: number;
}

export interface InsightItem {
  id: string;
  tone: 'critical' | 'warning' | 'neutral' | 'positive';
  title: string;
  description: string;
  actionLabel: string;
  action:
    | { type: 'filter-status'; value: NewsTipStatus }
    | { type: 'filter-category'; value: NewsTipCategory }
    | { type: 'filter-sourcePlatform'; value: NewsTipSourcePlatform }
    | { type: 'filter-channel'; value: NewsTipChannel }
    | { type: 'filter-district'; value: ShenzhenDistrict }
    | { type: 'filter-priority'; value: PriorityLevel }
    | { type: 'sort'; value: 'priority' | 'createdAt' | 'responseMinutes' };
}

export interface DashboardData {
  kpi: KpiData;
  sources: SourcePlatformSlice[];
  channels: ChannelSlice[];
  categories: CategoryBar[];
  districts: DistrictStat[];
  statuses: StatusStat[];
  insights: InsightItem[];
  totalCount: number;
  rangeTotalCount: number;
  filteredCount: number;
  highPriorityCount: number;
  updatedAt: string;
}
```

- [ ] **Step 4: Replace `options.ts` with Shenzhen options**

Update `src/features/news-tips/constants/options.ts` with Shenzhen districts, streets, platform and channel options:

```ts
import type {
  Granularity,
  NewsTipCategory,
  NewsTipChannel,
  NewsTipSourcePlatform,
  NewsTipStatus,
  PriorityLevel,
  ShenzhenDistrict,
  TimeRange
} from '../api/types';

export const NEWS_TIP_CATEGORIES: NewsTipCategory[] = [
  '突发事件',
  '民生投诉',
  '交通出行',
  '文体活动',
  '环境城建',
  '消费维权',
  '其他'
];

export const NEWS_TIP_SOURCE_PLATFORMS: NewsTipSourcePlatform[] = [
  '深圳新闻网',
  '问政深圳',
  '读特客户端',
  '深圳特区报',
  '读创',
  '晶报APP',
  '壹深圳',
  '南方+深圳'
];

export const NEWS_TIP_CHANNELS: NewsTipChannel[] = [
  '报料小程序',
  '新闻热线电话',
  '微信公众号',
  '客户端爆料',
  '微博',
  '短视频平台',
  '现场投递'
];

export const NEWS_TIP_STATUSES: NewsTipStatus[] = ['待审核', '跟进中', '已采用', '不予采用'];

export const NEWS_TIP_DISTRICTS: ShenzhenDistrict[] = [
  '福田区',
  '罗湖区',
  '盐田区',
  '南山区',
  '宝安区',
  '龙岗区',
  '龙华区',
  '坪山区',
  '光明区',
  '大鹏新区',
  '深汕特别合作区'
];

export const HEAT_GRID_DISTRICTS: ShenzhenDistrict[] = [
  '福田区',
  '罗湖区',
  '盐田区',
  '南山区',
  '宝安区',
  '龙岗区',
  '龙华区',
  '坪山区',
  '光明区',
  '大鹏新区'
];

export const SHENZHEN_STREETS: Record<ShenzhenDistrict, string[]> = {
  福田区: ['福田', '华强北', '香蜜湖', '梅林', '莲花', '福保'],
  罗湖区: ['东门', '黄贝', '翠竹', '笋岗', '莲塘', '清水河'],
  盐田区: ['沙头角', '海山', '盐田', '梅沙'],
  南山区: ['南山', '粤海', '蛇口', '招商', '西丽', '桃源'],
  宝安区: ['新安', '西乡', '福永', '沙井', '松岗', '石岩'],
  龙岗区: ['布吉', '坂田', '龙城', '横岗', '平湖', '南湾'],
  龙华区: ['民治', '龙华', '大浪', '观澜', '观湖', '福城'],
  坪山区: ['坪山', '坑梓', '马峦', '碧岭', '石井', '龙田'],
  光明区: ['公明', '光明', '新湖', '凤凰', '玉塘', '马田'],
  大鹏新区: ['葵涌', '大鹏', '南澳'],
  深汕特别合作区: ['小漠', '鹅埠', '鲘门', '赤石']
};

export const SHENZHEN_LOCATIONS: Partial<Record<ShenzhenDistrict, string[]>> = {
  福田区: ['华强北商圈', '福田口岸', '莲花山公园', '会展中心', '梅林片区'],
  南山区: ['深圳湾口岸', '科技园', '后海商圈', '蛇口海上世界', '深圳湾公园'],
  龙岗区: ['布吉街道老旧小区', '坂田地铁站', '大运中心', '龙岗中心城'],
  宝安区: ['宝安中心区', '西乡客运站', '沙井商圈', '福永片区'],
  龙华区: ['深圳北站', '民治片区', '观澜湖片区', '龙华商业中心'],
  光明区: ['光明科学城', '公明广场', '凤凰城片区'],
  罗湖区: ['东门步行街', '罗湖口岸', '笋岗片区'],
  盐田区: ['盐田港', '大小梅沙', '沙头角口岸'],
  坪山区: ['坪山中心区', '坑梓片区', '马峦山片区'],
  大鹏新区: ['较场尾', '南澳办事处', '葵涌片区'],
  深汕特别合作区: ['小漠港', '鹅埠片区', '赤石河沿线']
};

export const PRIORITY_LEVELS: PriorityLevel[] = ['high', 'medium', 'low'];

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  high: '需优先处理',
  medium: '持续跟进',
  low: '常规'
};

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'custom', label: '自定义' }
];

export const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'day', label: '按日' },
  { value: 'week', label: '按周' },
  { value: 'month', label: '按月' }
];
```

- [ ] **Step 5: Run contract tests again**

Run:

```bash
bun test src/features/news-tips/api/service.test.ts
```

Expected: still FAIL because `service.ts` has not produced the new fields yet, but TypeScript recognizes the exported constants and types.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/features/news-tips/api/types.ts src/features/news-tips/constants/options.ts src/features/news-tips/api/service.test.ts
git commit -m "feat: define Shenzhen news tip contract"
```

---

### Task 2: Shenzhen Mock Generator And Query Service

**Files:**
- Modify: `src/features/news-tips/api/service.ts`
- Modify: `src/features/news-tips/api/queries.ts`
- Test: `src/features/news-tips/api/service.test.ts`

- [ ] **Step 1: Replace the generator pools with Shenzhen-local pools**

In `src/features/news-tips/api/service.ts`, import the new options:

```ts
import {
  HEAT_GRID_DISTRICTS,
  NEWS_TIP_CATEGORIES,
  NEWS_TIP_CHANNELS,
  NEWS_TIP_DISTRICTS,
  NEWS_TIP_SOURCE_PLATFORMS,
  NEWS_TIP_STATUSES,
  PRIORITY_LABELS,
  SHENZHEN_LOCATIONS,
  SHENZHEN_STREETS
} from '../constants/options';
```

Use these source/topic pools in the same file:

```ts
const SOURCE_TOPICS: Record<NewsTipSourcePlatform, { topic: string; url: string | null }[]> = {
  深圳新闻网: [
    {
      topic: '龙岗布吉小区排水设施老化、污水渗漏、街道回应',
      url: 'https://www.sznews.com/news/content/2025-11/13/content_31773421.htm'
    },
    {
      topic: '深圳本地民生诉求和部门回应',
      url: 'https://www.sznews.com/'
    }
  ],
  问政深圳: [
    {
      topic: '问政深圳民生投诉、报料热线和部门分拨',
      url: 'https://www.sznews.com/zhuanti/content/mb/2024-01/11/content_30693784.htm'
    }
  ],
  读特客户端: [
    {
      topic: '医院和商圈周边出租车占道候客导致拥堵',
      url: 'https://www.sznews.com/news/content/2025-08/23/content_31672204.htm'
    }
  ],
  深圳特区报: [
    {
      topic: '暴雨红色预警、地铁出入口支援、交警疏导',
      url: 'https://www.sznews.com/news/content/2026-06/18/content_32094995.htm'
    }
  ],
  读创: [{ topic: '商圈消费、营商环境和城市服务反馈', url: null }],
  晶报APP: [{ topic: '城市生活、社区服务和消费类报料', url: null }],
  壹深圳: [{ topic: '视频报料、现场采访和突发直播线索', url: null }],
  '南方+深圳': [{ topic: '区域民生、政务回应和街道治理补充样本', url: null }]
};

const CATEGORY_TEMPLATES: Record<NewsTipCategory, { title: string; description: string; riskTags: string[]; department: string }[]> = {
  突发事件: [
    {
      title: '{district}{street}暴雨后出现积水，车辆通行受阻',
      description: '市民反映早高峰积水影响通勤，现场已有交警和水务人员处置。',
      riskTags: ['暴雨', '内涝', '交通拥堵'],
      department: '区应急管理局 / 水务部门'
    },
    {
      title: '{district}{street}一处商铺疑似火情，消防到场排查',
      description: '报料人称现场有烟雾和焦糊味，消防人员已进入现场确认起因。',
      riskTags: ['火情', '消防隐患'],
      department: '消防救援大队'
    }
  ],
  民生投诉: [
    {
      title: '{district}{street}一小区排水设施老化引发投诉',
      description: '多名居民反映雨后污水外溢，物业和街道已收到诉求。',
      riskTags: ['排水', '老旧小区'],
      department: '街道办 / 住建部门'
    },
    {
      title: '{district}{street}小区电梯停运多日影响老人出行',
      description: '报料人称维修进度不透明，居民希望相关部门协调物业说明情况。',
      riskTags: ['电梯停运', '民生投诉'],
      department: '街道办 / 市场监管部门'
    }
  ],
  交通出行: [
    {
      title: '{district}{street}医院周边出租车候客导致拥堵',
      description: '早晚高峰车辆排队影响公交和社会车辆通行，交警已安排现场疏导。',
      riskTags: ['交通拥堵', '占道候客'],
      department: '交警部门'
    },
    {
      title: '{district}{street}地铁口施工围挡压缩人行空间',
      description: '市民反映上下班高峰行人拥挤，希望施工方优化围挡和导流。',
      riskTags: ['施工围挡', '出行不便'],
      department: '交通运输部门 / 街道办'
    }
  ],
  文体活动: [
    {
      title: '{district}{street}社区活动人流较大，居民建议加强秩序维护',
      description: '活动现场排队时间较长，志愿者和安保力量需要进一步补充。',
      riskTags: ['人流聚集'],
      department: '街道文化站'
    }
  ],
  环境城建: [
    {
      title: '{district}{street}河涌异味明显，居民希望加快治理',
      description: '报料人称傍晚异味较重，附近居民担心影响生活环境。',
      riskTags: ['河涌异味', '环境治理'],
      department: '生态环境部门 / 水务部门'
    },
    {
      title: '{district}{street}建筑垃圾堆放占用公共通道',
      description: '现场垃圾清运不及时，居民担心扬尘和消防通道被堵。',
      riskTags: ['建筑垃圾', '消防通道'],
      department: '城管部门'
    }
  ],
  消费维权: [
    {
      title: '{district}{street}商圈预付卡退款纠纷集中出现',
      description: '多位消费者反映门店关闭后退款困难，希望市场监管部门介入。',
      riskTags: ['消费维权', '预付卡'],
      department: '市场监管部门'
    }
  ],
  其他: [
    {
      title: '{district}{street}热心市民协助走失老人联系家属',
      description: '报料人提供现场线索，社区工作人员已协助老人安全返回。',
      riskTags: ['社区互助'],
      department: '社区工作站'
    }
  ]
};
```

- [ ] **Step 2: Implement deterministic date generation anchored to the current day**

Keep the existing `mulberry32` and generate 180 days with at least 600 records:

```ts
const SEED = 20260704;
const TOTAL_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;

function dailyCountFor(rng: () => number, offset: number, dayStart: Date): number {
  if (offset === 0) return 12 + Math.floor(rng() * 8);
  const isWeekday = dayStart.getDay() !== 0 && dayStart.getDay() !== 6;
  const base = isWeekday ? 3 : 2;
  const weatherSpike = offset % 29 === 0 ? 4 : 0;
  return base + Math.floor(rng() * 3) + weatherSpike;
}
```

This produces roughly 720 records, enough for the PRD minimum while staying light in memory.

- [ ] **Step 3: Implement IDs, source fields, street/location, response time and timeline**

For each generated record:

```ts
const district = weightedPick(rng, NEWS_TIP_DISTRICTS, [9, 7, 3, 10, 10, 11, 9, 4, 5, 3, 1]);
const street = pick(rng, SHENZHEN_STREETS[district]);
const locationName = rng() < 0.7 ? pick(rng, SHENZHEN_LOCATIONS[district] ?? SHENZHEN_STREETS[district]) : null;
const sourcePlatform = pick(rng, NEWS_TIP_SOURCE_PLATFORMS);
const sourceTopic = pick(rng, SOURCE_TOPICS[sourcePlatform]);
const channel = pick(rng, NEWS_TIP_CHANNELS);
const category = weightedPick(rng, NEWS_TIP_CATEGORIES, [14, 18, 16, 8, 14, 9, 6]);
const template = pick(rng, CATEGORY_TEMPLATES[category]);
const status = statusForDay(rng, offset === 0, category);
const firstResponseAt = status === '待审核' ? null : addMinutes(createdAt, 10, 90).toISOString();
const responseMinutes = firstResponseAt === null ? null : minutesBetween(createdAt, new Date(firstResponseAt));
```

Record IDs must use:

```ts
id: `SZ-BL-${dateKey}-${String(seq).padStart(3, '0')}`;
```

Timeline rules:

- `待审核`: one entry, `线索提交`.
- `跟进中`: at least `线索提交`, `平台接收`, `编辑分拨`, `记者跟进`.
- `已采用`: at least `线索提交`, `平台接收`, `首次审核`, `记者跟进`, `采用发布`.
- `不予采用`: at least `线索提交`, `平台接收`, `首次审核`, `不予采用`.

- [ ] **Step 4: Replace range filtering with custom date support**

Add:

```ts
function normalizeDateRange(filters: Pick<NewsTipFilters, 'range' | 'dateFrom' | 'dateTo'>, now: Date) {
  if (filters.range === 'today') {
    return { start: startOfDay(now), end: now };
  }

  if (filters.range === 'week') {
    return { start: startOfISOWeek(now), end: now };
  }

  if (filters.range === 'month') {
    return { start: startOfMonth(now), end: now };
  }

  const start = filters.dateFrom ? startOfDay(new Date(filters.dateFrom)) : startOfMonth(now);
  const end = filters.dateTo ? endOfDay(new Date(filters.dateTo)) : now;
  return { start, end };
}

function filterByDateRange(records: NewsTipRecord[], filters: NewsTipFilters, now: Date): NewsTipRecord[] {
  const { start, end } = normalizeDateRange(filters, now);
  return records.filter((record) => {
    const time = new Date(record.createdAt).getTime();
    return time >= start.getTime() && time <= end.getTime();
  });
}
```

- [ ] **Step 5: Export service functions**

`src/features/news-tips/api/service.ts` must export:

```ts
export async function getAllNewsTipRecords(): Promise<NewsTipRecord[]> {
  return generateRecords();
}

export async function getDashboardData(filters: NewsTipFilters): Promise<DashboardData> {
  const now = new Date();
  const all = generateRecords();
  const inRange = filterByDateRange(all, filters, now);
  const enriched = enrichRecords(inRange, now);
  const filtered = applyFilters(enriched, filters);

  return {
    kpi: computeKpi(all, now),
    sources: computeSourcePlatformSlices(filtered),
    channels: computeChannelSlices(filtered),
    categories: computeCategoryBars(filtered),
    districts: computeDistrictStats(filtered, HEAT_GRID_DISTRICTS),
    statuses: computeStatusStats(filtered),
    insights: generateInsights(enriched, computeKpi(all, now), now),
    totalCount: all.length,
    rangeTotalCount: inRange.length,
    filteredCount: filtered.length,
    highPriorityCount: enriched.filter((record) => record.priorityLevel === 'high').length,
    updatedAt: now.toISOString()
  };
}

export async function getTrend(filters: NewsTipFilters, granularity: Granularity): Promise<TrendPoint[]> {
  const now = new Date();
  const inRange = filterByDateRange(generateRecords(), filters, now);
  const filtered = applyFilters(enrichRecords(inRange, now), filters);
  return aggregateTrend(filtered, granularity);
}

export async function getRecords(filters: NewsTipFilters): Promise<NewsTipListResponse> {
  const now = new Date();
  const all = generateRecords();
  const inRange = filterByDateRange(all, filters, now);
  const filtered = applyFilters(enrichRecords(inRange, now), filters);
  const items = sortRecords(filtered, filters.sort ?? 'priority');

  return {
    items,
    totalItems: items.length,
    rangeTotalItems: inRange.length,
    allItems: all.length
  };
}
```

- [ ] **Step 6: Update query keys to include full filters**

Change `src/features/news-tips/api/queries.ts` to:

```ts
import { queryOptions } from '@tanstack/react-query';
import { getDashboardData, getRecords, getTrend } from './service';
import type { Granularity, NewsTipFilters } from './types';

export const newsTipKeys = {
  all: ['news-tips'] as const,
  dashboard: (filters: NewsTipFilters) => [...newsTipKeys.all, 'dashboard', filters] as const,
  trend: (filters: NewsTipFilters, granularity: Granularity) =>
    [...newsTipKeys.all, 'trend', filters, granularity] as const,
  records: (filters: NewsTipFilters) => [...newsTipKeys.all, 'records', filters] as const
};

export const dashboardQueryOptions = (filters: NewsTipFilters) =>
  queryOptions({
    queryKey: newsTipKeys.dashboard(filters),
    queryFn: () => getDashboardData(filters)
  });

export const trendQueryOptions = (filters: NewsTipFilters, granularity: Granularity) =>
  queryOptions({
    queryKey: newsTipKeys.trend(filters, granularity),
    queryFn: () => getTrend(filters, granularity)
  });

export const recordsQueryOptions = (filters: NewsTipFilters) =>
  queryOptions({
    queryKey: newsTipKeys.records(filters),
    queryFn: () => getRecords(filters)
  });
```

- [ ] **Step 7: Run tests, lint, build**

Run:

```bash
bun test src/features/news-tips/api/service.test.ts
bun run lint
bun run build
```

Expected:

- `bun test`: PASS.
- `bun run lint`: no new errors.
- `bun run build`: no TypeScript errors.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/features/news-tips/api/service.ts src/features/news-tips/api/queries.ts src/features/news-tips/api/service.test.ts
git commit -m "feat: generate Shenzhen news tip data"
```

---

### Task 3: Analytics, Priority Rules, Insights, And Trend Metrics

**Files:**
- Modify: `src/features/news-tips/utils/analytics.ts`
- Create: `src/features/news-tips/utils/analytics.test.ts`
- Test: `src/features/news-tips/utils/analytics.test.ts`

- [ ] **Step 1: Write failing tests for priority and insights**

Create `src/features/news-tips/utils/analytics.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import type { NewsTipRecord } from '../api/types';
import {
  aggregateTrend,
  completionRate,
  derivePriority,
  generateInsightItems
} from './analytics';

function record(overrides: Partial<NewsTipRecord>): NewsTipRecord {
  return {
    id: 'SZ-BL-20260704-001',
    title: '龙岗区布吉街道一小区排水设施老化引发投诉',
    description: '居民反映雨后污水外溢。',
    category: '民生投诉',
    sourcePlatform: '深圳新闻网',
    sourceUrl: null,
    referenceTopic: '龙岗布吉小区排水设施老化、污水渗漏、街道回应',
    channel: '报料小程序',
    status: '待审核',
    district: '龙岗区',
    street: '布吉',
    locationName: '布吉街道老旧小区',
    reporter: '陈先生',
    assignee: '林嘉豪',
    department: '街道办 / 住建部门',
    createdAt: '2026-07-04T00:00:00.000Z',
    firstResponseAt: null,
    responseMinutes: null,
    riskTags: ['排水', '老旧小区'],
    timeline: [{ time: '2026-07-04T00:00:00.000Z', action: '线索提交', operator: '市民报料', note: '报料入口接收' }],
    ...overrides
  };
}

describe('news tip analytics', () => {
  test('marks unfinished emergency records as high priority', () => {
    const result = derivePriority(
      record({ category: '突发事件', status: '跟进中', riskTags: ['暴雨', '内涝'] }),
      new Date('2026-07-04T03:00:00.000Z')
    );

    expect(result.priorityLevel).toBe('high');
    expect(result.priorityReason).toContain('突发事件');
  });

  test('marks old pending records as high priority', () => {
    const result = derivePriority(record({ status: '待审核' }), new Date('2026-07-04T02:00:00.000Z'));

    expect(result.priorityLevel).toBe('high');
    expect(result.priorityReason).toContain('超过 60 分钟');
  });

  test('calculates completion rate from adopted and rejected records', () => {
    const records = [
      record({ status: '已采用' }),
      record({ id: 'SZ-BL-20260704-002', status: '不予采用' }),
      record({ id: 'SZ-BL-20260704-003', status: '跟进中' }),
      record({ id: 'SZ-BL-20260704-004', status: '待审核' })
    ];

    expect(completionRate(records)).toBe(50);
  });

  test('trend includes completion and adoption rate', () => {
    const records = [
      record({ status: '已采用', createdAt: '2026-07-01T08:00:00.000Z' }),
      record({ id: 'SZ-BL-20260701-002', status: '不予采用', createdAt: '2026-07-01T09:00:00.000Z' }),
      record({ id: 'SZ-BL-20260702-001', status: '待审核', createdAt: '2026-07-02T09:00:00.000Z' })
    ];

    const trend = aggregateTrend(records, 'day');

    expect(trend[0]).toMatchObject({ label: '07-01', count: 2, completionRate: 100, adoptionRate: 50 });
    expect(trend[1]).toMatchObject({ label: '07-02', count: 1, completionRate: 0, adoptionRate: 0 });
  });

  test('generates three actionable insights when anomalies exist', () => {
    const now = new Date('2026-07-04T03:00:00.000Z');
    const records = [
      derivePriority(record({ category: '突发事件', status: '跟进中' }), now),
      derivePriority(record({ id: 'SZ-BL-20260704-002', status: '待审核' }), now),
      derivePriority(record({ id: 'SZ-BL-20260704-003', district: '龙岗区', status: '待审核' }), now),
      derivePriority(record({ id: 'SZ-BL-20260704-004', district: '龙岗区', status: '待审核' }), now)
    ];

    const insights = generateInsightItems(records, {
      avgResponseDelta: 12,
      topCategoryGrowth: { category: '突发事件', delta: 30 },
      topChannelShare: { channel: '报料小程序', share: 55 }
    });

    expect(insights).toHaveLength(3);
    expect(insights[0].action.type).toBe('filter-priority');
  });
});
```

- [ ] **Step 2: Run analytics tests and verify they fail**

Run:

```bash
bun test src/features/news-tips/utils/analytics.test.ts
```

Expected: FAIL because `completionRate`, exported `derivePriority`, `generateInsightItems`, and trend completion rate are missing or mismatched.

- [ ] **Step 3: Implement exported pure analytics helpers**

In `src/features/news-tips/utils/analytics.ts`, export these functions and use them from `service.ts`:

```ts
export function completionRate(records: Pick<NewsTipRecord, 'status'>[]): number {
  if (records.length === 0) return 0;
  const completed = records.filter((record) => record.status === '已采用' || record.status === '不予采用').length;
  return Math.round((completed / records.length) * 1000) / 10;
}

export function adoptionRate(records: Pick<NewsTipRecord, 'status'>[]): number {
  const adopted = records.filter((record) => record.status === '已采用').length;
  const rejected = records.filter((record) => record.status === '不予采用').length;
  const denominator = adopted + rejected;
  return denominator === 0 ? 0 : Math.round((adopted / denominator) * 1000) / 10;
}

export function derivePriority(record: NewsTipRecord, now: Date): NewsTipRecordWithPriority {
  const ageMinutes = Math.max(0, Math.round((now.getTime() - new Date(record.createdAt).getTime()) / 60000));
  const highRiskTags = ['暴雨', '火情', '交通事故', '内涝', '消防隐患'];

  if (record.category === '突发事件' && record.status !== '已采用') {
    return withPriority(record, 'high', '突发事件尚未完成，需要优先核实', ageMinutes);
  }

  if (record.status === '待审核' && ageMinutes > 60) {
    return withPriority(record, 'high', `待审核 ${ageMinutes} 分钟，超过 60 分钟分诊线`, ageMinutes);
  }

  if (record.responseMinutes !== null && record.responseMinutes > 240) {
    return withPriority(record, 'high', `处理时长 ${record.responseMinutes} 分钟，超过 240 分钟预警线`, ageMinutes);
  }

  if (record.riskTags.some((tag) => highRiskTags.includes(tag)) && record.status !== '已采用') {
    return withPriority(record, 'high', `命中应急标签：${record.riskTags.filter((tag) => highRiskTags.includes(tag)).join('、')}`, ageMinutes);
  }

  if (record.status === '跟进中' && ageMinutes > 180) {
    return withPriority(record, 'medium', `跟进中 ${ageMinutes} 分钟，建议持续跟进`, ageMinutes);
  }

  if (
    (record.category === '民生投诉' || record.category === '环境城建') &&
    (record.sourcePlatform === '问政深圳' || record.channel === '新闻热线电话' || record.channel === '报料小程序')
  ) {
    return withPriority(record, 'medium', `${record.category} 来自高触达报料入口，建议排入例行跟进`, ageMinutes);
  }

  return withPriority(record, 'low', '未命中超时、突发或集中投诉规则', ageMinutes);
}
```

Add this helper in the same file:

```ts
function withPriority(
  record: NewsTipRecord,
  priorityLevel: PriorityLevel,
  priorityReason: string,
  ageMinutes: number
): NewsTipRecordWithPriority {
  const score = priorityLevel === 'high' ? 3 : priorityLevel === 'medium' ? 2 : 1;

  return {
    ...record,
    priorityLevel,
    priorityLabel: PRIORITY_LABELS[priorityLevel],
    priorityReason,
    priorityScore: score,
    ageMinutes
  };
}
```

- [ ] **Step 4: Implement trend output with completion and adoption**

Update `aggregateTrend(records, granularity)` so every `TrendPoint` returns:

```ts
{
  label: bucket.label,
  count: bucket.records.length,
  completionRate: completionRate(bucket.records),
  adoptionRate: adoptionRate(bucket.records)
}
```

- [ ] **Step 5: Implement actionable insight generation**

Export `generateInsightItems(records, context)` with these deterministic rules:

```ts
export function generateInsightItems(
  records: NewsTipRecordWithPriority[],
  context: {
    avgResponseDelta: number;
    topCategoryGrowth: { category: NewsTipCategory; delta: number } | null;
    topChannelShare: { channel: NewsTipChannel; share: number } | null;
  }
): InsightItem[] {
  if (records.length === 0) {
    return [
      {
        id: 'stable-empty',
        tone: 'positive',
        title: '当前态势平稳',
        description: '当前范围暂无明显异常，可切换更长时间范围继续观察。',
        actionLabel: '按最新查看',
        action: { type: 'sort', value: 'createdAt' }
      }
    ];
  }

  const insights: InsightItem[] = [];
  const highPriority = records.filter((record) => record.priorityLevel === 'high').length;
  const pending = records.filter((record) => record.status === '待审核').length;
  const pendingShare = Math.round((pending / records.length) * 1000) / 10;
  const topDistrict = aggregateDistricts(records).filter((item) => item.count > 0)[0];

  if (pendingShare > 40 || highPriority > 5) {
    insights.push({
      id: 'pending-pressure',
      tone: 'critical',
      title: `待审核压力 ${pendingShare.toFixed(1)}%`,
      description: `当前有 ${highPriority} 条高优先级线索，建议先处理待审核和突发事件。`,
      actionLabel: highPriority > 0 ? '查看高优先级' : '筛选待审核',
      action: highPriority > 0 ? { type: 'filter-priority', value: 'high' } : { type: 'filter-status', value: '待审核' }
    });
  }

  if (topDistrict) {
    insights.push({
      id: 'district-hotspot',
      tone: topDistrict.pendingCount > 0 ? 'warning' : 'neutral',
      title: `${topDistrict.district} 线索最集中`,
      description: `${topDistrict.district} 当前 ${topDistrict.count} 条，其中待审核 ${topDistrict.pendingCount} 条，建议关注区域分拨效率。`,
      actionLabel: `筛选${topDistrict.district}`,
      action: { type: 'filter-district', value: topDistrict.district }
    });
  }

  if (context.topCategoryGrowth && context.topCategoryGrowth.delta > 20) {
    insights.push({
      id: 'category-heating',
      tone: context.topCategoryGrowth.category === '突发事件' ? 'critical' : 'warning',
      title: `${context.topCategoryGrowth.category} 升温`,
      description: `较上一周期增长 ${context.topCategoryGrowth.delta.toFixed(1)}%，建议下钻查看集中线索。`,
      actionLabel: `查看${context.topCategoryGrowth.category}`,
      action: { type: 'filter-category', value: context.topCategoryGrowth.category }
    });
  }

  if (context.topChannelShare && context.topChannelShare.share > 45) {
    insights.push({
      id: 'channel-anomaly',
      tone: 'warning',
      title: `${context.topChannelShare.channel} 占比偏高`,
      description: `该入口占当前范围 ${context.topChannelShare.share.toFixed(1)}%，建议核查承接和分拨效率。`,
      actionLabel: `筛选${context.topChannelShare.channel}`,
      action: { type: 'filter-channel', value: context.topChannelShare.channel }
    });
  }

  if (context.avgResponseDelta > 10) {
    insights.push({
      id: 'response-slowdown',
      tone: 'warning',
      title: '响应变慢',
      description: `平均处理时长较上一周期上升 ${context.avgResponseDelta.toFixed(1)}%，建议按处理时长降序查看积压线索。`,
      actionLabel: '按处理时长排序',
      action: { type: 'sort', value: 'responseMinutes' }
    });
  }

  return insights.slice(0, 3).length > 0
    ? insights.slice(0, 3)
    : [
        {
          id: 'stable',
          tone: 'positive',
          title: '当前态势平稳，暂无明显异常',
          description: '线索类型、区域和响应效率未出现明显波动，可继续观察趋势变化。',
          actionLabel: '按最新查看',
          action: { type: 'sort', value: 'createdAt' }
        }
      ];
}
```

- [ ] **Step 6: Run analytics tests and build**

Run:

```bash
bun test src/features/news-tips/utils/analytics.test.ts
bun run lint
bun run build
```

Expected: PASS for tests, no new lint or build errors.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/features/news-tips/utils/analytics.ts src/features/news-tips/utils/analytics.test.ts
git commit -m "feat: add news tip analytics rules"
```

---

### Task 4: URL State, Custom Date Toolbar, And Server Prefetch

**Files:**
- Modify: `src/features/news-tips/lib/search-params.ts`
- Modify: `src/features/news-tips/hooks/use-news-tip-params.ts`
- Modify: `src/features/news-tips/components/toolbar.tsx`
- Modify: `src/app/dashboard/news-tips/page.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update server search params**

Replace `src/features/news-tips/lib/search-params.ts` with parsers that match the PRD:

```ts
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral
} from 'nuqs/server';
import {
  NEWS_TIP_CATEGORIES,
  NEWS_TIP_CHANNELS,
  NEWS_TIP_DISTRICTS,
  NEWS_TIP_SOURCE_PLATFORMS,
  NEWS_TIP_STATUSES,
  PRIORITY_LEVELS
} from '../constants/options';
import type { Granularity, TimeRange } from '../api/types';

const rangeValues: TimeRange[] = ['today', 'week', 'month', 'custom'];
const granularityValues: Granularity[] = ['day', 'week', 'month'];

export const newsTipSearchParams = {
  range: parseAsStringLiteral(rangeValues).withDefault('month'),
  granularity: parseAsStringLiteral(granularityValues).withDefault('day'),
  dateFrom: parseAsString,
  dateTo: parseAsString,
  status: parseAsArrayOf(parseAsStringLiteral(NEWS_TIP_STATUSES), ',').withDefault([]),
  category: parseAsArrayOf(parseAsStringLiteral(NEWS_TIP_CATEGORIES), ',').withDefault([]),
  sourcePlatform: parseAsArrayOf(parseAsStringLiteral(NEWS_TIP_SOURCE_PLATFORMS), ',').withDefault([]),
  channel: parseAsArrayOf(parseAsStringLiteral(NEWS_TIP_CHANNELS), ',').withDefault([]),
  district: parseAsArrayOf(parseAsStringLiteral(NEWS_TIP_DISTRICTS), ',').withDefault([]),
  priority: parseAsArrayOf(parseAsStringLiteral(PRIORITY_LEVELS), ',').withDefault([]),
  sort: parseAsStringLiteral(['priority', 'createdAt', 'responseMinutes']).withDefault('priority')
};

export const newsTipSearchParamsCache = createSearchParamsCache(newsTipSearchParams);
```

- [ ] **Step 2: Update client search param hook**

Replace `src/features/news-tips/hooks/use-news-tip-params.ts` with:

```ts
'use client';

import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates
} from 'nuqs';
import {
  NEWS_TIP_CATEGORIES,
  NEWS_TIP_CHANNELS,
  NEWS_TIP_DISTRICTS,
  NEWS_TIP_SOURCE_PLATFORMS,
  NEWS_TIP_STATUSES,
  PRIORITY_LEVELS
} from '../constants/options';
import type { Granularity, NewsTipFilters, TimeRange } from '../api/types';

const rangeValues: TimeRange[] = ['today', 'week', 'month', 'custom'];
const granularityValues: Granularity[] = ['day', 'week', 'month'];

export function useNewsTipParams() {
  const [params, setParams] = useQueryStates(
    {
      range: parseAsStringLiteral(rangeValues).withDefault('month'),
      granularity: parseAsStringLiteral(granularityValues).withDefault('day'),
      dateFrom: parseAsString,
      dateTo: parseAsString,
      status: parseAsArrayOf(parseAsStringLiteral(NEWS_TIP_STATUSES), ',').withDefault([]),
      category: parseAsArrayOf(parseAsStringLiteral(NEWS_TIP_CATEGORIES), ',').withDefault([]),
      sourcePlatform: parseAsArrayOf(parseAsStringLiteral(NEWS_TIP_SOURCE_PLATFORMS), ',').withDefault([]),
      channel: parseAsArrayOf(parseAsStringLiteral(NEWS_TIP_CHANNELS), ',').withDefault([]),
      district: parseAsArrayOf(parseAsStringLiteral(NEWS_TIP_DISTRICTS), ',').withDefault([]),
      priority: parseAsArrayOf(parseAsStringLiteral(PRIORITY_LEVELS), ',').withDefault([]),
      sort: parseAsStringLiteral(['priority', 'createdAt', 'responseMinutes']).withDefault('priority')
    },
    { shallow: true }
  );

  const filters: NewsTipFilters = {
    range: params.range,
    ...(params.dateFrom && { dateFrom: params.dateFrom }),
    ...(params.dateTo && { dateTo: params.dateTo }),
    ...(params.status.length > 0 && { status: params.status }),
    ...(params.category.length > 0 && { category: params.category }),
    ...(params.sourcePlatform.length > 0 && { sourcePlatform: params.sourcePlatform }),
    ...(params.channel.length > 0 && { channel: params.channel }),
    ...(params.district.length > 0 && { district: params.district }),
    ...(params.priority.length > 0 && { priority: params.priority }),
    sort: params.sort
  };

  return {
    params,
    filters,
    granularity: params.granularity,
    setParams
  };
}
```

- [ ] **Step 3: Update the toolbar with mature controls**

Modify `src/features/news-tips/components/toolbar.tsx`:

- Use `Tabs` for `today/week/month/custom`.
- Use `Popover + Calendar mode='range'` for custom dates.
- Use `Button isLoading={isFetching}` for refresh.
- Keep `ThemeModeToggle`.
- Display custom range text as `YYYY-MM-DD - YYYY-MM-DD`.

The toolbar must keep this user-facing behavior:

```ts
const handleRangeChange = (value: string) => {
  const range = value as TimeRange;
  void setParams({
    range,
    ...(range !== 'custom' && { dateFrom: null, dateTo: null })
  });
};

const handleCustomRangeSelect = (range: DateRange | undefined) => {
  void setParams({
    range: 'custom',
    dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
    dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : null
  });
};
```

- [ ] **Step 4: Update page prefetch**

In `src/app/dashboard/news-tips/page.tsx`, parse all params and prefetch using the `filters` object:

```ts
const parsed = newsTipSearchParamsCache.parse(searchParams);
const filters = {
  range: parsed.range,
  ...(parsed.dateFrom && { dateFrom: parsed.dateFrom }),
  ...(parsed.dateTo && { dateTo: parsed.dateTo }),
  ...(parsed.status.length > 0 && { status: parsed.status }),
  ...(parsed.category.length > 0 && { category: parsed.category }),
  ...(parsed.sourcePlatform.length > 0 && { sourcePlatform: parsed.sourcePlatform }),
  ...(parsed.channel.length > 0 && { channel: parsed.channel }),
  ...(parsed.district.length > 0 && { district: parsed.district }),
  ...(parsed.priority.length > 0 && { priority: parsed.priority }),
  sort: parsed.sort
};

void queryClient.prefetchQuery(dashboardQueryOptions(filters));
void queryClient.prefetchQuery(trendQueryOptions(filters, parsed.granularity));
void queryClient.prefetchQuery(recordsQueryOptions(filters));
```

Keep `PageContainer` props:

```tsx
<PageContainer
  pageTitle='深圳报料数据驾驶舱'
  pageDescription='深圳本地媒体报料分诊 · 态势研判 · 处理效率 · 明细导出'
  pageHeaderAction={<CockpitToolbar />}
>
```

- [ ] **Step 5: Redirect root route**

Ensure `src/app/page.tsx` is:

```tsx
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/dashboard/news-tips');
}
```

- [ ] **Step 6: Verify URL state**

Run:

```bash
bun run build
bun run dev
```

Manual checks:

- Open `http://localhost:3000/dashboard/news-tips`.
- Click `今天`, URL contains `range=today`.
- Click `自定义`, select `2026-07-01` to `2026-07-04`, URL contains `range=custom&dateFrom=2026-07-01&dateTo=2026-07-04`.
- Click refresh, the button shows loading while `newsTipKeys.all` refetches.
- Open `/`, it redirects to `/dashboard/news-tips`.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/features/news-tips/lib/search-params.ts src/features/news-tips/hooks/use-news-tip-params.ts src/features/news-tips/components/toolbar.tsx src/app/dashboard/news-tips/page.tsx src/app/page.tsx
git commit -m "feat: add custom date range controls"
```

---

### Task 5: KPI Cards And Operational Insight Strip

**Files:**
- Create: `src/features/news-tips/components/section-nav.tsx`
- Create: `src/features/news-tips/components/analytics-dashboard.tsx`
- Create: `src/features/news-tips/components/records-workbench.tsx`
- Create: `src/app/dashboard/news-tips/analytics/page.tsx`
- Create: `src/app/dashboard/news-tips/records/page.tsx`
- Modify: `src/app/dashboard/news-tips/page.tsx`
- Modify: `src/features/news-tips/components/cockpit.tsx`
- Modify: `src/config/nav-config.ts`

- [ ] **Step 1: Create page-level section navigation**

Create `src/features/news-tips/components/section-nav.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const sections = [
  { title: '总览驾驶舱', href: '/dashboard/news-tips', description: '态势判断' },
  { title: '数据仪表盘', href: '/dashboard/news-tips/analytics', description: '图表分析' },
  { title: '线索明细台', href: '/dashboard/news-tips/records', description: '筛选导出' }
];

export function NewsTipsSectionNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <nav className='grid gap-2 sm:grid-cols-3' aria-label='深圳报料驾驶舱页面导航'>
      {sections.map((section) => {
        const active = pathname === section.href;
        const href = query ? `${section.href}?${query}` : section.href;

        return (
          <Link
            key={section.href}
            href={href}
            className={cn(
              'rounded-lg border bg-card p-3 transition-colors hover:bg-muted/60',
              active && 'border-primary bg-primary/10'
            )}
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-sm font-medium'>{section.title}</span>
              {active && <Badge variant='secondary'>当前</Badge>}
            </div>
            <p className='text-muted-foreground mt-1 text-xs'>{section.description}</p>
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Create analytics dashboard composition**

Create `src/features/news-tips/components/analytics-dashboard.tsx`:

```tsx
'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { dashboardQueryOptions, trendQueryOptions } from '../api/queries';
import { ActiveFilters } from './active-filters';
import { CategoryBar } from './category-bar';
import { ChannelPie } from './channel-pie';
import { DistrictHeatGrid } from './district-heat-grid';
import { NewsTipsSectionNav } from './section-nav';
import { StatusProgress } from './status-progress';
import { TrendChart } from './trend-chart';
import { useNewsTipParams } from '../hooks/use-news-tip-params';

export function AnalyticsDashboard() {
  const { filters, granularity, params, setParams } = useNewsTipParams();
  const { data: dashboard } = useSuspenseQuery(dashboardQueryOptions(filters));
  const { data: trend } = useSuspenseQuery(trendQueryOptions(filters, granularity));

  return (
    <div className='grid gap-4'>
      <NewsTipsSectionNav />
      <ActiveFilters dashboard={dashboard} params={params} setParams={setParams} />
      <div className='grid gap-4 xl:grid-cols-6'>
        <div className='xl:col-span-2'>
          <ChannelPie data={dashboard.sources} />
        </div>
        <div className='xl:col-span-2'>
          <CategoryBar data={dashboard.categories} />
        </div>
        <div className='xl:col-span-2'>
          <StatusProgress data={dashboard.statuses} />
        </div>
      </div>
      <DistrictHeatGrid data={dashboard.districts} />
      <TrendChart data={trend} />
    </div>
  );
}
```

If `ActiveFilters`, chart components, `StatusProgress`, or `TrendChart` do not yet have these props, create this file with the same public intent and adjust in Tasks 6-7. Keep it compiling by using the current component signatures until those tasks run.

- [ ] **Step 3: Create records workbench composition**

Create `src/features/news-tips/components/records-workbench.tsx`:

```tsx
'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { dashboardQueryOptions, recordsQueryOptions } from '../api/queries';
import { ActiveFilters } from './active-filters';
import { NewsTipsSectionNav } from './section-nav';
import { RecordsTable } from './records-table';
import { useNewsTipParams } from '../hooks/use-news-tip-params';

export function RecordsWorkbench() {
  const { filters, params, setParams } = useNewsTipParams();
  const { data: dashboard } = useSuspenseQuery(dashboardQueryOptions(filters));
  const { data: records } = useSuspenseQuery(recordsQueryOptions(filters));

  return (
    <div className='grid gap-4'>
      <NewsTipsSectionNav />
      <ActiveFilters dashboard={dashboard} params={params} setParams={setParams} />
      <RecordsTable records={records} />
    </div>
  );
}
```

If `RecordsTable` still has the old props, create the route with a compiling adapter and complete the final table API in Task 9.

- [ ] **Step 4: Create analytics and records route pages**

Create `src/app/dashboard/news-tips/analytics/page.tsx` and `src/app/dashboard/news-tips/records/page.tsx`. Each page must:

- Export `dynamic = 'force-static'`.
- Use `PageContainer` props, not manual `Heading`.
- Use the same `CockpitToolbar`.
- Prefetch only the data needed by that page with default static filters.
- Render `AnalyticsDashboard` or `RecordsWorkbench`.

Analytics page title:

```tsx
pageTitle='深圳报料数据仪表盘'
pageDescription='来源、类型、区划、状态与趋势分析'
```

Records page title:

```tsx
pageTitle='深圳报料线索明细台'
pageDescription='筛选、排序、展开、导出当前线索结果'
```

- [ ] **Step 5: Keep overview page focused**

Modify `src/features/news-tips/components/cockpit.tsx` so `/dashboard/news-tips` is the overview cockpit:

- Include `NewsTipsSectionNav`.
- Include `ActiveFilters`, `KpiCards`, `InsightStrip`.
- Include only key overview charts, not every detailed chart if the page becomes too long.
- Include a compact high-priority or pending record preview that links to `/dashboard/news-tips/records` with current query params.

- [ ] **Step 6: Update sidebar navigation**

Modify `src/config/nav-config.ts`:

```ts
export const navGroups: NavGroup[] = [
  {
    label: '深圳报料驾驶舱',
    items: [
      {
        title: '总览驾驶舱',
        url: '/dashboard/news-tips',
        icon: 'dashboard',
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: '数据仪表盘',
        url: '/dashboard/news-tips/analytics',
        icon: 'chart',
        items: []
      },
      {
        title: '线索明细台',
        url: '/dashboard/news-tips/records',
        icon: 'page',
        items: []
      },
      {
        title: '设计规范',
        url: '/dashboard/design',
        icon: 'palette',
        items: []
      }
    ]
  }
];
```

If `Icons.chart` is unavailable, register a semantic key in `src/components/icons.tsx` using the existing icon registry pattern, or use an existing chart-like key from the registry. Never import directly from `@tabler/icons-react` in nav components.

- [ ] **Step 7: Verify routes**

Run:

```bash
bun run build
```

Manual checks:

- `/dashboard/news-tips`, `/dashboard/news-tips/analytics`, and `/dashboard/news-tips/records` all render.
- Section navigation preserves current query string when moving between pages.
- Sidebar shows all three business pages.
- No backend routes are added.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/features/news-tips/components/section-nav.tsx src/features/news-tips/components/analytics-dashboard.tsx src/features/news-tips/components/records-workbench.tsx src/app/dashboard/news-tips/page.tsx src/app/dashboard/news-tips/analytics/page.tsx src/app/dashboard/news-tips/records/page.tsx src/features/news-tips/components/cockpit.tsx src/config/nav-config.ts
git commit -m "feat: split news tips cockpit into navigation pages"
```

---

### Task 6: KPI Cards And Operational Insight Strip

**Files:**
- Modify: `src/features/news-tips/components/kpi-cards.tsx`
- Modify: `src/features/news-tips/components/insight-strip.tsx`
- Modify: `src/features/news-tips/components/cockpit.tsx`

- [ ] **Step 1: Update cockpit query usage**

In `src/features/news-tips/components/cockpit.tsx`, replace `range`-only queries with:

```ts
const { filters, granularity, setParams } = useNewsTipParams();
const { data: dashboard } = useSuspenseQuery(dashboardQueryOptions(filters));
const { data: records } = useSuspenseQuery(recordsQueryOptions(filters));
const { data: trend } = useSuspenseQuery(trendQueryOptions(filters, granularity));
```

Use `records.items`, not the old array response.

- [ ] **Step 2: KPI card content**

Each KPI card in `kpi-cards.tsx` must render:

- Label.
- Main value.
- Delta arrow using `Icons.trendingUp` or `Icons.trendingDown`.
- Delta text.
- Recharts sparkline inside `ChartContainer`.
- Tooltip or `HoverCard` explaining the metric definition.

Use these four cards:

```ts
const cards = [
  {
    key: 'today',
    label: '今日报料数',
    value: dashboard.kpi.todayCount,
    delta: dashboard.kpi.todayDelta,
    sparkline: dashboard.kpi.sparklines.today,
    tooltip: '今日 00:00 至当前的报料记录数，环比昨日同口径。'
  },
  {
    key: 'week',
    label: '本周总量',
    value: dashboard.kpi.weekCount,
    delta: dashboard.kpi.weekDelta,
    sparkline: dashboard.kpi.sparklines.week,
    tooltip: '本周一 00:00 至当前的报料记录数，环比上一周期同长度。'
  },
  {
    key: 'response',
    label: '平均处理时长',
    value: `${dashboard.kpi.avgResponseMinutes} 分钟`,
    delta: dashboard.kpi.avgResponseDelta,
    sparkline: dashboard.kpi.sparklines.response,
    reverseDeltaTone: true,
    tooltip: '非待审核线索从提交到首次审核或跟进的平均分钟数，数值下降代表效率改善。'
  },
  {
    key: 'completion',
    label: '处理完成率',
    value: `${dashboard.kpi.completionRate.toFixed(1)}%`,
    delta: dashboard.kpi.completionDelta,
    sparkline: dashboard.kpi.sparklines.completion,
    tooltip: '已采用 + 不予采用 / 当前范围全部线索；采用率作为副指标展示。'
  }
];
```

- [ ] **Step 3: Insight click actions must write URL state**

In `insight-strip.tsx` or `cockpit.tsx`, map insight actions to `setParams`:

```ts
function applyInsight(action: InsightItem['action']) {
  if (action.type === 'sort') {
    void setParams({ sort: action.value });
    return;
  }

  if (action.type === 'filter-status') void setParams({ status: [action.value] });
  if (action.type === 'filter-category') void setParams({ category: [action.value] });
  if (action.type === 'filter-sourcePlatform') void setParams({ sourcePlatform: [action.value] });
  if (action.type === 'filter-channel') void setParams({ channel: [action.value] });
  if (action.type === 'filter-district') void setParams({ district: [action.value] });
  if (action.type === 'filter-priority') void setParams({ priority: [action.value] });
}
```

- [ ] **Step 4: Verify KPI and insight behavior**

Run:

```bash
bun run lint
bun run build
```

Manual checks:

- All four cards show values, deltas, sparkline and tooltip.
- Average response delta uses reversed tone: lower is good, higher is warning.
- Exactly three insight cards show when data has anomalies.
- Clicking an insight updates URL filters or sort and changes table counts.
- When custom date range has zero records, the insight strip shows “当前态势平稳，暂无明显异常” or the explicit empty-range message.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/features/news-tips/components/kpi-cards.tsx src/features/news-tips/components/insight-strip.tsx src/features/news-tips/components/cockpit.tsx
git commit -m "feat: add KPI cards and actionable insights"
```

---

### Task 7: Overview Charts And Filter Chips

**Files:**
- Modify: `src/features/news-tips/components/channel-pie.tsx`
- Modify: `src/features/news-tips/components/category-bar.tsx`
- Modify: `src/features/news-tips/components/district-heat-grid.tsx`
- Create: `src/features/news-tips/components/status-progress.tsx`
- Modify: `src/features/news-tips/components/active-filters.tsx`
- Modify: `src/features/news-tips/components/cockpit.tsx`

- [ ] **Step 1: Make source-platform donut chart click URL filters**

Update `channel-pie.tsx` so the chart data type is `SourcePlatformSlice[]` and the selected state comes from `params.sourcePlatform`.

Click behavior:

```ts
onSelect={(sourcePlatform) => {
  const selected = params.sourcePlatform.includes(sourcePlatform)
    ? params.sourcePlatform.filter((item) => item !== sourcePlatform)
    : [sourcePlatform];
  void setParams({ sourcePlatform: selected });
}}
```

Selected elements keep opacity `1`; unselected elements use opacity `0.25`.

- [ ] **Step 2: Make category bar chart use total plus adopted**

`category-bar.tsx` must use a mature Recharts `BarChart`:

- `count` bar for total.
- `adopted` bar overlay or second bar for adopted.
- `ChartTooltip` shows category, total, adopted and adoption share.
- `onClick` sets `category` URL filter.

Manual selected behavior:

```ts
const dimmed = params.category.length > 0 && !params.category.includes(entry.category);
```

- [ ] **Step 3: Update district heat grid for Shenzhen top 10**

`district-heat-grid.tsx` must render only `HEAT_GRID_DISTRICTS` from dashboard data:

- 10 grid cells: 9 administrative districts + 大鹏新区.
- Deep color = higher count.
- Cell shows district, total count, pending count, adoption rate.
- If `pendingCount > 0` and `pendingCount / count >= 0.35`, show a `Badge` with `Icons.alertCircle`.
- Click writes `district=[district]` to URL.
- If `深汕特别合作区` exists in filtered records, mention it in a small footer line: `深汕特别合作区作为跨域/应急线索进入明细和趋势，不纳入首屏热区矩阵。`

- [ ] **Step 4: Create status progress chart**

Create `src/features/news-tips/components/status-progress.tsx`:

```tsx
'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import type { NewsTipStatus, StatusStat } from '../api/types';

interface StatusProgressProps {
  data: StatusStat[];
  activeStatuses: NewsTipStatus[];
  onSelect: (status: NewsTipStatus) => void;
}

const statusColors: Record<NewsTipStatus, string> = {
  待审核: 'var(--chart-4)',
  跟进中: 'var(--chart-2)',
  已采用: 'var(--chart-1)',
  不予采用: 'var(--muted-foreground)'
};

export function StatusProgress({ data, activeStatuses, onSelect }: StatusProgressProps) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium'>处理状态进度</CardTitle>
      </CardHeader>
      <CardContent className='h-64'>
        <ChartContainer config={{ count: { label: '线索数' } }} className='h-full w-full'>
          <BarChart data={data} layout='vertical' margin={{ left: 16, right: 16 }}>
            <CartesianGrid horizontal={false} strokeDasharray='3 3' />
            <XAxis type='number' allowDecimals={false} />
            <YAxis dataKey='status' type='category' width={64} tickLine={false} axisLine={false} />
            <ChartTooltip />
            <Bar
              dataKey='count'
              radius={6}
              onClick={(entry) => onSelect(entry.status as NewsTipStatus)}
            >
              {data.map((entry) => {
                const dimmed = activeStatuses.length > 0 && !activeStatuses.includes(entry.status);

                return (
                  <Cell
                    key={entry.status}
                    fill={statusColors[entry.status]}
                    opacity={dimmed ? 0.25 : 1}
                    className='cursor-pointer transition-opacity'
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Active filters must show every filter dimension**

Update `active-filters.tsx` to render chips for:

- `status`
- `category`
- `sourcePlatform`
- `channel`
- `district`
- `priority`

Clear behavior:

```ts
void setParams({ [kind]: params[kind].filter((item) => item !== value) });
```

Clear-all behavior must preserve `range`, `dateFrom`, `dateTo`, and `granularity`:

```ts
void setParams({
  status: [],
  category: [],
  sourcePlatform: [],
  channel: [],
  district: [],
  priority: [],
  sort: 'priority'
});
```

- [ ] **Step 6: Place charts in cockpit**

In `cockpit.tsx`, arrange overview after `InsightStrip`:

```tsx
<div className='grid gap-4 xl:grid-cols-6'>
  <div className='xl:col-span-2'>
    <ChannelPie data={dashboard.sources} />
  </div>
  <div className='xl:col-span-2'>
    <CategoryBar data={dashboard.categories} />
  </div>
  <div className='xl:col-span-2'>
    <StatusProgress data={dashboard.statuses} />
  </div>
</div>

<DistrictHeatGrid data={dashboard.districts} />
```

- [ ] **Step 7: Verify chart interactions**

Run:

```bash
bun run lint
bun run build
```

Manual checks:

- Click source-platform donut: `sourcePlatform=` appears in URL, chip appears, table count changes.
- Click category bar: `category=` appears in URL, selected bar stays highlighted.
- Click district heat cell: `district=` appears in URL, selected district stays highlighted.
- Click status bar: `status=` appears in URL, selected status stays highlighted.
- Click chip close removes only that filter.
- Click clear all preserves date range and granularity.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/features/news-tips/components/channel-pie.tsx src/features/news-tips/components/category-bar.tsx src/features/news-tips/components/district-heat-grid.tsx src/features/news-tips/components/status-progress.tsx src/features/news-tips/components/active-filters.tsx src/features/news-tips/components/cockpit.tsx
git commit -m "feat: add overview chart filtering"
```

---

### Task 8: Trend Chart With Day Week Month Granularity

**Files:**
- Modify: `src/features/news-tips/components/trend-chart.tsx`
- Modify: `src/features/news-tips/components/cockpit.tsx`
- Test: `src/features/news-tips/utils/analytics.test.ts`

- [ ] **Step 1: Ensure trend tests cover all granularities**

Append to `src/features/news-tips/utils/analytics.test.ts`:

```ts
test('trend supports week and month grouping', () => {
  const records = [
    record({ createdAt: '2026-06-30T08:00:00.000Z', status: '已采用' }),
    record({ id: 'SZ-BL-20260701-001', createdAt: '2026-07-01T08:00:00.000Z', status: '已采用' }),
    record({ id: 'SZ-BL-20260702-001', createdAt: '2026-07-02T08:00:00.000Z', status: '不予采用' })
  ];

  expect(aggregateTrend(records, 'week').length).toBeGreaterThanOrEqual(1);
  expect(aggregateTrend(records, 'month').map((point) => point.label)).toContain('7月');
});
```

- [ ] **Step 2: Run the trend tests**

Run:

```bash
bun test src/features/news-tips/utils/analytics.test.ts
```

Expected: PASS after Task 3.

- [ ] **Step 3: Update trend chart props**

`TrendChart` should receive `data: TrendPoint[]` from `getTrend`, not compute trend locally from records:

```ts
interface TrendChartProps {
  data: TrendPoint[];
}
```

- [ ] **Step 4: Render count, completion rate and adoption rate**

Use `ComposedChart`:

- Left axis: `count`, rendered as `Bar` or `Area`.
- Right axis: `completionRate` and `adoptionRate`, rendered as two lines.
- Tooltip shows all three values.
- Tabs write `granularity` to URL.
- Empty state shows an `Alert` or centered `Skeleton`-safe empty panel with reset date action.

Tooltip content:

```tsx
<div className='bg-background rounded-lg border px-3 py-2 text-xs shadow-xl'>
  <div className='font-medium'>{label}</div>
  <div className='text-muted-foreground mt-1 grid gap-1'>
    <span className='tabular-nums'>线索量 {count} 条</span>
    <span className='tabular-nums'>完成率 {completionRate.toFixed(1)}%</span>
    <span className='tabular-nums'>采用率 {adoptionRate.toFixed(1)}%</span>
  </div>
</div>
```

- [ ] **Step 5: Verify granularity switching**

Run:

```bash
bun run lint
bun run build
```

Manual checks:

- `按日` shows daily labels like `07-04`.
- `按周` shows week labels.
- `按月` shows month labels across the 180-day generator.
- Custom date with no records shows empty state and no console errors.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/features/news-tips/components/trend-chart.tsx src/features/news-tips/components/cockpit.tsx src/features/news-tips/utils/analytics.test.ts
git commit -m "feat: add completion trend analysis"
```

---

### Task 9: Mature Records Table, Expanded Rows, Sorting, And Pagination

**Files:**
- Create: `src/features/news-tips/components/records-table/columns.tsx`
- Create: `src/features/news-tips/components/records-table/record-detail.tsx`
- Modify: `src/features/news-tips/components/records-table/index.tsx`
- Modify: `src/features/news-tips/components/cockpit.tsx`

- [ ] **Step 1: Create table column definitions**

Create `src/features/news-tips/components/records-table/columns.tsx` with:

```tsx
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  NEWS_TIP_CATEGORIES,
  NEWS_TIP_CHANNELS,
  NEWS_TIP_DISTRICTS,
  NEWS_TIP_SOURCE_PLATFORMS,
  NEWS_TIP_STATUSES,
  PRIORITY_LABELS,
  PRIORITY_LEVELS
} from '../../constants/options';
import type { NewsTipRecordWithPriority, NewsTipStatus, PriorityLevel } from '../../api/types';

const statusClassName: Record<NewsTipStatus, string> = {
  待审核: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  跟进中: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  已采用: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300',
  不予采用: 'border-muted-foreground/25 bg-muted text-muted-foreground'
};

const priorityClassName: Record<PriorityLevel, string> = {
  high: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  low: 'border-muted-foreground/25 bg-muted text-muted-foreground'
};

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso));
}

function formatResponse(minutes: number | null) {
  if (minutes === null) return '-';
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} 小时` : `${hours} 小时 ${rest} 分`;
}

export const columns: ColumnDef<NewsTipRecordWithPriority>[] = [
  {
    id: 'expand',
    header: '',
    cell: ({ row }) => (
      <button
        type='button'
        aria-label={row.getIsExpanded() ? '收起线索详情' : '展开线索详情'}
        onClick={row.getToggleExpandedHandler()}
        className='hover:bg-muted flex size-8 items-center justify-center rounded-md'
      >
        <Icons.chevronRight className={cn('transition-transform', row.getIsExpanded() && 'rotate-90')} />
      </button>
    ),
    enableSorting: false,
    enableColumnFilter: false
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title='标题' />,
    cell: ({ row }) => (
      <div className='max-w-80'>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='truncate text-sm font-medium'>{row.original.title}</div>
          </TooltipTrigger>
          <TooltipContent side='top' className='max-w-80'>
            {row.original.title}
          </TooltipContent>
        </Tooltip>
        <div className='text-muted-foreground mt-1 text-xs tabular-nums'>{row.original.id}</div>
      </div>
    ),
    meta: { label: '标题', variant: 'text', placeholder: '搜索标题' },
    enableColumnFilter: true
  },
  {
    id: 'sourcePlatform',
    accessorKey: 'sourcePlatform',
    header: ({ column }) => <DataTableColumnHeader column={column} title='来源平台' />,
    cell: ({ row }) => <Badge variant='outline'>{row.original.sourcePlatform}</Badge>,
    meta: {
      label: '来源平台',
      variant: 'multiSelect',
      options: NEWS_TIP_SOURCE_PLATFORMS.map((value) => ({ value, label: value }))
    },
    enableColumnFilter: true
  },
  {
    id: 'channel',
    accessorKey: 'channel',
    header: ({ column }) => <DataTableColumnHeader column={column} title='报料渠道' />,
    cell: ({ row }) => <Badge variant='secondary'>{row.original.channel}</Badge>,
    meta: {
      label: '渠道',
      variant: 'multiSelect',
      options: NEWS_TIP_CHANNELS.map((value) => ({ value, label: value }))
    },
    enableColumnFilter: true
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title='类型' />,
    cell: ({ row }) => <Badge variant='outline'>{row.original.category}</Badge>,
    meta: {
      label: '类型',
      variant: 'multiSelect',
      options: NEWS_TIP_CATEGORIES.map((value) => ({ value, label: value }))
    },
    enableColumnFilter: true
  },
  {
    id: 'district',
    accessorKey: 'district',
    header: ({ column }) => <DataTableColumnHeader column={column} title='区域' />,
    cell: ({ row }) => (
      <div className='text-sm'>
        <div>{row.original.district}</div>
        <div className='text-muted-foreground text-xs'>{row.original.street ?? row.original.locationName ?? '-'}</div>
      </div>
    ),
    meta: {
      label: '区域',
      variant: 'multiSelect',
      options: NEWS_TIP_DISTRICTS.map((value) => ({ value, label: value }))
    },
    enableColumnFilter: true
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='状态' />,
    cell: ({ row }) => (
      <Badge variant='outline' className={cn('font-normal', statusClassName[row.original.status])}>
        {row.original.status}
      </Badge>
    ),
    meta: {
      label: '状态',
      variant: 'multiSelect',
      options: NEWS_TIP_STATUSES.map((value) => ({ value, label: value }))
    },
    enableColumnFilter: true
  },
  {
    id: 'priority',
    accessorKey: 'priorityLevel',
    header: ({ column }) => <DataTableColumnHeader column={column} title='优先级' />,
    cell: ({ row }) => (
      <Badge variant='outline' className={cn('font-normal', priorityClassName[row.original.priorityLevel])}>
        {row.original.priorityLabel}
      </Badge>
    ),
    sortingFn: (a, b) => a.original.priorityScore - b.original.priorityScore,
    meta: {
      label: '优先级',
      variant: 'multiSelect',
      options: PRIORITY_LEVELS.map((value) => ({ value, label: PRIORITY_LABELS[value] }))
    },
    enableColumnFilter: true
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='报料时间' />,
    cell: ({ row }) => <span className='text-muted-foreground text-sm tabular-nums'>{formatDateTime(row.original.createdAt)}</span>
  },
  {
    id: 'responseMinutes',
    accessorKey: 'responseMinutes',
    header: ({ column }) => <DataTableColumnHeader column={column} title='处理时长' />,
    cell: ({ row }) => <span className='text-sm tabular-nums'>{formatResponse(row.original.responseMinutes)}</span>
  },
  {
    id: 'assignee',
    accessorKey: 'assignee',
    header: ({ column }) => <DataTableColumnHeader column={column} title='跟进人' />,
    cell: ({ row }) => <span className='text-sm'>{row.original.assignee}</span>
  }
];
```

- [ ] **Step 2: Create record detail panel**

Create `src/features/news-tips/components/records-table/record-detail.tsx`:

```tsx
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import type { NewsTipRecordWithPriority } from '../../api/types';

interface RecordDetailProps {
  record: NewsTipRecordWithPriority;
}

export function RecordDetail({ record }: RecordDetailProps) {
  return (
    <div className='grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]'>
      <div className='flex flex-col gap-4'>
        <section className='flex flex-col gap-2'>
          <div className='text-sm font-medium'>线索描述</div>
          <p className='text-muted-foreground text-sm leading-6'>{record.description}</p>
        </section>

        <section className='grid gap-3 sm:grid-cols-2'>
          <div>
            <div className='text-muted-foreground text-xs'>报料人</div>
            <div className='text-sm'>{record.reporter}</div>
          </div>
          <div>
            <div className='text-muted-foreground text-xs'>地点</div>
            <div className='text-sm'>
              {record.district} {record.street ?? ''} {record.locationName ?? ''}
            </div>
          </div>
          <div>
            <div className='text-muted-foreground text-xs'>处置单位</div>
            <div className='text-sm'>{record.department ?? '-'}</div>
          </div>
          <div>
            <div className='text-muted-foreground text-xs'>参考题材</div>
            <HoverCard>
              <HoverCardTrigger asChild>
                <button type='button' className='truncate text-left text-sm underline-offset-4 hover:underline'>
                  {record.referenceTopic}
                </button>
              </HoverCardTrigger>
              <HoverCardContent className='w-80 text-sm'>
                <div className='font-medium'>{record.sourcePlatform}</div>
                <p className='text-muted-foreground mt-2 leading-6'>{record.referenceTopic}</p>
                {record.sourceUrl && <p className='text-muted-foreground mt-2 break-all text-xs'>{record.sourceUrl}</p>}
              </HoverCardContent>
            </HoverCard>
          </div>
        </section>

        <section className='rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm'>
          <div className='font-medium'>优先级命中原因</div>
          <p className='text-muted-foreground mt-1'>{record.priorityReason}</p>
          <div className='mt-2 flex flex-wrap gap-1.5'>
            {record.riskTags.map((tag) => (
              <Badge key={tag} variant='outline'>{tag}</Badge>
            ))}
          </div>
        </section>
      </div>

      <section className='flex flex-col gap-3'>
        <div className='text-sm font-medium'>处理轨迹</div>
        <div className='flex flex-col gap-3'>
          {record.timeline.map((entry, index) => (
            <div key={`${entry.time}-${entry.action}`} className='flex gap-3'>
              <div className='flex flex-col items-center'>
                <div className='bg-primary mt-1 size-2 rounded-full' />
                {index < record.timeline.length - 1 && <Separator orientation='vertical' className='my-1 min-h-8' />}
              </div>
              <div className='min-w-0'>
                <div className='text-sm'>{entry.action}</div>
                <div className='text-muted-foreground text-xs'>{entry.note}</div>
                <div className='text-muted-foreground mt-1 text-xs tabular-nums'>
                  {new Intl.DateTimeFormat('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(new Date(entry.time))}
                  {' · '}
                  {entry.operator}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Replace custom table shell with TanStack Table state**

In `records-table/index.tsx`:

- Use `useReactTable`.
- Use `getCoreRowModel`, `getPaginationRowModel`, `getSortedRowModel`, `getExpandedRowModel`.
- Use `DataTableColumnHeader` from the column file and `DataTablePagination` for pagination.
- Use `Popover + Command + Badge` filter controls matching `DataTableFacetedFilter` behavior for URL-driven filters, because chart clicks and chips must update the same nuqs keys as table filters.
- Render sub-row with `RecordDetail`.
- Keep outer `ScrollArea` so mobile can horizontally scroll.
- Use `records.items` and `records.rangeTotalItems`.

Required summary text:

```tsx
当前筛选 {records.totalItems} 条 / 当前范围 {records.rangeTotalItems} 条 / 全量 {records.allItems} 条
```

- [ ] **Step 4: Wire table filters to URL state**

Filter buttons in the table toolbar must update the same nuqs keys used by chart clicks:

```ts
void setParams({ status: nextStatusValues });
void setParams({ category: nextCategoryValues });
void setParams({ sourcePlatform: nextSourcePlatformValues });
void setParams({ channel: nextChannelValues });
void setParams({ district: nextDistrictValues });
void setParams({ priority: nextPriorityValues });
void setParams({ sort: nextSortMode });
```

The default sorting must be:

1. `priorityScore` descending.
2. `createdAt` descending.

- [ ] **Step 5: Verify table behavior**

Run:

```bash
bun run lint
bun run build
```

Manual checks:

- Columns include ID, title, source platform, report channel, category, district/street, status, priority, report time, response minutes, assignee.
- Status, type, source platform, report channel, district, priority filters work.
- Report time, response minutes, priority sorting work.
- Pagination works.
- Row expansion shows description, reference topic, masked reporter, district/street/location, timeline, priority reason.
- Empty state has clear filters action.
- Mobile width keeps table horizontally scrollable instead of page overflow.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/features/news-tips/components/records-table
git commit -m "feat: upgrade news tip records table"
```

---

### Task 10: CSV Export For Current Filtered Results

**Files:**
- Modify: `src/features/news-tips/utils/export-csv.ts`
- Create: `src/features/news-tips/utils/export-csv.test.ts`
- Modify: `src/features/news-tips/components/toolbar.tsx`
- Modify: `src/features/news-tips/components/records-table/index.tsx`

- [ ] **Step 1: Write failing CSV tests**

Create `src/features/news-tips/utils/export-csv.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import type { NewsTipRecordWithPriority } from '../api/types';
import { buildNewsTipsCsv, createNewsTipsCsvFilename } from './export-csv';

const row: NewsTipRecordWithPriority = {
  id: 'SZ-BL-20260704-001',
  title: '龙岗区布吉街道一小区排水设施老化引发投诉',
  description: '居民反映雨后污水外溢。',
  category: '民生投诉',
  sourcePlatform: '深圳新闻网',
  sourceUrl: 'https://www.sznews.com/',
  referenceTopic: '龙岗布吉小区排水设施老化、污水渗漏、街道回应',
  channel: '报料小程序',
  status: '待审核',
  district: '龙岗区',
  street: '布吉',
  locationName: '布吉街道老旧小区',
  reporter: '陈先生',
  assignee: '林嘉豪',
  department: '街道办 / 住建部门',
  createdAt: '2026-07-04T08:00:00.000Z',
  firstResponseAt: null,
  responseMinutes: null,
  riskTags: ['排水', '老旧小区'],
  timeline: [{ time: '2026-07-04T08:00:00.000Z', action: '线索提交', operator: '市民报料', note: '报料入口接收' }],
  priorityLevel: 'high',
  priorityLabel: '需优先处理',
  priorityReason: '待审核超过 60 分钟',
  priorityScore: 3,
  ageMinutes: 90
};

describe('news tips CSV export', () => {
  test('builds UTF-8 BOM CSV with metadata and Shenzhen fields', () => {
    const csv = buildNewsTipsCsv({
      records: [row],
      exportedAt: new Date('2026-07-04T09:30:00.000Z'),
      filterSummary: '状态:待审核；区域:龙岗区',
      dataScope: '深圳本地媒体报料模拟数据，题材来自公开报道类型抽象'
    });

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('导出时间');
    expect(csv).toContain('筛选条件');
    expect(csv).toContain('数据口径');
    expect(csv).toContain('来源平台');
    expect(csv).toContain('报料渠道');
    expect(csv).toContain('参考题材');
    expect(csv).toContain('龙岗区');
  });

  test('creates required filename format', () => {
    expect(createNewsTipsCsvFilename(new Date('2026-07-04T09:30:00.000Z'))).toBe('深圳报料线索_20260704_0930.csv');
  });
});
```

- [ ] **Step 2: Run the CSV tests and verify they fail**

Run:

```bash
bun test src/features/news-tips/utils/export-csv.test.ts
```

Expected: FAIL because `buildNewsTipsCsv` and `createNewsTipsCsvFilename` are not exported.

- [ ] **Step 3: Refactor CSV utility into pure builder plus browser download**

`src/features/news-tips/utils/export-csv.ts` must export:

```ts
export function createNewsTipsCsvFilename(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `深圳报料线索_${y}${m}${d}_${hh}${mm}.csv`;
}

export function buildNewsTipsCsv({
  records,
  exportedAt,
  filterSummary,
  dataScope
}: {
  records: NewsTipRecordWithPriority[];
  exportedAt: Date;
  filterSummary: string;
  dataScope: string;
}): string {
  const metaRows = [
    ['导出时间', exportedAt.toLocaleString('zh-CN')],
    ['筛选条件', filterSummary],
    ['记录数', `${records.length}`],
    ['数据口径', dataScope],
    []
  ];

  const header = [
    '编号',
    '标题',
    '来源平台',
    '报料渠道',
    '类型',
    '区域',
    '街道',
    '状态',
    '优先级',
    '报料时间',
    '处理时长',
    '跟进人',
    '报料人',
    '参考题材',
    '描述'
  ];

  const dataRows = records.map((record) => [
    record.id,
    record.title,
    record.sourcePlatform,
    record.channel,
    record.category,
    record.district,
    record.street ?? '',
    record.status,
    record.priorityLabel,
    record.createdAt,
    record.responseMinutes ?? '',
    record.assignee,
    record.reporter,
    record.referenceTopic,
    record.description
  ]);

  return `\uFEFF${[...metaRows, header, ...dataRows]
    .map((csvRow) => csvRow.map((value) => csvEscape(value)).join(','))
    .join('\n')}`;
}
```

Keep `exportNewsTipsCsv(records, summary)` as browser wrapper:

```ts
export function exportNewsTipsCsv(records: NewsTipRecordWithPriority[], filterSummary: string): void {
  if (records.length === 0) return;

  const exportedAt = new Date();
  const csv = buildNewsTipsCsv({
    records,
    exportedAt,
    filterSummary,
    dataScope: '深圳本地媒体报料模拟数据，题材来自公开报道类型抽象；导出结果受当前筛选条件影响。'
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = createNewsTipsCsvFilename(exportedAt);
  anchor.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 4: Move export trigger to current filtered records**

The export button may live in the toolbar or table header, but it must use `records.items` from the current query, not all mock data.

Disabled state:

```tsx
<Button variant='outline' size='sm' disabled={records.items.length === 0} onClick={handleExport}>
  <Icons.fileTypeXls />
  导出 CSV
</Button>
```

If records are empty and the user clicks export from a visible disabled-adjacent menu, show:

```ts
toast.warning('当前筛选结果为空，无法导出 CSV');
```

- [ ] **Step 5: Run tests and verify Excel-safe output**

Run:

```bash
bun test src/features/news-tips/utils/export-csv.test.ts
bun run lint
bun run build
```

Manual checks:

- Exported filename matches `深圳报料线索_YYYYMMDD_HHmm.csv`.
- Opening in Excel shows Chinese without mojibake.
- First rows include export time, filter summary, record count and data scope.
- Data rows include source platform and report channel separately.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/features/news-tips/utils/export-csv.ts src/features/news-tips/utils/export-csv.test.ts src/features/news-tips/components/toolbar.tsx src/features/news-tips/components/records-table/index.tsx
git commit -m "feat: export filtered Shenzhen tips CSV"
```

---

### Task 11: Static Export, Responsive QA, Empty States, And Final Acceptance

**Files:**
- Modify: `src/features/news-tips/components/cockpit.tsx`
- Modify: `src/features/news-tips/components/*.tsx`
- Modify: `src/features/news-tips/components/records-table/*.tsx`
- Modify: `src/config/nav-config.ts`
- Modify: `next.config.ts`
- Delete only if required for static export: `src/app/api/products/**`
- Delete only if required for static export: `src/app/api/users/**`
- Test: all previous tests

- [ ] **Step 1: Navigation and title polish**

Ensure `src/config/nav-config.ts` has a primary nav item:

```ts
{
  title: '深圳报料驾驶舱',
  url: '/dashboard/news-tips',
  icon: 'dashboard',
  shortcut: ['d', 'd'],
  items: []
}
```

Do not import icons directly from `@tabler/icons-react`.

- [ ] **Step 2: Add static export build switch**

Update `next.config.ts` so static packaging is opt-in and does not break normal development:

```ts
const isStaticExport = process.env.NEXT_STATIC_EXPORT === 'true';
const isStandalone = process.env.BUILD_STANDALONE === 'true';

const baseConfig: NextConfig = {
  output: isStaticExport ? 'export' : isStandalone ? 'standalone' : undefined,
  images: {
    unoptimized: isStaticExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};
```

Also ensure Sentry tunnel/rewrite options are not enabled during static export:

```ts
if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED && !isStaticExport) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    // existing Sentry config
  });
}
```

- [ ] **Step 3: Remove static export blockers from template demo APIs**

Run:

```bash
NEXT_PUBLIC_SENTRY_DISABLED=true NEXT_STATIC_EXPORT=true bun run build
```

If this fails because `src/app/api/products/**` or `src/app/api/users/**` are Route Handlers, delete those demo API route folders. They are template examples, not part of `/dashboard/news-tips`, and static export cannot ship backend endpoints.

After deleting demo APIs, run:

```bash
NEXT_PUBLIC_SENTRY_DISABLED=true NEXT_STATIC_EXPORT=true bun run build
```

Expected: static export build completes and writes a static output.

- [ ] **Step 4: Responsive layout rules**

In `cockpit.tsx`, keep these layout constraints:

- Page root: `grid gap-4`.
- Toolbar wraps to two lines on mobile.
- KPI: `grid gap-4 sm:grid-cols-2 xl:grid-cols-4`.
- Insight cards: `grid gap-4 lg:grid-cols-3`.
- Overview charts: single column on mobile, 3 columns on `xl`.
- Chart card height: fixed `h-72` or `h-80`, not content-driven.
- Table wrapper: horizontal scroll inside table surface, not full page overflow.

- [ ] **Step 5: Empty states**

Use `Alert` or `Card` + `Button` for empty states:

- No chart data: show `当前筛选暂无数据` and `清空筛选`.
- No table data: show `当前筛选 0 条 / 当前范围 N 条 / 全量 T 条` and clear filters button.
- Custom date with no data: no chart crash, no `NaN`, no `Infinity`.

- [ ] **Step 6: No forbidden districts**

Run:

```bash
rg "天河区|越秀区|海珠区|荔湾区|白云区|黄埔区|番禺区|南沙区|花都区|增城区" src docs/prd.md
```

Expected: matches may appear in `docs/prd.md` only because the PRD describes forbidden examples; no matches under `src/`.

- [ ] **Step 7: Full automated verification**

Run:

```bash
bun test src/features/news-tips/api/service.test.ts src/features/news-tips/utils/analytics.test.ts src/features/news-tips/utils/export-csv.test.ts
bun run lint
bun run build
NEXT_PUBLIC_SENTRY_DISABLED=true NEXT_STATIC_EXPORT=true bun run build
```

Expected:

- Tests pass.
- Lint has no new errors.
- Normal build completes.
- Static export build completes without backend route handlers.

- [ ] **Step 8: Manual acceptance checklist**

Run:

```bash
bun run dev
```

Check:

- `http://localhost:3000/` redirects to `/dashboard/news-tips`.
- `http://localhost:3000/dashboard/news-tips` loads without auth friction.
- 1440px: first viewport shows toolbar, four KPI cards, insight strip, and at least two overview charts.
- 768px: charts do not squeeze labels into overlap.
- 375px: toolbar wraps cleanly, KPI cards remain readable, table scrolls horizontally inside its container.
- Hovering all Recharts charts shows tooltip.
- Clicking source, category, district, status, and insight filters updates chips and table counts.
- Sorting by priority, created time and response time changes table order.
- Expanding a row shows timeline and priority reason.
- CSV exports current filtered records.
- Browser console has no runtime errors.

- [ ] **Step 9: Commit**

Run:

```bash
git add src/features/news-tips src/app/page.tsx src/app/dashboard/news-tips/page.tsx src/config/nav-config.ts next.config.ts src/app/api/products src/app/api/users
git commit -m "feat: finish Shenzhen news tips cockpit"
```

---

## Requirements That Need Reference UI From You

The PRD is clear enough for data, behavior and acceptance. These areas still lack visual specificity, so reference UI would materially improve the final result:

1. **Overall visual direction**  
   Need reference for whether the H5 should feel like a sober newsroom operations console, a civic data dashboard, or a contest demo with stronger visual contrast.

2. **深圳区划热区矩阵 style**  
   PRD says no GIS map and use a heat matrix. Need reference for whether you prefer compact ranking cards, a schematic pseudo-map grid, or dense operations tiles.

3. **运营态势摘要 cards**  
   Need reference for severity styling: inline alert strip, three compact cards, or editorial “判断 + 建议” blocks.

4. **KPI card density**  
   Need reference for sparkline placement and card hierarchy: minimal financial-dashboard cards, command-center metric cards, or mobile-first compact counters.

5. **明细表行展开 panel**  
   Need reference for the timeline/detail layout: audit-log style, news editorial workflow style, or case-detail drawer style.

6. **移动端 table fallback**  
   PRD allows horizontal scroll. If you want a richer H5 experience, provide reference for card-list fallback versus scrollable table.

7. **图表 selected/highlight states**  
   Need reference for selected opacity, border/ring, tooltip density, and whether chart clicks should feel like filter toggles or drill-down navigation.

8. **空状态 and export feedback**  
   Need reference if the contest demo should use quiet admin empty states or more explicit guided empty states with reset actions.

If no additional UI reference is provided, implement with a restrained newsroom operations style: light/dark theme compatible, compact cards, no marketing hero, no decorative gradients, and high information density.

## Self-Review

- **Spec coverage:** Tasks 1-3 cover PRD data model, Shenzhen localization, mock scale, priority rules and insights. Task 4 covers toolbar, custom dates and static-compatible prefetch. Task 5 covers multi-page navigation shell. Tasks 6-8 cover KPI, insights, charts, heat matrix, status progress, trend analysis and filter chips. Tasks 9-10 cover table details, row expansion and CSV export. Task 11 covers route polish, pure frontend static export, responsive, build and acceptance.
- **Component maturity:** Plan uses existing shadcn/ui primitives, Recharts, TanStack Query and TanStack Table. The only business-specific UI is the Shenzhen heat grid and record detail panel.
- **Known implementation risk:** TanStack Table URL filter synchronization must be handled in `records-table/index.tsx` so chart clicks, chips and table toolbar use the same nuqs keys.
