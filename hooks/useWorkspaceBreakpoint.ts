"use client";

import { useEffect, useState } from "react";
import type { WorkspaceBreakpoint } from "@/types/workspace";

export function useWorkspaceBreakpoint(): WorkspaceBreakpoint {
  const [value, setValue] = useState<WorkspaceBreakpoint>("desktop");

  useEffect(() => {
    const tablet = window.matchMedia("(max-width: 1023px)");
    const mobile = window.matchMedia("(max-width: 767px)");

    const update = () => {
      if (mobile.matches) setValue("mobile");
      else if (tablet.matches) setValue("tablet");
      else setValue("desktop");
    };

    update();
    tablet.addEventListener("change", update);
    mobile.addEventListener("change", update);
    return () => {
      tablet.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
    };
  }, []);

  return value;
}
