import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Game } from '../Game';

describe('game flow', () => {
  it('supports deployment, firing, alternating turns, and reset', async () => {
    vi.useFakeTimers();
    render(<Game />);

    expect(screen.getByRole('grid', { name: /your fleet/i })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /enemy waters/i })).toBeInTheDocument();
    expect(screen.getAllByText('A')[0]).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /random placement/i }));
    expect(screen.getByText(/fleet deployed/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Carrier/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /start mission/i }));
    expect(screen.getByText(/your turn/i)).toBeInTheDocument();

    const enemy = screen.getByRole('grid', { name: /enemy waters/i });
    const cell = enemy.querySelector<HTMLButtonElement>('[data-cell="0,0"]')!;
    fireEvent.click(cell);
    expect(screen.getByText(/enemy is taking aim/i)).toBeInTheDocument();
    expect(cell).toHaveAttribute('aria-label', expect.stringMatching(/hit|miss|sunk/));

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByText(/your turn/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /new game/i }));
    expect(screen.getByText(/deploy your fleet/i)).toBeInTheDocument();
    expect(screen.getByText('0 hits taken')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('0 hits taken')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('allows rotating and selecting an unplaced ship', async () => {
    const user = userEvent.setup();
    render(<Game />);
    expect(screen.getByText('Carrier', { selector: 'strong' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /rotate/i }));
    expect(screen.getByText(/vertical/i)).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /destroyer/i })[0]);
    expect(screen.getByText('Destroyer', { selector: 'strong' })).toBeInTheDocument();
  });
});
