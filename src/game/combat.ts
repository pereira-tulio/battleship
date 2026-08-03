import type { Board, Coordinate, Ship, ShotResult } from './types';
import { cellsForShip } from './board';
import { keyOf } from './types';

export const shipCells = (ship: Ship) =>
  cellsForShip(ship.start, ship.size, ship.orientation);
export const isSunk = (ship: Ship) => ship.hits.length >= ship.size;
export const allShipsSunk = (board: Board) =>
  board.ships.length > 0 && board.ships.every(isSunk);

export const fireAt = (
  board: Board,
  coordinate: Coordinate,
): { board: Board; result: ShotResult } | null => {
  const key = keyOf(coordinate);
  if (board.shots[key]) return null;
  const shipIndex = board.ships.findIndex((ship) =>
    shipCells(ship).some((cell) => keyOf(cell) === key),
  );
  if (shipIndex < 0)
    return {
      board: { ...board, shots: { ...board.shots, [key]: 'miss' } },
      result: 'miss',
    };
  const ship = board.ships[shipIndex];
  const hits = [...ship.hits, coordinate];
  const sunk = hits.length >= ship.size;
  const ships = board.ships.map((item, index) =>
    index === shipIndex ? { ...item, hits } : item,
  );
  const shots = { ...board.shots };
  if (sunk) {
    for (const cell of shipCells(ship)) shots[keyOf(cell)] = 'sunk';
  } else {
    shots[key] = 'hit';
  }
  return {
    board: { ...board, ships, shots },
    result: sunk ? 'sunk' : 'hit',
  };
};
