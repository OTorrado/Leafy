import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMyPlants } from '@/components/my-plants-provider';
import { PlantImage } from '@/components/plant-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand, UIFont } from '@/constants/theme';
import { toSavedPlant } from '@/lib/my-plants';
import { getPlant, type PlantDetail } from '@/lib/plants-api';

const DIFFICULTY_TINT: Record<PlantDetail['care']['difficulty'], string> = {
  Easy: '#E4F5EE',
  Moderate: '#FBF3E4',
  Advanced: '#FBEAF1',
};
const DIFFICULTY_COLOR: Record<PlantDetail['care']['difficulty'], string> = {
  Easy: '#1a9e73',
  Moderate: '#B7791F',
  Advanced: '#C13B72',
};

const SECTIONS = [
  { key: 'about', label: 'About' },
  { key: 'care', label: 'Care' },
  { key: 'good', label: 'Good to know' },
  { key: 'propagation', label: 'Propagation' },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addPlant, isSaved } = useMyPlants();
  const [plant, setPlant] = useState<PlantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionKey>('about');
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Partial<Record<SectionKey, number>>>({});

  useEffect(() => {
    let active = true;
    getPlant(id).then((data) => {
      if (active) {
        setPlant(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  /** Record each section's offset inside the scroll content. */
  const measure = (key: SectionKey) => (e: LayoutChangeEvent) => {
    sectionY.current[key] = e.nativeEvent.layout.y;
  };

  const jumpTo = (key: SectionKey) => {
    const y = sectionY.current[key];
    if (y === undefined) return;
    setActiveSection(key);
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  };

  /** Highlight the topic currently in view. */
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y + 32;
    let current: SectionKey = 'about';
    for (const section of SECTIONS) {
      const top = sectionY.current[section.key];
      if (top !== undefined && top <= y) current = section.key;
    }
    setActiveSection((prev) => (prev === current ? prev : current));
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: '' }} />
        <ActivityIndicator color={Brand.green} />
      </ThemedView>
    );
  }

  if (!plant) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <ThemedText style={styles.notFound}>We couldn’t find that plant.</ThemedText>
      </ThemedView>
    );
  }

  const saved = isSaved(plant.token);

  return (
    <ThemedView style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom header: back arrow, name, add button */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#14281B" />
          </Pressable>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            {plant.commonName}
          </ThemedText>
          <Pressable
            onPress={() => addPlant(toSavedPlant(plant, plant.care.watering))}
            disabled={saved}
            hitSlop={10}
            accessibilityLabel={saved ? 'Added to My Plants' : 'Add to My Plants'}
            style={({ pressed }) => [styles.addCircle, pressed && { opacity: 0.8 }]}>
            <IconSymbol name={saved ? 'checkmark' : 'plus'} size={saved ? 18 : 22} color="#ffffff" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Topic bar: tap to jump to a section */}
      <View style={styles.topicBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicBarContent}>
          {SECTIONS.map((section) => {
            const active = activeSection === section.key;
            return (
              <Pressable
                key={section.key}
                onPress={() => jumpTo(section.key)}
                style={[styles.topic, active && styles.topicActive]}>
                <ThemedText style={[styles.topicLabel, active && styles.topicLabelActive]}>
                  {section.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <PlantImage
          uri={plant.imageUrl}
          emoji={plant.emoji}
          tint={plant.tint}
          emojiSize={84}
          style={styles.hero}
        />

        {/* About */}
        <View onLayout={measure('about')}>
          <ThemedText style={styles.name}>{plant.commonName}</ThemedText>
          <ThemedText style={styles.sciName}>{plant.scientificName}</ThemedText>

          <View
            style={[styles.badge, { backgroundColor: DIFFICULTY_TINT[plant.care.difficulty] }]}>
            <IconSymbol
              name="speedometer"
              size={14}
              color={DIFFICULTY_COLOR[plant.care.difficulty]}
            />
            <ThemedText
              style={[styles.badgeText, { color: DIFFICULTY_COLOR[plant.care.difficulty] }]}>
              {plant.care.difficulty} care
            </ThemedText>
          </View>

          <ThemedText style={styles.description}>{plant.description}</ThemedText>
        </View>

        {/* Care */}
        <View onLayout={measure('care')}>
          <ThemedText style={styles.sectionTitle}>Care</ThemedText>
          <CareRow icon="drop.fill" tint="#EAF1FE" color="#3E7BFA" label="Watering" value={plant.care.watering} />
          <CareRow icon="sun.max.fill" tint="#FBF3E4" color="#E0A32A" label="Light" value={plant.care.light} />
          <CareRow icon="leaf.fill" tint="#E4F5EE" color="#1a9e73" label="Soil" value={plant.care.soil} />
        </View>

        {/* Good to know */}
        <View onLayout={measure('good')}>
          <ThemedText style={styles.sectionTitle}>Good to know</ThemedText>
          <CareRow icon="pawprint.fill" tint="#FBEAF1" color="#C13B72" label="Toxicity" value={plant.care.toxicity} />
        </View>

        {/* Propagation */}
        <View onLayout={measure('propagation')}>
          <ThemedText style={styles.sectionTitle}>Propagation</ThemedText>
          <View style={styles.chips}>
            {plant.propagation.map((method) => (
              <View key={method} style={styles.chip}>
                <IconSymbol name="square.on.square" size={14} color="#1a9e73" />
                <ThemedText style={styles.chipText}>{method}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function CareRow({
  icon,
  tint,
  color,
  label,
  value,
}: {
  icon: 'drop.fill' | 'sun.max.fill' | 'leaf.fill' | 'pawprint.fill';
  tint: string;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.careRow}>
      <View style={[styles.careIcon, { backgroundColor: tint }]}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <View style={styles.careText}>
        <ThemedText style={styles.careLabel}>{label}</ThemedText>
        <ThemedText style={styles.careValue}>{value}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontFamily: UIFont.medium, fontSize: 16, color: '#8A958D' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  headerSafe: { backgroundColor: '#ffffff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 52,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: UIFont.semibold,
    fontSize: 17,
    lineHeight: 23,
    color: '#14281B',
    marginHorizontal: 8,
  },
  addCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDF1EF',
  },
  topicBarContent: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  topic: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F1F4F2',
  },
  topicActive: { backgroundColor: '#E4F5EE' },
  topicLabel: { fontFamily: UIFont.semibold, fontSize: 13.5, color: '#6E7D73' },
  topicLabelActive: { color: '#1a9e73' },
  hero: {
    height: 180,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  name: { fontFamily: UIFont.bold, fontSize: 26, lineHeight: 34, color: '#14281B', marginTop: 18 },
  sciName: {
    fontFamily: UIFont.medium,
    fontSize: 15,
    lineHeight: 20,
    color: '#8A958D',
    fontStyle: 'italic',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  badgeText: { fontFamily: UIFont.semibold, fontSize: 13 },
  description: {
    fontFamily: UIFont.medium,
    fontSize: 15,
    lineHeight: 23,
    color: '#4A5750',
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: UIFont.bold,
    fontSize: 18,
    lineHeight: 24,
    color: '#14281B',
    marginTop: 26,
    marginBottom: 10,
  },
  careRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  careIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  careText: { flex: 1 },
  careLabel: { fontFamily: UIFont.semibold, fontSize: 15, lineHeight: 21, color: '#14281B' },
  careValue: { fontFamily: UIFont.medium, fontSize: 14, lineHeight: 20, color: '#6E7A72', marginTop: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F4F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { fontFamily: UIFont.medium, fontSize: 13, color: '#3A4A40' },
});