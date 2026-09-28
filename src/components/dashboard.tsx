"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Mail,
  GitBranch,
  Info,
  TrendingUp,
  DollarSign,
  MousePointer2,
  Eye,
  ShoppingBag,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useWorkspace } from "./workspace";
import {
  dailySeries,
  dateLabel,
  filterRecords,
  money,
  number,
  percent,
  preset,
  previousRange,
  sum,
} from "@/lib/data/analytics";
import type { Channel, Counters, MarketingEntity } from "@/lib/data/types";
const rate = (a: number, b: number) =>
  b ? `${percent(a, b).toFixed(1)}%` : "—";
function DateFilter() {
  const { data, range, setRange } = useWorkspace();
  const [custom, setCustom] = useState(false);
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);
  const days =
    Math.round((Date.parse(range.to) - Date.parse(range.from)) / 86400000) + 1;
  const valid = from >= data.start && to <= data.end && from <= to;
  return (
    <div className="date-control">
      <div className="date-controls">
        <CalendarDays size={16} />
        <select
          aria-label="Date range"
          value={
            custom
              ? "custom"
              : range.to === data.end && [7, 30, 90].includes(days)
                ? String(days)
                : "custom"
          }
          onChange={(e) => {
            if (e.target.value === "custom") {
              setFrom(range.from);
              setTo(range.to);
              setCustom(true);
            } else {
              setRange(preset(data.end, Number(e.target.value)));
              setCustom(false);
            }
          }}
        >
          <option value="7">Last 7 demo days</option>
          <option value="30">Last 30 demo days</option>
          <option value="90">Last 90 demo days</option>
          <option value="custom">Custom range</option>
        </select>
        <button
          className="date-label"
          onClick={() => {
            setFrom(range.from);
            setTo(range.to);
            setCustom(!custom);
          }}
          aria-expanded={custom}
        >
          {dateLabel(range.from)} – {dateLabel(range.to)}, 2026
        </button>
      </div>
      {custom && (
        <form
          className="date-popover"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) {
              setRange({ from, to });
              setCustom(false);
            }
          }}
        >
          <strong>Explore the demo period</strong>
          <p>Jun 26 – Sep 23, 2026 · UTC</p>
          <label>
            From
            <input
              required
              type="date"
              min={data.start}
              max={to || data.end}
              value={from}
              onInput={(e) => setFrom(e.currentTarget.value)}
            />
          </label>
          <label>
            To
            <input
              required
              type="date"
              min={from || data.start}
              max={data.end}
              value={to}
              onInput={(e) => setTo(e.currentTarget.value)}
            />
          </label>
          {!valid && (
            <p role="alert">Choose a valid range within the demo period.</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              className="button secondary"
              onClick={() => setCustom(false)}
            >
              Cancel
            </button>
            <button disabled={!valid} className="button">
              Apply range
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
function Metric({
  label,
  value,
  icon: Icon,
  note,
  delta,
  hero = false,
}: {
  label: string;
  value: string;
  icon: typeof DollarSign;
  note: string;
  delta?: number | null;
  hero?: boolean;
}) {
  return (
    <div className={"metric " + (hero ? "metric-hero" : "")}>
      <div className="metric-label">
        {label}
        <Icon size={17} />
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-bottom">
        {delta !== undefined &&
          (delta === null ? (
            <span className="neutral">No comparison</span>
          ) : (
            <span className={delta >= 0 ? "positive" : "negative"}>
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)}%
            </span>
          ))}
        <span>{note}</span>
      </div>
    </div>
  );
}
function RevenueChart({
  entity,
  kind,
}: {
  entity?: MarketingEntity;
  kind?: Channel;
}) {
  const { data, range } = useWorkspace();
  const series = dailySeries(data, range, entity?.id).map((row) => ({
    ...row,
    campaign: kind === "flow" ? 0 : row.campaign,
    flow: kind === "campaign" ? 0 : row.flow,
  }));
  const channel = entity?.kind || kind;
  const ids = new Set(
    data.entities
      .filter((e) => !channel || e.kind === channel)
      .map((e) => e.id),
  );
  const total = sum(
    filterRecords(data, range, entity?.id).filter((r) => ids.has(r.entityId)),
  );
  return (
    <section className="panel revenue-panel">
      <div className="panel-heading">
        <div>
          <h2>Revenue over time</h2>
          <p>
            {entity
              ? "Attributed revenue across the selected period"
              : "How your email marketing is performing"}
          </p>
        </div>
        <div className="chart-legend">
          {(!channel || channel === "campaign") && (
            <span>
              <i className="legend-dot campaign-dot" />
              Campaigns
            </span>
          )}
          {(!channel || channel === "flow") && (
            <span>
              <i className="legend-dot flow-dot" />
              Flows
            </span>
          )}
        </div>
      </div>
      <div className="chart-total">
        {money(total.revenue)} <span>attributed revenue</span>
      </div>
      <div
        className="chart"
        role="img"
        aria-label={`Daily attributed revenue from ${dateLabel(range.from)} to ${dateLabel(range.to)}. Total ${money(total.revenue)}. Data table available below.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={series}
            margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="campaignFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7567d7" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#7567d7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="flowFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#98b759" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#98b759" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#edf0f3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={62}
              tick={{ fontSize: 12, fill: "#76808e" }}
              dy={9}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 12, fill: "#76808e" }}
              tickFormatter={(v) =>
                `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
              }
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e3e6eb",
                fontSize: 13,
              }}
              formatter={(value, name) => [
                money(Number(value) * 100),
                name === "campaign" ? "Campaigns" : "Flows",
              ]}
            />
            {(!channel || channel === "campaign") && (
              <Area
                isAnimationActive={false}
                dot={series.length === 1}
                type="monotone"
                dataKey="campaign"
                stroke="#7867d7"
                strokeWidth={2.5}
                fill="url(#campaignFill)"
              />
            )}
            {(!channel || channel === "flow") && (
              <Area
                isAnimationActive={false}
                dot={series.length === 1}
                type="monotone"
                dataKey="flow"
                stroke="#8aa64c"
                strokeWidth={2.5}
                fill="url(#flowFill)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className="chart-data">
        <summary>View daily revenue data</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date (UTC)</th>
                <th>Campaigns</th>
                <th>Flows</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {series.map((r) => (
                <tr key={r.date}>
                  <td>{dateLabel(r.date, true)}</td>
                  <td>{money(r.campaign * 100)}</td>
                  <td>{money(r.flow * 100)}</td>
                  <td>{money((r.campaign + r.flow) * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
function EntityIcon({ entity }: { entity: MarketingEntity }) {
  const Icon = entity.kind === "campaign" ? Mail : GitBranch;
  return (
    <span className={"entity-icon " + entity.accent}>
      <Icon size={17} />
    </span>
  );
}
function Ranking({ kind }: { kind: Channel }) {
  const { data, range } = useWorkspace();
  const entities = data.entities
    .filter((e) => e.kind === kind)
    .map((entity) => ({
      entity,
      metrics: sum(filterRecords(data, range, entity.id)),
    }))
    .filter((r) => r.metrics.sent || r.metrics.revenue)
    .sort((a, b) => b.metrics.revenue - a.metrics.revenue)
    .slice(0, 4);
  return (
    <section className="panel ranking">
      <div className="panel-heading">
        <div>
          <h2>Top {kind === "campaign" ? "campaigns" : "flows"}</h2>
          <p>Ranked by attributed revenue</p>
        </div>
        <Link className="text-link" href={"/" + kind + "s"}>
          View all <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="ranking-header">
        <span>{kind === "campaign" ? "CAMPAIGN" : "FLOW"}</span>
        <span>REVENUE</span>
      </div>
      {entities.length ? (
        entities.map(({ entity, metrics }) => (
          <Link
            className="ranking-row"
            key={entity.id}
            href={`/${kind}s/${entity.id}`}
          >
            <EntityIcon entity={entity} />
            <div className="ranking-name">
              <strong>{entity.name}</strong>
              <small>
                {kind === "campaign"
                  ? dateLabel(entity.sentAt!, true)
                  : `${entity.steps?.length} emails · Active`}
              </small>
            </div>
            <strong>{money(metrics.revenue)}</strong>
            <ChevronRight size={15} />
          </Link>
        ))
      ) : (
        <p className="empty">No {kind}s in this date range.</p>
      )}
    </section>
  );
}
function Mix() {
  const { data, range } = useWorkspace();
  const records = filterRecords(data, range);
  const campaignIds = new Set(
    data.entities.filter((e) => e.kind === "campaign").map((e) => e.id),
  );
  const campaign = sum(
    records.filter((r) => campaignIds.has(r.entityId)),
  ).revenue;
  const total = sum(records).revenue;
  const flow = total - campaign;
  const share = percent(flow, total);
  return (
    <section className="panel mix-panel">
      <div className="panel-heading">
        <div>
          <h2>Revenue breakdown</h2>
          <p>Every message has a role to play</p>
        </div>
      </div>
      <div
        className="donut"
        style={{
          background: total
            ? `conic-gradient(#aaca6c 0% ${share}%, #8172d8 ${share}% 100%)`
            : "#e7e9ed",
        }}
        role="img"
        aria-label={`Flows ${share.toFixed(1)} percent, campaigns ${percent(campaign, total).toFixed(1)} percent`}
      >
        <div>
          <span>TOTAL REVENUE</span>
          <strong>{money(total, true)}</strong>
          <small>Email marketing</small>
        </div>
      </div>
      <div className="mix-line">
        <span>
          <i className="legend-dot campaign-dot" />
          Campaigns
        </span>
        <strong>
          {money(campaign)}
          <small>{rate(campaign, total)}</small>
        </strong>
      </div>
      <div className="mix-line">
        <span>
          <i className="legend-dot flow-dot" />
          Flows
        </span>
        <strong>
          {money(flow)}
          <small>{rate(flow, total)}</small>
        </strong>
      </div>
      <div className="mix-note">
        <TrendingUp size={17} />
        <span>
          Automated flows account for <strong>{share.toFixed(0)}%</strong> of
          attributed revenue.
        </span>
      </div>
    </section>
  );
}
function Metrics({
  kind,
  entity,
}: {
  kind?: Channel;
  entity?: MarketingEntity;
}) {
  const { data, range } = useWorkspace();
  const ids = new Set(
    data.entities.filter((e) => !kind || e.kind === kind).map((e) => e.id),
  );
  const relevant = (r: ReturnType<typeof filterRecords>) =>
    r.filter((x) => ids.has(x.entityId));
  const current = sum(relevant(filterRecords(data, range, entity?.id)));
  const previous = previousRange(range);
  const before = sum(relevant(filterRecords(data, previous, entity?.id)));
  const delta =
    previous.from < data.start || !before.revenue
      ? null
      : ((current.revenue - before.revenue) / before.revenue) * 100;
  const campaigns = new Set(
    data.entities.filter((e) => e.kind === "campaign").map((e) => e.id),
  );
  const campaign = sum(
    filterRecords(data, range).filter((r) => campaigns.has(r.entityId)),
  ).revenue;
  return (
    <div className={"metrics-grid " + (kind || entity ? "four" : "")}>
      <Metric
        hero
        label="Attributed revenue"
        value={money(current.revenue)}
        icon={DollarSign}
        delta={delta}
        note={delta === null ? "available" : "vs. prior period"}
      />
      {!kind && !entity ? (
        <>
          <Metric
            label="Campaign revenue"
            value={money(campaign)}
            icon={Mail}
            note={`${rate(campaign, current.revenue)} of total revenue`}
          />
          <Metric
            label="Flow revenue"
            value={money(current.revenue - campaign)}
            icon={GitBranch}
            note={`${rate(current.revenue - campaign, current.revenue)} of total revenue`}
          />
        </>
      ) : (
        <Metric
          label="Placed orders"
          value={number(current.orders)}
          icon={ShoppingBag}
          note={`${money(current.orders ? current.revenue / current.orders : 0)} average order`}
        />
      )}
      <Metric
        label="Open rate"
        value={rate(current.opens, current.delivered)}
        icon={Eye}
        note={`${number(current.opens)} unique opens*`}
      />
      <Metric
        label="Click rate"
        value={rate(current.clicks, current.delivered)}
        icon={MousePointer2}
        note={`${number(current.clicks)} unique clicks*`}
      />
    </div>
  );
}
function EntityTable({ kind }: { kind: Channel }) {
  const { data, range } = useWorkspace();
  const [sort, setSort] = useState("revenue");
  const rows = data.entities
    .filter((e) => e.kind === kind)
    .map((entity) => ({
      entity,
      metrics: sum(filterRecords(data, range, entity.id)),
    }))
    .filter((r) => r.metrics.sent || r.metrics.revenue)
    .sort((a, b) =>
      sort === "name"
        ? a.entity.name.localeCompare(b.entity.name)
        : sort === "open"
          ? percent(b.metrics.opens, b.metrics.delivered) -
            percent(a.metrics.opens, a.metrics.delivered)
          : b.metrics.revenue - a.metrics.revenue,
    );
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>
            {kind === "campaign" ? "Campaign performance" : "Flow performance"}
          </h2>
          <p>
            {rows.length} {kind}s with activity in the selected period
          </p>
        </div>
        <label className="sort-label">
          Sort by{" "}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="revenue">Revenue</option>
            <option value="open">Open rate</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{kind === "campaign" ? "Campaign" : "Flow"}</th>
              <th>Status</th>
              <th>Delivered</th>
              <th>Open rate</th>
              <th>Click rate</th>
              <th>Orders</th>
              <th>Revenue</th>
              <th>Revenue / recipient</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ entity, metrics: m }) => (
              <tr key={entity.id}>
                <td>
                  <Link className="table-name" href={`/${kind}s/${entity.id}`}>
                    <EntityIcon entity={entity} />
                    <span>
                      <strong>{entity.name}</strong>
                      <small>
                        {kind === "campaign"
                          ? dateLabel(entity.sentAt!, true)
                          : entity.audience}
                      </small>
                    </span>
                  </Link>
                </td>
                <td>
                  <span className="status">{entity.status}</span>
                </td>
                <td>{number(m.delivered)}</td>
                <td>{rate(m.opens, m.delivered)}</td>
                <td>{rate(m.clicks, m.delivered)}</td>
                <td>{m.orders}</td>
                <td className="revenue-cell">{money(m.revenue)}</td>
                <td>
                  {m.delivered
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(m.revenue / m.delivered / 100)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <div className="empty">
          <Mail size={28} />
          <h3>No {kind}s in this range</h3>
          <p>Try a wider date range to explore the sample data.</p>
        </div>
      )}
    </section>
  );
}
function Engagement({ metrics: m }: { metrics: Counters }) {
  return (
    <section className="panel engagement">
      <div className="panel-heading">
        <div>
          <h2>Engagement funnel</h2>
          <p>Activity recorded in this date range</p>
        </div>
      </div>
      {[
        { name: "Delivered", n: m.delivered, base: m.sent },
        { name: "Opened", n: m.opens, base: m.delivered },
        { name: "Clicked", n: m.clicks, base: m.delivered },
        { name: "Placed order", n: m.orders, base: m.delivered },
      ].map((r, i) => (
        <div className="funnel-row" key={r.name}>
          <div>
            <span>{r.name}</span>
            <strong>
              {number(r.n)} <small>{rate(r.n, r.base)}</small>
            </strong>
          </div>
          <div className="funnel-track">
            <div
              style={{
                width: `${percent(r.n, m.delivered)}%`,
                background: ["#8172d8", "#9a8edf", "#b4a9e8", "#aaca6c"][i],
              }}
            />
          </div>
        </div>
      ))}
      <p className="muted text-sm">
        Opens, clicks and orders use delivered messages as the denominator.
        Delivery rate uses messages sent.
      </p>
    </section>
  );
}
function Detail({ entity }: { entity: MarketingEntity }) {
  const { data, range } = useWorkspace();
  const metrics = sum(filterRecords(data, range, entity.id));
  return (
    <>
      <div className="detail-summary panel">
        <EntityIcon entity={entity} />
        <div>
          <strong>
            {entity.kind === "campaign" ? entity.subject : entity.description}
          </strong>
          <p>
            {entity.audience}{" "}
            {entity.sentAt ? `· Sent ${dateLabel(entity.sentAt, true)}` : ""}
          </p>
        </div>
        <span className="status">{entity.status}</span>
      </div>
      <Metrics entity={entity} kind={entity.kind} />
      <div className="chart-grid">
        <RevenueChart entity={entity} />
        <Engagement metrics={metrics} />
      </div>
      {entity.steps && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Inside the flow</h2>
              <p>Performance of each automated email</p>
            </div>
            <span className="muted text-sm">{entity.steps.length} steps</span>
          </div>
          <div className="flow-steps">
            {entity.steps.map((step, i) => {
              const m = sum(
                filterRecords(data, range, entity.id).filter(
                  (r) => r.stepId === step.id,
                ),
              );
              return (
                <div className="flow-step" key={step.id}>
                  <div className="step-number">0{i + 1}</div>
                  <div className="step-copy">
                    <strong>{step.name}</strong>
                    <p>{step.timing}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>Delivered</dt>
                      <dd>{number(m.delivered)}</dd>
                    </div>
                    <div>
                      <dt>Open rate</dt>
                      <dd>{rate(m.opens, m.delivered)}</dd>
                    </div>
                    <div>
                      <dt>Click rate</dt>
                      <dd>{rate(m.clicks, m.delivered)}</dd>
                    </div>
                    <div>
                      <dt>Orders</dt>
                      <dd>{m.orders}</dd>
                    </div>
                    <div>
                      <dt>Revenue</dt>
                      <dd>{money(m.revenue)}</dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section className="panel delivery">
        <h2>Delivery & audience health</h2>
        <dl>
          <div>
            <dt>Messages sent</dt>
            <dd>{number(metrics.sent)}</dd>
          </div>
          <div>
            <dt>Delivery rate</dt>
            <dd>{rate(metrics.delivered, metrics.sent)}</dd>
          </div>
          <div>
            <dt>Undelivered</dt>
            <dd>{number(metrics.sent - metrics.delivered)}</dd>
          </div>
          <div>
            <dt>Unsubscribed</dt>
            <dd>
              {number(metrics.unsubscribes)}{" "}
              <small>({rate(metrics.unsubscribes, metrics.delivered)})</small>
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}
export function Dashboard({
  view = "overview",
  entityId,
}: {
  view?: "overview" | "campaigns" | "flows";
  entityId?: string;
}) {
  const { data, range } = useWorkspace();
  const entity = entityId
    ? data.entities.find((e) => e.id === entityId)
    : undefined;
  const title =
    entity?.name ||
    (view === "overview"
      ? "Performance overview"
      : view === "campaigns"
        ? "Campaigns"
        : "Flows");
  return (
    <>
      <div className="page-heading">
        <div>
          {entity ? (
            <Link className="back-link" href={"/" + view}>
              <ArrowLeft size={14} /> All {view}
            </Link>
          ) : (
            <div className="eyebrow">NORTHLINE ANALYTICS</div>
          )}
          <h1>
            {title}
            <span className="heading-dot">.</span>
          </h1>
          <p>
            {entity
              ? "A closer look at the messages behind the numbers."
              : view === "overview"
                ? "A clearer picture of your email marketing."
                : view === "campaigns"
                  ? "Every send, measured. See what resonates with your audience."
                  : "Always-on journeys. Understand what brings customers back."}
          </p>
        </div>
        <DateFilter />
      </div>
      <div className="demo-banner">
        <Info size={16} />
        <span>
          <strong>You’re exploring sample data.</strong> All brands, customers
          and results are fictional.
        </span>
        <span className="dataset-period">Jun 26 – Sep 23, 2026</span>
      </div>
      {entity ? (
        <Detail entity={entity} />
      ) : (
        <>
          <Metrics
            kind={
              view === "overview"
                ? undefined
                : view === "campaigns"
                  ? "campaign"
                  : "flow"
            }
          />
          {view === "overview" ? (
            <>
              <div className="ranking-grid">
                <Ranking kind="campaign" />
                <Ranking kind="flow" />
              </div>
              <div className="section-caption">
                <h2>The big picture</h2>
                <span>
                  {dateLabel(range.from)} – {dateLabel(range.to)} · Daily
                  performance
                </span>
              </div>
              <div className="chart-grid">
                <RevenueChart />
                <Mix />
              </div>
            </>
          ) : (
            <>
              <EntityTable kind={view === "campaigns" ? "campaign" : "flow"} />
              <div className="section-caption">
                <h2>Performance, over time</h2>
              </div>
              <RevenueChart kind={view === "campaigns" ? "campaign" : "flow"} />
            </>
          )}
        </>
      )}
      <details className="methodology">
        <summary>
          About these metrics <Info size={14} />
        </summary>
        <p>
          All revenue is fictional, email-attributed gross order value in USD,
          before returns or refunds. Each sample order belongs to one campaign
          or flow; totals never double-count orders. This is a demo attribution
          model, not a reproduction of Klaviyo’s attribution settings.
        </p>
        <p>
          * Opens and clicks are unique per message and summed across sends, not
          unique people across the period. Rates divide these totals by
          delivered emails. Privacy-protected opens can inflate real-world open
          rates. Revenue is recorded on order day; sends and engagement on send
          day, so a custom range can contain revenue without deliveries. Rates
          and revenue per recipient are unavailable when no deliveries are
          recorded. Currency values are rounded for display; small apparent
          total differences are rounding only.
        </p>
        <p>
          Comparisons use the immediately preceding period of equal length and
          are omitted when that period falls outside the sample dataset or has
          no revenue. Flow “Active” and campaign “Sent” describe fictional
          status as of Sep 23, 2026.
        </p>
      </details>
    </>
  );
}
