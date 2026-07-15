import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddPlantSheet } from '@/components/add-plant-sheet';
import { BottomSheet } from '@/components/bottom-sheet';
import { useMyPlants } from '@/components/my-plants-provider';
import { PlantImage } from '@/components/plant-image';
import { SiteChooser } from '@/components/site-chooser';
import { SiteImage } from '@/components/site-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand, UIFont } from '@/constants/theme';
import { useActiveSites } from '@/hooks/use-active-sites';
import type { SavedPlant } from '@/lib/my-plants';
import { getSite, type Site } from '@/lib/sites';

const EMPTY_ART = require('@/assets/images/platns-2d.png');

export default function MyPlantsScreen() {
  const router = useRouter();
  const { plants, removePlant, assignSite } = useMyPlants();
  const { activeSiteIds, isLoading: sitesLoading, saveSites } = useActiveSites();
  const [tab, setTab] = useState<'plants' | 'sites'>('plants');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuPlant, setMenuPlant] = useState<SavedPlant | null>(null);
  const [menuSite, setMenuSite] = useState<Site | null>(null);
  const [chooserOpen, setChooserOpen] = useState(false);

  /** Drop a site and release any plants that lived in it. */
  const handleRemoveSite = (site: Site) => {
    saveSites(activeSiteIds.filter((id) => id !== site.id));
    plants
      .filter((p) => p.siteId === site.id)
      .forEach((p) => assignSite(p.token, undefined));
    setMenuSite(null);
  };

  const showGrid = tab === 'plants' && plants.length > 0;
  // Show the chooser when adding sites, or when none have been picked yet.
  const showChooser = !sitesLoading && (chooserOpen || activeSiteIds.length === 0);
  const activeSites = activeSiteIds.map(getSite).filter((s) => s !== undefined);

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.headerRow}>
          <ThemedText style={styles.header}>My Plants</ThemedText>
          <View style={styles.headerIcons}>
            <View style={styles.heartCircle}>
              <IconSymbol name="heart.fill" size={17} color="#ffffff" />
            </View>
            <ThemedText style={styles.diamond}>💎</ThemedText>
            <IconSymbol name="gearshape.fill" size={24} color="#3A4A40" />
          </View>
        </View>

        {/* Plants / Sites segmented control */}
        <View style={styles.segment}>
          {(['plants', 'sites'] as const).map((key) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={[styles.segItem, active && styles.segItemActive]}>
                <ThemedText style={[styles.segText, active && styles.segTextActive]}>
                  {key === 'plants' ? 'Plants' : 'Sites'}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {tab === 'sites' && showChooser ? (
          <SiteChooser
            initialSelected={activeSiteIds}
            onDone={(ids) => {
              saveSites(ids);
              setChooserOpen(false);
            }}
          />
        ) : tab === 'sites' ? (
          <FlatList
            data={activeSites}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              <Pressable
                onPress={() => setChooserOpen(true)}
                style={({ pressed }) => [styles.editSitesButton, pressed && { opacity: 0.7 }]}>
                <IconSymbol name="plus" size={18} color="#1a9e73" />
                <ThemedText style={styles.editSitesLabel}>Add or edit sites</ThemedText>
              </Pressable>
            }
            renderItem={({ item }) => {
              const count = plants.filter((p) => p.siteId === item.id).length;
              return (
                <Pressable
                  onPress={() => router.push(`/site/${item.id}`)}
                  style={({ pressed }) => [styles.siteRow, pressed && { opacity: 0.85 }]}>
                  <SiteImage site={item} emojiSize={24} style={styles.siteTile} />
                  <View style={styles.siteText}>
                    <ThemedText style={styles.siteName}>{item.name}</ThemedText>
                    <ThemedText style={styles.siteCount}>
                      {count === 0 ? 'No plants yet' : count === 1 ? '1 plant' : `${count} plants`}
                    </ThemedText>
                  </View>

                  <Pressable
                    onPress={() => setMenuSite(item)}
                    hitSlop={10}
                    accessibilityLabel={`Options for ${item.name}`}
                    style={({ pressed }) => [styles.menuButton, pressed && { opacity: 0.5 }]}>
                    <IconSymbol name="ellipsis" size={18} color="#8A958D" />
                  </Pressable>
                </Pressable>
              );
            }}
          />
        ) : showGrid ? (
          <FlatList
            data={plants}
            keyExtractor={(item) => item.token}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const site = getSite(item.siteId);
              return (
              <Pressable
                onPress={() => router.push(`/plant/${item.token}`)}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
                <PlantImage
                  uri={item.imageUrl}
                  emoji={item.emoji}
                  tint={item.tint}
                  emojiSize={34}
                  style={styles.cardImage}
                />
                <View style={styles.cardBody}>
                  <ThemedText style={styles.cardName} numberOfLines={1}>
                    {item.commonName}
                  </ThemedText>
                  <ThemedText style={styles.cardSci} numberOfLines={1}>
                    {item.scientificName}
                  </ThemedText>
                  {site && (
                    <View style={styles.cardSiteRow}>
                      <IconSymbol
                        name="mappin"
                        size={12}
                        color="#1a9e73"
                        style={styles.siteIcon}
                      />
                      <ThemedText style={styles.cardSiteText} numberOfLines={1}>
                        {site.name}
                      </ThemedText>
                    </View>
                  )}
                  <View style={styles.cardWaterRow}>
                    <IconSymbol name="drop.fill" size={13} color="#3E7BFA" style={styles.waterIcon} />
                    <ThemedText style={styles.cardWaterText}>{item.wateringSummary}</ThemedText>
                  </View>
                </View>

                <Pressable
                  onPress={() => setMenuPlant(item)}
                  hitSlop={10}
                  accessibilityLabel={`Options for ${item.commonName}`}
                  style={({ pressed }) => [styles.menuButton, pressed && { opacity: 0.5 }]}>
                  <IconSymbol name="ellipsis" size={18} color="#8A958D" />
                </Pressable>
              </Pressable>
              );
            }}
            ListFooterComponent={
              <Pressable
                onPress={() => setSheetOpen(true)}
                style={({ pressed }) => [styles.addMoreButton, pressed && { opacity: 0.9 }]}>
                <ThemedText style={styles.addButtonLabel}>+ Add a Plant</ThemedText>
              </Pressable>
            }
          />
        ) : (
          <View style={styles.center}>
            <Image source={EMPTY_ART} style={styles.art} contentFit="contain" />
            <ThemedText style={styles.emptyTitle}>No plant added yet</ThemedText>
            <ThemedText style={styles.emptyText}>
              {tab === 'plants'
                ? 'Your added plants will be listed here by site category'
                : 'Group your plants into sites like Living Room or Balcony'}
            </ThemedText>

            <Pressable
              onPress={() => setSheetOpen(true)}
              style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.9 }]}>
              <ThemedText style={styles.addButtonLabel}>+ Add Your First Plant</ThemedText>
            </Pressable>
          </View>
        )}
      </SafeAreaView>

      <AddPlantSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCamera={() => {
          setSheetOpen(false);
          router.push('/identify');
        }}
        onSearch={() => {
          setSheetOpen(false);
          router.push('/search');
        }}
      />

      {/* Per-plant options */}
      <BottomSheet visible={!!menuPlant} onClose={() => setMenuPlant(null)}>
        <ThemedText style={styles.menuTitle} numberOfLines={1}>
          {menuPlant?.commonName}
        </ThemedText>
        <Pressable
          onPress={() => {
            if (menuPlant) removePlant(menuPlant.token);
            setMenuPlant(null);
          }}
          style={({ pressed }) => [styles.menuOption, pressed && { opacity: 0.6 }]}>
          <View style={styles.menuIcon}>
            <IconSymbol name="trash" size={20} color="#E5484D" />
          </View>
          <ThemedText style={styles.menuOptionText}>Remove plant</ThemedText>
        </Pressable>
      </BottomSheet>

      {/* Per-site options */}
      <BottomSheet visible={!!menuSite} onClose={() => setMenuSite(null)}>
        <ThemedText style={styles.menuTitle} numberOfLines={1}>
          {menuSite?.name}
        </ThemedText>
        <Pressable
          onPress={() => menuSite && handleRemoveSite(menuSite)}
          style={({ pressed }) => [styles.menuOption, pressed && { opacity: 0.6 }]}>
          <View style={styles.menuIcon}>
            <IconSymbol name="trash" size={20} color="#E5484D" />
          </View>
          <View style={styles.menuOptionBody}>
            <ThemedText style={styles.menuOptionText}>Remove site</ThemedText>
            <ThemedText style={styles.menuOptionSub}>
              Plants here stay in My Plants, just without a site.
            </ThemedText>
          </View>
        </Pressable>
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 14 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  header: { fontFamily: UIFont.bold, fontSize: 26, lineHeight: 34, color: '#14281B' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heartCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diamond: { fontSize: 22 },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#E4F5EE',
    borderRadius: 13,
    padding: 4,
    marginTop: 18,
  },
  segItem: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  segItemActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segText: { fontFamily: UIFont.semibold, fontSize: 15, color: '#6E7D73' },
  segTextActive: { color: '#14281B' },

  // Sites
  editSitesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 4,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#D5E8DF',
    borderStyle: 'dashed',
  },
  editSitesLabel: { fontFamily: UIFont.semibold, fontSize: 15, color: '#1a9e73' },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  siteTile: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  siteText: { flex: 1, marginLeft: 12, marginRight: 26 },
  siteName: { fontFamily: UIFont.semibold, fontSize: 16, lineHeight: 21, color: '#14281B' },
  siteCount: { fontFamily: UIFont.medium, fontSize: 12.5, lineHeight: 17, color: '#8A958D' },

  // List of plant cards
  listContent: { paddingTop: 16, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardImage: { width: 72, height: 72, borderRadius: 14 },
  cardBody: { flex: 1, marginLeft: 12, marginRight: 26 },
  menuButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { fontFamily: UIFont.semibold, fontSize: 16, lineHeight: 21, color: '#14281B' },
  cardSci: {
    fontFamily: UIFont.medium,
    fontSize: 12.5,
    lineHeight: 17,
    color: '#8A958D',
    fontStyle: 'italic',
    marginTop: 1,
  },
  cardSiteRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  siteIcon: { marginLeft: -1 },
  cardSiteText: { flex: 1, fontFamily: UIFont.semibold, fontSize: 12.5, color: '#1a9e73' },
  cardWaterRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginTop: 5 },
  waterIcon: { marginTop: 2 },
  cardWaterText: {
    flex: 1,
    fontFamily: UIFont.medium,
    fontSize: 12.5,
    lineHeight: 17,
    color: '#6E7A72',
  },
  addMoreButton: {
    marginTop: 6,
    backgroundColor: Brand.green,
    paddingVertical: 15,
    borderRadius: 26,
    alignItems: 'center',
    shadowColor: Brand.green,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  // Empty state
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { width: 104, height: 104, marginBottom: 16 },
  emptyTitle: { fontFamily: UIFont.bold, fontSize: 22, lineHeight: 30, color: '#14281B' },
  emptyText: {
    fontFamily: UIFont.medium,
    fontSize: 14.5,
    lineHeight: 21,
    color: '#6E7A72',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginTop: 8,
  },
  addButton: {
    alignSelf: 'stretch',
    marginTop: 28,
    backgroundColor: Brand.green,
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: 'center',
    shadowColor: Brand.green,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  addButtonLabel: { fontFamily: UIFont.bold, fontSize: 16, color: '#ffffff' },

  // Per-plant options sheet
  menuTitle: {
    fontFamily: UIFont.bold,
    fontSize: 20,
    lineHeight: 27,
    color: '#14281B',
    marginBottom: 6,
  },
  menuOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  menuIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FBEAF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuOptionText: { fontFamily: UIFont.semibold, fontSize: 16, lineHeight: 22, color: '#E5484D' },
  menuOptionBody: { flex: 1 },
  menuOptionSub: { fontFamily: UIFont.medium, fontSize: 12.5, lineHeight: 17, color: '#8A958D' },
});