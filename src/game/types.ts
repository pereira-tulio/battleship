export const BOARD_SIZE = 10;
export type Orientation = 'horizontal' | 'vertical';
export type Coordinate = { row: number; col: number };
export type ShipName = 'Carrier' | 'Battleship' | 'Cruiser' | 'Submarine' | 'Destroyer';
export type CellMark = 'unknown' | 'ship' | 'hit' | 'miss';
export type ShotResult = 'hit' | 'miss' | 'sunk';
export type RNG = () => number;

export type Ship = {
  name: ShipName;
  size: number;
  start: Coordinate;
  orientation: Orientation;
  hits: Coordinate[];
};
export type Board = { ships: Ship[]; shots: Record<string, ShotResult> };
export type FleetSpec = { name: ShipName; size: number };

export const keyOf = ({ row, col }: Coordinate) => `${row},${col}`;
export const coordinateOf = (key: string): Coordinate => {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
};
export const isInside = ({ row, col }: Coordinate) =>
  row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
export const neighbors = ({ row, col }: Coordinate): Coordinate[] =>
  [{ row: row - 1, col }, { row: row + 1, col }, { row, col: col - 1 }, { row, col: col + 1 }]
    .filter(isInside);
