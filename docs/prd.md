# 深圳报料数据驾驶舱 H5 需求文档

版本：0.2  
日期：2026-07-04  
项目：Next.js Admin Dashboard Starter  
赛题：8 小时单人全栈 AI 挑战赛 · 题目 1「报料数据驾驶舱 H5」  
业务定位：深圳本地媒体 / 新闻线索报料运营驾驶舱

## 1. 核心结论

本次 PRD 从“通用新闻线索看板”升级为“深圳本地媒体报料数据驾驶舱 H5”。所有赛题功能需求均视为必须实现，不再把自定义日期、导出、图表交互、区域分布当作可选加分项。

CEO Review 选择的产品方向：

- 不做泛泛的大屏装饰，做新闻编辑室真正会用的线索分诊台。
- 不做真实 GIS 地图依赖，用深圳真实区划 + 热区矩阵完成区域分析，降低实现风险。
- 不做后端和 AI 总结接口，用前端规则聚合生成态势摘要、优先级预警、数据口径说明。
- 不使用广州、天河等非深圳数据。所有区划、街道、新闻样本、平台来源必须切到深圳。

最终页面要让评委在 30 秒内看见：

1. 深圳今日报料态势。
2. 哪个区、哪个渠道、哪类线索最值得优先看。
3. 线索处理效率有没有积压。
4. 明细能否筛选、排序、展开、导出。
5. 数据是否像真实深圳媒体业务，而不是随机假数据。

## 2. 赛题要求拆解

### 2.1 原题硬需求

来自 `challenge-topics.html` 题目 1：

| 赛题要求 | 本项目实现口径 | 是否必须 |
| --- | --- | --- |
| 核心指标卡 KPI | 今日报料数、本周总量、平均处理时长、处理完成率 / 采用率；每卡带环比箭头和 sparkline | 必须 |
| 全局概览图 | 来源渠道占比 + 深圳区划热区矩阵 + 类型分布 | 必须 |
| 趋势分析面板 | 近 7 日 / 近 30 日 / 自定义范围趋势，支持日/周/月粒度，叠加处理完成率双轴 | 必须 |
| 报料详情列表 | 状态、类型、来源、区域、日期范围筛选；排序、分页、行展开 | 必须 |
| 数据工具栏 | CSV 导出、刷新按钮、今天/本周/本月/自定义时间范围 | 必须 |
| 前端模拟数据 | 不少于 30 条，本项目要求 180 天 600 条以上深圳本地线索 | 必须 |
| 3+ 图表类型 | 本项目要求 5 类图表或可视化组件，且均有 tooltip 或点击联动 | 必须 |
| H5 可访问 | `/dashboard/news-tips` 可直接访问，移动端 375px 可用 | 必须 |

### 2.2 评分导向

| 评分项 | 分值 | 本项目拿高分的方式 |
| --- | --- | --- |
| 信息架构与数据层次 | 30 | KPI -> 态势摘要 -> 概览 -> 趋势 -> 明细 -> 导出，形成完整数据故事线 |
| 可视化图表品质 | 20 | sparkline、环形图、条形图、双轴趋势图、深圳区划热区矩阵，全部有标注和交互 |
| 交互操作体验 | 20 | 时间切换、自定义日期、刷新、图表下钻、筛选 chip、排序、分页、行展开、CSV 导出 |
| 数据丰富度与真实感 | 15 | 深圳真实区划、真实新闻平台来源、真实报道题材抽象、街道/地点/处置单位/处理轨迹 |
| UI 设计与排版品质 | 15 | 专业数据产品信息密度，首屏有判断，不做营销 Hero，不堆装饰 |
| 附加加分 | +5 | 4 类以上图表均可交互，图表点击能驱动明细筛选 |

## 3. 深圳本地化事实源

### 3.1 区划来源

深圳市民政局 2026-05-06 的行政区划信息显示，深圳下辖 9 个行政区和大鹏新区 1 个功能区，共 74 个街道。深圳政府在线也列出 9 个行政区和 1 个新区，并说明深汕特别合作区于 2018-12-16 揭牌。

本项目主驾驶舱区划必须使用：

