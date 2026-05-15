import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { useSiteSettings } from '@/lib/settings-context';

export interface Review {
  id: string;
  userName: string;
  date: string;
  rating: number;
  text: string;
  photo?: string;
  productId: string;
  productName: string;
  approved?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  colorImages?: Record<string, string[]>; // color -> array of 5 images
  rating: number;
  reviewCount: number;
  badge?: string;
  description: string;
  stock: number;
  colors?: string[];
  sizes?: string[];
  specs?: { label: string; value: string }[];
  isBundle?: boolean;
  bundleSize?: number;
  isPin?: boolean;
  isBestSeller?: boolean;
  createdAt?: string;
  status?: 'active' | 'inactive';
}

export interface CartItem {
  product: Product;
  quantity: number;
  color?: string;
  size?: string;
  bundlePrice?: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress?: string;
  customerName?: string;
  customerEmail?: string;
}

// Pin images cycle - all on clean white background
const PIN_IMAGES = ['/pin-mountain.jpg', '/pin-campfire.jpg', '/pin-compass.jpg', '/pin-bear.jpg', '/pin-tent.jpg', '/pin-hiker.jpg', '/pin-canoe.jpg', '/pin-deer.jpg'];
const NW_IMAGES = ['/nw-pattern.jpg', '/nw-stripe.jpg'];

// Color-specific image sets for products with variants
const PICNIC_MAT_IMAGES: Record<string, string[]> = {
  Red: ['/mat-red-1.jpg', '/mat-red-2.jpg', '/mat-red-3.jpg', '/mat-red-4.jpg', '/mat-red-5.jpg'],
  Blue: ['/mat-blue-1.jpg', '/mat-blue-2.jpg', '/mat-blue-3.jpg', '/mat-blue-4.jpg', '/mat-blue-5.jpg'],
  Black: ['/mat-black-1.jpg', '/mat-black-2.jpg', '/mat-black-3.jpg', '/mat-black-4.jpg', '/mat-black-5.jpg'],
};

const LAMP_IMAGES: Record<string, string[]> = {
  Teal: ['/lamp-teal-1.jpg', '/lamp-teal-2.jpg', '/lamp-teal-3.jpg', '/lamp-teal-4.jpg', '/lamp-teal-5.jpg'],
  Black: ['/lamp-black-1.jpg', '/lamp-black-2.jpg', '/lamp-black-3.jpg', '/lamp-black-4.jpg', '/lamp-black-5.jpg'],
  Orange: ['/lamp-orange-1.jpg', '/lamp-orange-2.jpg', '/lamp-orange-3.jpg', '/lamp-orange-4.jpg', '/lamp-orange-5.jpg'],
};

