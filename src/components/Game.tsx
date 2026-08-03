import { useEffect, useMemo, useState } from 'react';
import { canPlaceShip } from '../game/board';
import { FLEET } from '../game/fleet';
import { useBattleship } from '../hooks/useBattleship';
import type { Coordinate } from '../game/types';
import { BoardPanel } from './BoardPanel';
import { GameHeader } from './GameHeader';
import { PlacementPanel } from './PlacementPanel';
import { StatusBanner } from './StatusBanner';
import '../styles.css';

function Legend() {
  return (
    <div className="legend" aria-label="Board legend">
      <span>
        <i className="legend-swatch legend-miss">•</i> Miss
      </span>
      <span>
        <i className="legend-swatch legend-hit">✦</i> Hit
      </span>
      <span>
        <i className="legend-swatch legend-sunk">◆</i> Sunk
      </span>
    </div>
  );
}

export function Game() {
  const {
    state,
    place,
    fire,
    rotate,
    selectShip,
    randomize,
    resetPlacement,
    start,
    newGame,
  } = useBattleship();
  const [hover, setHover] = useState<Coordinate | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'r' && state.phase === 'placement') {
        rotate();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rotate, state.phase]);

  const selectedSpec = FLEET.find((item) => item.name === state.selected);
  const preview = useMemo(
    () =>
      hover && selectedSpec
        ? {
            start: hover,
            size: selectedSpec.size,
            orientation: state.orientation,
          }
        : null,
    [hover, selectedSpec, state.orientation],
  );
  const previewValid = Boolean(
    preview &&
    canPlaceShip(state.player, preview.start, preview.size, preview.orientation),
  );

  return (
    <main className="shell">
      <GameHeader onNewGame={newGame} />
      <StatusBanner phase={state.phase} message={state.message} />

      {state.phase === 'gameOver' && (
        <section className="winner" aria-live="polite">
          <strong>{state.winner === 'player' ? 'VICTORY' : 'DEFEAT'}</strong>
          <span>
            {state.winner === 'player'
              ? 'Your fleet commands the sea.'
              : 'Regroup and return to the fight.'}
          </span>
          <button className="button" onClick={newGame}>
            Play again
          </button>
        </section>
      )}

      {state.phase === 'placement' && (
        <PlacementPanel
          selected={state.selected}
          playerBoard={state.player}
          orientation={state.orientation}
          onRotate={rotate}
          onRandomize={randomize}
          onReset={resetPlacement}
          onSelectShip={selectShip}
        />
      )}

      <section className="boards">
        <BoardPanel
          board={state.player}
          preview={state.phase === 'placement' ? preview : null}
          previewValid={previewValid}
          interactive={state.phase === 'placement'}
          onHover={setHover}
          onCell={(cell) => {
            setHover(cell);
            if (
              selectedSpec &&
              canPlaceShip(state.player, cell, selectedSpec.size, state.orientation)
            ) {
              place(cell);
            }
          }}
          shotsLabel={`${state.player.ships.reduce(
            (count, ship) => count + ship.hits.length,
            0,
          )} hits taken`}
        />
        <BoardPanel
          board={state.enemy}
          enemy
          interactive={state.phase === 'playerTurn'}
          onCell={fire}
          shotsLabel={`${Object.keys(state.enemy.shots).length} shots`}
        />
      </section>

      <Legend />

      {state.phase === 'placement' && (
        <button
          className="start-button"
          disabled={state.player.ships.length !== FLEET.length}
          onClick={start}
        >
          {state.player.ships.length === FLEET.length
            ? 'Start mission'
            : 'Deploy all ships to start'}
          <span>→</span>
        </button>
      )}
    </main>
  );
}
