import { Pressable, StyleSheet } from 'react-native';

import { useOnboarding } from '@/components/onboarding-provider';
import { PlaceholderScreen } from '@/components/placeholder-screen';
import { ThemedText } from '@/components/themed-text';

export default function MyPlantsScreen() {
  const { reset } = useOnboarding();

  return (
    <PlaceholderScreen
      icon="leaf.fill"
      title="My Plants"
      description="Your saved plants will live here. Identify a plant to add your first one.">
      {__DEV__ && (
        <Pressable onPress={reset} style={styles.devButton}>
          <ThemedText style={styles.devButtonText}>↺ Reset onboarding (dev)</ThemedText>
        </Pressable>
      )}
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  devButton: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  devButtonText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
});
