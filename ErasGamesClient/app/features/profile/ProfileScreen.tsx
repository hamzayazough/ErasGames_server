import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { View, Text } from '../../ui';
import { useTheme, ThemedBackground } from '../../core/theme';
import GlobalHeader from '../../shared/components/GlobalHeader';
import { AnimatedLogo } from '../../shared/components/AnimatedLogo';
import { userApiService, UserProfile, UpdateUserProfileRequest } from '../../core/api/user';

export default function ProfileScreen() {
  const theme = useTheme();
  
  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    country: '',
    tz: '',
    pushEnabled: true,
    shareCountryOnLB: true,
    analyticsConsent: true,
    marketingConsent: false,
  });

  // Handle availability state
  const [handleStatus, setHandleStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    suggestions: string[];
  }>({
    checking: false,
    available: null,
    suggestions: [],
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await userApiService.getUserProfileSecure();
      setProfile(userProfile);
      updateFormData(userProfile);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (userProfile: UserProfile) => {
    setFormData({
      name: userProfile.name || '',
      handle: userProfile.handle || '',
      country: userProfile.country || '',
      tz: userProfile.tz || 'America/Toronto',
      pushEnabled: userProfile.pushEnabled,
      shareCountryOnLB: userProfile.shareCountryOnLB,
      analyticsConsent: userProfile.analyticsConsent,
      marketingConsent: userProfile.marketingConsent,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const checkHandleAvailability = async (handle: string) => {
    if (!handle || handle === profile?.handle) {
      setHandleStatus({ checking: false, available: null, suggestions: [] });
      return;
    }

    const validation = userApiService.validateHandleFormat(handle);
    if (!validation.isValid) {
      Alert.alert('Invalid Handle', validation.message);
      return;
    }

    try {
      setHandleStatus(prev => ({ ...prev, checking: true }));
      const result = await userApiService.checkHandleAvailabilityQuery(handle);
      setHandleStatus({
        checking: false,
        available: result.available,
        suggestions: result.suggestions || [],
      });
    } catch (error: any) {
      console.error('Handle check error:', error);
      setHandleStatus({ checking: false, available: null, suggestions: [] });
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

    if (formData.handle && formData.handle !== profile.handle) {
      const handleValidation = userApiService.validateHandleFormat(formData.handle);
      if (!handleValidation.isValid) {
        Alert.alert('Invalid Handle', handleValidation.message);
        return;
      }
      if (handleStatus.available === false) {
        Alert.alert('Handle Unavailable', 'Please choose a different handle');
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
        shareCountryOnLB: formData.shareCountryOnLB,
        analyticsConsent: formData.analyticsConsent,
        marketingConsent: formData.marketingConsent,
      };

      const updatedProfile = await userApiService.updateUserProfileSecure(updateData);
      setProfile(updatedProfile);
      setEditing(false);
      setHandleStatus({ checking: false, available: null, suggestions: [] });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };



  // Loading screen
  if (loading) {
    return (
      <ThemedBackground style={styles.container}>
        <GlobalHeader showBack={true} />
        <View style={styles.centerContent}>
          <AnimatedLogo size={200} />
          <Text variant="body" color="textSecondary" center style={styles.loadingText}>
            Loading profile...
          </Text>
        </View>
      </ThemedBackground>
    );
  }

  if (!profile) {
    return (
      <ThemedBackground style={styles.container}>
        <GlobalHeader showBack={true} />
        <View style={styles.centerContent}>
          <Text variant="h2" center style={styles.errorTitle}>
            😔 Profile Not Found
          </Text>
          <Text variant="body" color="textSecondary" center style={styles.errorMessage}>
            We couldn't load your profile. Please try again.
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadUserProfile}
          >
            <Text variant="body" weight="semibold" style={{ color: theme.colors.textOnPrimary }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedBackground>
    );
  }

  return (
    <ThemedBackground style={styles.container}>
      <GlobalHeader 
        showBack={true} 
        showProfile={false}
        title="Profile"
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text variant="h2" weight="bold" style={{ color: theme.colors.textOnPrimary }}>
                {(profile.name || profile.handle || 'U')[0].toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text variant="h3" weight="bold" color="text" center>
              {profile.name || 'No Name Set'}
            </Text>
            <Text variant="body" color="textSecondary" center>
              @{profile.handle || 'no-handle'}
            </Text>
            <Text variant="caption" color="textMuted" center>
              Joined {new Date(profile.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[
                styles.editButton, 
                { 
                  backgroundColor: editing ? theme.colors.error : theme.colors.primary,
                  borderColor: editing ? theme.colors.error : theme.colors.primary,
                }
              ]}
              onPress={() => {
                if (editing) {
                  setEditing(false);
                  updateFormData(profile);
                  setHandleStatus({ checking: false, available: null, suggestions: [] });
                } else {
                  setEditing(true);
                }
              }}
            >
              <Text variant="body" weight="semibold" style={{ color: theme.colors.textOnPrimary }}>
                {editing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Form */}
        <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="h3" weight="bold" color="text" style={styles.sectionTitle}>
            Basic Information
          </Text>

          {/* Name Field */}
          <View style={styles.fieldContainer}>
            <Text variant="body" weight="medium" color="text" style={styles.fieldLabel}>
              Display Name
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
                onPress={() => {
                  if (editing) {
                    Alert.prompt(
                      'Change Name',
                      'Enter your new display name',
                      (text) => {
                        if (text !== null) {
                          setFormData({ ...formData, name: text });
                        }
                      },
                      'plain-text',
                      formData.name
                    );
                  }
                }}
              >
                {formData.name || 'Tap to set your name'}
              </Text>
            </View>
          </View>

          {/* Handle Field */}
          <View style={styles.fieldContainer}>
            <Text variant="body" weight="medium" color="text" style={styles.fieldLabel}>
              Username (@handle)
            </Text>
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: editing ? theme.colors.card : theme.colors.disabled,
                borderColor: handleStatus.available === false ? theme.colors.error : 
                           handleStatus.available === true ? theme.colors.success : 
                           theme.colors.border,
              }
            ]}>
              <Text 
                style={[
                  styles.input,
                  { 
                    color: editing ? theme.colors.text : theme.colors.textMuted,
                  }
                ]}
                onPress={() => {
                  if (editing) {
                    Alert.prompt(
                      'Change Handle',
                      'Enter your new username (letters, numbers, underscore, hyphen only)',
                      (text) => {
                        if (text !== null) {
                          const cleanText = text.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                          setFormData({ ...formData, handle: cleanText });
                          checkHandleAvailability(cleanText);
                        }
                      },
                      'plain-text',
                      formData.handle
                    );
                  }
                }}
              >
                {formData.handle || 'Tap to set your username'}
              </Text>
            </View>

            {/* Handle Status */}
            {editing && formData.handle && formData.handle !== profile.handle && (
              <View style={styles.handleStatus}>
                {handleStatus.checking && (
                  <View style={styles.statusRow}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text variant="caption" color="textMuted" style={styles.statusText}>
                      Checking availability...
                    </Text>
                  </View>
                )}
                
                {!handleStatus.checking && handleStatus.available === true && (
                  <Text variant="caption" style={[styles.statusText, { color: theme.colors.success }]}>
                    ✓ Username is available
                  </Text>
                )}
                
                {!handleStatus.checking && handleStatus.available === false && (
                  <View>
                    <Text variant="caption" style={[styles.statusText, { color: theme.colors.error }]}>
                      ✗ Username is not available
                    </Text>
                    {handleStatus.suggestions.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        <Text variant="caption" color="textMuted" style={styles.suggestionsLabel}>
                          Suggestions:
                        </Text>
                        <View style={styles.suggestionsList}>
                          {handleStatus.suggestions.map((suggestion) => (
                            <TouchableOpacity
                              key={suggestion}
                              style={[styles.suggestionChip, { backgroundColor: theme.colors.primary }]}
                              onPress={() => {
                                setFormData({ ...formData, handle: suggestion });
                                checkHandleAvailability(suggestion);
                              }}
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
            )}
          </View>

          {/* Country Field */}
          <View style={styles.fieldContainer}>
            <Text variant="body" weight="medium" color="text" style={styles.fieldLabel}>
              Country Code
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
                onPress={() => {
                  if (editing) {
                    Alert.prompt(
                      'Change Country',
                      'Enter your 2-letter country code (e.g., US, CA, GB)',
                      (text) => {
                        if (text !== null) {
                          setFormData({ ...formData, country: text.toUpperCase().slice(0, 2) });
                        }
                      },
                      'plain-text',
                      formData.country
                    );
                  }
                }}
              >
                {formData.country || 'Tap to set country'}
              </Text>
            </View>
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
                onPress={() => {
                  if (editing) {
                    // Show timezone picker
                    const timezones = userApiService.getCommonTimezones();
                    Alert.alert(
                      'Select Timezone',
                      'Choose your timezone',
                      timezones.map(tz => ({
                        text: `${tz.label} (${tz.offset})`,
                        onPress: () => setFormData({ ...formData, tz: tz.value })
                      })).concat([{ text: 'Cancel', style: 'cancel' }])
                    );
                  }
                }}
              >
                {userApiService.getCommonTimezones().find(tz => tz.value === formData.tz)?.label || formData.tz}
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy & Preferences */}
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
              onValueChange={(value) => setFormData({ ...formData, pushEnabled: value })}
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
              onValueChange={(value) => setFormData({ ...formData, shareCountryOnLB: value })}
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
              onValueChange={(value) => setFormData({ ...formData, analyticsConsent: value })}
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
              onValueChange={(value) => setFormData({ ...formData, marketingConsent: value })}
              disabled={!editing}
              trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
              thumbColor={theme.colors.card}
            />
          </View>
        </View>

        {/* Save Changes Button */}
        {editing && (
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              { 
                backgroundColor: saving ? theme.colors.disabled : theme.colors.primary,
                borderColor: saving ? theme.colors.disabled : theme.colors.primary,
              }
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text variant="body" weight="bold" style={{ color: theme.colors.textOnPrimary }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        )}



        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
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
  profileHeader: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
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
  fieldLabel: {
    marginBottom: 8,
  },
  fieldHelper: {
    marginBottom: 6,
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
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  bottomSpacing: {
    height: 40,
  },
});