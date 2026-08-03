import { useCallback, useEffect, useReducer, useRef } from 'react';
import { aiFire, createAIState, type AIState } from '../game/ai';
import { allShipsSunk, fireAt } from '../game/combat';
import { FLEET } from '../game/fleet';
import { createBoard, placeShip, randomPlacement } from '../game/board';
import type { Board, Coordinate, Orientation, RNG, ShipName } from '../game/types';
import { keyOf } from '../game/types';

export type Phase = 'placement' | 'playerTurn' | 'aiTurn' | 'gameOver';
type State = { phase: Phase; player: Board; enemy: Board; ai: AIState; selected: ShipName; orientation: Orientation; winner: 'player' | 'ai' | null; message: string };
type Action =
  | { type: 'place'; coordinate: Coordinate }
  | { type: 'random' }
  | { type: 'reset-placement' }
  | { type: 'rotate' }
  | { type: 'start' }
  | { type: 'fire'; coordinate: Coordinate }
  | { type: 'ai-fire' }
  | { type: 'new' };

const seeded = (seed: number): RNG => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const initial = (rng: RNG): State => ({
  phase: 'placement', player: createBoard(), enemy: randomPlacement(rng), ai: createAIState(),
  selected: FLEET[0].name, orientation: 'horizontal', winner: null, message: 'Deploy your fleet to begin.',
});
const nextUnplaced = (board: Board) => FLEET.find((spec) => !board.ships.some((ship) => ship.name === spec.name))?.name ?? null;

function reducer(state: State, action: Action): State {
  if (action.type === 'new') return initial(seeded(Date.now()));
  if (action.type === 'rotate') return state.phase === 'placement' ? { ...state, orientation: state.orientation === 'horizontal' ? 'vertical' : 'horizontal' } : state;
  if (action.type === 'reset-placement') return state.phase === 'placement' ? { ...state, player: createBoard(), selected: FLEET[0].name, message: 'Fleet reset. Place your ships.' } : state;
  if (action.type === 'random') {
    const player = randomPlacement(seeded(Date.now() + 17));
    return { ...state, player, selected: FLEET[FLEET.length - 1].name, message: 'Fleet deployed. Start when you are ready.' };
  }
  if (action.type === 'place' && state.phase === 'placement') {
    const spec = FLEET.find((item) => item.name === state.selected);
    if (!spec || state.player.ships.some((ship) => ship.name === spec.name)) return state;
    const player = placeShip(state.player, { ...spec, start: action.coordinate, orientation: state.orientation });
    if (!player) return { ...state, message: 'That placement is not valid.' };
    const selected = nextUnplaced(player);
    return { ...state, player, selected: selected ?? state.selected, message: selected ? `Place your ${selected}.` : 'Fleet deployed. Start when you are ready.' };
  }
  if (action.type === 'start' && state.phase === 'placement' && state.player.ships.length === FLEET.length)
    return { ...state, phase: 'playerTurn', message: 'Your turn — select a cell in enemy waters.' };
  if (action.type === 'fire' && state.phase === 'playerTurn') {
    const outcome = fireAt(state.enemy, action.coordinate);
    if (!outcome) return state;
    const playerWon = allShipsSunk(outcome.board);
    return { ...state, enemy: outcome.board, phase: playerWon ? 'gameOver' : 'aiTurn', winner: playerWon ? 'player' : null, message: playerWon ? 'You sank the entire enemy fleet!' : `You ${outcome.result}. Enemy is taking aim...` };
  }
  if (action.type === 'ai-fire' && state.phase === 'aiTurn') {
    const outcome = aiFire(state.player, state.ai, seeded(Date.now() + state.ai.fired.size * 31));
    const aiWon = allShipsSunk(outcome.board);
    return { ...state, player: outcome.board, ai: outcome.state, phase: aiWon ? 'gameOver' : 'playerTurn', winner: aiWon ? 'ai' : null, message: aiWon ? 'The enemy fleet wins this round.' : `Enemy ${outcome.result}. Your turn.` };
  }
  return state;
}

export const useBattleship = () => {
  const [state, dispatch] = useReducer(reducer, undefined, () => initial(seeded(42)));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (state.phase === 'aiTurn') {
      timer.current = setTimeout(() => dispatch({ type: 'ai-fire' }), 650);
      return () => { if (timer.current) clearTimeout(timer.current); };
    }
  }, [state.phase, state.ai.fired.size]);
  const action = useCallback((type: Action['type'], coordinate?: Coordinate) => dispatch(coordinate ? { type, coordinate } as Action : { type } as Action), []);
  return { state, place: (coordinate: Coordinate) => action('place', coordinate), fire: (coordinate: Coordinate) => action('fire', coordinate), rotate: () => action('rotate'), randomize: () => action('random'), resetPlacement: () => action('reset-placement'), start: () => action('start'), newGame: () => action('new'), keyOf };
};
