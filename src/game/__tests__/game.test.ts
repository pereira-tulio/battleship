import { describe, expect, it } from 'vitest';
import { aiFire, createAIState } from '../ai';
import { allShipsSunk, fireAt } from '../combat';
import { createBoard, placeShip, randomPlacement } from '../board';

const fixed = (() => {
  let seed = 19;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
})();
describe('board and combat rules', () => {
  it('accepts both orientations and rejects overlap or bounds', () => {
    let board = createBoard();
    board = placeShip(board, { name: 'Carrier', size: 5, start: { row: 0, col: 0 }, orientation: 'horizontal' })!;
    expect(placeShip(board, { name: 'Destroyer', size: 2, start: { row: 0, col: 4 }, orientation: 'vertical' })).toBeNull();
    expect(placeShip(board, { name: 'Destroyer', size: 2, start: { row: 9, col: 9 }, orientation: 'vertical' })).toBeNull();
    expect(placeShip(board, { name: 'Destroyer', size: 2, start: { row: 7, col: 9 }, orientation: 'vertical' })).not.toBeNull();
  });
  it('reports miss, hit, sunk and win', () => {
    let board = createBoard();
    board = placeShip(board, { name: 'Destroyer', size: 2, start: { row: 1, col: 1 }, orientation: 'horizontal' })!;
    expect(fireAt(board, { row: 0, col: 0 })?.result).toBe('miss');
    const hit = fireAt(board, { row: 1, col: 1 })!;
    expect(hit.result).toBe('hit');
    const sunk = fireAt(hit.board, { row: 1, col: 2 })!;
    expect(sunk.result).toBe('sunk');
    expect(allShipsSunk(sunk.board)).toBe(true);
  });
});

describe('AI targeting', () => {
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
    board = placeShip(board, { name: 'Destroyer', size: 2, start: { row: 0, col: 0 }, orientation: 'horizontal' })!;
    const outcome = aiFire(board, createAIState(), () => 0);
    expect(outcome.result).toBe('hit');
    expect(outcome.state.targets.some((cell) => Math.abs(cell.row - outcome.coordinate.row) + Math.abs(cell.col - outcome.coordinate.col) === 1)).toBe(true);
  });
});
