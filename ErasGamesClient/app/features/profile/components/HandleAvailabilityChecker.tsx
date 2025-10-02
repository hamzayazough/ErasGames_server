import React from 'react';
import { ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { View, Text } from '../../../ui';
import { useTheme } from '../../../core/theme';

interface HandleAvailabilityStatus {
  checking: boolean;
  available: boolean | null;
  suggestions: string[];
}

interface HandleAvailabilityCheckerProps {
  editing: boolean;
  handle: string;
  originalHandle?: string;
  status: HandleAvailabilityStatus;
  onSuggestionSelect: (suggestion: string) => void;
}

export default function HandleAvailabilityChecker({
  editing,
  handle,
  originalHandle,
  status,
  onSuggestionSelect,
}: HandleAvailabilityCheckerProps) {
  const theme = useTheme();

  if (!editing || !handle || handle === originalHandle) {
    return null;
  }

  return (
    <View style={styles.handleStatus}>
      {status.checking && (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text variant="caption" color="textMuted" style={styles.statusText}>
            Checking availability...
          </Text>
        </View>
      )}
      
      {!status.checking && status.available === true && (
        <Text variant="caption" style={[styles.statusText, { color: theme.colors.success }]}>
          ✓ Username is available
        </Text>
      )}
      
      {!status.checking && status.available === false && (
        <View>
          <Text variant="caption" style={[styles.statusText, { color: theme.colors.error }]}>
            ✗ Username is not available
          </Text>
          {status.suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text variant="caption" color="textMuted" style={styles.suggestionsLabel}>
                Suggestions:
              </Text>
              <View style={styles.suggestionsList}>
                {status.suggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    style={[styles.suggestionChip, { backgroundColor: theme.colors.primary }]}
                    onPress={() => onSuggestionSelect(suggestion)}
                  >
                    <Text variant="caption" style={{ color: theme.colors.textOnPrimary }}>
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  handleStatus: {
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsLabel: {
    marginBottom: 6,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});