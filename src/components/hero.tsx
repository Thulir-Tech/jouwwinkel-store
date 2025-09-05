
import Link from 'next/link';
import { Button } from './ui/button';
import { getUiConfig } from '@/lib/firestore';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image';
import type { HeroMediaConfig } from '@/lib/types';

const HeroContent = ({ config }: { config: Awaited<ReturnType<typeof getUiConfig>> }) => (
  <div className="relative z-10">
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
            <Link href="/combos">View Combos</Link>
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const DefaultHero = ({ config }: { config: Awaited<ReturnType<typeof getUiConfig>> }) => (
  <div className="relative bg-gradient-to-r from-stone-100 to-rose-50 dark:from-stone-900 dark:to-rose-950">
    <HeroContent config={config} />
  </div>
);

const MediaBackground = ({ url, fileType }: { url: string; fileType: 'image' | 'video' }) => (
  <>
    {fileType === 'image' ? (
      <Image src={url} alt="Hero background" fill className="object-cover" priority />
    ) : (
      <video
        src={url}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    )}
    <div className="absolute inset-0 bg-black/30" />
  </>
);

const MediaHero = ({ mediaConfig, className }: { mediaConfig: HeroMediaConfig, className?: string }) => {
    if (!mediaConfig || !mediaConfig.mediaItems || mediaConfig.mediaItems.length === 0) {
        return null;
    }

    if (mediaConfig.viewType === 'carousel') {
        return (
             <div className={`relative w-full h-[60vh] bg-black ${className}`}>
                <Carousel
                    opts={{ loop: true }}
                    plugins={[Autoplay({ delay: 5000 })]}
                    className="h-full"
                >
                    <CarouselContent className="h-full">
                        {mediaConfig.mediaItems.map((url, index) => (
                            <CarouselItem key={index} className="h-full">
                               <MediaBackground url={url} fileType={mediaConfig.fileType || 'image'} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        )
    }

    if (mediaConfig.viewType === 'static') {
        return (
            <div className={`relative w-full h-[60vh] bg-black ${className}`}>
                <MediaBackground url={mediaConfig.mediaItems[0]} fileType={mediaConfig.fileType || 'image'} />
            </div>
        )
    }

    return null;
}

export default async function Hero() {
  const config = await getUiConfig();

  const hasDesktopMedia = config?.heroDesktop?.viewType !== 'default' && config?.heroDesktop?.mediaItems && config.heroDesktop.mediaItems.length > 0;
  const hasMobileMedia = config?.heroMobile?.viewType !== 'default' && config?.heroMobile?.mediaItems && config.heroMobile.mediaItems.length > 0;

  if (!hasDesktopMedia && !hasMobileMedia) {
    return <DefaultHero config={config} />;
  }

  return (
    <div className="relative text-white">
        <div className="absolute inset-0 z-0">
             {hasDesktopMedia && <MediaHero mediaConfig={config!.heroDesktop!} className="hidden md:block" />}
             {hasMobileMedia && <MediaHero mediaConfig={config!.heroMobile!} className="block md:hidden" />}
             {!hasDesktopMedia && hasMobileMedia && <MediaHero mediaConfig={config!.heroMobile!} className="hidden md:block" />}
             {!hasMobileMedia && hasDesktopMedia && <MediaHero mediaConfig={config!.heroDesktop!} className="block md:hidden" />}
        </div>
        <HeroContent config={config} />
    </div>
  )
}
