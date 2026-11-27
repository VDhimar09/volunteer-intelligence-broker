/**
 * A small, transparent vocabulary used to demonstrate semantic matching
 * between the volunteer's words and the opportunity activity text.
 *
 * This is a MANUALLY DEFINED mapping (a hand-written mini taxonomy), not a
 * trained language model. Each entry maps a broad concept to words and
 * phrases that commonly express it. The matching engine expands a
 * volunteer's free-text input through this vocabulary, so "digital support"
 * can recognise "help people get online" or "online forms" without an exact
 * keyword match.
 *
 * Kept deliberately small and inspectable: every expansion the engine makes
 * is shown in the UI so a reader can audit why something matched.
 */

export interface SynonymGroup {
  /** Canonical concept name shown in the UI. */
  concept: string;
  /** Phrases that indicate this concept in free text. Matched case-insensitively. */
  phrases: string[];
}

export const SYNONYM_GROUPS: SynonymGroup[] = [
  {
    concept: 'digital support',
    phrases: [
      'digital support',
      'digital skills',
      'digital inclusion',
      'digital',
      'get online',
      'online assistance',
      'online forms',
      'everyday technology',
      'smartphone',
      'technology',
      'computing',
      'it support',
      'computers',
    ],
  },
  {
    concept: 'one-to-one support',
    phrases: [
      'one-to-one',
      'one to one',
      '1:1',
      'individually',
      'individual support',
      'mentoring',
      'mentor',
      'befriending',
      'buddy',
      'buddying',
      'help people individually',
      'support someone',
      'conversation partner',
    ],
  },
  {
    concept: 'helping people',
    phrases: [
      'helping people',
      'help people',
      'support people',
      'helping adults',
      'support adults',
      'help adults',
      'support young',
      'help young',
      'welcoming people',
      'social interaction',
      'conversation',
      'communication',
    ],
  },
  {
    concept: 'practical / hands-on help',
    phrases: [
      'practical support',
      'practical assistance',
      'practical help',
      'hands-on',
      'pack parcels',
      'food support',
      'food bank',
      'administrative support',
      'admin',
      'form-filling',
      'forms',
    ],
  },
  {
    concept: 'teaching / group facilitation',
    phrases: [
      'teaching',
      'teach',
      'facilitation',
      'facilitate',
      'lead a group',
      'group facilitation',
      'running sessions',
      'presenting',
      'training',
    ],
  },
  {
    concept: 'community / social',
    phrases: [
      'community',
      'community assistance',
      'hospitality',
      'cafe',
      'café',
      'refreshments',
      'teamwork',
      'team',
      'social',
    ],
  },
];

/**
 * Availability keywords used by the BASELINE matcher (exact keyword search).
 * The intelligent matcher uses structured schedule fields instead, which is
 * one of the differences the comparison section demonstrates.
 */
export const AVAILABILITY_KEYWORDS = ['evening', 'evenings', 'daytime', 'weekend', 'flexible'];
