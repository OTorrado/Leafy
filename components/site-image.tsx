import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { Site } from '@/lib/sites';

/**
 * A site's room photo, falling back to its emoji on a tinted background for
 * sites that don't have a photo yet. `style` controls size / border radius.
 */
export function SiteImage({
  site,
  emojiSize = 24,
  style,
}: {
  site: Site;
  emojiSize?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.base, { backgroundColor: site.tint }, style]}>
      {site.image ? (
        <Image source={site.image} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <ThemedText style={{ fontSize: emojiSize }}>{site.emoji}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
