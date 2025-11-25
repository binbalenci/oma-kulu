import { AppTheme } from '@/app/constants/AppTheme';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

// Custom Web-Compatible Spinner
const CustomSpinner: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear
      }),
      -1, // Infinite repeats
      false // Don't reverse
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.spinnerContainer, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderColor: color,
            borderTopColor: 'transparent',
          },
          animatedStyle
        ]}
      />
    </View>
  );
};

interface LoadingSpinnerProps {
  size?: 'small' | 'large' | number;
  message?: string;
  fullScreen?: boolean;
  color?: string;
  style?: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  message,
  fullScreen = false,
  color,
  style,
}) => {
  const spinnerColor = color || AppTheme.colors.primary;
  const spinnerSize = typeof size === 'string'
    ? (size === 'large' ? 24 : 16)
    : size;

  const containerStyle = fullScreen
    ? [styles.fullScreenContainer, style]
    : [styles.container, style];

  return (
    <View style={containerStyle}>
      {Platform.OS === 'web' ? (
        <CustomSpinner size={spinnerSize} color={spinnerColor} />
      ) : (
        <ActivityIndicator
          size={size}
          color={spinnerColor}
          animating={true}
        />
      )}
      {message && (
        <Text style={[styles.message, { color: AppTheme.colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: AppTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: AppTheme.spacing.xl,
  },
  message: {
    marginTop: AppTheme.spacing.md,
    fontSize: AppTheme.typography.fontSize.sm,
    textAlign: 'center',
    fontWeight: AppTheme.typography.fontWeight.medium,
  },
  // Custom spinner styles
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderWidth: 2,
    borderRadius: 9999,
    borderTopColor: 'transparent',
  },
});
