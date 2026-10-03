import { cn } from "@/lib/utils";
import { CONTAINER_CLASS } from "@/lib/constants";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "main";
}

export function Container({
  children,
  className,
  as: Tag = "div",
}: ContainerProps) {
  return <Tag className={cn(CONTAINER_CLASS, className)}>{children}</Tag>;
}
