import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { SiteImage } from '@/components/site-image';
import { ThemedText } from '@/components/themed-text';
import { Brand, UIFont } from '@/constants/theme';
import { SITES } from '@/lib/sites';

/** Multi-select grid for picking which sites you have. */
export function SiteChooser({
  initialSelected,
  onDone,
}: {
  initialSelected: string[];
  onDone: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <View style={styles.root}>
      <FlatList
        data={SITES}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText style={styles.title}>Choose site</ThemedText>
            <ThemedText style={styles.subtitle}>
              Get personalized, site-based plant care tips.
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => {
          const on = selected.includes(item.id);
          return (
            <Pressable
              onPress={() => toggle(item.id)}
              style={({ pressed }) => [styles.cell, pressed && { opacity: 0.7 }]}>
              <View style={[styles.ring, on && styles.ringOn]}>
                <SiteImage site={item} emojiSize={34} style={styles.circle} />
              </View>
              <ThemedText style={[styles.name, on && styles.nameOn]} numberOfLines={1}>
                {item.name}
              </ThemedText>
            </Pressable>
          );
        }}
      />

      <View style={styles.footer}>
        <Pressable
          onPress={() => onDone(selected)}
          style={({ pressed }) => [styles.doneButton, pressed && { opacity: 0.9 }]}>
          <ThemedText style={styles.doneLabel}>Done</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const CIRCLE = 84;
const RING = 3;

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 96 },
  column: { gap: 10, marginBottom: 20 },
  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 22 },
  title: { fontFamily: UIFont.bold, fontSize: 22, lineHeight: 30, color: '#14281B' },
  subtitle: {
    fontFamily: UIFont.medium,
    fontSize: 14,
    lineHeight: 20,
    color: '#8A958D',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  cell: { flex: 1, alignItems: 'center' },
  // Ring lives on a wrapper so the photo itself stays a clean, unbordered circle.
  ring: {
    padding: RING,
    borderRadius: (CIRCLE + RING * 2) / 2,
    borderWidth: RING,
    borderColor: 'transparent',
  },
  ringOn: { borderColor: Brand.green },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
  },
  name: {
    fontFamily: UIFont.semibold,
    fontSize: 13.5,
    lineHeight: 18,
    color: '#14281B',
    marginTop: 8,
    textAlign: 'center',
  },
  nameOn: { color: '#1a9e73' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  doneButton: {
    backgroundColor: Brand.green,
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: 'center',
  },
  doneLabel: { fontFamily: UIFont.bold, fontSize: 17, color: '#ffffff' },
});
