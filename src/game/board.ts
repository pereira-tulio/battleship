import { FLEET } from './fleet';
import type { Board, Coordinate, Orientation, RNG, Ship } from './types';
import { BOARD_SIZE, isInside, keyOf } from './types';

export const createBoard = (): Board => ({ ships: [], shots: {} });

export const cellsForShip = (start: Coordinate, size: number, orientation: Orientation): Coordinate[] =>
  Array.from({ length: size }, (_, index) => ({
    row: start.row + (orientation === 'vertical' ? index : 0),
    col: start.col + (orientation === 'horizontal' ? index : 0),
  }));

export const canPlaceShip = (
  board: Board,
  start: Coordinate,
  size: number,
  orientation: Orientation,
) => {
  const cells = cellsForShip(start, size, orientation);
  return cells.every(isInside) &&
    cells.every((cell) => !board.ships.some((ship) => cellsForShip(ship.start, ship.size, ship.orientation)
      .some((occupied) => keyOf(occupied) === keyOf(cell))));
};

export const placeShip = (board: Board, ship: Omit<Ship, 'hits'>): Board | null => {
  if (!canPlaceShip(board, ship.start, ship.size, ship.orientation)) return null;
  return { ...board, ships: [...board.ships, { ...ship, hits: [] }] };
};

export const randomPlacement = (rng: RNG): Board => {
  let board = createBoard();
  for (const spec of FLEET) {
    let placed = false;
    for (let attempt = 0; attempt < 5000 && !placed; attempt += 1) {
      const start = { row: Math.floor(rng() * BOARD_SIZE), col: Math.floor(rng() * BOARD_SIZE) };
      const orientation = rng() < 0.5 ? 'horizontal' : 'vertical';
      const result = placeShip(board, { ...spec, start, orientation });
      if (result) { board = result; placed = true; }
    }
    if (!placed) throw new Error(`Unable to place ${spec.name}`);
  }
  return board;
};
