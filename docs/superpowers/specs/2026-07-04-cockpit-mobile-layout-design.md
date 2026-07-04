# 报料驾驶舱移动端布局设计

## 背景

参考原型 `报料驾驶舱原型.html`（PC 桌面端 1440 + 移动端 H5 390 双规格设计稿），对比当前 `feat/baoliao-cockpit` 分支下 `src/features/news-tips/` 的响应式实现，梳理出移动端需要调整的结构性差异。当前正在开发的国家/深圳地图下钻组件（`national-heat-map.tsx` / `district-heat-map.tsx`）在桌面端保留，移动端改用原型中的排行榜形式。

## 范围

仅涉及 `/dashboard/news-tips`、`/dashboard/news-tips/records`、`/dashboard/news-tips/flow` 三个页面的移动端（`< md` 断点）表现。桌面端（`>= md`）行为保持不变。

不在范围内（结构已一致，不改动）：来源渠道占比（`ChannelPie`）、线索类型分布（`CategoryBar`）、趋势走向（`TrendChart`）、待办预览（`TodoPreview`）。

## 设计内容

### 1. 底部 Tab 栏（新增）

- 新增 `src/app/dashboard/news-tips/layout.tsx`，包裹三个子页面（驾驶舱 / 线索明细 / 处理流转）。
- 新增组件 `NewsTipsMobileTabBar`（放在 `src/features/news-tips/components/`）：
  - `fixed bottom-0 inset-x-0 z-30 md:hidden`，3 个入口：驾驶舱（`/dashboard/news-tips`）、线索明细（`/dashboard/news-tips/records`）、处理流转（`/dashboard/news-tips/flow`）。
  - 用 `usePathname()` 判断当前激活项并高亮。
  - 每项为 `Link` + 图标（复用 `@/components/icons`）+ 文案，纵向排列（图标在上，文字在下），与原型一致。
- layout 中内容区域增加 `pb-16 md:pb-0`，避免内容被固定 Tab 栏遮挡。

### 2. 顶部 Header 调整

- `src/components/layout/header.tsx` 改为 `'use client'` 组件，使用 `usePathname()`。
- 当路径以 `/dashboard/news-tips` 开头时，左侧「汉堡按钮 + 分隔线 + 面包屑」这组元素追加 `hidden md:flex`（移动端隐藏，桌面端不受影响，其余路径不受影响）。
- 右侧 `ThemeModeToggle` 始终保留、始终可见（含移动端）。

### 3. 工具栏简化

`src/features/news-tips/components/toolbar.tsx`：

- 自定义日期范围按钮：`<sm` 时只渲染日历图标（`aria-label` 保留可访问性文本，不渲染文字标签）；`sm:` 及以上恢复"图标 + 日期文字"。
- 刷新按钮已是纯图标，无需改动。

### 4. KPI 卡片网格

`src/features/news-tips/components/kpi-cards.tsx`：

- 容器类名由 `grid gap-4 md:grid-cols-2 xl:grid-cols-4` 改为 `grid grid-cols-2 gap-4 xl:grid-cols-4`，手机尺寸下即为 2×2 网格。

### 5. 态势判断卡片横向滑动

`src/features/news-tips/components/insight-strip.tsx`：

- 移动端（`< md`）容器改为 `flex gap-3 overflow-x-auto snap-x snap-mandatory`，隐藏滚动条；每张卡片 `min-w-[85%] shrink-0 snap-start`。
- `md:` 及以上恢复现有 `grid md:grid-cols-3` 平铺布局（不滑动）。

### 6. 区划热区：移动端排行榜 + 桌面端保留地图

- 新增组件 `district-ranking-list.tsx`（`src/features/news-tips/components/`）：
  - Props: `{ data: DistrictStat[]; activeDistricts: ShenzhenDistrict[]; onSelect: (d: ShenzhenDistrict) => void }`。
  - 按 `count` 降序渲染横向条形排行榜：区名 + 条形（宽度按 `count / maxCount` 计算）+ 数量文案，条形颜色复用现有 `--primary` token。
  - 每行可点击，触发 `onSelect`；样式参考现有 `StatusProgress` / `TodoPreview` 的 hover/边框风格，保持视觉一致。
  - 纯展示 + 筛选，不含国家/深圳下钻逻辑。
- `src/features/news-tips/components/region-heat-map.tsx`：
  - `CardHeader` 内标题/副标题及"返回全国"按钮拆分为 `hidden md:*`（桌面）与 `md:hidden`（移动，标题简化为「深圳区划热区」，无副标题、无返回按钮）两组。
  - `CardContent` 同样拆分：`md:hidden` 渲染新的 `DistrictRankingList`；`hidden md:block` 保留现有 `NationalHeatMap` / `DistrictHeatMapView` 下钻逻辑，完全不变。

## 交互与数据

- 所有改动均为纯展示层调整，不涉及 API/类型层改动，复用现有 `DashboardData` 结构中的 `insights` / `kpi` / `districts` 字段。
- 移动端排行榜的 `onSelect` 复用 `Cockpit` 组件中已有的 `drill` 逻辑（写入 URL 参数并跳转 records 页）。

## 测试

- 现有测试（如 `shenzhen-geo.test.ts`）不受影响。
- 新增 `DistrictRankingList` 为纯展示组件，视需要补充最小单元测试（排序正确性、空数据态）。
- 手动验证：在 375–430px 宽度下检查底部 Tab 栏、Header 隐藏、KPI 2 列、态势卡片横滑、区划排行榜是否符合预期；`md`/`xl` 断点下桌面行为应与改动前一致。
