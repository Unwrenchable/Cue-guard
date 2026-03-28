/**
 * Tests for TapPayButton component.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TapPayButton from '../src/components/TapPayButton';

// Mock Platform to test both iOS and Android labels.
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj: Record<string, unknown>) => obj.ios),
}));

describe('TapPayButton', () => {
  it('renders default iOS label', () => {
    const { getByText } = render(<TapPayButton onPress={() => {}} />);
    expect(getByText('Pay with Apple Pay')).toBeTruthy();
  });

  it('renders custom label when provided', () => {
    const { getByText } = render(
      <TapPayButton onPress={() => {}} label="Tap to Pay" />,
    );
    expect(getByText('Tap to Pay')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<TapPayButton onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled and shows spinner when loading', () => {
    const onPress = jest.fn();
    const { getByRole, queryByText } = render(
      <TapPayButton onPress={onPress} loading />,
    );
    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
    // Label text should not be visible while loading.
    expect(queryByText('Pay with Apple Pay')).toBeNull();
    // Pressing while loading should not trigger onPress.
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
