/**
 * Card
 * Base surface primitive. Every tile, panel, and list item in
 * LabWatch is a Card. Nothing lives on raw bg directly.
 *
 * Props:
 *   children   — content
 *   style      — optional additional ViewStyle overrides
 *   onPress    — if provided, card becomes tappable (TouchableOpacity)
 *   accent     — optional left-edge accent bar color (for status tiles)
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  /** Left-edge color bar. Pass a Colors.status* value. */
  accent?: string;
};

export function Card({ children, style, onPress, accent }: CardProps) {
  const content = (
    <View style={[styles.card, style]}>
      {accent ? (
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
      ) : null}
      <View style={styles.inner}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={styles.touchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  touchable: {
    // Ensure the tappable area is the full card, not just inner content
    borderRadius: Radius.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
    // height fills the card automatically via flexbox
  },
  inner: {
    flex: 1,
    padding: Spacing.md,
  },
});
