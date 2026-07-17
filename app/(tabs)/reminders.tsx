import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddPlantSheet } from '@/components/add-plant-sheet';
import { useMyPlants } from '@/components/my-plants-provider';
import { PlantImage } from '@/components/plant-image';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts, UIFont } from '@/constants/theme';
import type { SavedPlant } from '@/lib/my-plants';
import { getSite } from '@/lib/sites';
import { daysUntil, isSameDay, nextWaterAt } from '@/lib/watering';

type ScheduleTab = 'today' | 'upcoming' | 'completed';

const TABS: { key: ScheduleTab; label: string; icon: 'leaf.fill' | 'calendar' | 'checkmark.circle' }[] = [
  { key: 'today', label: 'Today', icon: 'leaf.fill' },
  { key: 'upcoming', label: 'Upcoming', icon: 'calendar' },
  { key: 'completed', label: 'Completed', icon: 'checkmark.circle' },
];

// Muted botanical palette for this screen, matching the design.
const INK = '#2C4A36'; // deep green (title)
const CREAM = '#F7F5EF'; // page background
const PILL = '#41603F'; // active tab pill
const ACTION = '#6F8F55'; // water-now / fab olive green
const ORANGE = '#E8930C';

export default function ScheduleScreen() {
  const router = useRouter();
  const { plants, waterPlant } = useMyPlants();
  const [tab, setTab] = useState<ScheduleTab>('today');
  const [sheetOpen, setSheetOpen] = useState(false);

  // Watered today = completed. Due (or overdue) and not watered today = today's tasks.
  const completed = plants.filter((p) => isSameDay(p.lastWateredAt, Date.now()));
  const dueToday = plants.filter(
    (p) => !isSameDay(p.lastWateredAt, Date.now()) && daysUntil(nextWaterAt(p)) <= 0,
  );
  const upcoming = plants
    .filter((p) => daysUntil(nextWaterAt(p)) > 0)
    .sort((a, b) => nextWaterAt(a) - nextWaterAt(b));

  const totalToday = dueToday.length + completed.length;
  const progress = totalToday === 0 ? 0 : completed.length / totalToday;

  const list = tab === 'today' ? dueToday : tab === 'upcoming' ? upcoming : completed;

  const emptyLine =
    tab === 'today'
      ? totalToday > 0
        ? 'All watered — nice work! 🌿'
        : 'Nothing needs water today'
      : tab === 'upcoming'
        ? 'No upcoming waterings yet'
        : 'Nothing watered today yet';

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
          {/* Summary card */}
          {tab === 'today' && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryDrop}>
                <IconSymbol name="drop.fill" size={24} color={ACTION} />
              </View>
              <View style={styles.summaryBody}>
                <ThemedText style={styles.summaryTitle}>
                  {dueToday.length === 0
                    ? totalToday > 0
                      ? 'All plants watered today'
                      : 'No watering needed today'
                    : dueToday.length === 1
                      ? '1 plant needs water today'
                      : `${dueToday.length} plants need water today`}
                </ThemedText>
                <ThemedText style={styles.summarySub}>
                  {completed.length} of {Math.max(totalToday, completed.length)} completed
                </ThemedText>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
                </View>
              </View>
            </View>
          )}

          {/* Task list */}
          {list.length === 0 ? (
            <View style={styles.noTasks}>
              <IconSymbol name="checkmark" size={18} color={ACTION} />
              <ThemedText style={styles.noTasksText}>{emptyLine}</ThemedText>
            </View>
          ) : (
            list.map((plant) => (
              <TaskCard
                key={plant.token}
                plant={plant}
                mode={tab}
                onOpen={() => router.push(`/plant/${plant.token}`)}
                onWater={() => waterPlant(plant.token)}
              />
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
  plant,
  mode,
  onOpen,
  onWater,
}: {
  plant: SavedPlant;
  mode: ScheduleTab;
  onOpen: () => void;
  onWater: () => void;
}) {
  const site = getSite(plant.siteId);
  const days = daysUntil(nextWaterAt(plant));

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
          <IconSymbol name="clock" size={14} color="#7C877E" />
          <ThemedText style={styles.metaText} numberOfLines={1}>
            {mode === 'completed' ? 'Watered today' : plant.wateringSummary}
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
            onPress={onWater}
            style={({ pressed }) => [styles.waterButton, pressed && { opacity: 0.85 }]}>
            <IconSymbol name="drop.fill" size={15} color="#ffffff" />
            <ThemedText style={styles.waterButtonLabel}>Water now</ThemedText>
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
  root: { flex: 1, backgroundColor: CREAM },
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
    shadowColor: '#3A4A35',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 5,
    marginTop: 16,
    shadowColor: '#3A4A35',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
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
    shadowColor: '#3A4A35',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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
