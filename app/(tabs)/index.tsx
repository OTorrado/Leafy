import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboarding } from '@/components/onboarding-provider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, HeadingFont, UIFont } from '@/constants/theme';

const EMPTY_ART = require('@/assets/images/main-screen.png');

export default function MyPlantsScreen() {
  const router = useRouter();
  const { reset } = useOnboarding();

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ThemedText style={styles.header}>My Plants</ThemedText>

        <View style={styles.center}>
          <Image source={EMPTY_ART} style={styles.art} contentFit="contain" />
          <ThemedText style={styles.emptyTitle}>No plants added yet</ThemedText>
          <ThemedText style={styles.emptyText}>
            Add your first plant and Leafy will help you keep it happy.
          </ThemedText>

          <Pressable
            onPress={() => router.push('/identify')}
            style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.9 }]}>
            <ThemedText style={styles.addButtonLabel}>+ Add a plant</ThemedText>
          </Pressable>
        </View>

        {__DEV__ && (
          <Pressable onPress={reset} style={styles.devButton}>
            <ThemedText style={styles.devButtonText}>↺ Reset onboarding (dev)</ThemedText>
          </Pressable>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  header: {
    fontFamily: HeadingFont.bold,
    fontSize: 30,
    color: '#1E3A24',
    paddingTop: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  art: { width: 200, height: 200, marginBottom: 8 },
  emptyTitle: {
    fontFamily: UIFont.semibold,
    fontSize: 20,
    color: '#1E2A20',
  },
  emptyText: {
    fontFamily: UIFont.medium,
    fontSize: 15,
    color: '#5F6C64',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  addButton: {
    marginTop: 12,
    backgroundColor: Brand.green,
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 28,
    shadowColor: Brand.green,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  addButtonLabel: { fontFamily: UIFont.semibold, fontSize: 17, color: '#ffffff' },
  devButton: {
    alignSelf: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  devButtonText: { color: '#ff6b6b', fontSize: 13, fontWeight: '600' },
});
