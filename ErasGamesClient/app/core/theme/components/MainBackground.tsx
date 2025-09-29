import React, {useMemo} from 'react';
import {View, StyleSheet, ImageBackground} from 'react-native';
import {useTheme} from '../ThemeProvider';

interface MainBackgroundProps {
  children?: React.ReactNode;
  style?: any;
}

export function MainBackground({children, style}: MainBackgroundProps) {
  const theme = useTheme();

  // Generate static sparkle positions for magical effect
  const sparkles = useMemo(() => {
    const sparkleArray = [];
    for (let i = 0; i < 50; i++) { // Fewer sparkles for more subtle effect
      sparkleArray.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 2, // Random size between 2-5 (slightly larger)
        opacity: Math.random() * 0.6 + 0.3, // Random opacity between 0.3-0.9
        color: i % 5 === 0 ? theme.colors.sparkle1 : 
               i % 5 === 1 ? theme.colors.sparkle2 : 
               i % 5 === 2 ? theme.colors.sparkle3 : 
               i % 5 === 3 ? theme.colors.sparkle4 : theme.colors.sparkle5,
        animationDelay: Math.random() * 3, // Random animation delay
      });
    }
    return sparkleArray;
  }, [theme.colors]);

  return (
    <ImageBackground
      source={require('../../../assets/images/main-erasgames-background.png')}
      style={[styles.container, style]}
      resizeMode="cover"
    >
      {/* Magical sparkle overlay */}
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
      
      {/* Gradient overlay for better content readability */}
      <View style={[styles.gradientOverlay, {
        backgroundColor: theme.colors.dreamMist
      }]} />
      
      {/* Content */}
      {children}
    </ImageBackground>
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
    shadowColor: '#FFFFE0', // Pale yellow glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3, // Subtle overlay
  },
});