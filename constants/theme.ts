/**
 * LabWatch Design System
 * Auxcon Technologies
 *
 * Replaces the Expo template color tokens entirely.
 * All UI components pull from this file — never hardcode colors.
 *
 * Aesthetic: industrial dark, ops-grade, Grafana/Datadog reference.
 * Color is used for status signal only — not decoration.
 */

export const Colors = {
  // ── Backgrounds ──────────────────────────────────────────────
  /** Primary app background. Nearly black, slight blue tint. */
  bg: '#0A0C10',

  /** Card / surface background. Lifted one step above bg. */
  surface: '#141820',

  /** Modal, popover, input background. */
  surfaceElevated: '#1A2030',

  // ── Borders ───────────────────────────────────────────────────
  /** Default border. Subtle rule between surface and bg. */
  border: '#1E2430',

  /** Active / focused border. Used on selected inputs and tiles. */
  borderActive: '#00D4FF40', // accent at 25% opacity

  // ── Accent ────────────────────────────────────────────────────
  /** Primary interactive accent. Buttons, links, active tabs, logo. */
  accent: '#00D4FF',

  /** Accent at reduced opacity for backgrounds/glows. */
  accentSubtle: '#00D4FF1A', // 10% opacity

  // ── Status ────────────────────────────────────────────────────
  /** Service is reachable and within normal latency. */
  statusUp: '#00C48C',
  statusUpSubtle: '#00C48C1A',

  /** Service is reachable but latency is elevated. */
  statusDegraded: '#FFB020',
  statusDegradedSubtle: '#FFB0201A',

  /** Service is unreachable. */
  statusDown: '#FF4D4D',
  statusDownSubtle: '#FF4D4D1A',

  /** Status unknown — no check has completed yet. */
  statusUnknown: '#4A5568',
  statusUnknownSubtle: '#4A55681A',

  // ── Text ──────────────────────────────────────────────────────
  /** Primary text. Screen titles, service names, key values. */
  textPrimary: '#F0F4F8',

  /** Secondary text. Labels, timestamps, helper copy. */
  textSecondary: '#8892A4',

  /** Disabled / placeholder text. */
  textDisabled: '#3D4A5C',

  /** Inverted text. Used on accent-colored buttons. */
  textInverted: '#0A0C10',
} as const;

export const Typography = {
  // ── Font families ─────────────────────────────────────────────
  /**
   * Data / monospace.
   * Used for: response times, IP addresses, version strings, uptime %.
   * Ops people expect metrics to look like terminal output.
   */
  mono: 'Courier New',

  /**
   * UI sans-serif.
   * Platform default condensed sans — avoid Inter/Roboto generic feel.
   * On Android this resolves to Roboto Condensed; on iOS to SF Pro.
   */
  sans: undefined, // undefined = system default, which is fine for RN

  // ── Scale ─────────────────────────────────────────────────────
  /** Screen titles, section headers. */
  sizeHeading: 20,

  /** Card / tile headers. Service names. */
  sizeLabel: 14,

  /** Body values, metric readings. */
  sizeBody: 13,

  /** Timestamps, units, secondary metadata. */
  sizeCaption: 11,

  // ── Weights ───────────────────────────────────────────────────
  weightBold: '700' as const,
  weightMedium: '500' as const,
  weightRegular: '400' as const,
} as const;

export const Spacing = {
  /** 4px base unit */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 24px */
  xl: 24,
  /** 32px */
  xxl: 32,
} as const;

export const Radius = {
  /** Input fields, small elements */
  sm: 6,
  /** Cards, tiles */
  md: 10,
  /** Modals, sheets */
  lg: 16,
  /** Pills, badges */
  pill: 100,
} as const;

/**
 * Derive a status color from a service status string.
 * Centralises the mapping so every component stays in sync.
 */
export function statusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'up':
    case 'ok':
    case 'healthy':
      return Colors.statusUp;
    case 'degraded':
    case 'slow':
    case 'warning':
      return Colors.statusDegraded;
    case 'down':
    case 'error':
    case 'unreachable':
      return Colors.statusDown;
    default:
      return Colors.statusUnknown;
  }
}

export function statusSubtleColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'up':
    case 'ok':
    case 'healthy':
      return Colors.statusUpSubtle;
    case 'degraded':
    case 'slow':
    case 'warning':
      return Colors.statusDegradedSubtle;
    case 'down':
    case 'error':
    case 'unreachable':
      return Colors.statusDownSubtle;
    default:
      return Colors.statusUnknownSubtle;
  }
}
