import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type Product, CATEGORIES } from '@/store';
import { ImageUploader } from './cms-components';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (product: Partial<Product>) => void;
}

const BADGE_OPTIONS = ['', 'Best Seller', 'Popular', 'New', 'Sale', 'Limited Edition', 'Official', 'Premium', 'Warmest', 'Ultralight'];

const EMPTY_PRODUCT: Partial<Product> = {
  name: '',
  category: 'Pins',
  price: 0,
  originalPrice: undefined,
  image: '',
  description: '',
  stock: 0,
  rating: 4.5,
  reviewCount: 0,
  badge: '',
  isPin: false,
  isBundle: false,
  bundleSize: undefined,
  status: 'active',
  colors: [],
  sizes: [],
  specs: [],
};

export function ProductFormDialog({ open, onOpenChange, product, onSave }: ProductFormDialogProps) {
  const isEditing = !!product;
  const [form, setForm] = useState<Partial<Product>>(EMPTY_PRODUCT);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name?.trim()) next.name = 'Product name is required';
    if (form.price === undefined || form.price <= 0) next.price = 'Price must be greater than 0';
    if (form.stock === undefined || form.stock < 0) next.stock = 'Stock cannot be negative';
    if (!form.image?.trim()) next.image = 'Product image is required';
    if (!form.description?.trim()) next.description = 'Description is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  useEffect(() => {
    if (product) {
      setForm({ ...product });
    } else {
      setForm(EMPTY_PRODUCT);
    }
    setErrors({});
  }, [product, open]);

  const updateField = <K extends keyof Product>(field: K, value: Product[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
    onOpenChange(false);
    setForm(EMPTY_PRODUCT);
    setErrors({});
  };

  const addColor = () => {
    if (!colorInput.trim()) return;
    setForm(prev => ({ ...prev, colors: [...(prev.colors || []), colorInput.trim()] }));
    setColorInput('');
  };

  const removeColor = (idx: number) => {
    setForm(prev => ({ ...prev, colors: prev.colors?.filter((_, i) => i !== idx) }));
  };

  const addSize = () => {
    if (!sizeInput.trim()) return;
    setForm(prev => ({ ...prev, sizes: [...(prev.sizes || []), sizeInput.trim()] }));
    setSizeInput('');
  };

  const removeSize = (idx: number) => {
    setForm(prev => ({ ...prev, sizes: prev.sizes?.filter((_, i) => i !== idx) }));
  };

  const addSpec = () => {
    setForm(prev => ({ ...prev, specs: [...(prev.specs || []), { label: '', value: '' }] }));
  };

  const updateSpec = (idx: number, field: 'label' | 'value', value: string) => {
    setForm(prev => ({
      ...prev,
      specs: prev.specs?.map((s, i) => i === idx ? { ...s, [field]: value } : s),
    }));
  };

  const removeSpec = (idx: number) => {
    setForm(prev => ({ ...prev, specs: prev.specs?.filter((_, i) => i !== idx) }));
  };

  const isPin = form.isPin || false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">Product Name *</label>
              <input
                type="text"
                value={form.name || ''}
                onChange={e => { updateField('name', e.target.value); if (errors.name) setErrors(prev => { const n = { ...prev }; delete n.name; return n; }); }}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Summit Seeker Pin"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Category *</label>
              <select
                value={form.category || 'Pins'}
                onChange={e => updateField('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price || ''}
                onChange={e => { updateField('price', parseFloat(e.target.value)); if (errors.price) setErrors(prev => { const n = { ...prev }; delete n.price; return n; }); }}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors.price ? 'border-red-500' : ''}`}
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Original Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.originalPrice || ''}
                onChange={e => updateField('originalPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Stock *</label>
              <input
                type="number"
                min="0"
                value={form.stock || ''}
                onChange={e => { updateField('stock', parseInt(e.target.value)); if (errors.stock) setErrors(prev => { const n = { ...prev }; delete n.stock; return n; }); }}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors.stock ? 'border-red-500' : ''}`}
              />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
            </div>

            <div className="sm:col-span-2">
              <ImageUploader
                label="Product Image *"
                value={form.image || ''}
                onChange={v => { updateField('image', v); if (errors.image) setErrors(prev => { const n = { ...prev }; delete n.image; return n; }); }}
              />
              {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">Description *</label>
              <textarea
                value={form.description || ''}
                onChange={e => { updateField('description', e.target.value); if (errors.description) setErrors(prev => { const n = { ...prev }; delete n.description; return n; }); }}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Product description..."
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Badge</label>
              <select
                value={form.badge || ''}
                onChange={e => updateField('badge', e.target.value || undefined)}
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
              >
                {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPin || false}
                  onChange={e => {
                    const checked = e.target.checked;
                    updateField('isPin', checked);
                    if (checked) {
                      updateField('colors', []);
                      updateField('sizes', []);
                    }
                  }}
                  className="rounded border-gray-300"
                />
                Is Pin
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isBundle || false}
                  onChange={e => updateField('isBundle', e.target.checked)}
                  className="rounded border-gray-300"
                />
                Is Bundle
              </label>
            </div>
          </div>

          {/* Colors — hidden for pins */}
          {!isPin && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Colors</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={colorInput}
                  onChange={e => setColorInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  className="flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                  placeholder="Add a color..."
                />
                <Button type="button" variant="outline" size="sm" onClick={addColor}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.colors?.map((color, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1A5A6B]/10 text-[#1A5A6B] text-xs rounded-full">
                    {color}
                    <button type="button" onClick={() => removeColor(i)} className="hover:text-[#E85D4E]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sizes — hidden for pins */}
          {!isPin && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Sizes</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={e => setSizeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  className="flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                  placeholder="Add a size..."
                />
                <Button type="button" variant="outline" size="sm" onClick={addSize}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.sizes?.map((size, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {size}
                    <button type="button" onClick={() => removeSize(i)} className="hover:text-[#E85D4E]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Specifications</label>
              <Button type="button" variant="outline" size="sm" onClick={addSpec}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {form.specs?.map((spec, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={spec.label}
                    onChange={e => updateSpec(i, 'label', e.target.value)}
                    placeholder="Label"
                    className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={e => updateSpec(i, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                  />
                  <button type="button" onClick={() => removeSpec(i)} className="p-2 text-gray-400 hover:text-[#E85D4E]">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1A5A6B] hover:bg-[#1A8DA3] text-white">
              {isEditing ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
