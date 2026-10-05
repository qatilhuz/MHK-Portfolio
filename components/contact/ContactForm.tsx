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
    if (status === "sending") return;
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
    "w-full rounded-xl border bg-white/[0.055] px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-white/35 hover:bg-white/[0.075] focus:border-blue-300/55 focus:bg-white/[0.09] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.13)]";

  return (
    <form className="relative max-w-lg space-y-5" onSubmit={submit} noValidate>
      <div>
        <label htmlFor={`${formId}-name`} className="mb-2 block text-sm font-medium text-white/85">
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
          className={`${fieldClass} ${errors.name ? "border-rose-300/70" : "border-white/10"}`}
          onFocus={onFocus}
          onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
        />
        {errors.name ? (
          <p id={`${formId}-name-error`} className="mt-1.5 text-sm text-rose-200">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${formId}-email`} className="mb-2 block text-sm font-medium text-white/85">
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
          className={`${fieldClass} ${errors.email ? "border-rose-300/70" : "border-white/10"}`}
          onFocus={onFocus}
          onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
        />
        {errors.email ? (
          <p id={`${formId}-email-error`} className="mt-1.5 text-sm text-rose-200">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${formId}-subject`} className="mb-2 block text-sm font-medium text-white/85">
          Subject <span className="font-normal text-white/45">(optional)</span>
        </label>
        <input
          id={`${formId}-subject`}
          name="subject"
          value={values.subject}
          maxLength={120}
          className={`${fieldClass} border-white/10`}
          onFocus={onFocus}
          onChange={(event) => setValues((prev) => ({ ...prev, subject: event.target.value }))}
        />
      </div>

      <div className="sr-only" aria-hidden="true">
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
        <label htmlFor={`${formId}-message`} className="mb-2 block text-sm font-medium text-white/85">
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
          className={`${fieldClass} ${errors.message ? "border-rose-300/70" : "border-white/10"}`}
          onFocus={onFocus}
          onChange={(event) => setValues((prev) => ({ ...prev, message: event.target.value }))}
        />
        {errors.message ? (
          <p id={`${formId}-message-error`} className="mt-1.5 text-sm text-rose-200">
            {errors.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={status === "sending"}
        className="border border-blue-200/20 bg-blue-500/85 px-6 text-white shadow-[0_12px_35px_-14px_rgba(59,130,246,0.95),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-blue-400 hover:brightness-105"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>

      <p className="min-h-5 text-sm text-white/60" role="status" aria-live="polite">
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