| 区域 | 类型 | 可用于 mock 的街道样例 |
| --- | --- | --- |
| 福田区 | 行政区 | 福田、华强北、香蜜湖、梅林、莲花、福保 |
| 罗湖区 | 行政区 | 东门、黄贝、翠竹、笋岗、莲塘、清水河 |
| 盐田区 | 行政区 | 沙头角、海山、盐田、梅沙 |
| 南山区 | 行政区 | 南山、粤海、蛇口、招商、西丽、桃源 |
| 宝安区 | 行政区 | 新安、西乡、福永、沙井、松岗、石岩 |
| 龙岗区 | 行政区 | 布吉、坂田、龙城、横岗、平湖、南湾 |
| 龙华区 | 行政区 | 民治、龙华、大浪、观澜、观湖、福城 |
| 坪山区 | 行政区 | 坪山、坑梓、马峦、碧岭、石井、龙田 |
| 光明区 | 行政区 | 公明、光明、新湖、凤凰、玉塘、马田 |
| 大鹏新区 | 功能区 | 葵涌、大鹏、南澳 |
| 深汕特别合作区 | 特别合作区 | 小漠、鹅埠、鲘门、赤石 |

实现要求：

- 热区矩阵默认展示前 10 个：9 个行政区 + 大鹏新区。
- 深汕特别合作区作为“跨域线索 / 应急事件”补充区域，可进入表格和趋势，但不强制进入首屏热区前 10。
- 代码中不得出现 `天河区`、`越秀区`、`海珠区`、`荔湾区` 等广州区划。

### 3.2 深圳新闻平台来源

本项目模拟数据不直接复制新闻全文，只从公开深圳新闻平台抽象题材、地点、渠道和处置关系。

| 来源平台 | 可映射的数据字段 | 用途 |
| --- | --- | --- |
| 深圳新闻网 | `sourcePlatform=深圳新闻网`、`sourceUrl`、`referenceTopic` | 本地新闻与问政线索样本 |
| 问政深圳 | `reportChannel=问政深圳报料小程序 / 问政热线 / 报料QQ` | 民生投诉、部门回应、处理轨迹 |
| 读特客户端 | `sourcePlatform=读特客户端` | 交通、突发、民生深度报道样本 |
| 深圳特区报 | `sourcePlatform=深圳特区报` | 应急、城市治理、政策类线索 |
| 深圳商报 / 读创 | `sourcePlatform=读创 / 深圳商报` | 商圈、消费、营商环境类线索 |
| 晶报 APP | `sourcePlatform=晶报APP` | 城市生活、社区、消费类线索 |
| 深圳广电 / 壹深圳 | `sourcePlatform=壹深圳` | 视频报料、现场采访、突发直播线索 |
| 南方+深圳频道 | `sourcePlatform=南方+深圳` | 区域民生、政务回应补充样本 |

### 3.3 已抓取/参考的深圳报道题材

| 参考题材 | 来源 | 抽象后的 mock 用途 |
| --- | --- | --- |
| 龙岗布吉小区排水设施老化、污水渗漏、街道回应 | 深圳新闻网 / 问政深圳 | 民生投诉、环境城建、龙岗区布吉街道、部门回应 |
| 多个医院和商圈周边出租车占道候客导致拥堵 | 读特客户端 / 深圳新闻网 | 交通出行、福田区 / 南山区商圈、交警处置 |
| 暴雨红色预警、地铁出入口支援、交警疏导、深汕内涝救援 | 深圳特区报 / 深圳新闻网 | 突发事件、应急处置、深汕特别合作区 |
| 光明区强降雨防御、积水点和内涝点处置 | 深圳新闻网 | 突发事件、光明区、水务 / 应急处置 |
| 问政深圳简报中宝安、罗湖、龙岗等民生诉求 | 深圳新闻网 / 问政深圳 | 多区民生投诉、部门分拨、回应闭环 |

数据生成要求：

- 标题必须像深圳本地新闻线索，例如“龙岗区布吉街道一小区排水设施老化引发投诉”。
- 每条记录必须带 `sourcePlatform` 和可选 `sourceUrl`。
- 每条记录必须带 `district`，至少 80% 记录带 `street` 或 `locationName`。
- 数据可以是模拟线索，但题材必须来自真实深圳新闻报道类型。
- 不得伪造“已真实发布”的具体新闻结论，字段名用 `referenceTopic` 表示题材参考。

