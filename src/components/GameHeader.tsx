type GameHeaderProps = {
  muted: boolean;
  onNewGame: () => void;
  onToggleMute: () => void;
};

export function GameHeader({ muted, onNewGame, onToggleMute }: GameHeaderProps) {
  return (
    <header className="topbar">
      <h1>Battleship</h1>
      <div className="topbar-actions">
        <button
          className="button button-quiet"
          aria-label={muted ? 'Enable shot sounds' : 'Mute shot sounds'}
          aria-pressed={muted}
          onClick={onToggleMute}
        >
          {muted ? 'Sound off' : 'Sound on'}
        </button>
        <button className="button button-quiet" onClick={onNewGame}>
          New Game
        </button>
      </div>
    </header>
  );
}
