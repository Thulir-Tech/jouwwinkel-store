import Link from 'next/link';
import { Button } from './ui/button';
import { getUiConfig } from '@/lib/firestore';

export default async function Hero() {
  const config = await getUiConfig();
  return (
    <div className="relative bg-gradient-to-r from-stone-100 to-rose-50 dark:from-stone-900 dark:to-rose-950">
      <div className="container mx-auto px-4 py-24 sm:py-32 lg:py-40 text-center">
        <div className="max-w-3xl mx-auto">
          {config?.heroText1 && (
            <p className="text-base font-semibold uppercase tracking-wider text-primary">
              {config.heroText1}
            </p>
          )}
          {config?.heroText2 && (
            <h1 className="mt-2 text-4xl font-extrabold font-headline tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
              {config.heroText2}
            </h1>
          )}
          {config?.heroText3 && (
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
              {config.heroText3}
            </p>
          )}
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
