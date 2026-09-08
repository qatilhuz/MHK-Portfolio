import { NextResponse } from "next/server";
import { persistBatch, rateLimitOk } from "@/lib/analytics/db";
import { parseAnalyticsBatch } from "@/lib/analytics/validate";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const batch = parseAnalyticsBatch(json);
  if (!batch) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!rateLimitOk(batch.sessionId)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  try {
    const result = await persistBatch(batch);
    return NextResponse.json({ ok: true, persisted: result === "written" });
  } catch {
    return NextResponse.json({ ok: true, persisted: false });
  }
}
