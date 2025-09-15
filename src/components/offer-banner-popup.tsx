
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import type { UiConfig } from '@/lib/types';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import Link from 'next/link';

interface OfferBannerPopupProps {
  config?: UiConfig['offerBanner'];
}

export default function OfferBannerPopup({ config }: OfferBannerPopupProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (config?.enabled && config?.banners && config.banners.length > 0) {
      const hasSeenBanner = sessionStorage.getItem('hasSeenOfferBanner');
      if (!hasSeenBanner) {
        setOpen(true);
        sessionStorage.setItem('hasSeenOfferBanner', 'true');
      }
    }
  }, [config]);

  if (!config?.enabled || !config.banners || config.banners.length === 0) {
    return null;
  }

  const isCarousel = config.banners.length > 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 border-0 max-w-md bg-transparent shadow-none">
        <DialogTitle className="sr-only">Special Offer</DialogTitle>
        <div className="relative">
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-20"
                onClick={() => setOpen(false)}
                aria-label="Close offer banner"
                >
                <X className="h-4 w-4" />
            </Button>

            {isCarousel ? (
                <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 3000 })]} className="overflow-hidden rounded-lg">
                <CarouselContent>
                    {config.banners.map((banner, index) => (
                    <CarouselItem key={index}>
                        <div className="flex flex-col items-center bg-card rounded-lg overflow-hidden">
                            <Image
                                src={banner.imageUrl}
                                alt={`Offer Banner ${index + 1}`}
                                width={500}
                                height={500}
                                className="w-full h-auto aspect-square object-cover"
                            />
                            <div className="p-4 w-full">
                                <Button asChild className="w-full">
                                    <Link href={banner.link} onClick={() => setOpen(false)}>Shop Now</Link>
                                </Button>
                            </div>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                </Carousel>
            ) : (
                <div className="flex flex-col items-center bg-card rounded-lg overflow-hidden">
                    <Image
                        src={config.banners[0].imageUrl}
                        alt="Offer Banner"
                        width={500}
                        height={500}
                        className="w-full h-auto aspect-square object-cover"
                    />
                    <div className="p-4 w-full">
                        <Button asChild className="w-full">
                            <Link href={config.banners[0].link} onClick={() => setOpen(false)}>Shop Now</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
