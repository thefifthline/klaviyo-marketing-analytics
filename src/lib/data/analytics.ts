import type { Counters, DailyRecord, Dataset, DateRange } from "./types";
export const emptyCounters = (): Counters => ({
  sent: 0,
  delivered: 0,
  opens: 0,
  clicks: 0,
  orders: 0,
  revenue: 0,
  unsubscribes: 0,
});
export function sum(records: Counters[]): Counters {
  return records.reduce((total, row) => {
    for (const key of Object.keys(total) as (keyof Counters)[])
      total[key] += row[key];
    return total;
  }, emptyCounters());
}
export function percent(part: number, total: number) {
  return total ? (part / total) * 100 : 0;
}
export function money(cents: number, compact = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(cents / 100);
}
export function number(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}
export function dateLabel(date: string, year = false) {
  return new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(year ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}
export function shift(date: string, days: number) {
  return new Date(Date.parse(date + "T00:00:00Z") + days * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function preset(end: string, days: number): DateRange {
  return { from: shift(end, 1 - days), to: end };
}
export function filterRecords(
  data: Dataset,
  range: DateRange,
  entityId?: string,
): DailyRecord[] {
  return data.records.filter(
    (r) =>
      r.date >= range.from &&
      r.date <= range.to &&
      (!entityId || r.entityId === entityId),
  );
}
export function previousRange(range: DateRange): DateRange {
  const days =
    Math.round((Date.parse(range.to) - Date.parse(range.from)) / 86400000) + 1;
  return { from: shift(range.from, -days), to: shift(range.from, -1) };
}
export function dailySeries(
  data: Dataset,
  range: DateRange,
  entityId?: string,
) {
  const rows = filterRecords(data, range, entityId);
  const campaigns = new Set(
    data.entities.filter((e) => e.kind === "campaign").map((e) => e.id),
  );
  const result = [];
  for (let date = range.from; date <= range.to; date = shift(date, 1)) {
    const current = rows.filter((r) => r.date === date);
    result.push({
      date,
      label: dateLabel(date),
      campaign:
        sum(current.filter((r) => campaigns.has(r.entityId))).revenue / 100,
      flow:
        sum(current.filter((r) => !campaigns.has(r.entityId))).revenue / 100,
    });
  }
  return result;
}
