import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
  NativeModules,
  Platform,
  Modal,
  FlatList,
  Text as RNText,
} from 'react-native';
import { View, Text } from '../../ui';
import { useTheme, ThemedBackground } from '../../core/theme';
import GlobalHeader from '../../shared/components/GlobalHeader';
import { AnimatedLogo } from '../../shared/components/AnimatedLogo';
import { userApiService, UserProfile, UpdateUserProfileRequest } from '../../core/api/user';

// Country codes list with names for better UX
const COUNTRY_CODES = [
  { code: 'AD', name: 'Andorra' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'AL', name: 'Albania' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AO', name: 'Angola' },
  { code: 'AQ', name: 'Antarctica' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'AT', name: 'Austria' },
  { code: 'AU', name: 'Australia' },
  { code: 'AW', name: 'Aruba' },
  { code: 'AX', name: 'Åland Islands' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BI', name: 'Burundi' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BL', name: 'Saint Barthélemy' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BQ', name: 'Caribbean Netherlands' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BV', name: 'Bouvet Island' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BZ', name: 'Belize' },
  { code: 'CA', name: 'Canada' },
  { code: 'CC', name: 'Cocos Islands' },
  { code: 'CD', name: 'Congo (DRC)' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'CG', name: 'Congo' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'CK', name: 'Cook Islands' },
  { code: 'CL', name: 'Chile' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'CW', name: 'Curaçao' },
  { code: 'CX', name: 'Christmas Island' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DE', name: 'Germany' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EE', name: 'Estonia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'EH', name: 'Western Sahara' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'ES', name: 'Spain' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FK', name: 'Falkland Islands' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'FO', name: 'Faroe Islands' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GE', name: 'Georgia' },
  { code: 'GF', name: 'French Guiana' },
  { code: 'GG', name: 'Guernsey' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GI', name: 'Gibraltar' },
  { code: 'GL', name: 'Greenland' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'GR', name: 'Greece' },
  { code: 'GS', name: 'South Georgia' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GU', name: 'Guam' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HM', name: 'Heard & McDonald Islands' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HR', name: 'Croatia' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HU', name: 'Hungary' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IM', name: 'Isle of Man' },
  { code: 'IN', name: 'India' },
  { code: 'IO', name: 'British Indian Ocean Territory' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IR', name: 'Iran' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IT', name: 'Italy' },
  { code: 'JE', name: 'Jersey' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JO', name: 'Jordan' },
  { code: 'JP', name: 'Japan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KM', name: 'Comoros' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'KP', name: 'North Korea' },
  { code: 'KR', name: 'South Korea' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LY', name: 'Libya' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MD', name: 'Moldova' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MF', name: 'Saint Martin' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'ML', name: 'Mali' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'MO', name: 'Macao' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MS', name: 'Montserrat' },
  { code: 'MT', name: 'Malta' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MV', name: 'Maldives' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NC', name: 'New Caledonia' },
  { code: 'NE', name: 'Niger' },
  { code: 'NF', name: 'Norfolk Island' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NU', name: 'Niue' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'OM', name: 'Oman' },
  { code: 'PA', name: 'Panama' },
  { code: 'PE', name: 'Peru' },
  { code: 'PF', name: 'French Polynesia' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PL', name: 'Poland' },
  { code: 'PM', name: 'Saint Pierre and Miquelon' },
  { code: 'PN', name: 'Pitcairn Islands' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PW', name: 'Palau' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RE', name: 'Réunion' },
  { code: 'RO', name: 'Romania' },
  { code: 'RS', name: 'Serbia' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SE', name: 'Sweden' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SH', name: 'Saint Helena' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SJ', name: 'Svalbard and Jan Mayen' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SM', name: 'San Marino' },
  { code: 'SN', name: 'Senegal' },
  { code: 'SO', name: 'Somalia' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ST', name: 'São Tomé and Príncipe' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'SX', name: 'Sint Maarten' },
  { code: 'SY', name: 'Syria' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'TC', name: 'Turks and Caicos Islands' },
  { code: 'TD', name: 'Chad' },
  { code: 'TF', name: 'French Southern Territories' },
  { code: 'TG', name: 'Togo' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TK', name: 'Tokelau' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UM', name: 'U.S. Outlying Islands' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VG', name: 'British Virgin Islands' },
  { code: 'VI', name: 'U.S. Virgin Islands' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'WF', name: 'Wallis and Futuna' },
  { code: 'WS', name: 'Samoa' },
  { code: 'YE', name: 'Yemen' },
  { code: 'YT', name: 'Mayotte' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  
  // Debug: Check if countries are loaded
  console.log('COUNTRY_CODES length:', COUNTRY_CODES.length);
  
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

  // Country picker state
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Get device country code from locale
  const getDeviceCountryCode = (): string => {
    try {
      if (Platform.OS === 'ios') {
        const locale = NativeModules.SettingsManager?.settings?.AppleLocale || 
                      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0];
        if (locale) {
          // Extract country code from locale (e.g., "en_US" -> "US", "fr_CA" -> "CA")
          const countryMatch = locale.match(/_([A-Z]{2})$/);
          if (countryMatch) return countryMatch[1];
        }
      } else if (Platform.OS === 'android') {
        const locale = NativeModules.I18nManager?.localeIdentifier;
        if (locale) {
          // Extract country code from locale (e.g., "en_US" -> "US", "fr_CA" -> "CA")
          const countryMatch = locale.match(/_([A-Z]{2})$/);
          if (countryMatch) return countryMatch[1];
        }
      }
      
      // Fallback: try to get from Intl API if available
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        const countryMatch = locale.match(/-([A-Z]{2})$/);
        if (countryMatch) return countryMatch[1];
      }
      
      // Default fallback
      return '';
    } catch (error) {
      console.warn('Failed to get device country code:', error);
      return '';
    }
  };

  // Filter countries based on search query
  const getFilteredCountries = () => {
    const filtered = !countrySearchQuery.trim() 
      ? COUNTRY_CODES 
      : COUNTRY_CODES.filter(country => {
          const query = countrySearchQuery.toLowerCase();
          return country.code.toLowerCase().includes(query) ||
                 country.name.toLowerCase().includes(query);
        });
    
    console.log('Filtered countries count:', filtered.length);
    console.log('First 3 countries:', filtered.slice(0, 3));
    return filtered;
  };

  // Handle country selection
  const handleCountrySelect = (countryCode: string) => {
    setFormData({ ...formData, country: countryCode });
    setShowCountryPicker(false);
    setCountrySearchQuery('');
  };

  // Get country name from code
  const getCountryName = (code: string) => {
    const country = COUNTRY_CODES.find(c => c.code === code);
    return country ? country.name : code;
  };

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
    const deviceCountry = getDeviceCountryCode();
    setFormData({
      name: userProfile.name || '',
      handle: userProfile.handle || '',
      country: userProfile.country || deviceCountry,
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
              onChangeText={(text) => setFormData({ ...formData, name: text })}
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
                setFormData({ ...formData, handle: cleanText });
                if (editing && cleanText !== profile?.handle) {
                  checkHandleAvailability(cleanText);
                }
              }}
              placeholder="Enter your username"
              placeholderTextColor={theme.colors.textMuted}
              editable={editing}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={60}
            />

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
            <View style={styles.fieldHeaderRow}>
              <Text variant="body" weight="medium" color="text" style={styles.fieldLabel}>
                Country
              </Text>
              {editing && (
                <TouchableOpacity 
                  style={[styles.autoDetectButton, { backgroundColor: theme.colors.accent2 }]}
                  onPress={() => {
                    const deviceCountry = getDeviceCountryCode();
                    if (deviceCountry) {
                      setFormData({ ...formData, country: deviceCountry });
                      Alert.alert('Country Updated', `Country set to ${deviceCountry} (${getCountryName(deviceCountry)}) based on your device location.`);
                    } else {
                      Alert.alert('Detection Failed', 'Could not detect country from device settings.');
                    }
                  }}
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
              onPress={editing ? () => setShowCountryPicker(true) : undefined}
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

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text variant="h3" weight="bold" color="text">
                Select Country ({getFilteredCountries().length})
              </Text>
              <TouchableOpacity
                onPress={() => setShowCountryPicker(false)}
                style={styles.modalCloseButton}
              >
                <Text style={[styles.modalCloseText, { color: theme.colors.text }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder="Search countries..."
                placeholderTextColor={theme.colors.textMuted}
                value={countrySearchQuery}
                onChangeText={setCountrySearchQuery}
                autoFocus={true}
              />
            </View>

            <FlatList
              data={getFilteredCountries()}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    { 
                      backgroundColor: formData.country === item.code ? theme.colors.accent : 'transparent',
                      borderBottomColor: theme.colors.border 
                    }
                  ]}
                  onPress={() => handleCountrySelect(item.code)}
                >
                  <View style={styles.countryItemLeft}>
                    <RNText style={[
                      styles.countryCode, 
                      { 
                        color: formData.country === item.code ? '#FFFFFF' : theme.colors.text,
                        fontWeight: '600'
                      }
                    ]}>
                      {item.code}
                    </RNText>
                    <RNText style={[
                      styles.countryName, 
                      { 
                        color: formData.country === item.code ? '#FFFFFF' : theme.colors.text,
                        opacity: formData.country === item.code ? 0.9 : 0.7
                      }
                    ]}>
                      {item.name}
                    </RNText>
                  </View>
                  {formData.country === item.code && (
                    <RNText style={[styles.selectedIndicator, { color: '#FFFFFF' }]}>
                      ✓
                    </RNText>
                  )}
                </TouchableOpacity>
              )}
              style={styles.countryList}
              contentContainerStyle={styles.countryListContent}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    padding: 12,
    fontSize: 16,
  },
  countryList: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  countryListContent: {
    flexGrow: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    minHeight: 60,
  },
  countryItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    width: 45,
    textAlign: 'left',
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
    lineHeight: 20,
  },
  selectedIndicator: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noCountriesContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCountriesText: {
    fontSize: 16,
    textAlign: 'center',
  },
});