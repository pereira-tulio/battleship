import { useCallback, useEffect, useReducer, useRef } from 'react';
import { aiFire, createAIState, type AIState } from '../game/ai';
import { allShipsSunk, fireAt } from '../game/combat';
import { createBoard, placeShip, randomPlacement } from '../game/board';
import { FLEET } from '../game/fleet';
import type { Board, Coordinate, Orientation, RNG, ShipName } from '../game/types';

export type Phase = 'placement' | 'playerTurn' | 'aiTurn' | 'gameOver';
export type Winner = 'player' | 'ai' | null;
export type GameState = {
  phase: Phase;
  player: Board;
  enemy: Board;
  ai: AIState;
  selected: ShipName;
  orientation: Orientation;
  winner: Winner;
  message: string;
  rngSeed: number;
};

export type Action =
  | { type: 'place'; coordinate: Coordinate }
  | { type: 'random' }
  | { type: 'reset-placement' }
  | { type: 'rotate' }
  | { type: 'select-ship'; name: ShipName }
  | { type: 'start' }
  | { type: 'fire'; coordinate: Coordinate }
  | { type: 'ai-fire' }
  | { type: 'new' };

export const seeded =
  (seed: number): RNG =>
  () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

export const createInitialState = (seed = 42): GameState => ({
  phase: 'placement',
  player: createBoard(),
  enemy: randomPlacement(seeded(seed)),
  ai: createAIState(),
  selected: FLEET[0].name,
  orientation: 'horizontal',
  winner: null,
  message: 'Deploy your fleet to begin.',
  rngSeed: seed + 1,
});

const nextUnplaced = (board: Board) =>
  FLEET.find((spec) => !board.ships.some((ship) => ship.name === spec.name))?.name ??
  null;

export function battleshipReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'new':
      return createInitialState(state.rngSeed + 1);
    case 'rotate':
      return state.phase === 'placement'
        ? {
            ...state,
            orientation: state.orientation === 'horizontal' ? 'vertical' : 'horizontal',
          }
        : state;
    case 'select-ship':
      return state.phase === 'placement' &&
        !state.player.ships.some((ship) => ship.name === action.name)
        ? { ...state, selected: action.name }
        : state;
    case 'reset-placement':
      return state.phase === 'placement'
        ? {
            ...state,
            player: createBoard(),
            selected: FLEET[0].name,
            message: 'Fleet reset. Place your ships.',
          }
        : state;
    case 'random':
      return state.phase === 'placement'
        ? {
            ...state,
            player: randomPlacement(seeded(state.rngSeed)),
            selected: FLEET[FLEET.length - 1].name,
            rngSeed: state.rngSeed + 1,
            message: 'Fleet deployed. Start when you are ready.',
          }
        : state;
    case 'place': {
      if (state.phase !== 'placement') return state;
      const spec = FLEET.find((item) => item.name === state.selected);
      if (!spec || state.player.ships.some((ship) => ship.name === spec.name))
        return state;
      const player = placeShip(state.player, {
        ...spec,
        start: action.coordinate,
        orientation: state.orientation,
      });
      if (!player) return { ...state, message: 'That placement is not valid.' };
      const selected = nextUnplaced(player);
      return {
        ...state,
        player,
        selected: selected ?? state.selected,
        message: selected
          ? `Place your ${selected}.`
          : 'Fleet deployed. Start when you are ready.',
      };
    }
    case 'start':
      return state.phase === 'placement' && state.player.ships.length === FLEET.length
        ? {
            ...state,
            phase: 'playerTurn',
            message: 'Your turn — select a cell in enemy waters.',
          }
        : state;
    case 'fire': {
      if (state.phase !== 'playerTurn') return state;
      const outcome = fireAt(state.enemy, action.coordinate);
      if (!outcome) return state;
      const playerWon = allShipsSunk(outcome.board);
      return {
        ...state,
        enemy: outcome.board,
        phase: playerWon ? 'gameOver' : 'aiTurn',
        winner: playerWon ? 'player' : null,
        message: playerWon
          ? 'You sank the entire enemy fleet!'
          : `You ${outcome.result}. Enemy is taking aim...`,
      };
    }
    case 'ai-fire': {
      if (state.phase !== 'aiTurn') return state;
      const outcome = aiFire(state.player, state.ai, seeded(state.rngSeed));
      const aiWon = allShipsSunk(outcome.board);
      return {
        ...state,
        player: outcome.board,
        ai: outcome.state,
        rngSeed: state.rngSeed + 1,
        phase: aiWon ? 'gameOver' : 'playerTurn',
        winner: aiWon ? 'ai' : null,
        message: aiWon
          ? 'The enemy fleet wins this round.'
          : `Enemy ${outcome.result}. Your turn.`,
      };
    }
  }
}

export function useBattleship() {
  const [state, dispatch] = useReducer(battleshipReducer, undefined, () =>
    createInitialState(),
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.phase !== 'aiTurn') return undefined;
    timer.current = setTimeout(() => dispatch({ type: 'ai-fire' }), 650);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state.phase]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const action = useCallback((nextAction: Action) => dispatch(nextAction), []);

  return {
    state,
    place: (coordinate: Coordinate) => action({ type: 'place', coordinate }),
    fire: (coordinate: Coordinate) => action({ type: 'fire', coordinate }),
    rotate: () => action({ type: 'rotate' }),
    selectShip: (name: ShipName) => action({ type: 'select-ship', name }),
    randomize: () => action({ type: 'random' }),
    resetPlacement: () => action({ type: 'reset-placement' }),
    start: () => action({ type: 'start' }),
    newGame: () => action({ type: 'new' }),
  };
}
