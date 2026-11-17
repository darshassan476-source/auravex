"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/** What an executive might ask; each maps to something the suite actually does. */
const ASKS = [
  "Summarise the contracts that renew this quarter",
  "Route this policy for approval",
  "Build a dashboard of open requests by department",
  "Which projects are behind programme?",
  "Show the sustainability initiatives at risk",
];

const AGENTS = [
  { icon: "file", label: "Documents" },
  { icon: "workflow", label: "Approvals" },
  { icon: "chart", label: "Analytics" },
  { icon: "building", label: "Projects" },
];

/**
 * The home hero's screen: the Auravex intelligence layer as a console — a
 * living core, a question being typed, and the agents it calls on lighting
 * up in turn. Brand imagery: no product screens, no figures.
 */
export function AuravexConsole() {
  const [ask, setAsk] = useState(0);
  const [typed, setTyped] = useState(0);
  const text = ASKS[ask];
  const done = typed >= text.length;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(text.length);
      return;
    }
    const t = window.setTimeout(
      () => {
        if (done) {
          setAsk((a) => (a + 1) % ASKS.length);
          setTyped(0);
        } else setTyped((n) => n + 1);
      },
      done ? 2600 : 38,
    );
    return () => window.clearTimeout(t);
  }, [typed, done, text.length]);

  const lit = done ? AGENTS.length : Math.floor((typed / text.length) * AGENTS.length);

  return (
    <div
      className="relative size-full overflow-hidden bg-[#050813] text-white [container-type:inline-size]"
      aria-label="Auravex intelligence console"
      role="img"
    >
      {/* Aurora */}
      <span
        aria-hidden
        className="absolute -left-[15%] -top-[30%] h-[90%] w-[70%] rounded-full bg-[#4f46e5] opacity-50 blur-[60px]"
        style={{ animation: "ax-drift 12s ease-in-out infinite" }}
      />
      <span
        aria-hidden
        className="absolute -bottom-[35%] -right-[10%] h-[90%] w-[65%] rounded-full bg-[#0891b2] opacity-40 blur-[70px]"
        style={{ animation: "ax-drift 15s ease-in-out -5s infinite" }}
      />
      <span
        aria-hidden
        className="absolute right-[20%] top-[10%] h-[45%] w-[35%] rounded-full bg-[#c026d3] opacity-25 blur-[60px]"
        style={{ animation: "ax-drift 18s ease-in-out -9s infinite" }}
      />

      {/* Top bar */}
      <div className="relative flex items-center justify-between border-b border-white/[0.07] px-[3.5cqw] py-[1.8cqw]">
        <span className="flex items-center gap-[1.2cqw]">
          <span className="size-[2.2cqw] rounded-full bg-[conic-gradient(from_0deg,#60a5fa,#a78bfa,#22d3ee,#60a5fa)]" />
          <span className="font-semibold tracking-[0.22em]" style={{ fontSize: "1.7cqw" }}>
            AURAVEX
          </span>
          <span className="text-white/40" style={{ fontSize: "1.5cqw" }}>
            Intelligence
          </span>
        </span>
        <span className="flex items-center gap-[0.8cqw] text-white/50" style={{ fontSize: "1.4cqw" }}>
          <span className="size-[1cqw] rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          Enterprise workspace
        </span>
      </div>

      <div className="relative flex h-[calc(100%-6cqw)] flex-col items-center justify-center px-[6cqw]">
        {/* The core */}
        <div className="relative mb-[3cqw] size-[14cqw]">
          <span
            className="absolute inset-[-40%] rounded-full opacity-60 blur-[18px]"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.9), transparent 65%)" }}
          />
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #60a5fa, #a78bfa, #f0abfc, #22d3ee, #60a5fa)",
              animation: "ax-spin 8s linear infinite",
              filter: "blur(2px)",
            }}
          />
          <span
            className="absolute inset-[7%] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(165,180,252,0.6) 25%, rgba(30,27,75,0.95) 70%)",
            }}
          />
          <span
            className="absolute inset-[-14%] rounded-full border border-white/15"
            style={{ animation: "pulse-ring 3.2s ease-out infinite" }}
          />
        </div>

        <p className="text-center font-semibold tracking-[-0.02em]" style={{ fontSize: "3.6cqw", lineHeight: 1.15 }}>
          What would you like to{" "}
          <span className="bg-[linear-gradient(95deg,#93c5fd,#c4b5fd,#67e8f9)] bg-clip-text text-transparent">know?</span>
        </p>

        {/* Prompt */}
        <div
          className="mt-[3cqw] flex w-full max-w-[78cqw] items-center gap-[1.6cqw] rounded-[2cqw] border border-white/12 bg-white/[0.06] px-[2.4cqw] py-[1.8cqw] backdrop-blur-md"
          style={{ boxShadow: "0 0 0 1px rgba(129,140,248,0.15), 0 12px 40px -12px rgba(79,70,229,0.6)" }}
        >
          <Icon name="sparkles" className="size-[2.4cqw] shrink-0 text-indigo-300" strokeWidth={2} />
          <span className="min-w-0 flex-1 truncate text-white/90" style={{ fontSize: "1.9cqw" }}>
            {text.slice(0, typed)}
            <span className="ml-[0.2cqw] inline-block h-[2.2cqw] w-[0.25cqw] translate-y-[0.3cqw] bg-indigo-300" style={{ animation: "ax-caret 1s steps(1) infinite" }} />
          </span>
          <span className="grid size-[3.6cqw] shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#6366f1,#22d3ee)]">
            <Icon name="arrow-up-right" className="size-[2cqw] text-white" strokeWidth={2.4} />
          </span>
        </div>

        {/* Agents it calls on */}
        <div className="mt-[3cqw] flex flex-wrap justify-center gap-[1.4cqw]">
          {AGENTS.map((a, i) => {
            const on = i < lit;
            return (
              <span
                key={a.label}
                className="flex items-center gap-[0.9cqw] rounded-full border px-[1.6cqw] py-[0.8cqw] transition-all duration-500"
                style={{
                  fontSize: "1.45cqw",
                  borderColor: on ? "rgba(165,180,252,0.5)" : "rgba(255,255,255,0.1)",
                  background: on ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.03)",
                  color: on ? "#fff" : "rgba(255,255,255,0.45)",
                }}
              >
                <Icon name={a.icon} className="size-[1.7cqw]" strokeWidth={2} />
                {a.label}
                {on && <Icon name="check" className="size-[1.5cqw] text-emerald-300" strokeWidth={2.6} />}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
