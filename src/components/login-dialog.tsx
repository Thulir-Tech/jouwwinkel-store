'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onContinueAsGuest: () => void;
}

export default function LoginDialog({ open, onOpenChange, onContinueAsGuest }: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">You're Shopping as a Guest</DialogTitle>
          <DialogDescription>
            For a better experience and to save your cart, please log in.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <Button asChild>
                <Link href="/login">Login or Create Account</Link>
            </Button>
            <Button variant="ghost" onClick={onContinueAsGuest}>
                Continue as Guest
            </Button>
        </div>
        <DialogFooter>
          <p className="text-xs text-muted-foreground">
            By logging in, you can access your order history and checkout faster.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
