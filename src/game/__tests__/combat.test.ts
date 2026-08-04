import { describe, expect, it } from 'vitest';
import { createBoard, placeShip } from '../board';
import { allShipsSunk, fireAt } from '../combat';

const destroyerBoard = () =>
  placeShip(createBoard(), {
    name: 'Destroyer',
    size: 2,
    start: { row: 1, col: 1 },
    orientation: 'horizontal',
  })!;

describe('combat', () => {
  it('reports a miss', () => {
    expect(fireAt(destroyerBoard(), { row: 0, col: 0 })?.result).toBe('miss');
  });

  it('reports a hit', () => {
    expect(fireAt(destroyerBoard(), { row: 1, col: 1 })?.result).toBe('hit');
  });

  it('reports a sunk ship', () => {
    const first = fireAt(destroyerBoard(), { row: 1, col: 1 })!;
    expect(fireAt(first.board, { row: 1, col: 2 })).toMatchObject({
      result: 'sunk',
      shipName: 'Destroyer',
    });
  });

  it('marks every cell of a sunk ship', () => {
    const first = fireAt(destroyerBoard(), { row: 1, col: 1 })!;
    const second = fireAt(first.board, { row: 1, col: 2 })!;
    expect(second.board.shots['1,1']).toBe('sunk');
    expect(second.board.shots['1,2']).toBe('sunk');
  });

  it('rejects repeated shots', () => {
    const first = fireAt(destroyerBoard(), { row: 0, col: 0 })!;
    expect(fireAt(first.board, { row: 0, col: 0 })).toBeNull();
  });

  it('detects a win when every ship is sunk', () => {
    const first = fireAt(destroyerBoard(), { row: 1, col: 1 })!;
    const second = fireAt(first.board, { row: 1, col: 2 })!;
    expect(allShipsSunk(second.board)).toBe(true);
  });

  it('does not call an empty board a win', () => {
    expect(allShipsSunk(createBoard())).toBe(false);
  });
});
