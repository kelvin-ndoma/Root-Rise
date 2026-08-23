function resolveSiteUrl() {
  for (const value of [process.env.AUTH_URL, process.env.NEXTAUTH_URL, process.env.VERCEL_URL]) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    try {
      return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`).origin;
    } catch {
      continue;
    }
  }
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "Root and Rise",
  legalName: "Root and Rise",
  tagline: "Cake ingredients & confectionery supplies",
  description:
    "Root and Rise is a premium marketplace for cake ingredients, decorations, baking tools, chocolates, and confectionery supplies.",
  url: resolveSiteUrl(),
  currency: "KES" as const,
  locale: "en-KE",
  supportEmail: "hello@rootandrise.test",
  supportPhone: "+254 700 000 000",
  navigation: [
    { href: "/shop", label: "Shop" },
    { href: "/categories", label: "Categories" },
  ],
} as const;

export const kenyaCounties = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
] as const;
