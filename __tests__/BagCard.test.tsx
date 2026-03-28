/**
 * Tests for CueCard component.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CueCard from '../src/components/BagCard';
import { StoredCue } from '../src/types';

const baseCue: StoredCue = {
  id: 'cue_001',
  tagId: 'aabbccdd',
  ownerPhone: '+15555550100',
  ownerName: 'Mike Sigel',
  tournamentName: 'Spring Classic 2026',
  tableNumber: '7',
  description: 'Black Predator hard case – 2 cues',
  checkedInAt: '2026-03-28T00:00:00.000Z',
  lastActivityAt: '2026-03-28T00:00:00.000Z',
  claimCode: '123456',
  status: 'checked_in',
  amountCents: 500,
  checkOutCount: 0,
};

describe('CueCard', () => {
  it('renders owner name, tournament, and status badge', () => {
    const { getByText } = render(<CueCard cue={baseCue} />);
    expect(getByText('Mike Sigel')).toBeTruthy();
    expect(getByText('Spring Classic 2026')).toBeTruthy();
    expect(getByText('In Storage ✓')).toBeTruthy();
  });

  it('renders description and claim code', () => {
    const { getByText } = render(<CueCard cue={baseCue} />);
    expect(getByText('Black Predator hard case – 2 cues')).toBeTruthy();
    expect(getByText(/Claim code: 123456/)).toBeTruthy();
  });

  it('renders table number when provided', () => {
    const { getByText } = render(<CueCard cue={baseCue} />);
    expect(getByText(/Table 7/)).toBeTruthy();
  });

  it('does not show Pay button when status is checked_in', () => {
    const { queryByText } = render(<CueCard cue={baseCue} />);
    expect(queryByText(/Pay/)).toBeNull();
  });

  it('shows Pay button when status is pending_payment', () => {
    const pendingCue: StoredCue = { ...baseCue, status: 'pending_payment' };
    const onPayPress = jest.fn();
    const { getByText } = render(
      <CueCard cue={pendingCue} onPayPress={onPayPress} />,
    );
    const payButton = getByText(/Pay \$5\.00 Storage Fee/);
    expect(payButton).toBeTruthy();
    fireEvent.press(payButton);
    expect(onPayPress).toHaveBeenCalledWith(pendingCue);
  });

  it('renders checked_out status badge', () => {
    const checkedOutCue: StoredCue = { ...baseCue, status: 'checked_out', checkOutCount: 2 };
    const { getByText } = render(<CueCard cue={checkedOutCue} />);
    expect(getByText('Checked Out')).toBeTruthy();
    expect(getByText(/Pick-ups this tournament: 2/)).toBeTruthy();
  });

  it('does not render pick-up count when checkOutCount is 0', () => {
    const { queryByText } = render(<CueCard cue={baseCue} />);
    expect(queryByText(/Pick-ups/)).toBeNull();
  });
});
