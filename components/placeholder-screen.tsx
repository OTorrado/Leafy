import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SymbolViewProps } from 'expo-symbols';

type Props = {
  icon: SymbolViewProps['name'];
  title: string;
  description: string;
  children?: React.ReactNode;
};

/**
 * Temporary scaffold used while each feature screen is being built out.
 * Swap the body of a screen for real UI once that step is implemented.
 */
export function PlaceholderScreen({ icon, title, description, children }: Props) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <IconSymbol name={icon} size={56} color={Colors[colorScheme].tint} />
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
        {children}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