export const DEFAULT_PIN_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Summit Seeker Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[0], rating: 4.9, reviewCount: 312, badge: 'Best Seller', description: 'Hard enamel mountain peak pin with gold plating. Perfect for your backpack, jacket, or hat.', stock: 156, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.25" (32mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-01-15', status: 'active' },
  { id: 'p2', name: 'Midnight Campfire Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[1], rating: 4.8, reviewCount: 267, description: 'Glow-in-the-dark campfire scene surrounded by pine trees under a starry sky.', stock: 134, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.1" (28mm)' }, { label: 'Special', value: 'Glow in the dark' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-01-20', status: 'active' },
  { id: 'p3', name: 'True North Compass Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[2], rating: 4.7, reviewCount: 198, description: 'Vintage compass rose design for the wanderer who always finds their way.', stock: 142, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.2" (30mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-02-01', status: 'active' },
  { id: 'p4', name: 'Grizzly Trail Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[3], rating: 4.9, reviewCount: 245, badge: 'Popular', description: 'Majestic bear silhouette walking through a mountain forest landscape.', stock: 117, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.3" (33mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-02-05', status: 'active' },
  { id: 'p5', name: 'Starry Night Camper Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[4], rating: 4.8, reviewCount: 189, badge: 'New', description: 'Cozy tent under a swirling starry sky with crescent moon. For the night campers.', stock: 156, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.1" (28mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-04-01', status: 'active' },
  { id: 'p6', name: 'Trail Boot Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[5], rating: 4.6, reviewCount: 156, description: 'Detailed hiking boot with mountain landscape reflected in the leather.', stock: 98, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.25" (32mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-01-10', status: 'active' },
  { id: 'p7', name: 'Lakeside Canoe Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[6], rating: 4.7, reviewCount: 134, description: 'Serene canoe on still water with pine tree reflections. For the paddlers.', stock: 112, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.2" (30mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-02-10', status: 'active' },
  { id: 'p8', name: 'Mountain Buck Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[7], rating: 4.8, reviewCount: 178, badge: 'Popular', description: 'Elegant deer head with antlers decorated with miniature mountain and forest motifs.', stock: 87, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.15" (29mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-02-15', status: 'active' },
  { id: 'p9', name: 'Wildflower Meadow Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[0], rating: 4.5, reviewCount: 98, description: 'Colorful wildflowers growing at the base of a snow-capped mountain.', stock: 134, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.1" (28mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Rose Gold' }], createdAt: '2026-01-25', status: 'active' },
  { id: 'p10', name: 'Pine Tree Badge Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[1], rating: 4.6, reviewCount: 112, badge: 'New', description: 'Classic evergreen pine tree silhouette in a shield-shaped badge design.', stock: 145, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.0" (25mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-04-05', status: 'active' },
  { id: 'p11', name: 'Adventure Awaits Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[2], rating: 4.7, reviewCount: 156, description: 'Banner-style pin with "Adventure Awaits" lettering over a mountain scene.', stock: 167, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.4" (36mm)' }, { label: 'Backing', value: 'Double clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-01-05', status: 'active' },
  { id: 'p12', name: 'Wolf Howl Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[3], rating: 4.8, reviewCount: 203, badge: 'New', description: 'Lone wolf howling at the moon with mountain backdrop in cool blue tones.', stock: 89, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.25" (32mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Silver' }], createdAt: '2026-04-10', status: 'active' },
  { id: 'p13', name: 'Fishing Lodge Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[4], rating: 4.4, reviewCount: 76, description: 'Rustic fishing cabin by a lake with a canoe docked at the pier.', stock: 102, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.2" (30mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-02-20', status: 'active' },
  { id: 'p14', name: 'Sunset Ridge Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[5], rating: 4.9, reviewCount: 234, badge: 'Best Seller', description: 'Golden sunset behind layered mountain ridges in warm orange and teal.', stock: 178, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.3" (33mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-01-12', status: 'active' },
  { id: 'p15', name: 'Forest Owl Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[6], rating: 4.6, reviewCount: 89, description: 'Wise owl perched on a branch with detailed feather patterns in teal.', stock: 95, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.1" (28mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-03-01', status: 'active' },
  { id: 'p16', name: 'Go Wild Logo Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[7], rating: 4.7, reviewCount: 145, badge: 'Official', description: 'The official GoWild mountain and sun logo pin. Show your wild side.', stock: 234, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.0" (25mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-01-01', status: 'active' },
  { id: 'p17', name: 'Topo Map Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[0], rating: 4.5, reviewCount: 67, description: 'Topographic contour lines forming a mountain shape. For the map lovers.', stock: 78, isPin: true, specs: [{ label: 'Material', value: 'Soft enamel' }, { label: 'Size', value: '1.2" (30mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Black nickel' }], createdAt: '2026-03-10', status: 'active' },
  { id: 'p18', name: 'Hot Cocoa Camper Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[1], rating: 4.8, reviewCount: 189, badge: 'New', description: 'Cozy campfire scene with a mug of hot cocoa and marshmallows roasting.', stock: 134, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.1" (28mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-04-15', status: 'active' },
  { id: 'p19', name: 'Eagle Peak Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[2], rating: 4.7, reviewCount: 112, description: 'Bald eagle soaring over a mountain peak with spread wings in gold detail.', stock: 87, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.3" (33mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-03-15', status: 'active' },
  { id: 'p20', name: 'Trail Marker Pin', category: 'Pins', price: 4.99, image: PIN_IMAGES[3], rating: 4.6, reviewCount: 94, description: 'Classic trail blaze marker design for hikers who follow the path less traveled.', stock: 156, isPin: true, specs: [{ label: 'Material', value: 'Hard enamel' }, { label: 'Size', value: '1.0" (25mm)' }, { label: 'Backing', value: 'Butterfly clutch' }, { label: 'Plating', value: 'Gold' }], createdAt: '2026-03-20', status: 'active' },
];

