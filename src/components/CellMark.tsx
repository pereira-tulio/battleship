import type { CellMark as CellState } from '../game/types';

type CellMarkProps = {
  status: Extract<CellState, 'miss' | 'hit' | 'sunk'> | 'aim';
};

export function CellMark({ status }: CellMarkProps) {
  if (status === 'aim') {
    return (
      <svg
        className="cell-mark"
        viewBox="0 0 20 20"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="10" cy="10" r="6" />
        <path d="M10 1v4M10 15v4M1 10h4M15 10h4" />
      </svg>
    );
  }

  if (status === 'miss') {
    return (
      <svg
        className="cell-mark"
        viewBox="0 0 20 20"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="10" cy="10" r="5.5" />
        <path d="m5 15 10-10" />
      </svg>
    );
  }

  if (status === 'hit') {
    return (
      <svg
        className="cell-mark"
        viewBox="0 0 20 20"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M3 10h14M10 3v14M5 5l10 10M15 5 5 15" />
      </svg>
    );
  }

  return (
    <svg className="cell-mark" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect x="3.5" y="3.5" width="13" height="13" />
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  );
}