## 4. 用户与使用场景

| 用户角色 | 首要问题 | 页面必须支持的动作 |
| --- | --- | --- |
| 新闻运营人员 | 今日报料是否积压，哪些线索先分诊 | 看 KPI、态势摘要、一键筛高优先级 |
| 编辑室负责人 | 哪类线索、哪个区、哪个平台正在升温 | 看类型分布、渠道占比、深圳区划热区、趋势 |
| 记者 / 编辑 | 具体哪条线索值得跟进，处置轨迹是什么 | 筛选、排序、展开详情、查看时间线 |
| 管理人员 | 处理效率和采用转化是否健康 | 看平均处理时长、处理完成率、采用率、导出报表 |
| 评委 | 是否完成题目、是否专业、数据是否真实 | 30 秒内看懂层次、交互、数据来源和移动端效果 |

## 5. 信息架构

页面按“先判断，再解释，最后下钻”的顺序组织。

```text
PageContainer
  Header / Toolbar
    时间范围：今天 / 本周 / 本月 / 自定义
    刷新
    导出当前结果
    主题切换

  Layer 1: KPI
    今日报料数
    本周总量
    平均处理时长
    处理完成率 / 线索采用率

  Layer 2: 运营态势摘要
    今日优先处理什么
    哪个区异常
    哪个类型或渠道升温

  Layer 3: 概览分布
    来源渠道占比
    线索类型分布
    深圳区划热区矩阵
    处理状态进度

  Layer 4: 趋势分析
    报料量
    处理完成率
    采用率
    粒度：日 / 周 / 月

  Layer 5: 明细下钻
    筛选 chips
    表格
    行展开
    处理轨迹
    CSV 导出
```

首屏排序：

1. 工具栏和更新时间。
2. KPI 四卡。
3. 态势摘要三条。
4. 来源渠道 + 深圳区划热区。
5. 下方继续展示趋势和明细。

移动端排序：

1. 工具栏折叠为两行。
2. KPI 两列或单列。
3. 态势摘要横向可滚或纵向三卡。
4. 图表单列。
5. 表格横向滚动，核心列固定展示。

## 6. 必须实现的功能需求

### 6.1 顶栏工具区

| 功能 | 验收要求 |
| --- | --- |
| 时间范围快捷选择 | 支持今天、本周、本月、自定义；变化后图表和明细联动 |
| 自定义日期范围 | 可选择起止日期；无数据时显示空状态，不报错 |
| 刷新按钮 | 触发 `newsTipKeys.all` 查询失效；按钮有 loading |
| 最后更新时间 | 展示当前数据生成/刷新时间 |
| 主题切换 | 复用项目主题系统 |
| 导出入口 | 导出当前筛选结果，不是全量固定数据 |

### 6.2 KPI 指标卡

每张卡必须包含：

- 指标名称。
- 主数值。
- 环比箭头。
- 环比文案。
- sparkline 迷你趋势。
- 口径 tooltip。

| 指标 | 计算口径 |
| --- | --- |
| 今日报料数 | 今日 00:00 至当前的记录数 |
| 本周总量 | 本周一 00:00 至当前的记录数 |
| 平均处理时长 | 非待审核线索从提交到首次审核 / 跟进的平均分钟数 |
| 处理完成率 | 已采用 + 不予采用 / 当前范围全部线索 |
| 线索采用率 | 已采用 / (已采用 + 不予采用)，可作为卡片副指标或 tooltip |

### 6.3 运营态势摘要

态势摘要是本项目拿信息架构高分的关键。它把图表数据转成编辑室可行动判断。

| 摘要类型 | 触发规则 | 点击动作 |
| --- | --- | --- |
| 待审核压力 | 待审核占比超过 40%，或高优先级线索超过 5 条 | 筛选 `status=待审核` 或 `priority=high` |
| 区域高发 | 某区线索数占比第一，且高于第二名 20% | 筛选该区 |
| 类型升温 | 某类型较上一周期增长超过 20% | 筛选该类型 |
| 渠道异常 | 某平台 / 渠道当天线索占比异常升高 | 筛选该渠道 |
| 响应变慢 | 平均处理时长较上一周期上升超过 10% | 按响应时长降序 |
| 突发事件 | 突发事件未完成线索大于 0 | 筛选突发事件 + 高优先级 |

