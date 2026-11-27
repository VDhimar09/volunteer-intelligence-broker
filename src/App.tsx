import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { ProfilePanel } from './components/ProfilePanel';
import { ProcessExplanation } from './components/ProcessExplanation';
import { RecommendationCard } from './components/RecommendationCard';
import { ConditionalSection } from './components/ConditionalSection';
import { ExcludedSection } from './components/ExcludedSection';
import { BaselineComparison } from './components/BaselineComparison';
import { AuditPanel } from './components/AuditPanel';
import { LimitationsSection, TestingSection } from './components/TestingAndAbout';
import { CaseChangeComparison, OpportunityDataTable } from './components/CaseStudy';
import { Card } from './components/ui';
import { CASE_A, CASE_B, type VolunteerProfile } from './data/volunteer';
import { runMatching } from './engine/matchingEngine';
import { Sparkles } from 'lucide-react';

type TabId = 'logic' | 'audit' | 'cases' | 'baseline' | 'data' | 'testing' | 'limits';

const TABS: { id: TabId; label: string }[] = [
  { id: 'logic', label: 'Matching logic' },
  { id: 'audit', label: 'Matching audit' },
  { id: 'cases', label: 'Case A vs Case B' },
  { id: 'baseline', label: 'Search vs matching' },
  { id: 'data', label: 'Opportunity data' },
  { id: 'testing', label: 'Testing & validation' },
  { id: 'limits', label: 'Limitations' },
];

export default function App() {
  const [profile, setProfile] = useState<VolunteerProfile>({ ...CASE_A });
  const [activeTab, setActiveTab] = useState<TabId>('logic');

  const result = useMemo(() => runMatching(profile), [profile]);
  const caseAResult = useMemo(() => runMatching(CASE_A), []);
  const caseBResult = useMemo(() => runMatching(CASE_B), []);

  const activeCase: 'A' | 'B' | 'edited' =
    profile.availability === CASE_A.availability &&
    profile.preferredActivity === CASE_A.preferredActivity &&
    profile.skills === CASE_A.skills &&
    profile.maxTravelMiles === CASE_A.maxTravelMiles &&
    profile.safeguarding === CASE_A.safeguarding
      ? profile.onlineVolunteering === CASE_A.onlineVolunteering
        ? 'A'
        : profile.onlineVolunteering === CASE_B.onlineVolunteering
          ? 'B'
          : 'edited'
      : 'edited';

  const confirmedCount = result.all.filter((m) => m.status === 'confirmed').length;
  const conditionalCount = result.all.filter((m) => m.status === 'conditional').length;
  const excludedCount = result.all.filter((m) => m.status === 'excluded').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        {/* Main matching experience */}
        <ProcessExplanation />

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[300px_1fr]">
          <ProfilePanel
            profile={profile}
            onChange={setProfile}
            onLoadCaseA={() => setProfile({ ...CASE_A })}
            onLoadCaseB={() => setProfile({ ...CASE_B })}
            activeCase={activeCase}
          />

          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                <Sparkles className="h-4 w-4 text-teal-700" />
                Recommendations
              </h2>
              <p className="text-xs text-slate-500">
                {confirmedCount} confirmed · {conditionalCount} conditional · {excludedCount} excluded
              </p>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Ranked by illustrative preference score. Status, not score, shows whether a role is
              actually available to you.
            </p>

            <div className="mt-3 space-y-3">
              {result.recommendations.length === 0 && (
                <Card className="p-4 text-sm text-slate-600">
                  No opportunities are viable under the current constraints — relax availability,
                  the travel limit or online volunteering to see recommendations. Every excluded
                  role and its reason are listed below.
                </Card>
              )}
              {result.recommendations.map((m, i) => (
                <RecommendationCard key={m.opportunity.id} match={m} rank={i + 1} />
              ))}
            </div>

            <div className="mt-4">
              <ConditionalSection matches={result.all} />
            </div>

            {result.others.some((m) => m.status !== 'excluded') && (
              <p className="mt-3 text-xs text-slate-500">
                Additional viable roles outside the top three are listed with the exclusions below.
              </p>
            )}
            <div className="mt-4">
              <ExcludedSection result={result} />
            </div>
          </section>
        </div>

        {/* Supporting information */}
        <div className="mt-8 border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold text-navy-900">Supporting information</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Full technical detail, comparison data and validation — all content remains available
            behind these tabs.
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Supporting sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => setActiveTab(t.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === t.id
                    ? 'bg-navy-800 text-white'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {activeTab === 'logic' && <ProcessExplanation />}
            {activeTab === 'audit' && <AuditPanel result={result} />}
            {activeTab === 'cases' && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-navy-900">
                  How recommendations changed between Case A and Case B
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Case B disables online volunteering only. The same engine reruns with that single
                  changed fact; you can load either case in the profile panel and edit it further.
                </p>
                <CaseChangeComparison caseA={caseAResult.recommendations} caseB={caseBResult.recommendations} />
              </Card>
            )}
            {activeTab === 'baseline' && <BaselineComparison profile={profile} intelligent={result} />}
            {activeTab === 'data' && <OpportunityDataTable />}
            {activeTab === 'testing' && <TestingSection />}
            {activeTab === 'limits' && <LimitationsSection />}
          </div>
        </div>

        <footer className="border-t border-slate-200 py-6 text-center text-[11px] text-slate-400">
          Volunteer Intelligence Broker · Research prototype using fictional data · TeamKinetic /
          Nottingham Trent University Knowledge Transfer Partnership assessment demonstration.
        </footer>
      </main>
    </div>
  );
}
