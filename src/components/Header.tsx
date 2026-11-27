import { GraduationCap, FlaskConical } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800">
            <GraduationCap className="h-4.5 w-4.5 text-teal-300" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-navy-900">
              Volunteer Intelligence Broker
            </h1>
            <p className="text-xs text-slate-500">
              Explainable volunteer-opportunity matching prototype
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
          <FlaskConical className="h-3 w-3" />
          Research prototype · Fictional data · Demonstration only
        </span>
      </div>
    </header>
  );
}
