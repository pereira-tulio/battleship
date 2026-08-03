type GameHeaderProps = { onNewGame: () => void };

export function GameHeader({ onNewGame }: GameHeaderProps) {
  return (
    <header className="topbar">
      <h1>Battleship</h1>
      <button className="button button-quiet" onClick={onNewGame}>
        New Game
      </button>
    </header>
  );
}
