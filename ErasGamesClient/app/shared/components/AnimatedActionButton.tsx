import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Easing } from 'react-native';
import { Text } from '../../ui/Text';
import { useTheme } from '../../core/theme';

interface AnimatedActionButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}

export const AnimatedActionButton: React.FC<AnimatedActionButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style
}) => {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!disabled) {
      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1),
            useNativeDriver: true,
          }),
        ])
      );

      // Glow animation
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1),
            useNativeDriver: false,
          }),
        ])
      );

      // Bounce entrance animation
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();

      pulseAnimation.start();
      glowAnimation.start();

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
      };
    }
  }, [disabled, pulseAnim, glowAnim, bounceAnim]);

  const animatedGlowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const animatedGlowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            { scale: bounceAnim }
          ]
        },
        style
      ]}
    >
      {/* Animated Glow Effect */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            backgroundColor: theme.colors.primary,
            opacity: animatedGlowOpacity,
            transform: [{ scale: animatedGlowScale }],
          },
        ]}
      />
      
      {/* Main Button */}
      <Animated.View
        style={[
          {
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            }
          ]}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.9}
        >
          <Text style={[styles.buttonText, { color: theme.colors.textOnPrimary }]}>
            {title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 280,
    height: 70,
    borderRadius: 35,
    opacity: 0.3,
  },
  button: {
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 35,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    minWidth: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default AnimatedActionButton;