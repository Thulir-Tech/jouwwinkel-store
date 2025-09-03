
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileForm } from './profile-form';

function ProfilePageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-10 w-1/4" />
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    )
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="container mx-auto px-4 py-12">
            <ProfilePageSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8 font-headline">My Profile</h1>
      <div className="max-w-2xl mx-auto">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
