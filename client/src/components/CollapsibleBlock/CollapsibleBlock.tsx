import { useState, type ReactNode } from "react";
import "./CollapsibleBlock.css";

interface CollapsibleBlockProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleBlock({
  title,
  children,
  defaultOpen = false,
}: CollapsibleBlockProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-block">
      <button
        type="button"
        className="collapsible-block__trigger"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className="collapsible-block__icon">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && <div className="collapsible-block__content">{children}</div>}
    </div>
  );
}
