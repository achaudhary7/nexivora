import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Container, Section } from "@/components/layout/primitives";
import { HeroGraphic } from "@/components/illustrations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/display";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

/*
 * PHASE 1 PLACEHOLDER HOME PAGE — still disposable.
 *
 * Phase 1 gives it the real Header, Footer and hero graphic so the shell can be
 * seen assembled, but the content is not the real home page. **Phase 2 replaces
 * this entirely** with the marketing home page, its full copy, its FAQ and its
 * Organization / WebSite structured data.
 *
 * Do not build on it.
 */

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — ${siteConfig.descriptor}`,
  description:
    "Nexivora is the system of record for academic project work. Students, faculty, colleges, alumni and companies, connected around the projects people actually build.",
  path: "/",
  absoluteTitle: true,
  index: false, // Placeholder content. Phase 2 flips this on with the real page.
});

const PILLARS = [
  {
    title: "The workspace",
    body: "Tasks, files, discussion, meetings and deadlines — one place, private to the group. Useful to five students on day one with nobody else on the platform.",
  },
  {
    title: "The ledger",
    body: "An automatic, transparent record of who actually did what, written in the same transaction as the work itself. Nobody else builds this.",
  },
  {
    title: "The record",
    body: "Problem, research, solution, results — reviewed against a rubric, attested by a named faculty member, archived with a permanent citation ID.",
  },
  {
    title: "The network",
    body: "A feed generated from real project activity. Discovery, teammates, alumni mentorship, and companies who can see what you actually built.",
  },
];

export default function Home() {
  return (
    <>
      <Header />

      <main id="main" className="flex-1">
        <Section className="pt-8 pb-6 md:pt-10 md:pb-10 lg:pt-12">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge tone="primary" className="mb-5">
                  Phase 1 of 20 · design system landed
                </Badge>
                <h1 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
                  {siteConfig.descriptor}
                </h1>
                <p className="mt-4 max-w-xl text-base text-fg-muted md:text-lg">
                  Nexivora is the system of record for academic project work — and the network that
                  grows on top of it. {siteConfig.positioning}
                </p>
                <p className="mt-6 font-mono text-sm text-fg-subtle">
                  Projects &rarr; People &rarr; Opportunities
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/style-guide">View the style guide</Link>
                  </Button>
                </div>
              </div>

              <div className="lg:pl-8">
                <HeroGraphic />
              </div>
            </div>
          </Container>
        </Section>

        <Section tone="raised">
          <Container>
            <h2 className="font-display text-xl font-bold md:text-2xl">
              Four layers, in the order they deliver value
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map((pillar, index) => (
                <div key={pillar.title}>
                  <span className="font-mono text-sm text-fg-subtle">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold">{pillar.title}</h3>
                  <p className="mt-2 text-sm text-fg-muted">{pillar.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-sm text-fg-subtle">
              This is a placeholder. Phase 2 builds the real marketing site — about 45 indexable
              pages and the full SEO engine.
            </p>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
