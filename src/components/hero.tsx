
import Link from 'next/link';
import { Button } from './ui/button';
import { getUiConfig } from '@/lib/firestore';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image';
import type { HeroMediaConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

const HeroContent = ({ config }: { config: Awaited<ReturnType<typeof getUiConfig>> }) => (
  <div className="relative z-10">
    <div className="container mx-auto px-4 py-24 sm:py-32 lg:py-40 text-center">
      <div className="max-w-3xl mx-auto">
        {config?.heroText1 && (
          <p className="text-base font-semibold uppercase tracking-wider text-white">
            {config.heroText1}
          </p>
        )}
        {config?.heroText2 && (
          <h1 className="mt-2 text-4xl font-extrabold font-headline tracking-tight text-white sm:text-5xl lg:text-6xl">
            {config.heroText2}
          </h1>
        )}
        {config?.heroText3 && (
          <p className="mt-6 text-lg text-gray-200">
            {config.heroText3}
          </p>
        )}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-primary/90 text-primary-foreground hover:bg-primary">
            <Link href="/products">Shop All</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-background/20 border-white text-white backdrop-blur-sm hover:bg-background/30">
            <Link href="/combos">View Combos</Link>
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const DefaultHero = ({ config }: { config: Awaited<ReturnType<typeof getUiConfig>>}) => (
  <div className="relative bg-gradient-to-r from-stone-100 to-rose-50 dark:from-stone-900 dark:to-rose-950">
     <div className="container mx-auto px-4 py-16 sm:py-20 text-center">
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
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
             <div className={cn("relative w-full h-full bg-black", className)}>
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
            <div className={cn("relative w-full h-full bg-black", className)}>
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
    <div className={cn(
        "relative w-full flex items-center justify-center",
        hasMobileMedia ? "aspect-square" : "",
        hasDesktopMedia ? "md:aspect-video" : ""
    )}>
        <div className="absolute inset-0 z-0">
            {/* Desktop Hero */}
            <div className="hidden md:block w-full h-full">
                {hasDesktopMedia ? (
                    <MediaHero mediaConfig={config!.heroDesktop!} className="w-full h-full" />
                ) : (
                    <DefaultHero config={config}/>
                )}
            </div>
            {/* Mobile Hero */}
            <div className="block md:hidden w-full h-full">
                {hasMobileMedia ? (
                    <MediaHero mediaConfig={config!.heroMobile!} className="w-full h-full" />
                ) : (
                    <DefaultHero config={config}/>
                )}
            </div>
        </div>

        {/* Content Overlay */}
        <div className="hidden md:block w-full h-full">
            {hasDesktopMedia && <HeroContent config={config} />}
        </div>
         <div className="block md:hidden w-full h-full">
            {hasMobileMedia && <HeroContent config={config} />}
        </div>
    </div>
  )
}
