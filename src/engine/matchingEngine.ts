/**
 * The matching engine.
 *
 * Two-stage, deterministic and inspectable:
 *
 *   Stage 1 – HARD CONSTRAINTS (eligibility & feasibility). Availability,
 *   online/in-person mode, travel distance and essential eligibility are
 *   checked FIRST. A known violation means the opportunity is Excluded — a
 *   high preference score can never override this. A required fact that is
 *   unknown (e.g. missing distance, unconfirmed safeguarding) means the
 *   opportunity is Conditional, never silently treated as satisfied.
 *
 *   Stage 2 – PREFERENCE RANKING. Only Confirmed-viable and Conditional
 *   opportunities are scored (0-100 illustrative points) and ranked.
 *
 * Every check returns a machine-readable result plus a plain-language
 * reason, so the UI explanations are generated FROM the logic rather than
 * hand-written next to it.
 */

import type { Opportunity } from '../data/opportunities';
import { OPPORTUNITIES } from '../data/opportunities';
import type { VolunteerProfile } from '../data/volunteer';
import { scoreOpportunity, type ScoreBreakdown } from './scoring';

export type MatchStatus = 'confirmed' | 'conditional' | 'excluded';
export type ConstraintState = 'pass' | 'fail' | 'unknown';

export interface ConstraintCheck {
  id: 'availability' | 'mode' | 'distance' | 'eligibility';
  label: string;
  state: ConstraintState;
  reason: string;
}

export interface OpportunityMatch {
  opportunity: Opportunity;
  status: MatchStatus;
  checks: ConstraintCheck[];
  /** Set only for confirmed / conditional opportunities. */
  score?: ScoreBreakdown;
  /** Failed constraint ids, for the excluded section. */
  failedReasons: string[];
  /** Constraint ids in `unknown` state, for conditional status. */
  unknownReasons: string[];
  /** Positive explanations (why recommended). */
  whyMatches: string[];
  /** Satisfied preference statements. */
  satisfiesPreferences: string[];
  /** Limitations / caveats specific to this match. */
  limitations: string[];
  /** Missing information or outstanding checks. */
  missingInfo: string[];
  rankingReason: string;
}

export interface MatchResult {
  /** Up to three ranked recommendations (confirmed and conditional). */
  recommendations: OpportunityMatch[];
  /** Everything that did not make the top three, incl. all excluded. */
  others: OpportunityMatch[];
  all: OpportunityMatch[];
}

// --- Stage 1: individual hard-constraint checks ---------------------------

function checkAvailability(opp: Opportunity, profile: VolunteerProfile): ConstraintCheck {
  if (profile.availability === 'flexible') {
    return { id: 'availability', label: 'Availability', state: 'pass', reason: 'You are available at any time.' };
  }
  if (profile.availability === 'weekdays-flexible') {
    const pass = !['Saturday', 'Sunday'].includes(opp.scheduleDay);
    return {
      id: 'availability',
      label: 'Availability',
      state: pass ? 'pass' : 'fail',
      reason: pass
        ? `Runs on ${opp.scheduleDay} ${opp.schedulePart}, within your weekday availability.`
        : `Runs on a weekend, which is outside your weekday availability.`,
    };
  }
  const needPart = profile.availability === 'weekday-evenings' ? 'evening' : 'daytime';
  const pass = opp.schedulePart === needPart;
  return {
    id: 'availability',
    label: 'Availability',
    state: pass ? 'pass' : 'fail',
    reason: pass
      ? `Runs on ${opp.scheduleDay} ${needPart}, which fits your availability.`
      : `Runs on ${opp.scheduleDay} ${opp.schedulePart}. You are only available on weekday ${needPart}s, so this clashes.`,
  };
}

