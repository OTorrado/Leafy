import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      icon="leaf.fill"
      title="Plant Detail"
      description={`Care guide for plant "${id}" will appear here, with an option to add it to My Plants.`}
    />
  );
}
