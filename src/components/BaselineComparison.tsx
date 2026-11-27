import { Search, Sparkles, ArrowRight } from 'lucide-react';
import type { MatchResult } from '../engine/matchingEngine';
import { runBaseline } from '../engine/baseline';
import type { VolunteerProfile } from '../data/volunteer';
import { Card, Expandable } from './ui';
import { StatusBadge } from './RecommendationCard';

export function BaselineComparison({
  profile,
  intelligent,
}: {
  profile: VolunteerProfile;
  intelligent: MatchResult;
}) {
  const baseline = runBaseline(profile);
  const baselineIncluded = baseline.filter((b) => b.included);
  const intelligentAll = intelligent.all
    .filter((m) => m.status !== 'excluded')
    .map((m) => m.opportunity.id);

  const missedByBaseline = baseline.filter(
    (b) => !b.included && intelligentAll.includes(b.opportunity.id)
  );

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-navy-900">
        Simple keyword search versus intelligent matching
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        An illustrative comparison on a tiny fictional dataset — it does not show that either
        approach is empirically better in the real world. The baseline uses exact keywords and
        plain filters: no concept mapping, no preference ranking, no handling of unknown values.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <h4 className="text-xs font-semibold text-navy-900">
              Simple keyword search — {baselineIncluded.length} found
            </h4>
          </div>
          <ul className="mt-2 space-y-1">
            {baselineIncluded.length === 0 && (
              <li className="text-xs text-slate-500">Nothing passes the filters.</li>
            )}
            {baselineIncluded.map((b) => (
              <li key={b.opportunity.id} className="flex items-center gap-2 text-xs text-slate-700">
                <span className="h-1 w-1 rounded-full bg-slate-400" />
                {b.opportunity.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-teal-700" />
            <h4 className="text-xs font-semibold text-navy-900">
              Intelligent prototype — {intelligentAll.length} viable, {intelligent.recommendations.length} recommended
            </h4>
          </div>
          <ul className="mt-2 space-y-1">
            {intelligent.recommendations.map((r) => (
              <li key={r.opportunity.id} className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700">
                <ArrowRight className="h-3 w-3 text-teal-600" />
                {r.opportunity.name}
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {missedByBaseline.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
          <h4 className="text-xs font-semibold text-amber-800">
            Relevant opportunities the simple search misses ({missedByBaseline.length})
          </h4>
          <ul className="mt-1.5 space-y-1 text-xs text-slate-700">
            {missedByBaseline.map((b) => {
              const reasons: string[] = [];
              if (!b.keywordHit) reasons.push('no exact keyword overlap with your wording');
              if (!b.availabilityPass) reasons.push('availability filter mismatch');
              if (!b.distancePass) reasons.push('distance not recorded, so the filter cannot pass it');
              return (
                <li key={b.opportunity.id}>
                  <span className="font-medium">{b.opportunity.name}</span> — {reasons.join('; ')}. The
                  prototype recognises the related wording and treats the missing fact as an explicit
                  condition rather than discarding the role.
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-3">
        <Expandable title="How the two approaches differ in detail">
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-slate-700">
            <li>
              <strong>Keyword handling.</strong> The baseline matches literal words; the prototype
              maps free text onto a small hand-defined vocabulary, so “digital support” recognises
              “help people get online” and “online forms”.
            </li>
            <li>
              <strong>Missing information.</strong> The baseline’s distance filter silently drops the
              form-filling volunteer; the prototype surfaces the gap and returns it as Conditional.
            </li>
            <li>
              <strong>Uncertainty.</strong> The baseline cannot express “safeguarding unconfirmed”;
              the prototype keeps such roles visible but clearly separated from confirmed matches.
            </li>
            <li>
              <strong>Ranking &amp; discipline.</strong> The baseline only filters; the prototype
              ranks on visible weighted criteria and never lets a high score override a failed hard
              constraint.
            </li>
          </ul>
        </Expandable>
      </div>
    </Card>
  );
}
