import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ExternalIcon, LockIcon } from "@/components/icons";
import { Container } from "@/components/layout/primitives";
import { ProjectCard } from "@/components/project/project-card";
import { Avatar, Badge, Card, Divider, TierBadge } from "@/components/ui/display";
import { Breadcrumbs } from "@/components/ui/navigation";
import { collegeBySlug } from "@/content/colleges";
import { people } from "@/content/people";
import { ideasByPerson, projectsByPerson, publicPerson } from "@/content";
import { JsonLd, breadcrumbList, personProfile } from "@/lib/seo/jsonld";
import { buildMetadata, ensureDescription } from "@/lib/seo/metadata";

/**
 * The public academic profile.
 *
 * Two privacy properties matter more than anything on this page, and both are
 * enforced by *not fetching* rather than by hiding:
 *
 *  1. **A non-public profile has no page.** It is excluded from
 *     `generateStaticParams`, so the route does not exist and returns 404.
 *  2. **Hidden means absent from the HTML**, never CSS-hidden. Rendering a
 *     private field and hiding it visually is a data leak that "view source"
 *     and any crawler both defeat.
 *
 * Contact details are additionally wrapped in `data-nosnippet` so they cannot
 * surface in a search snippet even when the user has made them public.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return people
    .filter((p) => p.visibility === "PUBLIC" && collegeBySlug[p.collegeSlug]?.verified)
    .map((p) => ({ username: p.username }));
}

export async function generateMetadata(props: PageProps<"/p/[username]">): Promise<Metadata> {
  const { username } = await props.params;
  const person = publicPerson(username);
  if (!person) {
    return buildMetadata({
      title: "Profile not available",
      description: "This profile is private or does not exist.",
      path: `/p/${username}`,
      index: false,
    });
  }

  const projects = projectsByPerson(username);
  return buildMetadata({
    title: person.name,
    description: ensureDescription(
      `${person.headline}. ${projects.length} published ${projects.length === 1 ? "project" : "projects"} at ${collegeBySlug[person.collegeSlug]?.shortName ?? "a verified college"}.`,
      `Skills backed by project evidence and faculty attestation, in ${person.department}.`,
    ),
    path: `/p/${username}`,
    type: "profile",
    og: {
      eyebrow: person.role === "faculty" ? "Faculty" : "Student",
      chips: [collegeBySlug[person.collegeSlug]?.shortName ?? ""].filter(Boolean),
    },
  });
}

export default async function ProfilePage(props: PageProps<"/p/[username]">) {
  const { username } = await props.params;
  const person = publicPerson(username);
  if (!person) notFound();

  const college = collegeBySlug[person.collegeSlug];
  const projects = projectsByPerson(username);
  const ideas = ideasByPerson(username);

  const attestedSkills = person.skills.filter((s) => s.tier === "attested");
  const evidencedSkills = person.skills.filter((s) => s.tier === "evidenced");
  const selfSkills = person.skills.filter((s) => s.tier === "self");

  const crumbs = [
    ...(college ? [{ label: college.shortName, href: `/colleges/${college.slug}` }] : []),
    { label: person.name, href: `/p/${username}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          ...personProfile({
            name: person.name,
            username: person.username,
            headline: person.headline,
            bio: person.bio,
            college: college ? { name: college.name, slug: college.slug } : undefined,
            skills: person.skills.map((s) => s.name),
            links: person.links?.map((l) => l.url),
            role: person.designation ?? person.programme,
          }),
          breadcrumbList(crumbs),
        ]}
      />

      <Container className="py-10 md:py-12">
        <Breadcrumbs crumbs={crumbs} className="mb-6" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <header className="flex flex-wrap items-start gap-5">
              <Avatar
                name={person.name}
                seed={person.username}
                size="xl"
                verified={person.role === "faculty"}
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-3xl font-bold md:text-4xl">{person.name}</h1>
                <p className="mt-2 text-base text-fg-muted md:text-lg">{person.headline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="primary" className="capitalize">
                    {person.role}
                  </Badge>
                  {college ? (
                    <Link href={`/colleges/${college.slug}`}>
                      <Badge tone="outline">{college.shortName}</Badge>
                    </Link>
                  ) : null}
                  <Badge tone="outline">{person.department}</Badge>
                </div>
              </div>
            </header>

            <section className="mt-10">
              <h2 className="border-b border-border pb-2 font-display text-xl font-bold">About</h2>
              <p className="mt-4 max-w-[68ch] leading-relaxed text-fg-muted">{person.bio}</p>
            </section>

            {projects.length > 0 ? (
              <section className="mt-10">
                <h2 className="border-b border-border pb-2 font-display text-xl font-bold">
                  Published projects ({projects.length})
                </h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {projects.map((project) => (
                    <ProjectCard key={project.slug} project={project} showCollege={false} />
                  ))}
                </div>
              </section>
            ) : null}

            {ideas.length > 0 ? (
              <section className="mt-10">
                <h2 className="border-b border-border pb-2 font-display text-xl font-bold">
                  Ideas posted
                </h2>
                <ul className="mt-4 space-y-2">
                  {ideas.map((idea) => (
                    <li key={idea.slug}>
                      <Link
                        href={`/ideas/${idea.slug}`}
                        className="-mx-3 block rounded-lg px-3 py-2.5 hover:bg-surface-raised"
                      >
                        <span className="block text-sm font-medium">{idea.title}</span>
                        <span className="mt-0.5 block text-xs text-fg-subtle">{idea.summary}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {person.achievements && person.achievements.length > 0 ? (
              <section className="mt-10">
                <h2 className="border-b border-border pb-2 font-display text-xl font-bold">
                  Achievements
                </h2>
                <ul className="mt-4 space-y-3">
                  {person.achievements.map((achievement) => (
                    <li key={achievement.title} className="flex gap-3">
                      <span className="font-mono text-sm text-fg-subtle tabular-nums">
                        {achievement.year}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{achievement.title}</span>
                        {achievement.detail ? (
                          <span className="block text-sm text-fg-subtle">{achievement.detail}</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="p-5">
              <h2 className="text-sm font-semibold">Skills</h2>
              <p className="mt-1.5 text-xs text-fg-subtle">
                Skills here point at evidence. A claim is a claim; an attested skill was signed by a
                named faculty member.
              </p>

              {attestedSkills.length > 0 ? (
                <div className="mt-4">
                  <TierBadge tier="attested" />
                  <ul className="mt-2.5 space-y-1.5">
                    {attestedSkills.map((skill) => (
                      <li key={skill.name} className="text-sm">
                        {skill.name}
                        {skill.fromProjects ? (
                          <span className="text-xs text-fg-subtle">
                            {" "}
                            · {skill.fromProjects} projects
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {evidencedSkills.length > 0 ? (
                <div className="mt-4">
                  <TierBadge tier="evidenced" />
                  <ul className="mt-2.5 space-y-1.5">
                    {evidencedSkills.map((skill) => (
                      <li key={skill.name} className="text-sm">
                        {skill.name}
                        {skill.fromProjects ? (
                          <span className="text-xs text-fg-subtle">
                            {" "}
                            · {skill.fromProjects} projects
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {selfSkills.length > 0 ? (
                <div className="mt-4">
                  <TierBadge tier="self" />
                  <ul className="mt-2.5 space-y-1.5">
                    {selfSkills.map((skill) => (
                      <li key={skill.name} className="text-sm text-fg-muted">
                        {skill.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold">Details</h2>
              <dl className="mt-3 space-y-2.5 text-sm">
                {person.programme ? (
                  <div>
                    <dt className="text-xs text-fg-subtle">Programme</dt>
                    <dd>
                      {person.programme}
                      {person.year ? `, year ${person.year}` : ""}
                    </dd>
                  </div>
                ) : null}
                {person.designation ? (
                  <div>
                    <dt className="text-xs text-fg-subtle">Designation</dt>
                    <dd>{person.designation}</dd>
                  </div>
                ) : null}
                {person.graduationYear ? (
                  <div>
                    <dt className="text-xs text-fg-subtle">Graduated</dt>
                    <dd>{person.graduationYear}</dd>
                  </div>
                ) : null}
                {person.currentRole ? (
                  <div>
                    <dt className="text-xs text-fg-subtle">Currently</dt>
                    <dd>
                      {person.currentRole}
                      {person.organisation ? `, ${person.organisation}` : ""}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {person.interests.length > 0 ? (
                <>
                  <Divider className="my-4" />
                  <h3 className="text-sm font-semibold">Interests</h3>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {person.interests.map((interest) => (
                      <Badge key={interest} tone="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </>
              ) : null}
            </Card>

            {person.expertise && person.expertise.length > 0 ? (
              <Card className="p-5">
                <h2 className="text-sm font-semibold">Expertise</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {person.expertise.map((area) => (
                    <Badge key={area} tone="accent">
                      {area}
                    </Badge>
                  ))}
                </div>
              </Card>
            ) : null}

            {/* Links are user-supplied, so rel="ugc". data-nosnippet keeps any
                contact detail out of a search snippet even when public. */}
            {person.links && person.links.length > 0 ? (
              <Card className="p-5" data-nosnippet>
                <h2 className="text-sm font-semibold">Links</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {person.links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        rel="ugc noopener"
                        className="inline-flex items-center gap-1.5 text-primary-600 hover:underline"
                      >
                        {link.label} <ExternalIcon size={12} />
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {!person.contactable ? (
              <p className="flex items-start gap-2 text-xs text-fg-subtle">
                <LockIcon size={14} className="mt-0.5 shrink-0" />
                This person has not opted into being contacted through Nexivora.
              </p>
            ) : null}
          </aside>
        </div>
      </Container>
    </>
  );
}
