type GameHeaderProps = { onNewGame: () => void };

export function GameHeader({ onNewGame }: GameHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">FLEETLINE COMMAND</p>
        <h1>Battleship</h1>
      </div>
      <button className="button button-quiet" onClick={onNewGame}>
        New Game
      </button>
    </header>
  );
}
