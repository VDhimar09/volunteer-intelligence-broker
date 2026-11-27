/**
 * Free-text concept expansion.
 *
 * Maps free-text input onto the small, hand-defined concept vocabulary in
 * `synonyms.ts`. This is what lets the intelligent matcher recognise that
 * "digital support" relates to "help people get online" without an exact
 * keyword match. It is deliberately simple and inspectable — it is NOT a
 * trained language model or embeddings-based semantic search.
 */

import { SYNONYM_GROUPS } from '../data/synonyms';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

/** Concept names whose phrases appear anywhere in the given free text. */
export function expandConcepts(text: string): Set<string> {
  const t = ` ${norm(text)} `;
  const found = new Set<string>();
  for (const group of SYNONYM_GROUPS) {
    for (const phrase of group.phrases) {
      const p = norm(phrase);
      if (t.includes(` ${p} `) || t.includes(` ${p}`) || t.includes(`${p} `)) {
        found.add(group.concept);
        break;
      }
    }
  }
  return found;
}

/** Any exact phrases (from the vocabulary) that literally appear in the text. */
export function matchedPhrases(text: string): string[] {
  const t = norm(text);
  const hits: string[] = [];
  for (const group of SYNONYM_GROUPS) {
    for (const phrase of group.phrases) {
      if (t.includes(norm(phrase))) hits.push(phrase);
    }
  }
  return hits;
}

/**
 * Which opportunity-side phrases connect a volunteer concept to a given
 * opportunity. Used to generate human-readable "why it matches" text,
 * e.g. concept "digital support" connected via the opportunity phrase
 * "get online".
 */
export function connectingPhrases(oppText: string, concepts: Iterable<string>): Record<string, string[]> {
  const t = norm(oppText);
  const result: Record<string, string[]> = {};
  for (const group of SYNONYM_GROUPS) {
    if (!new Set(concepts).has(group.concept)) continue;
    const hits = group.phrases.filter((p) => t.includes(norm(p)));
    if (hits.length) result[group.concept] = hits;
  }
  return result;
}
