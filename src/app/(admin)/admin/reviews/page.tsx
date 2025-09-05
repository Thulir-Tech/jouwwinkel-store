
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getReviews, updateReview } from '@/lib/firestore.admin';
import type { Review } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

function ReviewsPageSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await getReviews();
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const handleApprovalChange = async (reviewId: string, approved: boolean) => {
    try {
      await updateReview(reviewId, { approved });
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, approved } : r))
      );
      toast({
        title: `Review ${approved ? 'approved' : 'unapproved'}`,
      });
    } catch (error) {
      toast({
        title: 'Error updating review status',
        variant: 'destructive',
      });
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(
      (review) =>
        review.productTitle.toLowerCase().includes(filter.toLowerCase()) ||
        review.userName.toLowerCase().includes(filter.toLowerCase()) ||
        review.comment.toLowerCase().includes(filter.toLowerCase())
    );
  }, [reviews, filter]);

  if (loading) {
    return <ReviewsPageSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Reviews</CardTitle>
        <CardDescription>
          Manage and approve customer reviews for your products.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input
            placeholder="Filter by product, user, or comment..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="text-right">Approved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">
                  {review.productTitle}
                </TableCell>
                <TableCell>{review.userName}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-sm truncate">
                  {review.comment}
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={review.approved}
                    onCheckedChange={(checked) =>
                      handleApprovalChange(review.id, checked)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredReviews.length === 0 && (
          <div className="text-center text-muted-foreground p-8">
            No reviews found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
