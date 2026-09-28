import { notFound } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { analyticsProvider } from "@/lib/data/provider";
export async function generateStaticParams() {
  return (await analyticsProvider.getDataset()).entities
    .filter((e) => e.kind === "campaign")
    .map((e) => ({ id: e.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title:
      (await analyticsProvider.getDataset()).entities.find((e) => e.id === id)
        ?.name || "Campaign not found",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await analyticsProvider.getDataset();
  if (!data.entities.some((e) => e.kind === "campaign" && e.id === id))
    notFound();
  return <Dashboard view="campaigns" entityId={id} />;
}
