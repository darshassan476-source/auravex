import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "scale" | "fade";

/** Signature AURAVEX easing: fast departure, long settle. */
export const AX_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * `load` plays the entrance the moment the stylesheet is parsed — use it for
 * anything above the fold, so copy arrives with the background rather than
 * after hydration. `scroll` waits until the block is in view.
 */
type Trigger = "load" | "scroll";

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  /** Seconds. */
  delay?: number;
  /** Seconds. */
  duration?: number;
  className?: string;
  trigger?: Trigger;
  style?: CSSProperties;
  /** Accepted for call-site compatibility; the CSS system has no equivalent. */
  once?: boolean;
  margin?: string;
  distance?: number;
}

function revealStyle(delay?: number, duration?: number, style?: CSSProperties) {
  return {
    ...(delay ? { "--ax-rv-delay": `${delay}s` } : null),
    ...(duration ? { "--ax-rv-dur": `${duration}s` } : null),
    ...style,
  } as CSSProperties;
}

/**
 * Entrance wrapper.
 *
 * Deliberately not a motion component: driving entrances from JS meant the
 * server shipped `opacity: 0` on every block, so the page arrived in two
 * stages — background first, content once React had hydrated. These are CSS
 * animations, so both land together. `RevealWatcher` (mounted once in the
 * root layout) adds `.is-in` to the scroll-triggered ones.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration,
  className,
  trigger = "scroll",
  style,
}: RevealProps) {
  return (
    <div
      className={cn(
        trigger === "load" ? "ax-rv" : "ax-rv-scroll",
        `ax-rv-${direction}`,
        className,
      )}
      style={revealStyle(delay, duration, style)}
    >
      {children}
    </div>
  );
}

interface RevealItemProps {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  style?: CSSProperties;
  distance?: number;
  /** Injected by `RevealGroup` — not set at call sites. */
  delay?: number;
  trigger?: Trigger;
}

/** Child of `RevealGroup` — inherits the parent's stagger timing. */
export function RevealItem({
  children,
  className,
  direction = "up",
  delay = 0,
  duration,
  trigger = "scroll",
  style,
}: RevealItemProps & { duration?: number }) {
  return (
    <div
      className={cn(
        trigger === "load" ? "ax-rv" : "ax-rv-scroll",
        `ax-rv-${direction}`,
        className,
      )}
      style={revealStyle(delay, duration, style)}
    >
      {children}
    </div>
  );
}

/** Parent wrapper that staggers its `RevealItem` children. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  trigger = "scroll",
  style,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  trigger?: Trigger;
  style?: CSSProperties;
  once?: boolean;
}) {
  let index = 0;

  const staggered = Children.map(children, (child) => {
    // Only RevealItem takes the injected timing; decorative siblings such as
    // the connector rules in the timeline sections pass straight through.
    if (!isValidElement(child) || child.type !== RevealItem) return child;
    const step = index++;
    return cloneElement(child as React.ReactElement<RevealItemProps>, {
      delay: delay + step * stagger,
      trigger,
    });
  });

  return (
    <div className={className} style={style}>
      {staggered}
    </div>
  );
}
