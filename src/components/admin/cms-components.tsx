import { useState, useRef } from 'react';
import { Upload, X, ChevronDown } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  ImageUploader — URL or file (base64)                               */
/* ------------------------------------------------------------------ */

export function ImageUploader({ value, onChange, label }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`text-xs px-3 py-1 rounded-full border ${mode === 'url' ? 'bg-[#1A5A6B] text-white border-[#1A5A6B]' : 'bg-white text-gray-600'}`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`text-xs px-3 py-1 rounded-full border ${mode === 'file' ? 'bg-[#1A5A6B] text-white border-[#1A5A6B]' : 'bg-white text-gray-600'}`}
        >
          Upload
        </button>
      </div>

      {mode === 'url' ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
        />
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#1A5A6B] transition-colors"
        >
          <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <span className="text-xs text-gray-500">Click to upload image</span>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      )}

      {value && (
        <div className="relative mt-2">
          <img src={value} alt="Preview" className="w-full h-24 object-cover rounded-lg border" />
          <button
            onClick={() => onChange('')}
            className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  IconPicker — dropdown of lucide icon names                         */
/* ------------------------------------------------------------------ */

const LUCIDE_ICONS = [
  'Truck', 'Shield', 'RefreshCw', 'Headphones', 'Star', 'Heart', 'Tag', 'Percent',
  'Pin', 'Package', 'Gift', 'Zap', 'Flame', 'Sparkles', 'Trophy', 'Crown',
  'Gem', 'Leaf', 'Mountain', 'TreePine', 'Compass', 'Globe', 'Users', 'Award',
  'Check', 'ChevronRight', 'ArrowRight', 'ShoppingBag', 'Camera', 'Sun', 'Moon',
  'Cloud', 'Wind', 'Droplets', 'Thermometer', 'Map', 'MapPin', 'Navigation',
  'Anchor', 'Tent', 'Campfire', 'Binoculars', 'Footprints', 'Bike', 'Car',
  'Plane', 'Train', 'Bus', 'Ticket', 'Calendar', 'Clock', 'Bell', 'Mail',
  'Phone', 'MessageCircle', 'Share2', 'Bookmark', 'ThumbsUp', 'Eye', 'Search',
];

export function IconPicker({ value, onChange, label }: { value: string; onChange: (icon: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {label && <label className="text-sm font-medium text-[#1A1A1A] block mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm bg-white hover:border-gray-400"
      >
        <span className="flex items-center gap-2">
          {value || 'Select icon'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto p-2 grid grid-cols-4 gap-1">
            {LUCIDE_ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => { onChange(icon); setOpen(false); }}
                className={`p-2 rounded text-xs text-center hover:bg-gray-100 ${value === icon ? 'bg-[#1A5A6B]/10 text-[#1A5A6B] font-medium' : ''}`}
                title={icon}
              >
                <span className="block truncate">{icon}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GradientPicker — preset gradients                                  */
/* ------------------------------------------------------------------ */

const GRADIENT_PRESETS = [
  { label: 'Teal', value: 'from-[#1A5A6B] to-[#1A8DA3]' },
  { label: 'Orange', value: 'from-[#E8552A] to-[#C4451D]' },
];

export function GradientPicker({ value, onChange }: { value: string; onChange: (gradient: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {GRADIENT_PRESETS.map(g => (
        <button
          key={g.value}
          onClick={() => onChange(g.value)}
          className={`relative h-8 rounded-lg bg-gradient-to-br ${g.value} ${value === g.value ? 'ring-2 ring-offset-2 ring-[#1A5A6B]' : ''}`}
          title={g.label}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ProductSelector — multi-select with product names                  */
/* ------------------------------------------------------------------ */

import { useStore } from '@/store';

export function ProductSelector({ selected, onChange, label }: { selected: string[]; onChange: (ids: string[]) => void; label?: string }) {
  const { products } = useStore();
  const active = products.filter(p => p.status !== 'inactive');
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="relative">
      {label && <label className="text-sm font-medium text-[#1A1A1A] block mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm bg-white hover:border-gray-400"
      >
        <span className="truncate">
          {selected.length === 0 ? 'Select products...' : `${selected.length} product${selected.length > 1 ? 's' : ''} selected`}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div className="p-2 border-b flex items-center justify-between">
              <span className="text-xs text-gray-500">{active.length} available</span>
              <button onClick={() => onChange([])} className="text-xs text-[#E85D4E] hover:underline">Clear all</button>
            </div>
            {active.map(p => (
              <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={() => toggle(p.id)}
                  className="rounded border-gray-300 text-[#1A5A6B] focus:ring-[#1A5A6B]"
                />
                <img src={p.image} alt="" className="w-8 h-8 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category}</p>
                </div>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ReviewSelector — pick approved reviews for homepage                */
/* ------------------------------------------------------------------ */

export function ReviewSelector({ selected, onChange, label }: { selected: string[]; onChange: (ids: string[]) => void; label?: string }) {
  const { reviews } = useStore();
  const approved = reviews.filter(r => r.approved !== false);
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else if (selected.length < 4) {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="relative">
      {label && <label className="text-sm font-medium text-[#1A1A1A] block mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm bg-white hover:border-gray-400"
      >
        <span className="truncate">
          {selected.length === 0 ? 'Select reviews (max 4)...' : `${selected.length} review${selected.length > 1 ? 's' : ''} selected`}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div className="p-2 border-b flex items-center justify-between">
              <span className="text-xs text-gray-500">{approved.length} approved reviews</span>
              <button onClick={() => onChange([])} className="text-xs text-[#E85D4E] hover:underline">Clear all</button>
            </div>
            {approved.length === 0 && (
              <div className="p-4 text-sm text-gray-500 text-center">No approved reviews yet.</div>
            )}
            {approved.map(r => (
              <label key={r.id} className="flex items-start gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(r.id)}
                  onChange={() => toggle(r.id)}
                  disabled={!selected.includes(r.id) && selected.length >= 4}
                  className="rounded border-gray-300 text-[#1A5A6B] focus:ring-[#1A5A6B] mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.userName} — {r.productName}</p>
                  <p className="text-xs text-gray-400 truncate">{r.text}</p>
                  <p className="text-xs text-[#E8552A]">{r.rating}/5</p>
                </div>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SortableList — reorder items with up/down arrows                   */
/* ------------------------------------------------------------------ */

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  const move = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const copy = [...items];
    const [removed] = copy.splice(index, 1);
    copy.splice(newIndex, 0, removed);
    onReorder(copy);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex flex-col gap-0.5">
            <button onClick={() => move(i, -1)} disabled={i === 0} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30">
              <ChevronDown className="w-3 h-3 rotate-180" />
            </button>
            <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30">
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1">{renderItem(item, i)}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionCard — admin section wrapper                                */
/* ------------------------------------------------------------------ */

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <h4 className="font-heading font-semibold text-[#1A1A1A]">{title}</h4>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ToggleSwitch                                                        */
/* ------------------------------------------------------------------ */

export function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-[#1A5A6B]' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
      {label && <span className="text-sm text-[#1A1A1A]">{label}</span>}
    </label>
  );
}
