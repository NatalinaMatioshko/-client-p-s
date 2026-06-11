import { type ComponentPropsWithoutRef } from "react";

type ContainerTag =
  | "div"
  | "section"
  | "main"
  | "article"
  | "header"
  | "footer";

interface ContainerProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  as?: ContainerTag;
}

export function Container({
  className = "",
  as: As = "div",
  children,
  ...props
}: ContainerProps) {
  return (
    <As className={`container ${className}`.trim()} {...props}>
      {children}
    </As>
  );
}
