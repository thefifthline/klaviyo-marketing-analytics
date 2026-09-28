import test from "node:test";
import assert from "node:assert/strict";
import { demoDataset } from "./demo";
import {
  dailySeries,
  filterRecords,
  sum,
  preset,
  previousRange,
  percent,
} from "./analytics";
test("all revenue reconciles between channels, entities, and the daily chart", () => {
  for (const days of [7, 30, 90]) {
    const range = preset(demoDataset.end, days);
    const total = sum(filterRecords(demoDataset, range));
    assert.equal(
      demoDataset.entities.reduce(
        (n, e) => n + sum(filterRecords(demoDataset, range, e.id)).revenue,
        0,
      ),
      total.revenue,
    );
    const daily = dailySeries(demoDataset, range);
    assert.equal(daily.length, days);
    assert.equal(
      Math.round(daily.reduce((n, d) => n + d.campaign + d.flow, 0) * 100),
      total.revenue,
    );
  }
});
test("flow steps reconcile to each flow and valid counts never exceed their denominators", () => {
  for (const row of demoDataset.records) {
    assert.ok(row.delivered <= row.sent);
    assert.ok(row.opens <= row.delivered);
    assert.ok(row.clicks <= row.opens);
    assert.ok(row.unsubscribes <= row.delivered);
    assert.ok(Number.isInteger(row.revenue));
    assert.ok(row.revenue >= 0);
  }
  for (const flow of demoDataset.entities.filter((e) => e.kind === "flow")) {
    const rows = filterRecords(
      demoDataset,
      preset(demoDataset.end, 30),
      flow.id,
    );
    assert.equal(
      flow.steps!.reduce(
        (n, s) => n + sum(rows.filter((r) => r.stepId === s.id)).revenue,
        0,
      ),
      sum(rows).revenue,
    );
  }
});
test("date boundaries are inclusive and previous periods have equal length without overlap", () => {
  assert.deepEqual(preset("2026-09-23", 7), {
    from: "2026-09-17",
    to: "2026-09-23",
  });
  assert.deepEqual(previousRange(preset("2026-09-23", 7)), {
    from: "2026-09-10",
    to: "2026-09-16",
  });
  const range = { from: "2026-09-21", to: "2026-09-21" };
  assert.ok(filterRecords(demoDataset, range, "autumn-edit").length === 1);
  assert.equal(
    filterRecords(
      demoDataset,
      { from: "2026-09-20", to: "2026-09-20" },
      "autumn-edit",
    ).length,
    0,
  );
});
test("empty ranges and zero denominators are safe; rates are weighted", () => {
  assert.equal(sum([]).revenue, 0);
  assert.equal(percent(0, 0), 0);
  const rows = [
    {
      sent: 10,
      delivered: 10,
      opens: 8,
      clicks: 2,
      orders: 1,
      revenue: 100,
      unsubscribes: 0,
    },
    {
      sent: 90,
      delivered: 90,
      opens: 18,
      clicks: 4,
      orders: 1,
      revenue: 100,
      unsubscribes: 0,
    },
  ];
  const totals = sum(rows);
  assert.equal(percent(totals.opens, totals.delivered), 26);
});
