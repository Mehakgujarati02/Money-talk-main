export function NeedsWantsDonut({ needs, wants }: { needs: number; wants: number }) {
  const total = needs + wants || 1;
  const wantsPct = (wants / total) * 100;
  const needsPct = 100 - wantsPct;
  const C = 2 * Math.PI * 42;
  const wantsLen = (wantsPct / 100) * C;

  return (
    <div className="card-soft flex h-full flex-col p-6">
      <div className="relative mx-auto h-44 w-44">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-muted)" strokeWidth="11" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${wantsLen} ${C}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-black">Mix</span>
        </div>
      </div>
      <div className="mt-5 space-y-2 text-sm">
        <Row color="var(--color-primary)" label="Wants" value={wantsPct} />
        <Row color="var(--color-secondary)" label="Needs" value={needsPct} />
      </div>
    </div>
  );
}

function Row({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="font-semibold">{label}</span>
      </div>
      <span className="tabular-nums text-muted-foreground">{Math.round(value)}%</span>
    </div>
  );
}
