import { NextResponse } from "next/server";
import { persistBatch, rateLimitOk } from "@/lib/analytics/db";
import { parseAnalyticsBatch } from "@/lib/analytics/validate";

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const batch = parseAnalyticsBatch(json);
    if (!batch) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (!rateLimitOk(batch.sessionId)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }
    const result = await persistBatch(batch);
    return NextResponse.json({ ok: true, persisted: result === "written" });
  } catch {
    return NextResponse.json({ ok: false, persisted: false });
  }
}
