import { useState } from 'react';
import { useSiteSettings, type ProductBundle } from '@/lib/settings-context';
import { useStore } from '@/store';
import { SectionCard } from './cms-components';
import { Plus, Pencil, Trash2, X, Check, Package, Tag } from 'lucide-react';
import { toast } from 'sonner';

function TextField({ label, value, onChange, textarea, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; type?: string }) {
  const props = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: 'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30',
  };
  return (
    <div>
      <label className="text-sm font-medium text-[#1A1A1A] block mb-1">{label}</label>
      {textarea ? <textarea {...props} rows={3} /> : <input {...props} type={type} />}
    </div>
  );
}

const EMPTY_BUNDLE: Omit<ProductBundle, 'id'> = {
  name: '',
  productIds: [],
  quantity: 2,
  price: 0,
  active: true,
  bannerText: '',
  cartBannerText: '',
};

export function BundlesEditor() {
  const { settings, updateSettings } = useSiteSettings();
  const { products } = useStore();
  const activeProducts = products.filter(p => p.status !== 'inactive');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ProductBundle, 'id'>>(EMPTY_BUNDLE);
  const [isCreating, setIsCreating] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  const startEdit = (item: ProductBundle) => {
    setForm({ ...item });
    setEditingId(item.id);
    setIsCreating(false);
  };

  const startCreate = () => {
    setForm(EMPTY_BUNDLE);
    setEditingId(null);
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setForm(EMPTY_BUNDLE);
    setProductPickerOpen(false);
  };

  const saveBundle = () => {
    if (!form.name.trim()) {
      toast.error('Bundle name is required');
      return;
    }
    if (form.productIds.length === 0) {
      toast.error('Select at least one product');
      return;
    }
    if (form.quantity < 2) {
      toast.error('Quantity must be at least 2');
      return;
    }
    if (form.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    if (isCreating) {
      const newBundle: ProductBundle = {
        ...form,
        id: `pb-${Date.now()}`,
      };
      updateSettings({ productBundles: [...settings.productBundles, newBundle] });
      toast.success('Bundle created');
    } else if (editingId) {
      updateSettings({
        productBundles: settings.productBundles.map(b =>
          b.id === editingId ? { ...b, ...form } : b
        ),
      });
      toast.success('Bundle updated');
    }
    cancelEdit();
  };

  const deleteBundle = (id: string) => {
    updateSettings({ productBundles: settings.productBundles.filter(b => b.id !== id) });
    toast.success('Bundle deleted');
  };

  const toggleActive = (id: string) => {
    updateSettings({
      productBundles: settings.productBundles.map(b =>
        b.id === id ? { ...b, active: !b.active } : b
      ),
    });
  };

  const toggleProduct = (productId: string) => {
    setForm(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-[#1A5A6B]/10 rounded-xl p-4 border border-[#1A5A6B]/20 flex items-start gap-3">
        <Package className="w-5 h-5 text-[#1A5A6B] flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-heading font-semibold text-[#1A1A1A] text-sm">Product Bundles</h3>
          <p className="text-xs text-[#6B7280] mt-1">
            Create bundle deals for specific products. When a customer adds enough qualifying items to their cart,
            the bundle price is automatically applied. Each bundle appears as a banner on the qualifying product pages.
          </p>
        </div>
      </div>

      {/* Create / Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-semibold text-[#1A1A1A]">
              {isCreating ? 'Create Bundle' : 'Edit Bundle'}
            </h4>
            <button onClick={cancelEdit} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Bundle Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <div>
              <label className="text-sm font-medium text-[#1A1A1A] block mb-1">Status</label>
              <button
                onClick={() => setForm({ ...form, active: !form.active })}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.active
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {form.active ? 'Active' : 'Inactive'}
              </button>
            </div>
            <TextField label="Quantity Needed *" value={String(form.quantity)} onChange={v => setForm({ ...form, quantity: Math.max(1, parseInt(v) || 1) })} type="number" />
            <TextField label="Bundle Price *" value={String(form.price)} onChange={v => setForm({ ...form, price: Math.max(0, parseFloat(v) || 0) })} type="number" />
          </div>

          {/* Product Selector */}
          <div className="relative">
            <label className="text-sm font-medium text-[#1A1A1A] block mb-1">Products *</label>
            <button
              type="button"
              onClick={() => setProductPickerOpen(!productPickerOpen)}
              className="w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm bg-white hover:border-gray-400"
            >
              <span className="truncate">
                {form.productIds.length === 0 ? 'Select products...' : `${form.productIds.length} product${form.productIds.length > 1 ? 's' : ''} selected`}
              </span>
              <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>
            {productPickerOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProductPickerOpen(false)} />
                <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <div className="p-2 border-b flex items-center justify-between">
                    <span className="text-xs text-gray-500">{activeProducts.length} available</span>
                    <button onClick={() => setForm({ ...form, productIds: [] })} className="text-xs text-[#E85D4E] hover:underline">Clear all</button>
                  </div>
                  {activeProducts.map(p => (
                    <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.productIds.includes(p.id)}
                        onChange={() => toggleProduct(p.id)}
                        className="rounded border-gray-300 text-[#1A5A6B] focus:ring-[#1A5A6B]"
                      />
                      <img src={p.image} alt="" className="w-8 h-8 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category} · {formatPrice(p.price)}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <TextField label="Product Page Banner Text" value={form.bannerText} onChange={v => setForm({ ...form, bannerText: v })} textarea />
          <TextField label="Cart Banner Text" value={form.cartBannerText} onChange={v => setForm({ ...form, cartBannerText: v })} textarea />
          <p className="text-xs text-[#6B7280]">Use {'{savings}'} in cart banner text to show the saved amount.</p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveBundle}
              className="px-4 py-2 bg-[#1A5A6B] text-white rounded-lg text-sm font-medium hover:bg-[#1A8DA3] transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Save
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {settings.productBundles.length === 0 && !isCreating && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No bundles yet. Create your first product bundle.</p>
          </div>
        )}

        {settings.productBundles.map(bundle => {
          const isEditing = editingId === bundle.id;
          if (isEditing) return null;

          const bundleProducts = activeProducts.filter(p => bundle.productIds.includes(p.id));
          const regularTotal = bundleProducts.reduce((sum, p) => sum + p.price, 0) * (bundle.quantity / Math.max(1, bundleProducts.length));
          const savings = Math.max(0, regularTotal - bundle.price);

          return (
            <SectionCard key={bundle.id} title={bundle.name}>
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bundle.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {bundle.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      {bundle.quantity} for {formatPrice(bundle.price)}
                    </span>
                    {savings > 0 && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#E8552A]/10 text-[#E8552A]">
                        Save {formatPrice(savings)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {bundleProducts.map(p => (
                      <span key={p.id} className="inline-flex items-center gap-1.5 text-xs bg-gray-100 px-2 py-1 rounded-full">
                        <img src={p.image} alt="" className="w-4 h-4 object-cover rounded" />
                        {p.name}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#6B7280]">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="font-medium text-[#1A1A1A]">Product Banner:</span> {bundle.bannerText || '-'}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="font-medium text-[#1A1A1A]">Cart Banner:</span> {bundle.cartBannerText || '-'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(bundle)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-[#1A5A6B]"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(bundle.id)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 ${bundle.active ? 'text-green-600' : 'text-gray-400'}`}
                    title={bundle.active ? 'Deactivate' : 'Activate'}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBundle(bundle.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#E85D4E]"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>

      {/* Add Button */}
      {!isCreating && !editingId && (
        <button
          onClick={startCreate}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Bundle
        </button>
      )}
    </div>
  );
}
