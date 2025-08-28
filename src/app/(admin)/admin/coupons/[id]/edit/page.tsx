
import { getCoupon } from '@/lib/firestore';
import { CouponForm } from '../../coupon-form';
import { notFound } from 'next/navigation';

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const coupon = await getCoupon(params.id);

  if (!coupon) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Coupon</h1>
      <CouponForm coupon={coupon} />
    </div>
  );
}