验收：

- 有数据时展示 3 条。
- 每条必须包含“发现了什么”和“建议做什么”。
- 可点击摘要必须产生筛选或排序变化。
- 无异常时展示“当前态势平稳，暂无明显异常”，不能留空。

### 6.4 概览图表

| 可视化 | 类型 | 展示数据 | 必须交互 |
| --- | --- | --- | --- |
| KPI sparkline | 迷你面积 / 折线 | 近 14 日或近 8 周走势 | hover tooltip |
| 来源渠道占比 | 环形图 | 深圳新闻网、读特、问政深圳、热线、短视频等来源占比 | hover + 点击筛选 |
| 线索类型分布 | 条形图 | 突发、民生、交通、环境、文体、其他；总量 + 已采用 | hover + 点击筛选 |
| 深圳区划热区矩阵 | 热力格 / 紧凑榜单 | 福田、罗湖、盐田、南山、宝安、龙岗、龙华、坪山、光明、大鹏 | hover + 点击筛选 |
| 趋势分析 | 双轴折线 | 报料量 + 处理完成率 / 采用率 | 粒度切换 + tooltip |
| 处理状态进度 | 横向堆叠条或小漏斗 | 待审核、跟进中、已采用、不予采用 | 点击筛选状态 |

区划热区矩阵要求：

- 不引入地图包。
- 颜色深浅表达线索密度。
- 卡片内显示总量、待审核数、采用率。
- 高待审核区域显示克制的 warning 标识。
- 点击区域后明细表联动并出现筛选 chip。

### 6.5 趋势分析

| 功能 | 验收要求 |
| --- | --- |
| 时间粒度切换 | 支持日、周、月 |
| 范围联动 | 受今天、本周、本月、自定义影响 |
| 双轴对比 | 左轴报料量，右轴处理完成率或采用率 |
| tooltip | 同时展示线索数、完成率、采用率 |
| 空状态 | 当前范围无数据时显示说明和重置入口 |

### 6.6 明细列表

表格字段必须包含：

| 字段 | 展示方式 |
| --- | --- |
| 编号 | `SZ-BL-YYYYMMDD-001` |
| 标题 | 截断 + tooltip |
| 来源平台 | Badge，如深圳新闻网、读特客户端、问政深圳 |
| 报料渠道 | Badge，如报料小程序、新闻热线、微信公众号、短视频平台 |
| 类型 | Badge |
| 区域 | 区 + 街道 |
| 状态 | 分色 Badge |
| 优先级 | 高 / 中 / 低 + 命中原因 |
| 报料时间 | 日期时间 |
| 处理时长 | 分钟，待审核显示 `-` |
| 跟进人 | 记者 / 编辑 |

表格能力必须包含：

- 状态筛选。
- 类型筛选。
- 来源平台筛选。
- 报料渠道筛选。
- 深圳区域筛选。
- 优先级筛选。
- 日期范围筛选。
- 报料时间排序。
- 处理时长排序。
- 优先级排序。
- 分页。
- 行 hover 高亮。
- 行展开详情。
- 空状态和清空筛选入口。

行展开详情必须包含：

- 线索描述。
- 参考新闻题材来源。
- 报料人脱敏信息。
- 地点：区、街道、地点名称。
- 处理轨迹：提交、分拨、审核、跟进、采用 / 不采用。
- 优先级命中原因。

### 6.7 CSV 导出

导出当前筛选后的表格结果。

验收：

- UTF-8 with BOM。
- 文件名：`深圳报料线索_YYYYMMDD_HHmm.csv`。
- 顶部写入导出时间、筛选条件、记录数、数据口径。
- 字段包含编号、标题、来源平台、报料渠道、类型、区域、街道、状态、优先级、报料时间、处理时长、跟进人、描述。
- 0 条结果时禁用导出或给出明确提示。
- Excel 打开中文不乱码。

### 6.8 图表联动与筛选 chips

