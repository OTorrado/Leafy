import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMyPlants } from '@/components/my-plants-provider';
import { PlantImage } from '@/components/plant-image';
import { SiteImage } from '@/components/site-image';
import { SitePlantPicker } from '@/components/site-plant-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand, UIFont } from '@/constants/theme';
import { getSite } from '@/lib/sites';

export default function SiteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { plants, assignSite } = useMyPlants();
  const [pickerOpen, setPickerOpen] = useState(false);

  const site = getSite(id);
  const sitePlants = plants.filter((p) => p.siteId === id);

  if (!site) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <ThemedText style={styles.notFound}>That site doesn’t exist.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.root}>
      <Stack.Screen options={{ title: site.name }} />

      {sitePlants.length === 0 ? (
        <View style={styles.center}>
          <SiteImage site={site} emojiSize={40} style={styles.siteBadge} />
          <ThemedText style={styles.emptyTitle}>No plants here yet</ThemedText>
          <ThemedText style={styles.emptyText}>
            Add plants you already own to your {site.name}.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={sitePlants}
          keyExtractor={(item) => item.token}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                style={styles.cardMain}
                onPress={() => router.push(`/plant/${item.token}`)}>
                <PlantImage
                  uri={item.imageUrl}
                  emoji={item.emoji}
                  tint={item.tint}
                  emojiSize={26}
                  style={styles.thumb}
                />
                <View style={styles.cardText}>
                  <ThemedText style={styles.cardName} numberOfLines={1}>
                    {item.commonName}
                  </ThemedText>
                  <View style={styles.waterRow}>
                    <IconSymbol name="drop.fill" size={13} color="#3E7BFA" />
                    <ThemedText style={styles.waterText}>{item.wateringSummary}</ThemedText>
                  </View>
                </View>
              </Pressable>

              <Pressable
                onPress={() => assignSite(item.token, undefined)}
                hitSlop={8}
                style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.6 }]}>
                <IconSymbol name="xmark" size={16} color="#8A958D" />
              </Pressable>
            </View>
          )}
        />
      )}

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.9 }]}>
          <ThemedText style={styles.addButtonLabel}>+ Add Plants</ThemedText>
        </Pressable>
      </SafeAreaView>

      <SitePlantPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        siteId={site.id}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  notFound: { fontFamily: UIFont.medium, fontSize: 16, color: '#8A958D' },
  siteBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  emptyTitle: {
    fontFamily: UIFont.bold,
    fontSize: 20,
    lineHeight: 27,
    color: '#14281B',
    marginTop: 16,
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
  listContent: { padding: 16, paddingBottom: 110 },
  card: {
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
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 60, height: 60, borderRadius: 14 },
  cardText: { flex: 1, marginLeft: 12, marginRight: 8 },
  cardName: { fontFamily: UIFont.semibold, fontSize: 16, lineHeight: 21, color: '#14281B' },
  waterRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  waterText: { flex: 1, fontFamily: UIFont.medium, fontSize: 12.5, lineHeight: 17, color: '#6E7A72' },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EAEEEB',
  },
  addButton: {
    backgroundColor: Brand.green,
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: 'center',
    shadowColor: Brand.green,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  addButtonLabel: { fontFamily: UIFont.bold, fontSize: 16, color: '#ffffff' },
});