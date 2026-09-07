export interface TerminalLink {
  href: string;
  label: string;
}

export interface TerminalOutput {
  title?: string;
  body?: string[];
  list?: string[];
  links?: TerminalLink[];
}

export interface TerminalCommand {
  name: string;
  description: string;
  hidden?: boolean;
  run: () => TerminalOutput | "clear";
}
