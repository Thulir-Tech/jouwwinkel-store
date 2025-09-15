
'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image';
import type { HeroMediaConfig, UiConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getUiConfig } from '@/lib/firestore';
import { useEffect, useState } from 'react';

const HeroContent = ({ config }: { config: UiConfig | null }) => {
    const defaultTextColor = '#FFFFFF';
    const defaultMutedColor = '#E5E7EB';

    return (
        <div className="relative z-10">
            <div className="container mx-auto px-4 py-24 sm:py-32 lg:py-40 text-center">
            <div className="max-w-3xl mx-auto">
                {config?.heroText1 && (
                <p 
                    className="text-base font-semibold uppercase tracking-wider"
                    style={{ color: config.heroText1Color || defaultTextColor }}
                >
                    {config.heroText1}
                </p>
                )}
                {config?.heroText2 && (
                <h1 
                    className="mt-2 text-4xl font-extrabold font-headline tracking-tight sm:text-5xl lg:text-6xl"
                    style={{ color: config.heroText2Color || defaultTextColor }}
                >
                    {config.heroText2}
                </h1>
                )}
                {config?.heroText3 && (
                <p 
                    className="mt-6 text-lg"
                    style={{ color: config.heroText3Color || defaultMutedColor }}
                >
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
};

const DefaultHero = ({ config }: { config: UiConfig | null}) => (
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
      <Image src={url} alt="Hero background" fill className="object-cover" />
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

const MediaHero = ({ mediaConfig }: { mediaConfig: HeroMediaConfig }) => {
    if (!mediaConfig || !mediaConfig.mediaItems || mediaConfig.mediaItems.length === 0) {
        return null;
    }

    if (mediaConfig.viewType === 'carousel') {
        return (
             <div className="relative w-full h-full bg-black">
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
            <div className="relative w-full h-full bg-black">
                <MediaBackground url={mediaConfig.mediaItems[0]} fileType={mediaConfig.fileType || 'image'} />
            </div>
        )
    }

    return null;
}

export default function Hero() {
  const [config, setConfig] = useState<UiConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      const uiConfig = await getUiConfig();
      setConfig(uiConfig);
      setLoading(false);
    }
    fetchConfig();
  }, []);

  if (loading) {
    // You can return a skeleton loader here if you want
    return <div className="h-[60vh] bg-muted"></div>;
  }

  const showDesktopHero = config?.heroDesktop?.showHero ?? true;
  const showMobileHero = config?.heroMobile?.showHero ?? true;

  const desktopView = config?.heroDesktop?.viewType ?? 'default';
  const mobileView = config?.heroMobile?.viewType ?? 'default';

  const hasDesktopMedia = desktopView !== 'default' && config?.heroDesktop?.mediaItems && config.heroDesktop.mediaItems.length > 0;
  const hasMobileMedia = mobileView !== 'default' && config?.heroMobile?.mediaItems && config.heroMobile.mediaItems.length > 0;

  return (
    <div className="relative flex items-center justify-center text-foreground">
      {/* Desktop Hero */}
      <div className={cn("hidden w-full md:block", { "h-[60vh]": hasDesktopMedia })}>
        {showDesktopHero && (
          hasDesktopMedia ? (
            <div className="absolute inset-0 z-0 h-[60vh] w-full">
              <MediaHero mediaConfig={config!.heroDesktop!} />
              <HeroContent config={config} />
            </div>
          ) : (
            <DefaultHero config={config} />
          )
        )}
      </div>

      {/* Mobile Hero */}
      <div className={cn("w-full md:hidden", { "h-[80vh]": hasMobileMedia })}>
        {showMobileHero && (
           hasMobileMedia ? (
            <div className="absolute inset-0 z-0 h-[80vh] w-full">
              <MediaHero mediaConfig={config!.heroMobile!} />
              <HeroContent config={config} />
            </div>
          ) : (
            <DefaultHero config={config} />
          )
        )}
      </div>
    </div>
  );
}
