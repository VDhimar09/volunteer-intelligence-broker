import { AlertTriangle } from 'lucide-react';
import type { OpportunityMatch } from '../engine/matchingEngine';
import { Card, Badge } from './ui';

/**
 * Compact list of conditional opportunities, populated live from the same
 * matching-engine result as the recommendations and audit. Shows only
 * conditional matches — excluded opportunities never appear here.
 */
export function ConditionalSection({ matches }: { matches: OpportunityMatch[] }) {
  const conditional = matches.filter((m) => m.status === 'conditional');
  if (conditional.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/50 p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-navy-900">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        Potential matches requiring verification
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
          {conditional.length}
        </span>
      </h2>
      <p className="mt-0.5 text-xs text-slate-500">
        Relevant roles held back because a required fact is unconfirmed. They are not confirmed
        matches until the check is resolved.
      </p>

      <ul className="mt-3 divide-y divide-amber-100">
        {conditional.map((m) => (
          <li key={m.opportunity.id} className="py-2 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="text-sm font-medium text-navy-900">{m.opportunity.name}</span>
              <span className="flex items-center gap-2">
                {m.score && (
                  <span className="rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                    {m.score.total}/100
                  </span>
                )}
                <Badge tone="amber">Conditional – needs verification</Badge>
              </span>
            </div>
            {m.unknownReasons.length > 0 && (
              <p className="mt-1 text-xs text-amber-900">{m.unknownReasons[0]}</p>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
