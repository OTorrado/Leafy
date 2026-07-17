import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddPlantSheet } from '@/components/add-plant-sheet';
import { useMyPlants } from '@/components/my-plants-provider';
import { PlantImage } from '@/components/plant-image';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts, UIFont } from '@/constants/theme';
import type { SavedPlant } from '@/lib/my-plants';
import { getSite } from '@/lib/sites';
import { daysUntil, isSameDay, nextFertilizeAt, nextWaterAt } from '@/lib/watering';

type ScheduleTab = 'today' | 'upcoming' | 'completed';
type CareKind = 'water' | 'fertilize';
type Task = { plant: SavedPlant; kind: CareKind };

const dueAt = (t: Task) => (t.kind === 'water' ? nextWaterAt(t.plant) : nextFertilizeAt(t.plant));

const TABS: { key: ScheduleTab; label: string; icon: 'leaf.fill' | 'calendar' | 'checkmark.circle' }[] = [
  { key: 'today', label: 'Today', icon: 'leaf.fill' },
  { key: 'upcoming', label: 'Upcoming', icon: 'calendar' },
  { key: 'completed', label: 'Completed', icon: 'checkmark.circle' },
];

// Muted botanical palette for this screen, matching the design.
const INK = '#2C4A36'; // deep green (title)
const PILL = '#41603F'; // active tab pill
const ACTION = '#6F8F55'; // water-now / fab olive green
const ORANGE = '#E8930C';

