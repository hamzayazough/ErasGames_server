import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Text as RNText,
  BackHandler,
  Platform,
  NativeModules,
} from 'react-native';
import { View, Text } from '../../ui';
import { useTheme, ThemedBackground } from '../../core/theme';
import GlobalHeader from '../../shared/components/GlobalHeader';
import { userApiService, UpdateUserProfileRequest } from '../../core/api/user';
import { authApiService } from '../../core/api/auth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../core/context/AuthContext';

// Country codes list (same as ProfileScreen)
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

export default function CompleteAccountScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { serverUser } = useAuth();

  // Form state - initialize with existing user data
  const [formData, setFormData] = useState({
    name: serverUser?.name || '',
    handle: serverUser?.handle || '',
    country: serverUser?.country || '',
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

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

  // Prevent back navigation
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Account Setup Required',
          'Please complete your account setup to continue using the app.',
          [{ text: 'OK' }]
        );
        return true; // Prevent default back behavior
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  // Device country detection function (same as ProfileScreen)
  const getDeviceCountryCode = (): string => {
    try {
      if (Platform.OS === 'ios') {
        // iOS: Use SettingsManager to get locale
        const { SettingsManager } = NativeModules;
        if (SettingsManager?.settings?.AppleLocale) {
          const locale = SettingsManager.settings.AppleLocale;
          // Extract country code from locale like "en_US" -> "US"
          const countryMatch = locale.match(/_([A-Z]{2})$/);
          if (countryMatch) {
            return countryMatch[1];
          }
        }
      } else if (Platform.OS === 'android') {
        // Android: Use I18nManager to get locale
        const { I18nManager } = NativeModules;
        if (I18nManager?.localeIdentifier) {
          const locale = I18nManager.localeIdentifier;
          // Extract country code from locale like "en_US" -> "US"
          const countryMatch = locale.match(/_([A-Z]{2})$/);
          if (countryMatch) {
            return countryMatch[1];
          }
        }
      }
      
      // Fallback: Use Intl API if available
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // Simple mapping of common timezones to countries
        const timezoneToCountry: { [key: string]: string } = {
          'America/New_York': 'US',
          'America/Los_Angeles': 'US',
          'America/Chicago': 'US',
          'America/Denver': 'US',
          'America/Toronto': 'CA',
          'America/Vancouver': 'CA',
          'Europe/London': 'GB',
          'Europe/Paris': 'FR',
          'Europe/Berlin': 'DE',
          'Europe/Rome': 'IT',
          'Europe/Madrid': 'ES',
          'Asia/Tokyo': 'JP',
          'Asia/Shanghai': 'CN',
          'Asia/Seoul': 'KR',
          'Australia/Sydney': 'AU',
          'Australia/Melbourne': 'AU',
        };
        
        if (timezoneToCountry[timezone]) {
          return timezoneToCountry[timezone];
        }
      }
      
      return '';
    } catch (error) {
      console.warn('Failed to get device country code:', error);
      return '';
    }
  };

  // Populate form with existing user data when available
  useEffect(() => {
    if (serverUser) {
      setFormData({
        name: serverUser.name || '',
        handle: serverUser.handle || '',
        country: serverUser.country || '',
      });
    }
  }, [serverUser]);

  // Auto-detect country on mount if not already set
  useEffect(() => {
    const detectCountry = async () => {
      const deviceCountry = getDeviceCountryCode();
      if (deviceCountry && !formData.country) {
        setFormData(prev => ({ ...prev, country: deviceCountry }));
      }
    };
    detectCountry();
  }, [formData.country]);

  // Handle availability checking
  const checkHandleAvailability = async (handle: string) => {
    if (!handle.trim() || handle.length < 3) {
      setHandleStatus({ checking: false, available: null, suggestions: [] });
      return;
    }

    setHandleStatus({ checking: true, available: null, suggestions: [] });
    
    try {
      const result = await userApiService.checkHandleAvailability(handle);
      setHandleStatus({
        checking: false,
        available: result.available,
        suggestions: result.suggestions || [],
      });
    } catch (error) {
      setHandleStatus({ checking: false, available: null, suggestions: [] });
    }
  };

  // Debounced handle check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.handle) {
        checkHandleAvailability(formData.handle);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.handle]);

  // Country picker functions
  const getFilteredCountries = () => {
    const filtered = !countrySearchQuery.trim() 
      ? COUNTRY_CODES 
      : COUNTRY_CODES.filter(country => {
          const query = countrySearchQuery.toLowerCase();
          return country.code.toLowerCase().includes(query) ||
                 country.name.toLowerCase().includes(query);
        });
    
    return filtered;
  };

  const handleCountrySelect = (countryCode: string) => {
    setFormData({ ...formData, country: countryCode });
    setShowCountryPicker(false);
    setCountrySearchQuery('');
  };

  const getCountryName = (code: string) => {
    const country = COUNTRY_CODES.find(c => c.code === code);
    return country ? country.name : code;
  };

  // Form validation
  const isFormValid = () => {
    return (
      formData.name.trim().length >= 2 &&
      formData.handle.trim().length >= 3 &&
      formData.country.trim().length === 2 &&
      handleStatus.available === true
    );
  };

  // Save account
  const handleSave = async () => {
    if (!isFormValid()) {
      Alert.alert('Invalid Form', 'Please fill all required fields correctly.');
      return;
    }

    try {
      setSaving(true);

      const updateData: UpdateUserProfileRequest = {
        name: formData.name.trim(),
        handle: formData.handle.trim().toLowerCase(),
        country: formData.country.toUpperCase(),
      };

      await userApiService.updateUserProfile(updateData);

      // Re-authenticate to get updated user data and clear setup flag
      await authApiService.authenticate();

      Alert.alert(
        'Account Complete!', 
        'Your account has been set up successfully.',
        [{ 
          text: 'Continue', 
          onPress: () => {
            // Navigate to main app
            navigation.reset({
              index: 0,
              routes: [{ name: 'DailyDrop' }], // Navigate to main screen
            });
          }
        }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete account setup');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedBackground style={styles.container}>
      <GlobalHeader 
        showBack={false}
        showProfile={false}
        showLeaderboard={false}
        title="Complete Setup"
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={[styles.headerContainer, { backgroundColor: theme.colors.card }]}>
          <Text variant="h2" weight="bold" color="text" style={styles.title}>
            Complete Your Account
          </Text>
          <Text variant="body" color="textMuted" style={styles.subtitle}>
            Please provide the required information to continue
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
          {/* Display Name Field */}
          <View style={styles.fieldContainer}>
            <Text variant="body" weight="medium" color="text" style={styles.fieldLabel}>
              Display Name *
            </Text>
            <Text variant="caption" color="textMuted" style={styles.fieldHelper}>
              Your name as it will appear to other players
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter your display name"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={50}
            />
          </View>

          {/* Username/Handle Field */}
          <View style={styles.fieldContainer}>
            <Text variant="body" weight="medium" color="text" style={styles.fieldLabel}>
              Username (@handle) *
            </Text>
            <Text variant="caption" color="textMuted" style={styles.fieldHelper}>
              Unique identifier for your account (3-20 characters)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              value={formData.handle}
              onChangeText={(text) => setFormData({ ...formData, handle: text.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              placeholder="username"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="none"
              maxLength={20}
            />
            
            {/* Handle Status */}
            {formData.handle.length >= 3 && (
              <View style={styles.handleStatus}>
                <View style={styles.statusRow}>
                  {handleStatus.checking ? (
                    <RNText style={{ color: theme.colors.textMuted }}>⏳</RNText>
                  ) : handleStatus.available === true ? (
                    <RNText style={{ color: theme.colors.success }}>✅</RNText>
                  ) : handleStatus.available === false ? (
                    <RNText style={{ color: theme.colors.error }}>❌</RNText>
                  ) : null}
                  
                  <Text 
                    variant="caption" 
                    color={
                      handleStatus.checking ? "textMuted" :
                      handleStatus.available === true ? "success" :
                      handleStatus.available === false ? "error" : "textMuted"
                    }
                    style={styles.statusText}
                  >
                    {handleStatus.checking ? 'Checking availability...' :
                     handleStatus.available === true ? 'Username available!' :
                     handleStatus.available === false ? 'Username not available' :
                     'Enter at least 3 characters'}
                  </Text>
                </View>

                {/* Suggestions */}
                {handleStatus.suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <Text variant="caption" color="textMuted" style={styles.suggestionsLabel}>
                      Suggestions:
                    </Text>
                    <View style={styles.suggestionsList}>
                      {handleStatus.suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[styles.suggestionChip, { backgroundColor: theme.colors.accent2 }]}
                          onPress={() => setFormData({ ...formData, handle: suggestion })}
                        >
                          <Text variant="caption" weight="medium" style={{ color: theme.colors.text }}>
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

          {/* Country Field */}
          <View style={styles.fieldContainer}>
            <Text variant="body" weight="medium" color="text" style={styles.fieldLabel}>
              Country *
            </Text>
            <Text variant="caption" color="textMuted" style={styles.fieldHelper}>
              Used for regional features and leaderboards
            </Text>
            <TouchableOpacity
              style={[
                styles.countrySelector,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text 
                style={[
                  styles.countrySelectorText,
                  { color: formData.country ? theme.colors.text : theme.colors.textMuted }
                ]}
              >
                {formData.country ? `${formData.country} - ${getCountryName(formData.country)}` : 'Select your country...'}
              </Text>
              <Text style={[styles.countrySelectorArrow, { color: theme.colors.textMuted }]}>
                ▼
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { 
                backgroundColor: isFormValid() ? theme.colors.primary : theme.colors.disabled,
                borderColor: isFormValid() ? theme.colors.primary : theme.colors.border,
                opacity: saving ? 0.7 : 1,
              }
            ]}
            onPress={handleSave}
            disabled={!isFormValid() || saving}
          >
            <Text 
              variant="body" 
              weight="bold" 
              style={{ 
                color: isFormValid() ? theme.colors.textOnPrimary : theme.colors.textMuted 
              }}
            >
              {saving ? 'Setting up account...' : 'Complete Setup'}
            </Text>
          </TouchableOpacity>
        </View>
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
                Select Country
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
  headerContainer: {
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  formContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    marginBottom: 4,
  },
  fieldHelper: {
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    fontSize: 16,
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
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
  },
  // Modal styles (same as ProfileScreen)
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
});