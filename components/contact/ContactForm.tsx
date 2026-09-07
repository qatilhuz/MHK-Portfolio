"use client";

import { FormEvent, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics/client";
import { validateContact, type FieldErrors } from "@/lib/contact/validate";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
}

const empty: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export function ContactForm() {
  const formId = useId();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "unavailable">(
    "idle",
  );
  const started = useRef(false);

  const onFocus = () => {
    if (started.current) return;
    started.current = true;
    trackEvent("contact_start", undefined, { onceKey: "contact_form" });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      subject: values.subject.trim(),
      message: values.message.trim(),
      honeypot: values.website,
    };
    const nextErrors = validateContact(payload);
    if (nextErrors) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          subject: payload.subject,
          message: payload.message,
          website: values.website,
        }),
      });
      if (response.status === 503) {
        setStatus("unavailable");
        trackEvent("contact_submit_error");
        return;
      }
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          errors?: FieldErrors;
        } | null;
        if (body?.errors) setErrors(body.errors);
        setStatus("error");
        trackEvent("contact_submit_error");
        return;
      }
      setValues(empty);
      setStatus("success");
      trackEvent("contact_submit_success");
    } catch {
      setStatus("error");
      trackEvent("contact_submit_error");
    }
  };

  const fieldClass =
    "w-full rounded-[var(--radius-md)] border bg-surface px-3 py-2 text-sm";

  return (
    <form className="max-w-lg space-y-4" onSubmit={submit} noValidate>
      <div>
        <label htmlFor={`${formId}-name`} className="mb-1 block text-sm">
          Name
        </label>
        <input
          id={`${formId}-name`}
          name="name"
          autoComplete="name"
          value={values.name}
          maxLength={80}
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          className={`${fieldClass} ${errors.name ? "border-foreground" : "border-border"}`}
          onFocus={onFocus}
          onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
        />
        {errors.name ? (
          <p id={`${formId}-name-error`} className="mt-1 text-sm text-muted">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${formId}-email`} className="mb-1 block text-sm">
          Email
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          maxLength={120}
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
          className={`${fieldClass} ${errors.email ? "border-foreground" : "border-border"}`}
          onFocus={onFocus}
          onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
        />
        {errors.email ? (
          <p id={`${formId}-email-error`} className="mt-1 text-sm text-muted">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${formId}-subject`} className="mb-1 block text-sm">
          Subject <span className="text-muted">(optional)</span>
        </label>
        <input
          id={`${formId}-subject`}
          name="subject"
          value={values.subject}
          maxLength={120}
          className={`${fieldClass} border-border`}
          onFocus={onFocus}
          onChange={(event) => setValues((prev) => ({ ...prev, subject: event.target.value }))}
        />
      </div>

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor={`${formId}-website`}>Website</label>
        <input
          id={`${formId}-website`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => setValues((prev) => ({ ...prev, website: event.target.value }))}
        />
      </div>

      <div>
        <label htmlFor={`${formId}-message`} className="mb-1 block text-sm">
          Message
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={5}
          value={values.message}
          maxLength={4000}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${formId}-message-error` : undefined}
          className={`${fieldClass} ${errors.message ? "border-foreground" : "border-border"}`}
          onFocus={onFocus}
          onChange={(event) => setValues((prev) => ({ ...prev, message: event.target.value }))}
        />
        {errors.message ? (
          <p id={`${formId}-message-error`} className="mt-1 text-sm text-muted">
            {errors.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>

      <p className="text-sm text-muted" role="status" aria-live="polite">
        {status === "success"
          ? "Message sent successfully. I’ll get back to you soon."
          : status === "unavailable"
            ? "Contact service is temporarily unavailable. Please try again later."
            : status === "error"
              ? "Something went wrong. Please try again."
              : ""}
      </p>
    </form>
  );
}
