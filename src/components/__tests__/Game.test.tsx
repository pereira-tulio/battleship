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

  it('provides a keyboard-accessible persistent sound toggle', () => {
    window.localStorage.clear();
    render(<Game />);
    const toggle = screen.getByRole('button', { name: 'Mute shot sounds' });
    fireEvent.click(toggle);
    expect(
      screen.getByRole('button', { name: 'Enable shot sounds' }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem('battleship-muted')).toBe('true');
    window.localStorage.clear();
  });

  it('supports random deployment and starting a mission', () => {
    render(<Game />);
    fireEvent.click(screen.getByRole('button', { name: /random placement/i }));
    expect(screen.getByText(/fleet deployed/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /start mission/i }));
    expect(screen.getByText(/your turn/i)).toBeInTheDocument();
  });

  it('shows role-specific helper copy during placement', () => {
    render(<Game />);
    expect(
      screen.getByText('Select a coordinate to place your ship.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Waters are locked.')).toBeInTheDocument();
  });

  it('updates both helper messages during the player turn', () => {
    render(<Game />);
    fireEvent.click(screen.getByRole('button', { name: /random placement/i }));
    fireEvent.click(screen.getByRole('button', { name: /start mission/i }));
    expect(screen.getByText('Fleet deployed.')).toBeInTheDocument();
    expect(screen.getByText('Select a coordinate to fire.')).toBeInTheDocument();
  });

  it('clears placement hover preview when leaving the board', () => {
    render(<Game />);
    const player = screen.getByRole('grid', { name: /your fleet/i });
    const cell = player.querySelector<HTMLButtonElement>('[data-cell="0,0"]')!;
    fireEvent.mouseEnter(cell);
    expect(player.querySelectorAll('.cell-preview-valid')).not.toHaveLength(0);
    fireEvent.mouseLeave(player);
    expect(player.querySelectorAll('[class*="cell-preview-"]')).toHaveLength(0);
  });

  it('clears placement hover preview after random placement', () => {
    render(<Game />);
    const player = screen.getByRole('grid', { name: /your fleet/i });
    fireEvent.mouseEnter(player.querySelector<HTMLButtonElement>('[data-cell="0,0"]')!);
    expect(player.querySelectorAll('[class*="cell-preview-"]')).not.toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: /random placement/i }));
    expect(player.querySelectorAll('[class*="cell-preview-"]')).toHaveLength(0);
  });

  it('marks every in-bounds cell of an out-of-bounds preview invalid', () => {
    render(<Game />);
    const player = screen.getByRole('grid', { name: /your fleet/i });
    fireEvent.mouseEnter(player.querySelector<HTMLButtonElement>('[data-cell="0,8"]')!);
    const invalid = player.querySelectorAll('.cell-preview-invalid');
    expect(invalid).toHaveLength(2);
    expect(
      player
        .querySelector('[data-cell="0,8"]')
        ?.classList.contains('cell-preview-invalid'),
    ).toBe(true);
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
    expect(screen.getByText(/enemy fired at/i)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByText(/your turn/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('marks the incoming AI target during the aiming beat', () => {
    vi.useFakeTimers();
    render(<Game />);
    fireEvent.click(screen.getByRole('button', { name: /random placement/i }));
    fireEvent.click(screen.getByRole('button', { name: /start mission/i }));
    fireEvent.click(
      screen
        .getByRole('grid', { name: /enemy waters/i })
        .querySelector('[data-cell="0,0"]')!,
    );
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByText('Incoming')).toBeInTheDocument();
    expect(
      screen
        .getByRole('grid', { name: /your fleet/i })
        .querySelectorAll('.cell-aiming'),
    ).toHaveLength(1);
    vi.useRealTimers();
  });

  it('clears the aiming phase during New Game', () => {
    vi.useFakeTimers();
    render(<Game />);
    fireEvent.click(screen.getByRole('button', { name: /random placement/i }));
    fireEvent.click(screen.getByRole('button', { name: /start mission/i }));
    fireEvent.click(
      screen
        .getByRole('grid', { name: /enemy waters/i })
        .querySelector('[data-cell="0,0"]')!,
    );
    expect(screen.getByText(/enemy is taking aim/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /new game/i }));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText(/deploy your fleet/i)).toBeInTheDocument();
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

  it('prevents a stale completion after New Game during the impact delay', () => {
    vi.useFakeTimers();
    render(<Game />);
    fireEvent.click(screen.getByRole('button', { name: /random placement/i }));
    fireEvent.click(screen.getByRole('button', { name: /start mission/i }));
    fireEvent.click(
      screen
        .getByRole('grid', { name: /enemy waters/i })
        .querySelector('[data-cell="0,0"]')!,
    );
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText(/enemy fired at/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /new game/i }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText(/deploy your fleet/i)).toBeInTheDocument();
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
