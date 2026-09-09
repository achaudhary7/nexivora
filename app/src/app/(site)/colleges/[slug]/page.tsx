import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CollegeIcon } from "@/components/icons";
import { Container, PageHeader } from "@/components/layout/primitives";
import { ProjectCard } from "@/components/project/project-card";
import { Avatar, Badge, Card } from "@/components/ui/display";
import { Breadcrumbs } from "@/components/ui/navigation";
import { SDG_BY_NUMBER, sdgPath } from "@/config/taxonomy";
import { colleges } from "@/content/colleges";
import { projectsByCollege, publicCollege, publicPeopleList } from "@/content";
import { JsonLd, breadcrumbList, collegeOrUniversity, itemList } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return colleges.filter((c) => c.verified).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/colleges/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const college = publicCollege(slug);
  if (!college) {
    return buildMetadata({
      title: "College not found",
      description: "This institution is not publicly listed on Nexivora.",
      path: `/colleges/${slug}`,
      index: false,
    });
  }

  const count = projectsByCollege(slug).length;
  return buildMetadata({
    title: `${college.shortName} student projects`,
    description: `${count} documented student ${count === 1 ? "project" : "projects"} published by ${college.name}, ${college.city} — with methodology, results and faculty attestation.`,
    path: `/colleges/${slug}`,
  });
}

export default async function CollegePage(props: PageProps<"/colleges/[slug]">) {
  const { slug } = await props.params;
  const college = publicCollege(slug);
  if (!college) notFound();

  const projects = projectsByCollege(slug);
  const members = publicPeopleList().filter((p) => p.collegeSlug === slug);
  const faculty = members.filter((p) => p.role === "faculty");
  const sdgCoverage = [...new Set(projects.flatMap((p) => p.sdgs))].sort((a, b) => a - b);

  const crumbs = [
    { label: "Colleges", href: "/colleges" },
    { label: college.shortName, href: `/colleges/${slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          collegeOrUniversity({
            name: college.name,
            slug: college.slug,
            description: college.description,
            city: college.city,
            state: college.state,
            website: college.website,
            foundingDate: college.foundingDate,
          }),
          itemList(
            projects.map((p) => ({ name: p.title, url: `/projects/${p.slug}` })),
            { name: `Projects from ${college.name}` },
          ),
          breadcrumbList(crumbs),
        ]}
      />

      <Container className="py-10 md:py-12">
        <Breadcrumbs crumbs={crumbs} className="mb-6" />

        <div className="flex items-start gap-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-600">
            <CollegeIcon size={28} />
          </span>
          <PageHeader
            eyebrow={`${college.city}, ${college.state}`}
            title={college.name}
            description={college.description}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge tone="accent">Verified institution</Badge>
          {college.website ? (
            <a href={college.website} rel="ugc noopener">
              <Badge tone="outline">Official website</Badge>
            </a>
          ) : null}
        </div>

        <dl className="mt-8 grid gap-5 rounded-lg border border-border p-5 sm:grid-cols-4">
          <div>
            <dt className="text-xs tracking-wide text-fg-subtle uppercase">Public projects</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{projects.length}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-fg-subtle uppercase">Departments</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{college.departments.length}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-fg-subtle uppercase">SDGs covered</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{sdgCoverage.length}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-fg-subtle uppercase">Public profiles</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{members.length}</dd>
          </div>
        </dl>

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold md:text-2xl">Departments</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {college.departments.map((dept) => (
              <Badge key={dept} tone="outline" size="md">
                {dept}
              </Badge>
            ))}
          </div>
        </section>

        {sdgCoverage.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold md:text-2xl">SDG coverage</h2>
            <p className="mt-2 text-sm text-fg-muted">
              Goals this college&rsquo;s published work contributes to. This is the data an
              accreditation report is built from.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {sdgCoverage.map((goal) => (
                <Link
                  key={goal}
                  href={sdgPath(goal)}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:border-border-strong"
                >
                  <span className="grid size-6 place-items-center rounded bg-accent-fill font-mono text-xs font-bold text-fg-on-accent">
                    {goal}
                  </span>
                  {SDG_BY_NUMBER[goal]?.title}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {faculty.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold md:text-2xl">Faculty</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {faculty.map((person) => (
                <Card key={person.username} interactive className="relative flex gap-3 p-4">
                  <Avatar name={person.name} seed={person.username} size="md" verified />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      <Link href={`/p/${person.username}`} className="after:absolute after:inset-0">
                        {person.name}
                      </Link>
                    </p>
                    <p className="mt-0.5 text-xs text-fg-subtle">{person.designation}</p>
                    <p className="mt-1.5 line-clamp-2 text-xs text-fg-muted">{person.headline}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold md:text-2xl">
            Published projects ({projects.length})
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} showCollege={false} />
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
