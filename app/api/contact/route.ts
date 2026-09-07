import { NextResponse } from "next/server";
import { parseContactBody, validateContact } from "@/lib/contact/validate";
import { clientKey, contactRateLimit } from "@/lib/contact/rateLimit";

export const runtime = "nodejs";

const MAX_BYTES = 8_192;

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  if (!contactRateLimit(clientKey(request))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const fields = parseContactBody(json);
  if (!fields) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (fields.honeypot) {
    return NextResponse.json({ ok: true });
  }

  const errors = validateContact(fields);
  if (errors) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const apiKey = process.env.EMAIL_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !to || !from) {
    return NextResponse.json({ ok: false, unavailable: true }, { status: 503 });
  }

  const subject = fields.subject
    ? `Portfolio contact: ${fields.subject}`
    : `Portfolio contact from ${fields.name}`;

  const text = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    fields.subject ? `Subject: ${fields.subject}` : null,
    "",
    fields.message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: fields.email,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
