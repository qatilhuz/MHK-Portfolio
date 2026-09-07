const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot: string;
}

export interface FieldErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

function cleanMultiline(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").trim().slice(0, max);
}

export function parseContactBody(input: unknown): ContactInput | null {
  if (!input || typeof input !== "object") return null;
  const data = input as Record<string, unknown>;
  const allowed = ["name", "email", "subject", "message", "website"];
  for (const key of Object.keys(data)) {
    if (!allowed.includes(key)) return null;
  }
  return {
    name: clean(data.name, 80),
    email: clean(data.email, 120).toLowerCase(),
    subject: clean(data.subject, 120),
    message: cleanMultiline(data.message, 4000),
    honeypot: typeof data.website === "string" ? data.website : "",
  };
}

export function validateContact(fields: ContactInput): FieldErrors | null {
  const errors: FieldErrors = {};
  if (fields.name.length < 2) errors.name = "Enter your name.";
  if (!EMAIL.test(fields.email) || fields.email.length < 5) {
    errors.email = "Enter a valid email address.";
  }
  if (fields.subject.length > 120) errors.subject = "Subject is too long.";
  if (fields.message.length < 20) {
    errors.message = "Please write a slightly longer message.";
  }
  return Object.keys(errors).length ? errors : null;
}
