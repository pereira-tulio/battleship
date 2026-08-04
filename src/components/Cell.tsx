import type { KeyboardEvent } from 'react';
import type { CellMark, Coordinate, Orientation, ShipName } from '../game/types';
import { CellMark as CellMarkIcon } from './CellMark';
import { ShipIcon } from './ShipIcon';

type CellProps = {
  coordinate: Coordinate;
  status: CellMark;
  label: string;
  interactive: boolean;
  preview: boolean;
  previewValid: boolean;
  latest: boolean;
  aiming: boolean;
  hideMark?: boolean;
  vessel?: {
    name: ShipName;
    size: number;
    orientation: Orientation;
  };
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
  hideMark = false,
  vessel,
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
      className={`cell cell-${status} ${vessel ? 'cell-vessel-anchor' : ''} ${
        latest ? 'cell-latest' : ''
      } ${
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
        status !== 'unknown' &&
        status !== 'ship' &&
        !hideMark && <CellMarkIcon status={status} />
      )}
      {vessel && (
        <span
          className={`cell-vessel cell-vessel-${vessel.orientation}`}
          style={{
            width: `calc(${vessel.size * 100}% + ${
              (vessel.size - 1) * 3 + vessel.size * 4
            }px)`,
          }}
          aria-hidden="true"
        >
          <ShipIcon name={vessel.name} profile />
        </span>
      )}
    </button>
  );
}
