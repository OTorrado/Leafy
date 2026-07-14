import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMyPlants } from '@/components/my-plants-provider';
import { PlantImage } from '@/components/plant-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UIFont } from '@/constants/theme';
import { nextWaterAt, wateringStatus, type WateringTone } from '@/lib/watering';

const TONE_COLOR: Record<WateringTone, string> = {
  overdue: '#E5484D',
  today: '#1a9e73',
  soon: '#E0A32A',
  later: '#8A958D',
};

export default function RemindersScreen() {
  const router = useRouter();
  const { plants, waterPlant } = useMyPlants();

  const ordered = [...plants].sort((a, b) => nextWaterAt(a) - nextWaterAt(b));

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ThemedText style={styles.title}>Reminders</ThemedText>

        {ordered.length === 0 ? (
          <View style={styles.empty}>
            <IconSymbol name="alarm.fill" size={54} color="#C4CCC7" />
            <ThemedText style={styles.emptyTitle}>No reminders yet</ThemedText>
            <ThemedText style={styles.emptyText}>
              Add a plant and Leafy will remind you when it needs watering.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={ordered}
            keyExtractor={(item) => item.token}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const status = wateringStatus(item);
              return (
                <View style={styles.row}>
                  <Pressable
                    style={styles.rowMain}
                    onPress={() => router.push(`/plant/${item.token}`)}>
                    <PlantImage
                      uri={item.imageUrl}
                      emoji={item.emoji}
                      tint={item.tint}
                      emojiSize={26}
                      style={styles.thumb}
                    />
                    <View style={styles.rowText}>
                      <ThemedText style={styles.rowName} numberOfLines={1}>
                        {item.commonName}
                      </ThemedText>
                      <View style={styles.statusRow}>
                        <View style={[styles.dot, { backgroundColor: TONE_COLOR[status.tone] }]} />
                        <ThemedText style={[styles.statusText, { color: TONE_COLOR[status.tone] }]}>
                          {status.label}
                        </ThemedText>
                      </View>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => waterPlant(item.token)}
                    hitSlop={8}
                    style={({ pressed }) => [styles.waterButton, pressed && { opacity: 0.7 }]}>
                    <IconSymbol name="drop.fill" size={20} color="#3E7BFA" />
                  </Pressable>
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
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
  listContent: { paddingTop: 8, paddingBottom: 24 },
  row: {
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
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: 14 },
  rowText: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowName: { fontFamily: UIFont.semibold, fontSize: 16, lineHeight: 21, color: '#14281B' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: UIFont.semibold, fontSize: 13 },
  waterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF1FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
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