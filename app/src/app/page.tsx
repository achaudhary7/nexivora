import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

/*
 * PHASE 0 PLACEHOLDER — deliberately disposable.
 *
 * It exists to prove three things and nothing more: the token system resolves,
 * the fonts load, and dark mode inverts correctly. Phase 1 replaces it with
 * /style-guide; Phase 2 replaces it with the real home page.
 *
 * Do not build on it, and do not start designing here. That is Phase 1's job.
 */

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — ${siteConfig.descriptor}`,
  description:
    "Nexivora is the system of record for academic project work. Students, faculty, colleges, alumni and companies, connected around the projects people actually build.",
  path: "/",
  absoluteTitle: true,
  index: false, // Placeholder content. Phase 2 flips this on with the real page.
});

const phases = [
  { n: 0, name: "Foundation & Setup", band: "mvp" },
  { n: 1, name: "Design System & Brand", band: "mvp" },
  { n: 2, name: "Public Site & SEO Core", band: "mvp" },
  { n: 3, name: "Data Model & Seed", band: "mvp" },
  { n: 4, name: "Auth, Roles & RBAC", band: "mvp" },
  { n: 5, name: "Institution Backbone", band: "mvp" },
  { n: 6, name: "Profiles & Identity", band: "mvp" },
  { n: 7, name: "Group Workspace", band: "mvp" },
  { n: 8, name: "Project Lifecycle", band: "mvp" },
  { n: 9, name: "Faculty Review", band: "mvp" },
  { n: 10, name: "Feed & Notifications", band: "mvp" },
  { n: 11, name: "Discovery & Ideas", band: "mvp" },
  { n: 12, name: "Showcase & Archive", band: "mvp" },
  { n: 13, name: "Alumni & Companies", band: "expansion" },
  { n: 14, name: "Inter-College & Events", band: "expansion" },
  { n: 15, name: "Analytics & Accreditation", band: "expansion" },
  { n: 16, name: "Hardening", band: "production" },
  { n: 17, name: "Deployment & Ops", band: "production" },
  { n: 18, name: "AI Assistant", band: "ai" },
  { n: 19, name: "Launch & Pitch Pack", band: "ai" },
] as const;

const tokenSwatches = [
  { name: "primary-600", className: "bg-primary-600", fg: "text-fg-on-primary" },
  { name: "accent-600", className: "bg-accent-600", fg: "text-fg-on-accent" },
  { name: "highlight-600", className: "bg-highlight-600", fg: "text-fg-on-highlight" },
  { name: "success", className: "bg-success", fg: "text-success-fg" },
  { name: "warning", className: "bg-warning", fg: "text-warning-fg" },
  { name: "danger", className: "bg-danger", fg: "text-danger-fg" },
  { name: "info", className: "bg-info", fg: "text-info-fg" },
  { name: "surface-inverse", className: "bg-surface-inverse", fg: "text-fg-inverse" },
];

const tiers = [
  { label: "Self-claimed", className: "text-tier-self border-tier-self" },
  { label: "Workspace-evidenced", className: "text-tier-evidenced border-tier-evidenced" },
  { label: "Faculty-attested", className: "text-tier-attested border-tier-attested" },
];

export default function Home() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-6 py-16 md:py-24">
      <header className="mb-16">
        <div className="mb-6 flex items-center gap-3">
          <PlaceholderMark />
          <span className="font-display text-2xl font-bold tracking-tight">{siteConfig.name}</span>
        </div>

        <h1 className="max-w-3xl text-4xl font-bold md:text-5xl">{siteConfig.descriptor}</h1>

        <p className="mt-4 max-w-prose text-lg text-fg-muted">{siteConfig.positioning}</p>

        <p className="mt-6 font-mono text-sm text-fg-subtle">
          Phase 0 placeholder · token &amp; font check · replaced in Phase 1
        </p>
      </header>

      <Section title="Semantic colour tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tokenSwatches.map((swatch) => (
            <div
              key={swatch.name}
              className={`${swatch.className} ${swatch.fg} rounded-lg px-4 py-6 text-sm font-medium`}
            >
              {swatch.name}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Contribution proof tiers">
        <p className="mb-4 max-w-prose text-sm text-fg-muted">
          These three must be distinguishable at a glance and in greyscale, because they appear on
          printed portfolio PDFs.
        </p>
        <div className="flex flex-wrap gap-3">
          {tiers.map((tier) => (
            <span
              key={tier.label}
              className={`${tier.className} rounded-full border-2 px-4 py-1.5 text-sm font-semibold`}
            >
              {tier.label}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Type scale">
        <div className="space-y-2">
          <p className="font-display text-5xl font-bold">Display · Plus Jakarta Sans</p>
          <p className="text-lg">Body · Inter — the quick brown fox jumps over the lazy dog.</p>
          <p className="font-mono text-sm text-fg-muted">
            Mono · JetBrains Mono — NXV-NIT-2026-7Q4KX2
          </p>
        </div>
      </Section>

      <Section title="Surfaces &amp; elevation">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-surface-sunken p-5 text-sm">surface-sunken</div>
          <div className="rounded-lg border border-border bg-surface-raised p-5 text-sm shadow-sm">
            surface-raised
          </div>
          <div className="rounded-lg border border-border bg-surface p-5 text-sm shadow-md">
            surface + shadow-md
          </div>
        </div>
      </Section>

      <Section title="Build plan · 20 phases">
        <ol className="divide-y divide-border rounded-lg border border-border">
          {phases.map((phase) => (
            <li key={phase.n} className="flex items-center gap-4 px-4 py-2.5 text-sm">
              <span className="w-8 shrink-0 font-mono text-fg-subtle tabular-nums">
                {String(phase.n).padStart(2, "0")}
              </span>
              <span className="flex-1">{phase.name}</span>
              <span className="font-mono text-xs text-fg-subtle uppercase">{phase.band}</span>
              <span
                className={
                  phase.n === 0
                    ? "font-mono text-xs font-semibold text-highlight-600"
                    : "font-mono text-xs text-fg-subtle"
                }
              >
                {phase.n === 0 ? "in progress" : "not started"}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <footer className="mt-16 border-t border-border pt-8 text-sm text-fg-subtle">
        <p>
          Read <code className="font-mono">CONTEXT.md</code> first, then{" "}
          <code className="font-mono">PROGRESS.md</code>, then the phase spec in{" "}
          <code className="font-mono">docs/phases/</code>.
        </p>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-fg-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

/**
 * A first-draft inline mark, NOT the final logo. Phase 1 owns the real
 * components/Logo.tsx, the favicon set and the icon system.
 */
function PlaceholderMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="32"
      height="32"
      role="img"
      aria-label="Nexivora placeholder mark"
      className="shrink-0"
    >
      <path
        d="M8 24V8l16 16V8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="24" r="3" className="fill-primary-600" />
      <circle cx="24" cy="8" r="4" className="fill-accent-600" />
    </svg>
  );
}
