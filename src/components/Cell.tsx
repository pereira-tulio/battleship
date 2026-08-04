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
  latest: boolean;
  aiming: boolean;
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
  latest,
  aiming,
  onCell,
  onHover,
  onKeyDown,
}: CellProps) {
  const hoverable = interactive && (status === 'unknown' || status === 'ship');

  return (
    <button
      type="button"
      role="gridcell"
      data-cell={`${coordinate.row},${coordinate.col}`}
      className={`cell cell-${status} ${latest ? 'cell-latest' : ''} ${
        preview ? `cell-preview-${previewValid ? 'valid' : 'invalid'}` : ''
      } ${hoverable ? 'cell-interactive' : ''} ${aiming ? 'cell-aiming' : ''}`}
      aria-label={label}
      aria-disabled={!interactive}
      onMouseEnter={() => hoverable && onHover?.(coordinate)}
      onFocus={() => hoverable && onHover?.(coordinate)}
      onKeyDown={(event) => onKeyDown(event, coordinate)}
      onClick={() => {
        if (interactive) onCell?.(coordinate);
      }}
    >
      {aiming ? (
        <CellMarkIcon status="aim" />
      ) : (
        status !== 'unknown' && status !== 'ship' && <CellMarkIcon status={status} />
      )}
    </button>
  );
}
