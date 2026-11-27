import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({
  icon,
  title,
  subtitle,
  step,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  step?: number;
}) {
  return (
    <div className="flex items-start gap-3">
      {step !== undefined && (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white">
          {step}
        </span>
      )}
      {icon && !step && <span className="mt-0.5 text-navy-700">{icon}</span>}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-navy-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Expandable({
  title,
  children,
  defaultOpen = false,
  icon,
  tone = 'default',
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
  tone?: 'default' | 'navy';
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-lg border ${tone === 'navy' ? 'border-navy-200' : 'border-slate-200'} bg-white`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-navy-800">
          {icon}
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="border-t border-slate-100 px-4 py-4">{children}</div>}
    </div>
  );
}

type BadgeTone = 'green' | 'amber' | 'grey' | 'navy';

const badgeStyles: Record<BadgeTone, string> = {
  green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  grey: 'bg-slate-100 text-slate-600 border-slate-200',
  navy: 'bg-navy-50 text-navy-700 border-navy-200',
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${badgeStyles[tone]}`}
    >
      {children}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-teal-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </span>
      <span className="text-sm text-slate-700">{label}</span>
    </button>
  );
}

export const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-slate-500';
export const inputCls =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20';
