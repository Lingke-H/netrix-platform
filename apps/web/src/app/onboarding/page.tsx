import { Save } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import type { AcademicProfile } from "@/features/profile/schemas";
import { upsertAcademicProfileAction } from "@/features/profile/server/actions";
import { getCurrentUserProfileData } from "@/features/profile/server/service";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]";

const labelClass = "space-y-2 text-sm font-medium text-[var(--color-ink)]";

type OnboardingPageProps = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

const majorOptions = [
  ["eee", "EEE"],
  ["computer-science", "Computer Science"],
  ["math", "Math"],
  ["fam", "FAM"],
  ["ibe", "IBE"],
  ["other", "Other"],
] as const;

const yearOptions = [
  ["foundation", "Foundation"],
  ["year-1", "Year 1"],
  ["year-2", "Year 2"],
  ["year-3", "Year 3"],
  ["year-4", "Year 4"],
  ["postgraduate", "Postgraduate"],
] as const;

function joinField(items: string[] | undefined) {
  return items?.join(", ") ?? "";
}

function TextField({
  defaultValue,
  label,
  maxLength,
  minLength,
  name,
  placeholder,
  required,
}: {
  defaultValue?: string;
  label: string;
  maxLength?: number;
  minLength?: number;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        name={name}
        type="text"
        defaultValue={defaultValue}
        minLength={minLength}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </label>
  );
}

function ListField({
  defaultValue,
  label,
  name,
  placeholder,
}: {
  defaultValue?: string[];
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input name={name} type="text" defaultValue={joinField(defaultValue)} placeholder={placeholder} className={inputClass} />
    </label>
  );
}

function AcademicProfileForm({ profile }: { profile: AcademicProfile | null }) {
  return (
    <form action={upsertAcademicProfileAction} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <TextField
          name="nickname"
          label="Academic nickname"
          defaultValue={profile?.nickname}
          minLength={2}
          maxLength={40}
          required
        />

        <label className={labelClass}>
          Major
          <select name="major" defaultValue={profile?.major ?? "eee"} className={inputClass}>
            {majorOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Year
          <select name="year" defaultValue={profile?.year ?? "year-2"} className={inputClass}>
            {yearOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ListField name="modules" label="Modules" defaultValue={profile?.modules} placeholder="ELEC2043, COMP1048" />
        <ListField name="interests" label="Interests" defaultValue={profile?.interests} placeholder="embedded systems, web apps" />
        <ListField name="skills" label="Skills" defaultValue={profile?.skills} placeholder="python, react, circuit design" />
        <ListField name="helpOffered" label="Help offered" defaultValue={profile?.helpOffered} placeholder="debugging, lab reports" />
        <ListField name="helpNeeded" label="Help needed" defaultValue={profile?.helpNeeded} placeholder="signals, algorithms" />
        <ListField
          name="collaborationPreference"
          label="Collaboration preference"
          defaultValue={profile?.collaborationPreference}
          placeholder="pair study, project teammate"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className={labelClass}>
          Visibility
          <select name="visibility" defaultValue={profile?.visibility === "private" ? "private" : "campus"} className={inputClass}>
            <option value="campus">Campus</option>
            <option value="private">Private</option>
          </select>
          <span className="block text-xs leading-6 text-[var(--color-muted)]">
            Campus is visible to verified UNNC campus users. Private keeps the profile visible only to you and platform
            permissions.
          </span>
        </label>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(29,107,87,0.9)]"
        >
          <Save size={16} aria-hidden="true" />
          Save profile
        </button>
      </div>
    </form>
  );
}

function ProfileRequiredNotice() {
  return (
    <div className="space-y-2 border border-[var(--color-line)] bg-[rgba(181,106,30,0.1)] p-4">
      <StatusBadge tone="caution">profile required</StatusBadge>
      <p className="text-sm leading-7 text-[var(--color-muted)]">
        Complete this academic profile before creating a post. After saving, you will return to the campus feed with
        posting access unlocked.
      </p>
    </div>
  );
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const query = await searchParams;
  const { gate, routeState } = await getCurrentUserProfileData();
  const showProfileRequiredNotice = query.reason === "profile-required";

  return (
    <PageFrame
      eyebrow="Onboarding"
      title="Academic Profile Setup"
      description="Confirm the academic signals that unlock posting, your profile page, and later AI-assisted profile refinement."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone={gate.state === "profile_ready" ? "ready" : "caution"}>{gate.state}</StatusBadge>
        <StatusBadge>{routeState.completionStatus}</StatusBadge>
        <StatusBadge>{routeState.visibility}</StatusBadge>
      </div>

      {showProfileRequiredNotice ? <ProfileRequiredNotice /> : null}

      <AcademicProfileForm profile={routeState.profile} />
    </PageFrame>
  );
}
