import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * Typed structured-data builders.
 *
 * Phase 1 ships only what the Breadcrumbs component needs. **Phase 2 extends
 * this file** with Organization, WebSite+SearchAction, CreativeWork, ItemList,
 * Person+ProfilePage, CollegeOrUniversity, Article, FAQPage, HowTo and the rest
 * of the map in docs/SEO-CHECKLIST.md §3.
 *
 * One rule, from `AI Overviews.txt`: **structured data must match the visible
 * text on the page.** Never emit a value the reader cannot also see.
 */

export type JsonLdObject = Record<string, unknown>;

/**
 * Renders a JSON-LD script tag.
 *
 * The payload is serialised with `<` escaped, so a string containing `</script>`
 * cannot break out of the tag. That matters here because later phases will feed
 * this user-authored project titles.
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export type Crumb = { label: string; href: string };

export function breadcrumbList(crumbs: Crumb[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: absoluteUrl(crumb.href),
    })),
  };
}
