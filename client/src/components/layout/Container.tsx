import { type ComponentProps } from "react";

type ContainerTag =
  | "div"
  | "section"
  | "main"
  | "article"
  | "header"
  | "footer";

interface ContainerProps extends Omit<ComponentProps<"div">, "as"> {
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
