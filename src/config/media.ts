export function unsplash(id: string, width = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}

export const media = {
  hero: unsplash("photo-1578985545062-69928b1d9587", 1800),
  heroSecondary: unsplash("photo-1486427944299-d1955d23e34d", 900),
  banner: unsplash("photo-1557925923-cd4648e211a0", 1600),
  bakery: unsplash("photo-1517433670267-08bbd4be890f", 1200),
  chocolate: unsplash("photo-1606313564200-e75d5e30476c", 1200),
  sprinkles: unsplash("photo-1495147466023-ac5c588e2e94", 1200),
  tools: unsplash("photo-1556909114-f6e7ad7d3136", 1200),
  baking: unsplash("photo-1556910103-1c02745aae4d", 1200),
  flour: unsplash("photo-1509440159596-0249088772ff", 1200),
  cakeSlice: unsplash("photo-1563729784474-d77dbb933a9e", 1200),
  layered: unsplash("photo-1588195538326-c5b1e9f80a1b", 1200),
  strawberry: unsplash("photo-1565958011703-44f9829ba187", 1200),
  macarons: unsplash("photo-1612203985729-70726954388c", 1200),
  desserts: unsplash("photo-1488477181946-6428a0291777", 1200),
  cookies: unsplash("photo-1499636136210-6f4ee915583e", 1200),
  ingredients: unsplash("photo-1464195244916-405fa0a82545", 1200),
  ganache: unsplash("photo-1481391319762-47dff72954d9", 1200),
  cupcakes: unsplash("photo-1614707267537-b85aaf00c4b7", 1200),
  pastry: unsplash("photo-1551024506-0bccd828d307", 1200),
} as const;

export const catalogImages = [
  media.hero,
  media.heroSecondary,
  media.banner,
  media.bakery,
  media.chocolate,
  media.sprinkles,
  media.tools,
  media.baking,
  media.flour,
  media.cakeSlice,
  media.layered,
  media.strawberry,
  media.macarons,
  media.desserts,
  media.cookies,
  media.ingredients,
  media.ganache,
  media.cupcakes,
  media.pastry,
];