function checkMode(opp: Opportunity, profile: VolunteerProfile): ConstraintCheck {
  if (opp.locationMode === 'online') {
    return profile.onlineVolunteering
      ? {
          id: 'mode',
          label: 'Online / in-person',
          state: 'pass',
          reason: 'This is an online opportunity and online volunteering is acceptable to you.',
        }
      : {
          id: 'mode',
          label: 'Online / in-person',
          state: 'fail',
          reason: 'This is an online-only opportunity and online volunteering is currently disabled in your profile.',
        };
  }
  return {
    id: 'mode',
    label: 'Online / in-person',
    state: 'pass',
    reason: 'This is an in-person opportunity, which is compatible with your profile.',
  };
}

function checkDistance(opp: Opportunity, profile: VolunteerProfile): ConstraintCheck {
  // Online roles: travel distance simply does not apply.
  if (opp.locationMode === 'online') {
    return { id: 'distance', label: 'Travel distance', state: 'pass', reason: 'Online role — no travel required, so your travel limit does not apply.' };
  }
  if (opp.distanceMiles === null || opp.distanceMiles === undefined) {
    // An in-person role with no recorded distance is treated as unknown,
    // never assumed to be within the volunteer's limit.
    return {
      id: 'distance',
      label: 'Travel distance',
      state: 'unknown',
      reason: `The distance is not recorded, so travel eligibility cannot be confirmed against your ${profile.maxTravelMiles}-mile limit. The prototype does not assume it is within the limit.`,
    };
  }
  const unit = opp.distanceMiles === 1 ? 'mile' : 'miles';
  return opp.distanceMiles <= profile.maxTravelMiles
    ? { id: 'distance', label: 'Travel distance', state: 'pass', reason: `${opp.distanceMiles} ${unit} away — within your ${profile.maxTravelMiles}-mile limit.` }
    : { id: 'distance', label: 'Travel distance', state: 'fail', reason: `${opp.distanceMiles} ${unit} away, which exceeds your ${profile.maxTravelMiles}-mile travel limit.` };
}

function checkEligibility(opp: Opportunity, profile: VolunteerProfile): ConstraintCheck {
  if (!opp.requiresSafeguarding) {
    return { id: 'eligibility', label: 'Essential eligibility', state: 'pass', reason: 'No essential requirements listed beyond standard checks.' };
  }
  if (profile.safeguarding === 'valid') {
    return { id: 'eligibility', label: 'Essential eligibility', state: 'pass', reason: 'Requires verified safeguarding clearance, and your clearance is recorded as valid.' };
  }
  if (profile.safeguarding === 'not-valid') {
    return { id: 'eligibility', label: 'Essential eligibility', state: 'fail', reason: 'Requires verified safeguarding clearance, but your clearance is recorded as not valid.' };
  }
  return {
    id: 'eligibility',
    label: 'Essential eligibility',
    state: 'unknown',
    reason: 'Requires verified safeguarding clearance, but your status is unknown. This must be confirmed before the role can be treated as a confirmed match.',
  };
}

// --- Stage 2 explanation helpers -------------------------------------------

function buildPositiveExplanations(
  opp: Opportunity,
  profile: VolunteerProfile,
  checks: ConstraintCheck[],
  score: ScoreBreakdown
): { whyMatches: string[]; satisfies: string[]; limitations: string[]; missing: string[] } {
  const why: string[] = [];
  const satisfies: string[] = [];
  const limitations: string[] = [];
  const missing: string[] = [];

  for (const check of checks) {
    if (check.state === 'pass' && check.id !== 'eligibility') why.push(check.reason);
  }

  const activity = score.criteria.find((c) => c.id === 'activity')!;
  const skills = score.criteria.find((c) => c.id === 'skills')!;
  const oneToOne = score.criteria.find((c) => c.id === 'one-to-one')!;

  if (activity.awarded >= 21) why.push(activity.reasons[0]);
  if (skills.awarded > 0) why.push(skills.reasons[0]);
  if (oneToOne.awarded >= 20) why.push(oneToOne.reasons[0]);

  for (const criterion of score.criteria) {
    if (criterion.awarded > 0) satisfies.push(...criterion.reasons);
  }

  if (score.criteria.find((c) => c.id === 'one-to-one')!.awarded <= 4) {
    limitations.push('You prefer one-to-one support; this role is group- or team-based.');
  }
  if (score.criteria.find((c) => c.id === 'activity')!.awarded < 21) {
    limitations.push('Only a partial link to your stated interest, based on a small hand-defined vocabulary.');
  }

  const distance = checks.find((c) => c.id === 'distance')!;
  if (distance.state === 'unknown') missing.push(distance.reason);
  const eligibility = checks.find((c) => c.id === 'eligibility')!;
  if (eligibility.state === 'unknown') missing.push(eligibility.reason);

  return { whyMatches: why, satisfies, limitations, missing };
}

