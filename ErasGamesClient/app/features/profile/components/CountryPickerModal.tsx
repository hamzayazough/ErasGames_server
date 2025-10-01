import React from 'react';
import { Modal, TouchableOpacity, TextInput, FlatList, StyleSheet, Text as RNText } from 'react-native';
import { View, Text } from '../../../ui';
import { useTheme } from '../../../core/theme';
import { COUNTRY_CODES, Country } from './CountryCodes';

interface CountryPickerModalProps {
  visible: boolean;
  selectedCountry: string;
  searchQuery: string;
  onClose: () => void;
  onSearchChange: (query: string) => void;
  onCountrySelect: (countryCode: string) => void;
}

export default function CountryPickerModal({
  visible,
  selectedCountry,
  searchQuery,
  onClose,
  onSearchChange,
  onCountrySelect,
}: CountryPickerModalProps) {
  const theme = useTheme();

  const getFilteredCountries = (): Country[] => {
    if (!searchQuery || !searchQuery.trim()) {
      return COUNTRY_CODES;
    }
    
    const query = searchQuery.toLowerCase();
    return COUNTRY_CODES.filter(country => 
      country.code.toLowerCase().includes(query) ||
      country.name.toLowerCase().includes(query)
    );
  };

  const filteredCountries = getFilteredCountries();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text variant="h3" weight="bold" color="text">
              Select Country ({filteredCountries.length})
            </Text>
            <TouchableOpacity
              onPress={onClose}
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
              value={searchQuery}
              onChangeText={onSearchChange}
              autoFocus={true}
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  { 
                    backgroundColor: selectedCountry === item.code ? theme.colors.accent : 'transparent',
                    borderBottomColor: theme.colors.border 
                  }
                ]}
                onPress={() => onCountrySelect(item.code)}
              >
                <View style={styles.countryItemLeft}>
                  <RNText style={[
                    styles.countryCode, 
                    { 
                      color: selectedCountry === item.code ? '#FFFFFF' : theme.colors.text,
                      fontWeight: '600'
                    }
                  ]}>
                    {item.code}
                  </RNText>
                  <RNText style={[
                    styles.countryName, 
                    { 
                      color: selectedCountry === item.code ? '#FFFFFF' : theme.colors.text,
                      opacity: selectedCountry === item.code ? 0.9 : 0.7
                    }
                  ]}>
                    {item.name}
                  </RNText>
                </View>
                {selectedCountry === item.code && (
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
  );
}

const styles = StyleSheet.create({
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