export const DEFAULT_STICKER_PRODUCTS: Product[] = [
  { id: 's1', name: 'Mountain Vibes Sticker Pack', category: 'Stickers', price: 12.99, image: '/stickers-pack.jpg', rating: 4.9, reviewCount: 456, badge: '50 Stickers', description: '50 waterproof vinyl stickers featuring mountains, trails, summits, and peak badges.', stock: 234, isBundle: true, bundleSize: 50, specs: [{ label: 'Quantity', value: '50 stickers' }, { label: 'Material', value: 'Waterproof vinyl' }, { label: 'Size Range', value: '1.5" - 3"' }, { label: 'Finish', value: 'Matte' }, { label: 'Durability', value: '5+ years outdoor' }], createdAt: '2026-01-08', status: 'active' },
  { id: 's2', name: 'Wildlife Sticker Pack', category: 'Stickers', price: 12.99, image: '/stickers-pack.jpg', rating: 4.8, reviewCount: 378, badge: '50 Stickers', description: '50 waterproof vinyl stickers featuring bears, wolves, eagles, deer, and forest animals.', stock: 198, isBundle: true, bundleSize: 50, specs: [{ label: 'Quantity', value: '50 stickers' }, { label: 'Material', value: 'Waterproof vinyl' }, { label: 'Size Range', value: '1.5" - 3"' }, { label: 'Finish', value: 'Glossy + holographic' }, { label: 'Durability', value: '5+ years outdoor' }], createdAt: '2026-01-18', status: 'active' },
  { id: 's3', name: 'Camp Life Sticker Pack', category: 'Stickers', price: 12.99, image: '/stickers-pack.jpg', rating: 4.7, reviewCount: 312, badge: '50 Stickers', description: '50 waterproof vinyl stickers featuring campfires, tents, lanterns, axes, and all things camping.', stock: 267, isBundle: true, bundleSize: 50, specs: [{ label: 'Quantity', value: '50 stickers' }, { label: 'Material', value: 'Waterproof vinyl' }, { label: 'Size Range', value: '1.5" - 3"' }, { label: 'Finish', value: 'Matte' }, { label: 'Durability', value: '5+ years outdoor' }], createdAt: '2026-02-08', status: 'active' },
  { id: 's4', name: 'Adventure Quotes Sticker Pack', category: 'Stickers', price: 12.99, image: '/stickers-pack.jpg', rating: 4.8, reviewCount: 289, badge: '50 Stickers', description: '50 waterproof vinyl stickers with adventure quotes, typography, and motivational outdoor sayings.', stock: 178, isBundle: true, bundleSize: 50, specs: [{ label: 'Quantity', value: '50 stickers' }, { label: 'Material', value: 'Waterproof vinyl' }, { label: 'Size Range', value: '1" - 4"' }, { label: 'Finish', value: 'Matte + glossy mix' }, { label: 'Durability', value: '5+ years outdoor' }], createdAt: '2026-02-18', status: 'active' },
  { id: 's5', name: 'Holographic Outdoor Sticker Pack', category: 'Stickers', price: 14.99, image: '/stickers-pack.jpg', rating: 4.9, reviewCount: 412, badge: '50 Stickers', description: '50 premium holographic vinyl stickers with rainbow shimmer effect. Mountains, forests, and adventure motifs.', stock: 156, isBundle: true, bundleSize: 50, specs: [{ label: 'Quantity', value: '50 stickers' }, { label: 'Material', value: 'Holographic vinyl' }, { label: 'Size Range', value: '1.5" - 3"' }, { label: 'Finish', value: 'Holographic rainbow' }, { label: 'Durability', value: '5+ years outdoor' }], createdAt: '2026-03-25', status: 'active' },
];

