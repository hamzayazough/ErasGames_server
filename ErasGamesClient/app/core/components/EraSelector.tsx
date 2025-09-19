import React from 'react';
import {StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {View, Text, Card} from '../../ui';
import {useTheme} from '../theme/ThemeProvider';
import {useAppStore} from '../state/appStore';
import {getAllEras, getEraInfo, EraName} from '../theme';

interface EraSelectorProps {
  onEraSelect?: (era: EraName) => void;
}

export function EraSelector({onEraSelect}: EraSelectorProps) {
  const theme = useTheme();
  const {currentEra, setCurrentEra} = useAppStore();
  const allEras = getAllEras();

  const handleEraSelect = (era: EraName) => {
    setCurrentEra(era);
    onEraSelect?.(era);
  };

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.title, {color: theme.colors.text}]}>
        ✨ Choose Your Era
      </Text>
      <Text variant="caption" style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
        Select a Taylor Swift era to customize your app theme
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {allEras.map((eraKey) => {
          const era = getEraInfo(eraKey);
          const isSelected = currentEra === eraKey;
          
          return (
            <TouchableOpacity
              key={eraKey}
              onPress={() => handleEraSelect(eraKey)}
              style={styles.eraCardTouchable}
            >
              <Card 
                style={[
                  styles.eraCard,
                  {
                    backgroundColor: era.colors.background,
                    borderColor: isSelected ? era.colors.primary : era.colors.border,
                    borderWidth: isSelected ? 3 : 1,
                  }
                ]}
              >
                <View style={styles.eraContent}>
                  {/* Era emoji and year */}
                  <View style={styles.eraHeader}>
                    <Text style={[styles.eraEmoji]}>{era.emoji}</Text>
                    <Text variant="caption" style={[styles.eraYear, {color: era.colors.textSecondary}]}>
                      {era.year}
                    </Text>
                  </View>
                  
                  {/* Era name */}
                  <Text variant="body" style={[styles.eraName, {color: era.colors.text}]}>
                    {era.name}
                  </Text>
                  
                  {/* Color preview */}
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorDot, {backgroundColor: era.colors.primary}]} />
                    <View style={[styles.colorDot, {backgroundColor: era.colors.accent1}]} />
                    <View style={[styles.colorDot, {backgroundColor: era.colors.accent2}]} />
                    <View style={[styles.colorDot, {backgroundColor: era.colors.accent3}]} />
                  </View>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <View style={[styles.selectedIndicator, {backgroundColor: era.colors.primary}]}>
                      <Text style={[styles.selectedText, {color: era.colors.textOnPrimary}]}>
                        ✓ Active
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    marginBottom: 4,
    paddingHorizontal: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  scrollView: {
    paddingLeft: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  eraCardTouchable: {
    marginRight: 12,
  },
  eraCard: {
    width: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eraContent: {
    padding: 12,
  },
  eraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eraEmoji: {
    fontSize: 24,
  },
  eraYear: {
    fontSize: 10,
    fontWeight: '500',
  },
  eraName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  colorPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  selectedIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  selectedText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});