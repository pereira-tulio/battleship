import type { Board as BoardType, Coordinate } from '../game/types';
import { BOARD_SIZE, keyOf } from '../game/types';
import { shipCells } from '../game/combat';

type Props = { board: BoardType; enemy?: boolean; disabled?: boolean; preview?: { start: Coordinate; size: number; orientation: 'horizontal' | 'vertical' } | null; previewValid?: boolean; onCell?: (cell: Coordinate) => void; onHover?: (cell: Coordinate) => void };
const letter = (col: number) => String.fromCharCode(65 + col);
export function Board({ board, enemy = false, disabled = false, preview, previewValid = true, onCell, onHover }: Props) {
  const cells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => ({ row: Math.floor(i / BOARD_SIZE), col: i % BOARD_SIZE }));
  return <div className="board" role="grid" aria-label={enemy ? 'Enemy waters' : 'Your fleet'}>
    {cells.map((cell) => {
      const key = keyOf(cell);
      const ship = board.ships.find((item) => shipCells(item).some((part) => keyOf(part) === key));
      const shot = board.shots[key];
      const previewCell = preview && Array.from({ length: preview.size }, (_, i) => ({
        row: preview.start.row + (preview.orientation === 'vertical' ? i : 0), col: preview.start.col + (preview.orientation === 'horizontal' ? i : 0),
      })).some((part) => keyOf(part) === key);
      const status: string = shot ?? (ship && !enemy ? 'ship' : 'unknown');
      return <button key={key} type="button" role="gridcell" className={`cell cell-${status} ${previewCell ? `cell-preview ${previewValid ? 'cell-preview-valid' : 'cell-preview-invalid'}` : ''}`} disabled={disabled || Boolean(shot)} onMouseEnter={() => onHover?.(cell)} onFocus={() => onHover?.(cell)} onKeyDown={(event) => {
        const directions: Record<string, number> = { ArrowUp: -BOARD_SIZE, ArrowDown: BOARD_SIZE, ArrowLeft: -1, ArrowRight: 1 };
        const offset = directions[event.key];
        const canMove = (event.key === 'ArrowUp' && cell.row > 0) || (event.key === 'ArrowDown' && cell.row < BOARD_SIZE - 1) || (event.key === 'ArrowLeft' && cell.col > 0) || (event.key === 'ArrowRight' && cell.col < BOARD_SIZE - 1);
        if (offset && canMove) {
          event.preventDefault();
          const next = cells.indexOf(cell) + offset;
          (event.currentTarget.parentElement?.children[next] as HTMLButtonElement | undefined)?.focus();
        }
      }} onClick={() => onCell?.(cell)} aria-label={`${letter(cell.col)}${cell.row + 1}, ${status === 'unknown' ? 'unexplored' : status}`}><span aria-hidden="true">{status === 'hit' || status === 'sunk' ? '✦' : status === 'miss' ? '•' : ''}</span></button>;
    })}
  </div>;
}
