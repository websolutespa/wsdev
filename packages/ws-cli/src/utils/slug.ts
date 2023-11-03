import { slugify } from 'transliteration';

export function textToSlug(value: string): string {
  return slugify(value);
}
