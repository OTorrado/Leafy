import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addPlant, isSaved } = useMyPlants();
  const [plant, setPlant] = useState<PlantDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
      <Stack.Screen options={{ title: plant.commonName }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <PlantImage
          uri={plant.imageUrl}
          emoji={plant.emoji}
          tint={plant.tint}
          emojiSize={84}
          style={styles.hero}
        />

        {/* Title block */}
        <ThemedText style={styles.name}>{plant.commonName}</ThemedText>
        <ThemedText style={styles.sciName}>{plant.scientificName}</ThemedText>

        <View
          style={[styles.badge, { backgroundColor: DIFFICULTY_TINT[plant.care.difficulty] }]}>
          <IconSymbol name="speedometer" size={14} color={DIFFICULTY_COLOR[plant.care.difficulty]} />
          <ThemedText style={[styles.badgeText, { color: DIFFICULTY_COLOR[plant.care.difficulty] }]}>
            {plant.care.difficulty} care
          </ThemedText>
        </View>

        <ThemedText style={styles.description}>{plant.description}</ThemedText>

        {/* Care */}
        <ThemedText style={styles.sectionTitle}>Care</ThemedText>
        <CareRow icon="drop.fill" tint="#EAF1FE" color="#3E7BFA" label="Watering" value={plant.care.watering} />
        <CareRow icon="sun.max.fill" tint="#FBF3E4" color="#E0A32A" label="Light" value={plant.care.light} />
        <CareRow icon="leaf.fill" tint="#E4F5EE" color="#1a9e73" label="Soil" value={plant.care.soil} />

        {/* Good to know */}
        <ThemedText style={styles.sectionTitle}>Good to know</ThemedText>
        <CareRow icon="pawprint.fill" tint="#FBEAF1" color="#C13B72" label="Toxicity" value={plant.care.toxicity} />

        {/* Propagation */}
        <ThemedText style={styles.sectionTitle}>Propagation</ThemedText>
        <View style={styles.chips}>
          {plant.propagation.map((method) => (
            <View key={method} style={styles.chip}>
              <IconSymbol name="square.on.square" size={14} color="#1a9e73" />
              <ThemedText style={styles.chipText}>{method}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add button */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {saved ? (
          <View style={[styles.addButton, styles.addButtonSaved]}>
            <IconSymbol name="checkmark" size={18} color="#1a9e73" />
            <ThemedText style={styles.addButtonSavedLabel}>Added to My Plants</ThemedText>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              addPlant(toSavedPlant(plant, plant.care.watering));
              router.navigate('/');
            }}
            style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.9 }]}>
            <ThemedText style={styles.addButtonLabel}>+ Add to My Plants</ThemedText>
          </Pressable>
        )}
      </SafeAreaView>
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
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
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
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EAEEEB',
  },
  addButton: {
    backgroundColor: Brand.green,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: Brand.green,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  addButtonLabel: { fontFamily: UIFont.bold, fontSize: 17, color: '#ffffff' },
  addButtonSaved: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#E4F5EE',
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonSavedLabel: { fontFamily: UIFont.bold, fontSize: 17, color: '#1a9e73' },
});