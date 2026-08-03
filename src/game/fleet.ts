import type { FleetSpec, ShipName } from './types';

export const FLEET: FleetSpec[] = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 },
  { name: 'Submarine', size: 3 },
  { name: 'Destroyer', size: 2 },
];
export const shipSize = (name: ShipName) => FLEET.find((ship) => ship.name === name)?.size ?? 0;
