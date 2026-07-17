import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useMyPlants } from '@/components/my-plants-provider';
import { PlantImage } from '@/components/plant-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand, UIFont } from '@/constants/theme';
import type { SavedPlant } from '@/lib/my-plants';
import { fertilizeDaysInMonth, startOfDay, wateringDaysInMonth } from '@/lib/watering';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type CalendarTask = { plant: SavedPlant; kind: 'water' | 'fertilize' };

export default function CalendarScreen() {
  const router = useRouter();
  const { plants, waterPlant, fertilizePlant } = useMyPlants();

  const today = startOfDay(Date.now());
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState(today);

  // Bucket every plant's care days for the visible month by day.
  const dayTasks = useMemo(() => {
    const map = new Map<number, CalendarTask[]>();
    const push = (day: number, task: CalendarTask) => {
      const list = map.get(day) ?? [];
      list.push(task);
      map.set(day, list);
    };
    for (const plant of plants) {
      for (const day of wateringDaysInMonth(plant, viewMonth.year, viewMonth.month)) {
        push(day, { plant, kind: 'water' });
      }
      for (const day of fertilizeDaysInMonth(plant, viewMonth.year, viewMonth.month)) {
        push(day, { plant, kind: 'fertilize' });
      }
    }
    return map;
  }, [plants, viewMonth]);

  const monthLabel = new Date(viewMonth.year, viewMonth.month).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const changeMonth = (delta: number) => {
    setViewMonth((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      const next = { year: d.getFullYear(), month: d.getMonth() };
      // Select today if it lands in view, otherwise the 1st of that month.
      const todayInView =
        new Date().getFullYear() === next.year && new Date().getMonth() === next.month;
      setSelected(todayInView ? today : startOfDay(d.getTime()));
      return next;
    });
  };

  // Build the calendar grid (leading blanks + days of month).
  const firstWeekday = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedTasks = dayTasks.get(selected) ?? [];
  const selectedIsToday = selected === today;
  const canWater = selected <= today;

  const selectedLabel = selectedIsToday
    ? 'Today'
    : new Date(selected).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

  if (plants.length === 0) {
    return (
      <ThemedView style={styles.root}>
        <Stack.Screen options={{ title: 'Calendar' }} />
        <View style={styles.empty}>
          <IconSymbol name="alarm.fill" size={54} color="#C4CCC7" />
          <ThemedText style={styles.emptyTitle}>No reminders yet</ThemedText>
          <ThemedText style={styles.emptyText}>
            Add a plant and Leafy will remind you when it needs watering.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.root}>
      <Stack.Screen options={{ title: 'Calendar' }} />
      <View style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Month navigation */}
          <View style={styles.monthRow}>
            <Pressable onPress={() => changeMonth(-1)} hitSlop={10} style={styles.monthArrow}>
              <IconSymbol name="chevron.left" size={20} color="#14281B" />
            </Pressable>
            <ThemedText style={styles.monthLabel}>{monthLabel}</ThemedText>
            <Pressable onPress={() => changeMonth(1)} hitSlop={10} style={styles.monthArrow}>
              <IconSymbol name="chevron.right" size={20} color="#14281B" />
            </Pressable>
          </View>

          {/* Weekday header */}
          <View style={styles.weekRow}>
            {WEEKDAYS.map((w, i) => (
              <ThemedText key={i} style={styles.weekday}>
                {w}
              </ThemedText>
            ))}
          </View>

          {/* Day grid */}
          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (day === null) return <View key={i} style={styles.cell} />;
              const ts = startOfDay(new Date(viewMonth.year, viewMonth.month, day).getTime());
              const isToday = ts === today;
              const isSelected = ts === selected;
              const hasTasks = dayTasks.has(ts);
              return (
                <Pressable key={i} style={styles.cell} onPress={() => setSelected(ts)}>
                  <View style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}>
                    <ThemedText
                      style={[
                        styles.dayText,
                        isToday && !isSelected && styles.dayTextToday,
                        isSelected && styles.dayTextSelected,
                      ]}>
                      {day}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.dot,
                      hasTasks && styles.dotActive,
                      isSelected && hasTasks && styles.dotOnSelected,
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Selected day tasks */}
          <ThemedText style={styles.dayHeading}>{selectedLabel}</ThemedText>

          {selectedTasks.length === 0 ? (
            <View style={styles.noTasks}>
              <IconSymbol name="checkmark" size={18} color="#1a9e73" />
              <ThemedText style={styles.noTasksText}>Nothing to do</ThemedText>
            </View>
          ) : (
            selectedTasks.map(({ plant, kind }) => {
              const isWater = kind === 'water';
              return (
                <View key={`${plant.token}-${kind}`} style={styles.taskRow}>
                  <Pressable
                    style={styles.taskMain}
                    onPress={() => router.push(`/plant/${plant.token}`)}>
                    <PlantImage
                      uri={plant.imageUrl}
                      emoji={plant.emoji}
                      tint={plant.tint}
                      emojiSize={24}
                      style={styles.thumb}
                    />
                    <View style={styles.taskText}>
                      <ThemedText style={styles.taskName} numberOfLines={1}>
                        {plant.commonName}
                      </ThemedText>
                      <ThemedText style={styles.taskSub}>
                        {isWater
                          ? canWater
                            ? 'Needs watering'
                            : 'Scheduled watering'
                          : canWater
                            ? 'Needs fertilizing'
                            : 'Scheduled fertilizing'}
                      </ThemedText>
                    </View>
                  </Pressable>

                  {canWater ? (
                    <Pressable
                      onPress={() =>
                        isWater ? waterPlant(plant.token) : fertilizePlant(plant.token)
                      }
                      hitSlop={8}
                      accessibilityLabel={`Mark ${plant.commonName} ${isWater ? 'watered' : 'fertilized'}`}
                      style={({ pressed }) => [
                        styles.waterButton,
                        !isWater && styles.fertilizeButton,
                        pressed && { opacity: 0.7 },
                      ]}>
                      <IconSymbol
                        name={isWater ? 'drop.fill' : 'bag.fill'}
                        size={20}
                        color={isWater ? '#3E7BFA' : '#8B5E3C'}
                      />
                    </Pressable>
                  ) : (
                    <View style={styles.scheduledBadge}>
                      <IconSymbol
                        name={isWater ? 'drop.fill' : 'bag.fill'}
                        size={16}
                        color="#8FA69B"
                      />
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 16 },
  title: {
    fontFamily: UIFont.bold,
    fontSize: 26,
    lineHeight: 34,
    color: '#14281B',
    paddingTop: 8,
    marginBottom: 8,
  },
  scroll: { paddingBottom: 24 },

  // Calendar
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  monthArrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F1F4F2',
  },
  monthLabel: { fontFamily: UIFont.bold, fontSize: 18, lineHeight: 24, color: '#14281B' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: UIFont.semibold,
    fontSize: 12,
    color: '#9AA6A0',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 5 },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: { backgroundColor: Brand.green },
  dayText: { fontFamily: UIFont.medium, fontSize: 15, color: '#14281B' },
  dayTextToday: { fontFamily: UIFont.bold, color: '#1a9e73' },
  dayTextSelected: { fontFamily: UIFont.bold, color: '#ffffff' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 3, backgroundColor: 'transparent' },
  dotActive: { backgroundColor: Brand.green },
  dotOnSelected: { backgroundColor: '#14281B' },

  // Selected-day tasks
  dayHeading: {
    fontFamily: UIFont.bold,
    fontSize: 17,
    lineHeight: 23,
    color: '#14281B',
    marginTop: 18,
    marginBottom: 10,
  },
  noTasks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 22,
  },
  noTasksText: { fontFamily: UIFont.medium, fontSize: 14.5, color: '#8A958D' },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  taskMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: 14 },
  taskText: { flex: 1, marginLeft: 12, marginRight: 8 },
  taskName: { fontFamily: UIFont.semibold, fontSize: 16, lineHeight: 21, color: '#14281B' },
  taskSub: { fontFamily: UIFont.medium, fontSize: 13, lineHeight: 18, color: '#8A958D', marginTop: 2 },
  waterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF1FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fertilizeButton: { backgroundColor: '#F3EBDD' },
  scheduledBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyTitle: {
    fontFamily: UIFont.bold,
    fontSize: 20,
    lineHeight: 27,
    color: '#14281B',
    marginTop: 14,
  },
  emptyText: {
    fontFamily: UIFont.medium,
    fontSize: 14.5,
    lineHeight: 21,
    color: '#8A958D',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 40,
  },
});