export default function ScheduleScreen() {
  const router = useRouter();
  const { plants, waterPlant, fertilizePlant } = useMyPlants();
  const [tab, setTab] = useState<ScheduleTab>('today');
  const [sheetOpen, setSheetOpen] = useState(false);

  const now = Date.now();
  // Done today = completed; due (or overdue) and not done today = today's tasks.
  const wateredToday = (p: SavedPlant) => isSameDay(p.lastWateredAt, now);
  const fertilizedToday = (p: SavedPlant) =>
    isSameDay(p.lastFertilizedAt, now) && p.lastFertilizedAt !== p.addedAt;

  const completed: Task[] = [
    ...plants.filter(wateredToday).map((plant) => ({ plant, kind: 'water' as const })),
    ...plants.filter(fertilizedToday).map((plant) => ({ plant, kind: 'fertilize' as const })),
  ];
  const dueToday: Task[] = [
    ...plants
      .filter((p) => !wateredToday(p) && daysUntil(nextWaterAt(p)) <= 0)
      .map((plant) => ({ plant, kind: 'water' as const })),
    ...plants
      .filter((p) => !fertilizedToday(p) && daysUntil(nextFertilizeAt(p)) <= 0)
      .map((plant) => ({ plant, kind: 'fertilize' as const })),
  ];
  // One entry per plant: only its soonest upcoming task.
  const upcoming: Task[] = plants
    .map((plant) => {
      const candidates: Task[] = [];
      if (daysUntil(nextWaterAt(plant)) > 0) candidates.push({ plant, kind: 'water' });
      if (daysUntil(nextFertilizeAt(plant)) > 0) candidates.push({ plant, kind: 'fertilize' });
      if (candidates.length === 0) return null;
      return candidates.reduce((a, b) => (dueAt(a) <= dueAt(b) ? a : b));
    })
    .filter((t): t is Task => t !== null)
    .sort((a, b) => dueAt(a) - dueAt(b));

  const list = tab === 'today' ? dueToday : tab === 'upcoming' ? upcoming : completed;

  // Per-kind daily tallies for the summary bars.
  const tally = (kind: CareKind) => {
    const due = dueToday.filter((t) => t.kind === kind).length;
    const done = completed.filter((t) => t.kind === kind).length;
    const total = due + done;
    return { due, done, total, progress: total === 0 ? 0 : done / total };
  };
  const water = tally('water');
  const fertilize = tally('fertilize');
  const totalToday = water.total + fertilize.total;

  const emptyLine =
    tab === 'upcoming' ? 'No upcoming care yet' : 'Nothing completed today yet';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <ThemedText style={styles.title}>Schedule</ThemedText>
            <ThemedText style={styles.subtitle}>Today’s watering plan</ThemedText>
          </View>
          <Pressable
            onPress={() => router.push('/calendar')}
            hitSlop={8}
            accessibilityLabel="Open calendar"
            style={({ pressed }) => [styles.calendarButton, pressed && { opacity: 0.7 }]}>
            <IconSymbol name="calendar" size={20} color={INK} />
          </Pressable>
        </View>

        {/* Today / Upcoming / Completed */}
        <View style={styles.segment}>
          {TABS.map((t, i) => {
            const active = tab === t.key;
            return (
              <View key={t.key} style={styles.segSlot}>
                {i > 0 && !active && tab !== TABS[i - 1].key && <View style={styles.segDivider} />}
                <Pressable
                  onPress={() => setTab(t.key)}
                  style={[styles.segItem, active && styles.segItemActive]}>
                  <IconSymbol name={t.icon} size={15} color={active ? '#ffffff' : '#69766B'} />
                  <ThemedText style={[styles.segText, active && styles.segTextActive]}>
                    {t.label}
                  </ThemedText>
                </Pressable>
              </View>
            );
          })}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Summary cards: one per care kind; each slides away once its tasks are done. */}
          {tab === 'today' && dueToday.length === 0 && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              exiting={FadeOutUp.duration(250)}
              layout={LinearTransition.duration(250)}
              style={styles.summaryCard}>
              <View style={styles.summaryDrop}>
                <IconSymbol name="checkmark" size={24} color={ACTION} />
              </View>
              <View style={styles.summaryBody}>
                <ThemedText style={styles.summaryTitle}>
                  {totalToday > 0 ? 'All done for today 🎉' : 'No care needed today'}
                </ThemedText>
                <ThemedText style={styles.summarySub}>Enjoy your plants 🌿</ThemedText>
              </View>
            </Animated.View>
          )}
          {tab === 'today' && water.due > 0 && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              exiting={FadeOutUp.duration(250)}
              layout={LinearTransition.duration(250)}
              style={styles.summaryCard}>
              <View style={styles.summaryDrop}>
                <IconSymbol name="drop.fill" size={24} color={ACTION} />
              </View>
              <View style={styles.summaryBody}>
                <ThemedText style={styles.summaryTitle}>
                  {water.due === 1
                    ? '1 plant needs water today'
                    : `${water.due} plants need water today`}
                </ThemedText>
                <ThemedText style={styles.summarySub}>
                  {water.done} of {water.total} completed
                </ThemedText>
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${Math.round(water.progress * 100)}%` }]}
                  />
                </View>
              </View>
            </Animated.View>
          )}
          {tab === 'today' && fertilize.due > 0 && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              exiting={FadeOutUp.duration(250)}
              layout={LinearTransition.duration(250)}
              style={[styles.summaryCard, styles.summaryCardFertilize]}>
              <View style={styles.summaryDrop}>
                <IconSymbol name="bag.fill" size={22} color="#8B5E3C" />
              </View>
              <View style={styles.summaryBody}>
                <ThemedText style={styles.summaryTitle}>
                  {fertilize.due === 1
                    ? '1 plant needs fertilizer today'
                    : `${fertilize.due} plants need fertilizer today`}
                </ThemedText>
                <ThemedText style={styles.summarySub}>
                  {fertilize.done} of {fertilize.total} completed
                </ThemedText>
                <View style={[styles.progressTrack, styles.progressTrackFertilize]}>
                  <View
                    style={[
                      styles.progressFill,
                      styles.progressFillFertilize,
                      { width: `${Math.round(fertilize.progress * 100)}%` },
                    ]}
                  />
                </View>
              </View>
            </Animated.View>
          )}

          {/* Task list (Today's empty state is covered by the summary cards) */}
          {list.length === 0 ? (
            tab !== 'today' && (
              <View style={styles.noTasks}>
                <IconSymbol name="checkmark" size={18} color={ACTION} />
                <ThemedText style={styles.noTasksText}>{emptyLine}</ThemedText>
              </View>
            )
          ) : (
            list.map((task) => (
              <Animated.View
                key={`${task.plant.token}-${task.kind}`}
                entering={FadeInDown.duration(250)}
                exiting={FadeOutUp.duration(220)}
                layout={LinearTransition.duration(250)}>
                <TaskCard
                  task={task}
                  mode={tab}
                  onOpen={() => router.push(`/plant/${task.plant.token}`)}
                  onDone={() =>
                    task.kind === 'water'
                      ? waterPlant(task.plant.token)
                      : fertilizePlant(task.plant.token)
                  }
                />
              </Animated.View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Add plant */}
      <Pressable
        onPress={() => setSheetOpen(true)}
        accessibilityLabel="Add a plant"
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
        <IconSymbol name="plus" size={28} color="#ffffff" />
      </Pressable>

      <AddPlantSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCamera={() => {
          setSheetOpen(false);
          router.push('/identify');
        }}
        onSearch={() => {
          setSheetOpen(false);
          router.push('/search');
        }}
      />
    </View>
  );
}

function TaskCard({
  task,
  mode,
  onOpen,
  onDone,
}: {
  task: Task;
  mode: ScheduleTab;
  onOpen: () => void;
  onDone: () => void;
}) {
  const { plant, kind } = task;
  const site = getSite(plant.siteId);
  const days = daysUntil(dueAt(task));
  const isWater = kind === 'water';

  let badge: { label: string; color: string } | null = null;
  if (mode === 'today') {
    badge =
      days < 0
        ? { label: days === -1 ? 'Overdue 1 day' : `Overdue ${-days} days`, color: '#E5484D' }
        : { label: 'Due now', color: ORANGE };
  } else if (mode === 'upcoming') {
    badge = { label: days === 1 ? 'Tomorrow' : `In ${days} days`, color: '#8A958D' };
  }

  return (
    <Pressable onPress={onOpen} style={({ pressed }) => [styles.taskCard, pressed && { opacity: 0.9 }]}>
      <PlantImage
        uri={plant.imageUrl}
        emoji={plant.emoji}
        tint={plant.tint}
        emojiSize={26}
        style={styles.taskThumb}
      />

      {/* Middle: name + meta */}
      <View style={styles.taskBody}>
        <ThemedText style={styles.taskName} numberOfLines={1}>
          {plant.commonName}
        </ThemedText>
        {site && (
          <View style={styles.metaRow}>
            <IconSymbol name="mappin" size={14} color="#7C877E" />
            <ThemedText style={styles.metaText} numberOfLines={1}>
              {site.name}
            </ThemedText>
          </View>
        )}
        <View style={styles.metaRow}>
          <IconSymbol name={isWater ? 'clock' : 'bag.fill'} size={14} color="#7C877E" />
          <ThemedText style={styles.metaText} numberOfLines={1}>
            {mode === 'completed'
              ? isWater
                ? 'Watered today'
                : 'Fertilized today'
              : isWater
                ? plant.wateringSummary
                : plant.fertilizingSummary}
          </ThemedText>
        </View>
      </View>

      {/* Right: badge above action */}
      <View style={styles.taskRight}>
        {badge ? (
          <View style={styles.badgeRow}>
            <View style={[styles.badgeDot, { backgroundColor: badge.color }]} />
            <ThemedText style={[styles.badgeText, { color: badge.color }]}>{badge.label}</ThemedText>
          </View>
        ) : (
          <View />
        )}

        {mode === 'today' ? (
          <Pressable
            onPress={onDone}
            style={({ pressed }) => [
              styles.waterButton,
              !isWater && styles.fertilizeButton,
              pressed && { opacity: 0.85 },
            ]}>
            <IconSymbol name={isWater ? 'drop.fill' : 'bag.fill'} size={15} color="#ffffff" />
            <ThemedText style={styles.waterButtonLabel}>
              {isWater ? 'Water now' : 'Fertilize'}
            </ThemedText>
          </Pressable>
        ) : mode === 'completed' ? (
          <View style={styles.doneBadge}>
            <IconSymbol name="checkmark" size={14} color={PILL} />
            <ThemedText style={styles.doneBadgeLabel}>Done</ThemedText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  safe: { flex: 1, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 8 },
  headerText: { flex: 1 },
  title: {
    fontFamily: Fonts?.serif,
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 42,
    color: INK,
  },
  subtitle: {
    fontFamily: UIFont.medium,
    fontSize: 15,
    lineHeight: 21,
    color: '#8A917F',
    marginTop: 2,
  },
  calendarButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2D22',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },

  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 5,
    marginTop: 16,
    shadowColor: '#1F2D22',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  segSlot: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  segDivider: { width: 1, height: 18, backgroundColor: '#E5E7DE' },
  segItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 21,
  },
  segItemActive: { backgroundColor: PILL },
  segText: { fontFamily: UIFont.semibold, fontSize: 13.5, color: '#69766B' },
  segTextActive: { color: '#ffffff' },

  scroll: { paddingTop: 16, paddingBottom: 110 },

  // Summary card
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2E2',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#1F2D22',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  summaryDrop: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  summaryBody: { flex: 1 },
  summaryTitle: { fontFamily: UIFont.bold, fontSize: 17, lineHeight: 23, color: INK },
  summarySub: {
    fontFamily: UIFont.medium,
    fontSize: 13.5,
    lineHeight: 19,
    color: '#75816D',
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDE3CE',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: ACTION },
  summaryCardFertilize: { backgroundColor: '#F3EBDD' },
  progressTrackFertilize: { backgroundColor: '#E4D4BF' },
  progressFillFertilize: { backgroundColor: '#8B5E3C' },

  // Tasks
  noTasks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 26,
  },
  noTasksText: { fontFamily: UIFont.medium, fontSize: 14.5, color: '#8A917F' },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 12,
    marginBottom: 14,
    shadowColor: '#1F2D22',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  taskThumb: { width: 92, height: 92, borderRadius: 16 },
  taskBody: { flex: 1, marginLeft: 12, marginRight: 8 },
  taskName: { fontFamily: UIFont.semibold, fontSize: 17, lineHeight: 23, color: '#22331F' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  metaText: { flexShrink: 1, fontFamily: UIFont.medium, fontSize: 13.5, color: '#7C877E' },

  taskRight: { alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch', paddingVertical: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontFamily: UIFont.semibold, fontSize: 13 },
  waterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: ACTION,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 16,
  },
  fertilizeButton: { backgroundColor: '#8B5E3C' },
  waterButtonLabel: { fontFamily: UIFont.bold, fontSize: 13.5, color: '#ffffff' },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2E2',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
  },
  doneBadgeLabel: { fontFamily: UIFont.semibold, fontSize: 13, color: PILL },

  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C3B27',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
