import { describe, expect, it } from 'vitest';
import {
  battleshipReducer,
  createInitialState,
  seeded,
  type GameState,
} from '../useBattleship';
import { randomPlacement } from '../../game/board';

const deployed = (seed = 42) => {
  const state = createInitialState(seed);
  return battleshipReducer(state, { type: 'random' });
};

describe('battleship reducer', () => {
  it('gates rotation outside placement', () => {
    const state = { ...createInitialState(), phase: 'playerTurn' as const };
    expect(battleshipReducer(state, { type: 'rotate' })).toBe(state);
  });

  it('rotates during placement', () => {
    const state = createInitialState();
    expect(battleshipReducer(state, { type: 'rotate' }).orientation).toBe('vertical');
  });

  it('selects an unplaced ship', () => {
    const state = createInitialState();
    expect(
      battleshipReducer(state, { type: 'select-ship', name: 'Destroyer' }).selected,
    ).toBe('Destroyer');
  });

  it('does not select an already placed ship', () => {
    const state = deployed();
    expect(
      battleshipReducer(state, { type: 'select-ship', name: 'Carrier' }).selected,
    ).toBe('Destroyer');
  });

  it('randomizes a full fleet and advances the seed', () => {
    const state = createInitialState(10);
    const next = battleshipReducer(state, { type: 'random' });
    expect(next.player.ships).toHaveLength(5);
    expect(next.rngSeed).toBe(state.rngSeed + 1);
  });

  it('resets placement to an empty board', () => {
    const next = battleshipReducer(deployed(), { type: 'reset-placement' });
    expect(next.player.ships).toHaveLength(0);
    expect(next.phase).toBe('placement');
    expect(next.selected).toBe('Carrier');
  });

  it('places the selected ship at a valid coordinate', () => {
    const next = battleshipReducer(createInitialState(), {
      type: 'place',
      coordinate: { row: 0, col: 0 },
    });
    expect(next.player.ships).toHaveLength(1);
    expect(next.selected).toBe('Battleship');
  });

  it('rejects an invalid placement without changing ships', () => {
    const state = createInitialState();
    const next = battleshipReducer(state, {
      type: 'place',
      coordinate: { row: 9, col: 9 },
    });
    expect(next.player.ships).toHaveLength(0);
    expect(next.message).toMatch(/not valid/i);
  });

  it('rejects placing a ship that is already deployed', () => {
    const placed = battleshipReducer(createInitialState(), {
      type: 'place',
      coordinate: { row: 0, col: 0 },
    });
    const duplicate = battleshipReducer(
      { ...placed, selected: 'Carrier' },
      { type: 'place', coordinate: { row: 5, col: 0 } },
    );
    expect(duplicate.player.ships).toHaveLength(1);
  });

  it('requires the full fleet before starting', () => {
    expect(battleshipReducer(createInitialState(), { type: 'start' }).phase).toBe(
      'placement',
    );
    expect(battleshipReducer(deployed(), { type: 'start' }).phase).toBe('playerTurn');
  });

  it('ignores player fire outside playerTurn', () => {
    const state = createInitialState();
    expect(
      battleshipReducer(state, { type: 'fire', coordinate: { row: 0, col: 0 } }),
    ).toBe(state);
  });

  it('ignores AI fire outside aiTurn', () => {
    const state = createInitialState();
    expect(battleshipReducer(state, { type: 'ai-fire' })).toBe(state);
  });

  it('starts an AI turn after a valid player shot', () => {
    const state = { ...deployed(), phase: 'playerTurn' as const };
    expect(
      battleshipReducer(state, { type: 'fire', coordinate: { row: 0, col: 0 } }).phase,
    ).toBe('aiTurn');
  });

  it('resets the complete game state with New Game', () => {
    const state = {
      ...deployed(),
      phase: 'playerTurn' as const,
      winner: 'player' as const,
    };
    const next = battleshipReducer(state, { type: 'new' });
    expect(next.phase).toBe('placement');
    expect(next.player.ships).toHaveLength(0);
    expect(next.enemy.ships).toHaveLength(5);
    expect(next.winner).toBeNull();
  });

  it('produces deterministic initial states for a fixed seed', () => {
    expect(createInitialState(99)).toEqual(createInitialState(99));
  });

  it('produces deterministic random placement for a fixed RNG', () => {
    expect(randomPlacement(seeded(7))).toEqual(randomPlacement(seeded(7)));
  });

  it('keeps an AI reducer result deterministic for a fixed state', () => {
    const state: GameState = {
      ...deployed(80),
      phase: 'aiTurn',
    };
    expect(battleshipReducer(state, { type: 'ai-fire' })).toEqual(
      battleshipReducer(state, { type: 'ai-fire' }),
    );
  });
});
