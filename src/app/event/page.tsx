import type { Metadata } from "next";
import { getPitchStats } from "@/lib/pitch-stats";
import EventDeck from "./EventDeck";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Git City Ads - Build in Public Meetup",
  description:
    "Advertise where 11,000+ GitHub developers actually look. 3D ads inside an interactive city. From $29/mo.",
};

export default async function EventPage() {
  const stats = await getPitchStats();
  return <EventDeck stats={stats} />;
}
