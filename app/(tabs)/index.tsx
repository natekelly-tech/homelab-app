/**
 * app/(tabs)/index.tsx
 * LabWatch — Dashboard Screen
 *
 * The only production-grade screen that existed before the pivot.
 * Rewired to use the LabWatch design system (theme.ts + primitives).
 * Functional logic is unchanged — URL is still hardcoded on line ~30.
 * Step A of the pivot roadmap (AsyncStorage + Settings screen) will
 * replace the hardcoded URL with a user-configurable value.
 *
 * Steps A and C complete. AsyncStorage backend storage, Settings screen,
 * configurable backend URL, and onboarding flow all wired up.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBackendUrl, DEFAULT_BACKEND_URL } from '../../src/storage/backend';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { MetricRow } from '../../components/MetricRow';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  statusColor,
} from '../../constants/theme';

// ─── TODO Step A ────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 30_000;
// ────────────────────────────────────────────────────────────────────────────

type Service = {
  name: string;
  status: string;
  type: string;
  response_time_ms?: number;
  target?: string;
  last_checked?: string;
};

type FetchState = 'idle' | 'loading' | 'refreshing' | 'error';

export default function DashboardScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_BACKEND_URL);

  const fetchServices = useCallback(async (isRefresh = false, url = apiUrl) => {
    if (!isRefresh) setFetchState('loading');
    else setFetchState('refreshing');

    try {
      const res = await fetch(`${url}/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // API returns either an array directly or { services: [...] }
      const list: Service[] = Array.isArray(data) ? data : data.results ?? data.services ?? [];
      setServices(list);
      setErrorMessage(null);
      setFetchState('idle');
      setLastUpdated(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Could not reach the API');
      setFetchState('error');
    }
  }, []);

  // Initial load
  useEffect(() => {
  getBackendUrl().then((url) => {
    setApiUrl(url);
    fetchServices(false, url);
  });
}, []);

  // Polling
  useEffect(() => {
    const timer = setInterval(() => fetchServices(false, apiUrl), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchServices]);

  // ── Derived stats for the header ──────────────────────────────
  const upCount = services.filter(
    (s) => s.status?.toLowerCase() === 'up' || s.status?.toLowerCase() === 'ok'
  ).length;
  const downCount = services.filter(
    (s) => s.status?.toLowerCase() === 'down' || s.status?.toLowerCase() === 'error'
  ).length;
  const totalCount = services.length;

  // ── Render helpers ────────────────────────────────────────────
  const renderService = ({ item }: { item: Service }) => {
    const color = statusColor(item.status);
    return (
      <Card
        accent={color}
        style={styles.serviceCard}
        // Step D of roadmap: onPress navigates to service detail view
        // onPress={() => router.push(`/service/${item.name}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {item.name}
          </Text>
          <StatusBadge status={item.status} size="sm" />
        </View>

        <View style={styles.cardMetrics}>
          <MetricRow
            label="Type"
            value={item.type?.toUpperCase() ?? '—'}
          />
          {item.response_time_ms != null && (
            <MetricRow
              label="Response"
              value={`${item.response_time_ms} ms`}
              valueColor={color}
            />
          )}
          {item.target && (
            <MetricRow
              label="Target"
              value={item.target}
              mono={false}
            />
          )}
          {item.last_checked && (
            <MetricRow
              label="Checked"
              value={item.last_checked}
            />
          )}
        </View>
      </Card>
    );
  };

  const renderHeader = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerTop}>
      <View>
        <View style={styles.wordmark}>
          <Text style={styles.wordmarkPrimary}>Lab</Text>
          <Text style={styles.wordmarkAccent}>Watch</Text>
        </View>
        <Text style={styles.backendLabel}>{apiUrl}</Text>
      </View>
      <TouchableOpacity style={styles.gearButton} onPress={() => router.push('/(tabs)/settings')}>
        <Text style={styles.gearIcon}>⚙</Text>
      </TouchableOpacity>
    </View>

    {fetchState !== 'loading' && services.length > 0 && (
      <View style={styles.summaryStrip}>
        <SummaryPill count={upCount} label="UP" color={Colors.statusUp} />
        {downCount > 0 && (
          <SummaryPill count={downCount} label="DOWN" color={Colors.statusDown} />
        )}
        <SummaryPill count={totalCount} label="TOTAL" color={Colors.textSecondary} />
        {lastUpdated && (
          <Text style={styles.lastUpdated}>Updated {lastUpdated}</Text>
        )}
      </View>
    )}
  </View>
);

  const renderEmpty = () => {
    if (fetchState === 'loading') {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator color={Colors.accent} size="large" />
          <Text style={styles.emptyStateText}>Connecting to backend...</Text>
        </View>
      );
    }
    if (fetchState === 'error') {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.errorTitle}>Connection failed</Text>
          <Text style={styles.errorBody}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchServices()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No services returned.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <FlatList
        data={services}
        keyExtractor={(item) => item.name}
        renderItem={renderService}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={fetchState === 'refreshing'}
            onRefresh={() => fetchServices(true)}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
      />

      {/* Manual refresh button in bottom-right corner */}
      {fetchState !== 'loading' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => fetchServices(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>↻</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryPill({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.summaryPill}>
      <Text style={[styles.summaryCount, { color }]}>{count}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl + 64, // clear the FAB
  },

  // Header
  headerContainer: {
  paddingTop: Spacing.xxl,
  paddingBottom: Spacing.lg,
},
headerTop: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: Spacing.md,
},
wordmark: {
  flexDirection: 'row',
  alignItems: 'baseline',
  marginBottom: 2,
},
wordmarkPrimary: {
  fontSize: 32,
  fontWeight: Typography.weightBold,
  color: Colors.textPrimary,
  letterSpacing: -0.5,
},
wordmarkAccent: {
  fontSize: 32,
  fontWeight: Typography.weightBold,
  color: Colors.accent,
  letterSpacing: -0.5,
},
backendLabel: {
  fontSize: Typography.sizeCaption,
  color: Colors.textSecondary,
  fontFamily: Typography.mono,
},
gearButton: {
  backgroundColor: Colors.surface,
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: Radius.sm,
  padding: Spacing.sm,
},
gearIcon: {
  fontSize: 18,
  color: Colors.textSecondary,
},
summaryStrip: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.md,
  flexWrap: 'wrap',
},
summaryPill: {
  flexDirection: 'row',
  alignItems: 'baseline',
  gap: 4,
},
summaryCount: {
  fontSize: 22,
  fontWeight: Typography.weightBold,
  fontFamily: Typography.mono,
},
summaryLabel: {
  fontSize: Typography.sizeCaption,
  color: Colors.textSecondary,
  fontWeight: Typography.weightMedium,
  letterSpacing: 0.5,
},
lastUpdated: {
  fontSize: Typography.sizeCaption,
  color: Colors.textDisabled,
  fontFamily: Typography.mono,
  marginLeft: 'auto',
},

  // Service cards
  serviceCard: {
    // no extra style needed — Card handles padding and border
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  serviceName: {
    fontSize: Typography.sizeLabel,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardMetrics: {
    gap: 0,
  },
  separator: {
    height: Spacing.sm,
  },

  // Empty / error states
  emptyState: {
    paddingTop: Spacing.xxl * 2,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyStateText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizeBody,
  },
  errorTitle: {
    color: Colors.statusDown,
    fontSize: Typography.sizeLabel,
    fontWeight: Typography.weightBold,
  },
  errorBody: {
    color: Colors.textSecondary,
    fontSize: Typography.sizeBody,
    fontFamily: Typography.mono,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  retryButtonText: {
    color: Colors.accent,
    fontSize: Typography.sizeBody,
    fontWeight: Typography.weightMedium,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabIcon: {
    color: Colors.textInverted,
    fontSize: 22,
    fontWeight: Typography.weightBold,
  },
});
