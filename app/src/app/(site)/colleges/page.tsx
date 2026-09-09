import type { Metadata } from "next";
import Link from "next/link";

import { CollegeIcon } from "@/components/icons";
import { Container, PageHeader } from "@/components/layout/primitives";
import { Badge, Card } from "@/components/ui/display";
import { Breadcrumbs } from "@/components/ui/navigation";
import { projectsByCollege, publicCollegeList } from "@/content";
import { JsonLd, breadcrumbList, itemList } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * The college directory.
 *
 * **Only verified colleges appear here.** An institution that has registered
 * but not completed verification works normally for its own members and is
 * absent from every public surface — that gate is what makes the network's
 * trust mean anything (docs/SECURITY.md §8).
 */
export const metadata: Metadata = buildMetadata({
  title: "Colleges on Nexivora",
  description:
    "Verified institutions publishing student project work on Nexivora, with their departments, archives and public project counts.",
  path: "/colleges",
});

export default function CollegesPage() {
  const colleges = publicCollegeList();
  const crumbs = [{ label: "Colleges", href: "/colleges" }];

  return (
    <>
      <JsonLd
        data={[
          itemList(
            colleges.map((c) => ({ name: c.name, url: `/colleges/${c.slug}` })),
            { name: "Verified colleges" },
          ),
          breadcrumbList(crumbs),
        ]}
      />
      <Container className="py-10 md:py-12">
        <Breadcrumbs crumbs={crumbs} className="mb-6" />
        <PageHeader
          eyebrow="Institutions"
          title="Colleges on Nexivora"
          description="Every institution here has completed verification. Until it does, nothing from a college is publicly visible — which is what keeps the archive trustworthy."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {colleges.map((college) => {
            const projects = projectsByCollege(college.slug);
            return (
              <Card key={college.slug} interactive className="relative p-6">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-600">
                    <CollegeIcon size={24} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg leading-snug font-semibold">
                      <Link
                        href={`/colleges/${college.slug}`}
                        className="after:absolute after:inset-0"
                      >
                        {college.name}
                      </Link>
                    </h2>
                    <p className="mt-0.5 text-sm text-fg-subtle">
                      {college.city}, {college.state}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-fg-muted">{college.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone="accent">Verified</Badge>
                  <Badge tone="outline">
                    {projects.length} public {projects.length === 1 ? "project" : "projects"}
                  </Badge>
                  <Badge tone="outline">{college.departments.length} departments</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </>
  );
}
