import { slugify } from '../lib/utils';

/**
 * Transliterates Cyrillic (Bulgarian) characters to their closest Latin
 * equivalents so place names produce readable URL slugs instead of
 * being stripped out entirely by `slugify`.
 */
const CYRILLIC_TO_LATIN: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's',
    т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht',
    ъ: 'a', ь: 'y', ю: 'yu', я: 'ya',
};

export function transliterate(text: string): string {
    return text
        .split('')
        .map(char => {
            const lower = char.toLowerCase();
            const mapped = CYRILLIC_TO_LATIN[lower];
            return mapped !== undefined ? mapped : char;
        })
        .join('');
}

interface NamedPlace {
    id: string;
    name?: { bg?: string; en?: string };
}

/**
 * Builds a friendly, unique URL slug for each place based on its name
 * in the given language (falling back to the other language, then the
 * place's own id if the name is empty). Duplicate names get a
 * numeric suffix (`-2`, `-3`, ...) to stay unique within the list.
 */
export function getPlaceSlugMap(places: NamedPlace[], lang: 'bg' | 'en' = 'bg'): Map<string, string> {
    const usedCounts = new Map<string, number>();
    const slugMap = new Map<string, string>();

    for (const place of places) {
        const raw = place.name?.[lang] || place.name?.en || place.name?.bg || '';
        const base = slugify(transliterate(raw)) || place.id;

        const count = usedCounts.get(base) || 0;
        usedCounts.set(base, count + 1);
        const candidate = count === 0 ? base : `${base}-${count + 1}`;

        slugMap.set(place.id, candidate);
    }

    return slugMap;
}

/**
 * Resolves a URL segment (friendly slug, legacy id, or legacy numeric index)
 * back to the matching place from the brochure's places list.
 */
export function resolvePlaceByUrlSegment<T extends NamedPlace>(places: T[], segment?: string): T | undefined {
    if (!segment) return undefined;

    const byId = places.find(p => p.id === segment);
    if (byId) return byId;

    const bgMap = getPlaceSlugMap(places, 'bg');
    const bySlugBg = places.find(p => bgMap.get(p.id) === segment);
    if (bySlugBg) return bySlugBg;

    const enMap = getPlaceSlugMap(places, 'en');
    const bySlugEn = places.find(p => enMap.get(p.id) === segment);
    if (bySlugEn) return bySlugEn;

    const numericIdx = Number(segment);
    if (!Number.isNaN(numericIdx)) return places[numericIdx];

    return undefined;
}
