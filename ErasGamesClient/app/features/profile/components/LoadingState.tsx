import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { View, Text } from '../../../ui';
import { useTheme } from '../../../core/theme';
import { AnimatedLogo } from '../../../shared/components/AnimatedLogo';

interface LoadingStateProps {
  loading: boolean;
  profile: any | null;
  onRetry: () => void;
}

export default function LoadingState({ loading, profile, onRetry }: LoadingStateProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <AnimatedLogo size={200} />
        <Text variant="body" color="textSecondary" center style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContent}>
        <Text variant="h2" center style={styles.errorTitle}>
          😔 Profile Not Found
        </Text>
        <Text variant="body" color="textSecondary" center style={styles.errorMessage}>
          We couldn't load your profile. Please try again.
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={onRetry}
        >
          <Text variant="body" weight="semibold" style={{ color: theme.colors.textOnPrimary }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
  },
  errorTitle: {
    marginBottom: 8,
  },
  errorMessage: {
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});