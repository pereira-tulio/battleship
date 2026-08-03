import { describe, expect, it } from 'vitest';
import { createBoard, placeShip } from '../board';

const ship = (
  name: 'Carrier' | 'Destroyer',
  start: { row: number; col: number },
  orientation: 'horizontal' | 'vertical',
) => ({ name, size: name === 'Carrier' ? 5 : 2, start, orientation });

describe('ship placement', () => {
  it('places a horizontal ship', () => {
    const result = placeShip(
      createBoard(),
      ship('Carrier', { row: 0, col: 0 }, 'horizontal'),
    );
    expect(result?.ships[0].orientation).toBe('horizontal');
  });

  it('places a vertical ship', () => {
    const result = placeShip(
      createBoard(),
      ship('Carrier', { row: 0, col: 0 }, 'vertical'),
    );
    expect(result?.ships[0].orientation).toBe('vertical');
  });

  it('rejects overlap', () => {
    const board = placeShip(
      createBoard(),
      ship('Carrier', { row: 0, col: 0 }, 'horizontal'),
    )!;
    expect(
      placeShip(board, ship('Destroyer', { row: 0, col: 4 }, 'vertical')),
    ).toBeNull();
  });

  it('rejects the right edge', () => {
    expect(
      placeShip(createBoard(), ship('Destroyer', { row: 0, col: 9 }, 'horizontal')),
    ).toBeNull();
  });

  it('rejects the bottom edge', () => {
    expect(
      placeShip(createBoard(), ship('Destroyer', { row: 9, col: 9 }, 'vertical')),
    ).toBeNull();
  });

  it('rejects negative coordinates', () => {
    expect(
      placeShip(createBoard(), ship('Destroyer', { row: -1, col: 0 }, 'horizontal')),
    ).toBeNull();
  });

  it('allows non-overlapping ships on separate cells', () => {
    const board = placeShip(
      createBoard(),
      ship('Destroyer', { row: 0, col: 0 }, 'horizontal'),
    )!;
    expect(
      placeShip(board, ship('Destroyer', { row: 2, col: 0 }, 'horizontal')),
    ).not.toBeNull();
  });

  it('does not mutate the original board', () => {
    const board = createBoard();
    placeShip(board, ship('Destroyer', { row: 0, col: 0 }, 'horizontal'));
    expect(board.ships).toHaveLength(0);
  });
});
