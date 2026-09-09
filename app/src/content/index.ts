import { colleges, collegeBySlug } from "@/content/colleges";
import { ideas } from "@/content/ideas";
import { articles } from "@/content/knowledge";
import { people, personByUsername } from "@/content/people";
import { projects } from "@/content/projects";
import type { Project } from "@/content/types";
import { resolveVisibility, type ResolvedVisibility } from "@/lib/seo/visibility";

/**
 * The public view of the content set.
 *
 * **Every public page reads from here, never from the raw fixture arrays.**
 * That is the same discipline the Phase 3 query layer will enforce: the
 * visibility predicate lives in one place, so a page cannot forget it.
 *
 * When Phase 3 lands, these functions keep their signatures and their bodies
 * become database queries. The pages do not change.
 */

/** Resolves a project's visibility, folding in its college's verification. */
export function projectVisibility(project: Project, now = new Date()): ResolvedVisibility {
  return resolveVisibility(
    {
      visibility: project.visibility,
      embargoUntil: project.embargoUntil,
      collegeVerified: collegeBySlug[project.collegeSlug]?.verified ?? false,
      approved: project.approved,
    },
    now,
  );
}

/** Projects a logged-out visitor may see. The single source for every listing. */
export function publicProjects(now = new Date()): Project[] {
  return projects
    .filter((project) => projectVisibility(project, now).publiclyReadable)
    .sort((a, b) => (b.publishedOn ?? b.startedOn).localeCompare(a.publishedOn ?? a.startedOn));
}

/** A single public project, or null. Null rather than 403 — see ARCHITECTURE.md §2. */
export function publicProject(slug: string, now = new Date()): Project | null {
  const project = projects.find((p) => p.slug === slug);
  if (!project) return null;
  return projectVisibility(project, now).publiclyReadable ? project : null;
}

/** Public profiles only. A private profile must not appear in any listing. */
export function publicPeopleList() {
  return people.filter((person) => {
    if (person.visibility !== "PUBLIC") return false;
    return collegeBySlug[person.collegeSlug]?.verified ?? false;
  });
}

export function publicPerson(username: string) {
  const person = personByUsername[username];
  if (!person || person.visibility !== "PUBLIC") return null;
  if (!collegeBySlug[person.collegeSlug]?.verified) return null;
  return person;
}

/** Verified colleges only. */
export function publicCollegeList() {
  return colleges.filter((c) => c.verified);
}

export function publicCollege(slug: string) {
  const college = collegeBySlug[slug];
  return college?.verified ? college : null;
}

/** Ideas from verified colleges. */
export function publicIdeas() {
  return ideas
    .filter((idea) => collegeBySlug[idea.collegeSlug]?.verified)
    .sort((a, b) => b.postedOn.localeCompare(a.postedOn));
}

export function publicIdea(slug: string) {
  const idea = ideas.find((i) => i.slug === slug);
  if (!idea) return null;
  return collegeBySlug[idea.collegeSlug]?.verified ? idea : null;
}

export function publicArticles() {
  return [...articles].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
}

/* ------------------------------------------------------------- derivations */

export function projectsByTopic(topicSlug: string, now = new Date()): Project[] {
  return publicProjects(now).filter((p) => p.topics.includes(topicSlug));
}

export function projectsBySdg(goal: number, now = new Date()): Project[] {
  return publicProjects(now).filter((p) => p.sdgs.includes(goal));
}

export function projectsByCollege(collegeSlug: string, now = new Date()): Project[] {
  return publicProjects(now).filter((p) => p.collegeSlug === collegeSlug);
}

export function projectsByPerson(username: string, now = new Date()): Project[] {
  return publicProjects(now).filter((p) => p.members.some((m) => m.username === username));
}

export function ideasByPerson(username: string) {
  return publicIdeas().filter((idea) => idea.postedBy === username);
}

/**
 * Public lineage of a project: its readable parents and children.
 *
 * A parent that is private is omitted rather than shown as a broken link — the
 * lineage is real, but a visitor has no business learning that a private
 * project exists.
 */
export function publicLineage(project: Project, now = new Date()) {
  const parents = (project.buildsOn ?? [])
    .map((link) => {
      const parent = publicProject(link.slug, now);
      return parent ? { project: parent, kind: link.kind, note: link.note } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const children = publicProjects(now)
    .filter((candidate) => candidate.buildsOn?.some((b) => b.slug === project.slug))
    .map((child) => {
      const link = child.buildsOn!.find((b) => b.slug === project.slug)!;
      return { project: child, kind: link.kind, note: link.note };
    });

  return { parents, children };
}

/** Descendant count, for the "N groups have built on this" signal. */
export function descendantCount(slug: string, now = new Date(), seen = new Set<string>()): number {
  if (seen.has(slug)) return 0;
  seen.add(slug);
  const children = publicProjects(now).filter((p) => p.buildsOn?.some((b) => b.slug === slug));
  return children.reduce((total, child) => total + 1 + descendantCount(child.slug, now, seen), 0);
}

/**
 * Related projects — shared topics and SDGs, excluding the same project and
 * anything already in its lineage.
 *
 * Deterministic and explainable. Phase 11 replaces this with trigram similarity
 * over the real corpus; the signature stays the same.
 */
export function relatedProjects(project: Project, limit = 3, now = new Date()): Project[] {
  const lineageSlugs = new Set([
    project.slug,
    ...(project.buildsOn ?? []).map((b) => b.slug),
    ...publicLineage(project, now).children.map((c) => c.project.slug),
  ]);

  return publicProjects(now)
    .filter((candidate) => !lineageSlugs.has(candidate.slug))
    .map((candidate) => {
      const sharedTopics = candidate.topics.filter((t) => project.topics.includes(t)).length;
      const sharedSdgs = candidate.sdgs.filter((s) => project.sdgs.includes(s)).length;
      const sameDomain = candidate.domain === project.domain ? 1 : 0;
      return { candidate, score: sharedTopics * 3 + sharedSdgs * 2 + sameDomain };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.slug.localeCompare(b.candidate.slug))
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/** Every year that has a public project, newest first — an explore facet. */
export function projectYears(now = new Date()): number[] {
  const years = new Set(
    publicProjects(now).map((p) => new Date(p.publishedOn ?? p.startedOn).getFullYear()),
  );
  return [...years].sort((a, b) => b - a);
}

/** Distinct tech stack entries across public projects — an explore facet. */
export function techStackOptions(now = new Date()): string[] {
  const stack = new Set(publicProjects(now).flatMap((p) => p.techStack));
  return [...stack].sort();
}
