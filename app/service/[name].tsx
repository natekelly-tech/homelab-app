import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { MetricRow } from '@/components/MetricRow';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Colors,
  Radius,
  Spacing,
  Typography,
  statusColor,
  statusSubtleColor,
} from '@/constants/theme';
import { getBackendUrl } from '@/src/storage/backend';

// ---------- Types ----------

type ServiceStatus = 'up' | 'down' | 'degraded';

interface ServiceResult {
  name: string;
  status: ServiceStatus;
  type: string;
  response_time_ms: number;
  status_code: number;
  target: string;
}

interface StatusResponse {
  up: number;
  down: number;
  total: number;
  results?: ServiceResult[];
  services?: ServiceResult[];
}

// ---------- Screen ----------

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const serviceName = safeDecode(name ?? '');

  const [service, setService] = useState<ServiceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchService = useCallback(async () => {
    try {
      setError(null);
      const backendUrl = await getBackendUrl();
      const response = await fetch(`${backendUrl}/status`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: StatusResponse = await response.json();
      const list = data.results ?? data.services ?? [];
      const match = list.find((s) => s.name === serviceName);
      if (!match) {
        throw new Error(`Service "${serviceName}" not found in backend response`);
      }
      setService(match);
      setLastChecked(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [serviceName]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchService();
  }, [fetchService]);

  // Deterministic mock history seeded from service name.
  // Same service always shows same numbers.
  // Replace with real /history data in backend Phase 8.
  const mock = useMemo(() => generateMockHistory(serviceName), [serviceName]);

  // ---------- Loading state ----------

  if (loading && !service) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Loading..." onBack={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Error state ----------

  if (error && !service) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title={serviceName} onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Could not load service</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              fetchService();
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!service) return null;

  // ---------- Main render ----------

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title={service.name} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Hero status block — live data */}
        <Card accent={statusColor(service.status)}>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>CURRENT STATUS</Text>
              <Text style={[styles.heroStatus, { color: statusColor(service.status) }]}>
                {service.status.toUpperCase()}
              </Text>
              <Text style={styles.heroSub}>{service.response_time_ms} ms response</Text>
            </View>
            <StatusBadge status={service.status} />
          </View>
          {lastChecked && (
            <Text style={styles.lastChecked}>
              Last checked {lastChecked.toLocaleTimeString()}
            </Text>
          )}
        </Card>

        {/* Live operational data */}
        <SectionHeader title="Live Data" badge="LIVE" />
        <Card>
          <MetricRow label="Target" value={service.target} />
          <MetricRow label="Check type" value={service.type.toUpperCase()} />
          <MetricRow label="HTTP status" value={String(service.status_code)} />
          <MetricRow label="Response time" value={`${service.response_time_ms} ms`} />
        </Card>

        {/* Mocked historical data */}
        <SectionHeader title="Historical" badge="MOCKED" />
        <Text style={styles.mockedNote}>
          Historical data is placeholder. Live history requires GET /history endpoint
          planned for backend Phase 8.
        </Text>

        <Card>
          <Text style={styles.cardTitle}>Uptime</Text>
          <View style={styles.uptimeRow}>
            <UptimeCell label="24 hours" value={mock.uptime24h} />
            <UptimeCell label="7 days" value={mock.uptime7d} />
            <UptimeCell label="30 days" value={mock.uptime30d} />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Response time — last 24 samples</Text>
          <Sparkline samples={mock.samples} maxValue={mock.maxSample} />
          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>min {mock.minSample} ms</Text>
            <Text style={styles.chartFooterText}>avg {mock.avgSample} ms</Text>
            <Text style={styles.chartFooterText}>max {mock.maxSample} ms</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <MetricRow label="Last success" value={mock.lastSuccess} />
          <MetricRow label="Last failure" value={mock.lastFailure} />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Incident History</Text>
          {mock.incidents.map((inc, idx) => (
            <View
              key={idx}
              style={[styles.incidentRow, idx > 0 && styles.incidentRowBorder]}
            >
              <View
                style={[
                  styles.incidentDot,
                  { backgroundColor: statusColor(inc.severity) },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.incidentText}>{inc.summary}</Text>
                <Text style={styles.incidentTime}>{inc.when}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Sub-components ----------

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
        <Text style={styles.backText}>{'\u2039'} Back</Text>
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      {/* Spacer matches backButton width so title stays centered */}
      <View style={styles.headerSpacer} />
    </View>
  );
}

function SectionHeader({ title, badge }: { title: string; badge: 'LIVE' | 'MOCKED' }) {
  const isLive = badge === 'LIVE';
  const color = isLive ? Colors.statusUp : Colors.statusDegraded;
  const bg = statusSubtleColor(isLive ? 'up' : 'degraded');
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.sectionBadge, { borderColor: color, backgroundColor: bg }]}>
        <Text style={[styles.sectionBadgeText, { color }]}>{badge}</Text>
      </View>
    </View>
  );
}

function UptimeCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.uptimeCell}>
      <Text style={styles.uptimeValue}>{value}</Text>
      <Text style={styles.uptimeLabel}>{label}</Text>
    </View>
  );
}

function Sparkline({ samples, maxValue }: { samples: number[]; maxValue: number }) {
  const chartHeight = 80;
  return (
    <View style={[styles.sparkline, { height: chartHeight }]}>
      {samples.map((v, i) => {
        const barHeight = Math.max(6, (v / maxValue) * chartHeight);
        return (
          <View key={i} style={[styles.sparkBar, { height: barHeight }]} />
        );
      })}
    </View>
  );
}

// ---------- Helpers ----------

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

interface MockHistory {
  uptime24h: string;
  uptime7d: string;
  uptime30d: string;
  samples: number[];
  minSample: number;
  avgSample: number;
  maxSample: number;
  lastSuccess: string;
  lastFailure: string;
  incidents: { summary: string; when: string; severity: ServiceStatus }[];
}

function generateMockHistory(seed: string): MockHistory {
  // Deterministic PRNG seeded by service name characters.
  // Produces stable numbers that differ per service.
  const seedNum = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 1);
  const rand = (n: number) =>
    ((seedNum * (n + 7) * 9301 + 49297) % 233280) / 233280;

  const samples = Array.from({ length: 24 }, (_, i) =>
    Math.round(80 + rand(i) * 140)
  );
  const minSample = Math.min(...samples);
  const maxSample = Math.max(...samples);
  const avgSample = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);

  return {
    uptime24h: '99.98%',
    uptime7d: '99.91%',
    uptime30d: '99.84%',
    samples,
    minSample,
    avgSample,
    maxSample,
    lastSuccess: 'Just now',
    lastFailure: '3 days ago',
    incidents: [
      {
        summary: 'Brief connection timeout',
        when: '3 days ago, 14:22 UTC',
        severity: 'degraded',
      },
      {
        summary: 'Elevated response times',
        when: '11 days ago, 09:15 UTC',
        severity: 'degraded',
      },
      {
        summary: 'Service unreachable for 4 minutes',
        when: '24 days ago, 02:48 UTC',
        severity: 'down',
      },
    ],
  };
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.md, gap: Spacing.md },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { paddingVertical: Spacing.xs, paddingRight: Spacing.sm, width: 60 },
  backText: { color: Colors.accent, fontSize: 16, fontWeight: Typography.weightMedium },
  headerTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.sizeHeading,
    fontWeight: Typography.weightBold,
    textAlign: 'center',
  },
  headerSpacer: { width: 60 },

  // Hero block
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sizeCaption,
    letterSpacing: 1.2,
    marginBottom: Spacing.xs,
  },
  heroStatus: { fontSize: 32, fontWeight: Typography.weightBold, letterSpacing: 1 },
  heroSub: { color: Colors.textSecondary, fontSize: Typography.sizeBody, marginTop: Spacing.xs },
  lastChecked: { marginTop: Spacing.sm, color: Colors.textSecondary, fontSize: Typography.sizeCaption },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: -Spacing.xs,
  },
  sectionTitle: { color: Colors.textPrimary, fontSize: Typography.sizeLabel, fontWeight: Typography.weightBold },
  sectionBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  sectionBadgeText: { fontSize: 10, fontWeight: Typography.weightBold, letterSpacing: 0.8 },
  mockedNote: {
    color: Colors.textSecondary,
    fontSize: Typography.sizeCaption,
    fontStyle: 'italic',
    marginBottom: -Spacing.xs,
  },

  // Cards
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.sizeLabel,
    fontWeight: Typography.weightMedium,
    marginBottom: Spacing.sm,
  },

  // Uptime
  uptimeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  uptimeCell: { flex: 1, alignItems: 'center' },
  uptimeValue: {
    color: Colors.statusUp,
    fontSize: 20,
    fontWeight: Typography.weightBold,
    fontVariant: ['tabular-nums'],
  },
  uptimeLabel: { color: Colors.textSecondary, fontSize: Typography.sizeCaption, marginTop: 2 },

  // Sparkline
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginVertical: Spacing.sm,
  },
  sparkBar: {
    flex: 1,
    borderRadius: 2,
    backgroundColor: Colors.accent,
    opacity: 0.85,
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  chartFooterText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizeCaption,
    fontVariant: ['tabular-nums'],
  },

  // Incidents
  incidentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  incidentRowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  incidentDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  incidentText: { color: Colors.textPrimary, fontSize: Typography.sizeBody },
  incidentTime: { color: Colors.textSecondary, fontSize: Typography.sizeCaption, marginTop: 2 },

  // Error state
  errorText: {
    color: Colors.textPrimary,
    fontSize: Typography.sizeLabel,
    fontWeight: Typography.weightBold,
    marginBottom: Spacing.xs,
  },
  errorSubtext: {
    color: Colors.textSecondary,
    fontSize: Typography.sizeBody,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  retryText: { color: Colors.textInverted, fontWeight: Typography.weightBold },
});