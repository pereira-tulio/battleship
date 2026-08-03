import type { Phase } from '../hooks/useBattleship';

type StatusBannerProps = {
  phase: Phase;
  message: string;
  onNewGame?: () => void;
};

export function StatusBanner({ phase, message, onNewGame }: StatusBannerProps) {
  const title =
    phase === 'placement'
      ? 'Deployment'
      : phase === 'playerTurn'
        ? 'Your move'
        : phase === 'aiTurn'
          ? 'Enemy move'
          : message.includes('entire enemy fleet')
            ? 'Victory'
            : 'Defeat';

  return (
    <section className="hero">
      <div>
        <h2>{title}</h2>
      </div>
      <div className="status" aria-live="polite">
        <span className={`status-dot status-${phase}`} />
        {message}
      </div>
      {phase === 'gameOver' && onNewGame && (
        <button className="button" onClick={onNewGame}>
          Play again
        </button>
      )}
    </section>
  );
}
