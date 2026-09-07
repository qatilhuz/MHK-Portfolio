"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { qaScenarios } from "@/data/qa";
import { cn } from "@/lib/utils";

function ValidationDemo() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(valid ? "Blocked (incorrect)." : "Submitted (incorrect).");
      }}
    >
      <label htmlFor="qa-email" className="block text-sm">
        Email
      </label>
      <input
        id="qa-email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm"
        placeholder="name@example.com"
      />
      <Button type="submit">Submit order</Button>
      {message ? (
        <p className="text-sm text-muted" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}

function UiDemo() {
  const [saving, setSaving] = useState(false);
  const [clicks, setClicks] = useState(0);

  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-disabled={saving}
        className={cn(
          "rounded-[var(--radius-md)] border px-4 py-2 text-sm",
          saving
            ? "cursor-not-allowed border-border text-muted opacity-60"
            : "border-border bg-surface",
        )}
        onClick={() => {
          setSaving(true);
          setClicks((value) => value + 1);
        }}
      >
        Save
      </button>
      <p className="text-sm text-muted" role="status">
        Status: {saving ? "Unsaved" : "Idle"} · Clicks registered: {clicks}
      </p>
    </div>
  );
}

function ResponsiveDemo() {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border">
      <p className="min-w-[48rem] whitespace-nowrap px-3 py-4 text-sm">
        Feature highlights stay on one locked line instead of wrapping for small screens.
      </p>
    </div>
  );
}

function FunctionalDemo() {
  const [qty, setQty] = useState(1);
  const price = 10;
  const total = price;

  return (
    <div className="space-y-3">
      <p className="text-sm">Unit price: {price}</p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label="Decrease quantity"
          onClick={() => setQty((value) => Math.max(1, value - 1))}
        >
          −
        </Button>
        <span aria-live="polite">{qty}</span>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label="Increase quantity"
          onClick={() => setQty((value) => value + 2)}
        >
          +
        </Button>
      </div>
      <p className="text-sm">Line total: {total}</p>
    </div>
  );
}

const demos = {
  validation: ValidationDemo,
  ui: UiDemo,
  responsive: ResponsiveDemo,
  functional: FunctionalDemo,
};

export function QaHunt() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [found, setFound] = useState<Record<string, boolean>>({});
  const scenario = qaScenarios[index];
  const Demo = demos[scenario.id as keyof typeof demos];
  const score = Object.values(found).filter(Boolean).length;
  const done = Object.keys(found).length === qaScenarios.length;

  const result = useMemo(() => {
    if (!choice) return null;
    const option = scenario.options.find((item) => item.id === choice);
    return option;
  }, [choice, scenario]);

  const submit = () => {
    if (!choice) return;
    const option = scenario.options.find((item) => item.id === choice);
    setFound((prev) => ({ ...prev, [scenario.id]: Boolean(option?.correct) }));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted" role="status">
        Bugs found {score} / {qaScenarios.length}
        {done ? " · Hunt complete" : ""}
      </p>
      <Card>
        <p className="label">
          Scenario {index + 1} · {scenario.type}
        </p>
        <h3 className="mt-2">{scenario.title}</h3>
        <p className="mt-2 text-sm text-muted">{scenario.prompt}</p>
        <div className="mt-4">
          <Demo />
        </div>
      </Card>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Report the issue</legend>
        {scenario.options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-start gap-2 text-sm"
          >
            <input
              type="radio"
              name={`qa-${scenario.id}`}
              checked={choice === option.id}
              onChange={() => setChoice(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
      <Button type="button" onClick={submit} disabled={!choice}>
        Report bug
      </Button>

      {found[scenario.id] !== undefined && result ? (
        <Card>
          {result.correct ? (
            <p className="text-sm">Bug found</p>
          ) : (
            <p className="text-sm">Not the primary defect — try the other options.</p>
          )}
          {result.correct ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-muted">Bug type</dt>
                <dd>{scenario.type}</dd>
              </div>
              <div>
                <dt className="text-muted">Severity</dt>
                <dd>
                  <Badge>{scenario.severity}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted">Expected result</dt>
                <dd>{scenario.expected}</dd>
              </div>
              <div>
                <dt className="text-muted">Actual result</dt>
                <dd>{scenario.actual}</dd>
              </div>
              <div>
                <dt className="text-muted">Why this is a bug</dt>
                <dd>{scenario.explanation}</dd>
              </div>
              <div>
                <dt className="text-muted">Reproduction steps</dt>
                <dd>
                  <ol className="list-decimal pl-5">
                    {scenario.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </dd>
              </div>
            </dl>
          ) : null}
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={index === 0}
          onClick={() => {
            setIndex((value) => value - 1);
            setChoice(null);
          }}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={index === qaScenarios.length - 1}
          onClick={() => {
            setIndex((value) => value + 1);
            setChoice(null);
          }}
        >
          Next
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setIndex(0);
            setChoice(null);
            setFound({});
          }}
        >
          Reset hunt
        </Button>
      </div>

      {done ? (
        <Card>
          <h3>QA mindset</h3>
          <p className="mt-2 text-sm text-muted">
            Identify → Reproduce → Classify → Report → Verify. This hunt is a
            teaching demo, not a log of client defects.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
