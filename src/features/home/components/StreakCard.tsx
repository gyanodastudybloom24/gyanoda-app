import { useCallback, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { customAlert } from '@/components/ui';
import { Fonts, Palette, Rounded, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { triggerHaptic } from '@/utils';

export type StreakFilter = 'Daily' | 'Week' | 'Month' | 'Year';

interface ChartItem {
  label: string;
  value: string;
  subtitle: string;
}

interface FilterConfig {
  items: ChartItem[];
  defaultIndex: number;
}

const FILTER_DATA: Record<StreakFilter, FilterConfig> = {
  Daily: {
    items: [
      { label: 'Mon', value: '+14%', subtitle: '35 mins studied' },
      { label: 'Tue', value: '+18%', subtitle: '40 mins studied' },
      { label: 'Wed', value: '+22%', subtitle: '45 mins studied' },
      { label: 'Thu', value: '+19%', subtitle: '38 mins studied' },
      { label: 'Fri', value: '+26%', subtitle: '50 mins studied' },
      { label: 'Sat', value: '+32%', subtitle: '65 mins studied' },
      { label: 'Sun', value: '+28%', subtitle: '55 mins studied' },
    ],
    defaultIndex: 6, // Sunday (Today)
  },
  Week: {
    items: [
      { label: 'Week 1', value: '+12%', subtitle: '10.5 hrs studied' },
      { label: 'Week 2', value: '+16%', subtitle: '12.0 hrs studied' },
      { label: 'Week 3', value: '+20%', subtitle: '13.8 hrs studied' },
      { label: 'Week 4', value: '+24%', subtitle: '15.2 hrs studied' },
    ],
    defaultIndex: 2,
  },
  Month: {
    items: [
      { label: 'Jan', value: '+10%', subtitle: '16 lessons completed' },
      { label: 'Feb', value: '+14%', subtitle: '18 lessons completed' },
      { label: 'Mar', value: '+19%', subtitle: '21 lessons completed' },
      { label: 'Apr', value: '+22%', subtitle: '22 lessons completed' },
      { label: 'May', value: '+24%', subtitle: 'Recent Lessons: 24' },
      { label: 'Jun', value: '+20%', subtitle: '20 lessons completed' },
      { label: 'Jul', value: '+25%', subtitle: '25 lessons completed' },
      { label: 'Aug', value: '+29%', subtitle: '28 lessons completed' },
      { label: 'Sep', value: '+33%', subtitle: '31 lessons completed' },
      { label: 'Oct', value: '+36%', subtitle: '35 lessons completed' },
      { label: 'Nov', value: '+40%', subtitle: '38 lessons completed' },
      { label: 'Dec', value: '+45%', subtitle: '44 lessons completed' },
    ],
    defaultIndex: 4, // May
  },
  Year: {
    items: [
      { label: '2023', value: '+22%', subtitle: '135 study sessions' },
      { label: '2024', value: '+30%', subtitle: '158 study sessions' },
      { label: '2025', value: '+38%', subtitle: '175 study sessions' },
      { label: '2026', value: '+42%', subtitle: '194 study sessions' },
    ],
    defaultIndex: 3,
  },
};

function getCurveY1(t: number, t0: number, yBase: number): number {
  const dist = t - t0;
  const peak = 0.44 * Math.exp(-(dist * dist) / (2 * 0.11 * 0.11));
  const wave = 0.36 + 0.09 * Math.sin(2 * Math.PI * t) + 0.05 * Math.cos(4 * Math.PI * t);
  const normalizedHeight = Math.min(0.88, Math.max(0.15, wave + peak));
  return yBase * (1 - normalizedHeight);
}

function getCurveY2(t: number, t0: number, yBase: number): number {
  const dist = t - t0;
  const peak = 0.16 * Math.exp(-(dist * dist) / (2 * 0.15 * 0.15));
  const wave = 0.38 + 0.11 * Math.sin(2 * Math.PI * (t - 0.14));
  const normalizedHeight = Math.min(0.72, Math.max(0.12, wave + peak));
  return yBase * (1 - normalizedHeight);
}

function generateDynamicPath(
  curveFn: (t: number, t0: number, yBase: number) => number,
  t0: number,
  width: number,
  yBase: number,
): string {
  const steps = 70;
  let d = '';
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const x = t * width;
    const y = curveFn(t, t0, yBase);
    if (s === 0) {
      d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    } else {
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  }
  return d;
}

export function StreakCard() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [filter, setFilter] = useState<StreakFilter>('Month');
  const [activeIndex, setActiveIndex] = useState(FILTER_DATA.Month.defaultIndex);
  const [graphWidth, setGraphWidth] = useState(340);
  const [dragThumbX, setDragThumbX] = useState<number | null>(null);

  const activeConfig = FILTER_DATA[filter];
  const items = activeConfig.items;
  const itemCount = items.length;

  const currentItem = items[Math.min(activeIndex, itemCount - 1)] ?? items[0];

  // Scrubber geometry
  const GRAPH_HEIGHT = 150;
  const Y_BASE = 124;
  const SLIDER_Y = 136;

  // Thumb width adapts proportionally to item count
  const thumbWidth = Math.max(30, Math.min(64, (graphWidth / itemCount) * 1.25));
  const maxThumbX = Math.max(1, graphWidth - thumbWidth);

  // Compute thumb X position: during drag use dragThumbX, otherwise snap to activeIndex
  const targetThumbX = (activeIndex / Math.max(1, itemCount - 1)) * maxThumbX;
  const currentThumbX = dragThumbX !== null ? dragThumbX : targetThumbX;

  // Normalized peak center t0 corresponding to scrubber position
  const currentT0 = Math.max(0, Math.min(1, (currentThumbX + thumbWidth / 2) / graphWidth));

  // Dynamic curves reacting to scrubber center t0
  const upperPath = generateDynamicPath(getCurveY1, currentT0, graphWidth, Y_BASE);
  const lowerPath = generateDynamicPath(getCurveY2, currentT0, graphWidth, Y_BASE);

  // Apex coordinates for dot & floating number
  const apexX = currentT0 * graphWidth;
  const apexY = getCurveY1(currentT0, currentT0, Y_BASE);

  // Clamped X position for the floating apex number
  const numberLeft = Math.max(26, Math.min(graphWidth - 26, apexX));
  const numberTop = Math.max(-2, apexY - 22);

  // Gesture handling for the interactive black scrubber thumb (rock-solid, zero glitch)
  const dragStartRef = useRef<{ startThumbX: number }>({ startThumbX: 0 });
  const lastIndexRef = useRef(activeIndex);

  const updateIndexFromThumbX = useCallback(
    (thumbX: number) => {
      const fraction = maxThumbX > 0 ? thumbX / maxThumbX : 0;
      const newIdx = Math.max(0, Math.min(itemCount - 1, Math.round(fraction * (itemCount - 1))));
      if (newIdx !== lastIndexRef.current) {
        lastIndexRef.current = newIdx;
        triggerHaptic(15);
        setActiveIndex(newIdx);
      }
    },
    [maxThumbX, itemCount],
  );

  const panResponder = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (evt) => {
          const touchX = evt.nativeEvent.locationX;
          const initialThumbX = Math.max(0, Math.min(maxThumbX, touchX - thumbWidth / 2));
          dragStartRef.current.startThumbX = initialThumbX;
          setDragThumbX(initialThumbX);
          updateIndexFromThumbX(initialThumbX);
        },
        onPanResponderMove: (_, gestureState) => {
          const newThumbX = Math.max(
            0,
            Math.min(maxThumbX, dragStartRef.current.startThumbX + gestureState.dx),
          );
          setDragThumbX(newThumbX);
          updateIndexFromThumbX(newThumbX);
        },
        onPanResponderRelease: () => {
          setDragThumbX(null);
        },
        onPanResponderTerminate: () => {
          setDragThumbX(null);
        },
      }),
    [maxThumbX, thumbWidth, updateIndexFromThumbX],
  );

  const handleFilterChange = (nextFilter: StreakFilter) => {
    triggerHaptic(25);
    setFilter(nextFilter);
    const nextCfg = FILTER_DATA[nextFilter];
    setActiveIndex(nextCfg.defaultIndex);
    lastIndexRef.current = nextCfg.defaultIndex;
    setDragThumbX(null);
  };

  const handleExpandPress = () => {
    triggerHaptic(30);
    customAlert.show({
      title: 'Performance & Progress',
      message:
        'Detailed breakdown of your completed lessons, revision habits, and score improvements across subjects.',
      type: 'info',
    });
  };

  const onGraphLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - graphWidth) > 2) {
      setGraphWidth(w);
    }
  };

  // Render vertical striped bars reacting dynamically to scrubber peak
  const barSpacing = 7;
  const barCount = Math.max(40, Math.round(graphWidth / barSpacing));
  const bars = [];
  for (let i = 0; i < barCount; i++) {
    const t = i / (barCount - 1);
    const x = t * graphWidth;
    const distToApex = Math.abs(x - apexX);
    const isHighlightZone = distToApex <= 28;

    const yUpper = getCurveY1(t, currentT0, Y_BASE);
    const yLower = getCurveY2(t, currentT0, Y_BASE);

    const yTop = isHighlightZone ? yUpper : yLower;
    const barColor = isHighlightZone ? '#fca5a5' : isDark ? '#334155' : '#c7d2fe';

    bars.push(
      <Line
        key={`bar-${i}`}
        x1={x}
        y1={Y_BASE}
        x2={x}
        y2={yTop}
        stroke={barColor}
        strokeWidth={2}
        strokeLinecap="round"
      />,
    );
  }

  return (
    <View style={styles.freeformContainer}>
      {/* Header Row: Title, Subtitle & Legend (Left) + Filter Tabs & Expand (Right) */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <ThemedText style={[styles.title, { color: theme.text }]}>Performance Chart</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            {currentItem.subtitle || 'Track results and watch your progress rise'}
          </ThemedText>

          {/* Legend Items */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#818cf8' }]} />
              <ThemedText style={[styles.legendText, { color: theme.text }]}>Theory</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#fc8019' }]} />
              <ThemedText style={[styles.legendText, { color: theme.text }]}>Practice</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f43f5e' }]} />
              <ThemedText style={[styles.legendText, { color: theme.text }]}>Lexicon</ThemedText>
            </View>
          </View>
        </View>

        {/* Filter Pills (Daily, Week, Month, Year) + Expand Icon */}
        <View style={styles.filtersWrapper}>
          <View style={[styles.filterGroup, { backgroundColor: theme.backgroundElement }]}>
            {(['Daily', 'Week', 'Month', 'Year'] as const).map((tab) => {
              const isActive = filter === tab;
              return (
                <Pressable
                  key={tab}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${tab}`}
                  onPress={() => handleFilterChange(tab)}
                  style={[styles.filterTab, isActive && styles.filterTabActive]}>
                  <ThemedText
                    style={[
                      styles.filterTabText,
                      isActive ? styles.filterTabTextActive : { color: theme.textSecondary },
                    ]}>
                    {tab}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Expand chart details"
            onPress={handleExpandPress}
            style={[styles.expandButton, { backgroundColor: theme.backgroundElement }]}>
            <SolarIcon name="MaximizeSquare2" type="linear" size={16} color={theme.text} />
          </Pressable>
        </View>
      </View>

      {/* Freeform Interactive Graph Section */}
      <View style={styles.graphContainer} onLayout={onGraphLayout}>
        <Svg width={graphWidth} height={GRAPH_HEIGHT}>
          {/* Dynamic Striped Bars under curves */}
          {bars}

          {/* Dual Harmonic Wave Curves */}
          <Path d={upperPath} stroke="#f43f5e" strokeWidth={2} fill="none" />
          <Path d={lowerPath} stroke="#3880FF" strokeWidth={2} fill="none" />

          {/* Apex Highlight Dot tracking scrubber */}
          <Circle
            cx={apexX}
            cy={apexY}
            r={4}
            fill="#ffffff"
            stroke="#f43f5e"
            strokeWidth={2}
          />

          {/* Bottom Slider / Timeline Base Track */}
          <Rect
            x={0}
            y={SLIDER_Y}
            width={graphWidth}
            height={4}
            rx={2}
            fill={isDark ? '#1e293b' : '#f1f5f9'}
          />

          {/* Interactive Scrubber Thumb (Black pill in light, white pill in dark) */}
          <Rect
            x={currentThumbX}
            y={SLIDER_Y - 1}
            width={thumbWidth}
            height={6}
            rx={3}
            fill={isDark ? '#f8fafc' : Palette.foreground}
          />
        </Svg>

        {/* Gesture Hit-Target Overlay for the Scrubber */}
        <View
          style={[styles.scrubberHitArea, { top: SLIDER_Y - 14 }]}
          {...panResponder.panHandlers}
        />

        {/* Floating Apex Number (No container box, only pure number) */}
        <ThemedText
          style={[
            styles.apexNumber,
            {
              left: numberLeft,
              top: numberTop,
            },
          ]}>
          {currentItem.value}
        </ThemedText>

        {/* X-Axis Labels (Tappable to jump scrubber) */}
        <View style={styles.xAxisRow}>
          {items.map((item, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <Pressable
                key={`${filter}-${item.label}-${idx}`}
                onPress={() => {
                  triggerHaptic(20);
                  setActiveIndex(idx);
                  lastIndexRef.current = idx;
                }}
                hitSlop={6}
                style={styles.xAxisButton}>
                <ThemedText
                  style={[
                    styles.xAxisLabel,
                    filter === 'Month' && styles.xAxisLabelMonth,
                    isSelected
                      ? [styles.xAxisLabelSelected, { color: theme.text }]
                      : { color: theme.textSecondary },
                  ]}>
                  {item.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  freeformContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    marginTop: Spacing.two,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 10,
  },
  titleCol: {
    flex: 1,
    minWidth: 150,
  },
  title: {
    fontFamily: Fonts?.sans,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2.5,
  },
  legendText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  filtersWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterGroup: {
    flexDirection: 'row',
    borderRadius: Rounded.full,
    padding: 3,
  },
  filterTab: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: Rounded.full,
  },
  filterTabActive: {
    backgroundColor: Palette.foreground,
  },
  filterTabText: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  expandButton: {
    width: 30,
    height: 30,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphContainer: {
    width: '100%',
    position: 'relative',
    marginTop: 2,
  },
  scrubberHitArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 34,
    zIndex: 10,
  },
  apexNumber: {
    position: 'absolute',
    transform: [{ translateX: -30 }],
    width: 60,
    textAlign: 'center',
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: '#e11d48',
    letterSpacing: -0.3,
    zIndex: 10,
    pointerEvents: 'none',
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  xAxisButton: {
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xAxisLabel: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '600',
  },
  xAxisLabelMonth: {
    fontSize: 10,
    letterSpacing: -0.3,
  },
  xAxisLabelSelected: {
    fontWeight: '800',
  },
});