| 交互 | 行为 |
| --- | --- |
| 点击来源环形图 | 设置 `sourcePlatform` 或 `channel` 筛选 |
| 点击类型条形图 | 设置 `category` 筛选 |
| 点击区划热区 | 设置 `district` 筛选 |
| 点击状态进度条 | 设置 `status` 筛选 |
| 点击态势摘要 | 设置筛选或排序 |
| 点击 chip 关闭 | 移除单个筛选，不影响其他筛选 |
| 点击清空全部 | 保留时间范围，清除其他筛选 |

筛选状态必须有用户可见反馈：

- 顶栏下方显示 chips。
- 被选中的图表元素保持高亮。
- 未选中图表元素降低透明度。
- 表格标题显示“当前筛选 N 条 / 当前范围 M 条 / 全量 T 条”。

### 6.9 线索优先级预警

优先级由前端规则派生，不声称替代编辑判断。

| 优先级 | 规则 | 展示 |
| --- | --- | --- |
| 高 | 突发事件未完成；待审核超过 60 分钟；处理时长超过 240 分钟；暴雨、火情、交通事故、内涝等应急标签 | 红色 Badge，文案“需优先处理” |
| 中 | 跟进中超过 180 分钟；民生投诉 / 环境城建来自问政深圳、热线或报料小程序；同一区同类线索当日超过 3 条 | 橙色 Badge，文案“持续跟进” |
| 低 | 已采用、不予采用，或无异常命中 | 灰色 Badge，文案“常规” |

验收：

- 表格默认按优先级、报料时间排序。
- 行展开展示命中原因。
- 态势摘要可引用高优先级数量。
- 规则说明可在 UI 中查看。

## 7. 数据模型

### 7.1 枚举

```typescript
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
```

### 7.2 线索记录字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | `SZ-BL-20260704-001` |
| `title` | string | 是 | 报料标题 |
| `description` | string | 是 | 线索详情 |
| `category` | NewsTipCategory | 是 | 线索类型 |
| `sourcePlatform` | NewsTipSourcePlatform | 是 | 深圳新闻平台来源 |
| `channel` | NewsTipChannel | 是 | 报料入口 |
| `status` | NewsTipStatus | 是 | 处理状态 |
| `district` | ShenzhenDistrict | 是 | 深圳真实区划 |
| `street` | string | 建议 | 街道 |
| `locationName` | string | 建议 | 地点，如深圳北站、华强北、布吉茂宝大厦 |
| `reporter` | string | 是 | 脱敏报料人 |
| `assignee` | string | 是 | 跟进记者 / 编辑 |
| `department` | string | 建议 | 相关处置单位，如街道办、交警、水务、应急 |
| `createdAt` | string | 是 | ISO 时间 |
| `firstResponseAt` | string \| null | 否 | 首次响应时间 |
| `responseMinutes` | number \| null | 否 | 待审核为空 |
| `referenceTopic` | string | 是 | 来源报道题材摘要 |
| `sourceUrl` | string \| null | 否 | 公开来源链接 |
| `riskTags` | string[] | 是 | 如暴雨、内涝、交通拥堵、消防隐患 |
| `timeline` | TimelineEntry[] | 是 | 处理轨迹 |

### 7.3 派生数据

| 数据 | 来源 | 用途 |
| --- | --- | --- |
| `priorityLevel` | 状态、类型、时长、风险标签 | 表格排序、预警 |
| `priorityReason` | 优先级规则 | 行展开说明 |
| `districtStats` | district 聚合 | 深圳区划热区矩阵 |
| `sourceStats` | sourcePlatform / channel 聚合 | 来源图表 |
| `statusStats` | status 聚合 | 处理状态进度 |
| `insightItems` | KPI + 聚合结果 | 运营态势摘要 |
| `filteredCount` | 当前筛选结果 | 表格标题、导出摘要 |

### 7.4 模拟数据规模与分布

必须生成 180 天、600 条以上记录。

