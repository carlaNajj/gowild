import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_DIR = process.env.DB_DIR || './data';
const DB_PATH = path.join(DB_DIR, 'gowild.db');

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Schema ---

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    originalPrice REAL,
    image TEXT NOT NULL,
    images TEXT, -- JSON array
    colorImages TEXT, -- JSON object
    rating REAL DEFAULT 0,
    reviewCount INTEGER DEFAULT 0,
    badge TEXT,
    description TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    colors TEXT, -- JSON array
    sizes TEXT, -- JSON array
    specs TEXT, -- JSON array of {label, value}
    isBundle INTEGER DEFAULT 0,
    bundleSize INTEGER,
    isPin INTEGER DEFAULT 0,
    isBestSeller INTEGER DEFAULT 0,
    createdAt TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'customer',
    status TEXT DEFAULT 'active',
    address TEXT, -- JSON object
    wishlist TEXT, -- JSON array of product IDs
    createdAt TEXT,
    password TEXT,
    paymentMethods TEXT -- JSON array
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    shippingAddress TEXT,
    customerName TEXT,
    customerEmail TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    productId TEXT NOT NULL,
    productName TEXT,
    productImage TEXT,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    color TEXT,
    size TEXT,
    bundlePrice REAL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    productName TEXT,
    userName TEXT NOT NULL,
    date TEXT NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT NOT NULL,
    photo TEXT,
    approved INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL DEFAULT '{}' -- JSON object
  );
