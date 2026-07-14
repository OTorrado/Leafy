/**
 * Plant catalog data layer.
 *
 * The shapes here mirror the Plant.id (Kindwise) v3 Knowledge Base API so that
 * swapping this mock for the live Supabase proxy is a one-file change:
 *   - name search:  GET /api/v3/kb/plants/name_search?q=...  (free)
 *   - detail:       GET /api/v3/kb/plants/:access_token      (0.5 credits)
 * `token` maps to the API's `access_token`.
 */

export type PlantSummary = {
  /** Maps to the API `access_token`. */
  token: string;
  scientificName: string;
  commonName: string;
  /** Photo URL (API `thumbnails` on search, `image` on detail). */
  imageUrl?: string;
  /** Emoji fallback shown while the photo loads or if it fails. */
  emoji: string;
  tint: string;
};

export type PlantCare = {
  watering: string;
  light: string;
  soil: string;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  toxicity: string;
};

export type PlantDetail = PlantSummary & {
  commonNames: string[];
  description: string;
  care: PlantCare;
  propagation: string[];
  wikiUrl?: string;
};

const CATALOG: PlantDetail[] = [
  {
    token: 'monstera-deliciosa',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Monstera_deliciosa2.jpg/330px-Monstera_deliciosa2.jpg',
    scientificName: 'Monstera deliciosa',
    commonName: 'Swiss Cheese Plant',
    emoji: '🌿',
    tint: '#E4F5EE',
    commonNames: ['Swiss Cheese Plant', 'Split-leaf Philodendron', 'Monstera'],
    description:
      'A climbing evergreen loved for its large, glossy leaves that develop dramatic holes and splits as it matures. Forgiving and fast-growing, it is one of the most popular houseplants.',
    care: {
      watering: 'Every 1–2 weeks, once the top 2–3 cm of soil are dry.',
      light: 'Bright, indirect light. Avoid harsh direct sun.',
      soil: 'Well-draining, peat-based potting mix.',
      difficulty: 'Easy',
      toxicity: 'Toxic to cats and dogs if ingested.',
    },
    propagation: ['Stem cuttings in water', 'Air layering'],
    wikiUrl: 'https://en.wikipedia.org/wiki/Monstera_deliciosa',
  },
  {
    token: 'ficus-lyrata',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Starr_031108-0130_Ficus_lyrata.jpg/330px-Starr_031108-0130_Ficus_lyrata.jpg',
    scientificName: 'Ficus lyrata',
    commonName: 'Fiddle Leaf Fig',
    emoji: '🌳',
    tint: '#EAF1FE',
    commonNames: ['Fiddle Leaf Fig', 'Banjo Fig'],
    description:
      'A striking indoor tree with large, violin-shaped leaves. It makes a bold statement but prefers a stable spot and consistent care.',
    care: {
      watering: 'Every 7–10 days when the top layer of soil dries out.',
      light: 'Bright, filtered light near a window.',
      soil: 'Rich, well-draining indoor potting mix.',
      difficulty: 'Moderate',
      toxicity: 'Mildly toxic to pets and humans.',
    },
    propagation: ['Stem cuttings', 'Air layering'],
    wikiUrl: 'https://en.wikipedia.org/wiki/Ficus_lyrata',
  },
  {
    token: 'sansevieria-trifasciata',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg/330px-Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg',
    scientificName: 'Dracaena trifasciata',
    commonName: 'Snake Plant',
    emoji: '🌱',
    tint: '#EDEBFB',
    commonNames: ['Snake Plant', "Mother-in-law's Tongue", 'Sansevieria'],
    description:
      'An almost indestructible succulent with stiff, upright leaves. It tolerates neglect, low light, and irregular watering, making it perfect for beginners.',
    care: {
      watering: 'Every 2–4 weeks. Let the soil dry out completely first.',
      light: 'Tolerates low light; thrives in bright, indirect light.',
      soil: 'Free-draining cactus or succulent mix.',
      difficulty: 'Easy',
      toxicity: 'Toxic to cats and dogs if ingested.',
    },
    propagation: ['Leaf cuttings', 'Division of rhizomes'],
    wikiUrl: 'https://en.wikipedia.org/wiki/Dracaena_trifasciata',
  },
  {
    token: 'epipremnum-aureum',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Money_Plant_%28Epipremnum_aureum%29_4.jpg/330px-Money_Plant_%28Epipremnum_aureum%29_4.jpg',
    scientificName: 'Epipremnum aureum',
    commonName: 'Golden Pothos',
    emoji: '🍃',
    tint: '#E4F5EE',
    commonNames: ['Golden Pothos', "Devil's Ivy", 'Money Plant'],
    description:
      'A trailing vine with heart-shaped, marbled leaves. Extremely easy to grow and quick to trail from shelves or climb a moss pole.',
    care: {
      watering: 'Every 1–2 weeks when the top soil feels dry.',
      light: 'Low to bright, indirect light.',
      soil: 'Standard well-draining potting mix.',
      difficulty: 'Easy',
      toxicity: 'Toxic to cats and dogs if ingested.',
    },
    propagation: ['Stem cuttings in water'],
    wikiUrl: 'https://en.wikipedia.org/wiki/Epipremnum_aureum',
  },
  {
    token: 'spathiphyllum-wallisii',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Peace_lily_-_1_-_cropped.jpg/330px-Peace_lily_-_1_-_cropped.jpg',
    scientificName: 'Spathiphyllum wallisii',
    commonName: 'Peace Lily',
    emoji: '🌸',
    tint: '#FBEAF1',
    commonNames: ['Peace Lily', 'White Sail Plant'],
    description:
      'An elegant plant with glossy leaves and white, hood-like flowers. It clearly droops when thirsty, making its needs easy to read.',
    care: {
      watering: 'About once a week; it wilts visibly when it needs water.',
      light: 'Medium to low, indirect light.',
      soil: 'Moisture-retentive but well-draining mix.',
      difficulty: 'Easy',
      toxicity: 'Toxic to cats and dogs if ingested.',
    },
    propagation: ['Division at repotting'],
    wikiUrl: 'https://en.wikipedia.org/wiki/Spathiphyllum_wallisii',
  },
  {
    token: 'zamioculcas-zamiifolia',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Zamioculcas_zamiifolia_1.jpg/330px-Zamioculcas_zamiifolia_1.jpg',
    scientificName: 'Zamioculcas zamiifolia',
    commonName: 'ZZ Plant',
    emoji: '🪴',
    tint: '#EAF1FE',
    commonNames: ['ZZ Plant', 'Zanzibar Gem', 'Emerald Palm'],
    description:
      'A glossy, waxy-leaved plant that stores water in its rhizomes, letting it survive long periods of drought and low light.',
    care: {
      watering: 'Every 2–3 weeks; allow soil to dry out fully.',
      light: 'Low to bright, indirect light.',
      soil: 'Well-draining potting mix.',
      difficulty: 'Easy',
      toxicity: 'Toxic to pets and humans if ingested.',
    },
    propagation: ['Leaf cuttings', 'Division'],
    wikiUrl: 'https://en.wikipedia.org/wiki/Zamioculcas',
  },
  {
    token: 'chlorophytum-comosum',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Chlorophytum_comosum_plant%2C_April_2023.jpg/500px-Chlorophytum_comosum_plant%2C_April_2023.jpg',
    scientificName: 'Chlorophytum comosum',
    commonName: 'Spider Plant',
    emoji: '🌾',
    tint: '#E4F5EE',
    commonNames: ['Spider Plant', 'Airplane Plant', 'Ribbon Plant'],
    description:
      'A cheerful, arching plant that sends out baby plantlets on long stems. Adaptable, forgiving, and safe around pets.',
    care: {
      watering: 'Once a week; keep lightly moist in summer.',
      light: 'Bright, indirect light.',
      soil: 'General-purpose well-draining mix.',
      difficulty: 'Easy',
      toxicity: 'Non-toxic and pet-safe.',
    },
    propagation: ['Plant the plantlets (spiderettes)'],
    wikiUrl: 'https://en.wikipedia.org/wiki/Chlorophytum_comosum',
  },
  {
    token: 'aloe-vera',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Potted_Aloe_vera_plant.jpg/500px-Potted_Aloe_vera_plant.jpg',
    scientificName: 'Aloe vera',
    commonName: 'Aloe Vera',
    emoji: '🌵',
    tint: '#FBF3E4',
    commonNames: ['Aloe Vera', 'True Aloe', 'Medicinal Aloe'],
    description:
      'A hardy succulent with thick, gel-filled leaves used for skin care. It thrives on bright light and minimal watering.',
    care: {
      watering: 'Every 2–3 weeks; let soil dry completely between waterings.',
      light: 'Bright light, including some direct sun.',
      soil: 'Sandy, fast-draining cactus mix.',
      difficulty: 'Easy',
      toxicity: 'Mildly toxic to cats and dogs.',
    },
    propagation: ['Offsets (pups)'],
    wikiUrl: 'https://en.wikipedia.org/wiki/Aloe_vera',
  },
  {
    token: 'calathea-orbifolia',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Calathea_orbifolia_2.jpg/330px-Calathea_orbifolia_2.jpg',
    scientificName: 'Goeppertia orbifolia',
    commonName: 'Calathea Orbifolia',
    emoji: '🍀',
    tint: '#E4F5EE',
    commonNames: ['Calathea Orbifolia', 'Prayer Plant'],
    description:
      'Prized for its large, round leaves striped in silver-green. It folds its leaves at night and prefers humidity and steady moisture.',
    care: {
      watering: 'Keep lightly moist; water when the top layer dries.',
      light: 'Medium, indirect light. No direct sun.',
      soil: 'Moisture-retentive, peat-based mix.',
      difficulty: 'Advanced',
      toxicity: 'Non-toxic and pet-safe.',
    },
    propagation: ['Division at repotting'],
    wikiUrl: 'https://en.wikipedia.org/wiki/Goeppertia',
  },
  {
    token: 'dracaena-marginata',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Dracaena_Marginata.jpg/500px-Dracaena_Marginata.jpg',
    scientificName: 'Dracaena marginata',
    commonName: 'Dragon Tree',
    emoji: '🌴',
    tint: '#EDEBFB',
    commonNames: ['Dragon Tree', 'Madagascar Dragon Tree'],
    description:
      'A slim, tree-like plant with spiky, red-edged leaves. Architectural, slow-growing, and very tolerant of neglect.',
    care: {
      watering: 'Every 2 weeks; let the top half of soil dry out.',
      light: 'Bright, indirect light; tolerates medium light.',
      soil: 'Loose, well-draining potting mix.',
      difficulty: 'Easy',
      toxicity: 'Toxic to cats and dogs if ingested.',
    },
    propagation: ['Stem cuttings'],
    wikiUrl: 'https://en.wikipedia.org/wiki/Dracaena_marginata',
  },
  {
    token: 'crassula-ovata',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Crassula_ovata_700.jpg/500px-Crassula_ovata_700.jpg',
    scientificName: 'Crassula ovata',
    commonName: 'Jade Plant',
    emoji: '🪴',
    tint: '#FBF3E4',
    commonNames: ['Jade Plant', 'Money Tree', 'Lucky Plant'],
    description:
      'A charming succulent with plump, oval leaves and a tree-like form. Long-lived and easy, it is often passed down for generations.',
    care: {
      watering: 'Every 2–3 weeks; let soil dry fully between waterings.',
      light: 'Bright light with some direct sun.',
      soil: 'Fast-draining succulent mix.',
      difficulty: 'Easy',
      toxicity: 'Mildly toxic to cats and dogs.',
    },
    propagation: ['Leaf or stem cuttings'],
    wikiUrl: 'https://en.wikipedia.org/wiki/Crassula_ovata',
  },
  {
    token: 'ficus-elastica',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Ficus_elastica_leaves_02.JPG/500px-Ficus_elastica_leaves_02.JPG',
    scientificName: 'Ficus elastica',
    commonName: 'Rubber Plant',
    emoji: '🌿',
    tint: '#EAF1FE',
    commonNames: ['Rubber Plant', 'Rubber Fig', 'Rubber Tree'],
    description:
      'A robust indoor tree with large, leathery, deep-green leaves. Easygoing and fast-growing in the right light.',
    care: {
      watering: 'Every 1–2 weeks when the top soil dries.',
      light: 'Bright, indirect light.',
      soil: 'Well-draining potting mix.',
      difficulty: 'Easy',
      toxicity: 'Toxic to cats and dogs if ingested.',
    },
    propagation: ['Stem cuttings', 'Air layering'],
    wikiUrl: 'https://en.wikipedia.org/wiki/Ficus_elastica',
  },
];

const toSummary = (p: PlantDetail): PlantSummary => ({
  token: p.token,
  scientificName: p.scientificName,
  commonName: p.commonName,
  imageUrl: p.imageUrl,
  emoji: p.emoji,
  tint: p.tint,
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Plants shown by default before the user types anything. */
export async function getPopularPlants(): Promise<PlantSummary[]> {
  await delay(200);
  return CATALOG.map(toSummary);
}

/** Name search across the catalog (mirrors the free `name_search` endpoint). */
export async function searchPlants(query: string): Promise<PlantSummary[]> {
  await delay(280);
  const q = query.trim().toLowerCase();
  if (!q) return CATALOG.map(toSummary);
  return CATALOG.filter((p) => {
    const haystack = [p.commonName, p.scientificName, ...p.commonNames].join(' ').toLowerCase();
    return haystack.includes(q);
  }).map(toSummary);
}

/** Full detail for one plant (mirrors the `access_token` detail endpoint). */
export async function getPlant(token: string): Promise<PlantDetail | null> {
  await delay(220);
  return CATALOG.find((p) => p.token === token) ?? null;
}