import { useState } from "react";
import "./CollapsibleBlock.css";

interface CollapsibleBlockProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleBlock({
  title,
  children,
  defaultOpen = false,
}: CollapsibleBlockProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="collapsible-block">
      <button
        type="button"
        className="collapsible-block__header"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <span className="collapsible-block__title">{title}</span>
        <span className="collapsible-block__icon" aria-hidden="true">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && <div className="collapsible-block__content">{children}</div>}
    </section>
  );
}
