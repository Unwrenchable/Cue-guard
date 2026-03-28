/**
 * Tests for BagCard component.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BagCard from '../src/components/BagCard';
import { StoredBag } from '../src/types';

const baseBag: StoredBag = {
  id: 'bag_001',
  tagId: 'aabbccdd',
  ownerPhone: '+15555550100',
  description: 'Blue duffel',
  storedAt: '2026-03-28T00:00:00.000Z',
  claimCode: '123456',
  status: 'stored',
  amountCents: 500,
};

describe('BagCard', () => {
  it('renders description and status badge', () => {
    const { getByText } = render(<BagCard bag={baseBag} />);
    expect(getByText('Blue duffel')).toBeTruthy();
    expect(getByText('In Storage')).toBeTruthy();
  });

  it('renders fee and claim code', () => {
    const { getByText } = render(<BagCard bag={baseBag} />);
    expect(getByText(/Fee: \$5\.00/)).toBeTruthy();
    expect(getByText(/Claim code: 123456/)).toBeTruthy();
  });

  it('does not show Pay button when status is stored', () => {
    const { queryByText } = render(<BagCard bag={baseBag} />);
    expect(queryByText(/Pay/)).toBeNull();
  });

  it('shows Pay button when status is pending_payment', () => {
    const pendingBag: StoredBag = { ...baseBag, status: 'pending_payment' };
    const onPayPress = jest.fn();
    const { getByText } = render(
      <BagCard bag={pendingBag} onPayPress={onPayPress} />,
    );
    const payButton = getByText(/Pay \$5\.00/);
    expect(payButton).toBeTruthy();
    fireEvent.press(payButton);
    expect(onPayPress).toHaveBeenCalledWith(pendingBag);
  });

  it('renders claimed status badge', () => {
    const claimedBag: StoredBag = { ...baseBag, status: 'claimed' };
    const { getByText } = render(<BagCard bag={claimedBag} />);
    expect(getByText('Claimed')).toBeTruthy();
  });
});
