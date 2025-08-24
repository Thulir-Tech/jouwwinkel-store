import Link from 'next/link';
import { Button } from './ui/button';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-stone-100 to-rose-50 dark:from-stone-900 dark:to-rose-950">
      <div className="container mx-auto px-4 py-24 sm:py-32 lg:py-40 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-base font-semibold uppercase tracking-wider text-primary">
            Make Your Own
          </p>
          <h1 className="mt-2 text-4xl font-extrabold font-headline tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
            Elevate your style
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
            Discover a world of elegance and craftsmanship. Find the perfect pieces to express your unique identity.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/products">Shop All</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/products?tag=combo">View Combos</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
