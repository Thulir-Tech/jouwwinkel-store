
'use client';

import { MoreHorizontal, ShoppingCart, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CustomerActionsProps {
  user: User;
}

export function CustomerActions({ user }: CustomerActionsProps) {
    const { toast } = useToast();

    const handleContact = () => {
        if (!user.mobile) {
            toast({ title: "No mobile number available for this user.", variant: "destructive"});
            return;
        }
        // Basic phone number cleaning, assuming it might have spaces or symbols
        const phoneNumber = user.mobile.replace(/\D/g, '');
        // Assuming Indian country code if not present
        const fullPhoneNumber = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
        window.open(`https://wa.me/${fullPhoneNumber}`, '_blank');
    }

    return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/admin/orders?customer=${encodeURIComponent(user.displayName || user.email || '')}`}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Orders
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem onClick={handleContact} disabled={!user.mobile}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact (WhatsApp)
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
}
