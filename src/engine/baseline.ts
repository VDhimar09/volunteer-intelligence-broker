/**
 * Baseline matcher: a deliberately simple "search box + filters" approach.
 *
 * It uses exact keyword matching only (no concept expansion), and applies
 * availability and distance as plain filters. No preference ranking, and no
 * handling of unknown values — an opportunity with missing data either
 * passes a keyword filter or drops out entirely.
 *
 * Used only for the comparison section, to illustrate what a simple keyword
 * search would and would not find on this tiny fictional dataset.
 */

import type { Opportunity } from '../data/opportunities';
import { OPPORTUNITIES } from '../data/opportunities';
import type { VolunteerProfile } from '../data/volunteer';
import { AVAILABILITY_KEYWORDS } from '../data/synonyms';

export interface BaselineResult {
  opportunity: Opportunity;
  keywordHit: boolean;
  availabilityPass: boolean;
  distancePass: boolean;
  included: boolean;
}

/** Extract literal keywords from the volunteer's free-text inputs. */
export function baselineKeywords(profile: VolunteerProfile): string[] {
  const words = `${profile.preferredActivity} ${profile.skills}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'for', 'with', 'support'].includes(w));
  return [...new Set(words)];
}

function textOf(opp: Opportunity): string {
  return `${opp.name} ${opp.activity} ${opp.tags.join(' ')}`.toLowerCase();
}

export function runBaseline(profile: VolunteerProfile, opportunities: Opportunity[] = OPPORTUNITIES): BaselineResult[] {
  const keywords = baselineKeywords(profile);

  return opportunities.map((opp) => {
    const text = textOf(opp);
    const keywordHit = keywords.some((k) => text.includes(k));

    // Availability as a naive text/date filter.
    const availabilityPass =
      profile.availability === 'flexible' ||
      (profile.availability === 'weekday-evenings' && opp.schedulePart === 'evening') ||
      (profile.availability === 'weekday-daytimes' && opp.schedulePart === 'daytime') ||
      (profile.availability === 'weekdays-flexible' && !opp.scheduleDay.startsWith('S')) ||
      // 'weekends' cannot be expressed by this dataset's weekday schedule.
      (profile.availability === 'weekends' && false);

    // Distance: the baseline has no notion of "unknown", so a missing value
    // silently fails the filter (or, phrased honestly: it cannot pass it).
    const distancePass =
      opp.locationMode === 'online' ||
      (opp.distanceMiles !== null && opp.distanceMiles !== undefined && opp.distanceMiles <= profile.maxTravelMiles);

    const included = keywordHit && availabilityPass && distancePass;

    return { opportunity: opp, keywordHit, availabilityPass, distancePass, included };
  });
}

export { AVAILABILITY_KEYWORDS };
