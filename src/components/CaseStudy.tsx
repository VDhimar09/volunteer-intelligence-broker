import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { OpportunityMatch } from '../engine/matchingEngine';
import { OPPORTUNITIES } from '../data/opportunities';
import { Card } from './ui';

function RankDelta({ from, to }: { from: number; to: number }) {
  if (from === to) return <Minus className="h-3 w-3 text-slate-400" />;
  return from > to ? (
    <ArrowUp className="h-3 w-3 text-emerald-600" />
  ) : (
    <ArrowDown className="h-3 w-3 text-red-500" />
  );
}

export function CaseChangeComparison({
  caseA,
  caseB,
}: {
  caseA: OpportunityMatch[];
  caseB: OpportunityMatch[];
}) {
  const ids = [...new Set([...caseA, ...caseB].map((m) => m.opportunity.id))];

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
            <th className="pb-2 pr-3 font-semibold">Opportunity</th>
            <th className="pb-2 pr-3 font-semibold">Case A (online on)</th>
            <th className="pb-2 pr-3 font-semibold">Case B (online off)</th>
            <th className="pb-2 font-semibold">Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {ids.map((id) => {
            const inA = caseA.find((m) => m.opportunity.id === id);
            const inB = caseB.find((m) => m.opportunity.id === id);
            const rankA = caseA.findIndex((m) => m.opportunity.id === id);
            const rankB = caseB.findIndex((m) => m.opportunity.id === id);
            const cell = (m?: OpportunityMatch, rank = -1) => {
              if (!m) return 'Excluded';
              const status = m.status === 'confirmed' ? 'Confirmed' : 'Conditional';
              return rank >= 0 ? `Rec ${rank + 1} · ${status}` : `Viable, not top 3 · ${status}`;
            };
            return (
              <tr key={id}>
                <td className="py-2 pr-3 font-medium text-navy-900">
                  {inA?.opportunity.name ?? inB?.opportunity.name}
                </td>
                <td className="py-2 pr-3 text-slate-600">{cell(inA, rankA)}</td>
                <td className="py-2 pr-3 text-slate-600">{cell(inB, rankB)}</td>
                <td className="py-2">
                  <span className="inline-flex items-center gap-1.5">
                    <RankDelta from={rankA < 0 ? 99 : rankA} to={rankB < 0 ? 99 : rankB} />
                    {rankA < 0 && rankB >= 0 && 'Now recommended'}
                    {rankA >= 0 && rankB < 0 && 'Removed from recommendations'}
                    {rankA >= 0 && rankB >= 0 && rankA !== rankB && `Rec ${rankA + 1} → ${rankB + 1}`}
                    {(rankA === rankB || (rankA < 0 && rankB < 0)) && 'Unchanged'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** All seven fictional records as a compact table, with derived tags kept visually separate. */
export function OpportunityDataTable() {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-navy-900">Fictional opportunity records</h3>
      <p className="mt-1 text-xs text-slate-500">
        The seven records the engine evaluates. Derived tags are the prototype's interpretation of
        each activity — they are not stated in the source record.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th className="pb-2 pr-3 font-semibold">Name</th>
              <th className="pb-2 pr-3 font-semibold">Activity (source record)</th>
              <th className="pb-2 pr-3 font-semibold">Schedule</th>
              <th className="pb-2 pr-3 font-semibold">Location</th>
              <th className="pb-2 pr-3 font-semibold">Requirement</th>
              <th className="pb-2 font-semibold">Derived tags (prototype)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {OPPORTUNITIES.map((o) => (
              <tr key={o.id} className="align-top">
                <td className="py-2.5 pr-3 font-medium text-navy-900">{o.name}</td>
                <td className="py-2.5 pr-3 text-slate-600">{o.activity}</td>
                <td className="py-2.5 pr-3 text-slate-600">
                  {o.scheduleDay} {o.schedulePart}
                </td>
                <td className="py-2.5 pr-3 text-slate-600">
                  {o.locationMode === 'online'
                    ? 'Online · no travel'
                    : `In person · ${o.distanceMiles === null ? 'not recorded' : `${o.distanceMiles} mile${o.distanceMiles === 1 ? '' : 's'}`}`}
                </td>
                <td className="py-2.5 pr-3 text-slate-600">{o.requirement}</td>
                <td className="py-2.5">
                  <span className="flex flex-wrap gap-1">
                    {o.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-[10px] text-teal-800"
                      >
                        {t}
                      </span>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
