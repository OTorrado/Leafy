import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMyPlants } from '@/components/my-plants-provider';
import { PlantImage } from '@/components/plant-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand, UIFont } from '@/constants/theme';
import { toSavedPlant } from '@/lib/my-plants';
import { getPlant, getPopularPlants, searchPlants, type PlantSummary } from '@/lib/plants-api';

export default function SearchScreen() {
  const router = useRouter();
  const { addPlant, isSaved } = useMyPlants();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);

  // Debounced search whenever the query changes (empty query -> popular plants).
  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    const handle = setTimeout(async () => {
      const data = query.trim() ? await searchPlants(query) : await getPopularPlants();
      // Ignore out-of-order responses.
      if (id === reqId.current) {
        setResults(data);
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  const searching = query.trim().length > 0;

  const handleAdd = async (plant: PlantSummary) => {
    if (isSaved(plant.token)) return;
    // Fetch detail to capture the watering summary, then save locally.
    const detail = await getPlant(plant.token);
    addPlant(toSavedPlant(plant, detail?.care.watering, detail?.care.fertilizing));
    router.navigate('/');
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ThemedText style={styles.title}>Find a plant</ThemedText>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={20} color="#9AA6A0" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name…"
            placeholderTextColor="#9AA6A0"
            style={styles.input}
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <IconSymbol name="xmark" size={18} color="#9AA6A0" />
            </Pressable>
          )}
        </View>

        <FlatList
          data={results}
          keyExtractor={(item) => item.token}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <ThemedText style={styles.sectionLabel}>
              {searching ? 'Results' : 'Popular plants'}
            </ThemedText>
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color={Brand.green} style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.empty}>
                <ThemedText style={styles.emptyTitle}>No plants found</ThemedText>
                <ThemedText style={styles.emptyText}>
                  Try another name, like “Monstera” or “Snake plant”.
                </ThemedText>
              </View>
            )
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/plant/${item.token}`)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
              <PlantImage
                uri={item.imageUrl}
                emoji={item.emoji}
                tint={item.tint}
                emojiSize={26}
                style={styles.thumb}
              />
              <View style={styles.rowText}>
                <ThemedText style={styles.rowTitle}>{item.commonName}</ThemedText>
                <ThemedText style={styles.rowSub}>{item.scientificName}</ThemedText>
              </View>
              <Pressable
                onPress={() => handleAdd(item)}
                disabled={isSaved(item.token)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.addCircle,
                  isSaved(item.token) && styles.addCircleSaved,
                  pressed && { opacity: 0.7 },
                ]}>
                <IconSymbol
                  name={isSaved(item.token) ? 'checkmark' : 'plus'}
                  size={isSaved(item.token) ? 18 : 22}
                  color="#ffffff"
                />
              </Pressable>
            </Pressable>
          )}
        />
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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F1F4F2',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    fontFamily: UIFont.medium,
    fontSize: 16,
    color: '#14281B',
    padding: 0,
  },
  listContent: { paddingBottom: 24 },
  sectionLabel: {
    fontFamily: UIFont.semibold,
    fontSize: 14,
    color: '#8A958D',
    marginTop: 12,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowPressed: { opacity: 0.6 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  addCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addCircleSaved: { backgroundColor: '#B9C6BF' },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: UIFont.semibold, fontSize: 16, lineHeight: 22, color: '#14281B' },
  rowSub: {
    fontFamily: UIFont.medium,
    fontSize: 13,
    lineHeight: 18,
    color: '#8A958D',
    fontStyle: 'italic',
  },
  empty: { alignItems: 'center', marginTop: 48, paddingHorizontal: 30 },
  emptyTitle: { fontFamily: UIFont.bold, fontSize: 18, lineHeight: 24, color: '#14281B' },
  emptyText: {
    fontFamily: UIFont.medium,
    fontSize: 14,
    lineHeight: 20,
    color: '#8A958D',
    textAlign: 'center',
    marginTop: 6,
  },
});