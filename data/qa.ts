export type BugType =
  | "Validation Bug"
  | "UI Bug"
  | "Responsive Bug"
  | "Functional Bug";

export type Severity = "Low" | "Medium" | "High";

export interface QaScenario {
  id: string;
  title: string;
  type: BugType;
  severity: Severity;
  prompt: string;
  options: { id: string; label: string; correct: boolean }[];
  expected: string;
  actual: string;
  explanation: string;
  steps: string[];
}

export const qaScenarios: QaScenario[] = [
  {
    id: "validation",
    title: "Checkout email field",
    type: "Validation Bug",
    severity: "High",
    prompt: "Try submitting the form. What is wrong?",
    options: [
      {
        id: "v1",
        label: "Valid emails are rejected and empty values are accepted.",
        correct: true,
      },
      { id: "v2", label: "The submit button is missing a label.", correct: false },
      { id: "v3", label: "The form posts to an unknown server.", correct: false },
    ],
    expected: "Email is required and must contain a valid address format.",
    actual: "Empty or invalid values submit; a normal address is blocked.",
    explanation:
      "Client validation is inverted, so the control does not protect required input.",
    steps: [
      "Enter a normal email and submit — it fails.",
      "Clear the field and submit — it succeeds.",
    ],
  },
  {
    id: "ui",
    title: "Save action",
    type: "UI Bug",
    severity: "Medium",
    prompt: "Use the Save control. What is wrong?",
    options: [
      {
        id: "u1",
        label: "The control stays enabled and reports the opposite saved state.",
        correct: true,
      },
      { id: "u2", label: "The button uses the wrong accent color.", correct: false },
      { id: "u3", label: "There is no keyboard focus ring.", correct: false },
    ],
    expected: "While saving, the button is disabled and status says Saving, then Saved.",
    actual: "Clicks still fire and the status says Unsaved after a successful click.",
    explanation:
      "Disabled state is visual only; the handler still runs and the status mapping is inverted.",
    steps: ["Activate Save.", "Observe that further clicks still register."],
  },
  {
    id: "responsive",
    title: "Feature strip",
    type: "Responsive Bug",
    severity: "Medium",
    prompt: "Inspect the strip (or shrink the viewport). What is wrong?",
    options: [
      {
        id: "r1",
        label: "Content cannot wrap and forces horizontal overflow on small screens.",
        correct: true,
      },
      { id: "r2", label: "The heading uses the wrong type scale.", correct: false },
      { id: "r3", label: "The strip has no landmark role.", correct: false },
    ],
    expected: "Text wraps within the viewport at mobile widths.",
    actual: "A fixed min-width keeps a single long line and overflows.",
    explanation:
      "Layout used a hard min-width instead of a fluid stack, which fails responsive checks.",
    steps: [
      "Narrow the viewport or read the nowrap strip.",
      "Confirm the page can scroll horizontally here.",
    ],
  },
  {
    id: "functional",
    title: "Quantity total",
    type: "Functional Bug",
    severity: "High",
    prompt: "Change quantity. What is wrong?",
    options: [
      {
        id: "f1",
        label: "Increment adds two and the line total ignores quantity.",
        correct: true,
      },
      { id: "f2", label: "The minus button has no accessible name.", correct: false },
      { id: "f3", label: "Currency formatting is missing a symbol.", correct: false },
    ],
    expected: "Plus adds one; total equals unit price times quantity.",
    actual: "Plus jumps by two; total stays at the unit price.",
    explanation:
      "The stepper mutates state incorrectly and the total formula omits quantity.",
    steps: ["Press + once.", "Compare quantity and the displayed total."],
  },
];
