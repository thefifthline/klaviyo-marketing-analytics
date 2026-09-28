export type Channel = "campaign" | "flow";
export interface Counters {
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  orders: number;
  revenue: number;
  unsubscribes: number;
}
export interface DailyRecord extends Counters {
  date: string;
  entityId: string;
  stepId?: string;
}
export interface MessageStep {
  id: string;
  name: string;
  timing: string;
}
export interface MarketingEntity {
  id: string;
  kind: Channel;
  name: string;
  description: string;
  audience: string;
  status: "Sent" | "Active";
  sentAt?: string;
  subject?: string;
  steps?: MessageStep[];
  accent: string;
}
export interface Dataset {
  source: "demo" | "klaviyo";
  currency: "USD";
  timezone: "UTC";
  start: string;
  end: string;
  entities: MarketingEntity[];
  records: DailyRecord[];
}
export interface DateRange {
  from: string;
  to: string;
}
/** Implement in a server-only module when adding authenticated Klaviyo access. */
export interface AnalyticsProvider {
  getDataset(): Promise<Dataset>;
}
