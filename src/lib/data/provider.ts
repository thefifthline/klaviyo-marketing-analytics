import { demoProvider } from "./demo";
import type { AnalyticsProvider } from "./types";
// Single integration boundary. Future implementation must normalize API data to Dataset,
// fetch on the server, and keep private credentials out of client bundles.
export const analyticsProvider: AnalyticsProvider = demoProvider;