| 维度 | 要求 |
| --- | --- |
| 区域覆盖 | 9 个行政区 + 大鹏新区必须都有数据，深汕可有应急数据 |
| 类型覆盖 | 每类不少于 30 条，突发和民生需有明显波动 |
| 来源覆盖 | 深圳新闻网、问政深圳、读特客户端必须都有数据 |
| 状态覆盖 | 待审核、跟进中、已采用、不予采用均有足量样本 |
| 时间分布 | 工作日高于周末，早晚高峰和天气事件有峰值 |
| 今日数据 | 至少 12 条，待审核比例更高 |
| 处理轨迹 | 非待审核记录至少 2 条轨迹，已采用记录至少 4 条轨迹 |
| 地点真实感 | 至少 50% 记录出现深圳真实地点或街道名 |

## 8. 技术落地方案

### 8.1 路由

| 路由 | 文件 | 要求 |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | 重定向到 `/dashboard/news-tips` |
| `/dashboard/news-tips` | `src/app/dashboard/news-tips/page.tsx` | 总览驾驶舱：KPI、态势摘要、关键概览、待处理线索预览，评委 30 秒内看懂 |
| `/dashboard/news-tips/analytics` | `src/app/dashboard/news-tips/analytics/page.tsx` | 数据仪表盘：来源、类型、状态、深圳区划热区、趋势粒度分析 |
| `/dashboard/news-tips/records` | `src/app/dashboard/news-tips/records/page.tsx` | 线索明细台：全量筛选、排序、分页、行展开、CSV 导出 |
| `/dashboard/design` | `src/app/dashboard/design/page.tsx` | 设计规范页，可保留，但不能影响主流程 |

页面拆分原则：

- 整套系统叫“深圳报料驾驶舱”，不是单一孤立页面。
- 总览页保留首屏判断能力，不能因为拆页导致 30 秒内看不见态势。
- 仪表盘页承载图表密度，避免总览页过长。
- 明细页承载表格重交互，避免移动端首屏被表格拖慢。
- 三个业务页共享同一套 `news-tips` 本地 mock service、nuqs 筛选参数和导出逻辑。

### 8.2 Feature 模块

```text
src/features/news-tips/
  api/
    types.ts
    service.ts
    queries.ts
  constants/
    options.ts
  components/
    section-nav.tsx
    cockpit.tsx
    analytics-dashboard.tsx
    records-workbench.tsx
    toolbar.tsx
    kpi-cards.tsx
    insight-strip.tsx
    channel-pie.tsx
    category-bar.tsx
    district-heat-grid.tsx
    status-progress.tsx
    trend-chart.tsx
    active-filters.tsx
    records-table/
      index.tsx
  hooks/
    use-news-tip-params.ts
  lib/
    search-params.ts
  utils/
    analytics.ts
    export-csv.ts
```

### 8.3 项目约束

- 页面头部必须使用 `PageContainer` 的 `pageTitle`、`pageDescription`、`pageHeaderAction`。
- 图标只能通过 `import { Icons } from '@/components/icons'` 使用。
- 数据访问必须走 `api/types.ts -> api/service.ts -> api/queries.ts`。
- React Query 使用 `queryOptions`，服务端预取使用 `void queryClient.prefetchQuery()`。
- URL 状态使用 nuqs，至少保存 `range`、`granularity`、自定义日期。
- className 合并使用 `cn()`。
- shadcn/ui 基础组件不直接改源码。
- 纯前端 mock，不新增后端接口、不新增 Route Handler、不使用 Server Action、不引入数据库、不调用 BFF 或外部接口。
- `src/features/news-tips/api/service.ts` 只是本地 deterministic mock service，所有聚合、优先级、态势摘要、筛选和导出都基于本地数组完成。
- 最终必须支持 Next.js 纯静态导出；`NEXT_STATIC_EXPORT=true` 时 `next.config.ts` 使用 `output: 'export'`，图片使用 `unoptimized`，Sentry tunnel / rewrite 关闭。
- 与驾驶舱无关的模板示例 API Route 如果阻碍 static export，应在最终清理中移除或禁用。

## 9. 当前实现差距

截至本 PRD 更新时，工作树里已存在 `src/features/news-tips/` 实现，但与新方向存在差距：

