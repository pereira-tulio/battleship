import { FLEET } from './fleet';
import type { Board, Coordinate, RNG } from './types';
import { BOARD_SIZE, isInside, keyOf, neighbors } from './types';
import { allShipsSunk, fireAt } from './combat';

export type AIState = { fired: Set<string>; targets: Coordinate[]; hits: Coordinate[] };
export const createAIState = (): AIState => ({
  fired: new Set(),
  targets: [],
  hits: [],
});

const unique = (cells: Coordinate[], fired: Set<string>) =>
  cells.filter((cell) => !fired.has(keyOf(cell)));
const huntCandidates = (board: Board, state: AIState) => {
  const remaining = FLEET.filter(
    (spec) =>
      !board.ships.find(
        (ship) => ship.name === spec.name && ship.hits.length >= ship.size,
      ),
  );
  const minimumRemainingLength = remaining.length
    ? Math.min(...remaining.map((ship) => ship.size))
    : 1;
  const parity = minimumRemainingLength % 2;
  const cells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => ({
    row: Math.floor(i / BOARD_SIZE),
    col: i % BOARD_SIZE,
  })).filter(
    (cell) => !state.fired.has(keyOf(cell)) && (cell.row + cell.col) % 2 === parity,
  );
  return cells.length
    ? cells
    : Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => ({
        row: Math.floor(i / BOARD_SIZE),
        col: i % BOARD_SIZE,
      })).filter((cell) => !state.fired.has(keyOf(cell)));
};

export const chooseTarget = (board: Board, state: AIState, rng: RNG): Coordinate => {
  const queued = unique(state.targets, state.fired);
  if (queued.length) return queued[Math.floor(rng() * queued.length)];
  const candidates = huntCandidates(board, state);
  return candidates[Math.floor(rng() * candidates.length)];
};

export const aiFire = (
  board: Board,
  state: AIState,
  rng: RNG,
): {
  board: Board;
  state: AIState;
  coordinate: Coordinate;
  result: 'hit' | 'miss' | 'sunk';
  shipName?: Board['ships'][number]['name'];
} => {
  const coordinate = chooseTarget(board, state, rng);
  const result = fireAt(board, coordinate);
  if (!result) throw new Error('AI attempted a repeated shot');
  const next: AIState = {
    fired: new Set(state.fired).add(keyOf(coordinate)),
    targets: state.targets,
    hits: state.hits,
  };
  if (result.result === 'hit') {
    next.hits = [...state.hits, coordinate];
    next.targets = [
      ...unique([...state.targets, ...neighbors(coordinate)], next.fired),
    ];
    if (next.hits.length >= 2) {
      const recent = next.hits.slice(-2);
      if (recent[0].row === recent[1].row) {
        next.targets = [
          ...unique(
            [
              { row: recent[1].row, col: recent[1].col - 1 },
              { row: recent[1].row, col: recent[1].col + 1 },
              ...next.targets,
            ].filter(isInside),
            next.fired,
          ),
        ];
      } else if (recent[0].col === recent[1].col) {
        next.targets = [
          ...unique(
            [
              { row: recent[1].row - 1, col: recent[1].col },
              { row: recent[1].row + 1, col: recent[1].col },
              ...next.targets,
            ].filter(isInside),
            next.fired,
          ),
        ];
      }
    }
  } else if (result.result === 'sunk') {
    const sunkShip = board.ships.find((ship) =>
      shipCells(ship).some((cell) => keyOf(cell) === keyOf(coordinate)),
    );
    if (sunkShip) {
      const sunkKeys = new Set(shipCells(sunkShip).map(keyOf));
      next.targets = next.targets.filter((cell) => !sunkKeys.has(keyOf(cell)));
      next.hits = next.hits.filter((cell) => !sunkKeys.has(keyOf(cell)));
    }
  }
  return {
    board: result.board,
    state: next,
    coordinate,
    result: result.result,
    shipName: result.shipName,
  };
};

function shipCells(ship: Board['ships'][number]) {
  return Array.from({ length: ship.size }, (_, i) => ({
    row: ship.start.row + (ship.orientation === 'vertical' ? i : 0),
    col: ship.start.col + (ship.orientation === 'horizontal' ? i : 0),
  }));
}
export { allShipsSunk };
