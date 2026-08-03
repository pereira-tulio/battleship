import type { Phase } from '../hooks/useBattleship';

type StatusBannerProps = { phase: Phase; message: string };

export function StatusBanner({ phase, message }: StatusBannerProps) {
  const title =
    phase === 'placement'
      ? 'Deployment'
      : phase === 'playerTurn'
        ? 'Your move'
        : phase === 'aiTurn'
          ? 'Enemy move'
          : 'Final score';

  return (
    <section className="hero">
      <div>
        <h2>{title}</h2>
        <p className="subtitle">Mark the grid. Make the call. Hold the line.</p>
      </div>
      <div className="status" aria-live="polite">
        <span className={`status-dot status-${phase}`} />
        {message}
      </div>
    </section>
  );
}
