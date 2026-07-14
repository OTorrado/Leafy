import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';

/**
 * Shows a plant's photo, falling back to an emoji on a tinted background while
 * the image loads or if it fails. `style` controls size / border radius.
 */
export function PlantImage({
  uri,
  emoji,
  tint,
  emojiSize = 26,
  style,
}: {
  uri?: string;
  emoji: string;
  tint: string;
  emojiSize?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !uri || failed;

  return (
    <View style={[styles.base, { backgroundColor: tint }, style]}>
      <ThemedText style={{ fontSize: emojiSize }}>{emoji}</ThemedText>
      {!showFallback && (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
        />
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