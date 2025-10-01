import React from 'react';
import { Switch, StyleSheet } from 'react-native';
import { View, Text } from '../../../ui';
import { useTheme } from '../../../core/theme';

interface PrivacyFormData {
  pushEnabled: boolean;
  shareCountryOnLB: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
}

interface PrivacyPreferencesFormProps {
  editing: boolean;
  formData: PrivacyFormData;
  onFormDataChange: (data: Partial<PrivacyFormData>) => void;
}

export default function PrivacyPreferencesForm({
  editing,
  formData,
  onFormDataChange,
}: PrivacyPreferencesFormProps) {
  const theme = useTheme();

  return (
    <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
      <Text variant="h3" weight="bold" color="text" style={styles.sectionTitle}>
        Privacy & Preferences
      </Text>

      <View style={styles.switchContainer}>
        <View style={styles.switchInfo}>
          <Text variant="body" color="text" style={styles.switchLabel}>
            Push Notifications
          </Text>
          <Text variant="caption" color="textMuted">
            Receive notifications for new quizzes
          </Text>
        </View>
        <Switch
          value={formData.pushEnabled}
          onValueChange={(value) => onFormDataChange({ pushEnabled: value })}
          disabled={!editing}
          trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
          thumbColor={theme.colors.card}
        />
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchInfo}>
          <Text variant="body" color="text" style={styles.switchLabel}>
            Show Country on Leaderboard
          </Text>
          <Text variant="caption" color="textMuted">
            Display your country flag on leaderboards
          </Text>
        </View>
        <Switch
          value={formData.shareCountryOnLB}
          onValueChange={(value) => onFormDataChange({ shareCountryOnLB: value })}
          disabled={!editing}
          trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
          thumbColor={theme.colors.card}
        />
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchInfo}>
          <Text variant="body" color="text" style={styles.switchLabel}>
            Analytics Consent
          </Text>
          <Text variant="caption" color="textMuted">
            Help us improve by sharing anonymous usage data
          </Text>
        </View>
        <Switch
          value={formData.analyticsConsent}
          onValueChange={(value) => onFormDataChange({ analyticsConsent: value })}
          disabled={!editing}
          trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
          thumbColor={theme.colors.card}
        />
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchInfo}>
          <Text variant="body" color="text" style={styles.switchLabel}>
            Marketing Communications
          </Text>
          <Text variant="caption" color="textMuted">
            Receive updates about new features and events
          </Text>
        </View>
        <Switch
          value={formData.marketingConsent}
          onValueChange={(value) => onFormDataChange({ marketingConsent: value })}
          disabled={!editing}
          trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
          thumbColor={theme.colors.card}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    marginBottom: 2,
  },
});