| 差距 | 影响 | 必须处理 |
| --- | --- | --- |
| `NEWS_TIP_DISTRICTS` 仍是广州区划，如天河、越秀、海珠 | 直接破坏深圳真实感评分 | 必须替换为深圳区划 |
| 数据模型缺少 `sourcePlatform`、`street`、`locationName`、`sourceUrl`、`referenceTopic` | 数据层次不够，无法说明来源真实感 | 必须补字段 |
| 渠道仍是泛渠道，没有区分深圳新闻网、问政深圳、读特等平台 | 无法体现深圳新闻平台抓取 | 必须补来源平台维度 |
| 时间范围缺少自定义日期 | 原题工具栏要求未完整闭环 | 必须补 |
| 旧设计文档仍写“广电媒体”泛场景 | 与深圳本地化目标不一致 | 建议同步更新或以本 PRD 为准 |
| 代码中标题模板偏通用 | 真实感不足 | 必须替换为深圳街道、地点、题材 |

## 10. 验收标准

### 10.1 功能验收

- `/dashboard/news-tips` 可直接访问。
- `/dashboard/news-tips/analytics` 和 `/dashboard/news-tips/records` 可通过侧边栏或页内导航访问。
- `/` 可进入驾驶舱。
- KPI 四卡完整展示，且有环比和 sparkline。
- 至少 5 类可视化展示：sparkline、环形图、条形图、区划热区、双轴趋势，可加状态进度条。
- 今天、本周、本月、自定义日期范围均可用。
- 日/周/月粒度切换可用。
- 图表 hover 有 tooltip。
- 来源、类型、区划、状态图表点击可筛选明细。
- 明细表支持筛选、排序、分页、展开。
- 筛选 chips 可单独清除和全部清空。
- CSV 导出当前筛选结果，中文不乱码。
- 空状态可恢复。

### 10.2 数据验收

- 数据总量 600 条以上。
- 当前范围至少 30 条可分析数据。
- 深圳 9 个行政区 + 大鹏新区都有数据。
- 不出现广州或其他城市区划。
- 至少 8 个深圳新闻平台 / 报料入口维度。
- 每条记录有区、来源平台、类型、状态、时间、处理轨迹。
- 至少 50% 记录带深圳街道或地点。
- 至少 20 条记录带 `sourceUrl` 或 `referenceTopic`。

### 10.3 响应式验收

- 375px 手机视口无文字重叠。
- 768px 平板视口图表不挤压。
- 1440px 桌面视口首屏能看到 KPI、态势摘要和至少两个概览图。
- 表格在手机上横向滚动，不撑破页面。
- 图表固定高度，加载和空状态不导致布局跳动。

### 10.4 构建验收

- `bun run build` 无错误。
- `NEXT_PUBLIC_SENTRY_DISABLED=true NEXT_STATIC_EXPORT=true bun run build` 可生成纯静态构建产物。
- `bun run lint` 无新增错误。
- 浏览器控制台无运行时报错。

## 11. 风险与处理

| 风险 | 影响 | 处理 |
| --- | --- | --- |
| 深圳新闻素材抓取过度，变成版权复制 | 文档和数据不安全 | 只抽象题材、地点、类型，不复制长段正文 |
| 自定义日期实现拖慢 | 工具栏硬需求缺失 | 先实现日期输入或 popover 简版，不追求复杂日历 |
| 数据字段增加导致组件改动多 | 实现成本上升 | service 层统一 enrich，组件只读稳定字段 |
| 图表联动状态混乱 | 用户不知道当前筛选 | active chips + 图表选中态 + 清空入口 |
| 热区矩阵不像地图 | 评委误解区域能力不足 | 标题明确“深圳区划热区”，卡片展示区、街道、密度和待审核 |
| 移动端表格难用 | H5 评分下降 | 核心列前置，外层横向滚动，展开详情纵向阅读 |
| 预警规则像黑盒 | 用户不信任 | 行展开和 tooltip 展示命中原因 |

## 12. 实施任务

所有任务都必须完成。优先级只表示执行顺序，不表示可删减。

- [ ] **T1 (P0, human: ~45min / CC: ~8min)** - 数据本地化 - 替换深圳区划和街道常量
  - Files: `src/features/news-tips/constants/options.ts`
  - Verify: 页面和导出中不出现广州区划。

