/** @format */

import { Settings2, RotateCcw } from "lucide-react";
import {
	AVAILABILITY_LABELS,
	DEFAULT_PROFILE,
	SAFEGUARDING_LABELS,
	type Availability,
	type SafeguardingStatus,
	type VolunteerProfile,
} from "../data/volunteer";
import { Card, Toggle, inputCls } from "./ui";

interface Props {
	profile: VolunteerProfile;
	onChange: (p: VolunteerProfile) => void;
	onLoadCaseA: () => void;
	onLoadCaseB: () => void;
	activeCase: "A" | "B" | "edited";
}

const fieldGroup = "space-y-3";
const fieldLabel =
	"block text-[11px] font-semibold uppercase tracking-wide text-slate-500";

export function ProfilePanel({
	profile,
	onChange,
	onLoadCaseA,
	onLoadCaseB,
	activeCase,
}: Props) {
	const set = <K extends keyof VolunteerProfile>(
		key: K,
		value: VolunteerProfile[K],
	) => onChange({ ...profile, [key]: value });

	return (
		<Card className='p-4'>
			<div className='flex items-center justify-between gap-3'>
				<div className='flex items-center gap-2'>
					<Settings2 className='h-4 w-4 text-navy-700' />
					<h2 className='text-sm font-semibold text-navy-900'>
						Volunteer profile
					</h2>
				</div>
				<button
					onClick={() => onChange({ ...DEFAULT_PROFILE })}
					className='inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50'
				>
					<RotateCcw className='h-3 w-3' />
					Reset
				</button>
			</div>

			<div className='mt-3 grid grid-cols-2 gap-2'>
				<button
					onClick={onLoadCaseA}
					className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
						activeCase === "A"
							? "bg-teal-700 text-white"
							: "bg-navy-800 text-white hover:bg-navy-700"
					}`}
				>
					Load Case A
				</button>
				<button
					onClick={onLoadCaseB}
					className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
						activeCase === "B"
							? "bg-teal-700 text-white"
							: "bg-navy-800 text-white hover:bg-navy-700"
					}`}
				>
					Load Case B
				</button>
			</div>
			{activeCase === "edited" && (
				<p className='mt-2 text-[11px] text-slate-500'>
					Showing an edited profile — matching reruns on every change.
				</p>
			)}

			<div className={`mt-4 ${fieldGroup}`}>
				<div>
					<label className={fieldLabel} htmlFor='availability'>
						Availability
					</label>
					<select
						id='availability'
						className={`${inputCls} mt-1 py-1.5`}
						value={profile.availability}
						onChange={(e) =>
							set("availability", e.target.value as Availability)
						}
					>
						{(Object.keys(AVAILABILITY_LABELS) as Availability[]).map((a) => (
							<option key={a} value={a}>
								{AVAILABILITY_LABELS[a]}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className={fieldLabel} htmlFor='activity'>
						Preferred activity
					</label>
					<input
						id='activity'
						type='text'
						className={`${inputCls} mt-1 py-1.5`}
						value={profile.preferredActivity}
						onChange={(e) => set("preferredActivity", e.target.value)}
						placeholder='e.g. one-to-one support'
					/>
				</div>

				<div>
					<label className={fieldLabel} htmlFor='skills'>
						Skills / interests
					</label>
					<input
						id='skills'
						type='text'
						className={`${inputCls} mt-1 py-1.5`}
						value={profile.skills}
						onChange={(e) => set("skills", e.target.value)}
						placeholder='e.g. digital support'
					/>
				</div>
			</div>

			<div className='mt-4 border-t border-slate-100 pt-3'>
				<div className='flex items-center justify-between'>
					<span className={fieldLabel}>Max travel</span>
					<span className='text-xs font-semibold text-navy-800'>
						{profile.maxTravelMiles}{" "}
						{profile.maxTravelMiles === 1 ? "mile" : "miles"}
					</span>
				</div>
				<input
					id='travel'
					type='range'
					min={1}
					max={10}
					step={1}
					value={profile.maxTravelMiles}
					onChange={(e) => set("maxTravelMiles", Number(e.target.value))}
					className='mt-1 w-full accent-teal-600'
					aria-label='Maximum travel distance in miles'
				/>
				<div className='mt-2'>
					<Toggle
						checked={profile.onlineVolunteering}
						onChange={(v) => set("onlineVolunteering", v)}
						label='Online volunteering acceptable'
					/>
				</div>
			</div>

			<div className='mt-3 border-t border-slate-100 pt-3'>
				<label className={fieldLabel} htmlFor='safeguarding'>
					Safeguarding clearance
				</label>
				<select
					id='safeguarding'
					className={`${inputCls} mt-1 py-1.5`}
					value={profile.safeguarding}
					onChange={(e) =>
						set("safeguarding", e.target.value as SafeguardingStatus)
					}
				>
					{(Object.keys(SAFEGUARDING_LABELS) as SafeguardingStatus[]).map(
						(s) => (
							<option key={s} value={s}>
								{SAFEGUARDING_LABELS[s]}
							</option>
						),
					)}
				</select>
			</div>

			<p className='mt-3 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500'>
				{activeCase === "B"
					? "Case B: identical to Case A except online volunteering is disabled — watch the online-only role become excluded."
					: activeCase === "A"
						? "Case A: weekday evenings, one-to-one digital support, 3-mile limit, safeguarding unconfirmed."
						: "All matching reruns locally as you edit — nothing is stored or sent anywhere."}
			</p>
		</Card>
	);
}
