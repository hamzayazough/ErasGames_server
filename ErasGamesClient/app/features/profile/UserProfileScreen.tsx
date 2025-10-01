import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { userApiService, UserProfile, UpdateUserProfileRequest } from '../core/api/user';

interface UserProfileScreenProps {
  // Add your navigation props here if using React Navigation
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    country: '',
    tz: '',
    pushEnabled: true,
    leaderboardOptOut: false,
    shareCountryOnLB: true,
    analyticsConsent: true,
    marketingConsent: false,
  });

  // Handle availability check
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [handleSuggestions, setHandleSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await userApiService.getUserProfileSecure();
      setProfile(userProfile);
      setFormData({
        name: userProfile.name || '',
        handle: userProfile.handle || '',
        country: userProfile.country || '',
        tz: userProfile.tz || 'America/Toronto',
        pushEnabled: userProfile.pushEnabled,
        leaderboardOptOut: userProfile.leaderboardOptOut,
        shareCountryOnLB: userProfile.shareCountryOnLB,
        analyticsConsent: userProfile.analyticsConsent,
        marketingConsent: userProfile.marketingConsent,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const checkHandleAvailability = async (handle: string) => {
    if (!handle || handle === profile?.handle) {
      setHandleAvailable(null);
      setHandleSuggestions([]);
      return;
    }

    const validation = userApiService.validateHandleFormat(handle);
    if (!validation.isValid) {
      Alert.alert('Invalid Handle', validation.message);
      return;
    }

    try {
      setHandleChecking(true);
      const result = await userApiService.checkHandleAvailabilityQuery(handle);
      setHandleAvailable(result.available);
      setHandleSuggestions(result.suggestions || []);
    } catch (error: any) {
      console.error('Handle check error:', error);
      setHandleAvailable(null);
    } finally {
      setHandleChecking(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    // Validate form data
    const nameValidation = userApiService.validateNameFormat(formData.name);
    if (!nameValidation.isValid) {
      Alert.alert('Invalid Name', nameValidation.message);
      return;
    }

    if (formData.handle) {
      const handleValidation = userApiService.validateHandleFormat(formData.handle);
      if (!handleValidation.isValid) {
        Alert.alert('Invalid Handle', handleValidation.message);
        return;
      }
    }

    if (formData.country) {
      const countryValidation = userApiService.validateCountryFormat(formData.country);
      if (!countryValidation.isValid) {
        Alert.alert('Invalid Country', countryValidation.message);
        return;
      }
    }

    try {
      setSaving(true);
      
      const updateData: UpdateUserProfileRequest = {
        name: formData.name || undefined,
        handle: formData.handle || undefined,
        country: formData.country || undefined,
        tz: formData.tz,
        pushEnabled: formData.pushEnabled,
        leaderboardOptOut: formData.leaderboardOptOut,
        shareCountryOnLB: formData.shareCountryOnLB,
        analyticsConsent: formData.analyticsConsent,
        marketingConsent: formData.marketingConsent,
      };

      const updatedProfile = await userApiService.updateUserProfileSecure(updateData);
      setProfile(updatedProfile);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: confirmDeleteAccount 
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setSaving(true);
      await userApiService.deleteUserAccountSecure();
      Alert.alert('Account Deleted', 'Your account has been successfully deleted.', [
        { text: 'OK', onPress: () => {
          // Navigate to login screen or handle logout
          console.log('Account deleted, should navigate to login');
        }}
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete account');
    } finally {
      setSaving(false);
    }
  };

  const renderTimezoneSelector = () => {
    const timezones = userApiService.getCommonTimezones();
    return (
      <View style={styles.section}>
        <Text style={styles.label}>Timezone</Text>
        <Text style={styles.helper}>Select your timezone for accurate quiz scheduling</Text>
        {timezones.map((tz) => (
          <TouchableOpacity
            key={tz.value}
            style={[
              styles.timezoneOption,
              formData.tz === tz.value && styles.timezoneSelected
            ]}
            onPress={() => setFormData({...formData, tz: tz.value})}
            disabled={!editing}
          >
            <Text style={[
              styles.timezoneLabel,
              formData.tz === tz.value && styles.timezoneSelectedText
            ]}>
              {tz.label} ({tz.offset})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text>Failed to load profile</Text>
        <TouchableOpacity style={styles.button} onPress={loadUserProfile}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Profile</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => setEditing(!editing)}
        >
          <Text style={styles.editButtonText}>
            {editing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputDisabled]}
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
          placeholder="Enter your name"
          editable={editing}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Handle (Username)</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputDisabled]}
          value={formData.handle}
          onChangeText={(text) => {
            setFormData({...formData, handle: text});
            if (editing) {
              checkHandleAvailability(text);
            }
          }}
          placeholder="Enter your handle"
          editable={editing}
          autoCapitalize="none"
        />
        {editing && handleChecking && (
          <Text style={styles.helper}>Checking availability...</Text>
        )}
        {editing && handleAvailable === true && (
          <Text style={styles.successText}>✓ Handle is available</Text>
        )}
        {editing && handleAvailable === false && (
          <View>
            <Text style={styles.errorText}>✗ Handle is not available</Text>
            {handleSuggestions.length > 0 && (
              <View>
                <Text style={styles.helper}>Suggestions:</Text>
                {handleSuggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    style={styles.suggestion}
                    onPress={() => {
                      setFormData({...formData, handle: suggestion});
                      checkHandleAvailability(suggestion);
                    }}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Country (2-letter code)</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputDisabled]}
          value={formData.country}
          onChangeText={(text) => setFormData({...formData, country: text.toUpperCase()})}
          placeholder="US, CA, GB, etc."
          editable={editing}
          maxLength={2}
          autoCapitalize="characters"
        />
      </View>

      {renderTimezoneSelector()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Push Notifications</Text>
          <Switch
            value={formData.pushEnabled}
            onValueChange={(value) => setFormData({...formData, pushEnabled: value})}
            disabled={!editing}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Opt out of Leaderboard</Text>
          <Switch
            value={formData.leaderboardOptOut}
            onValueChange={(value) => setFormData({...formData, leaderboardOptOut: value})}
            disabled={!editing}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Share Country on Leaderboard</Text>
          <Switch
            value={formData.shareCountryOnLB}
            onValueChange={(value) => setFormData({...formData, shareCountryOnLB: value})}
            disabled={!editing}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Analytics Consent</Text>
          <Switch
            value={formData.analyticsConsent}
            onValueChange={(value) => setFormData({...formData, analyticsConsent: value})}
            disabled={!editing}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Marketing Consent</Text>
          <Switch
            value={formData.marketingConsent}
            onValueChange={(value) => setFormData({...formData, marketingConsent: value})}
            disabled={!editing}
          />
        </View>
      </View>

      {editing && (
        <TouchableOpacity 
          style={[styles.button, saving && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity 
          style={[styles.dangerButton, saving && styles.buttonDisabled]}
          onPress={handleDeleteAccount}
          disabled={saving}
        >
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  helper: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  suggestion: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginTop: 4,
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    fontSize: 12,
    color: '#007AFF',
  },
  timezoneOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  timezoneSelected: {
    backgroundColor: '#007AFF',
  },
  timezoneLabel: {
    fontSize: 14,
    color: '#333',
  },
  timezoneSelectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerZone: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 16,
  },
  dangerButton: {
    backgroundColor: '#F44336',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});