export const DEFAULT_NECK_WARMER_PRODUCTS: Product[] = [
  { id: 'n1', name: 'Alpine Frost Neck Warmer', category: 'Neck Warmers', price: 18.99, image: NW_IMAGES[0], rating: 4.8, reviewCount: 234, badge: 'Best Seller', description: 'Ultra-soft fleece neck gaiter with mountain print. Keeps you warm on cold-weather hikes and ski trips.', stock: 156, colors: ['Mountain Blue'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '48g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-10C to 15C' }], createdAt: '2026-01-15', status: 'active' },
  { id: 'n2', name: 'Forest Camo Neck Warmer', category: 'Neck Warmers', price: 18.99, image: NW_IMAGES[1], rating: 4.7, reviewCount: 189, description: 'Pine tree camo pattern fleece neck gaiter. Blend into the wilderness while staying cozy.', stock: 134, colors: ['Forest Green'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '48g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-10C to 15C' }], createdAt: '2026-02-10', status: 'active' },
  { id: 'n3', name: 'Sunset Stripe Neck Warmer', category: 'Neck Warmers', price: 18.99, image: NW_IMAGES[1], rating: 4.6, reviewCount: 156, badge: 'Popular', description: 'Vibrant sunset horizon stripe pattern in orange, purple, and teal. For the colorful adventurer.', stock: 112, colors: ['Sunset'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '48g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-10C to 15C' }], createdAt: '2026-02-20', status: 'active' },
  { id: 'n4', name: 'Solid Teal Neck Warmer', category: 'Neck Warmers', price: 16.99, image: NW_IMAGES[0], rating: 4.5, reviewCount: 98, description: 'Classic solid teal fleece neck gaiter. Versatile, simple, and essential for any outdoor kit.', stock: 234, colors: ['Teal'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '45g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-5C to 15C' }], createdAt: '2026-01-20', status: 'active' },
  { id: 'n5', name: 'Buffalo Check Neck Warmer', category: 'Neck Warmers', price: 19.99, image: NW_IMAGES[0], rating: 4.8, reviewCount: 267, badge: 'Best Seller', description: 'Classic red and black buffalo check pattern. Reversible with solid black on the flip side.', stock: 145, colors: ['Red/Black Check'], sizes: ['One Size'], specs: [{ label: 'Material', value: 'Double-layer fleece' }, { label: 'Weight', value: '62g' }, { label: 'Design', value: 'Reversible' }, { label: 'Temp Range', value: '-15C to 5C' }], createdAt: '2026-01-10', status: 'active' },
  { id: 'n6', name: 'Arctic Wind Neck Warmer', category: 'Neck Warmers', price: 22.99, image: NW_IMAGES[1], rating: 4.7, reviewCount: 134, badge: 'Warmest', description: 'Extra-thick thermal fleece with wind-blocking outer layer. For extreme cold adventures.', stock: 89, colors: ['Charcoal'], sizes: ['One Size'], specs: [{ label: 'Material', value: 'Thermal fleece + windblock' }, { label: 'Weight', value: '78g' }, { label: 'Dimensions', value: '28 x 30cm' }, { label: 'Temp Range', value: '-25C to 0C' }], createdAt: '2026-03-30', status: 'active' },
  { id: 'n7', name: 'Geometric Peak Neck Warmer', category: 'Neck Warmers', price: 18.99, image: NW_IMAGES[0], rating: 4.6, reviewCount: 112, description: 'Modern geometric mountain peak pattern in teal, orange, and gray. Stylish and functional.', stock: 123, colors: ['Geo Mix'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '48g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-10C to 15C' }], createdAt: '2026-03-15', status: 'active' },
  { id: 'n8', name: 'Merino Wool Neck Warmer', category: 'Neck Warmers', price: 24.99, image: NW_IMAGES[1], rating: 4.9, reviewCount: 178, badge: 'Premium', description: 'Luxurious merino wool blend neck gaiter. Naturally odor-resistant and temperature regulating.', stock: 67, colors: ['Heather Gray', 'Navy', 'Olive'], sizes: ['One Size'], specs: [{ label: 'Material', value: '80% merino wool, 20% nylon' }, { label: 'Weight', value: '55g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-15C to 10C' }], createdAt: '2026-04-01', status: 'active' },
  { id: 'n9', name: 'Pine Tree Neck Warmer', category: 'Neck Warmers', price: 18.99, image: NW_IMAGES[0], rating: 4.5, reviewCount: 87, description: 'Evergreen pine tree pattern on cream background. Bring the forest with you everywhere.', stock: 145, colors: ['Cream/Forest'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '48g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-10C to 15C' }], createdAt: '2026-03-05', status: 'active' },
  { id: 'n10', name: 'Flame Orange Neck Warmer', category: 'Neck Warmers', price: 16.99, image: NW_IMAGES[1], rating: 4.4, reviewCount: 76, description: 'Bright flame orange solid color. High visibility and high style for your outdoor adventures.', stock: 198, colors: ['Flame Orange'], sizes: ['One Size'], specs: [{ label: 'Material', value: '100% polyester fleece' }, { label: 'Weight', value: '45g' }, { label: 'Dimensions', value: '25 x 28cm' }, { label: 'Temp Range', value: '-5C to 15C' }], createdAt: '2026-03-22', status: 'active' },
];

export const DEFAULT_PICNIC_MAT_PRODUCT: Product = {
  id: 'mat1', name: 'GoWild Waterproof Picnic Mat', category: 'Picnic Mats', price: 34.99, originalPrice: 44.99, image: '/mat-red.jpg',
  images: ['/mat-red.jpg', '/mat-blue.jpg', '/mat-black.jpg'], rating: 4.7, reviewCount: 234, badge: 'Sale',
  colorImages: PICNIC_MAT_IMAGES,
  description: 'Large waterproof picnic mat with soft fleece top and durable PEVA waterproof bottom. Perfect for parks, beaches, camping, and outdoor concerts.',
  stock: 156, colors: ['Red', 'Blue', 'Black'], sizes: ['Standard (150x200cm)'],
  specs: [
    { label: 'Top Layer', value: 'Soft quilted fleece' },
    { label: 'Bottom Layer', value: 'Waterproof PEVA' },
    { label: 'Dimensions', value: '150 x 200cm' },
    { label: 'Folded Size', value: '35 x 15 x 8cm' },
    { label: 'Weight', value: '520g' },
    { label: 'Care', value: 'Wipe clean / machine wash' },
  ],
  createdAt: '2026-01-01',
  status: 'active',
};

