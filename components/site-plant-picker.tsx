import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
import { useMyPlants } from '@/components/my-plants-provider';
import { PlantImage } from '@/components/plant-image';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand, UIFont } from '@/constants/theme';
import { getSite } from '@/lib/sites';

type Props = {
  visible: boolean;
  onClose: () => void;
  siteId: string;
};

/** Pick from the plants you already own and move them into a site. */
export function SitePlantPicker({ visible, onClose, siteId }: Props) {
  const { plants, assignSite } = useMyPlants();
  const available = plants.filter((p) => p.siteId !== siteId);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ThemedText style={styles.title}>Add plants to this site</ThemedText>

      {available.length === 0 ? (
        <ThemedText style={styles.emptyText}>
          {plants.length === 0
            ? 'You have no plants yet. Add one from the My Plants tab first.'
            : 'All of your plants are already in this site.'}
        </ThemedText>
      ) : (
        <FlatList
          data={available}
          keyExtractor={(item) => item.token}
          style={styles.list}
          renderItem={({ item }) => {
            const currentSite = getSite(item.siteId);
            return (
              <Pressable
                onPress={() => assignSite(item.token, siteId)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
                <PlantImage
                  uri={item.imageUrl}
                  emoji={item.emoji}
                  tint={item.tint}
                  emojiSize={22}
                  style={styles.thumb}
                />
                <View style={styles.rowText}>
                  <ThemedText style={styles.rowName} numberOfLines={1}>
                    {item.commonName}
                  </ThemedText>
                  <ThemedText style={styles.rowSub} numberOfLines={1}>
                    {currentSite ? `Currently in ${currentSite.name}` : 'Not in a site yet'}
                  </ThemedText>
                </View>
                <View style={styles.addCircle}>
                  <IconSymbol name="plus" size={20} color="#ffffff" />
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: UIFont.bold,
    fontSize: 20,
    lineHeight: 27,
    color: '#14281B',
    marginBottom: 4,
  },
  list: { maxHeight: 380 },
  emptyText: {
    fontFamily: UIFont.medium,
    fontSize: 14.5,
    lineHeight: 21,
    color: '#8A958D',
    paddingVertical: 18,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  thumb: { width: 46, height: 46, borderRadius: 12 },
  rowText: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowName: { fontFamily: UIFont.semibold, fontSize: 15.5, lineHeight: 21, color: '#14281B' },
  rowSub: { fontFamily: UIFont.medium, fontSize: 12.5, lineHeight: 17, color: '#8A958D' },
  addCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
});