import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { shipCells } from '../../game/combat';
import { battleshipReducer, createInitialState } from '../../hooks/useBattleship';
import { Game } from '../Game';
import { StatusBanner } from '../StatusBanner';

describe('game flow', () => {
  it('renders both labelled boards and coordinate headers', () => {
    render(<Game />);
    expect(screen.getByRole('grid', { name: /your fleet/i })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /enemy waters/i })).toBeInTheDocument();
    expect(screen.getAllByText('A')[0]).toBeInTheDocument();
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
  });

  it('supports random deployment and starting a mission', () => {
    render(<Game />);
    fireEvent.click(screen.getByRole('button', { name: /random placement/i }));
    expect(screen.getByText(/fleet deployed/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /start mission/i }));
    expect(screen.getByText(/your turn/i)).toBeInTheDocument();
  });

  it('fires at an enemy cell and returns to the player turn', () => {
    vi.useFakeTimers();
    render(<Game />);
    fireEvent.click(screen.getByRole('button', { name: /random placement/i }));
    fireEvent.click(screen.getByRole('button', { name: /start mission/i }));
    const enemy = screen.getByRole('grid', { name: /enemy waters/i });
    const cell = enemy.querySelector<HTMLButtonElement>('[data-cell="0,0"]')!;
    fireEvent.click(cell);
    expect(screen.getByText(/enemy is taking aim/i)).toBeInTheDocument();
    expect(cell).toHaveAttribute('aria-label', expect.stringMatching(/hit|miss|sunk/));
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText(/your turn/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('resets placement and prevents a stale AI shot after New Game', () => {
    vi.useFakeTimers();
    render(<Game />);
    fireEvent.click(screen.getByRole('button', { name: /random placement/i }));
    fireEvent.click(screen.getByRole('button', { name: /start mission/i }));
    fireEvent.click(
      screen
        .getByRole('grid', { name: /enemy waters/i })
        .querySelector('[data-cell="0,0"]')!,
    );
    fireEvent.click(screen.getByRole('button', { name: /new game/i }));
    expect(screen.getByText(/deploy your fleet/i)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('0 hits taken')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('supports rotation and selecting an unplaced ship', async () => {
    const user = userEvent.setup();
    render(<Game />);
    expect(screen.getByText('Carrier', { selector: 'strong' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /rotate/i }));
    expect(screen.getByText(/vertical/i)).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /destroyer/i })[0]);
    expect(screen.getByText('Destroyer', { selector: 'strong' })).toBeInTheDocument();
  });

  it('renders the winner banner after a fixed-seed game reaches completion', () => {
    let state = createInitialState(42);
    const enemyCells = state.enemy.ships.flatMap(shipCells);
    state = { ...state, phase: 'playerTurn' };
    for (const coordinate of enemyCells) {
      state = battleshipReducer(state, { type: 'fire', coordinate });
      if (state.phase === 'gameOver') break;
      state = { ...state, phase: 'playerTurn' };
    }
    expect(state.phase).toBe('gameOver');
    expect(state.winner).toBe('player');
    render(<StatusBanner phase={state.phase} message={state.message} />);
    expect(screen.getByText(/entire enemy fleet/i)).toBeInTheDocument();
  });
});