export const DEFAULT_ACCESSORY_PRODUCTS: Product[] = [
  { id: 'a1', name: 'Titanium Multi-Tool Spork', category: 'Accessories', price: 15.99, image: '/prod-fork.jpg', rating: 4.6, reviewCount: 198, badge: 'Ultralight', description: 'The ultimate camping utensil. Titanium spork with built-in bottle opener, can opener, and serrated knife edge. Weighs only 18g.', stock: 234, specs: [{ label: 'Material', value: 'Food-grade titanium' }, { label: 'Length', value: '16.5cm' }, { label: 'Weight', value: '18g' }, { label: 'Functions', value: 'Spoon, fork, knife, opener' }, { label: 'Dishwasher', value: 'Safe' }], createdAt: '2026-04-10', status: 'active' },
  { id: 'a2', name: 'LED Emergency Camp Lamp', category: 'Accessories', price: 24.99, image: '/prod-lamp.jpg', rating: 4.8, reviewCount: 312, badge: 'Best Seller', description: 'Compact rechargeable LED lantern with 3 brightness modes and SOS flash. Up to 12 hours runtime. IPX4 water-resistant.', stock: 178, colors: ['Teal', 'Black', 'Orange'], colorImages: LAMP_IMAGES, specs: [{ label: 'Brightness', value: '300 lumens max' }, { label: 'Battery', value: '2600mAh rechargeable' }, { label: 'Runtime', value: 'Up to 12 hours' }, { label: 'Modes', value: 'High / Low / SOS' }, { label: 'Water Rating', value: 'IPX4' }], createdAt: '2026-04-05', status: 'active' },
];

// Backward-compatible exports
export const PIN_PRODUCTS = DEFAULT_PIN_PRODUCTS;
export const STICKER_PRODUCTS = DEFAULT_STICKER_PRODUCTS;
export const NECK_WARMER_PRODUCTS = DEFAULT_NECK_WARMER_PRODUCTS;
export const PICNIC_MAT_PRODUCT = DEFAULT_PICNIC_MAT_PRODUCT;
export const ACCESSORY_PRODUCTS = DEFAULT_ACCESSORY_PRODUCTS;

export const ALL_PRODUCTS: Product[] = [
  ...DEFAULT_PIN_PRODUCTS,
  ...DEFAULT_STICKER_PRODUCTS,
  ...DEFAULT_NECK_WARMER_PRODUCTS,
  DEFAULT_PICNIC_MAT_PRODUCT,
  ...DEFAULT_ACCESSORY_PRODUCTS,
];

export const PRODUCTS = ALL_PRODUCTS;

export const CATEGORIES = ['Pins', 'Stickers', 'Neck Warmers', 'Picnic Mats', 'Accessories'];

// Reviews data
const REVIEWS_KEY = 'gowild_reviews';

