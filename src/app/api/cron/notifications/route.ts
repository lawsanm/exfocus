import { NextResponse } from "next/server";
import { runNotificationChecks } from "@/application/services/notification-scheduler";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await runNotificationChecks();
  return NextResponse.json({ ok: true });
}
