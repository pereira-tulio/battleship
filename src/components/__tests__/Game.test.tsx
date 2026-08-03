import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Game } from '../Game';

describe('game flow', () => {
  it('supports random deployment and starting a mission', async () => {
    const user = userEvent.setup();
    render(<Game />);
    await user.click(screen.getByRole('button', { name: /random placement/i }));
    expect(screen.getByText(/5 \/ 5 deployed/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /start mission/i }));
    expect(screen.getByText(/your turn/i)).toBeInTheDocument();
    const enemy = screen.getByRole('grid', { name: /enemy waters/i });
    const cell = enemy.querySelector('button') as HTMLButtonElement;
    await user.click(cell);
    expect(screen.getByText(/enemy is taking aim|your turn/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /new game/i }));
    expect(screen.getByText(/0 \/ 5 deployed/)).toBeInTheDocument();
  });
});