const DEFAULT_REVIEWS: Review[] = [
  // Pin reviews
  { id: 'r1', productId: 'p1', productName: 'Summit Seeker Pin', userName: 'Sarah M.', date: '2026-03-15', rating: 5, text: 'Absolutely love this pin! The gold plating is gorgeous and the detail is incredible. Already got compliments on my backpack.', approved: false },
  { id: 'r2', productId: 'p1', productName: 'Summit Seeker Pin', userName: 'Jake T.', date: '2026-03-10', rating: 4, text: 'Really nice quality. The hard enamel feels premium. Would love to see a bigger size option though.', approved: false },
  { id: 'r3', productId: 'p1', productName: 'Summit Seeker Pin', userName: 'Emily R.', date: '2026-02-28', rating: 5, text: 'Best enamel pin I own. The butterfly clutch is secure and the colors are vibrant. Buying more for gifts!', approved: false },
  { id: 'r4', productId: 'p14', productName: 'Sunset Ridge Pin', userName: 'Mike H.', date: '2026-04-01', rating: 5, text: 'The sunset colors on this pin are stunning. The orange and teal combo is perfect. My favorite pin so far.', approved: false },
  { id: 'r5', productId: 'p14', productName: 'Sunset Ridge Pin', userName: 'Lisa K.', date: '2026-03-22', rating: 5, text: 'Bought 3 pins for the bundle deal. This one is my favorite. The gold plating really makes it pop.', approved: false },
  // Sticker reviews
  { id: 'r6', productId: 's1', productName: 'Mountain Vibes Sticker Pack', userName: 'Alex P.', date: '2026-04-05', rating: 5, text: '50 unique stickers and every single one is amazing quality. The waterproof vinyl held up through rain and sun on my water bottle.', approved: false },
  { id: 'r7', productId: 's1', productName: 'Mountain Vibes Sticker Pack', userName: 'Dana W.', date: '2026-03-18', rating: 5, text: 'These stickers are incredible. Put them on my car and they have not peeled at all after 2 months. Will buy again!', approved: false },
  { id: 'r8', productId: 's5', productName: 'Holographic Outdoor Sticker Pack', userName: 'Chris B.', date: '2026-04-02', rating: 5, text: 'The holographic effect is even better in person. The rainbow shimmer catches the light beautifully. Worth every penny.', approved: false },
  // Neck Warmer reviews
  { id: 'r9', productId: 'n1', productName: 'Alpine Frost Neck Warmer', userName: 'Tom R.', date: '2026-03-25', rating: 4, text: 'Kept me warm on a 5F hike. The fleece is soft and does not itch. Great for the price point.', approved: false },
  { id: 'r10', productId: 'n1', productName: 'Alpine Frost Neck Warmer', userName: 'Anna S.', date: '2026-03-12', rating: 5, text: 'Love the mountain print! Got one for myself and one as a gift. Perfect for skiing and cold morning hikes.', approved: false },
  { id: 'r11', productId: 'n8', productName: 'Merino Wool Neck Warmer', userName: 'Ryan G.', date: '2026-04-08', rating: 5, text: 'The merino wool is a game changer. No odor even after a full day of hiking. Temperature regulating is real.', approved: false },
  // Picnic Mat reviews
  { id: 'r12', productId: 'mat1', productName: 'GoWild Waterproof Picnic Mat', userName: 'Jenny L.', date: '2026-03-30', rating: 5, text: 'Used this at the beach and it was perfect. The waterproof bottom kept us dry even on wet sand. Folds up so small too!', approved: false },
  { id: 'r13', productId: 'mat1', productName: 'GoWild Waterproof Picnic Mat', userName: 'David M.', date: '2026-03-15', rating: 4, text: 'Great mat for the price. The fleece top is comfortable and the PEVA bottom works well. Wish it came in more sizes.', approved: false },
  // Accessory reviews
  { id: 'r14', productId: 'a1', productName: 'Titanium Multi-Tool Spork', userName: 'Pat K.', date: '2026-04-10', rating: 5, text: 'Only 18g and it replaces 3 utensils plus a bottle opener. Used it on a 5-day backpacking trip. Indispensable.', approved: false },
  { id: 'r15', productId: 'a2', productName: 'LED Emergency Camp Lamp', userName: 'Sam W.', date: '2026-04-01', rating: 5, text: '300 lumens is brighter than expected. The SOS mode is a nice safety touch. Battery lasted 10 hours on low.', approved: false },
  { id: 'r16', productId: 'a2', productName: 'LED Emergency Camp Lamp', userName: 'Nina J.', date: '2026-03-20', rating: 4, text: 'Solid lamp. USB-C charging is fast. Only wish it had a warmer light temperature. Otherwise perfect.', approved: false },
  { id: 'r17', productId: 'p5', productName: 'Starry Night Camper Pin', userName: 'HikerJoe', date: '2026-04-20', rating: 5, text: 'The glow in the dark feature is subtle but awesome. Great addition to my camping pin collection.', approved: false },
  { id: 'r18', productId: 'p8', productName: 'Mountain Buck Pin', userName: 'ArtLover', date: '2026-04-18', rating: 5, text: 'The antler detail is incredible. You can see the tiny mountain motifs. Best quality pin I have ever purchased.', approved: false },
];

function loadReviews(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [...DEFAULT_REVIEWS];
}

function saveReviews(reviews: Review[]) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

// Wishlist helpers
const WISHLIST_KEY = 'gowild_wishlist';
const CART_KEY = 'gowild_cart';
const PRODUCTS_KEY = 'gowild_products';
const ORDERS_KEY = 'gowild_orders';

function loadWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveWishlist(ids: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [...ALL_PRODUCTS];
}

