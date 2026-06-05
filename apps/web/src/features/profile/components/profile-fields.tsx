type ProfileSignalFieldProps = {
  emptyText?: string;
  items: string[];
  label: string;
};

export function ProfileSignalField({ emptyText = "Not added yet", items, label }: ProfileSignalFieldProps) {
  return (
    <div className="space-y-2 border border-[var(--color-line)] bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</h3>
      {items.length === 0 ? (
        <span className="text-sm text-[var(--color-muted)]">{emptyText}</span>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="bg-[var(--color-accent-soft)] px-2 py-1 text-xs font-medium text-[var(--color-accent)]"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
