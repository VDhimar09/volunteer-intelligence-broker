import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Clock,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import type { MatchStatus, OpportunityMatch } from '../engine/matchingEngine';
import { Badge, Card } from './ui';

export function StatusBadge({ status }: { status: MatchStatus }) {
  if (status === 'confirmed')
    return (
      <Badge tone="green">
        <CheckCircle2 className="h-3 w-3" /> Confirmed viable
      </Badge>
    );
  if (status === 'conditional')
    return (
      <Badge tone="amber">
        <AlertTriangle className="h-3 w-3" /> Conditional – needs verification
      </Badge>
    );
  return (
    <Badge tone="grey">
      <XCircle className="h-3 w-3" /> Excluded
    </Badge>
  );
}

const statusEdge: Record<MatchStatus, string> = {
  confirmed: 'border-l-emerald-500',
  conditional: 'border-l-amber-400',
  excluded: 'border-l-slate-300',
};

export function RecommendationCard({ match, rank }: { match: OpportunityMatch; rank: number }) {
  const [open, setOpen] = useState(false);
  const opp = match.opportunity;
  const score = match.score;

  // Keep the two strongest reasons visible; the rest lives in the detail.
  const keyReasons = match.whyMatches.slice(0, 2);
  const extraReasons = match.whyMatches.slice(2);

  return (
    <Card className={`overflow-hidden border-l-4 ${statusEdge[match.status]} p-4`}>
      <div className="flex items-start gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${
            match.status === 'confirmed' ? 'bg-emerald-600' : 'bg-amber-500'
          }`}
        >
          {rank}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <h3 className="text-sm font-semibold text-navy-900">{opp.name}</h3>
            <div className="flex items-center gap-2">
              <StatusBadge status={match.status} />
              {score && (
                <span
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
                  title="Illustrative preference score — does not imply eligibility"
                >
                  {score.total}/100
                </span>
              )}
            </div>
          </div>

          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{opp.activity}</p>

          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {opp.scheduleDay} {opp.schedulePart}
            </span>
            <span className="inline-flex items-center gap-1">
              {opp.locationMode === 'online' ? (
                <>
                  <Globe className="h-3 w-3" /> Online
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3" /> In person ·{' '}
                  {opp.distanceMiles === null
                    ? 'distance not recorded'
                    : `${opp.distanceMiles} mile${opp.distanceMiles === 1 ? '' : 's'}`}
                </>
              )}
            </span>
          </div>

          {keyReasons.length > 0 && (
            <ul className="mt-2 space-y-1">
              {keyReasons.map((r, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {r}
                </li>
              ))}
            </ul>
          )}

          {match.missingInfo.length > 0 && (
            <div className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-900">{match.missingInfo[0]}</p>
            </div>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-800"
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            {open ? 'Hide details' : 'Full score breakdown, preferences satisfied & limitations'}
          </button>

          {open && (
            <div className="mt-2 space-y-3 border-t border-slate-100 pt-2">
              {extraReasons.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Why it matches</h4>
                  <ul className="mt-1 space-y-0.5">
                    {extraReasons.map((r, i) => (
                      <li key={i} className="text-xs text-slate-600">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Preference scores
                </h4>
                <div className="mt-1 space-y-1">
                  {score?.criteria.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <span className="w-44 shrink-0 text-[11px] text-slate-600">{c.label}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-teal-600"
                          style={{ width: `${(c.awarded / c.max) * 100}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-[11px] tabular-nums text-slate-500">
                        {c.awarded}/{c.max}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {match.limitations.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Limitations</h4>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-600">
                    {match.limitations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {match.satisfiesPreferences.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Preferences satisfied
                  </h4>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-600">
                    {match.satisfiesPreferences.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