function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [
    {
      id: 'GW-2026-8839', date: '2026-04-20',
      items: [{ product: DEFAULT_PIN_PRODUCTS[1], quantity: 3, bundlePrice: 10 }, { product: DEFAULT_STICKER_PRODUCTS[0], quantity: 1 }],
      total: 22.99, status: 'delivered',
      shippingAddress: '123 Mountain Ridge Rd, Boulder, CO 80301',
      customerName: 'Alex Walker', customerEmail: 'alex@gowild.com',
    },
    {
      id: 'GW-2026-8840', date: '2026-04-22',
      items: [{ product: DEFAULT_PICNIC_MAT_PRODUCT, quantity: 1, color: 'Red' }],
      total: 34.99, status: 'shipped',
      shippingAddress: '123 Mountain Ridge Rd, Boulder, CO 80301',
      customerName: 'Alex Walker', customerEmail: 'alex@gowild.com',
    },
    {
      id: 'GW-2026-8841', date: '2026-04-25',
      items: [{ product: DEFAULT_PIN_PRODUCTS[0], quantity: 6, bundlePrice: 20 }, { product: DEFAULT_ACCESSORY_PRODUCTS[1], quantity: 1 }],
      total: 44.99, status: 'pending',
      shippingAddress: '123 Mountain Ridge Rd, Boulder, CO 80301',
      customerName: 'Alex Walker', customerEmail: 'alex@gowild.com',
    },
  ];
}

function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  reviews: Review[];
  addToCart: (item: CartItem) => void;
  addMultipleToCart: (items: CartItem[]) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleWishlist: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  moveWishlistToCart: (productId: string) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  cancelOrder: (id: string) => void;
  refundOrder: (id: string) => void;
  addReview: (review: Omit<Review, 'id'>) => void;
  getProductReviews: (productId: string) => Review[];
  deleteReview: (id: string) => void;
  toggleReviewApproval: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  cartCount: number;
  cartTotal: number;
  cartSavings: number;
  customBundleDetails: BundleSavingsDetail[];
  wishlistCount: number;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = loadCart();
    return saved.length > 0 ? saved : [
      { product: DEFAULT_PIN_PRODUCTS[0], quantity: 2, color: 'Gold' },
      { product: DEFAULT_NECK_WARMER_PRODUCTS[0], quantity: 1, color: 'Mountain Blue', size: 'One Size' },
      { product: DEFAULT_ACCESSORY_PRODUCTS[0], quantity: 1 },
    ];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => loadWishlist());
  const [reviews, setReviews] = useState<Review[]>(() => loadReviews());
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  useEffect(() => { saveCart(cart); }, [cart]);
  useEffect(() => { saveWishlist(wishlist); }, [wishlist]);
  useEffect(() => { saveReviews(reviews); }, [reviews]);
  useEffect(() => { saveProducts(products); }, [products]);
  useEffect(() => { saveOrders(orders); }, [orders]);

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === item.product.id && i.color === item.color && i.size === item.size);
      if (existing) {
        return prev.map(i =>
          i.product.id === item.product.id && i.color === item.color && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const addMultipleToCart = useCallback((items: CartItem[]) => {
    setCart(prev => {
      const newCart = [...prev];
      items.forEach(item => {
        const existing = newCart.find(i => i.product.id === item.product.id && i.color === item.color && i.size === item.size);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          newCart.push(item);
        }
      });
      return newCart;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
    }
  }, []);

  const toggleWishlist = useCallback((productId: string): boolean => {
    let result = false;
    setWishlist(prev => {
      const exists = prev.includes(productId);
      result = !exists;
      return exists ? prev.filter(id => id !== productId) : [...prev, productId];
    });
    return result;
  }, []);

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const moveWishlistToCart = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setCart(prev => {
      const existing = prev.find(i => i.product.id === productId);
      if (existing) {
        return prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setWishlist(prev => prev.filter(id => id !== productId));
  }, [products]);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }, []);

  const cancelOrder = useCallback((id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' as const } : o));
  }, []);

  const refundOrder = useCallback((id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'refunded' as const } : o));
  }, []);

  const addReview = useCallback((review: Omit<Review, 'id'>) => {
    setReviews(prev => {
      const newReview: Review = { ...review, id: `r_${Date.now()}`, approved: false };
      return [newReview, ...prev];
    });
  }, []);

  const getProductReviews = useCallback((productId: string): Review[] => {
    return reviews.filter(r => r.productId === productId && r.approved === true);
  }, [reviews]);

  const deleteReview = useCallback((id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  }, []);

  const toggleReviewApproval = useCallback((id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: !r.approved } : r));
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      status: product.status || 'active',
    };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleProductStatus = useCallback((id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: (p.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' };
      }
      return p;
    }));
  }, []);

  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const { settings } = useSiteSettings();

  const { cartTotal, cartSavings, customBundleDetails } = useMemo(() => {
    const pinItems = cart.filter(i => i.product.isPin);
    const nonPinItems = cart.filter(i => !i.product.isPin);
    const nonPinTotal = nonPinItems.reduce((sum, i) => sum + (i.bundlePrice ?? i.product.price) * i.quantity, 0);
    const totalPinQty = pinItems.reduce((sum, i) => sum + i.quantity, 0);

    let baseTotal = nonPinTotal;
    let baseSavings = 0;

    if (totalPinQty > 0) {
      const bundleCalc = calculateBundlePrice(totalPinQty);
      baseTotal += bundleCalc.bundlePrice;
      baseSavings += bundleCalc.savings;
    }

    // Calculate custom bundle savings
    const customBundles = calculateCustomBundleSavings(cart, settings.productBundles);

    return {
      cartTotal: baseTotal - customBundles.totalSavings,
      cartSavings: baseSavings + customBundles.totalSavings,
      customBundleDetails: customBundles.details,
    };
  }, [cart, settings.productBundles]);

  const wishlistCount = wishlist.length;

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        wishlist,
        orders,
        reviews,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isInWishlist,
        moveWishlistToCart,
        clearCart,
        addOrder,
        updateOrderStatus,
        cancelOrder,
        refundOrder,
        addReview,
        getProductReviews,
        deleteReview,
        toggleReviewApproval,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        getProductById,
        cartCount,
        cartTotal,
        cartSavings,
        customBundleDetails,
        wishlistCount,
        cartDrawerOpen,
        setCartDrawerOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function calculateBundlePrice(pinCount: number): { bundlePrice: number; regularPrice: number; savings: number } {
  const regularPrice = pinCount * 4.99;
  const bundles = Math.floor(pinCount / 3);
  const remainder = pinCount % 3;
  const bundlePrice = bundles * 10 + remainder * 4.99;
  const savings = regularPrice - bundlePrice;
  return { bundlePrice, regularPrice, savings };
}

