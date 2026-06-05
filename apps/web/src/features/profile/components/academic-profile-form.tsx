import { StatusBadge } from "@/components/status-badge";
import { ProfileSubmitButton } from "@/features/profile/components/profile-submit-button";
import type { AcademicProfile } from "@/features/profile/schemas";
import { upsertAcademicProfileAction } from "@/features/profile/server/actions";

const inputClass =
  "w-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]";

const labelClass = "space-y-2 text-sm font-medium text-[var(--color-ink)]";

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
      <input
        name={name}
        type="text"
        defaultValue={joinField(defaultValue)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

export function AcademicProfileForm({ profile }: { profile: AcademicProfile | null }) {
  return (
    <form action={upsertAcademicProfileAction} className="space-y-6">
      <section className="space-y-4 border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-5">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Core identity</h2>
          <p className="text-xs leading-6 text-[var(--color-muted)]">
            These fields make the profile readable in the feed and public profile pages.
          </p>
        </div>
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
      </section>

      <section className="space-y-4 border border-[var(--color-line)] bg-white p-5">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Academic signals</h2>
          <p className="text-xs leading-6 text-[var(--color-muted)]">
            Enter comma-separated items. These values support posts, profile discovery, and later recommendations.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ListField name="modules" label="Modules" defaultValue={profile?.modules} placeholder="ELEC2043, COMP1048" />
          <ListField
            name="interests"
            label="Interests"
            defaultValue={profile?.interests}
            placeholder="embedded systems, web apps"
          />
          <ListField name="skills" label="Skills" defaultValue={profile?.skills} placeholder="python, react, circuit design" />
          <ListField
            name="helpOffered"
            label="Help offered"
            defaultValue={profile?.helpOffered}
            placeholder="debugging, lab reports"
          />
          <ListField name="helpNeeded" label="Help needed" defaultValue={profile?.helpNeeded} placeholder="signals, algorithms" />
          <ListField
            name="collaborationPreference"
            label="Collaboration preference"
            defaultValue={profile?.collaborationPreference}
            placeholder="pair study, project teammate"
          />
        </div>
      </section>

      <section className="grid gap-4 border border-[var(--color-line)] bg-white p-5 md:grid-cols-[1fr_auto] md:items-end">
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

        <ProfileSubmitButton />
      </section>
    </form>
  );
}

export function ProfileRequiredNotice() {
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
