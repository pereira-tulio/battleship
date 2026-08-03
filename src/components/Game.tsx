import { useEffect, useMemo, useState } from 'react';
import { canPlaceShip } from '../game/board';
import { FLEET } from '../game/fleet';
import { useBattleship } from '../hooks/useBattleship';
import { Board } from './Board';
import type { Coordinate } from '../game/types';
import '../styles.css';

export function Game() {
  const { state, place, fire, rotate, randomize, resetPlacement, start, newGame } = useBattleship();
  const [hover, setHover] = useState<Coordinate | null>(null);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key.toLowerCase() === 'r') rotate(); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [rotate]);
  const selectedSpec = FLEET.find((item) => item.name === state.selected);
  const preview = useMemo(() => hover && selectedSpec ? { start: hover, size: selectedSpec.size, orientation: state.orientation } : null, [hover, selectedSpec, state.orientation]);
  return <main className="shell">
    <header className="topbar"><div><p className="eyebrow">FLEETLINE COMMAND</p><h1>Battleship</h1></div><button className="button button-quiet" onClick={newGame}>New Game</button></header>
    <section className="hero"><div><p className="eyebrow">TACTICAL BRIEFING</p><h2>Outthink the tide.</h2><p className="subtitle">Deploy with precision. Hunt their fleet. Hold the line.</p></div><div className="status" aria-live="polite"><span className={`status-dot status-${state.phase}`} />{state.message}</div></section>
    {state.phase === 'gameOver' && <section className="winner" aria-live="polite"><strong>{state.winner === 'player' ? 'VICTORY' : 'DEFEAT'}</strong><span>{state.winner === 'player' ? 'Your fleet commands the sea.' : 'Regroup and return to the fight.'}</span><button className="button" onClick={newGame}>Play again</button></section>}
    {state.phase === 'placement' && <section className="controls"><div><span className="eyebrow">DEPLOYMENT</span><p>Place <strong>{state.selected}</strong> ({selectedSpec?.size} cells)</p></div><div className="control-actions"><button className="button button-outline" onClick={rotate}>↻ Rotate <kbd>R</kbd></button><button className="button button-outline" onClick={randomize}>Random placement</button><button className="button button-outline" onClick={resetPlacement}>Reset placement</button></div></section>}
    <section className="boards"><div className="board-panel"><div className="panel-heading"><div><span className="eyebrow">ALPHA FLEET</span><h3>Your waters</h3></div><span className="counter">{state.player.ships.length} / 5 deployed</span></div><Board board={state.player} preview={state.phase === 'placement' ? preview : null} previewValid={Boolean(preview && canPlaceShip(state.player, preview.start, preview.size, preview.orientation))} onHover={setHover} onCell={(cell) => { setHover(cell); if (selectedSpec && canPlaceShip(state.player, cell, selectedSpec.size, state.orientation)) place(cell); }} /><div className="fleet-list">{FLEET.map((ship) => <span className={state.player.ships.some((item) => item.name === ship.name) ? 'deployed' : ''} key={ship.name}>{ship.name} <b>{ship.size}</b></span>)}</div></div>
      <div className="board-panel enemy-panel"><div className="panel-heading"><div><span className="eyebrow">BRAVO FLEET</span><h3>Enemy waters</h3></div><span className="counter">{Object.keys(state.enemy.shots).length} shots</span></div><Board board={state.enemy} enemy disabled={state.phase !== 'playerTurn'} onCell={fire} /><p className="helper">{state.phase === 'playerTurn' ? 'Select a coordinate to fire.' : 'Enemy waters are locked.'}</p></div></section>
    {state.phase === 'placement' && <button className="start-button" disabled={state.player.ships.length !== 5} onClick={start}>{state.player.ships.length === 5 ? 'Start mission' : 'Deploy all ships to start'} <span>→</span></button>}
  </main>;
}
