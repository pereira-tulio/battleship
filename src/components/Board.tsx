import { shipCells } from '../game/combat';
import type { Board as BoardType, Coordinate } from '../game/types';
import { BOARD_SIZE, keyOf } from '../game/types';
import { Cell } from './Cell';
import { handleGridKeyDown } from './boardNavigation';

type Preview = {
  start: Coordinate;
  size: number;
  orientation: 'horizontal' | 'vertical';
};

type BoardProps = {
  board: BoardType;
  enemy?: boolean;
  interactive?: boolean;
  preview?: Preview | null;
  previewValid?: boolean;
  latestShot?: Coordinate | null;
  aimingShot?: Coordinate | null;
  onCell?: (cell: Coordinate) => void;
  onHover?: (cell: Coordinate) => void;
  onMouseLeave?: () => void;
  onBlur?: () => void;
};

function cellCoordinates(): Coordinate[] {
  return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => ({
    row: Math.floor(index / BOARD_SIZE),
    col: index % BOARD_SIZE,
  }));
}

function isPreviewCell(cell: Coordinate, preview: Preview | null | undefined) {
  if (!preview) return false;
  return Array.from({ length: preview.size }, (_, index) => ({
    row: preview.start.row + (preview.orientation === 'vertical' ? index : 0),
    col: preview.start.col + (preview.orientation === 'horizontal' ? index : 0),
  })).some((part) => keyOf(part) === keyOf(cell));
}

export function Board({
  board,
  enemy = false,
  interactive = false,
  preview,
  previewValid = true,
  latestShot = null,
  aimingShot = null,
  onCell,
  onHover,
  onMouseLeave,
  onBlur,
}: BoardProps) {
  const cells = cellCoordinates();

  return (
    <div className="board-frame">
      <div className="column-labels" aria-hidden="true">
        <span />
        {Array.from({ length: BOARD_SIZE }, (_, index) => (
          <span key={index}>{String.fromCharCode(65 + index)}</span>
        ))}
      </div>
      <div
        className="board"
        role="grid"
        aria-label={enemy ? 'Enemy waters' : 'Your fleet'}
        onMouseLeave={onMouseLeave}
        onBlur={onBlur}
      >
        {Array.from({ length: BOARD_SIZE }, (_, row) => (
          <div className="board-row" role="row" key={row}>
            <span className="row-label" aria-hidden="true">
              {row + 1}
            </span>
            {cells
              .filter((cell) => cell.row === row)
              .map((cell) => {
                const key = keyOf(cell);
                const ship = board.ships.find((item) =>
                  shipCells(item).some((part) => keyOf(part) === key),
                );
                const status = board.shots[key]
                  ? board.shots[key]
                  : ship && !enemy
                    ? 'ship'
                    : 'unknown';
                const label = `${String.fromCharCode(65 + cell.col)}${cell.row + 1}, ${
                  status === 'unknown' ? 'unexplored' : status
                }${ship && (!enemy || status === 'sunk') ? ` ${ship.name}` : ''}`;

                return (
                  <Cell
                    key={key}
                    coordinate={cell}
                    status={status}
                    label={label}
                    interactive={interactive}
                    preview={isPreviewCell(cell, preview)}
                    previewValid={previewValid}
                    latest={latestShot ? keyOf(latestShot) === key : false}
                    aiming={aimingShot ? keyOf(aimingShot) === key : false}
                    onHover={onHover}
                    onCell={onCell}
                    onKeyDown={handleGridKeyDown}
                  />
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
