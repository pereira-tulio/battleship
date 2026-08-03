import type { Phase } from '../hooks/useBattleship';

type StatusBannerProps = { phase: Phase; message: string };

export function StatusBanner({ phase, message }: StatusBannerProps) {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">TACTICAL BRIEFING</p>
        <h2>Outthink the tide.</h2>
        <p className="subtitle">
          Deploy with precision. Hunt their fleet. Hold the line.
        </p>
      </div>
      <div className="status" aria-live="polite">
        <span className={`status-dot status-${phase}`} />
        {message}
      </div>
    </section>
  );
}
