import type {
  AnalyticsProvider,
  Dataset,
  MarketingEntity,
  DailyRecord,
} from "./types";

const campaigns: MarketingEntity[] = [
  [
    "autumn-edit",
    "The autumn edit",
    "2026-09-21",
    "A softer season starts at home",
    "Engaged subscribers",
    "ochre",
  ],
  [
    "weekend-reset",
    "Your weekend reset",
    "2026-09-17",
    "Small rituals. A little more calm.",
    "Home & living enthusiasts",
    "purple",
  ],
  [
    "linen-restock",
    "Back in stock: everyday linen",
    "2026-09-12",
    "Your favorite linen is back",
    "Linen interest segment",
    "blue",
  ],
  [
    "early-access",
    "A first look, just for you",
    "2026-09-08",
    "Meet the collection before everyone else",
    "VIP customers",
    "pink",
  ],
  [
    "september-notes",
    "September, thoughtfully curated",
    "2026-09-03",
    "New month. Fresh perspective.",
    "Engaged subscribers",
    "green",
  ],
  [
    "long-weekend",
    "The long weekend collection",
    "2026-08-28",
    "Make room for slow mornings",
    "Engaged subscribers",
    "ochre",
  ],
  [
    "last-light",
    "Last light of summer",
    "2026-08-20",
    "Summer favorites, one more time",
    "Summer shoppers",
    "blue",
  ],
  [
    "studio-notes",
    "Notes from the studio",
    "2026-08-10",
    "The details make the difference",
    "Engaged subscribers",
    "purple",
  ],
  [
    "july-favorites",
    "Your July favorites",
    "2026-07-25",
    "The pieces you keep coming back to",
    "Repeat customers",
    "pink",
  ],
  [
    "summer-table",
    "Set the summer table",
    "2026-07-15",
    "Good company starts here",
    "Kitchen & dining segment",
    "green",
  ],
  [
    "summer-launch",
    "The summer collection",
    "2026-07-03",
    "A lighter way to live",
    "Engaged subscribers",
    "ochre",
  ],
].map(([id, name, sentAt, subject, audience, accent]) => ({
  id,
  name,
  sentAt,
  subject,
  audience,
  accent,
  kind: "campaign",
  status: "Sent",
  description:
    "A curated email campaign from the fictional Northline home-goods store.",
}));
const flows: MarketingEntity[] = [
  {
    id: "welcome",
    kind: "flow",
    name: "Welcome series",
    description:
      "Introduce the brand and turn new subscribers into first-time customers.",
    audience: "New email subscribers",
    status: "Active",
    accent: "purple",
    steps: [
      {
        id: "hello",
        name: "A warm welcome",
        timing: "Immediately after signup",
      },
      { id: "story", name: "Meet Northline", timing: "1 day after signup" },
      {
        id: "first-order",
        name: "Your first order, on us",
        timing: "3 days after signup",
      },
    ],
  },
  {
    id: "abandoned-checkout",
    kind: "flow",
    name: "Abandoned checkout",
    description: "Help high-intent shoppers pick up where they left off.",
    audience: "Started checkout, no purchase",
    status: "Active",
    accent: "ochre",
    steps: [
      {
        id: "reminder",
        name: "You left something lovely",
        timing: "2 hours after checkout",
      },
      {
        id: "reassurance",
        name: "Made to be lived with",
        timing: "1 day after checkout",
      },
      {
        id: "last-call",
        name: "Still thinking it over?",
        timing: "3 days after checkout",
      },
    ],
  },
  {
    id: "browse",
    kind: "flow",
    name: "Browse abandonment",
    description:
      "Bring interested visitors back to the products they explored.",
    audience: "Viewed product, no checkout",
    status: "Active",
    accent: "blue",
    steps: [
      {
        id: "revisit",
        name: "Worth another look",
        timing: "4 hours after browsing",
      },
      {
        id: "inspiration",
        name: "A little inspiration",
        timing: "2 days after browsing",
      },
    ],
  },
  {
    id: "post-purchase",
    kind: "flow",
    name: "Post-purchase care",
    description: "Share care tips and help customers find their next favorite.",
    audience: "Recent purchasers",
    status: "Active",
    accent: "green",
    steps: [
      {
        id: "care",
        name: "Care for your favorites",
        timing: "7 days after purchase",
      },
      {
        id: "complement",
        name: "Better together",
        timing: "21 days after purchase",
      },
    ],
  },
  {
    id: "winback",
    kind: "flow",
    name: "Customer winback",
    description: "Reconnect with customers who have not ordered in a while.",
    audience: "No purchase in 90 days",
    status: "Active",
    accent: "pink",
    steps: [
      {
        id: "miss-you",
        name: "A lot has happened since",
        timing: "90 days after purchase",
      },
      {
        id: "return",
        name: "A reason to return",
        timing: "97 days after purchase",
      },
    ],
  },
];
function seed(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function counters(
  sent: number,
  openRate: number,
  clickRate: number,
  orderRate: number,
  n: number,
) {
  const delivered = Math.floor(sent * (0.979 + seed(n + 1) * 0.014));
  const opens = Math.floor(delivered * openRate);
  const clicks = Math.min(opens, Math.floor(delivered * clickRate));
  const orders = Math.min(clicks, Math.floor(delivered * orderRate));
  return {
    sent,
    delivered,
    opens,
    clicks,
    orders,
    revenue: orders * (7900 + Math.floor(seed(n + 2) * 6100)),
    unsubscribes: Math.floor(delivered * (0.001 + seed(n + 3) * 0.0012)),
  };
}
const records: DailyRecord[] = [];
for (let i = 0; i < 90; i++) {
  const date = new Date(Date.UTC(2026, 5, 26 + i)).toISOString().slice(0, 10);
  flows.forEach((flow, f) =>
    flow.steps!.forEach((step, s) => {
      const n = i * 23 + f * 101 + s * 19;
      const sent = Math.floor(
        (f === 0 ? 105 : f === 1 ? 72 : f === 2 ? 82 : f === 3 ? 68 : 45) *
          (1 - s * 0.23) *
          (0.78 + seed(n) * 0.55) *
          (0.83 + i / 330),
      );
      records.push({
        date,
        entityId: flow.id,
        stepId: step.id,
        ...counters(
          sent,
          0.43 + seed(n + 4) * 0.17,
          0.05 + seed(n + 5) * 0.055,
          (f === 1 ? 0.038 : f === 0 ? 0.029 : 0.019) * (1 - s * 0.13),
          n,
        ),
      });
    }),
  );
  campaigns.forEach((campaign, c) => {
    const age = Math.round(
      (Date.parse(date) - Date.parse(campaign.sentAt!)) / 86400000,
    );
    if (age >= 0 && age < 3) {
      const n = c * 213 + age;
      // Delivery/engagement are recorded on send day; later attributed orders appear on order day.
      const base = counters(
        8200 + c * 343,
        0.38 + seed(n + 6) * 0.12,
        0.025 + seed(n + 7) * 0.023,
        0.0045 + seed(n + 8) * 0.0035,
        n,
      );
      if (age === 0) records.push({ date, entityId: campaign.id, ...base });
      else {
        const orders = Math.floor(base.orders * (age === 1 ? 0.19 : 0.08));
        records.push({
          date,
          entityId: campaign.id,
          sent: 0,
          delivered: 0,
          opens: 0,
          clicks: 0,
          unsubscribes: 0,
          orders,
          revenue: orders * 9800,
        });
      }
    }
  });
}
export const demoDataset: Dataset = {
  source: "demo",
  currency: "USD",
  timezone: "UTC",
  start: "2026-06-26",
  end: "2026-09-23",
  entities: [...campaigns, ...flows],
  records,
};
export const demoProvider: AnalyticsProvider = {
  async getDataset() {
    return demoDataset;
  },
};
