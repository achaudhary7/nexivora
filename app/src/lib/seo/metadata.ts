import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

/**
 * The metadata builder. Every page in the product goes through this.
 *
 * No page hand-writes a <title>, a canonical or a robots tag — the per-page SEO
 * contract in docs/SEO-CHECKLIST.md §2 is enforced here by construction.
 *
 * Length limits come from the Google Search Central docs in ../SEO IMPs:
 *   - Titles: specific, under ~60 characters, never boilerplate (Title.txt)
 *   - Descriptions: a human summary of THIS page, 140-160 characters
 */

export const TITLE_MAX = 60;
export const DESCRIPTION_MIN = 110;
export const DESCRIPTION_MAX = 160;

export type BuildMetadataInput = {
  /** The page-specific part. The site name is appended automatically. */
  title: string;
  /** Written for this page. Never templated — a templated description is a duplicate. */
  description: string;
  /** Path only, e.g. "/explore". The canonical is built from NEXT_PUBLIC_SITE_URL. */
  path: string;
  /** Omit for the generated OG image at the same path. */
  image?: string;
  /** OpenGraph type. "article" for knowledge posts, "profile" for people. */
  type?: "website" | "article" | "profile";
  /**
   * Set false for anything private, personal or a filter permutation.
   * Derived from a resource's visibility via resolveVisibility(), never guessed.
   */
  index?: boolean;
  /** Suppresses the "· Nexivora" suffix. Used only by the home page. */
  absoluteTitle?: boolean;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

/** Absolute URL from a path. Every canonical and OG URL goes through this. */
export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const suffix = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const {
    title,
    description,
    path,
    image,
    type = "website",
    index = true,
    absoluteTitle = false,
    keywords,
    publishedTime,
    modifiedTime,
    authors,
  } = input;

  const fullTitle = absoluteTitle ? title : `${title} · ${siteConfig.name}`;
  const canonical = absoluteUrl(path);
  const ogImage =
    image ?? absoluteUrl(path === "/" ? "/opengraph-image" : `${path}/opengraph-image`);

  if (process.env.NODE_ENV !== "production") {
    warnOnContractBreach(fullTitle, description, path);
  }

  return {
    // `absolute` is load-bearing: the root layout declares a title TEMPLATE
    // ("%s · Nexivora"), and buildMetadata already appends the site name. A
    // plain string here gets the template applied on top and renders
    // "Style guide · Nexivora · Nexivora". Caught by the Phase 1 crawl.
    title: { absolute: fullTitle },
    description,
    keywords,
    authors: authors?.map((name) => ({ name })),
    alternates: { canonical },
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            // Large image previews are required for Google Discover eligibility.
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      creator: siteConfig.social.twitter,
    },
  };
}

/**
 * Development-time warnings for our own SEO contract.
 *
 * These are warnings rather than errors so a page in progress is not blocked,
 * but scripts/check-seo.mjs turns the same rules into a hard failure across the
 * whole route table before a phase can be called complete.
 */
function warnOnContractBreach(title: string, description: string, path: string) {
  if (title.length > TITLE_MAX) {
    console.warn(`[seo] Title too long (${title.length} > ${TITLE_MAX}) on ${path}: "${title}"`);
  }
  if (description.length > DESCRIPTION_MAX) {
    console.warn(
      `[seo] Description too long (${description.length} > ${DESCRIPTION_MAX}) on ${path}`,
    );
  }
  if (description.length < DESCRIPTION_MIN) {
    console.warn(
      `[seo] Description too short (${description.length} < ${DESCRIPTION_MIN}) on ${path}`,
    );
  }
}