- [ ] **T2 (P0, human: ~60min / CC: ~12min)** - 数据模型 - 增加深圳新闻来源字段
  - Files: `src/features/news-tips/api/types.ts`, `src/features/news-tips/api/service.ts`
  - Verify: 每条线索有 `sourcePlatform`、`referenceTopic`，多数有 `street` / `locationName`。

- [ ] **T3 (P0, human: ~75min / CC: ~15min)** - mock 数据 - 用深圳新闻题材重写模板池
  - Files: `src/features/news-tips/api/service.ts`
  - Verify: 至少 600 条深圳本地线索，覆盖 10 个区划展示项。

- [ ] **T4 (P0, human: ~45min / CC: ~10min)** - 时间工具栏 - 补自定义日期范围
  - Files: `src/features/news-tips/hooks/use-news-tip-params.ts`, `src/features/news-tips/lib/search-params.ts`, `src/features/news-tips/components/toolbar.tsx`
  - Verify: 自定义起止日期能过滤图表和表格。

- [ ] **T5 (P0, human: ~60min / CC: ~12min)** - 图表联动 - 来源平台、类型、区划、状态点击筛选
  - Files: `src/features/news-tips/components/*`, `src/features/news-tips/utils/analytics.ts`
  - Verify: 点击后 chip 出现，表格数量变化。

- [ ] **T6 (P0, human: ~60min / CC: ~12min)** - 明细表 - 增加来源平台、街道、参考题材、优先级原因
  - Files: `src/features/news-tips/components/records-table/index.tsx`
  - Verify: 行展开能看见处理轨迹和来源说明。

- [ ] **T7 (P0, human: ~35min / CC: ~8min)** - CSV - 导出深圳本地字段和筛选摘要
  - Files: `src/features/news-tips/utils/export-csv.ts`
  - Verify: Excel 打开中文正常，顶部有筛选条件。

- [ ] **T8 (P0, human: ~45min / CC: ~10min)** - 响应式与空状态 - 完成 375/768/1440 验收
  - Files: `src/features/news-tips/components/*`
  - Verify: 无重叠、无横向页面溢出，表格可横向滚动。

## 13. 资料来源

- 深圳市民政局：行政区划信息概况，2026-05-06，https://mzj.sz.gov.cn/szmz/pc/bmxx/mzfwzy/xzqh/bmxx/content/post_2925240.html
- 深圳政府在线：区划，2025-08-08，https://www.sz.gov.cn/cn/zjsz/gl/content/post_12318787.html
- 深圳新闻网：首页与本地频道，https://www.sznews.com/
- 深圳新闻网 / 问政深圳：问政热线、报料 QQ、问政平台说明，https://www.sznews.com/zhuanti/content/mb/2024-01/11/content_30693784.htm
- 深圳新闻网：龙岗布吉小区排水设施投诉报道，https://www.sznews.com/news/content/2025-11/13/content_31773421.htm
- 深圳新闻网 / 读特客户端：出租车占道候客报道，https://www.sznews.com/news/content/2025-08/23/content_31672204.htm
- 深圳新闻网 / 深圳特区报：暴雨红色预警与应急处置报道，https://www.sznews.com/news/content/2026-06/18/content_32094995.htm
- 深圳报业集团：旗下媒体与融合平台介绍，https://szbyjt.sznews.com/
- 读特 App Store 页面：深圳特区报新闻客户端、问政模块、本地化功能说明，https://apps.apple.com/mo/app/%E8%AF%BB%E7%89%B9-%E6%B7%B1%E5%9C%B3%E7%83%AD%E7%82%B9%E6%96%B0%E9%97%BB/id1085925780

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
| --- | --- | --- | --- | --- | --- |
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR_WITH_TOOL_LIMIT | Full interactive AskUserQuestion workflow unavailable in this Codex tool context; applied CEO review rubric directly to PRD update |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | NOT RUN | Not requested for this PRD-only edit |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | NOT RUN | Required before implementation ship |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | NOT RUN | Recommended after Shenzhen-local UI implementation |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | NOT RUN | Not needed for current PRD edit |

- **CODEX:** Not run.
- **UNRESOLVED:** 0.
- **VERDICT:** CEO scope review cleared the PRD direction. Implementation must next replace the current Guangzhou mock data with Shenzhen区划、深圳新闻平台来源、自定义日期和完整图表联动 before shipping.