`);

// --- Seed Data ---

const PIN_PRODUCTS = [
  { id: 'p1', name: 'Summit Seeker Pin', category: 'Pins', price: 4.99, image: '/pin-mountain.jpg', rating: 4.9, reviewCount: 312, badge: 'Best Seller', description: 'Hard enamel mountain peak pin with gold plating. Perfect for your backpack, jacket, or hat.', stock: 156, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.25" (32mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-01-15', status: 'active' },
  { id: 'p2', name: 'Midnight Campfire Pin', category: 'Pins', price: 4.99, image: '/pin-campfire.jpg', rating: 4.8, reviewCount: 267, description: 'Glow-in-the-dark campfire scene surrounded by pine trees under a starry sky.', stock: 134, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.1" (28mm)' }, { label: 'Special', value: 'Glow in the dark' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-01-20', status: 'active' },
  { id: 'p3', name: 'True North Compass Pin', category: 'Pins', price: 4.99, image: '/pin-compass.jpg', rating: 4.7, reviewCount: 198, description: 'Vintage compass rose design for the wanderer who always finds their way.', stock: 142, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.2" (30mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-02-01', status: 'active' },
  { id: 'p4', name: 'Grizzly Trail Pin', category: 'Pins', price: 4.99, image: '/pin-bear.jpg', rating: 4.9, reviewCount: 245, badge: 'Popular', description: 'Majestic bear silhouette walking through a mountain forest landscape.', stock: 117, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.3" (33mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-02-05', status: 'active' },
  { id: 'p5', name: 'Starry Night Camper Pin', category: 'Pins', price: 4.99, image: '/pin-tent.jpg', rating: 4.8, reviewCount: 189, badge: 'New', description: 'Cozy tent under a swirling starry sky with crescent moon. For the night campers.', stock: 156, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.1" (28mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-04-01', status: 'active' },
  { id: 'p6', name: 'Trail Boot Pin', category: 'Pins', price: 4.99, image: '/pin-hiker.jpg', rating: 4.6, reviewCount: 156, description: 'Detailed hiking boot with mountain landscape reflected in the leather.', stock: 98, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.25" (32mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-01-10', status: 'active' },
  { id: 'p7', name: 'Lakeside Canoe Pin', category: 'Pins', price: 4.99, image: '/pin-canoe.jpg', rating: 4.7, reviewCount: 134, description: 'Serene canoe on still water with pine tree reflections. For the paddlers.', stock: 112, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.2" (30mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-02-10', status: 'active' },
  { id: 'p8', name: 'Mountain Buck Pin', category: 'Pins', price: 4.99, image: '/pin-deer.jpg', rating: 4.8, reviewCount: 178, badge: 'Popular', description: 'Elegant deer head with antlers decorated with miniature mountain and forest motifs.', stock: 87, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.15" (29mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-02-15', status: 'active' },
  { id: 'p9', name: 'Wildflower Meadow Pin', category: 'Pins', price: 4.99, image: '/pin-mountain.jpg', rating: 4.5, reviewCount: 98, description: 'Colorful wildflowers growing at the base of a snow-capped mountain.', stock: 134, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.1" (28mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Rose Gold' }], createdAt: '2026-01-25', status: 'active' },
  { id: 'p10', name: 'Pine Tree Badge Pin', category: 'Pins', price: 4.99, image: '/pin-campfire.jpg', rating: 4.6, reviewCount: 112, badge: 'New', description: 'Classic evergreen pine tree silhouette in a shield-shaped badge design.', stock: 145, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.0" (25mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-04-05', status: 'active' },
  { id: 'p11', name: 'Adventure Awaits Pin', category: 'Pins', price: 4.99, image: '/pin-compass.jpg', rating: 4.7, reviewCount: 156, description: 'Banner-style pin with "Adventure Awaits" lettering over a mountain scene.', stock: 167, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.4" (36mm)' }, { label: 'Backing', value: 'Double clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-01-05', status: 'active' },
  { id: 'p12', name: 'Wolf Howl Pin', category: 'Pins', price: 4.99, image: '/pin-bear.jpg', rating: 4.8, reviewCount: 203, badge: 'New', description: 'Lone wolf howling at the moon with mountain backdrop in cool blue tones.', stock: 89, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.25" (32mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Silver' }], createdAt: '2026-04-10', status: 'active' },
  { id: 'p13', name: 'Fishing Lodge Pin', category: 'Pins', price: 4.99, image: '/pin-tent.jpg', rating: 4.4, reviewCount: 76, description: 'Rustic fishing cabin by a lake with a canoe docked at the pier.', stock: 102, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.2" (30mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-02-20', status: 'active' },
  { id: 'p14', name: 'Sunset Ridge Pin', category: 'Pins', price: 4.99, image: '/pin-hiker.jpg', rating: 4.9, reviewCount: 234, badge: 'Best Seller', description: 'Golden sunset behind layered mountain ridges in warm orange and teal.', stock: 178, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.3" (33mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-01-12', status: 'active' },
  { id: 'p15', name: 'Forest Owl Pin', category: 'Pins', price: 4.99, image: '/pin-canoe.jpg', rating: 4.6, reviewCount: 89, description: 'Wise owl perched on a branch with detailed feather patterns in teal.', stock: 95, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.1" (28mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-03-01', status: 'active' },
  { id: 'p16', name: 'Go Wild Logo Pin', category: 'Pins', price: 4.99, image: '/pin-deer.jpg', rating: 4.7, reviewCount: 145, badge: 'Official', description: 'The official GoWild mountain and sun logo pin. Show your wild side.', stock: 234, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.0" (25mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-01-01', status: 'active' },
  { id: 'p17', name: 'Topo Map Pin', category: 'Pins', price: 4.99, image: '/pin-mountain.jpg', rating: 4.5, reviewCount: 67, description: 'Topographic contour lines forming a mountain shape. For the map lovers.', stock: 78, isPin: true, specs: [{ label: 'Material', value: 'Soft enamel' }, { label: 'Size', value: '1.2" (30mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Black nickel' }], createdAt: '2026-03-10', status: 'active' },
  { id: 'p18', name: 'Hot Cocoa Camper Pin', category: 'Pins', price: 4.99, image: '/pin-campfire.jpg', rating: 4.8, reviewCount: 189, badge: 'New', description: 'Cozy campfire scene with a mug of hot cocoa and marshmallows roasting.', stock: 134, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.1" (28mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-04-15', status: 'active' },
  { id: 'p19', name: 'Eagle Peak Pin', category: 'Pins', price: 4.99, image: '/pin-compass.jpg', rating: 4.7, reviewCount: 112, description: 'Bald eagle soaring over a mountain peak with spread wings in gold detail.', stock: 87, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.3" (33mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-03-15', status: 'active' },
  { id: 'p20', name: 'Trail Marker Pin', category: 'Pins', price: 4.99, image: '/pin-bear.jpg', rating: 4.6, reviewCount: 94, description: 'Classic trail blaze marker design for hikers who follow the path less traveled.', stock: 156, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.0" (25mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-03-20', status: 'active' },
];

const STICKER_PRODUCTS = [
  { id: 's1', name: 'Mountain Vibes Sticker Pack', category: 'Stickers', price: 12.99, image: '/stickers-pack.jpg', rating: 4.9, reviewCount: 456, badge: '50 Stickers', description: '50 waterproof vinyl stickers featuring mountains, trails, summits, and peak badges.', stock: 234, isBundle: true, bundleSize: 50, specs: [{ label: 'Quantity', value: '50 stickers' }, { label: 'Material', value: 'Waterproof vinyl' }, { label: 'Size Range', value: '1.5" - 3"' }, { label: 'Finish', value: 'Matte' }, { label: 'Durability', value: '5+ years outdoor' }], createdAt: '2026-01-08', status: 'active' },
  { id: 's2', name: 'Wildlife Sticker Pack', category: 'Stickers', price: 12.99, image: '/stickers-pack.jpg', rating: 4.8, reviewCount: 378, badge: '50 Stickers', description: '50 waterproof vinyl stickers featuring bears, wolves, eagles, deer, and forest animals.', stock: 198, isBundle: true, bundleSize: 50, specs: [{ label: 'Quantity', value: '50 stickers' }, { label: 'Material', value: 'Waterproof vinyl' }, { label: 'Size Range', value: '1.5" - 3"' }, { label: 'Finish', value: 'Glossy + holographic' }, { label: 'Durability', value: '5+ years outdoor' }], createdAt: '2026-01-18', status: 'active' },
  { id: 's3', name: 'Camp Life Sticker Pack', category: 'Stickers', price: 12.99, image: '/stickers-pack.jpg', rating: 4.7, reviewCount: 312, badge: '50 Stickers', description: '50 waterproof vinyl stickers featuring campfires, tents, lanterns, axes, and all things camping.', stock: 267, isBundle: true, bundleSize: 50, specs: [{ label: 'Quantity', value: '50 stickers' }, { label: 'Material', value: 'Waterproof vinyl' }, { label: 'Size Range', value: '1.5" - 3"' }, { label: 'Finish', value: 'Matte' }, { label: 'Durability', value: '5+ years outdoor' }], createdAt: '2026-02-08', status: 'active' },
  { id: 's4', name: 'Adventure Quotes Sticker Pack', category: 'Stickers', price: 12.99, image: '/stickers-pack.jpg', rating: 4.8, reviewCount: 289, badge: '50 Stickers', description: '50 waterproof vinyl stickers with adventure quotes, typography, and motivational outdoor sayings.', stock: 178, isBundle: true, bundleSize: 50, specs: [{ label: 'Quantity', value: '50 stickers' }, { label: 'Material', value: 'Waterproof vinyl' }, { label: 'Size Range', value: '1" - 4"' }, { label: 'Finish', value: 'Matte + glossy mix' }, { label: 'Durability', value: '5+ years outdoor' }], createdAt: '2026-02-18', status: 'active' },
  { id: 's5', name: 'Holographic Outdoor Sticker Pack', category: 'Stickers', price: 14.99, image: '/stickers-pack.jpg', rating: 4.9, reviewCount: 412, badge: '50 Stickers', description: '50 premium holographic vinyl stickers with rainbow shimmer effect. Mountains, forests, and adventure motifs.', stock: 156, isBundle: true, bundleSize: 50, specs: [{ label: 'Quantity', value: '50 stickers' }, { label: 'Material', value: 'Holographic vinyl' }, { label: 'Size Range', value: '1.5" - 3"' }, { label: 'Finish', value: 'Holographic rainbow' }, { label: 'Durability', value: '5+ years outdoor' }], createdAt: '2026-03-25', status: 'active' },
];

const NECK_WARMER_PRODUCTS = [
  { id: 'n1', name: 'Alpine Frost Neck Warmer', category: 'Neck Warmers', price: 18.99, image: '/nw-pattern.jpg', rating: 4.8, reviewCount: 234, badge: 'Best Seller', description: 'Ultra-soft fleece neck gaiter with mountain print. Keeps you warm on cold-weather hikes and ski trips.', stock: 156, colors: ['Mountain Blue'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '48g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-10C to 15C' }], createdAt: '2026-01-15', status: 'active' },
  { id: 'n2', name: 'Forest Camo Neck Warmer', category: 'Neck Warmers', price: 18.99, image: '/nw-stripe.jpg', rating: 4.7, reviewCount: 189, description: 'Pine tree camo pattern fleece neck gaiter. Blend into the wilderness while staying cozy.', stock: 134, colors: ['Forest Green'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '48g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-10C to 15C' }], createdAt: '2026-02-10', status: 'active' },
  { id: 'n3', name: 'Sunset Stripe Neck Warmer', category: 'Neck Warmers', price: 18.99, image: '/nw-stripe.jpg', rating: 4.6, reviewCount: 156, badge: 'Popular', description: 'Vibrant sunset horizon stripe pattern in orange, purple, and teal. For the colorful adventurer.', stock: 112, colors: ['Sunset'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '48g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-10C to 15C' }], createdAt: '2026-02-20', status: 'active' },
  { id: 'n4', name: 'Solid Teal Neck Warmer', category: 'Neck Warmers', price: 16.99, image: '/nw-pattern.jpg', rating: 4.5, reviewCount: 98, description: 'Classic solid teal fleece neck gaiter. Versatile, simple, and essential for any outdoor kit.', stock: 234, colors: ['Teal'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '45g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-5C to 15C' }], createdAt: '2026-01-20', status: 'active' },
  { id: 'n5', name: 'Buffalo Check Neck Warmer', category: 'Neck Warmers', price: 19.99, image: '/nw-pattern.jpg', rating: 4.8, reviewCount: 267, badge: 'Best Seller', description: 'Classic red and black buffalo check pattern. Reversible with solid black on the flip side.', stock: 145, colors: ['Red/Black Check'], sizes: ['One Size'], specs: [{ label: 'Material', value: 'Double-layer fleece' }, { label: 'Weight', value: '62g' }, { label: 'Design', value: 'Reversible' }, { label: 'Temp Range', value: '-15C to 5C' }], createdAt: '2026-01-10', status: 'active' },
  { id: 'n6', name: 'Arctic Wind Neck Warmer', category: 'Neck Warmers', price: 22.99, image: '/nw-stripe.jpg', rating: 4.7, reviewCount: 134, badge: 'Warmest', description: 'Extra-thick thermal fleece with wind-blocking outer layer. For extreme cold adventures.', stock: 89, colors: ['Charcoal'], sizes: ['One Size'], specs: [{ label: 'Material', value: 'Thermal fleece + windblock' }, { label: 'Weight', value: '78g' }, { label: 'Dimensions', value: '28 x 30cm' }, { label: 'Temp Range', value: '-25C to 0C' }], createdAt: '2026-03-30', status: 'active' },
  { id: 'n7', name: 'Geometric Peak Neck Warmer', category: 'Neck Warmers', price: 18.99, image: '/nw-pattern.jpg', rating: 4.6, reviewCount: 112, description: 'Modern geometric mountain peak pattern in teal, orange, and gray. Stylish and functional.', stock: 123, colors: ['Geo Mix'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '48g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-10C to 15C' }], createdAt: '2026-03-15', status: 'active' },
  { id: 'n8', name: 'Merino Wool Neck Warmer', category: 'Neck Warmers', price: 24.99, image: '/nw-stripe.jpg', rating: 4.9, reviewCount: 178, badge: 'Premium', description: 'Luxurious merino wool blend neck gaiter. Naturally odor-resistant and temperature regulating.', stock: 67, colors: ['Heather Gray', 'Navy', 'Olive'], sizes: ['One Size'], specs: [{ label: 'Material', value: '80% merino wool, 20% nylon' }, { label: 'Weight', value: '55g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-15C to 10C' }], createdAt: '2026-04-01', status: 'active' },
  { id: 'n9', name: 'Pine Tree Neck Warmer', category: 'Neck Warmers', price: 18.99, image: '/nw-pattern.jpg', rating: 4.5, reviewCount: 87, description: 'Evergreen pine tree pattern on cream background. Bring the forest with you everywhere.', stock: 145, colors: ['Cream/Forest'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '48g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-10C to 15C' }], createdAt: '2026-03-05', status: 'active' },
  { id: 'n10', name: 'Flame Orange Neck Warmer', category: 'Neck Warmers', price: 16.99, image: '/nw-stripe.jpg', rating: 4.4, reviewCount: 76, description: 'Bright flame orange solid color. High visibility and high style for your outdoor adventures.', stock: 198, colors: ['Flame Orange'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '45g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-5C to 15C' }], createdAt: '2026-03-22', status: 'active' },
];

const PICNIC_MAT_PRODUCT = { id: 'mat1', name: 'GoWild Waterproof Picnic Mat', category: 'Picnic Mats', price: 34.99, originalPrice: 44.99, image: '/mat-red.jpg', images: ['/mat-red.jpg', '/mat-blue.jpg', '/mat-black.jpg'], rating: 4.7, reviewCount: 234, badge: 'Sale', colorImages: { Red: ['/mat-red-1.jpg', '/mat-red-2.jpg', '/mat-red-3.jpg', '/mat-red-4.jpg', '/mat-red-5.jpg'], Blue: ['/mat-blue-1.jpg', '/mat-blue-2.jpg', '/mat-blue-3.jpg', '/mat-blue-4.jpg', '/mat-blue-5.jpg'], Black: ['/mat-black-1.jpg', '/mat-black-2.jpg', '/mat-black-3.jpg', '/mat-black-4.jpg', '/mat-black-5.jpg'] }, description: 'Large waterproof picnic mat with soft fleece top and durable PEVA waterproof bottom. Perfect for parks, beaches, camping, and outdoor concerts.', stock: 156, colors: ['Red', 'Blue', 'Black'], sizes: ['Standard (150x200cm)'], specs: [{ label: 'Top Layer', value: 'Soft quilted fleece' }, { label: 'Bottom Layer', value: 'Waterproof PEVA' }, { label: 'Dimensions', value: '150 x 200cm' }, { label: 'Folded Size', value: '35 x 15 x 8cm' }, { label: 'Weight', value: '520g' }, { label: 'Care', value: 'Wipe clean / machine wash' }], createdAt: '2026-01-01', status: 'active' };

const ACCESSORY_PRODUCTS = [
  { id: 'a1', name: 'Titanium Multi-Tool Spork', category: 'Accessories', price: 15.99, image: '/prod-fork.jpg', rating: 4.6, reviewCount: 198, badge: 'Ultralight', description: 'The ultimate camping utensil. Titanium spork with built-in bottle opener, can opener, and serrated knife edge. Weighs only 18g.', stock: 234, specs: [{ label: 'Material', value: 'Food-grade titanium' }, { label: 'Length', value: '16.5cm' }, { label: 'Weight', value: '18g' }, { label: 'Functions', value: 'Spoon, fork, knife, opener' }, { label: 'Dishwasher', value: 'Safe' }], createdAt: '2026-04-10', status: 'active' },
  { id: 'a2', name: 'LED Emergency Camp Lamp', category: 'Accessories', price: 24.99, image: '/prod-lamp.jpg', rating: 4.8, reviewCount: 312, badge: 'Best Seller', description: 'Compact rechargeable LED lantern with 3 brightness modes and SOS flash. Up to 12 hours runtime. IPX4 water-resistant.', stock: 178, colors: ['Teal', 'Black', 'Orange'], colorImages: { Teal: ['/lamp-teal-1.jpg', '/lamp-teal-2.jpg', '/lamp-teal-3.jpg', '/lamp-teal-4.jpg', '/lamp-teal-5.jpg'], Black: ['/lamp-black-1.jpg', '/lamp-black-2.jpg', '/lamp-black-3.jpg', '/lamp-black-4.jpg', '/lamp-black-5.jpg'], Orange: ['/lamp-orange-1.jpg', '/lamp-orange-2.jpg', '/lamp-orange-3.jpg', '/lamp-orange-4.jpg', '/lamp-orange-5.jpg'] }, specs: [{ label: 'Brightness', value: '300 lumens max' }, { label: 'Battery', value: '2600mAh rechargeable' }, { label: 'Runtime', value: 'Up to 12 hours' }, { label: 'Modes', value: 'High / Low / SOS' }, { label: 'Water Rating', value: 'IPX4' }], createdAt: '2026-04-05', status: 'active' },
];

const ALL_PRODUCTS = [...PIN_PRODUCTS, ...STICKER_PRODUCTS, ...NECK_WARMER_PRODUCTS, PICNIC_MAT_PRODUCT, ...ACCESSORY_PRODUCTS];

const DEFAULT_REVIEWS = [
  { id: 'r1', productId: 'p1', productName: 'Summit Seeker Pin', userName: 'Sarah M.', date: '2026-03-15', rating: 5, text: 'Absolutely love this pin! The gold plating is gorgeous and the detail is incredible. Already got compliments on my backpack.', approved: 0 },
  { id: 'r2', productId: 'p1', productName: 'Summit Seeker Pin', userName: 'Jake T.', date: '2026-03-10', rating: 4, text: 'Really nice quality. The hard enamel feels premium. Would love to see a bigger size option though.', approved: 0 },
  { id: 'r3', productId: 'p1', productName: 'Summit Seeker Pin', userName: 'Emily R.', date: '2026-02-28', rating: 5, text: 'Best enamel pin I own. The butterfly clutch is secure and the colors are vibrant. Buying more for gifts!', approved: 0 },
  { id: 'r4', productId: 'p14', productName: 'Sunset Ridge Pin', userName: 'Mike H.', date: '2026-04-01', rating: 5, text: 'The sunset colors on this pin are stunning. The orange and teal combo is perfect. My favorite pin so far.', approved: 0 },
  { id: 'r5', productId: 'p14', productName: 'Sunset Ridge Pin', userName: 'Lisa K.', date: '2026-03-22', rating: 5, text: 'Bought 3 pins for the bundle deal. This one is my favorite. The gold plating really makes it pop.', approved: 0 },
  { id: 'r6', productId: 's1', productName: 'Mountain Vibes Sticker Pack', userName: 'Alex P.', date: '2026-04-05', rating: 5, text: '50 unique stickers and every single one is amazing quality. The waterproof vinyl held up through rain and sun on my water bottle.', approved: 0 },
  { id: 'r7', productId: 's1', productName: 'Mountain Vibes Sticker Pack', userName: 'Dana W.', date: '2026-03-18', rating: 5, text: 'These stickers are incredible. Put them on my car and they have not peeled at all after 2 months. Will buy again!', approved: 0 },
  { id: 'r8', productId: 's5', productName: 'Holographic Outdoor Sticker Pack', userName: 'Chris B.', date: '2026-04-02', rating: 5, text: 'The holographic effect is even better in person. The rainbow shimmer catches the light beautifully. Worth every penny.', approved: 0 },
  { id: 'r9', productId: 'n1', productName: 'Alpine Frost Neck Warmer', userName: 'Tom R.', date: '2026-03-25', rating: 4, text: 'Kept me warm on a 5F hike. The fleece is soft and does not itch. Great for the price point.', approved: 0 },
  { id: 'r10', productId: 'n1', productName: 'Alpine Frost Neck Warmer', userName: 'Anna S.', date: '2026-03-12', rating: 5, text: 'Love the mountain print! Got one for myself and one as a gift. Perfect for skiing and cold morning hikes.', approved: 0 },
  { id: 'r11', productId: 'n8', productName: 'Merino Wool Neck Warmer', userName: 'Ryan G.', date: '2026-04-08', rating: 5, text: 'The merino wool is a game changer. No odor even after a full day of hiking. Temperature regulating is real.', approved: 0 },
  { id: 'r12', productId: 'mat1', productName: 'GoWild Waterproof Picnic Mat', userName: 'Jenny L.', date: '2026-03-30', rating: 5, text: 'Used this at the beach and it was perfect. The waterproof bottom kept us dry even on wet sand. Folds up so small too!', approved: 0 },
  { id: 'r13', productId: 'mat1', productName: 'GoWild Waterproof Picnic Mat', userName: 'David M.', date: '2026-03-15', rating: 4, text: 'Great mat for the price. The fleece top is comfortable and the PEVA bottom works well. Wish it came in more sizes.', approved: 0 },
  { id: 'r14', productId: 'a1', productName: 'Titanium Multi-Tool Spork', userName: 'Pat K.', date: '2026-04-10', rating: 5, text: 'Only 18g and it replaces 3 utensils plus a bottle opener. Used it on a 5-day backpacking trip. Indispensable.', approved: 0 },
  { id: 'r15', productId: 'a2', productName: 'LED Emergency Camp Lamp', userName: 'Sam W.', date: '2026-04-01', rating: 5, text: '300 lumens is brighter than expected. The SOS mode is a nice safety touch. Battery lasted 10 hours on low.', approved: 0 },
  { id: 'r16', productId: 'a2', productName: 'LED Emergency Camp Lamp', userName: 'Nina J.', date: '2026-03-20', rating: 4, text: 'Solid lamp. USB-C charging is fast. Only wish it had a warmer light temperature. Otherwise perfect.', approved: 0 },
  { id: 'r17', productId: 'p5', productName: 'Starry Night Camper Pin', userName: 'HikerJoe', date: '2026-04-20', rating: 5, text: 'The glow in the dark feature is subtle but awesome. Great addition to my camping pin collection.', approved: 0 },
  { id: 'r18', productId: 'p8', productName: 'Mountain Buck Pin', userName: 'ArtLover', date: '2026-04-18', rating: 5, text: 'The antler detail is incredible. You can see the tiny mountain motifs. Best quality pin I have ever purchased.', approved: 0 },
];

const SALT_ROUNDS = 10;

const DEMO_USERS_RAW = [
  { id: 'u1', name: 'Alex Walker', email: 'alex@gowild.com', phone: '(555) 867-5309', role: 'customer', status: 'active', wishlist: JSON.stringify(['p14', 'n5', 's3']), address: JSON.stringify({ street: '123 Mountain Ridge Road', city: 'Boulder', state: 'CO', zip: '80301', country: 'USA' }), createdAt: '2026-01-01', password: 'demo1234', paymentMethods: JSON.stringify(['Visa •••• 4242']) },
  { id: 'admin1', name: 'Admin User', email: 'admin@gowild.com', phone: '(555) 000-0000', role: 'admin', status: 'active', address: JSON.stringify({ street: '456 Admin Blvd', city: 'Denver', state: 'CO', zip: '80201', country: 'USA' }), createdAt: '2026-01-01', password: 'admin1234', paymentMethods: JSON.stringify([]) },
  { id: 'staff1', name: 'Staff Member', email: 'staff@gowild.com', phone: '(555) 111-1111', role: 'staff', status: 'active', address: JSON.stringify({ street: '789 Staff Ave', city: 'Denver', state: 'CO', zip: '80202', country: 'USA' }), createdAt: '2026-01-01', password: 'staff1234', paymentMethods: JSON.stringify([]) },
];

const DEMO_USERS = DEMO_USERS_RAW.map(u => ({
  ...u,
  password: bcrypt.hashSync(u.password, SALT_ROUNDS),
}));

// --- Seed if empty ---

const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, category, price, originalPrice, image, images, colorImages, rating, reviewCount, badge, description, stock, colors, sizes, specs, isBundle, bundleSize, isPin, isBestSeller, createdAt, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of ALL_PRODUCTS) {
    insertProduct.run(
      p.id, p.name, p.category, p.price, p.originalPrice ?? null, p.image,
      p.images ? JSON.stringify(p.images) : null,
      (p as any).colorImages ? JSON.stringify((p as any).colorImages) : null,
      p.rating, p.reviewCount, p.badge ?? null, p.description, p.stock,
      p.colors ? JSON.stringify(p.colors) : null,
      p.sizes ? JSON.stringify(p.sizes) : null,
      p.specs ? JSON.stringify(p.specs) : null,
      (p as any).isBundle ? 1 : 0, (p as any).bundleSize ?? null,
      (p as any).isPin ? 1 : 0, (p as any).isBestSeller ? 1 : 0,
      p.createdAt ?? null, p.status ?? 'active'
    );
  }
  console.log(`[db] Seeded ${ALL_PRODUCTS.length} products`);
}

const reviewCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get() as { count: number };
if (reviewCount.count === 0) {
  const insertReview = db.prepare(`
    INSERT INTO reviews (id, productId, productName, userName, date, rating, text, photo, approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const r of DEFAULT_REVIEWS) {
    insertReview.run(r.id, r.productId, r.productName, r.userName, r.date, r.rating, r.text, r.photo ?? null, r.approved);
  }
  console.log(`[db] Seeded ${DEFAULT_REVIEWS.length} reviews`);
}

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, phone, role, status, wishlist, address, createdAt, password, paymentMethods)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const u of DEMO_USERS) {
    insertUser.run(u.id, u.name, u.email, u.phone, u.role, u.status, u.wishlist, u.address, u.createdAt, u.password, u.paymentMethods);
  }
  console.log(`[db] Seeded ${DEMO_USERS.length} users`);
}

const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
if (settingsCount.count === 0) {
  db.prepare(`INSERT INTO settings (id, data) VALUES (1, ?)`).run(JSON.stringify({
    storeName: 'GoWild',
    contactEmail: 'hello@gowild.com',
    currency: 'USD',
    currencySymbol: '$',
    freeShippingThreshold: 50,
    standardShippingRate: 5.99,
    bannerEnabled: true,
    bannerText: 'Free shipping on orders over $50',
    footerTagline: 'Pins, stickers, neck warmers & essentials for your next adventure.',
    contactPhone: '(555) 867-5309',
    contactAddress: '123 Adventure Ave, Boulder, CO 80301',
    paymentMethods: { cod: true, card: true },
  }));
  console.log('[db] Seeded default settings');
}

export default db;
