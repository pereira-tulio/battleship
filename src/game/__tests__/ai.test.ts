import { describe, expect, it } from 'vitest';
import { aiFire, chooseTarget, createAIState } from '../ai';
import { createBoard, placeShip, randomPlacement } from '../board';

const fixed = (() => {
  let seed = 19;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
})();

describe('AI targeting', () => {
  it('never repeats a cell through a full 100-shot exhaustion', () => {
    let board = randomPlacement(fixed);
    let state = createAIState();
    const seen = new Set<string>();
    for (let index = 0; index < 100; index += 1) {
      const result = aiFire(board, state, fixed);
      board = result.board;
      state = result.state;
      seen.add(`${result.coordinate.row},${result.coordinate.col}`);
    }
    expect(seen.size).toBe(100);
  });

  it('queues orthogonal targets after a hit', () => {
    const board = placeShip(createBoard(), {
      name: 'Destroyer',
      size: 2,
      start: { row: 0, col: 0 },
      orientation: 'horizontal',
    })!;
    const result = aiFire(board, createAIState(), () => 0);
    expect(result.result).toBe('hit');
    expect(result.state.targets).toContainEqual({ row: 1, col: 0 });
  });

  it('fires an adjacent target next', () => {
    let board = placeShip(createBoard(), {
      name: 'Destroyer',
      size: 2,
      start: { row: 0, col: 0 },
      orientation: 'horizontal',
    })!;
    const first = aiFire(board, createAIState(), () => 0);
    board = first.board;
    const second = aiFire(board, first.state, () => 0);
    expect(
      Math.abs(second.coordinate.row - first.coordinate.row) +
        Math.abs(second.coordinate.col - first.coordinate.col),
    ).toBe(1);
  });

  it('uses minimum remaining ship length for parity hunting', () => {
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

  it('purges queued cells belonging to a sunk ship', () => {
    const board = placeShip(createBoard(), {
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

  it('returns to hunt candidates after a sunk ship', () => {
    const board = placeShip(createBoard(), {
      name: 'Destroyer',
      size: 2,
      start: { row: 0, col: 0 },
      orientation: 'horizontal',
    })!;
    const first = aiFire(board, createAIState(), () => 0);
    const second = aiFire(first.board, first.state, () => 0.999);
    const target = chooseTarget(second.board, second.state, () => 0);
    expect(second.state.targets).not.toContainEqual({ row: 0, col: 0 });
    expect(second.state.targets).not.toContainEqual({ row: 0, col: 1 });
    expect(second.state.fired.has(`${target.row},${target.col}`)).toBe(false);
  });
});
