
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addReview } from '@/lib/firestore.admin';
import { useAuth } from '@/hooks/use-auth';
import { Star } from 'lucide-react';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productTitle: string;
  userId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewDialog({
  open,
  onOpenChange,
  productId,
  productTitle,
  userId,
  onReviewSubmitted,
}: ReviewDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: 'Please select a rating', variant: 'destructive' });
      return;
    }
    if (!comment) {
      toast({ title: 'Please write a comment', variant: 'destructive' });
      return;
    }
    if (!user) {
        toast({ title: 'You must be logged in to submit a review.', variant: 'destructive' });
        return;
    }

    setLoading(true);
    try {
      await addReview({
        userId,
        userName: user.displayName || 'Anonymous',
        productId,
        productTitle,
        rating,
        comment,
      });
      toast({ title: 'Review submitted successfully!', description: 'Thank you for your feedback.' });
      onReviewSubmitted();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to submit review', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a review for {productTitle}</DialogTitle>
          <DialogDescription>
            Share your thoughts with other customers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>Your Rating</Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    (hoverRating || rating) >= star
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike?"
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
