import type { Metadata } from "next";
import "./globals.css";
import { Workspace } from "@/components/workspace";
import { analyticsProvider } from "@/lib/data/provider";
export const metadata: Metadata = {
  title: {
    default: "thefifthline.D — Marketing Intelligence",
    template: "%s · thefifthline.D",
  },
  description:
    "A portfolio-ready Klaviyo marketing intelligence dashboard. Explore fictional Northline campaign and flow performance. Sample data only.",
  icons: { icon: "/favicon.svg" },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await analyticsProvider.getDataset();
  return (
    <html lang="en">
      <body>
        <Workspace data={data}>{children}</Workspace>
      </body>
    </html>
  );
}
