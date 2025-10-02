import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { View, Text } from '../../ui';
import { useTheme, ThemedBackground } from '../../core/theme';
import GlobalHeader from '../../shared/components/GlobalHeader';
import { userApiService, UserProfile, UpdateUserProfileRequest } from '../../core/api/user';
import { useAuth } from '../../core/context/AuthContext';
import {
  ProfileHeader,
  BasicInformationForm,
  PrivacyPreferencesForm,
  CountryPickerModal,
  LogoutConfirmModal,
  LoadingState,
  ThemeSelector,
} from './components';

export default function ProfileScreen() {
  const theme = useTheme();
  const { signOut } = useAuth();
  
  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({
    isChecking: false,
    isAvailable: null,
    message: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Load profile data
  const loadProfile = async () => {
    try {
      setError(null);
      const profileData = await userApiService.getUserProfile();
      setProfile(profileData);
      
      // Update form with profile data
      setFormData({
        name: profileData.name || '',
        handle: profileData.handle || '',
        country: profileData.country || '',
        tz: profileData.tz || Intl.DateTimeFormat().resolvedOptions().timeZone,
        pushEnabled: profileData.pushEnabled ?? true,
        shareCountryOnLB: profileData.shareCountryOnLB ?? true,
        analyticsConsent: profileData.analyticsConsent ?? true,
        marketingConsent: profileData.marketingConsent ?? false,
      });
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProfile();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  // Update form data
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save profile changes
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.handle.trim()) {
      setError('Handle is required');
      return;
    }

    if (!formData.country) {
      setError('Please select a country');
      return;
    }

    if (handleStatus.isAvailable === false) {
      setError('Please choose an available handle');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updateRequest: UpdateUserProfileRequest = {
        name: formData.name.trim(),
        handle: formData.handle.trim(),
        country: formData.country,
        tz: formData.tz,
        pushEnabled: formData.pushEnabled,
        shareCountryOnLB: formData.shareCountryOnLB,
        analyticsConsent: formData.analyticsConsent,
        marketingConsent: formData.marketingConsent,
      };

      const updatedProfile = await userApiService.updateUserProfile(updateRequest);
      setProfile(updatedProfile);
      setEditing(false);
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (!profile) return;
    
    // Reset form to original values
    setFormData({
      name: profile.name || '',
      handle: profile.handle || '',
      country: profile.country || '',
      tz: profile.tz || Intl.DateTimeFormat().resolvedOptions().timeZone,
      pushEnabled: profile.pushEnabled ?? true,
      shareCountryOnLB: profile.shareCountryOnLB ?? true,
      analyticsConsent: profile.analyticsConsent ?? true,
      marketingConsent: profile.marketingConsent ?? false,
    });
    
    setEditing(false);
    setError(null);
    setHandleStatus({
      isChecking: false,
      isAvailable: null,
      message: '',
    });
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      setShowLogoutModal(false);
    } catch (err: any) {
      console.error('Logout failed:', err);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // Render loading state
  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  // Render error state
  if (!profile && error) {
    return <LoadingState error={error} onRetry={loadProfile} />;
  }

  if (!profile) {
    return <LoadingState error="Profile not found" onRetry={loadProfile} />;
  }

  return (
    <ThemedBackground>
      <GlobalHeader title="Profile" isProfileActive />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          profile={profile}
          editing={editing}
          onEdit={() => setEditing(true)}
          onCancel={handleCancel}
          onLogout={() => setShowLogoutModal(true)}
        />

        <ThemeSelector />

        <BasicInformationForm
          editing={editing}
          formData={formData}
          originalHandle={profile.handle}
          handleStatus={{
            checking: handleStatus.isChecking,
            available: handleStatus.isAvailable,
            suggestions: []
          }}
          onFormDataChange={(data) => {
            Object.entries(data).forEach(([key, value]) => {
              updateFormData(key, value);
            });
          }}
          onHandleCheck={async (handle: string) => {
            if (handle === profile.handle) {
              setHandleStatus({
                isChecking: false,
                isAvailable: true,
                message: ''
              });
              return;
            }

            setHandleStatus({
              isChecking: true,
              isAvailable: null,
              message: 'Checking availability...'
            });

            try {
              const result = await userApiService.checkHandleAvailability({ handle });
              setHandleStatus({
                isChecking: false,
                isAvailable: result.available,
                message: result.available ? 'Handle is available!' : 'Handle is already taken'
              });
            } catch (err: any) {
              setHandleStatus({
                isChecking: false,
                isAvailable: false,
                message: 'Error checking handle availability'
              });
            }
          }}
          onCountryPickerOpen={() => setShowCountryPicker(true)}
        />

        <PrivacyPreferencesForm
          editing={editing}
          formData={{
            pushEnabled: formData.pushEnabled,
            shareCountryOnLB: formData.shareCountryOnLB,
            analyticsConsent: formData.analyticsConsent,
            marketingConsent: formData.marketingConsent,
          }}
          onFormDataChange={(data) => {
            Object.entries(data).forEach(([key, value]) => {
              updateFormData(key, value);
            });
          }}
        />

        {/* Error display */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
            <Text variant="body" color="error" center>
              {error}
            </Text>
          </View>
        )}

        {/* Save/Cancel buttons when editing */}
        {editing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text variant="body" color="text">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
              disabled={saving || handleStatus.isAvailable === false}
            >
              <Text variant="body" style={{ color: theme.colors.textOnPrimary }}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CountryPickerModal
        visible={showCountryPicker}
        selectedCountry={formData.country}
        searchQuery={searchQuery}
        onClose={() => setShowCountryPicker(false)}
        onSearchChange={setSearchQuery}
        onCountrySelect={(countryCode) => {
          updateFormData('country', countryCode);
          setShowCountryPicker(false);
          setSearchQuery('');
        }}
      />

      <LogoutConfirmModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor will be set dynamically
  },
});