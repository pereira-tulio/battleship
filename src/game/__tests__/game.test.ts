import { describe, expect, it } from 'vitest';
import { aiFire, chooseTarget, createAIState } from '../ai';
import { allShipsSunk, fireAt } from '../combat';
import { BOARD_SIZE } from '../types';
import { createBoard, placeShip, randomPlacement } from '../board';
import { battleshipReducer, createInitialState } from '../../hooks/useBattleship';

const fixed = (() => {
  let seed = 19;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
})();
describe('board and combat rules', () => {
  it('creates an empty board with no ships or shots', () => {
    const board = createBoard();
    expect(board.ships).toHaveLength(0);
    expect(board.shots).toEqual({});
  });

  it('accepts both orientations and rejects overlap or bounds', () => {
    let board = createBoard();
    board = placeShip(board, {
      name: 'Carrier',
      size: 5,
      start: { row: 0, col: 0 },
      orientation: 'horizontal',
    })!;
    expect(
      placeShip(board, {
        name: 'Destroyer',
        size: 2,
        start: { row: 0, col: 4 },
        orientation: 'vertical',
      }),
    ).toBeNull();
    expect(
      placeShip(board, {
        name: 'Destroyer',
        size: 2,
        start: { row: 9, col: 9 },
        orientation: 'vertical',
      }),
    ).toBeNull();
    expect(
      placeShip(board, {
        name: 'Destroyer',
        size: 2,
        start: { row: 7, col: 9 },
        orientation: 'vertical',
      }),
    ).not.toBeNull();
    expect(
      placeShip(board, {
        name: 'Destroyer',
        size: 2,
        start: { row: 0, col: 9 },
        orientation: 'horizontal',
      }),
    ).toBeNull();
    expect(
      placeShip(board, {
        name: 'Destroyer',
        size: 2,
        start: { row: -1, col: 0 },
        orientation: 'horizontal',
      }),
    ).toBeNull();
    expect(
      placeShip(board, {
        name: 'Carrier',
        size: 5,
        start: { row: 5, col: 0 },
        orientation: 'vertical',
      }),
    ).not.toBeNull();
    expect(
      placeShip(board, {
        name: 'Carrier',
        size: 5,
        start: { row: 5, col: 1 },
        orientation: 'vertical',
      }),
    ).not.toBeNull();
  });
  it('reports miss, hit, sunk and win', () => {
    let board = createBoard();
    board = placeShip(board, {
      name: 'Destroyer',
      size: 2,
      start: { row: 1, col: 1 },
      orientation: 'horizontal',
    })!;
    expect(fireAt(board, { row: 0, col: 0 })?.result).toBe('miss');
    const hit = fireAt(board, { row: 1, col: 1 })!;
    expect(hit.result).toBe('hit');
    const sunk = fireAt(hit.board, { row: 1, col: 2 })!;
    expect(sunk.result).toBe('sunk');
    expect(sunk.board.shots['1,1']).toBe('sunk');
    expect(sunk.board.shots['1,2']).toBe('sunk');
    expect(fireAt(sunk.board, { row: 1, col: 2 })).toBeNull();
    expect(allShipsSunk(sunk.board)).toBe(true);
  });

  it('generates five legal ships across many deterministic seeds', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      let randomSeed = seed;
      const board = randomPlacement(() => {
        randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0;
        return randomSeed / 4294967296;
      });
      expect(board.ships).toHaveLength(5);
      expect(board.ships.reduce((total, ship) => total + ship.size, 0)).toBe(17);
      const occupied = new Set<string>();
      for (const ship of board.ships) {
        for (let index = 0; index < ship.size; index += 1) {
          const row = ship.start.row + (ship.orientation === 'vertical' ? index : 0);
          const col = ship.start.col + (ship.orientation === 'horizontal' ? index : 0);
          expect(row).toBeGreaterThanOrEqual(0);
          expect(row).toBeLessThan(BOARD_SIZE);
          expect(col).toBeGreaterThanOrEqual(0);
          expect(col).toBeLessThan(BOARD_SIZE);
          expect(occupied.has(`${row},${col}`)).toBe(false);
          occupied.add(`${row},${col}`);
        }
      }
    }
  });
});

describe('AI targeting', () => {
  it('keeps the AI reducer branch deterministic for StrictMode', () => {
    const initial = createInitialState(80);
    const state = {
      ...initial,
      phase: 'aiTurn' as const,
      player: randomPlacement(fixed),
    };
    expect(battleshipReducer(state, { type: 'ai-fire' })).toEqual(
      battleshipReducer(state, { type: 'ai-fire' }),
    );
  });

  it('never repeats cells while exhausting a board', () => {
    const board = randomPlacement(fixed);
    let current = board;
    let state = createAIState();
    const seen = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const outcome = aiFire(current, state, fixed);
      current = outcome.board;
      state = outcome.state;
      seen.add(`${outcome.coordinate.row},${outcome.coordinate.col}`);
    }
    expect(seen.size).toBe(100);
  });
  it('queues an orthogonal target after a hit', () => {
    let board = createBoard();
    board = placeShip(board, {
      name: 'Destroyer',
      size: 2,
      start: { row: 0, col: 0 },
      orientation: 'horizontal',
    })!;
    const outcome = aiFire(board, createAIState(), () => 0);
    expect(outcome.result).toBe('hit');
    expect(
      outcome.state.targets.some(
        (cell) =>
          Math.abs(cell.row - outcome.coordinate.row) +
            Math.abs(cell.col - outcome.coordinate.col) ===
          1,
      ),
    ).toBe(true);
    const followUp = aiFire(outcome.board, outcome.state, () => 0);
    expect(
      Math.abs(followUp.coordinate.row - outcome.coordinate.row) +
        Math.abs(followUp.coordinate.col - outcome.coordinate.col),
    ).toBe(1);
  });

  it('uses the minimum remaining ship length for hunt parity', () => {
    let board = createBoard();
    board = placeShip(board, {
      name: 'Carrier',
      size: 5,
      start: { row: 0, col: 0 },
      orientation: 'horizontal',
    })!;
    board = placeShip(board, {
      name: 'Destroyer',
      size: 2,
      start: { row: 2, col: 0 },
      orientation: 'horizontal',
    })!;
    const target = chooseTarget(board, createAIState(), () => 0);
    expect((target.row + target.col) % 2).toBe(0);
  });

  it('purges targets belonging to a sunk ship', () => {
    let board = createBoard();
    board = placeShip(board, {
      name: 'Destroyer',
      size: 2,
      start: { row: 0, col: 0 },
      orientation: 'horizontal',
    })!;
    const first = aiFire(board, createAIState(), () => 0);
    const second = aiFire(first.board, first.state, () => 0.999);
    expect(second.result).toBe('sunk');
    expect(second.state.targets).not.toContainEqual({ row: 0, col: 0 });
    expect(second.state.targets).not.toContainEqual({ row: 0, col: 1 });
  });
});
