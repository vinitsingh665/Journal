import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

  // Fetch the actual user to pass name
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  return <SettingsClient user={user || {}} initialSettings={settings || {}} />;
}
