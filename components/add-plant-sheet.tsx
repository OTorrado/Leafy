import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UIFont } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onSearch: () => void;
};

export function AddPlantSheet({ visible, onClose, onCamera, onSearch }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
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
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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