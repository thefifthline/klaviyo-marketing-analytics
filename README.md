# thefifthline.D — Klaviyo Marketing Intelligence Dashboard

Phase 1 portfolio project built with Next.js App Router, TypeScript, Tailwind CSS 4, Recharts, and Lucide icons. Northline is a fictional home-goods store. **All data is sample/demo data. This project is independent of and not endorsed by Klaviyo.**

## Run locally

Use Node.js 22 LTS or newer and pnpm 11.19.0. If pnpm is missing, install it with `npm install --global pnpm@11.19.0`.

From this project folder:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:3000. No environment variables, API keys, account connections, or paid services are needed. A local development server remains private to this computer. Development uses file polling for compatibility with restrictive macOS file-watcher limits.

To run the production version:

```sh
pnpm build
pnpm start
```

Validation:

```sh
pnpm typecheck
pnpm test
```

## What is included

- Overview: attributed revenue, campaign and flow revenue, weighted open and click rates, daily revenue chart, revenue breakdown, and top performers.
- Campaigns: sortable performance table and individual reports with subject line, audience, engagement funnel, orders, delivery health, and revenue.
- Flows: sortable performance table, individual reports, and per-email step metrics.
- Shared last 7 / 30 / 90 demo days and validated custom date ranges. Filters persist during in-app navigation; a full reload resets to 30 days.
- Responsive desktop, tablet, and phone layouts; keyboard navigation; skip link; accessible daily chart data table; loading, error, not-found, and empty states.
- Deterministic sample data: 11 campaigns, 5 flows, 12 flow emails, and 90 days (June 26–September 23, 2026).

## Demo metric definitions

Revenue is integer cents in the data layer and displayed in USD. It represents fictional gross attributed order value before refunds/returns. Each order belongs to one message source so campaign + flow revenue equals total revenue before display rounding.

Open rate = summed unique-per-message opens / delivered messages. Click rate uses the same delivery denominator. These are weighted totals, not averages of campaign percentages or globally unique people. Real open rates can be distorted by privacy features.

Orders and revenue are recorded on order date; engagement is recorded on send date. Campaigns can receive attributed orders for two days after sending. Consequently, a narrow range can include revenue without deliveries. Undefined rates and revenue-per-recipient values display “—”. Rounded currency figures may differ by $1 when summed on screen.

Comparison revenue uses the immediately preceding range of equal length. It displays “No comparison available” if that range starts before the dataset or its revenue is zero. Demo days are anchored to September 23, 2026, not the computer's current date. All dates use UTC.

## Architecture and future Klaviyo connection

- `src/lib/data/types.ts`: provider contract and normalized dataset types.
- `src/lib/data/demo.ts`: deterministic fictional records; no personal information.
- `src/lib/data/provider.ts`: server-side integration entry point.
- `src/lib/data/analytics.ts`: shared filtering, sums, rates, dates, and chart aggregation.
- `src/components/workspace.tsx`: shared navigation and date-range state.
- `src/components/dashboard.tsx`: overview, lists, charts, and drill-down UI.
- `src/app/`: Next.js page routes, metadata, and error boundaries.

To add Klaviyo later, implement `AnalyticsProvider.getDataset()` in a server-only module, normalize API responses, and switch the provider. Keep credentials in server environment variables, never `NEXT_PUBLIC_*` variables or client components. Add authentication, account isolation, pagination, rate-limit handling, retries, runtime validation, and caching before serving real data. Revisit the root layout's loading strategy, static detail generation, and date bounds for live datasets. Replace demo banners and fictional status labels only once real data is in use. The current demo attribution model is intentionally not an implementation of Klaviyo attribution settings.

## Deploy to Vercel — only when you decide to

Nothing has been deployed or connected. To deploy later:

1. Put this project folder in your own GitHub repository (exclude `node_modules`, `.next`, and secrets; the included `.gitignore` covers these).
2. In Vercel, import that repository after reviewing the account and plan terms.
3. Select Next.js. Set Root Directory to this folder if it is nested in the repository.
4. Use Node.js 22.x, install command `pnpm install --frozen-lockfile`, and build command `pnpm build`. Leave Output Directory at its framework default.
5. No environment variables or custom domain are needed for this demo. Deploy only when you authorize it.

The application requires no paid integrations. Hosting eligibility and pricing are determined by the provider's current plan and use terms; this project makes no promise of permanent free hosting.

Official references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Tailwind with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs).
