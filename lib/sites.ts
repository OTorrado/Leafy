/** Preset locations a plant can live in. */
export type Site = {
  id: string;
  name: string;
  emoji: string;
  tint: string;
};

export const SITES: Site[] = [
  { id: 'living-room', name: 'Living Room', emoji: '🛋️', tint: '#E4F5EE' },
  { id: 'bedroom', name: 'Bedroom', emoji: '🛏️', tint: '#EAF1FE' },
  { id: 'kitchen', name: 'Kitchen', emoji: '🍽️', tint: '#FBF3E4' },
  { id: 'bathroom', name: 'Bathroom', emoji: '🛁', tint: '#EDEBFB' },
  { id: 'balcony', name: 'Balcony', emoji: '🌤️', tint: '#FBEAF1' },
  { id: 'office', name: 'Office', emoji: '💻', tint: '#E4F5EE' },
  { id: 'garden', name: 'Garden', emoji: '🌳', tint: '#EAF1FE' },
  { id: 'windowsill', name: 'Windowsill', emoji: '🪟', tint: '#FBF3E4' },
];

export function getSite(id?: string): Site | undefined {
  return SITES.find((s) => s.id === id);
}