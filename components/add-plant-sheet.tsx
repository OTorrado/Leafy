import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UIFont } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onSearch: () => void;
};

export function AddPlantSheet({ visible, onClose, onCamera, onSearch }: Props) {
  const insets = useSafeAreaInsets();
  const [rendered, setRendered] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      progress.value = withTiming(1, { duration: 260 });
    } else if (rendered) {
      progress.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) runOnJS(setRendered)(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 500 }],
  }));

  if (!rendered) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.fill}>
        <AnimatedPressable
          style={[styles.backdrop, backdropStyle]}
          onPress={onClose}
        />
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }, sheetStyle]}>
          <View style={styles.grabber} />
          <ThemedText style={styles.title}>Add a plant</ThemedText>

          <Pressable
            onPress={onCamera}
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
            <View style={[styles.iconCircle, { backgroundColor: '#E4F5EE' }]}>
              <IconSymbol name="camera.fill" size={22} color="#1fc38e" />
            </View>
            <View style={styles.optionText}>
              <ThemedText style={styles.optionTitle}>Take a photo</ThemedText>
              <ThemedText style={styles.optionSub}>Identify a plant with your camera</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#C4CCC7" />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            onPress={onSearch}
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
            <View style={[styles.iconCircle, { backgroundColor: '#EAF1FE' }]}>
              <IconSymbol name="magnifyingglass" size={22} color="#3E7BFA" />
            </View>
            <View style={styles.optionText}>
              <ThemedText style={styles.optionTitle}>Search the database</ThemedText>
              <ThemedText style={styles.optionSub}>Find a plant by name</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#C4CCC7" />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E7E4',
    marginBottom: 14,
  },
  title: {
    fontFamily: UIFont.bold,
    fontSize: 20,
    lineHeight: 27,
    color: '#14281B',
    marginBottom: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionPressed: { opacity: 0.6 },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionText: { flex: 1 },
  optionTitle: { fontFamily: UIFont.semibold, fontSize: 16, lineHeight: 22, color: '#14281B' },
  optionSub: { fontFamily: UIFont.medium, fontSize: 13, lineHeight: 18, color: '#8A958D' },
  divider: { height: 1, backgroundColor: '#F0F2F1', marginLeft: 60 },
});