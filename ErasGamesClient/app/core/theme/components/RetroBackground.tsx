import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../ThemeProvider';

interface RetroBackgroundProps {
  children?: React.ReactNode;
  style?: any;
}

export function RetroBackground({children, style}: RetroBackgroundProps) {
  const theme = useTheme();

  // Generate static sparkle positions (only once using useMemo)
  const sparkles = useMemo(() => {
    const sparkleArray = [];
    for (let i = 0; i < 800; i++) {
      sparkleArray.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 1 + 1, // Random size between 1-2
        opacity: Math.random() * 0.8 + 0.2, // Random opacity between 0.2-1
        color: i % 4 === 0 ? theme.colors.glitter1 : 
               i % 4 === 1 ? theme.colors.glitter2 : 
               i % 4 === 2 ? theme.colors.glitter3 : theme.colors.accent2
      });
    }
    return sparkleArray;
  }, [theme.colors]); // Regenerate if theme colors change

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      {/* Sparkle Background */}
      <View style={styles.sparkleContainer}>
        {sparkles.map((sparkle) => (
          <View
            key={sparkle.id}
            style={[
              styles.sparkle,
              {
                left: sparkle.left,
                top: sparkle.top,
                width: sparkle.size,
                height: sparkle.size,
                borderRadius: sparkle.size / 2,
                opacity: sparkle.opacity,
                backgroundColor: sparkle.color,
              }
            ]}
          />
        ))}
      </View>
      
      {/* Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  sparkle: {
    position: 'absolute',
    shadowColor: '#F5E6B3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
});