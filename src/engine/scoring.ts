/**
 * Stage 2: transparent, deterministic PREFERENCE SCORING.
 *
 * Applies ONLY to opportunities that survived Stage 1 as confirmed-viable or
 * conditional. A high score here can NEVER pull an excluded opportunity back
 * into the recommendations — hard constraints always win.
 *
 * Total available: 100 points, split across five visible criteria.
 */

import type { Opportunity } from '../data/opportunities';
import type { VolunteerProfile } from '../data/volunteer';
import { expandConcepts } from './textMatch';

export interface ScoreCriterion {
  id: string;
  label: string;
  max: number;
  awarded: number;
  /** Plain-language reason(s) for the points given. */
  reasons: string[];
}

export interface ScoreBreakdown {
  total: number;
  maxTotal: number;
  criteria: ScoreCriterion[];
  /** Concepts from the volunteer's input that matched this opportunity. */
  matchedConcepts: string[];
}

/** How strongly the volunteer signals a one-to-one preference. */
export function prefersOneToOne(profile: VolunteerProfile): boolean {
  return expandConcepts(`${profile.preferredActivity} ${profile.skills}`).has('one-to-one support');
}

function conceptHits(opp: Opportunity, profile: VolunteerProfile): {
  matched: Set<string>;
  activityHit: boolean;
  skillHit: boolean;
} {
  const activityConcepts = expandConcepts(opp.activity);
  const tagConcepts = new Set<string>();
  for (const tag of opp.tags) {
    for (const c of expandConcepts(tag)) tagConcepts.add(c);
  }
  const volunteerActivity = expandConcepts(profile.preferredActivity);
  const volunteerSkills = expandConcepts(profile.skills);

  const matched = new Set<string>();
  let activityHit = false;
  let skillHit = false;

  for (const concept of volunteerActivity) {
    if (activityConcepts.has(concept) || tagConcepts.has(concept)) {
      matched.add(concept);
      activityHit = true;
    }
  }
  for (const concept of volunteerSkills) {
    if (activityConcepts.has(concept) || tagConcepts.has(concept)) {
      matched.add(concept);
      skillHit = true;
    }
  }
  return { matched, activityHit, skillHit };
}

export function scoreOpportunity(opp: Opportunity, profile: VolunteerProfile): ScoreBreakdown {
  const { matched, activityHit, skillHit } = conceptHits(opp, profile);
  const oneToOne = prefersOneToOne(profile);
  const oppIsOneToOne = opp.tags.some((t) => expandConcepts(t).has('one-to-one support'));

  // --- Activity / interest relevance: 0-35 -------------------------------
  let activityScore = 0;
  const activityReasons: string[] = [];
  if (activityHit) {
    const share = Math.min(1, matched.size / 2); // 1-2 concept matches saturate
    activityScore = Math.round(35 * (0.6 + 0.4 * share));
    activityReasons.push(
      `The activity "${opp.activity}" relates to your stated interest through the shared concept(s): ${[...matched].join(', ')}.`
    );
  } else {
    const social = expandConcepts(opp.activity).has('helping people') ||
      expandConcepts(opp.activity).has('community / social');
    activityScore = social ? 10 : 0;
    if (social) activityReasons.push('No direct link to your stated interest, but it is a people-focused community role.');
    else activityReasons.push('The activity does not overlap with the concepts in your stated interest.');
  }

  // --- Skills relevance: 0-30 --------------------------------------------
  let skillsScore = 0;
  const skillsReasons: string[] = [];
  if (skillHit) {
    skillsScore = 30;
    skillsReasons.push(`Uses your stated skill(s), via the shared concept(s): ${[...matched].join(', ')}.`);
  } else {
    skillsReasons.push('The role does not obviously use the skills you listed.');
  }

  // --- One-to-one vs group preference fit: 0-20 ---------------------------
  let oneToOneScore = 0;
  const oneToOneReasons: string[] = [];
  if (oneToOne) {
    if (oppIsOneToOne) {
      oneToOneScore = 20;
      oneToOneReasons.push('Provides one-to-one support, which matches your preference.');
    } else {
      oneToOneScore = 4;
      oneToOneReasons.push('You prefer one-to-one support; this role is group- or team-based, so it fits less well.');
    }
  } else {
    oneToOneScore = 12; // no stated preference -> neutral-ish
    oneToOneReasons.push('You have not stated a one-to-one or group preference, so a neutral score applies.');
  }

  // --- Schedule preference fit: 0-10 --------------------------------------
  let scheduleScore = 0;
  const scheduleReasons: string[] = [];
  if (profile.availability === 'weekday-evenings' && opp.schedulePart === 'evening') {
    scheduleScore = 10;
    scheduleReasons.push(`Fits your weekday-evening availability (${opp.scheduleDay} evening).`);
  } else if (profile.availability === 'weekday-daytimes' && opp.schedulePart === 'daytime') {
    scheduleScore = 10;
    scheduleReasons.push(`Fits your weekday-daytime availability (${opp.scheduleDay} daytime).`);
  } else if (profile.availability === 'weekdays-flexible') {
    scheduleScore = 10;
    scheduleReasons.push(`Fits your weekday availability (${opp.scheduleDay} ${opp.schedulePart}).`);
  } else if (profile.availability === 'weekends' || profile.availability === 'flexible') {
    scheduleScore = 8;
    scheduleReasons.push(`Schedule (${opp.scheduleDay} ${opp.schedulePart}) does not conflict with your availability.`);
  } else {
    scheduleScore = 4;
    scheduleReasons.push(`Partial schedule fit only (${opp.scheduleDay} ${opp.schedulePart}).`);
  }

  // --- Other preference fit: 0-5 ------------------------------------------
  let otherScore = 0;
  const otherReasons: string[] = [];
  if (opp.locationMode === 'online' && profile.onlineVolunteering) {
    otherScore = 5;
    otherReasons.push('Online volunteering is acceptable to you, and no travel is needed.');
  } else if (opp.locationMode === 'in-person' && typeof opp.distanceMiles === 'number') {
    otherScore = opp.distanceMiles <= profile.maxTravelMiles ? 5 : 0;
    otherReasons.push(
      opp.distanceMiles <= profile.maxTravelMiles
        ? `Within your ${profile.maxTravelMiles}-mile travel limit (${opp.distanceMiles} mile${opp.distanceMiles === 1 ? '' : 's'}).`
        : 'Travel distance is above your stated limit.'
    );
  } else {
    otherScore = 2;
    otherReasons.push('No further preference information available to assess.');
  }

  const criteria: ScoreCriterion[] = [
    { id: 'activity', label: 'Activity / interest relevance', max: 35, awarded: activityScore, reasons: activityReasons },
    { id: 'skills', label: 'Skills relevance', max: 30, awarded: skillsScore, reasons: skillsReasons },
    { id: 'one-to-one', label: 'One-to-one vs group fit', max: 20, awarded: oneToOneScore, reasons: oneToOneReasons },
    { id: 'schedule', label: 'Schedule preference fit', max: 10, awarded: scheduleScore, reasons: scheduleReasons },
    { id: 'other', label: 'Other preference fit', max: 5, awarded: otherScore, reasons: otherReasons },
  ];

  const total = criteria.reduce((sum, c) => sum + c.awarded, 0);
  return { total, maxTotal: 100, criteria, matchedConcepts: [...matched] };
}
