import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateLinkForm } from '../../src/components/CreateLinkForm';

describe('CreateLinkForm', () => {
  it('validates inputs and calls onCreate', async () => {
    const onCreate = jest.fn(() => Promise.resolve());
    render(<CreateLinkForm existing={[]} onCreate={onCreate} />);

    // Submit empty form -> validation errors shown
    await userEvent.click(screen.getByRole('button', { name: /create shortcut/i }));
    expect(screen.getByText(/Enter a shortname\./i)).toBeInTheDocument();
    expect(screen.getByText(/Enter a destination URL\./i)).toBeInTheDocument();

    // Fill valid values
    const shortInput = screen.getByLabelText(/shortname/i);
    const urlInput = screen.getByLabelText(/destination url/i);
    await userEvent.type(shortInput, 'new-short');
    await userEvent.type(urlInput, 'https://example.test');

    await userEvent.click(screen.getByRole('button', { name: /create shortcut/i }));

    expect(onCreate).toHaveBeenCalledWith({ shortname: 'new-short', url: 'https://example.test' });
  });
});
