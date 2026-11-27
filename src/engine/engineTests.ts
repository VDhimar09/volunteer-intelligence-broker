/**
 * Scenario-based validation tests for the matching engine.
 *
 * These run in the app (Testing & validation section) and can also be run
 * from a terminal with:  npm run test:engine
 *
 * They assert the BEHAVIOURAL rules of the prototype — that hard constraints
 * gate the outcome, that unknown facts produce conditional rather than
 * confirmed matches, and that results respond to profile changes.
 */

import { OPPORTUNITIES } from '../data/opportunities';
import { CASE_A, CASE_B, type VolunteerProfile } from '../data/volunteer';
import { runMatching } from './matchingEngine';

export interface TestOutcome {
  id: number;
  name: string;
  passed: boolean;
  detail: string;
}

function byId(matches: ReturnType<typeof runMatching>['all'], id: string) {
  return matches.find((m) => m.opportunity.id === id)!;
}

function statusOf(profile: VolunteerProfile, id: string) {
  return byId(runMatching(profile).all, id).status;
}

export function runEngineTests(): TestOutcome[] {
  const results: TestOutcome[] = [];
  const expect = (id: number, name: string, condition: boolean, detail: string) =>
    results.push({ id, name, passed: condition, detail });

  const onlineOff: VolunteerProfile = { ...CASE_A, onlineVolunteering: false };
  const safeguardInvalid: VolunteerProfile = { ...CASE_A, safeguarding: 'not-valid' };
  const safeguardValid: VolunteerProfile = { ...CASE_A, safeguarding: 'valid' };
  const tinyTravelLimit: VolunteerProfile = { ...CASE_A, maxTravelMiles: 1 };

  // 1. Online role excluded when online volunteering is disabled.
  expect(
    1,
    'Online role excluded when online volunteering is disabled',
    statusOf(onlineOff, 'digital-access-buddy') === 'excluded',
    'With online volunteering off, the Digital access buddy (online-only) must be Excluded, not recommended.'
  );

  // 2. Daytime role excluded for an evening-only volunteer.
  expect(
    2,
    'Daytime role excluded for evening-only volunteer',
    statusOf(CASE_A, 'community-cafe-host') === 'excluded',
    'The Community café host runs on Tuesday daytime, so it must be Excluded when only weekday evenings are available (Case A).'
  );

  // 3. Opportunity beyond maximum travel distance is excluded.
  expect(
    3,
    'Opportunity beyond travel limit excluded',
    statusOf(tinyTravelLimit, 'conversation-partner') === 'excluded',
    'The Conversation partner is 5 miles away; with a 1-mile limit it must be Excluded.'
  );

  // 4. Missing distance treated as unknown, never assumed within limit.
  const formFill = byId(runMatching(CASE_A).all, 'form-filling-volunteer');
  expect(
    4,
    'Missing distance treated as unknown',
    formFill.status === 'conditional' &&
      formFill.checks.find((c) => c.id === 'distance')!.state === 'unknown',
    'The Form-filling volunteer has no recorded distance, so it must be Conditional and never Confirmed.'
  );

  // 5. Unknown safeguarding status produces conditional eligibility.
  expect(
    5,
    'Unknown safeguarding produces conditional status',
    statusOf(CASE_A, 'youth-reading-mentor') === 'conditional',
    'With safeguarding unknown, the Youth reading mentor must be Conditional, not a confirmed match.'
  );

  // 6. Invalid safeguarding status excludes the role.
  expect(
    6,
    'Invalid safeguarding excludes the role',
    statusOf(safeguardInvalid, 'youth-reading-mentor') === 'excluded',
    'With safeguarding recorded as not valid, the Youth reading mentor must be Excluded.'
  );

  // 7. Changing volunteer input changes matching results.
  const a = runMatching(CASE_A).recommendations.map((r) => r.opportunity.id);
  const b = runMatching(CASE_B).recommendations.map((r) => r.opportunity.id);
  const changed =
    a.join(',') !== b.join(',') &&
    !b.includes('digital-access-buddy') &&
    a.includes('digital-access-buddy');
  expect(
    7,
    'Changing inputs changes matching results',
    changed,
    'Turning online volunteering off (Case A to Case B) must remove the Digital access buddy from the recommendations.'
  );

  // 8. Hard constraints are not overridden by preference scores.
  const highScoreExcluded = runMatching(onlineOff).all.find(
    (m) => m.opportunity.id === 'digital-access-buddy'
  );
  expect(
    8,
    'Hard constraints not overridden by preference scores',
    highScoreExcluded!.status === 'excluded' && highScoreExcluded!.score === undefined,
    'The Digital access buddy would score highly on preferences, but with online disabled it must stay Excluded and unscored.'
  );

  // Extra: a valid safeguarding status resolves the conditional role.
  expect(
    9,
    'Valid safeguarding resolves conditional role to confirmed',
    statusOf(safeguardValid, 'youth-reading-mentor') === 'confirmed',
    'Recording safeguarding as valid must move the Youth reading mentor from Conditional to Confirmed.'
  );

  // Extra: excluded opportunities never appear in recommendations.
  const recs = runMatching(onlineOff).recommendations;
  expect(
    10,
    'Excluded opportunities never appear in recommendations',
    recs.every((r) => r.status !== 'excluded'),
    'Recommendations must contain only confirmed-viable or conditional matches.'
  );

  // Extra: prototype exposes all seven records.
  expect(
    11,
    'All seven fictional records evaluated',
    runMatching(CASE_A).all.length === OPPORTUNITIES.length && OPPORTUNITIES.length === 7,
    'The engine evaluates every opportunity in the fictional dataset on every run.'
  );

  return results;
}
