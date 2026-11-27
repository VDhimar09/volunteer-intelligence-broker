import { ScanSearch } from 'lucide-react';
import type { MatchResult } from '../engine/matchingEngine';
import { Card, Expandable, Badge } from './ui';
import { StatusBadge } from './RecommendationCard';

export function AuditPanel({ result }: { result: MatchResult }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <ScanSearch className="h-4 w-4 text-navy-700" />
        <h3 className="text-sm font-semibold text-navy-900">Inspect matching logic</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        For all seven opportunities: Stage 1 hard-constraint checks, Stage 2 score breakdown,
        derived tags, and the reasoning behind each final status.
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th className="pb-2 pr-3 font-semibold">Opportunity</th>
              <th className="pb-2 pr-3 font-semibold">Availability</th>
              <th className="pb-2 pr-3 font-semibold">Mode</th>
              <th className="pb-2 pr-3 font-semibold">Distance</th>
              <th className="pb-2 pr-3 font-semibold">Eligibility</th>
              <th className="pb-2 pr-3 font-semibold">Score</th>
              <th className="pb-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {result.all.map((m) => {
              const check = (id: string) => {
                const c = m.checks.find((x) => x.id === id)!;
                return (
                  <td key={id} className="py-2.5 pr-3 align-top">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        c.state === 'pass'
                          ? 'text-emerald-700'
                          : c.state === 'fail'
                            ? 'text-red-600'
                            : 'text-amber-600'
                      }`}
                      title={c.reason}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          c.state === 'pass'
                            ? 'bg-emerald-500'
                            : c.state === 'fail'
                              ? 'bg-red-500'
                              : 'bg-amber-400'
                        }`}
                      />
                      {c.state === 'pass' ? 'Pass' : c.state === 'fail' ? 'Fail' : 'Unknown'}
                    </span>
                  </td>
                );
              };
              return (
                <tr key={m.opportunity.id}>
                  <td className="py-2.5 pr-3 align-top font-medium text-navy-900">
                    {m.opportunity.name}
                  </td>
                  {check('availability')}
                  {check('mode')}
                  {check('distance')}
                  {check('eligibility')}
                  <td className="py-2.5 pr-3 align-top tabular-nums text-slate-600">
                    {m.score ? `${m.score.total}/100` : '—'}
                  </td>
                  <td className="py-2.5 align-top">
                    <StatusBadge status={m.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 space-y-2">
        {result.all.map((m) => (
          <Expandable key={m.opportunity.id} title={`${m.opportunity.name} — full reasoning`}>
            <div className="space-y-3 text-xs">
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Stage 1 – hard constraints
                </h4>
                <ul className="mt-1 space-y-1">
                  {m.checks.map((c) => (
                    <li key={c.id} className="flex gap-1.5">
                      <span
                        className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          c.state === 'pass'
                            ? 'bg-emerald-500'
                            : c.state === 'fail'
                              ? 'bg-red-500'
                              : 'bg-amber-400'
                        }`}
                      />
                      <span>
                        <span className="font-medium text-navy-800">{c.label}</span>{' '}
                        <span className="text-slate-500">({c.state})</span> — {c.reason}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {m.score ? (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Stage 2 – preference score breakdown
                  </h4>
                  <div className="mt-1.5 space-y-1.5">
                    {m.score.criteria.map((c) => (
                      <div key={c.id}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-navy-800">{c.label}</span>
                          <span className="tabular-nums text-slate-500">
                            {c.awarded} / {c.max}
                          </span>
                        </div>
                        <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-teal-600"
                            style={{ width: `${(c.awarded / c.max) * 100}%` }}
                          />
                        </div>
                        {c.reasons.map((r, i) => (
                          <p key={i} className="mt-0.5 text-[11px] text-slate-500">
                            {r}
                          </p>
                        ))}
                      </div>
                    ))}
                    <p className="font-medium text-navy-800">Total: {m.score.total} / 100</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Stage 2 – preference score
                  </h4>
                  <p className="mt-1 text-slate-600">
                    Not scored — a hard constraint failed, and preference scores never override hard
                    constraints.
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Source record vs derived tags
                </h4>
                <p className="mt-1 text-slate-600">
                  <span className="font-medium text-navy-800">Source:</span> {m.opportunity.activity} ·{' '}
                  {m.opportunity.scheduleDay} {m.opportunity.schedulePart} ·{' '}
                  {m.opportunity.locationMode === 'online' ? 'Online' : 'In person'} · Requirement:{' '}
                  {m.opportunity.requirement}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {m.opportunity.tags.map((t) => (
                    <Badge key={t} tone="navy">
                      {t}
                    </Badge>
                  ))}
                </div>
                <p className="mt-1 text-[10px] italic text-slate-400">
                  Tags are the prototype’s interpretation, not facts stated in the record.
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Final status &amp; ranking reason
                </h4>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={m.status} />
                  <span className="text-slate-600">{m.rankingReason}</span>
                </div>
              </div>
            </div>
          </Expandable>
        ))}
      </div>
    </Card>
  );
}
