import { FlaskConical, Info, ShieldAlert } from 'lucide-react';
import { runEngineTests } from '../engine/engineTests';
import { Card, Expandable } from './ui';
import { SYNONYM_GROUPS } from '../data/synonyms';

export function TestingSection() {
  const results = runEngineTests();
  const passed = results.filter((r) => r.passed).length;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-navy-700" />
        <h3 className="text-sm font-semibold text-navy-900">Testing &amp; validation</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Scenario checks run against the live engine on every render, and from a terminal with{' '}
        <code className="rounded bg-slate-100 px-1">npm run test:engine</code>.
      </p>
      <p
        className={`mt-2.5 inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-medium ${
          passed === results.length ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
        }`}
      >
        {passed} of {results.length} scenario checks passing
      </p>

      <ul className="mt-3 grid gap-x-6 gap-y-1 md:grid-cols-2">
        {results.map((r) => (
          <li key={r.id} className="flex items-start gap-2 py-1">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                r.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {r.passed ? '✓' : '✕'}
            </span>
            <span className="text-xs text-slate-700" title={r.detail}>
              {r.name}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3">
        <Expandable title="The vocabulary behind concept matching (hand-defined, not trained)">
          <p className="text-xs text-slate-600">
            Concept matching works by expanding free text through the groups below. This is the
            prototype’s entire “semantic” capability — deliberately small, fully inspectable, and
            not a language model.
          </p>
          <div className="mt-2.5 grid gap-2.5 md:grid-cols-2">
            {SYNONYM_GROUPS.map((g) => (
              <div key={g.concept}>
                <p className="text-xs font-medium text-navy-800">{g.concept}</p>
                <p className="text-[11px] text-slate-500">{g.phrases.join(' · ')}</p>
              </div>
            ))}
          </div>
        </Expandable>
      </div>
    </Card>
  );
}

export function LimitationsSection() {
  const items = [
    'All data is fictional — the seven opportunities and demonstration cases do not describe real organisations, volunteers or roles.',
    'Activity matching uses a small, manually defined vocabulary; it recognises only the wordings listed in the testing tab.',
    'Preference scores are illustrative weights, not probabilities of a successful volunteering match.',
    'No trained AI model is used — matching is a deterministic two-stage rule process that can be fully audited.',
    'Missing information is surfaced (unknown distance, unconfirmed safeguarding) rather than silently filled in or assumed favourable.',
    'This prototype does not establish real-world matching accuracy.',
    'A real system would need stakeholder research with volunteers and coordinators, validated data, privacy and consent considerations, and formal evaluation before deployment.',
  ];
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-navy-700" />
        <h3 className="text-sm font-semibold text-navy-900">Limitations &amp; future development</h3>
      </div>
      <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            {t}
          </li>
        ))}
      </ul>
    </Card>
  );
}
