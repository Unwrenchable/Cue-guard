import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';

interface TapPayButtonProps {
  onPress: () => void;
  loading?: boolean;
  label?: string;
  style?: ViewStyle;
}

/**
 * TapPayButton – a prominent call-to-action button used to initiate the
 * native tap-to-pay flow (Apple Pay on iOS, Google Pay on Android).
 */
const TapPayButton: React.FC<TapPayButtonProps> = ({
  onPress,
  loading = false,
  label,
  style,
}) => {
  const buttonLabel =
    label ?? (Platform.OS === 'ios' ? 'Pay with Apple Pay' : 'Pay with Google Pay');

  return (
    <TouchableOpacity
      style={[styles.button, style, loading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={buttonLabel}
      accessibilityState={{ disabled: loading }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.label}>{buttonLabel}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Platform.OS === 'ios' ? '#000000' : '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default TapPayButton;
