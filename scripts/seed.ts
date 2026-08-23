import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import mongoose from "mongoose";
import { hashPassword } from "../src/lib/auth/password";
import { User } from "../src/models/User";
import { Category } from "../src/models/Category";
import { Product } from "../src/models/Product";
import { ProductVariant } from "../src/models/ProductVariant";
import { Order } from "../src/models/Order";
import { OrderItem } from "../src/models/OrderItem";
import { Review } from "../src/models/Review";
import { Coupon } from "../src/models/Coupon";
import { Address } from "../src/models/Address";
import { slugify } from "../src/lib/utils/slug";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

function img(id: string) {
  return {
    url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`,
    alt: "Root and Rise product photography",
  };
}

async function seed() {
  loadEnv();
  const mongoUri = process.env.MONGODB_URI;
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const customerPassword = process.env.SEED_CUSTOMER_PASSWORD;

  if (!mongoUri) throw new Error("MONGODB_URI is required to seed.");
  if (!adminEmail || !adminPassword) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in the environment.");
  }
  if (!customerPassword) {
    throw new Error("SEED_CUSTOMER_PASSWORD must be set in the environment.");
  }

  await mongoose.connect(mongoUri, { dbName: "tassel" });
  console.info("Connected to MongoDB");

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    ProductVariant.deleteMany({}),
    Order.deleteMany({}),
    OrderItem.deleteMany({}),
    Review.deleteMany({}),
    Coupon.deleteMany({}),
    Address.deleteMany({}),
  ]);

  const admin = await User.create({
    name: process.env.SEED_ADMIN_NAME || "Root and Rise Admin",
    email: adminEmail.toLowerCase(),
    passwordHash: await hashPassword(adminPassword),
    role: "ADMIN",
    isActive: true,
  });

  const staff = await User.create({
    name: "Amina Staff",
    email: "staff@tassel.test",
    passwordHash: await hashPassword(customerPassword),
    role: "STAFF",
    isActive: true,
  });

  const customers = await User.create([
    {
      name: "Wanjiku Mwangi",
      email: "wanjiku@tassel.test",
      phone: "+254711111111",
      passwordHash: await hashPassword(customerPassword),
      role: "CUSTOMER",
    },
    {
      name: "Brian Otieno",
      email: "brian@tassel.test",
      phone: "+254722222222",
      passwordHash: await hashPassword(customerPassword),
      role: "CUSTOMER",
    },
    {
      name: "Faith Njeri",
      email: "faith@tassel.test",
      phone: "+254733333333",
      passwordHash: await hashPassword(customerPassword),
      role: "CUSTOMER",
    },
  ]);

  const categoryData = [
    {
      name: "Cake Ingredients",
      description: "Fondant, icing, flavours, and the essentials behind a beautiful cake.",
      image: img("photo-1464195244916-405fa0a82545"),
      sortOrder: 1,
    },
    {
      name: "Decorations",
      description: "Sprinkles, dusts, toppers, and finishing details.",
      image: img("photo-1495147466023-ac5c588e2e94"),
      sortOrder: 2,
    },
    {
      name: "Baking Tools",
      description: "Turntables, spatulas, piping bags, and studio tools.",
      image: img("photo-1556909114-f6e7ad7d3136"),
      sortOrder: 3,
    },
    {
      name: "Packaging",
      description: "Cake boards, boxes, and presentation supplies.",
      image: img("photo-1488477181946-6428a0291777"),
      sortOrder: 4,
    },
    {
      name: "Chocolates",
      description: "Baking chocolate, cocoa, and couverture for confectionery.",
      image: img("photo-1606313564200-e75d5e30476c"),
      sortOrder: 5,
    },
    {
      name: "Food Colours",
      description: "Gel colours and professional colour systems for icing and batter.",
      image: img("photo-1612203985729-70726954388c"),
      sortOrder: 6,
    },
  ];

  const parents = await Category.create(
    categoryData.map((item) => ({ ...item, slug: slugify(item.name), isActive: true })),
  );

  const cakeIngredients = parents.find((item) => item.slug === "cake-ingredients")!;
  const decorations = parents.find((item) => item.slug === "decorations")!;

  const children = await Category.create([
    {
      name: "Fondant",
      slug: "fondant",
      description: "Smooth covering fondant in a range of colours and pack sizes.",
      parent: cakeIngredients._id,
      image: img("photo-1563729784474-d77dbb933a9e"),
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Flavours",
      slug: "flavours",
      description: "Professional flavourings for cakes, creams, and confectionery.",
      parent: cakeIngredients._id,
      image: img("photo-1578985545062-69928b1d9587"),
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Sprinkles & Dusts",
      slug: "sprinkles-and-dusts",
      parent: decorations._id,
      description: "Sprinkles, pearls, and edible glitter.",
      image: img("photo-1495147466023-ac5c588e2e94"),
      isActive: true,
      sortOrder: 1,
    },
  ]);

  const bySlug = Object.fromEntries(
    [...parents, ...children].map((category) => [category.slug, category]),
  );

  type SeedProduct = {
    name: string;
    sku: string;
    category: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    description: string;
    image: string;
    featured?: boolean;
    bestSeller?: boolean;
    specs?: { name: string; value: string }[];
    variants?: { label: string; optionName: string; optionValue: string; price: number; stock: number; sku: string }[];
  };

  const catalog: SeedProduct[] = [
    {
      name: "Vanilla White Fondant",
      sku: "TAS-FON-VAN",
      category: "fondant",
      price: 850,
      compareAtPrice: 950,
      stock: 40,
      featured: true,
      bestSeller: true,
      description: "Smooth, vanilla-scented covering fondant with a satin finish. Rolls thinly without cracking and takes colour well.",
      image: "photo-1563729784474-d77dbb933a9e",
      specs: [
        { name: "Finish", value: "Satin" },
        { name: "Flavour", value: "Vanilla" },
      ],
      variants: [
        { label: "500g", optionName: "Weight", optionValue: "500g", price: 480, stock: 24, sku: "TAS-FON-VAN-500" },
        { label: "1kg", optionName: "Weight", optionValue: "1kg", price: 850, stock: 32, sku: "TAS-FON-VAN-1KG" },
        { label: "2kg", optionName: "Weight", optionValue: "2kg", price: 1580, stock: 12, sku: "TAS-FON-VAN-2KG" },
      ],
    },
    {
      name: "Chocolate Fondant",
      sku: "TAS-FON-CHO",
      category: "fondant",
      price: 920,
      stock: 28,
      bestSeller: true,
      description: "Cocoa fondant with a rich colour and pliable texture, ideal for sculpted cakes and sharp edges.",
      image: "photo-1606313564200-e75d5e30476c",
      variants: [
        { label: "500g", optionName: "Weight", optionValue: "500g", price: 520, stock: 18, sku: "TAS-FON-CHO-500" },
        { label: "1kg", optionName: "Weight", optionValue: "1kg", price: 920, stock: 20, sku: "TAS-FON-CHO-1KG" },
      ],
    },
    {
      name: "Ruby Red Fondant",
      sku: "TAS-FON-RED",
      category: "fondant",
      price: 890,
      stock: 16,
      description: "Deep red covering fondant that holds colour without staining hands excessively.",
      image: "photo-1578985545062-69928b1d9587",
    },
    {
      name: "Madagascar Vanilla Flavouring",
      sku: "TAS-FLV-VAN",
      category: "flavours",
      price: 650,
      stock: 50,
      featured: true,
      bestSeller: true,
      description: "Concentrated vanilla flavouring for buttercream, sponge, and ganache.",
      image: "photo-1481391319762-47dff72954d9",
      specs: [{ name: "Volume", value: "50ml" }],
    },
    {
      name: "Almond Flavouring",
      sku: "TAS-FLV-ALM",
      category: "flavours",
      price: 580,
      stock: 34,
      description: "Clean almond flavour for frangipane, icing, and confectionery creams.",
      image: "photo-1509440159596-0249088772ff",
    },
    {
      name: "Strawberry Flavouring",
      sku: "TAS-FLV-STR",
      category: "flavours",
      price: 560,
      stock: 26,
      description: "Bright strawberry flavouring that stays true in heat and in cold creams.",
      image: "photo-1565958011703-44f9829ba187",
    },
    {
      name: "Professional Gel Colour Set",
      sku: "TAS-COL-SET",
      category: "food-colours",
      price: 1850,
      compareAtPrice: 2100,
      stock: 22,
      featured: true,
      bestSeller: true,
      description: "A twelve-colour gel set for icing, fondant, and batter. Highly concentrated, so a little goes a long way.",
      image: "photo-1612203985729-70726954388c",
    },
    {
      name: "Rose Pink Gel Colour",
      sku: "TAS-COL-PNK",
      category: "food-colours",
      price: 320,
      stock: 40,
      description: "Soft rose pink gel colour for buttercream flowers and celebration cakes.",
      image: "photo-1612203985729-70726954388c",
    },
    {
      name: "Leaf Green Gel Colour",
      sku: "TAS-COL-GRN",
      category: "food-colours",
      price: 320,
      stock: 36,
      description: "Natural leaf green for foliage, cactus cakes, and pistachio-toned icing.",
      image: "photo-1556910103-1c02745aae4d",
    },
    {
      name: "Rainbow Jimmies",
      sku: "TAS-DEC-JIM",
      category: "sprinkles-and-dusts",
      price: 280,
      stock: 60,
      bestSeller: true,
      description: "Classic rainbow jimmies that keep their colour on buttercream and ice cream cakes.",
      image: "photo-1495147466023-ac5c588e2e94",
      variants: [
        { label: "100g", optionName: "Pack size", optionValue: "100g", price: 180, stock: 40, sku: "TAS-DEC-JIM-100" },
        { label: "250g", optionName: "Pack size", optionValue: "250g", price: 280, stock: 28, sku: "TAS-DEC-JIM-250" },
        { label: "1kg", optionName: "Pack size", optionValue: "1kg", price: 890, stock: 10, sku: "TAS-DEC-JIM-1KG" },
      ],
    },
    {
      name: "Gold Pearl Dust",
      sku: "TAS-DEC-GLD",
      category: "sprinkles-and-dusts",
      price: 450,
      stock: 25,
      featured: true,
      description: "Edible gold pearl dust for painting chocolate, gum paste, and dry highlighting.",
      image: "photo-1488477181946-6428a0291777",
    },
    {
      name: "Edible Glitter Flakes",
      sku: "TAS-DEC-GLT",
      category: "sprinkles-and-dusts",
      price: 390,
      stock: 18,
      description: "Catch-light glitter flakes for celebration cakes and cupcakes.",
      image: "photo-1599785209707-a456fc1337bb",
    },
    {
      name: "70% Dark Baking Chocolate",
      sku: "TAS-CHO-70",
      category: "chocolates",
      price: 780,
      stock: 44,
      featured: true,
      bestSeller: true,
      description: "Couverture-style dark chocolate for ganache, moulding, and dipping.",
      image: "photo-1606313564200-e75d5e30476c",
      variants: [
        { label: "250g", optionName: "Weight", optionValue: "250g", price: 420, stock: 20, sku: "TAS-CHO-70-250" },
        { label: "500g", optionName: "Weight", optionValue: "500g", price: 780, stock: 24, sku: "TAS-CHO-70-500" },
        { label: "1kg", optionName: "Weight", optionValue: "1kg", price: 1450, stock: 16, sku: "TAS-CHO-70-1KG" },
      ],
    },
    {
      name: "Milk Compound Chocolate",
      sku: "TAS-CHO-MLK",
      category: "chocolates",
      price: 620,
      stock: 38,
      description: "Easy-melt milk compound chocolate for cake pops, drips, and decorations.",
      image: "photo-1606313564200-e75d5e30476c",
    },
    {
      name: "Dutch Process Cocoa Powder",
      sku: "TAS-CHO-COC",
      category: "chocolates",
      price: 720,
      stock: 30,
      description: "Deep, alkalised cocoa for chocolate sponge and dark buttercream.",
      image: "photo-1481391319762-47dff72954d9",
    },
    {
      name: "Cake Flour 1kg",
      sku: "TAS-ING-CFL",
      category: "cake-ingredients",
      price: 310,
      stock: 80,
      description: "Fine cake flour for light sponges and layered celebration cakes.",
      image: "photo-1509440159596-0249088772ff",
    },
    {
      name: "Caster Sugar 1kg",
      sku: "TAS-ING-SUG",
      category: "cake-ingredients",
      price: 240,
      stock: 90,
      description: "Superfine caster sugar that dissolves quickly in creamed sponges.",
      image: "photo-1499636136210-6f4ee915583e",
    },
    {
      name: "Double Acting Baking Powder",
      sku: "TAS-ING-BKP",
      category: "cake-ingredients",
      price: 180,
      stock: 70,
      description: "Reliable lift for sponges, cupcakes, and muffins.",
      image: "photo-1486427944299-d1955d23e34d",
    },
    {
      name: "10-Inch Cake Board",
      sku: "TAS-PKG-BD10",
      category: "packaging",
      price: 120,
      stock: 100,
      bestSeller: true,
      description: "Sturdy 10-inch drum-style cake board with a clean white finish.",
      image: "photo-1578985545062-69928b1d9587",
    },
    {
      name: "12-Inch Cake Board",
      sku: "TAS-PKG-BD12",
      category: "packaging",
      price: 160,
      stock: 80,
      description: "12-inch white cake board for larger celebration cakes.",
      image: "photo-1578985545062-69928b1d9587",
    },
    {
      name: "White Cake Box 10 Inch",
      sku: "TAS-PKG-BX10",
      category: "packaging",
      price: 150,
      stock: 64,
      featured: true,
      description: "Tall white cake box with a windowless, premium finish for transport.",
      image: "photo-1488477181946-6428a0291777",
    },
    {
      name: "Foil Cupcake Cases",
      sku: "TAS-PKG-CUP",
      category: "packaging",
      price: 220,
      stock: 110,
      description: "Grease-resistant foil cases in a mixed metallic pack of 100.",
      image: "photo-1486427944299-d1955d23e34d",
    },
    {
      name: "Disposable Piping Bags",
      sku: "TAS-TOL-BAG",
      category: "baking-tools",
      price: 350,
      stock: 55,
      bestSeller: true,
      description: "100-pack of sturdy disposable piping bags that grip well when filled.",
      image: "photo-1556909114-f6e7ad7d3136",
    },
    {
      name: "Piping Tip Set",
      sku: "TAS-TOL-TIP",
      category: "baking-tools",
      price: 980,
      compareAtPrice: 1150,
      stock: 20,
      featured: true,
      description: "Twenty-piece stainless piping tip set covering stars, leaves, petals, and round nozzles.",
      image: "photo-1588195538326-c5b1e9f80a1b",
    },
    {
      name: "Offset Spatula",
      sku: "TAS-TOL-SPA",
      category: "baking-tools",
      price: 540,
      stock: 27,
      description: "Cranked offset spatula for sharp buttercream sides and smooth ganache.",
      image: "photo-1556909114-f6e7ad7d3136",
    },
    {
      name: "Cake Turntable",
      sku: "TAS-TOL-TRN",
      category: "baking-tools",
      price: 2450,
      stock: 14,
      featured: true,
      description: "Cast-iron based turntable with a quiet, even spin for professional finishing.",
      image: "photo-1563729784474-d77dbb933a9e",
    },
    {
      name: "Happy Birthday Cake Topper",
      sku: "TAS-DEC-TOP",
      category: "decorations",
      price: 250,
      stock: 48,
      description: "Reusable acrylic birthday topper with a clean gold finish.",
      image: "photo-1557925923-cd4648e211a0",
    },
    {
      name: "Metallic Birthday Candles",
      sku: "TAS-DEC-CND",
      category: "decorations",
      price: 180,
      stock: 75,
      description: "Tall metallic candles in mixed gold and rose tones.",
      image: "photo-1578985545062-69928b1d9587",
    },
    {
      name: "Cupcake Stand",
      sku: "TAS-TOL-STD",
      category: "baking-tools",
      price: 1650,
      stock: 9,
      description: "Three-tier acrylic cupcake stand for dessert tables.",
      image: "photo-1486427944299-d1955d23e34d",
    },
    {
      name: "Floral Silicone Mould",
      sku: "TAS-TOL-MLD",
      category: "baking-tools",
      price: 890,
      stock: 17,
      description: "Detailed floral silicone mould for chocolate, fondant, and isomalt.",
      image: "photo-1517433670267-08bbd4be890f",
    },
  ];

  const createdProducts = [];
  for (const item of catalog) {
    const category = bySlug[item.category];
    if (!category) throw new Error(`Missing category ${item.category}`);
    const product = await Product.create({
      name: item.name,
      slug: slugify(item.name),
      sku: item.sku,
      description: item.description,
      images: [img(item.image)],
      category: category._id,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      stock: item.variants ? 0 : item.stock,
      lowStockThreshold: 5,
      hasVariants: Boolean(item.variants?.length),
      isActive: true,
      isFeatured: Boolean(item.featured),
      isBestSeller: Boolean(item.bestSeller),
      specifications: item.specs ?? [
        { name: "Brand", value: "Root and Rise" },
        { name: "Origin", value: "Imported / Kenya distribution" },
      ],
      soldCount: item.bestSeller ? 24 : 6,
      seoTitle: `${item.name} | Root and Rise`,
      seoDescription: item.description.slice(0, 150),
    });
    if (item.variants?.length) {
      await ProductVariant.insertMany(
        item.variants.map((variant) => ({
          product: product._id,
          sku: variant.sku,
          label: variant.label,
          options: [{ name: variant.optionName, value: variant.optionValue }],
          price: variant.price,
          stock: variant.stock,
          isActive: true,
        })),
      );
      const totalStock = item.variants.reduce((sum, variant) => sum + variant.stock, 0);
      product.stock = totalStock;
      product.price = item.variants[0].price;
      await product.save();
    }
    createdProducts.push(product);
  }

  await Coupon.create({
    code: "WELCOME10",
    type: "PERCENTAGE",
    value: 10,
    minOrderAmount: 1500,
    isActive: true,
    usageLimit: 200,
  });

  await Address.create({
    user: customers[0]._id,
    fullName: customers[0].name,
    phone: customers[0].phone,
    county: "Nairobi",
    town: "Westlands",
    address: "12 Riverside Drive",
    isDefault: true,
  });

  const sampleOrderProducts = createdProducts.slice(0, 3);
  const order = await Order.create({
    orderNumber: "TAS-2026-SEED01",
    user: customers[0]._id,
    customer: {
      name: customers[0].name,
      email: customers[0].email,
      phone: customers[0].phone,
    },
    shipping: {
      county: "Nairobi",
      town: "Westlands",
      address: "12 Riverside Drive",
    },
    subtotal: 2500,
    deliveryFee: 250,
    discount: 0,
    total: 2750,
    status: "PROCESSING",
    paymentStatus: "PAID",
    timeline: [
      { status: "PENDING", at: new Date(Date.now() - 86400000 * 3) },
      { status: "CONFIRMED", at: new Date(Date.now() - 86400000 * 2) },
      { status: "PROCESSING", at: new Date(Date.now() - 86400000) },
    ],
  });

  await OrderItem.insertMany(
    sampleOrderProducts.map((product, index) => ({
      order: order._id,
      product: product._id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      image: product.images[0]?.url,
      quantity: index + 1,
      unitPrice: product.price,
      subtotal: product.price * (index + 1),
    })),
  );

  const reviews = [
    { user: customers[0]._id, product: createdProducts[0]._id, rating: 5, comment: "The fondant rolled beautifully and the finish was so clean." },
    { user: customers[1]._id, product: createdProducts[0]._id, rating: 4, comment: "Great texture. Will buy the 2kg pack next time." },
    { user: customers[2]._id, product: createdProducts[6]._id, rating: 5, comment: "The gel colours are concentrated and the pink is exactly right." },
    { user: customers[0]._id, product: createdProducts[12]._id, rating: 5, comment: "Excellent chocolate for ganache. Snaps cleanly." },
  ];

  await Review.insertMany(
    reviews.map((review) => ({ ...review, isApproved: true, isVerifiedPurchase: true })),
  );

  for (const product of createdProducts) {
    const productReviews = await Review.find({ product: product._id, isApproved: true });
    if (!productReviews.length) continue;
    product.reviewCount = productReviews.length;
    product.ratingAverage =
      productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;
    await product.save();
  }

  console.info(`Seeded ${parents.length + children.length} categories, ${createdProducts.length} products.`);
  console.info(`Admin: ${admin.email}`);
  console.info(`Staff: ${staff.email}`);
  console.info("Sample customers: wanjiku@tassel.test, brian@tassel.test, faith@tassel.test");
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
