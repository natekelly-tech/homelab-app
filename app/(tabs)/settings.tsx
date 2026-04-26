/**
 * app/(tabs)/settings.tsx
 * LabWatch — Settings Screen
 */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  getBackendUrl,
  resetBackendUrl,
  DEFAULT_BACKEND_URL,
} from '../../src/storage/backend'
import {
  Colors,
  Typography,
  Spacing,
  Radius,
} from '../../constants/theme'

export default function SettingsScreen() {
  const [savedUrl, setSavedUrl] = useState('')
  const router = useRouter()

  useEffect(() => {
    getBackendUrl().then((u) => {
      setSavedUrl(u);
    });
  }, []);

  const reset = async () => {
    await resetBackendUrl();
    await AsyncStorage.removeItem('labwatch:has_onboarded');
    setSavedUrl(DEFAULT_BACKEND_URL);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.screenTitle}>Settings</Text>

{/* Backends nav */}
<Text style={styles.sectionLabel}>BACKENDS</Text>
<TouchableOpacity
  style={[styles.card, styles.navRow]}
  onPress={() => router.push('/backends')}
  activeOpacity={0.7}
>
  <Text style={styles.infoLabel}>Manage Backends</Text>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
    <Text style={styles.infoValue} numberOfLines={1}>{savedUrl}</Text>
    <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
  </View>
</TouchableOpacity>


        {/* Active backend info */}
        <Text style={styles.sectionLabel}>ACTIVE</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current backend</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{savedUrl}</Text>
          </View>
          <TouchableOpacity onPress={reset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset to default</Text>
          </TouchableOpacity>
        </View>

        {/* About section */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App version</Text>
            <Text style={styles.infoValue}>0.1.0</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>API contract</Text>
            <Text style={styles.infoValue}>v1.0</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>Default backend</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{DEFAULT_BACKEND_URL}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    letterSpacing: -0.5,
  },
  sectionLabel: {
    fontSize: Typography.sizeCaption,
    color: Colors.textSecondary,
    fontWeight: Typography.weightBold,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoLabel: {
    fontSize: Typography.sizeBody,
    color: Colors.textPrimary,
  },
  infoValue: {
    fontSize: Typography.sizeCaption,
    color: Colors.textSecondary,
    fontFamily: Typography.mono,
    maxWidth: '60%',
    textAlign: 'right',
  },
  resetButton: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  resetButtonText: {
    color: Colors.statusDown,
    fontSize: Typography.sizeBody,
    textAlign: 'center',
  },
  navRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: Spacing.md,
  },
})