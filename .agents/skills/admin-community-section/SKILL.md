---
name: admin-community-section
description: Reference for the GoWild admin panel Community section covering Customer Reviews moderation. Use when working on review approval workflows, review deletion, or review-related admin functionality.
---

# Admin Community Section

The Community section contains a single tab for moderating customer product reviews.

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/AdminPage.tsx` | Host page; renders `ReviewsEditor` when `activeTab === 'reviews'` |
| `src/components/admin/ReviewsEditor.tsx` | Review moderation UI |
| `src/store.tsx` | Defines `Review` type and actions: `reviews`, `deleteReview`, `toggleReviewApproval` |

## Reviews Tab (`activeTab === 'reviews'`)

**Component**: `ReviewsEditor`

- **Data source**: `useStore()` → `reviews`, `deleteReview`, `toggleReviewApproval`, `products`
- **Search**: Filters by reviewer name, product name, or review text
- **Filter tabs**: `all` | `pending` | `approved`
  - Shows count badges for pending and approved
- **Review card display**:
  - Product thumbnail (if found in products list)
  - Reviewer name, product name, date
  - Star rating (1-5)
  - Review text
  - Review photo (if uploaded)
  - Status badge: "Pending Approval" (amber) or "Approved" (green)
- **Actions**:
  - **Approve** → `toggleReviewApproval(review.id)` (only shown for pending reviews)
  - **Reject/Delete** → `deleteReview(review.id)` (shown for all reviews)
- **Empty states**: Custom message for "No pending reviews" vs "No reviews found"

### Review Type (from `src/store.tsx`)

```ts
interface Review {
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
```

## Review Approval Flow

1. Customer submits review on product page
2. Review is saved with `approved: false` (pending)
3. Admin sees it in Reviews tab under "pending" filter
4. Admin clicks **Approve** → `toggleReviewApproval(id)` sets `approved: true`
5. Approved reviews appear on product pages and can be featured on homepage

## Related: Featured Reviews

The homepage can display up to 4 approved reviews. Review selection is managed in the **Content → Homepage** tab via `ReviewSelector` component. Only approved reviews are selectable.

## Notes

- Reviews are stored in `useStore()` and persisted to `localStorage`
- The `products` array is used to lookup product thumbnails by `productId`
- Pending reviews have amber styling (`bg-amber-50 border-amber-200`)
- Approved reviews have gray styling (`bg-gray-50 border-gray-100`)
