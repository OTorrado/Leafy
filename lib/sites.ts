import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImageSourcePropType } from 'react-native';

const STORAGE_KEY = 'leafy.sites.v1';

/** Preset locations a plant can live in. */
export type Site = {
  id: string;
  name: string;
  /** Fallback shown when the site has no photo yet. */
  emoji: string;
  tint: string;
  /** Room photo; sites without one fall back to the emoji. */
  image?: ImageSourcePropType;
};

export const SITES: Site[] = [
  {
    id: 'living-room',
    name: 'Living room',
    emoji: '🛋️',
    tint: '#E4F5EE',
    image: require('@/assets/images/sites/living-room.png'),
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    emoji: '🍽️',
    tint: '#FBF3E4',
    image: require('@/assets/images/sites/kitchen.png'),
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    emoji: '🛏️',
    tint: '#EAF1FE',
    image: require('@/assets/images/sites/bedroom.png'),
  },
  {
    id: 'dining-room',
    name: 'Dining room',
    emoji: '🍴',
    tint: '#FBEAF1',
    image: require('@/assets/images/sites/dining.png'),
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    emoji: '🛁',
    tint: '#EDEBFB',
    image: require('@/assets/images/sites/bathroom.png'),
  },
  {
    id: 'hall',
    name: 'Hall',
    emoji: '🚪',
    tint: '#E4F5EE',
    image: require('@/assets/images/sites/hall.png'),
  },
  {
    id: 'office',
    name: 'Office',
    emoji: '💻',
    tint: '#EAF1FE',
    image: require('@/assets/images/sites/office.png'),
  },
  {
    id: 'front-yard',
    name: 'Front yard',
    emoji: '🏡',
    tint: '#FBF3E4',
    image: require('@/assets/images/sites/front-yard.png'),
  },
  {
    id: 'backyard',
    name: 'Backyard',
    emoji: '🌳',
    tint: '#E4F5EE',
    image: require('@/assets/images/sites/backyard.png'),
  },
  {
    id: 'porch',
    name: 'Porch',
    emoji: '🌺',
    tint: '#FBEAF1',
    image: require('@/assets/images/sites/porch.png'),
  },
  {
    id: 'terrace',
    name: 'Terrace',
    emoji: '🌇',
    tint: '#FBF3E4',
    image: require('@/assets/images/sites/terrace.png'),
  },
  {
    id: 'balcony',
    name: 'Balcony',
    emoji: '🌤️',
    tint: '#EAF1FE',
    image: require('@/assets/images/sites/balcony.png'),
  },
];

export function getSite(id?: string): Site | undefined {
  return SITES.find((s) => s.id === id);
}

/** Ids of the sites the user has chosen to use. */
export async function loadActiveSites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function persistActiveSites(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore write failures; state stays in memory for this session.
  }
}
