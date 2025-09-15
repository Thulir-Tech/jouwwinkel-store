import type { Combo } from '@/lib/types';
import ComboCard from './combo-card';

interface ComboGridProps {
  combos: Combo[];
}

export default function ComboGrid({ combos }: ComboGridProps) {
  if (!combos || combos.length === 0) {
    return <p className="text-center text-muted-foreground">No combos to display.</p>;
  }

  return (
    <div className="grid grid-cols-2 justify-center gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
      {combos.map(combo => (
        <ComboCard key={combo.id} combo={combo} />
      ))}
    </div>
  );
}
