import { useEffect, useMemo, useRef, useState } from 'react';
import { canPlaceShip } from '../game/board';
import { FLEET } from '../game/fleet';
import { useBattleship } from '../hooks/useBattleship';
import { useBattleSounds } from '../hooks/useBattleSounds';
import type { Coordinate } from '../game/types';
import { BoardPanel } from './BoardPanel';
import { GameHeader } from './GameHeader';
import { PlacementPanel } from './PlacementPanel';
import { StatusBanner } from './StatusBanner';
import { CellMark } from './CellMark';
import '../styles.css';

function Legend() {
  return (
    <div className="legend" aria-label="Board legend">
      <span>
        <i className="legend-swatch legend-miss">
          <CellMark status="miss" />
        </i>{' '}
        Miss
      </span>
      <span>
        <i className="legend-swatch legend-hit">
          <CellMark status="hit" />
        </i>{' '}
        Hit
      </span>
      <span>
        <i className="legend-swatch legend-sunk">
          <CellMark status="sunk" />
        </i>{' '}
        Sunk
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
  const sounds = useBattleSounds();
  const [hover, setHover] = useState<Coordinate | null>(null);
  const heardShots = useRef({ player: '', enemy: '' });

  useEffect(() => {
    const shot = state.latestEnemyShot;
    if (!shot) return;
    const key = `${shot.row},${shot.col}`;
    if (heardShots.current.enemy === key) return;
    heardShots.current.enemy = key;
    const result = state.enemy.shots[key];
    if (result) sounds.playShot(result);
  }, [sounds, state.enemy.shots, state.latestEnemyShot]);

  useEffect(() => {
    const shot = state.latestPlayerShot;
    if (!shot) return;
    const key = `${shot.row},${shot.col}`;
    if (heardShots.current.player === key) return;
    heardShots.current.player = key;
    const result = state.player.shots[key];
    if (result) sounds.playShot(result);
  }, [sounds, state.latestPlayerShot, state.player.shots]);

  useEffect(() => {
    setHover(null);
  }, [state.phase, state.player, state.selected, state.orientation]);

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
      <GameHeader
        muted={sounds.muted}
        onNewGame={newGame}
        onToggleMute={() => sounds.setMuted(!sounds.muted)}
      />
      <StatusBanner phase={state.phase} message={state.message} onNewGame={newGame} />

      <div
        className={`game-content ${
          state.phase === 'placement' ? 'placement-content' : ''
        }`}
      >
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
            latestShot={state.latestPlayerShot}
            aimingShot={state.phase === 'aiAiming' ? state.aiTarget : null}
            onHover={setHover}
            onMouseLeave={() => setHover(null)}
            onBlur={() => setHover(null)}
            phase={state.phase}
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
            latestShot={state.latestEnemyShot}
            onCell={(cell) => {
              sounds.arm();
              fire(cell);
            }}
            phase={state.phase}
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
          </button>
        )}
      </div>
    </main>
  );
}
