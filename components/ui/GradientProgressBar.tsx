import { AppTheme, ProgressGradients } from "@/constants/AppTheme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface GradientProgressBarProps {
  progress: number; // 0-1
  allocated: number;
  spent: number;
  height?: number;
  showText?: boolean;
  style?: any;
}

export function GradientProgressBar({
  progress,
  allocated,
  spent,
  height = 8,
  showText = true,
  style,
}: GradientProgressBarProps) {
  const animatedProgress = useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: 500,
    });
  }, [progress, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(animatedProgress.value, [0, 1], [0, 100]);
    return {
      width: `${width}%`,
    };
  });

  const gradient = ProgressGradients.getGradient(progress);
  const percentage = Math.round(progress * 100);

  return (
    <View style={[styles.container, style]}>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.amountText}>
            €{spent.toFixed(1)} / €{allocated.toFixed(1)}
          </Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      )}

      <View style={[styles.progressContainer, { height }]}>
        <View style={[styles.progressTrack, { height }]} />
        <Animated.View style={[styles.progressFill, animatedStyle, { height }]}>
          <LinearGradient
            colors={gradient.colors as any}
            start={gradient.start}
            end={gradient.end}
            style={[styles.gradient, { height }]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: AppTheme.spacing.sm,
  },
  amountText: {
    fontSize: AppTheme.typography.fontSize.sm,
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.textSecondary,
  },
  percentageText: {
    fontSize: AppTheme.typography.fontSize.sm,
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  progressContainer: {
    position: "relative",
    width: "100%",
    borderRadius: AppTheme.borderRadius.full,
    overflow: "hidden",
  },
  progressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: AppTheme.colors.backgroundSecondary,
    borderRadius: AppTheme.borderRadius.full,
  },
  progressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: AppTheme.borderRadius.full,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    borderRadius: AppTheme.borderRadius.full,
  },
});
