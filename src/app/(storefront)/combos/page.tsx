
'use client';

import { useState, useEffect } from 'react';
import { getActiveCombos } from '@/lib/firestore';
import type { Combo } from '@/lib/types';
import ComboCard from '@/components/combo-card';
import { Skeleton } from '@/components/ui/skeleton';

function ComboGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-[200px] sm:h-[300px] w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const combosData = await getActiveCombos();
        setCombos(combosData);
      } catch (error) {
        console.error("Failed to fetch combos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4 font-headline">Product Combos</h1>
      <p className="text-center text-muted-foreground mb-8">
        Get the best value with our specially curated product bundles.
      </p>

      {loading ? (
        <ComboGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 justify-center gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {combos.map(combo => (
            <ComboCard key={combo.id} combo={combo} />
          ))}
        </div>
      )}
      {!loading && combos.length === 0 && (
        <p className="text-center text-muted-foreground col-span-full mt-8">No combos available at the moment.</p>
      )}
    </div>
  );
}
