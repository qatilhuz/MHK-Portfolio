"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navigation, siteConfig } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-medium tracking-tight text-foreground">
          {siteConfig.displayName}
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navigation.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="text-sm text-muted transition-colors duration-[var(--motion-micro)] hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <IconButton
          className="md:hidden"
          label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </IconButton>
      </Container>

      <div
        id="mobile-nav"
        hidden={!open}
        className={cn(
          "border-t border-border bg-background md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav
          className="flex flex-col px-[var(--page-gutter)] py-4"
          aria-label="Mobile"
        >
          {navigation.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="py-3 text-foreground"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
