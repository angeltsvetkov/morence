/**
 * Builds the base brochure path for the current context.
 * When `slug` is provided, links stay scoped to that apartment
 * (`/apartments/:slug/brochure`). When it's omitted (the default
 * apartment's brochure, served at the bare `/brochure` URL), the
 * base path stays `/brochure` so the apartment ID is never exposed
 * in the URL.
 */
export function brochureBasePath(slug?: string): string {
    return slug ? `/apartments/${slug}/brochure` : '/brochure';
}
