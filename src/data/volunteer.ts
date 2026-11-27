/**
 * Volunteer profile types and the two fictional demonstration cases.
 * The prototype stores NO real personal data — these are illustrative inputs.
 */

export type Availability =
  | 'weekday-evenings'
  | 'weekday-daytimes'
  | 'weekdays-flexible'
  | 'weekends'
  | 'flexible';

export type SafeguardingStatus = 'unknown' | 'valid' | 'not-valid';

export interface VolunteerProfile {
  availability: Availability;
  /** Free-text statement of preferred activity, e.g. "one-to-one support". */
  preferredActivity: string;
  /** Free-text skills / interests, e.g. "digital support". */
  skills: string;
  /** Maximum travel distance in miles (in-person roles only). */
  maxTravelMiles: number;
  /** Whether the volunteer is willing to volunteer online. */
  onlineVolunteering: boolean;
  safeguarding: SafeguardingStatus;
}

export const DEFAULT_PROFILE: VolunteerProfile = {
  availability: 'weekday-evenings',
  preferredActivity: 'one-to-one support',
  skills: 'digital support',
  maxTravelMiles: 3,
  onlineVolunteering: true,
  safeguarding: 'unknown',
};

/**
 * Case A: wants to help people one-to-one, ideally using digital support
 * skills, weekday evenings only, online acceptable, max 3 miles travel,
 * safeguarding validity unknown.
 */
export const CASE_A: VolunteerProfile = {
  availability: 'weekday-evenings',
  preferredActivity: 'one-to-one support',
  skills: 'digital support',
  maxTravelMiles: 3,
  onlineVolunteering: true,
  safeguarding: 'unknown',
};

/**
 * Case B: identical to Case A except online volunteering is no longer
 * possible. Everything else stays the same.
 */
export const CASE_B: VolunteerProfile = {
  ...CASE_A,
  onlineVolunteering: false,
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  'weekday-evenings': 'Weekday evenings only',
  'weekday-daytimes': 'Weekday daytimes only',
  'weekdays-flexible': 'Weekdays (day or evening)',
  weekends: 'Weekends only',
  flexible: 'Flexible (any time)',
};

export const SAFEGUARDING_LABELS: Record<SafeguardingStatus, string> = {
  unknown: 'Unknown / not yet confirmed',
  valid: 'Valid clearance',
  'not-valid': 'Not valid / lapsed',
};
