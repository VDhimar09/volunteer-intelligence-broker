import { XCircle, MinusCircle, CheckCircle2 } from 'lucide-react';
import type { MatchResult, OpportunityMatch } from '../engine/matchingEngine';
import { Card, Expandable } from './ui';
import { StatusBadge } from './RecommendationCard';

function compactCheck(m: OpportunityMatch) {
  const icon =
    m.status === 'excluded' ? (
      <XCircle className="h-3.5 w-3.5 text-red-500" />
    ) : m.status === 'conditional' ? (
      <MinusCircle className="h-3.5 w-3.5 text-amber-500" />
    ) : (
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
    );
  const detail =
    m.failedReasons[0] ??
    m.unknownReasons[0] ??
    `${m.opportunity.scheduleDay} ${m.opportunity.schedulePart} · ${
      m.opportunity.locationMode === 'online'
        ? 'online'
        : m.opportunity.distanceMiles === null
          ? 'distance not recorded'
          : `${m.opportunity.distanceMiles} mile${m.opportunity.distanceMiles === 1 ? '' : 's'}`
    } · all checks passed`;
  return (
    <li className="flex items-start gap-1.5 text-xs text-slate-600">
      <span className="mt-0.5 shrink-0">{icon}</span>
      {detail}
    </li>
  );
}

export function ExcludedSection({ result }: { result: MatchResult }) {
  const excluded = result.all.filter((m) => m.status === 'excluded');
  const otherViable = result.others.filter((m) => m.status !== 'excluded');

  if (excluded.length === 0 && otherViable.length === 0) return null;

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-navy-900">
        Why other opportunities were excluded
        {excluded.length > 0 && (
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {excluded.length}
          </span>
        )}
      </h2>
      <p className="mt-0.5 text-xs text-slate-500">
        The specific hard constraint that failed. Excluded roles receive no preference score.
      </p>

      <ul className="mt-3 divide-y divide-slate-100">
        {excluded.map((m) => (
          <li key={m.opportunity.id} className="py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-navy-900">{m.opportunity.name}</span>
              <StatusBadge status={m.status} />
            </div>
            <ul className="mt-1 space-y-0.5">
              {m.failedReasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
                  {r}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {otherViable.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <Expandable title={`Viable but outside the top three (${otherViable.length})`}>
            <ul className="space-y-2">
              {otherViable.map((m) => (
                <li key={m.opportunity.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-navy-900">{m.opportunity.name}</span>
                    <span className="flex items-center gap-2">
                      {m.score && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                          {m.score.total}/100
                        </span>
                      )}
                      <StatusBadge status={m.status} />
                    </span>
                  </div>
                  <ul className="mt-1">{compactCheck(m)}</ul>
                </li>              ))}
            </ul>
          </Expandable>
        </div>
      )}
    </Card>
  );
}
