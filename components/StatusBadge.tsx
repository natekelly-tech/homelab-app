/**
 * StatusBadge
 * Pill-shaped badge that displays a service status with a
 * pulsing dot and colour-coded background.
 *
 * This is the single source of truth for how status is
 * communicated visually. Use it everywhere — tiles, headers,
 * detail views, lists.
 *
 * Props:
 *   status   — raw status string from the API ('up', 'down', etc.)
 *   size     — 'sm' (list context) | 'md' (default) | 'lg' (detail view)
 *   showDot  — show the animated pulse dot (default true)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  statusColor,
  statusSubtleColor,
} from '../constants/theme';

type StatusBadgeProps = {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
};

export function StatusBadge({
  status,
  size = 'md',
  showDot = true,
}: StatusBadgeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isUp = status?.toLowerCase() === 'up' || status?.toLowerCase() === 'ok';

  // Pulse the dot only for healthy services — down/degraded are static
  useEffect(() => {
    if (!isUp || !showDot) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isUp, showDot, pulseAnim]);

  const color = statusColor(status);
  const bgColor = statusSubtleColor(status);
  const label = status?.toUpperCase() ?? 'UNKNOWN';

  const dotSize = size === 'sm' ? 6 : size === 'lg' ? 10 : 8;
  const fontSize =
    size === 'sm'
      ? Typography.sizeCaption
      : size === 'lg'
      ? Typography.sizeBody
      : Typography.sizeCaption;
  const paddingH = size === 'sm' ? Spacing.xs : Spacing.sm;
  const paddingV = size === 'sm' ? 2 : 4;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderColor: color + '40',
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
        },
      ]}
    >
      {showDot && (
        <Animated.View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: color,
              opacity: isUp ? pulseAnim : 1,
            },
          ]}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color,
            fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    gap: 5,
  },
  dot: {
    // size and borderRadius set inline above
  },
  label: {
    fontFamily: Typography.mono,
    fontWeight: Typography.weightBold,
    letterSpacing: 0.5,
  },
});
