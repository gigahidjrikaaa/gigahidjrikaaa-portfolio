"use client";

import { ReactElement, cloneElement, useId, AriaAttributes, HTMLAttributes } from "react";

interface TooltipProps {
  content: string;
  children: ReactElement;
}

const Tooltip = ({ content, children }: TooltipProps) => {
  const tooltipId = useId();
  const childProps = children.props as HTMLAttributes<HTMLElement> & AriaAttributes;
  return (
    <span className="group relative inline-flex" aria-describedby={tooltipId}>
      {cloneElement(children, {
        "aria-label": childProps["aria-label"] || content,
      } as HTMLAttributes<HTMLElement> & AriaAttributes)}
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
      >
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
