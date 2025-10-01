import React from 'react';
import { TextInput, TouchableOpacity, StyleSheet, Alert, Platform, NativeModules } from 'react-native';
import { View, Text } from '../../../ui';
import { useTheme } from '../../../core/theme';
import { userApiService } from '../../../core/api/user';
import { COUNTRY_CODES } from './CountryCodes';
import HandleAvailabilityChecker from './HandleAvailabilityChecker';

interface FormData {
  name: string;
  handle: string;
  country: string;
  tz: string;
}

interface HandleAvailabilityStatus {
  checking: boolean;
  available: boolean | null;
  suggestions: string[];
}

interface BasicInformationFormProps {
  editing: boolean;
  formData: FormData;
  originalHandle?: string;
  handleStatus: HandleAvailabilityStatus;
  onFormDataChange: (data: Partial<FormData>) => void;
  onHandleCheck: (handle: string) => void;
  onCountryPickerOpen: () => void;
}

export default function BasicInformationForm({
  editing,
  formData,
  originalHandle,
  handleStatus,
  onFormDataChange,
  onHandleCheck,
  onCountryPickerOpen,
}: BasicInformationFormProps) {
  const theme = useTheme();

  // Get device country code from locale
  const getDeviceCountryCode = (): string => {
    try {
      if (Platform.OS === 'ios') {
        const locale = NativeModules.SettingsManager?.settings?.AppleLocale || 
                      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0];
        if (locale) {
          const countryMatch = locale.match(/_([A-Z]{2})$/);
          if (countryMatch) return countryMatch[1];
        }
      } else if (Platform.OS === 'android') {
        const locale = NativeModules.I18nManager?.localeIdentifier;
        if (locale) {
          const countryMatch = locale.match(/_([A-Z]{2})$/);
          if (countryMatch) return countryMatch[1];
        }
      }
      
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        const countryMatch = locale.match(/-([A-Z]{2})$/);
        if (countryMatch) return countryMatch[1];
      }
      
      return '';
    } catch (error) {
      console.warn('Failed to get device country code:', error);
      return '';
    }
  };

  const getCountryName = (code: string) => {
    const country = COUNTRY_CODES.find(c => c.code === code);
    return country ? country.name : code;
  };

  const handleAutoDetectCountry = () => {
    const deviceCountry = getDeviceCountryCode();
    if (deviceCountry) {
      onFormDataChange({ country: deviceCountry });
      Alert.alert('Country Updated', `Country set to ${deviceCountry} (${getCountryName(deviceCountry)}) based on your device location.`);
    } else {
      Alert.alert('Detection Failed', 'Could not detect country from device settings.');
    }
  };

  const handleTimezoneSelect = () => {
    if (editing) {
      const timezones = userApiService.getCommonTimezones();
      Alert.alert(
        'Select Timezone',
        'Choose your timezone',
        timezones.map(tz => ({
          text: `${tz.label} (${tz.offset})`,
          onPress: () => onFormDataChange({ tz: tz.value })
        })).concat([{ text: 'Cancel', style: 'cancel' }])
      );
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onFormDataChange({ handle: suggestion });
    onHandleCheck(suggestion);
  };

  return (
    <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
      <Text variant="h3" weight="bold" color="text" style={styles.sectionTitle}>
        Basic Information
      </Text>

      {/* Name Field */}
      <View style={styles.fieldContainer}>
        <Text variant="body" weight="medium" color="text" style={styles.fieldLabel}>
          Display Name
        </Text>
        <TextInput
          style={[
            styles.textInput,
            { 
              backgroundColor: editing ? theme.colors.card : theme.colors.disabled,
              borderColor: theme.colors.border,
              color: editing ? theme.colors.text : theme.colors.textMuted,
            }
          ]}
          value={formData.name}
          onChangeText={(text) => onFormDataChange({ name: text })}
          placeholder="Enter your display name"
          placeholderTextColor={theme.colors.textMuted}
          editable={editing}
          multiline={false}
          maxLength={120}
        />
      </View>

      {/* Handle Field */}
      <View style={styles.fieldContainer}>
        <Text variant="body" weight="medium" color="text" style={styles.fieldLabel}>
          Username (@handle)
        </Text>
        <TextInput
          style={[
            styles.textInput,
            { 
              backgroundColor: editing ? theme.colors.card : theme.colors.disabled,
              borderColor: handleStatus.available === false ? theme.colors.error : 
                         handleStatus.available === true ? theme.colors.success : 
                         theme.colors.border,
              color: editing ? theme.colors.text : theme.colors.textMuted,
            }
          ]}
          value={formData.handle}
          onChangeText={(text) => {
            const cleanText = text.toLowerCase().replace(/[^a-z0-9_-]/g, '');
            onFormDataChange({ handle: cleanText });
            if (editing && cleanText !== originalHandle) {
              onHandleCheck(cleanText);
            }
          }}
          placeholder="Enter your username"
          placeholderTextColor={theme.colors.textMuted}
          editable={editing}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={60}
        />

        <HandleAvailabilityChecker
          editing={editing}
          handle={formData.handle}
          originalHandle={originalHandle}
          status={handleStatus}
          onSuggestionSelect={handleSuggestionSelect}
        />
      </View>

      {/* Country Field */}
      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeaderRow}>
          <Text variant="body" weight="medium" color="text" style={styles.fieldLabel}>
            Country
          </Text>
          {editing && (
            <TouchableOpacity 
              style={[styles.autoDetectButton, { backgroundColor: theme.colors.accent2 }]}
              onPress={handleAutoDetectCountry}
            >
              <Text variant="caption" weight="medium" style={{ color: theme.colors.text }}>
                📍 Auto-detect
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Text variant="caption" color="textMuted" style={styles.fieldHelper}>
          {editing ? 'Tap to select from list or auto-detect from device' : 'Used for regional features and leaderboards'}
        </Text>
        <TouchableOpacity
          style={[
            styles.countrySelector,
            { 
              backgroundColor: editing ? theme.colors.card : theme.colors.disabled,
              borderColor: theme.colors.border,
            }
          ]}
          onPress={editing ? onCountryPickerOpen : undefined}
          disabled={!editing}
        >
          <Text 
            style={[
              styles.countrySelectorText,
              { 
                color: editing ? theme.colors.text : theme.colors.textMuted,
              }
            ]}
          >
            {formData.country ? `${formData.country} - ${getCountryName(formData.country)}` : 'Select country...'}
          </Text>
          {editing && (
            <Text style={[styles.countrySelectorArrow, { color: theme.colors.textMuted }]}>
              ▼
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Timezone Field */}
      <View style={styles.fieldContainer}>
        <Text variant="body" weight="medium" color="text" style={styles.fieldLabel}>
          Timezone
        </Text>
        <Text variant="caption" color="textMuted" style={styles.fieldHelper}>
          Used for accurate quiz scheduling
        </Text>
        <View style={[
          styles.inputContainer, 
          { 
            backgroundColor: editing ? theme.colors.card : theme.colors.disabled,
            borderColor: theme.colors.border,
          }
        ]}>
          <Text 
            style={[
              styles.input,
              { 
                color: editing ? theme.colors.text : theme.colors.textMuted,
              }
            ]}
            onPress={handleTimezoneSelect}
          >
            {userApiService.getCommonTimezones().find(tz => tz.value === formData.tz)?.label || formData.tz}
          </Text>
        </View>
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
  fieldContainer: {
    marginBottom: 20,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLabel: {
    marginBottom: 0,
  },
  fieldHelper: {
    marginBottom: 6,
  },
  autoDetectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  input: {
    fontSize: 16,
    minHeight: 24,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  countrySelector: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countrySelectorText: {
    fontSize: 16,
    flex: 1,
  },
  countrySelectorArrow: {
    fontSize: 12,
    marginLeft: 8,
  },
});