/**
 * The seven fictional opportunity records used by this prototype.
 *
 * IMPORTANT: `activity` and `schedule` are the original fictional source
 * record fields. `tags` are DERIVED by the prototype (an interpretive layer
 * added by the matching engine) — they are NOT facts stated in the source
 * record. The UI always presents them separately for this reason.
 */

export type LocationMode = 'online' | 'in-person';

export interface Opportunity {
  id: string;
  name: string;
  activity: string;
  scheduleDay: string; // e.g. 'Wednesday'
  schedulePart: 'evening' | 'daytime';
  locationMode: LocationMode;
  /** Distance in miles. `undefined` for online roles. `null` when unknown/not recorded. */
  distanceMiles: number | undefined | null;
  requirement: string; // human-readable, also machine-checked via requiresSafeguarding
  requiresSafeguarding: boolean;
  /** Deriving/interpreting tags added by the prototype — not part of the source record. */
  tags: string[];
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'digital-access-buddy',
    name: 'Digital access buddy',
    activity: 'Support adults individually to get online and use everyday services',
    scheduleDay: 'Wednesday',
    schedulePart: 'evening',
    locationMode: 'online',
    distanceMiles: undefined,
    requirement: 'None listed',
    requiresSafeguarding: false,
    tags: ['digital support', 'online assistance', 'one-to-one', 'everyday technology', 'digital inclusion'],
  },
  {
    id: 'community-cafe-host',
    name: 'Community café host',
    activity: 'Welcome visitors and serve refreshments',
    scheduleDay: 'Tuesday',
    schedulePart: 'daytime',
    locationMode: 'in-person',
    distanceMiles: 1,
    requirement: 'None listed',
    requiresSafeguarding: false,
    tags: ['hospitality', 'welcoming people', 'social interaction', 'refreshments'],
  },
  {
    id: 'youth-reading-mentor',
    name: 'Youth reading mentor',
    activity: 'Support young readers one-to-one',
    scheduleDay: 'Thursday',
    schedulePart: 'evening',
    locationMode: 'in-person',
    distanceMiles: 2,
    requirement: 'Verified safeguarding clearance',
    requiresSafeguarding: true,
    tags: ['one-to-one', 'mentoring', 'reading', 'youth support'],
  },
  {
    id: 'food-parcel-packer',
    name: 'Food parcel packer',
    activity: 'Pack parcels alongside a small team',
    scheduleDay: 'Tuesday',
    schedulePart: 'evening',
    locationMode: 'in-person',
    distanceMiles: 2,
    requirement: 'None listed',
    requiresSafeguarding: false,
    tags: ['practical support', 'teamwork', 'food support', 'community assistance'],
  },
  {
    id: 'conversation-partner',
    name: 'Conversation partner',
    activity: 'Help adults practise English individually',
    scheduleDay: 'Monday',
    schedulePart: 'evening',
    locationMode: 'in-person',
    distanceMiles: 5,
    requirement: 'None listed',
    requiresSafeguarding: false,
    tags: ['one-to-one', 'conversation', 'English language support', 'communication'],
  },
  {
    id: 'form-filling-volunteer',
    name: 'Form-filling volunteer',
    activity: 'Help people individually with online forms',
    scheduleDay: 'Thursday',
    schedulePart: 'evening',
    locationMode: 'in-person',
    // Distance is deliberately MISSING. The engine must not invent a value
    // or assume it falls inside the volunteer's travel limit.
    distanceMiles: null,
    requirement: 'None listed',
    requiresSafeguarding: false,
    tags: ['one-to-one', 'digital support', 'online forms', 'practical assistance', 'administrative support'],
  },
  {
    id: 'digital-skills-facilitator',
    name: 'Digital skills facilitator',
    activity: 'Lead a group session on smartphone basics',
    scheduleDay: 'Friday',
    schedulePart: 'evening',
    locationMode: 'in-person',
    distanceMiles: 1,
    requirement: 'None listed',
    requiresSafeguarding: false,
    tags: ['digital skills', 'smartphone support', 'group facilitation', 'teaching', 'technology'],
  },
];
