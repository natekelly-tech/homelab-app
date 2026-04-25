/**
 * MetricRow
 * A key/value pair row used inside cards.
 * Used for: response time, check type, target URL, last checked,
 * uptime %, and any other labelled data field.
 *
 * The value is always rendered in monospace — ops data should look
 * like terminal output.
 *
 * Props:
 *   label      — field name (e.g. "Response time")
 *   value      — field value (e.g. "142 ms")
 *   valueColor — optional override for the value text color
 *                (use statusColor() for status-linked values)
 *   mono       — default true. Set false for prose values like URLs.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';

type MetricRowProps = {
  label: string;
  value: string | number;
  valueColor?: string;
  mono?: boolean;
};

export function MetricRow({
  label,
  value,
  valueColor,
  mono = true,
}: MetricRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          mono && styles.valueMono,
          valueColor ? { color: valueColor } : null,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.sizeCaption,
    fontWeight: Typography.weightRegular,
    flex: 1,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: Typography.sizeBody,
    fontWeight: Typography.weightMedium,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: Spacing.sm,
  },
  valueMono: {
    fontFamily: Typography.mono,
  },
});