/* ------------------------------------------------------------------ */
/*  Custom Product Bundle helpers                                      */
/* ------------------------------------------------------------------ */

import type { ProductBundle } from '@/lib/settings-context';

export interface BundleSavingsDetail {
  bundleId: string;
  bundleName: string;
  savings: number;
  cartBannerText: string;
}

export function calculateCustomBundleSavings(
  cart: CartItem[],
  bundles: ProductBundle[]
): { totalSavings: number; details: BundleSavingsDetail[] } {
  const activeBundles = bundles.filter(b => b.active);
  if (activeBundles.length === 0) return { totalSavings: 0, details: [] };

  // Track which cart items have been used for bundles
  const usedItems = new Map<string, number>(); // productId -> used quantity

  const details: BundleSavingsDetail[] = [];

  for (const bundle of activeBundles) {
    // Count matching items for this bundle
    let matchingQty = 0;
    const matchingItems: { item: CartItem; available: number }[] = [];

    for (const item of cart) {
      if (bundle.productIds.includes(item.product.id)) {
        const alreadyUsed = usedItems.get(item.product.id) || 0;
        const available = item.quantity - alreadyUsed;
        if (available > 0) {
          matchingQty += available;
          matchingItems.push({ item, available });
        }
      }
    }

    if (matchingQty < bundle.quantity) continue;

    const bundleSets = Math.floor(matchingQty / bundle.quantity);
    const remainder = matchingQty % bundle.quantity;

    // Calculate regular price for matching items
    const avgPrice = matchingItems.reduce((sum, { item, available }) => sum + item.product.price * available, 0) / matchingQty;
    const regularPrice = bundleSets * bundle.quantity * avgPrice + remainder * avgPrice;
    const bundlePrice = bundleSets * bundle.price + remainder * avgPrice;
    const savings = regularPrice - bundlePrice;

    if (savings > 0) {
      details.push({
        bundleId: bundle.id,
        bundleName: bundle.name,
        savings,
        cartBannerText: bundle.cartBannerText,
      });

      // Mark items as used
      let qtyToUse = bundleSets * bundle.quantity;
      for (const { item, available } of matchingItems) {
        if (qtyToUse <= 0) break;
        const use = Math.min(available, qtyToUse);
        usedItems.set(item.product.id, (usedItems.get(item.product.id) || 0) + use);
        qtyToUse -= use;
      }
    }
  }

  return {
    totalSavings: details.reduce((sum, d) => sum + d.savings, 0),
    details,
  };
}

// Get images for a product + color
export function getProductImages(product: Product, color?: string): string[] {
  if (product.colorImages && color && product.colorImages[color]) {
    return product.colorImages[color];
  }
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  return [product.image, product.image, product.image, product.image, product.image];
}
