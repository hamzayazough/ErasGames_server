import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../core/theme';

interface AnimatedLogoProps {
  size?: number;
}

export function AnimatedLogo({ size = 200 }: AnimatedLogoProps) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);
    };

    const loopAnimation = () => {
      createPulseAnimation().start(() => {
        // Add a small delay before repeating
        setTimeout(loopAnimation, 300);
      });
    };

    loopAnimation();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Image
        source={theme.assets.titleImage}
        style={[styles.logo, { width: size, height: size * 0.6 }]} // Maintain aspect ratio
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Shadow for better visibility on retro background
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});