import { useState } from 'react';
import { useStore, type Review } from '@/store';
import { SectionCard } from './cms-components';
import { Star, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function ReviewsEditor() {
  const { reviews, deleteReview, toggleReviewApproval, products } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [search, setSearch] = useState('');

  const filtered = reviews.filter(r => {
    const matchesSearch =
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.text.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'pending' ? r.approved === false :
      r.approved === true;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = reviews.filter(r => r.approved === false).length;
  const approvedCount = reviews.filter(r => r.approved === true).length;

  const handleDelete = (review: Review) => {
    deleteReview(review.id);
    toast.success('Review deleted');
  };

  const handleApprove = (review: Review) => {
    toggleReviewApproval(review.id);
    toast.success('Review approved');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionCard title={`Customer Reviews (${reviews.length})`}>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
          />
          <div className="flex gap-2">
            {(['all', 'pending', 'approved'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-[#1A5A6B] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
                {f === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 bg-[#E8552A] text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                )}
                {f === 'approved' && approvedCount > 0 && (
                  <span className="ml-1.5 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{approvedCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              {filter === 'pending' ? 'No pending reviews. All reviews have been handled.' : 'No reviews found.'}
            </p>
          )}
          {filtered.map(review => {
            const product = products.find(p => p.id === review.productId);
            const isPending = review.approved === false;
            return (
              <div
                key={review.id}
                className={`p-4 rounded-lg border transition-colors ${
                  isPending ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {product && (
                      <img src={product.image} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">{review.userName}</p>
                      <p className="text-xs text-gray-500">{review.productName} · {review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-[#1A1A1A] mt-3">{review.text}</p>

                {review.photo && (
                  <img src={review.photo} alt="Review" className="mt-3 w-24 h-24 object-cover rounded-lg border" />
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/60">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isPending ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {isPending ? 'Pending Approval' : 'Approved'}
                  </span>
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        onClick={() => handleApprove(review)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-[#E85D4E] hover:bg-red-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
