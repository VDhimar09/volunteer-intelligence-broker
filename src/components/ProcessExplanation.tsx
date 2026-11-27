import { Filter, SlidersHorizontal, ShieldCheck, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Card } from './ui';

export function ProcessExplanation() {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-navy-700" />
            <h2 className="text-sm font-semibold text-navy-900">Stage 1 – Eligibility &amp; feasibility</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Hard constraints, checked before anything is scored: availability, online vs in-person,
            travel distance, essential eligibility, and missing or unknown information. A failure
            excludes the role; an unknown fact holds it as conditional.
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-teal-700" />
            <h2 className="text-sm font-semibold text-navy-900">Stage 2 – Preference ranking</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Only viable roles are scored on visible weighted criteria: activity/interest (0–35),
            skills (0–30), one-to-one vs group (0–20), schedule (0–10), other (0–5) — 100 points
            total, fully audited in the matching-audit tab.
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-2.5">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
        <p className="text-xs text-amber-900">
          <strong>Hard constraints always win.</strong> No preference score can promote an
          opportunity past a failed Stage 1 check — excluded roles are never scored.
        </p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-800"
        >
          How concept matching works
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Free text is compared through a small, manually written concept vocabulary — not a trained
          language model. The concept <em>digital support</em> groups “get online”, “online forms”,
          “smartphone”; <em>one-to-one support</em> groups “individually”, “mentoring”, “buddy”.
          That is why “digital support” matches “help adults individually to get online” without a
          shared keyword. The full vocabulary is listed in the Testing &amp; validation tab.
        </p>
      )}
    </Card>
  );
}
