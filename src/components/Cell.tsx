import type { KeyboardEvent } from 'react';
import type { CellMark, Coordinate } from '../game/types';
import { CellMark as CellMarkIcon } from './CellMark';

type CellProps = {
  coordinate: Coordinate;
  status: CellMark;
  label: string;
  interactive: boolean;
  preview: boolean;
  previewValid: boolean;
  onCell?: (cell: Coordinate) => void;
  onHover?: (cell: Coordinate) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, cell: Coordinate) => void;
};

export function Cell({
  coordinate,
  status,
  label,
  interactive,
  preview,
  previewValid,
  onCell,
  onHover,
  onKeyDown,
}: CellProps) {
  return (
    <button
      type="button"
      role="gridcell"
      data-cell={`${coordinate.row},${coordinate.col}`}
      className={`cell cell-${status} ${
        preview ? `cell-preview-${previewValid ? 'valid' : 'invalid'}` : ''
      }`}
      aria-label={label}
      aria-disabled={!interactive}
      onMouseEnter={() => onHover?.(coordinate)}
      onFocus={() => onHover?.(coordinate)}
      onKeyDown={(event) => onKeyDown(event, coordinate)}
      onClick={() => {
        if (interactive) onCell?.(coordinate);
      }}
    >
      {status !== 'unknown' && status !== 'ship' && <CellMarkIcon status={status} />}
    </button>
  );
}
