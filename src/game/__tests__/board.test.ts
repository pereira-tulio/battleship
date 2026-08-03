import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, keyOf } from '../types';
import { createBoard, randomPlacement } from '../board';

describe('board generation', () => {
  it('creates an empty board', () => {
    expect(createBoard()).toEqual({ ships: [], shots: {} });
  });

  it('creates legal five-ship fleets across deterministic seeds', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      let randomSeed = seed;
      const board = randomPlacement(() => {
        randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0;
        return randomSeed / 4294967296;
      });
      const occupied = new Set<string>();
      expect(board.ships).toHaveLength(5);
      expect(board.ships.reduce((sum, ship) => sum + ship.size, 0)).toBe(17);
      for (const ship of board.ships) {
        for (let index = 0; index < ship.size; index += 1) {
          const cell = {
            row: ship.start.row + (ship.orientation === 'vertical' ? index : 0),
            col: ship.start.col + (ship.orientation === 'horizontal' ? index : 0),
          };
          expect(cell.row).toBeGreaterThanOrEqual(0);
          expect(cell.row).toBeLessThan(BOARD_SIZE);
          expect(cell.col).toBeGreaterThanOrEqual(0);
          expect(cell.col).toBeLessThan(BOARD_SIZE);
          expect(occupied.has(keyOf(cell))).toBe(false);
          occupied.add(keyOf(cell));
        }
      }
    }
  });
});
