import React from 'react';
import { render, screen } from '@testing-library/react';
import { LinkList } from '../../src/components/LinkList';

const links = [
  {
    id: '1',
    shortname: 'payroll',
    url: 'https://example.com',
    createdAt: new Date().toISOString(),
    visits: 0,
  },
];

describe('LinkList', () => {
  test('shows visit count text for links', () => {
    render(<LinkList links={links as any} loading={false} error={null} onRetry={() => {}} />);
    expect(screen.getByText('0 visits')).toBeInTheDocument();
  });
});
