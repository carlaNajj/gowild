import {
  Truck, Shield, RefreshCw, Headphones, Star, Heart, Tag, Percent,
  Pin, Package, Gift, Zap, Flame, Sparkles, Trophy, Crown,
  Gem, Leaf, Mountain, TreePine, Compass, Globe, Users, Award,
  Check, ChevronRight, ArrowRight, ShoppingBag, Camera, Sun, Moon,
  Cloud, Wind, Droplets, Thermometer, Map, MapPin, Navigation,
  Anchor, Tent, Binoculars, Footprints, Bike, Car,
  Plane, Train, Bus, Ticket, Calendar, Clock, Bell, Mail,
  Phone, MessageCircle, Share2, Bookmark, ThumbsUp, Eye, Search,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck, Shield, RefreshCw, Headphones, Star, Heart, Tag, Percent,
  Pin, Package, Gift, Zap, Flame, Sparkles, Trophy, Crown,
  Gem, Leaf, Mountain, TreePine, Compass, Globe, Users, Award,
  Check, ChevronRight, ArrowRight, ShoppingBag, Camera, Sun, Moon,
  Cloud, Wind, Droplets, Thermometer, Map, MapPin, Navigation,
  Anchor, Tent, Binoculars, Footprints, Bike, Car,
  Plane, Train, Bus, Ticket, Calendar, Clock, Bell, Mail,
  Phone, MessageCircle, Share2, Bookmark, ThumbsUp, Eye, Search,
};

export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
