import type { NewsTipFilterState } from './analytics';
import type { NewsTipRecordWithPriority } from '../api/types';

function csvEscape(value: string | number | null): string {
  if (value === null) return '';
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso));
}

function formatFilterSummary(filters: NewsTipFilterState): string {
  const entries = [
    ['状态', filters.status.join(' / ')],
    ['类型', filters.category.join(' / ')],
    ['平台', filters.sourcePlatform.join(' / ')],
    ['渠道', filters.channel.join(' / ')],
    ['区域', filters.district.join(' / ')],
    ['优先级', filters.priority.join(' / ')]
  ].filter(([, value]) => value);

  return entries.length === 0
    ? '无筛选，导出当前时间范围内全部结果'
    : entries.map(([label, value]) => `${label}:${value}`).join('；');
}

export function exportNewsTipsCsv(
  records: NewsTipRecordWithPriority[],
  filters: NewsTipFilterState
): void {
  if (records.length === 0) return;

  const now = new Date();
  const dateKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;

  const metaRows = [
    ['导出时间', now.toLocaleString('zh-CN')],
    ['筛选条件', formatFilterSummary(filters)],
    ['记录数', `${records.length}`],
    []
  ];

  const header = [
    '编号',
    '标题',
    '类型',
    '平台',
    '渠道',
    '区域',
    '状态',
    '优先级',
    '优先级原因',
    '报料时间',
    '响应时长(分钟)',
    '跟进人',
    '报料人',
    '描述'
  ];

  const dataRows = records.map((record) => [
    record.id,
    record.title,
    record.category,
    record.sourcePlatform,
    record.channel,
    record.district,
    record.status,
    record.priorityLabel,
    record.priorityReason,
    formatDateTime(record.createdAt),
    record.responseMinutes ?? '',
    record.assignee,
    record.reporter,
    record.description
  ]);

  const csv = [...metaRows, header, ...dataRows]
    .map((row) => row.map((value) => csvEscape(value)).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `报料线索_${dateKey}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