// --- Full pipeline ---------------------------------------------------------

export function runMatching(profile: VolunteerProfile, opportunities: Opportunity[] = OPPORTUNITIES): MatchResult {
  const matches: OpportunityMatch[] = opportunities.map((opp) => {
    const checks = [
      checkAvailability(opp, profile),
      checkMode(opp, profile),
      checkDistance(opp, profile),
      checkEligibility(opp, profile),
    ];

    const failedReasons = checks.filter((c) => c.state === 'fail').map((c) => c.reason);
    const unknownReasons = checks.filter((c) => c.state === 'unknown').map((c) => c.reason);

    // Stage 1 outcome: any known failure => excluded. Any unknown => conditional.
    const status: MatchStatus =
      failedReasons.length > 0 ? 'excluded' : unknownReasons.length > 0 ? 'conditional' : 'confirmed';

    // Stage 2 runs for confirmed and conditional only. Excluded opportunities
    // are never scored — a high preference score cannot override a failed
    // hard constraint.
    const scored = status !== 'excluded';
    const score = scored ? scoreOpportunity(opp, profile) : undefined;

    let whyMatches: string[] = [];
    let satisfiesPreferences: string[] = [];
    let limitations: string[] = [];
    let missingInfo: string[] = failedReasons;

    if (score) {
      const positives = buildPositiveExplanations(opp, profile, checks, score);
      whyMatches = positives.whyMatches;
      satisfiesPreferences = positives.satisfies;
      limitations = positives.limitations;
      missingInfo = [...unknownReasons, ...positives.missing];
    }

    const rankingReason = scored
      ? status === 'confirmed'
        ? `Ranked by illustrative preference score (${score!.total}/100). All hard constraints are satisfied.`
        : `Ranked by illustrative preference score (${score!.total}/100), but held below any confirmed match until outstanding checks are resolved.`
      : 'Not ranked — a hard constraint failed, and preference scores never override hard constraints.';

    return {
      opportunity: opp,
      status,
      checks,
      score,
      failedReasons,
      unknownReasons,
      whyMatches,
      satisfiesPreferences,
      limitations,
      missingInfo,
      rankingReason,
    };
  });

  const ranked = matches
    .filter((m) => m.status !== 'excluded' && m.score !== undefined)
    // Confirmed matches always rank above conditional ones at equal scores.
    .sort((a, b) => {
      const statusDiff = (a.status === 'confirmed' ? 1 : 0) - (b.status === 'confirmed' ? 1 : 0);
      if (statusDiff !== 0) return -statusDiff;
      return b.score!.total - a.score!.total;
    });

  const recommendations = ranked.slice(0, 3);
  const recommendationsIds = new Set(recommendations.map((r) => r.opportunity.id));

  const others = matches
    .filter((m) => !recommendationsIds.has(m.opportunity.id))
    .sort((a, b) => {
      const order = { confirmed: 0, conditional: 1, excluded: 2 } as const;
      return order[a.status] - order[b.status];
    });

  return { recommendations, others, all: matches };
}
