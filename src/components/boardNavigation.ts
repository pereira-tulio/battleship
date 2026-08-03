import type { KeyboardEvent } from 'react';
import type { Coordinate } from '../game/types';
import { BOARD_SIZE } from '../game/types';

export function getAdjacentIndex(cell: Coordinate, key: string): number | null {
  const canMove =
    (key === 'ArrowUp' && cell.row > 0) ||
    (key === 'ArrowDown' && cell.row < BOARD_SIZE - 1) ||
    (key === 'ArrowLeft' && cell.col > 0) ||
    (key === 'ArrowRight' && cell.col < BOARD_SIZE - 1);
  if (!canMove) return null;

  const offset = {
    ArrowUp: -BOARD_SIZE,
    ArrowDown: BOARD_SIZE,
    ArrowLeft: -1,
    ArrowRight: 1,
  }[key];
  return cell.row * BOARD_SIZE + cell.col + (offset ?? 0);
}

export function handleGridKeyDown(
  event: KeyboardEvent<HTMLButtonElement>,
  cell: Coordinate,
) {
  const nextIndex = getAdjacentIndex(cell, event.key);
  if (nextIndex === null) return;
  event.preventDefault();
  const row = Math.floor(nextIndex / BOARD_SIZE);
  const col = nextIndex % BOARD_SIZE;
  event.currentTarget
    .closest('[role="grid"]')
    ?.querySelector<HTMLButtonElement>(`[data-cell="${row},${col}"]`)
    ?.focus();
}
