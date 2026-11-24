import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { InquiryStatus } from '../../types';
import StatusActions from './StatusActions';

describe('StatusActions — only allowed status transitions are offered', () => {
  // Mirrors the backend rule: New -> In Progress -> Resolved, Resolved -> In Progress (reopen).
  it.each<[InquiryStatus, string[]]>([
    ['New', ['Start progress']],
    ['In Progress', ['Mark as resolved']],
    ['Resolved', ['Reopen']],
  ])('status "%s" shows exactly %j', (status, expectedButtons) => {
    render(<StatusActions status={status} pendingStatus={null} onChange={vi.fn()} />);

    const labels = screen.getAllByRole('button').map((button) => button.textContent);
    expect(labels).toEqual(expectedButtons);
  });

  it('never offers the forbidden New -> Resolved shortcut', () => {
    render(<StatusActions status="New" pendingStatus={null} onChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /resolved/i })).not.toBeInTheDocument();
  });

  it('asks for the correct next status when a button is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<StatusActions status="Resolved" pendingStatus={null} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Reopen' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('In Progress');
  });

  it('disables the buttons while a status change is being saved', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<StatusActions status="In Progress" pendingStatus="Resolved" onChange={onChange} />);

    const button = screen.getByRole('button', { name: 'Mark as resolved' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onChange).not.toHaveBeenCalled();
  });
});
